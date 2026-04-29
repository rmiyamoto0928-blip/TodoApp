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
