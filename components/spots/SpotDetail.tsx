'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Spot } from '@/lib/types'
import CarRating from '@/components/ui/CarRating'
import FavoriteButton from '@/components/ui/FavoriteButton'
import MapEmbed from '@/components/ui/MapEmbed'
import LinksDisplay from '@/components/ui/LinksDisplay'
import { formatPrice, formatDate } from '@/lib/utils'

export default function SpotDetail({ item: initial }: { item: Spot }) {
  const router = useRouter()
  const [item, setItem] = useState(initial)
  const [imgIdx, setImgIdx] = useState(0)

  const toggleFav = async () => {
    const updated = { ...item, isFavorite: !item.isFavorite }
    await fetch(`/api/spots/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    setItem(updated)
  }

  const handleDelete = async () => {
    if (!confirm('削除しますか？')) return
    await fetch(`/api/spots/${item.id}`, { method: 'DELETE' })
    router.push('/spots')
    router.refresh()
  }

  return (
    <div className="pb-8">
      <div className="relative bg-gray-100 aspect-[4/3]">
        {(item.image_url || item.photos.length > 0) ? (
          <>
            <Image
              src={item.image_url || item.photos[imgIdx]}
              alt={item.name}
              fill
              className="object-cover"
            />
            {!item.image_url && item.photos.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {item.photos.map((_, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === imgIdx ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl text-gray-200">🎡</div>
        )}
      </div>

      <div className="px-4 pt-4 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <span className="text-xs bg-sky-50 text-sky-500 px-2 py-0.5 rounded-full font-medium">
              {item.genre}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">{item.name}</h1>
          </div>
          <FavoriteButton isFavorite={item.isFavorite} onToggle={toggleFav} />
        </div>

        <div className="flex items-center gap-2">
          <CarRating rating={item.rating} size="lg" />
          <span className="text-lg font-bold text-sky-400">{item.rating}</span>
          <span className="text-gray-400 text-sm">/ 5</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '📍', label: '住所', value: item.address },
            { icon: '💴', label: '金額', value: item.price > 0 ? formatPrice(item.price) : '' },
            { icon: '🗓', label: '行った日', value: formatDate(item.visitedAt) },
          ].filter((r) => r.value).map((row) => (
            <div key={row.label} className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <span>{row.icon}</span>{row.label}
              </div>
              <div className="text-sm font-medium text-gray-800 mt-0.5">{row.value}</div>
            </div>
          ))}
        </div>

        {item.comment && (
          <div className="bg-gray-50 rounded-2xl p-4">
            <h2 className="text-sm font-bold text-gray-700 mb-1">💬 感想</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{item.comment}</p>
          </div>
        )}

        {item.memo && (
          <div className="bg-amber-50 rounded-2xl p-4">
            <h2 className="text-sm font-bold text-amber-700 mb-1">💰 金額メモ</h2>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{item.memo}</p>
          </div>
        )}

        <LinksDisplay links={item.links} />

        {item.address && (
          <div>
            <h2 className="text-sm font-bold text-gray-700 mb-2">🗺 地図</h2>
            <MapEmbed address={item.address} />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Link href={`/spots/${item.id}/edit`}
            className="flex-1 py-3 bg-sky-400 text-white font-bold rounded-2xl text-center text-sm">
            編集する
          </Link>
          <button onClick={handleDelete}
            className="flex-1 py-3 bg-red-100 text-red-500 font-bold rounded-2xl text-sm">
            削除する
          </button>
        </div>
      </div>
    </div>
  )
}
