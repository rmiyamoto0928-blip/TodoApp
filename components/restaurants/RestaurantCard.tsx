'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Restaurant } from '@/lib/types'
import CarRating from '@/components/ui/CarRating'
import FavoriteButton from '@/components/ui/FavoriteButton'
import RankingBadge from '@/components/ui/RankingBadge'
import { formatPrice, formatDate, distanceKm, formatDistance, type LatLng } from '@/lib/utils'

interface RestaurantCardProps {
  item: Restaurant
  rank?: number
  onFavoriteToggle: (id: string) => void
  /** Current user location, when available. Distance is shown only if both this and the item have coords. */
  userLocation?: LatLng | null
}

export default function RestaurantCard({ item, rank, onFavoriteToggle, userLocation }: RestaurantCardProps) {
  const itemCoords =
    item.latitude != null && item.longitude != null
      ? { latitude: item.latitude, longitude: item.longitude }
      : null
  const distance = formatDistance(distanceKm(userLocation ?? null, itemCoords))
  // 💡 ここでデータの変換をチェック（image_url または photos[0] を優先して使う）
  const displayImage = item.image_url || (item.photos && item.photos[0]);

  return (
    <div className="relative bg-white rounded-2xl shadow-sm overflow-hidden active:scale-[0.98] transition-transform duration-150 border border-gray-100">
      <Link href={`/restaurants/${item.id}`} className="block">
        <div className="relative aspect-[4/3] bg-gray-100">
          {/* 💡 修正ポイント：displayImage があるかチェック */}
          {displayImage ? (
            <Image src={displayImage} alt={item.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
              🍜
            </div>
          )}
          {rank && rank <= 3 && (
            <div className="absolute top-2 left-2">
              <RankingBadge rank={rank} />
            </div>
          )}
          {item.isFavorite && (
            <div className="absolute top-2 right-10 text-red-400 text-sm font-bold bg-white/80 rounded-full px-1.5 py-0.5">
              ♥
            </div>
          )}
        </div>
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">{item.name}</h3>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs bg-sky-50 text-sky-500 px-2 py-0.5 rounded-full font-medium">
                  {item.genre || '飲食店'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-1.5">
            <CarRating rating={item.rating || 0} size="sm" />
            <span className="text-xs text-gray-400 font-medium">({item.rating || 0})</span>
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <div className="text-xs text-gray-500 truncate flex items-center gap-1">
              <span>📍</span>
              <span className="truncate">{item.address || '住所未設定'}</span>
            </div>
            {item.price > 0 && (
              <span className="text-xs text-gray-400 shrink-0">{formatPrice(item.price)}</span>
            )}
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <div className="text-xs text-gray-400">{formatDate(item.visitedAt || item.created_at || '')}</div>
            {distance && (
              <span className="text-[11px] text-sky-500 font-medium shrink-0">🧭 {distance}</span>
            )}
          </div>
        </div>
      </Link>
      <div className="absolute bottom-3 right-3">
        <FavoriteButton
          isFavorite={item.isFavorite}
          onToggle={() => onFavoriteToggle(item.id)}
          size="sm"
        />
      </div>
    </div>
  )
}