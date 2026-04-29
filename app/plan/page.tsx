'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Restaurant, Spot } from '@/lib/types'
import CarRating from '@/components/ui/CarRating'

type PlanItem = {
  id: string
  name: string
  address: string
  category: 'restaurant' | 'spot'
  rating: number
  photo?: string
  genre: string
}

function sortByGenreBalance(items: PlanItem[]): PlanItem[] {
  const restaurants = items.filter((i) => i.category === 'restaurant')
  const spots = items.filter((i) => i.category === 'spot')
  const result: PlanItem[] = []
  const max = Math.max(restaurants.length, spots.length)
  for (let i = 0; i < max; i++) {
    if (spots[i]) result.push(spots[i])
    if (restaurants[i]) result.push(restaurants[i])
  }
  return result
}

export default function PlanPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [spots, setSpots] = useState<Spot[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [plan, setPlan] = useState<PlanItem[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'restaurants' | 'spots'>('spots')

  const load = useCallback(async () => {
    const [r, s] = await Promise.all([
      fetch('/api/restaurants').then((res) => res.json()),
      fetch('/api/spots').then((res) => res.json()),
    ])
    setRestaurants(r)
    setSpots(s)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    setPlan(null)
  }

  const createPlan = () => {
    const selectedRestaurants: PlanItem[] = restaurants
      .filter((r) => selected.has(r.id))
      .map((r) => ({ id: r.id, name: r.name, address: r.address, category: 'restaurant', rating: r.rating, photo: r.photos[0], genre: r.genre }))

    const selectedSpots: PlanItem[] = spots
      .filter((s) => selected.has(s.id))
      .map((s) => ({ id: s.id, name: s.name, address: s.address, category: 'spot', rating: s.rating, photo: s.photos[0], genre: s.genre }))

    const all = [...selectedRestaurants, ...selectedSpots]
    setPlan(sortByGenreBalance(all))
  }

  const categoryIcon = { restaurant: '🍜', spot: '🎡' }
  const categoryLabel = { restaurant: '飲食店', spot: '遊びスポット' }

  const allItems: PlanItem[] = tab === 'restaurants'
    ? restaurants.map((r) => ({ id: r.id, name: r.name, address: r.address, category: 'restaurant', rating: r.rating, photo: r.photos[0], genre: r.genre }))
    : spots.map((s) => ({ id: s.id, name: s.name, address: s.address, category: 'spot', rating: s.rating, photo: s.photos[0], genre: s.genre }))

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#f8fafc] px-4 pt-4 pb-2 space-y-2">
        <h1 className="text-xl font-bold text-gray-900">旅行プラン 🗺</h1>
        <p className="text-xs text-gray-500">行きたい場所を選んでプランを作成しましょう</p>

        <div className="flex gap-2">
          {(['spots', 'restaurants'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                tab === t ? 'bg-sky-400 text-white' : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              {t === 'restaurants' ? '🍜 飲食店' : '🎡 スポット'}
            </button>
          ))}
          {selected.size > 0 && (
            <span className="ml-auto text-xs text-sky-500 font-medium self-center">
              {selected.size}件選択中
            </span>
          )}
        </div>
      </div>

      <div className="px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">読み込み中...</div>
        ) : (
          <>
            {/* Selection list */}
            {!plan && (
              <div className="space-y-2 mb-4">
                {allItems.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-sm">
                    <p>まだデータがありません</p>
                    <Link
                      href={tab === 'restaurants' ? '/restaurants/new' : '/spots/new'}
                      className="text-sky-400 mt-2 block"
                    >
                      追加する →
                    </Link>
                  </div>
                ) : (
                  allItems.map((item) => {
                    const isSelected = selected.has(item.id)
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggle(item.id)}
                        className={[
                          'w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left',
                          isSelected ? 'border-sky-400 bg-sky-50' : 'border-gray-100 bg-white',
                        ].join(' ')}
                      >
                        <div className={[
                          'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                          isSelected ? 'border-sky-400 bg-sky-400' : 'border-gray-300',
                        ].join(' ')}>
                          {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                        </div>
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                          {item.photo ? (
                            <Image src={item.photo} alt={item.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">
                              {categoryIcon[item.category]}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-400">{categoryLabel[item.category]} · {item.genre}</div>
                          <div className="font-bold text-gray-900 text-sm truncate">{item.name}</div>
                          <CarRating rating={item.rating} size="sm" />
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            )}

            {/* Plan result */}
            {plan && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-gray-900">📋 作成されたプラン</h2>
                  <button
                    onClick={() => setPlan(null)}
                    className="text-xs text-sky-400 font-medium"
                  >
                    選び直す
                  </button>
                </div>
                <div className="space-y-2">
                  {plan.map((item, i) => (
                    <div key={item.id} className="flex gap-3">
                      {/* Timeline */}
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-sky-400 text-white flex items-center justify-center text-sm font-bold shrink-0">
                          {i + 1}
                        </div>
                        {i < plan.length - 1 && (
                          <div className="w-0.5 flex-1 bg-sky-200 mt-1 min-h-[16px]" />
                        )}
                      </div>
                      {/* Card */}
                      <Link
                        href={`/${item.category === 'restaurant' ? 'restaurants' : 'spots'}/${item.id}`}
                        className="flex-1 bg-white rounded-2xl p-3 flex gap-3 items-center mb-2 shadow-sm active:scale-95 transition-transform"
                      >
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                          {item.photo ? (
                            <Image src={item.photo} alt={item.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              {categoryIcon[item.category]}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-400">{categoryLabel[item.category]}</div>
                          <div className="font-bold text-gray-900 text-sm truncate">{item.name}</div>
                          <div className="text-xs text-gray-500 truncate flex items-center gap-1">
                            <span>📍</span>{item.address}
                          </div>
                        </div>
                        <span className="text-gray-300 text-lg">›</span>
                      </Link>
                    </div>
                  ))}
                </div>

                <div className="mt-4 bg-sky-50 rounded-2xl p-3 text-xs text-sky-600">
                  💡 スポット → 食事の順で並べました。地図アプリで経路を確認してみてください。
                </div>
              </div>
            )}

            {/* Create plan button */}
            {!plan && selected.size > 0 && (
              <button
                onClick={createPlan}
                className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-sky-400 text-white font-bold px-8 py-3.5 rounded-full shadow-lg active:scale-95 transition-all text-sm whitespace-nowrap"
              >
                🗺 プランを作成 ({selected.size}件)
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
