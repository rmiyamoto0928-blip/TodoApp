'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Restaurant, SortOption } from '@/lib/types'
import RestaurantCard from '@/components/restaurants/RestaurantCard'
import SearchBar from '@/components/ui/SearchBar'
import FilterTags from '@/components/ui/FilterTags'
import SortDropdown from '@/components/ui/SortDropdown'
import RecommendCard from '@/components/ui/RecommendCard'
import { sortRestaurants, searchFilter, RESTAURANT_GENRES } from '@/lib/utils'

export default function RestaurantsPage() {
  const [items, setItems] = useState<Restaurant[]>([])
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('date-desc')
  const [genres, setGenres] = useState<string[]>([])
  const [rankMode, setRankMode] = useState(false)
  const [favOnly, setFavOnly] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await fetch('/api/restaurants')
    setItems(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const toggleFavorite = async (id: string) => {
    const item = items.find((r) => r.id === id)
    if (!item) return
    const updated = { ...item, isFavorite: !item.isFavorite }
    await fetch(`/api/restaurants/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    setItems((prev) => prev.map((r) => (r.id === id ? updated : r)))
  }

  let filtered = searchFilter(items, search)
  if (genres.length > 0) filtered = filtered.filter((r) => genres.includes(r.genre))
  if (favOnly) filtered = filtered.filter((r) => r.isFavorite)
  const sorted = sortRestaurants(filtered, rankMode ? 'rating-desc' : sort)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#f8fafc] px-4 pt-4 pb-2 space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">飲食店 🍜</h1>
          <Link
            href="/restaurants/new"
            className="bg-sky-400 text-white text-sm font-bold px-4 py-2 rounded-2xl shadow-sm active:scale-95 transition-transform"
          >
            ＋ 追加
          </Link>
        </div>
        <SearchBar value={search} onChange={setSearch} />

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setRankMode(!rankMode)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
              rankMode ? 'bg-yellow-400 text-yellow-900' : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            🏆 ランキング
          </button>
          <button
            onClick={() => setFavOnly(!favOnly)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
              favOnly ? 'bg-red-400 text-white' : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            ♥ お気に入り
          </button>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
              genres.length > 0 ? 'bg-sky-400 text-white' : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            🏷 ジャンル{genres.length > 0 ? ` (${genres.length})` : ''}
          </button>
          {!rankMode && <SortDropdown value={sort} onChange={setSort} />}
        </div>

        {showFilter && (
          <FilterTags genres={RESTAURANT_GENRES} selected={genres} onChange={setGenres} />
        )}
      </div>

      {/* Recommend */}
      {!search && genres.length === 0 && !favOnly && !rankMode && items.length > 0 && (
        <div className="pt-2">
          <RecommendCard />
        </div>
      )}

      {/* List */}
      <div className="px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">読み込み中...</div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <span className="text-5xl">🍜</span>
            <p className="text-sm">{items.length === 0 ? 'まだ記録がありません' : '条件に合う店がありません'}</p>
            {items.length === 0 && (
              <Link href="/restaurants/new" className="text-sky-400 text-sm font-medium">
                最初の飲食店を追加 →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {sorted.map((item, i) => (
              <RestaurantCard
                key={item.id}
                item={item}
                rank={rankMode ? i + 1 : undefined}
                onFavoriteToggle={toggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
