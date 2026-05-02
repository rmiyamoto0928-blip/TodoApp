'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Plan } from '@/lib/types'
import FavoriteButton from '@/components/ui/FavoriteButton'
import { formatDate } from '@/lib/utils'

interface PlanCardProps {
  item: Plan
  onFavoriteToggle: (id: string) => void
}

export default function PlanCard({ item, onFavoriteToggle }: PlanCardProps) {
  return (
    <div className="relative bg-white rounded-2xl shadow-sm overflow-hidden active:scale-[0.98] transition-transform duration-150 border border-gray-100">
      <Link href={`/plans/${item.id}`} className="block">
        <div className="relative aspect-[16/9] bg-gray-100">
          {item.image_url ? (
            <Image src={item.image_url} alt={item.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">🗺</div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">{item.name}</h3>
          {item.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mt-1">{item.description}</p>
          )}
          <div className="flex items-center justify-between mt-1.5">
            <div className="text-xs text-gray-500 truncate flex items-center gap-1">
              <span>📍</span>
              <span className="truncate">{item.address || '住所未設定'}</span>
            </div>
            {item.scheduledAt && (
              <span className="text-xs text-gray-400 shrink-0">{formatDate(item.scheduledAt)}</span>
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
