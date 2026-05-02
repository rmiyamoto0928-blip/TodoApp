'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Spot } from '@/lib/types'
import CarRating from '@/components/ui/CarRating'
import FavoriteButton from '@/components/ui/FavoriteButton'
import RankingBadge from '@/components/ui/RankingBadge'
import { formatPrice, formatDate } from '@/lib/utils'

interface SpotCardProps {
  item: Spot
  rank?: number
  onFavoriteToggle: (id: string) => void
}

export default function SpotCard({ item, rank, onFavoriteToggle }: SpotCardProps) {
  return (
    <div className="relative bg-white rounded-2xl shadow-sm overflow-hidden active:scale-[0.98] transition-transform duration-150">
      <Link href={`/spots/${item.id}`} className="block">
        <div className="relative aspect-[4/3] bg-gray-100">
          {(item.image_url || item.photos?.[0]) ? (
            <Image src={item.image_url || item.photos[0]} alt={item.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">🎡</div>
          )}
          {rank && rank <= 3 && (
            <div className="absolute top-2 left-2"><RankingBadge rank={rank} /></div>
          )}
        </div>
        <div className="p-3">
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">{item.name}</h3>
              <span className="text-xs bg-sky-50 text-sky-500 px-2 py-0.5 rounded-full font-medium">{item.genre}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-1.5">
            <CarRating rating={item.rating} size="sm" />
            <span className="text-xs text-gray-400">({item.rating})</span>
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <div className="text-xs text-gray-500 truncate flex items-center gap-1">
              <span>📍</span><span className="truncate">{item.address}</span>
            </div>
            <span className="text-xs text-gray-400 shrink-0">{formatPrice(item.price)}</span>
          </div>
          <div className="text-xs text-gray-400 mt-0.5">{formatDate(item.visitedAt)}</div>
        </div>
      </Link>
      <div className="absolute bottom-3 right-3">
        <FavoriteButton isFavorite={item.isFavorite} onToggle={() => onFavoriteToggle(item.id)} size="sm" />
      </div>
    </div>
  )
}
