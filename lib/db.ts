import { sql } from '@vercel/postgres'
import type { Restaurant, RestaurantGenre, Hotel, HotelCategory, Spot, SpotGenre, Plan } from './types'

// ========== shared helpers ==========

type Row = Record<string, unknown>

function asString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : v == null ? fallback : String(v)
}
function asNumber(v: unknown, fallback = 0): number {
  if (typeof v === 'number') return v
  if (typeof v === 'string' && v !== '') {
    const n = Number(v)
    return Number.isFinite(n) ? n : fallback
  }
  return fallback
}
function asNumberOrNull(v: unknown): number | null {
  if (v == null || v === '') return null
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : null
}
function asStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x) => typeof x === 'string') as string[]
  return []
}
function asDate(v: unknown): string {
  if (!v) return ''
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  return asString(v).slice(0, 10)
}
function asISO(v: unknown): string {
  if (!v) return ''
  if (v instanceof Date) return v.toISOString()
  return asString(v)
}
function asBool(v: unknown): boolean {
  return v === true || v === 'true' || v === 't' || v === 1 || v === '1'
}

/**
 * Encode a JS string array as a PostgreSQL array literal string.
 * Passing JS arrays as bind params to text[] columns via @vercel/postgres can
 * fail; passing the literal + an explicit ::text[] cast is the dependable path.
 */
function toPgArray(arr: string[] | undefined | null): string {
  if (!arr || arr.length === 0) return '{}'
  const escaped = arr.map((s) => '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"')
  return '{' + escaped.join(',') + '}'
}

// ========== schema introspection ==========
// Per-table column cache so INSERT/UPDATE only references columns that exist
// (works on partially-migrated databases).

const columnsCacheByTable = new Map<string, Set<string>>()

async function tableColumns(table: string): Promise<Set<string>> {
  const cached = columnsCacheByTable.get(table)
  if (cached) return cached
  const { rows } = await sql.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = $1 AND table_schema = current_schema()`,
    [table]
  )
  const set = new Set<string>(rows.map((r) => String((r as Row).column_name)))
  columnsCacheByTable.set(table, set)
  return set
}

/** Reset the column cache (call after running a migration without restarting). */
export function _resetSchemaCache() {
  columnsCacheByTable.clear()
}

type Field = { col: string; value: unknown; cast?: string }

function buildInsert(table: string, fields: Field[], existing: Set<string>) {
  const present = fields.filter((f) => existing.has(f.col))
  if (present.length === 0) throw new Error(`No writable columns found on \`${table}\``)
  const cols = present.map((f) => f.col).join(', ')
  const placeholders = present.map((f, i) => `$${i + 1}${f.cast ?? ''}`).join(', ')
  return {
    text: `INSERT INTO ${table} (${cols}) VALUES (${placeholders}) RETURNING *`,
    params: present.map((f) => f.value),
  }
}

function buildUpdate(table: string, fields: Field[], existing: Set<string>, idValue: number) {
  const present = fields.filter((f) => existing.has(f.col))
  if (present.length === 0) throw new Error(`No writable columns found on \`${table}\``)
  const setClause = present.map((f, i) => `${f.col} = $${i + 1}${f.cast ?? ''}`).join(', ')
  const updatedAtFragment = existing.has('updated_at') ? ', updated_at = NOW()' : ''
  const idParam = `$${present.length + 1}`
  return {
    text: `UPDATE ${table} SET ${setClause}${updatedAtFragment} WHERE id = ${idParam} RETURNING *`,
    params: [...present.map((f) => f.value), idValue],
  }
}

// ========== restaurants ==========

export type RestaurantInput = {
  name: string
  address?: string
  hours?: string
  openDays?: string
  genre?: string
  foods?: string[]
  image_url?: string
  photos?: string[]
  description?: string
  price?: number
  rating?: number
  visitedAt?: string
  comment?: string
  isFavorite?: boolean
  latitude?: number | null
  longitude?: number | null
}

