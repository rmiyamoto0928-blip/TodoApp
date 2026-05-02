'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Plan } from '@/lib/types'
import FavoriteButton from '@/components/ui/FavoriteButton'
import MapEmbed from '@/components/ui/MapEmbed'
import LinksDisplay from '@/components/ui/LinksDisplay'
import { formatDate } from '@/lib/utils'

export default function PlanDetail({ item: initial }: { item: Plan }) {
  const router = useRouter()
  const [item, setItem] = useState(initial)
  const [deleting, setDeleting] = useState(false)

  const toggleFav = async () => {
    const updated = { ...item, isFavorite: !item.isFavorite }
    await fetch(`/api/plans/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    setItem(updated)
  }

  const handleDelete = async () => {
    if (!confirm('削除しますか？')) return
    setDeleting(true)
    await fetch(`/api/plans/${item.id}`, { method: 'DELETE' })
    router.push('/plans')
    router.refresh()
  }

  return (
    <div className="pb-8">
      <div className="relative bg-gray-100 aspect-[16/9]">
        {item.image_url ? (
          <Image src={item.image_url} alt={item.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl text-gray-200">🗺</div>
        )}
      </div>

      <div className="px-4 pt-4 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900 flex-1">{item.name}</h1>
          <FavoriteButton isFavorite={item.isFavorite} onToggle={toggleFav} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '📍', label: '場所', value: item.address },
            { icon: '🗓', label: '予定日', value: formatDate(item.scheduledAt) },
          ].filter((r) => r.value).map((row) => (
            <div key={row.label} className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <span>{row.icon}</span>{row.label}
              </div>
              <div className="text-sm font-medium text-gray-800 mt-0.5">{row.value}</div>
            </div>
          ))}
        </div>

        {item.description && (
          <div className="bg-gray-50 rounded-2xl p-4">
            <h2 className="text-sm font-bold text-gray-700 mb-1">📝 内容</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{item.description}</p>
          </div>
        )}

        {item.comment && (
          <div className="bg-gray-50 rounded-2xl p-4">
            <h2 className="text-sm font-bold text-gray-700 mb-1">💬 メモ</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{item.comment}</p>
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
          <Link
            href={`/plans/${item.id}/edit`}
            className="flex-1 py-3 bg-sky-400 text-white font-bold rounded-2xl text-center text-sm"
          >
            編集する
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-3 bg-red-100 text-red-500 font-bold rounded-2xl text-sm disabled:opacity-60"
          >
            削除する
          </button>
        </div>
      </div>
    </div>
  )
}
