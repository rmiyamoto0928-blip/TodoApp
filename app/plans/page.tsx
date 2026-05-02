'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plan } from '@/lib/types'
import PlanCard from '@/components/plans/PlanCard'
import SearchBar from '@/components/ui/SearchBar'

export default function PlansPage() {
  const [items, setItems] = useState<Plan[]>([])
  const [search, setSearch] = useState('')
  const [favOnly, setFavOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Defensive: the API may return `{error: ...}` when the plans table doesn't
  // exist yet (migration 002 not applied). Only set items if we actually got an
  // array; otherwise surface the error and keep items as [] so the page renders.
  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/plans')
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        const msg = (data && typeof data === 'object' && 'error' in data ? (data as { error?: string }).error : null)
          || `request failed (${res.status})`
        setLoadError(msg)
        setItems([])
        return
      }
      if (Array.isArray(data)) {
        setItems(data as Plan[])
        setLoadError(null)
      } else {
        setLoadError('予期しないレスポンス形式です')
        setItems([])
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : String(err))
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const toggleFavorite = async (id: string) => {
    const item = items.find((p) => p.id === id)
    if (!item) return
    const updated = { ...item, isFavorite: !item.isFavorite }
    await fetch(`/api/plans/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    setItems((prev) => prev.map((p) => (p.id === id ? updated : p)))
  }

  let filtered = items
  if (search.trim()) {
    const q = search.toLowerCase()
    filtered = filtered.filter(
      (p) => p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q)
    )
  }
  if (favOnly) filtered = filtered.filter((p) => p.isFavorite)

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-40 bg-[#f8fafc] px-4 pt-4 pb-2 space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">マイ プラン 🗺</h1>
          <Link
            href="/plans/new"
            className="bg-sky-400 text-white text-sm font-bold px-4 py-2 rounded-2xl shadow-sm active:scale-95 transition-transform"
          >
            ＋ 追加
          </Link>
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="プラン名・場所で検索" />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFavOnly(!favOnly)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
              favOnly ? 'bg-red-400 text-white' : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            ♥ お気に入り
          </button>
          <Link
            href="/plan"
            className="shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all bg-white text-gray-500 border border-gray-200"
          >
            🛠 自動プラン作成へ
          </Link>
        </div>
      </div>

      <div className="px-4 pb-4">
        {loadError && (
          <div className="my-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs break-all">
            データの取得に失敗しました: {loadError}
            <div className="mt-1 text-red-400">
              （`plans` テーブル未作成の場合は migrations/002_unify_categories.sql を Neon で実行してください）
            </div>
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">読み込み中...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <span className="text-5xl">🗺</span>
            <p className="text-sm">{items.length === 0 ? 'まだプランがありません' : '条件に合うプランがありません'}</p>
            {items.length === 0 && (
              <Link href="/plans/new" className="text-sky-400 text-sm font-medium">
                最初のプランを追加 →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filtered.map((item) => (
              <PlanCard key={item.id} item={item} onFavoriteToggle={toggleFavorite} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