function rowToRestaurant(row: Row): Restaurant {
  const photos = asStringArray(row.photos)
  const image_url = asString(row.image_url) || photos[0] || ''
  return {
    id: asString(row.id),
    name: asString(row.name),
    address: asString(row.address),
    hours: asString(row.hours),
    openDays: asString(row.open_days),
    genre: (asString(row.genre, 'その他') as RestaurantGenre) || 'その他',
    foods: asStringArray(row.foods),
    photos,
    image_url,
    description: asString(row.description),
    price: asNumber(row.price),
    rating: asNumber(row.rating),
    visitedAt: asDate(row.visited_at),
    comment: asString(row.comment),
    isFavorite: asBool(row.is_favorite),
    latitude: asNumberOrNull(row.latitude),
    longitude: asNumberOrNull(row.longitude),
    createdAt: asISO(row.created_at),
    created_at: asISO(row.created_at),
    updatedAt: asISO(row.updated_at),
  }
}

function normalizeRestaurant(input: RestaurantInput) {
  const photos = input.photos ?? []
  const image_url = (input.image_url && input.image_url.trim()) || photos[0] || ''
  return {
    name: input.name?.trim() ?? '',
    address: input.address ?? '',
    hours: input.hours ?? '',
    open_days: input.openDays ?? '',
    genre: input.genre ?? 'その他',
    foods: input.foods ?? [],
    photos,
    image_url,
    price: Number.isFinite(input.price) ? Number(input.price) : 0,
    rating: Number.isFinite(input.rating) ? Number(input.rating) : 0,
    visited_at: input.visitedAt && input.visitedAt !== '' ? input.visitedAt : null,
    comment: input.comment ?? '',
    is_favorite: !!input.isFavorite,
    latitude: input.latitude == null ? null : Number(input.latitude),
    longitude: input.longitude == null ? null : Number(input.longitude),
  }
}

export const restaurantRepo = {
  async findAll(): Promise<Restaurant[]> {
    const { rows } = await sql`SELECT * FROM restaurants ORDER BY created_at DESC`
    return rows.map(rowToRestaurant)
  },
  async findById(id: string): Promise<Restaurant | null> {
    const numeric = Number(id)
    if (!Number.isFinite(numeric)) return null
    const { rows } = await sql`SELECT * FROM restaurants WHERE id = ${numeric} LIMIT 1`
    return rows[0] ? rowToRestaurant(rows[0]) : null
  },
  async create(input: RestaurantInput): Promise<Restaurant> {
    const v = normalizeRestaurant(input)
    const fields: Field[] = [
      { col: 'name', value: v.name },
      { col: 'address', value: v.address },
      { col: 'hours', value: v.hours },
      { col: 'open_days', value: v.open_days },
      { col: 'genre', value: v.genre },
      { col: 'foods', value: toPgArray(v.foods), cast: '::text[]' },
      { col: 'photos', value: toPgArray(v.photos), cast: '::text[]' },
      { col: 'price', value: v.price },
      { col: 'rating', value: v.rating },
      { col: 'visited_at', value: v.visited_at },
      { col: 'comment', value: v.comment },
      { col: 'is_favorite', value: v.is_favorite },
      { col: 'latitude', value: v.latitude },
      { col: 'longitude', value: v.longitude },
      { col: 'description', value: v.comment },
      { col: 'image_url', value: v.image_url },
    ]
    const cols = await tableColumns('restaurants')
    const { text, params } = buildInsert('restaurants', fields, cols)
    const { rows } = await sql.query(text, params)
    return rowToRestaurant(rows[0])
  },
  async update(id: string, input: RestaurantInput): Promise<Restaurant | null> {
    const numeric = Number(id)
    if (!Number.isFinite(numeric)) return null
    const v = normalizeRestaurant(input)
    const fields: Field[] = [
      { col: 'name', value: v.name },
      { col: 'address', value: v.address },
      { col: 'hours', value: v.hours },
      { col: 'open_days', value: v.open_days },
      { col: 'genre', value: v.genre },
      { col: 'foods', value: toPgArray(v.foods), cast: '::text[]' },
      { col: 'photos', value: toPgArray(v.photos), cast: '::text[]' },
      { col: 'price', value: v.price },
      { col: 'rating', value: v.rating },
      { col: 'visited_at', value: v.visited_at },
      { col: 'comment', value: v.comment },
      { col: 'is_favorite', value: v.is_favorite },
      { col: 'latitude', value: v.latitude },
      { col: 'longitude', value: v.longitude },
      { col: 'description', value: v.comment },
      { col: 'image_url', value: v.image_url },
    ]
    const cols = await tableColumns('restaurants')
    const { text, params } = buildUpdate('restaurants', fields, cols, numeric)
    const { rows } = await sql.query(text, params)
    return rows[0] ? rowToRestaurant(rows[0]) : null
  },
  async delete(id: string): Promise<boolean> {
    const numeric = Number(id)
    if (!Number.isFinite(numeric)) return false
    const { rowCount } = await sql`DELETE FROM restaurants WHERE id = ${numeric}`
    return (rowCount ?? 0) > 0
  },
}

