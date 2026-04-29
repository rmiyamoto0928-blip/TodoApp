import fs from 'fs'
import path from 'path'
import { DB, Restaurant, Hotel, Spot } from './types'
import { generateId, now } from './utils'

const DB_PATH = path.join(process.cwd(), 'data', 'db.json')

function readDB(): DB {
  const raw = fs.readFileSync(DB_PATH, 'utf-8')
  return JSON.parse(raw) as DB
}

function writeDB(db: DB): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8')
}

// Restaurants
export const restaurantRepo = {
  findAll: (): Restaurant[] => readDB().restaurants,

  findById: (id: string): Restaurant | undefined =>
    readDB().restaurants.find((r) => r.id === id),

  create: (data: Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'>): Restaurant => {
    const db = readDB()
    const record: Restaurant = { ...data, id: generateId(), createdAt: now(), updatedAt: now() }
    db.restaurants.push(record)
    writeDB(db)
    return record
  },

  update: (id: string, data: Partial<Omit<Restaurant, 'id' | 'createdAt'>>): Restaurant | null => {
    const db = readDB()
    const idx = db.restaurants.findIndex((r) => r.id === id)
    if (idx === -1) return null
    db.restaurants[idx] = { ...db.restaurants[idx], ...data, updatedAt: now() }
    writeDB(db)
    return db.restaurants[idx]
  },

  delete: (id: string): boolean => {
    const db = readDB()
    const len = db.restaurants.length
    db.restaurants = db.restaurants.filter((r) => r.id !== id)
    if (db.restaurants.length === len) return false
    writeDB(db)
    return true
  },
}

// Hotels
export const hotelRepo = {
  findAll: (): Hotel[] => readDB().hotels,

  findById: (id: string): Hotel | undefined =>
    readDB().hotels.find((h) => h.id === id),

  create: (data: Omit<Hotel, 'id' | 'createdAt' | 'updatedAt'>): Hotel => {
    const db = readDB()
    const record: Hotel = { ...data, id: generateId(), createdAt: now(), updatedAt: now() }
    db.hotels.push(record)
    writeDB(db)
    return record
  },

  update: (id: string, data: Partial<Omit<Hotel, 'id' | 'createdAt'>>): Hotel | null => {
    const db = readDB()
    const idx = db.hotels.findIndex((h) => h.id === id)
    if (idx === -1) return null
    db.hotels[idx] = { ...db.hotels[idx], ...data, updatedAt: now() }
    writeDB(db)
    return db.hotels[idx]
  },

  delete: (id: string): boolean => {
    const db = readDB()
    const len = db.hotels.length
    db.hotels = db.hotels.filter((h) => h.id !== id)
    if (db.hotels.length === len) return false
    writeDB(db)
    return true
  },
}

// Spots
export const spotRepo = {
  findAll: (): Spot[] => readDB().spots,

  findById: (id: string): Spot | undefined =>
    readDB().spots.find((s) => s.id === id),

  create: (data: Omit<Spot, 'id' | 'createdAt' | 'updatedAt'>): Spot => {
    const db = readDB()
    const record: Spot = { ...data, id: generateId(), createdAt: now(), updatedAt: now() }
    db.spots.push(record)
    writeDB(db)
    return record
  },

  update: (id: string, data: Partial<Omit<Spot, 'id' | 'createdAt'>>): Spot | null => {
    const db = readDB()
    const idx = db.spots.findIndex((s) => s.id === id)
    if (idx === -1) return null
    db.spots[idx] = { ...db.spots[idx], ...data, updatedAt: now() }
    writeDB(db)
    return db.spots[idx]
  },

  delete: (id: string): boolean => {
    const db = readDB()
    const len = db.spots.length
    db.spots = db.spots.filter((s) => s.id !== id)
    if (db.spots.length === len) return false
    writeDB(db)
    return true
  },
}
