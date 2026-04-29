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
  price: number
  rating: number
  visitedAt: string
  comment: string
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

export interface Hotel {
  id: string
  name: string
  address: string
  category: HotelCategory
  photos: string[]
  price: number
  visitedAt: string
  comment: string
  ratingFood: number
  ratingBath: number
  ratingRoom: number
  breakfast: string
  dinner: string
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

export interface Spot {
  id: string
  name: string
  address: string
  genre: SpotGenre
  photos: string[]
  price: number
  rating: number
  visitedAt: string
  comment: string
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

export interface DB {
  restaurants: Restaurant[]
  hotels: Hotel[]
  spots: Spot[]
}

export type SortOption = 'rating-desc' | 'rating-asc' | 'date-desc' | 'date-asc'

export type Category = 'restaurants' | 'hotels' | 'spots'
