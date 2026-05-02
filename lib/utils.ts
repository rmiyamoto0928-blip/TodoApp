import { Restaurant, Hotel, Spot, SortOption } from './types'

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function now(): string {
  return new Date().toISOString()
}

export function hotelOverallRating(hotel: Hotel): number {
  return Math.round(((hotel.ratingFood + hotel.ratingBath + hotel.ratingRoom) / 3) * 10) / 10
}

export function formatPrice(price: number): string {
  if (price === 0) return '無料'
  return `¥${price.toLocaleString()}`
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

export function sortRestaurants(items: Restaurant[], sort: SortOption): Restaurant[] {
  return [...items].sort((a, b) => {
    if (sort === 'rating-desc') return b.rating - a.rating
    if (sort === 'rating-asc') return a.rating - b.rating
    if (sort === 'date-desc') return new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime()
    return new Date(a.visitedAt).getTime() - new Date(b.visitedAt).getTime()
  })
}

export function sortHotels(items: Hotel[], sort: SortOption): Hotel[] {
  return [...items].sort((a, b) => {
    const rA = hotelOverallRating(a)
    const rB = hotelOverallRating(b)
    if (sort === 'rating-desc') return rB - rA
    if (sort === 'rating-asc') return rA - rB
    if (sort === 'date-desc') return new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime()
    return new Date(a.visitedAt).getTime() - new Date(b.visitedAt).getTime()
  })
}

export function sortSpots(items: Spot[], sort: SortOption): Spot[] {
  return [...items].sort((a, b) => {
    if (sort === 'rating-desc') return b.rating - a.rating
    if (sort === 'rating-asc') return a.rating - b.rating
    if (sort === 'date-desc') return new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime()
    return new Date(a.visitedAt).getTime() - new Date(b.visitedAt).getTime()
  })
}

export function searchFilter<T extends { name: string; address: string }>(items: T[], query: string): T[] {
  if (!query.trim()) return items
  const q = query.toLowerCase()
  return items.filter(
    (item) => item.name.toLowerCase().includes(q) || item.address.toLowerCase().includes(q)
  )
}

// ---------- Geo ----------

export interface LatLng {
  latitude: number
  longitude: number
}

/**
 * Great-circle distance in kilometres between two coordinates (Haversine).
 * Returns null if either point is missing — caller decides how to render.
 */
export function distanceKm(a: LatLng | null | undefined, b: LatLng | null | undefined): number | null {
  if (!a || !b) return null
  if (a.latitude == null || a.longitude == null || b.latitude == null || b.longitude == null) return null
  const R = 6371 // km
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.latitude - a.latitude)
  const dLon = toRad(b.longitude - a.longitude)
  const lat1 = toRad(a.latitude)
  const lat2 = toRad(b.latitude)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}

// Nominatim's `address` object — fields we care about for Japanese addresses.
// All optional because Nominatim returns whatever is present for the location.
// `lv01` is a non-standard field we synthesize on the server from the GSI
// reverse-geocoder (国土地理院) for 大字・字・町丁目 level detail that OSM lacks.
export interface NominatimAddress {
  country?: string
  country_code?: string
  postcode?: string
  state?: string       // 都道府県 (e.g. 愛知県)
  province?: string
  region?: string
  county?: string      // 郡 (e.g. 愛知郡)
  city?: string        // 市
  town?: string        // 町
  village?: string     // 村
  city_district?: string
  ward?: string        // 区
  lv01?: string        // 大字・字・町丁目 (from GSI)
  suburb?: string
  quarter?: string
  neighbourhood?: string
  road?: string
  house_number?: string
  [key: string]: string | undefined
}

/**
 * Reformat a Nominatim address object into a Japanese-style string written from
 * largest unit to smallest (都道府県 → 郡 → 市町村 → 区 → 字 → 番地), with no
 * separators. Postcode and country are intentionally omitted.
 *
 * Returns '' for non-Japanese addresses so the caller can fall back to the
 * default `display_name`.
 */
export function formatJpAddress(p: NominatimAddress | null | undefined): string {
  if (!p) return ''
  if (p.country_code && p.country_code.toLowerCase() !== 'jp') return ''
  const ordered = [
    p.state || p.province || p.region, // 都道府県
    p.county,                          // 郡
    p.city || p.town || p.village,     // 市/町/村
    p.city_district || p.ward,         // 区
    p.lv01,                            // 大字・字・町丁目 (GSI)
    p.suburb,                          // (Nominatim 側の同レベル — 重複は dedup で吸収)
    p.quarter,
    p.neighbourhood,                   // 丁目 / 字
    p.road,
    p.house_number,                    // 番地（OSMにあれば）
  ].filter((s): s is string => !!s && s.trim() !== '')
  // Drop adjacent duplicates and segments that are already contained in an
  // earlier segment (Nominatim and GSI often overlap on the 大字 level).
  const out: string[] = []
  for (const s of ordered) {
    if (out.length > 0) {
      const prev = out[out.length - 1]
      if (prev === s) continue
      if (prev.includes(s) || s.includes(prev)) {
        // Keep the longer of the two so we don't lose information.
        if (s.length > prev.length) out[out.length - 1] = s
        continue
      }
    }
    out.push(s)
  }
  return out.join('')
}

/** Format a km distance for display: "240 m", "1.2 km", "12 km". */
export function formatDistance(km: number | null | undefined): string {
  if (km == null || !Number.isFinite(km)) return ''
  if (km < 1) return `${Math.round(km * 1000)} m`
  if (km < 10) return `${km.toFixed(1)} km`
  return `${Math.round(km)} km`
}

export const RESTAURANT_GENRES = [
  'ラーメン', '焼肉', 'カフェ', '居酒屋', '寿司', '焼き鳥',
  'イタリアン', '中華', 'フレンチ', 'ステーキ', 'うどん・そば',
  '定食', 'バーガー', 'その他',
] as const

export const SPOT_GENRES = [
  'テーマパーク', '公園', '観光地', '温泉', '博物館', '水族館',
  '動物園', 'ショッピング', '神社・寺', '自然・景勝地', 'その他',
] as const

export const HOTEL_CATEGORIES = [
  '高級', 'ビジネス', '温泉旅館', 'リゾート', 'ゲストハウス', 'カプセル', 'その他',
] as const