// Back-compat aliases.
export const getRestaurants = () => restaurantRepo.findAll()
export const addRestaurant = (input: RestaurantInput) => restaurantRepo.create(input)

// ========== hotels ==========

export type HotelInput = {
  name: string
  address?: string
  category?: string
  image_url?: string
  photos?: string[]
  price?: number
  ratingFood?: number
  ratingBath?: number
  ratingRoom?: number
  breakfast?: string
  dinner?: string
  visitedAt?: string
  comment?: string
  isFavorite?: boolean
  latitude?: number | null
  longitude?: number | null
}

function rowToHotel(row: Row): Hotel {
  const photos = asStringArray(row.photos)
  const image_url = asString(row.image_url) || photos[0] || ''
  return {
    id: asString(row.id),
    name: asString(row.name),
    address: asString(row.address),
    category: (asString(row.category, 'その他') as HotelCategory) || 'その他',
    photos,
    image_url,
    price: asNumber(row.price),
    visitedAt: asDate(row.visited_at),
    comment: asString(row.comment),
    ratingFood: asNumber(row.rating_food),
    ratingBath: asNumber(row.rating_bath),
    ratingRoom: asNumber(row.rating_room),
    breakfast: asString(row.breakfast),
    dinner: asString(row.dinner),
    isFavorite: asBool(row.is_favorite),
    latitude: asNumberOrNull(row.latitude),
    longitude: asNumberOrNull(row.longitude),
    createdAt: asISO(row.created_at),
    created_at: asISO(row.created_at),
    updatedAt: asISO(row.updated_at),
  }
}

function normalizeHotel(input: HotelInput) {
  const photos = input.photos ?? []
  const image_url = (input.image_url && input.image_url.trim()) || photos[0] || ''
  return {
    name: input.name?.trim() ?? '',
    address: input.address ?? '',
    category: input.category ?? 'その他',
    photos,
    image_url,
    price: Number.isFinite(input.price) ? Number(input.price) : 0,
    rating_food: Number.isFinite(input.ratingFood) ? Number(input.ratingFood) : 0,
    rating_bath: Number.isFinite(input.ratingBath) ? Number(input.ratingBath) : 0,
    rating_room: Number.isFinite(input.ratingRoom) ? Number(input.ratingRoom) : 0,
    breakfast: input.breakfast ?? '',
    dinner: input.dinner ?? '',
    visited_at: input.visitedAt && input.visitedAt !== '' ? input.visitedAt : null,
    comment: input.comment ?? '',
    is_favorite: !!input.isFavorite,
    latitude: input.latitude == null ? null : Number(input.latitude),
    longitude: input.longitude == null ? null : Number(input.longitude),
  }
}

function hotelFields(v: ReturnType<typeof normalizeHotel>): Field[] {
  return [
    { col: 'name', value: v.name },
    { col: 'address', value: v.address },
    { col: 'category', value: v.category },
    { col: 'photos', value: toPgArray(v.photos), cast: '::text[]' },
    { col: 'price', value: v.price },
    { col: 'rating_food', value: v.rating_food },
    { col: 'rating_bath', value: v.rating_bath },
    { col: 'rating_room', value: v.rating_room },
    { col: 'breakfast', value: v.breakfast },
    { col: 'dinner', value: v.dinner },
    { col: 'visited_at', value: v.visited_at },
    { col: 'comment', value: v.comment },
    { col: 'is_favorite', value: v.is_favorite },
    { col: 'latitude', value: v.latitude },
    { col: 'longitude', value: v.longitude },
    { col: 'image_url', value: v.image_url },
  ]
}

