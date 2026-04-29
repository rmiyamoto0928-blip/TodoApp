'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Recommendation, getRecommendations } from '@/lib/recommendation'
import CarRating from '@/components/ui/CarRating'

const categoryIcon: Record<string, string> = {
  restaurant: '🍜',
  hotel: '🏨',
  spot: '🎡',
}

const categoryPath: Record<string, string> = {
  restaurant: 'restaurants',
  hotel: 'hotels',
  spot: 'spots',
}

export default function RecommendCard() {
  const [recs, setRecs] = useState<Recommendation[]>([])
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const load = async () => {
      const [r, h, s] = await Promise.all([
        fetch('/api/restaurants').then((res) => res.json()),
        fetch('/api/hotels').then((res) => res.json()),
        fetch('/api/spots').then((res) => res.json()),
      ])
      setRecs(getRecommendations(r, h, s, 3))
    }
    load()
  }, [])

  if (recs.length === 0) return null

  const rec = recs[idx]

  return (
    <div className="mx-4 mb-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-gray-700">✨ 今日のおすすめ</h2>
        <div className="flex gap-1">
          {recs.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-sky-400 w-3' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </div>

      <Link href={`/${categoryPath[rec.category]}/${rec.id}`}>
        <div className="bg-gradient-to-r from-sky-400 to-sky-500 rounded-2xl p-3 shadow-md flex gap-3 items-center active:scale-[0.98] transition-transform">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-sky-300 shrink-0">
            {rec.photo ? (
              <Image src={rec.photo} alt={rec.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">
                {categoryIcon[rec.category]}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-sky-100 font-medium">
              {categoryIcon[rec.category]} {rec.category === 'restaurant' ? '飲食店' : rec.category === 'hotel' ? 'ホテル' : 'スポット'}
            </div>
            <div className="text-white font-bold text-base leading-tight truncate">{rec.name}</div>
            <div className="flex items-center gap-1 mt-0.5">
              <CarRating rating={rec.rating} size="sm" />
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {rec.reasons.map((r, i) => (
                <span key={i} className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full">
                  {r}
                </span>
              ))}
            </div>
          </div>
          <span className="text-white/70 text-lg shrink-0">›</span>
        </div>
      </Link>
    </div>
  )
}
