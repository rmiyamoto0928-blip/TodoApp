import { Restaurant, Hotel, Spot } from './types'
import { hotelOverallRating } from './utils'

export interface Recommendation {
  id: string
  name: string
  category: 'restaurant' | 'hotel' | 'spot'
  address: string
  rating: number
  photo?: string
  reasons: string[]
  score: number
}

function daysSince(dateStr: string): number {
  const d = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
}

function scoreRestaurant(item: Restaurant, allItems: Restaurant[]): number {
  let score = 0
  const reasons: string[] = []

  if (item.rating >= 4) { score += 30; reasons.push('評価が高い') }
  if (item.isFavorite) { score += 25; reasons.push('お気に入り') }

  const days = daysSince(item.visitedAt)
  if (days > 180) { score += 20; reasons.push('久しぶり（半年以上）') }
  else if (days > 90) { score += 10; reasons.push('最近行っていない') }

  // Genre variety bonus - avoid genres visited recently
  const recentGenres = allItems
    .filter((r) => r.id !== item.id && daysSince(r.visitedAt) < 30)
    .map((r) => r.genre)
  if (!recentGenres.includes(item.genre)) { score += 15; reasons.push('バランスが良い') }

  return score
}

function scoreHotel(item: Hotel): number {
  let score = 0
  const overall = hotelOverallRating(item)
  if (overall >= 4) { score += 30 }
  if (item.isFavorite) { score += 25 }
  const days = daysSince(item.visitedAt)
  if (days > 365) { score += 20 }
  else if (days > 180) { score += 10 }
  return score
}

function scoreSpot(item: Spot, allItems: Spot[]): number {
  let score = 0
  if (item.rating >= 4) { score += 30 }
  if (item.isFavorite) { score += 25 }
  const days = daysSince(item.visitedAt)
  if (days > 180) { score += 20 }
  else if (days > 90) { score += 10 }
  const recentGenres = allItems
    .filter((s) => s.id !== item.id && daysSince(s.visitedAt) < 30)
    .map((s) => s.genre)
  if (!recentGenres.includes(item.genre)) { score += 15 }
  return score
}

function reasonsForRestaurant(item: Restaurant, allItems: Restaurant[]): string[] {
  const reasons: string[] = []
  if (item.rating >= 4) reasons.push('評価が高い')
  if (item.isFavorite) reasons.push('お気に入り')
  const days = daysSince(item.visitedAt)
  if (days > 180) reasons.push('半年以上ぶり')
  else if (days > 90) reasons.push('最近行っていない')
  const recentGenres = allItems
    .filter((r) => r.id !== item.id && daysSince(r.visitedAt) < 30)
    .map((r) => r.genre)
  if (!recentGenres.includes(item.genre)) reasons.push('ジャンルバランス◎')
  return reasons.slice(0, 2)
}

function reasonsForHotel(item: Hotel): string[] {
  const reasons: string[] = []
  const overall = hotelOverallRating(item)
  if (overall >= 4) reasons.push('評価が高い')
  if (item.isFavorite) reasons.push('お気に入り')
  const days = daysSince(item.visitedAt)
  if (days > 365) reasons.push('1年以上ぶり')
  else if (days > 180) reasons.push('久しぶり')
  return reasons.slice(0, 2)
}

function reasonsForSpot(item: Spot, allItems: Spot[]): string[] {
  const reasons: string[] = []
  if (item.rating >= 4) reasons.push('評価が高い')
  if (item.isFavorite) reasons.push('お気に入り')
  const days = daysSince(item.visitedAt)
  if (days > 180) reasons.push('半年以上ぶり')
  else if (days > 90) reasons.push('最近行っていない')
  const recentGenres = allItems
    .filter((s) => s.id !== item.id && daysSince(s.visitedAt) < 30)
    .map((s) => s.genre)
  if (!recentGenres.includes(item.genre)) reasons.push('ジャンルバランス◎')
  return reasons.slice(0, 2)
}

export function getRecommendations(
  restaurants: Restaurant[],
  hotels: Hotel[],
  spots: Spot[],
  limit = 3
): Recommendation[] {
  const all: Recommendation[] = [
    ...restaurants.map((r) => ({
      id: r.id,
      name: r.name,
      category: 'restaurant' as const,
      address: r.address,
      rating: r.rating,
      photo: r.photos[0],
      reasons: reasonsForRestaurant(r, restaurants),
      score: scoreRestaurant(r, restaurants),
    })),
    ...hotels.map((h) => ({
      id: h.id,
      name: h.name,
      category: 'hotel' as const,
      address: h.address,
      rating: Math.round(hotelOverallRating(h)),
      photo: h.photos[0],
      reasons: reasonsForHotel(h),
      score: scoreHotel(h),
    })),
    ...spots.map((s) => ({
      id: s.id,
      name: s.name,
      category: 'spot' as const,
      address: s.address,
      rating: s.rating,
      photo: s.photos[0],
      reasons: reasonsForSpot(s, spots),
      score: scoreSpot(s, spots),
    })),
  ]

  return all
    .filter((r) => r.score > 0 && r.reasons.length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
