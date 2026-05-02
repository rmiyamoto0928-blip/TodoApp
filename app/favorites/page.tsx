'use client'

import { useState, useEffect, useCallback } from 'react'
import { Restaurant, Hotel, Spot } from '@/lib/types'
import RestaurantCard from '@/components/restaurants/RestaurantCard'
import HotelCard from '@/components/hotels/HotelCard'
import SpotCard from '@/components/spots/SpotCard'
import SearchBar from '@/components/ui/SearchBar'
import { searchFilter } from '@/lib/utils'

type Tab = 'all' | 'restaurants' | 'hotels' | 'spots'

export default function FavoritesPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [spots, setSpots] = useState<Spot[]>([])
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<Tab>('all')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    // Defensive: any single API may return `{error: ...}` (e.g. table missing).
    // Treat non-arrays as empty so the page still renders for the others.
    const safe = async <T,>(url: string): Promise<T[]> => {
      try {
        const res = await fetch(url)
        const data = await res.json().catch(() => null)
        return Array.isArray(data) ? (data as T[]) : []
      } catch {
        return []
      }
    }
    const [r, h, s] = await Promise.all([
      safe<Restaurant>('/api/restaurants'),
      safe<Hotel>('/api/hotels'),
      safe<Spot>('/api/spots'),
    ])
    setRestaurants(r.filter((x) => x.isFavorite))
    setHotels(h.filter((x) => x.isFavorite))
    setSpots(s.filter((x) => x.isFavorite))
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const toggleRestaurantFav = async (id: string) => {
    const item = restaurants.find((r) => r.id === id)
    if (!item) return
    const updated = { ...item, isFavorite: false }
    await fetch(`/api/restaurants/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    setRestaurants((prev) => prev.filter((r) => r.id !== id))
  }

  const toggleHotelFav = async (id: string) => {
    const item = hotels.find((h) => h.id === id)
    if (!item) return
    const updated = { ...item, isFavorite: false }
    await fetch(`/api/hotels/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    setHotels((prev) => prev.filter((h) => h.id !== id))
  }

  const toggleSpotFav = async (id: string) => {
    const item = spots.find((s) => s.id === id)
    if (!item) return
    const updated = { ...item, isFavorite: false }
    await fetch(`/api/spots/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    setSpots((prev) => prev.filter((s) => s.id !== id))
  }

  const filteredRestaurants = searchFilter(restaurants, search)
  const filteredHotels = searchFilter(hotels, search)
  const filteredSpots = searchFilter(spots, search)

  const total = filteredRestaurants.length + filteredHotels.length + filteredSpots.length

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'all', label: 'すべて', count: total },
    { key: 'restaurants', label: '飲食店', count: filteredRestaurants.length },
    { key: 'hotels', label: 'ホテル', count: filteredHotels.length },
    { key: 'spots', label: 'スポット', count: filteredSpots.length },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-40 bg-[#f8fafc] px-4 pt-4 pb-2 space-y-2">
        <h1 className="text-xl font-bold text-gray-900">お気に入り ♥</h1>
        <SearchBar value={search} onChange={setSearch} placeholder="名前・地名で検索" />

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={[
                'shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all',
                tab === t.key ? 'bg-sky-400 text-white' : 'bg-white text-gray-500 border border-gray-200',
              ].join(' ')}
            >
              {t.label} {t.count > 0 && `(${t.count})`}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">読み込み中...</div>
        ) : total === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <span className="text-5xl">♡</span>
            <p className="text-sm">お気に入りがまだありません</p>
            <p className="text-xs text-gray-300">♡ボタンでお気に入り登録できます</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(tab === 'all' || tab === 'restaurants') && filteredRestaurants.length > 0 && (
              <div>
                {tab === 'all' && (
                  <h2 className="text-sm font-bold text-gray-600 mb-2">🍜 飲食店</h2>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {filteredRestaurants.map((item) => (
                    <RestaurantCard key={item.id} item={item} onFavoriteToggle={toggleRestaurantFav} />
                  ))}
                </div>
              </div>
            )}

            {(tab === 'all' || tab === 'hotels') && filteredHotels.length > 0 && (
              <div>
                {tab === 'all' && (
                  <h2 className="text-sm font-bold text-gray-600 mb-2">🏨 ホテル</h2>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {filteredHotels.map((item) => (
                    <HotelCard key={item.id} item={item} onFavoriteToggle={toggleHotelFav} />
                  ))}
                </div>
              </div>
            )}

            {(tab === 'all' || tab === 'spots') && filteredSpots.length > 0 && (
              <div>
                {tab === 'all' && (
                  <h2 className="text-sm font-bold text-gray-600 mb-2">🎡 遊びスポット</h2>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {filteredSpots.map((item) => (
                    <SpotCard key={item.id} item={item} onFavoriteToggle={toggleSpotFav} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
