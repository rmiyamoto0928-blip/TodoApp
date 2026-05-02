export type RestaurantGenre =
  | 'ラーメン'
  | '焼肉'
  | 'カフェ'
  | '居酒屋'
  | '寿司'
  | '焼き鳥'
  | 'イタリアン'
  | '中華'
  | 'フレンチ'
  | '焼肉'
  | 'ステーキ'
  | 'うどん・そば'
  | '定食'
  | 'バーガー'
  | 'その他'

export type SpotGenre =
  | 'テーマパーク'
  | '公園'
  | '観光地'
  | '温泉'
  | '博物館'
  | '水族館'
  | '動物園'
  | 'ショッピング'
  | '神社・寺'
  | '自然・景勝地'
  | 'その他'

export type HotelCategory =
  | '高級'
  | 'ビジネス'
  | '温泉旅館'
  | 'リゾート'
  | 'ゲストハウス'
  | 'カプセル'
  | 'その他'

export interface Restaurant {
  id: string
  name: string
  address: string
  hours: string
  openDays: string
  genre: RestaurantGenre
  foods: string[]
  photos: string[]
  /** First photo, kept for back-compat with components that read image_url. */
  image_url?: string
  /** Mirror of comment, kept for back-compat with the legacy column. */
  description?: string
  price: number
  rating: number
  visitedAt: string
  comment: string
  isFavorite: boolean
  /** Latitude in WGS84. Null when unknown. */
  latitude?: number | null
  /** Longitude in WGS84. Null when unknown. */
  longitude?: number | null
  /** External URLs (homepage / SNS / 食べログ etc.). Order preserved. */
  links?: string[]
  createdAt: string
  /** Snake-case alias for createdAt — the legacy DB column shape. */
  created_at?: string
  updatedAt: string
}

export interface Hotel {
  id: string
  name: string
  address: string
  category: HotelCategory
  photos: string[]
  image_url?: string
  price: number
  visitedAt: string
  comment: string
  ratingFood: number
  ratingBath: number
  ratingRoom: number
  breakfast: string
  dinner: string
  isFavorite: boolean
  latitude?: number | null
  longitude?: number | null
  links?: string[]
  createdAt: string
  created_at?: string
  updatedAt: string
}

export interface Spot {
  id: string
  name: string
  address: string
  genre: SpotGenre
  photos: string[]
  image_url?: string
  price: number
  rating: number
  visitedAt: string
  comment: string
  isFavorite: boolean
  latitude?: number | null
  longitude?: number | null
  links?: string[]
  createdAt: string
  created_at?: string
  updatedAt: string
}

export interface Plan {
  id: string
  name: string
  description: string
  address: string
  image_url: string
  comment: string
  scheduledAt: string
  isFavorite: boolean
  latitude?: number | null
  longitude?: number | null
  links?: string[]
  createdAt: string
  created_at?: string
  updatedAt: string
}

export interface DB {
  restaurants: Restaurant[]
  hotels: Hotel[]
  spots: Spot[]
}

export type SortOption = 'rating-desc' | 'rating-asc' | 'date-desc' | 'date-asc'

export type Category = 'restaurants' | 'hotels' | 'spots'