export const hotelRepo = {
  async findAll(): Promise<Hotel[]> {
    const { rows } = await sql`SELECT * FROM hotels ORDER BY created_at DESC`
    return rows.map(rowToHotel)
  },
  async findById(id: string): Promise<Hotel | null> {
    const numeric = Number(id)
    if (!Number.isFinite(numeric)) return null
    const { rows } = await sql`SELECT * FROM hotels WHERE id = ${numeric} LIMIT 1`
    return rows[0] ? rowToHotel(rows[0]) : null
  },
  async create(input: HotelInput): Promise<Hotel> {
    const v = normalizeHotel(input)
    const cols = await tableColumns('hotels')
    const { text, params } = buildInsert('hotels', hotelFields(v), cols)
    const { rows } = await sql.query(text, params)
    return rowToHotel(rows[0])
  },
  async update(id: string, input: HotelInput): Promise<Hotel | null> {
    const numeric = Number(id)
    if (!Number.isFinite(numeric)) return null
    const v = normalizeHotel(input)
    const cols = await tableColumns('hotels')
    const { text, params } = buildUpdate('hotels', hotelFields(v), cols, numeric)
    const { rows } = await sql.query(text, params)
    return rows[0] ? rowToHotel(rows[0]) : null
  },
  async delete(id: string): Promise<boolean> {
    const numeric = Number(id)
    if (!Number.isFinite(numeric)) return false
    const { rowCount } = await sql`DELETE FROM hotels WHERE id = ${numeric}`
    return (rowCount ?? 0) > 0
  },
}

// ========== spots ==========

export type SpotInput = {
  name: string
  address?: string
  genre?: string
  image_url?: string
  photos?: string[]
  price?: number
  rating?: number
  visitedAt?: string
  comment?: string
  isFavorite?: boolean
  latitude?: number | null
  longitude?: number | null
}

function rowToSpot(row: Row): Spot {
  const photos = asStringArray(row.photos)
  const image_url = asString(row.image_url) || photos[0] || ''
  return {
    id: asString(row.id),
    name: asString(row.name),
    address: asString(row.address),
    genre: (asString(row.genre, 'その他') as SpotGenre) || 'その他',
    photos,
    image_url,
    price: asNumber(row.price),
    rating: asNumber(row.rating),
    visitedAt: asDate(row.visited_at),
    comment: asString(row.comment),
    isFavorite: asBool(row.is_favorite),
    latitude: asNumberOrNull(row.latitude),
    longitude: asNumberOrNull(row.longitude),
    createdAt: asISO(row.created_at),
    created_at: asISO(row.created_at),
    updatedAt: asISO(row.updated_at),
  }
}

function normalizeSpot(input: SpotInput) {
  const photos = input.photos ?? []
  const image_url = (input.image_url && input.image_url.trim()) || photos[0] || ''
  return {
    name: input.name?.trim() ?? '',
    address: input.address ?? '',
    genre: input.genre ?? 'その他',
    photos,
    image_url,
    price: Number.isFinite(input.price) ? Number(input.price) : 0,
    rating: Number.isFinite(input.rating) ? Number(input.rating) : 0,
    visited_at: input.visitedAt && input.visitedAt !== '' ? input.visitedAt : null,
    comment: input.comment ?? '',
    is_favorite: !!input.isFavorite,
    latitude: input.latitude == null ? null : Number(input.latitude),
    longitude: input.longitude == null ? null : Number(input.longitude),
  }
}

function spotFields(v: ReturnType<typeof normalizeSpot>): Field[] {
  return [
    { col: 'name', value: v.name },
    { col: 'address', value: v.address },
    { col: 'genre', value: v.genre },
    { col: 'photos', value: toPgArray(v.photos), cast: '::text[]' },
    { col: 'price', value: v.price },
    { col: 'rating', value: v.rating },
    { col: 'visited_at', value: v.visited_at },
    { col: 'comment', value: v.comment },
    { col: 'is_favorite', value: v.is_favorite },
    { col: 'latitude', value: v.latitude },
    { col: 'longitude', value: v.longitude },
    { col: 'image_url', value: v.image_url },
  ]
}

export const spotRepo = {
  async findAll(): Promise<Spot[]> {
    const { rows } = await sql`SELECT * FROM spots ORDER BY created_at DESC`
    return rows.map(rowToSpot)
  },
  async findById(id: string): Promise<Spot | null> {
    const numeric = Number(id)
    if (!Number.isFinite(numeric)) return null
    const { rows } = await sql`SELECT * FROM spots WHERE id = ${numeric} LIMIT 1`
    return rows[0] ? rowToSpot(rows[0]) : null
  },
  async create(input: SpotInput): Promise<Spot> {
    const v = normalizeSpot(input)
    const cols = await tableColumns('spots')
    const { text, params } = buildInsert('spots', spotFields(v), cols)
    const { rows } = await sql.query(text, params)
    return rowToSpot(rows[0])
  },
  async update(id: string, input: SpotInput): Promise<Spot | null> {
    const numeric = Number(id)
    if (!Number.isFinite(numeric)) return null
    const v = normalizeSpot(input)
    const cols = await tableColumns('spots')
    const { text, params } = buildUpdate('spots', spotFields(v), cols, numeric)
    const { rows } = await sql.query(text, params)
    return rows[0] ? rowToSpot(rows[0]) : null
  },
  async delete(id: string): Promise<boolean> {
    const numeric = Number(id)
    if (!Number.isFinite(numeric)) return false
    const { rowCount } = await sql`DELETE FROM spots WHERE id = ${numeric}`
    return (rowCount ?? 0) > 0
  },
}

// ========== plans ==========

export type PlanInput = {
  name: string
  description?: string
  address?: string
  image_url?: string
  comment?: string
  scheduledAt?: string
  isFavorite?: boolean
  latitude?: number | null
  longitude?: number | null
}

function rowToPlan(row: Row): Plan {
  return {
    id: asString(row.id),
    name: asString(row.name),
    description: asString(row.description),
    address: asString(row.address),
    image_url: asString(row.image_url),
    comment: asString(row.comment),
    scheduledAt: asDate(row.scheduled_at),
    isFavorite: asBool(row.is_favorite),
    latitude: asNumberOrNull(row.latitude),
    longitude: asNumberOrNull(row.longitude),
    createdAt: asISO(row.created_at),
    created_at: asISO(row.created_at),
    updatedAt: asISO(row.updated_at),
  }
}

function normalizePlan(input: PlanInput) {
  return {
    name: input.name?.trim() ?? '',
    description: input.description ?? '',
    address: input.address ?? '',
    image_url: input.image_url ?? '',
    comment: input.comment ?? '',
    scheduled_at: input.scheduledAt && input.scheduledAt !== '' ? input.scheduledAt : null,
    is_favorite: !!input.isFavorite,
    latitude: input.latitude == null ? null : Number(input.latitude),
    longitude: input.longitude == null ? null : Number(input.longitude),
  }
}

function planFields(v: ReturnType<typeof normalizePlan>): Field[] {
  return [
    { col: 'name', value: v.name },
    { col: 'description', value: v.description },
    { col: 'address', value: v.address },
    { col: 'image_url', value: v.image_url },
    { col: 'comment', value: v.comment },
    { col: 'scheduled_at', value: v.scheduled_at },
    { col: 'is_favorite', value: v.is_favorite },
    { col: 'latitude', value: v.latitude },
    { col: 'longitude', value: v.longitude },
  ]
}

export const planRepo = {
  async findAll(): Promise<Plan[]> {
    const { rows } = await sql`SELECT * FROM plans ORDER BY created_at DESC`
    return rows.map(rowToPlan)
  },
  async findById(id: string): Promise<Plan | null> {
    const numeric = Number(id)
    if (!Number.isFinite(numeric)) return null
    const { rows } = await sql`SELECT * FROM plans WHERE id = ${numeric} LIMIT 1`
    return rows[0] ? rowToPlan(rows[0]) : null
  },
  async create(input: PlanInput): Promise<Plan> {
    const v = normalizePlan(input)
    const cols = await tableColumns('plans')
    const { text, params } = buildInsert('plans', planFields(v), cols)
    const { rows } = await sql.query(text, params)
    return rowToPlan(rows[0])
  },
  async update(id: string, input: PlanInput): Promise<Plan | null> {
    const numeric = Number(id)
    if (!Number.isFinite(numeric)) return null
    const v = normalizePlan(input)
    const cols = await tableColumns('plans')
    const { text, params } = buildUpdate('plans', planFields(v), cols, numeric)
    const { rows } = await sql.query(text, params)
    return rows[0] ? rowToPlan(rows[0]) : null
  },
  async delete(id: string): Promise<boolean> {
    const numeric = Number(id)
    if (!Number.isFinite(numeric)) return false
    const { rowCount } = await sql`DELETE FROM plans WHERE id = ${numeric}`
    return (rowCount ?? 0) > 0
  },
}
