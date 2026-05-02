'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Spot, SpotGenre } from '@/lib/types'
import CarRating from '@/components/ui/CarRating'
import VoiceInput from '@/components/ui/VoiceInput'
import AddressLocator from '@/components/ui/AddressLocator'
import SingleImageUpload from '@/components/ui/SingleImageUpload'
import LinksEditor from '@/components/ui/LinksEditor'
import { SPOT_GENRES } from '@/lib/utils'

type FormData = Omit<Spot, 'id' | 'createdAt' | 'updatedAt' | 'created_at'>

const defaultForm: FormData = {
  name: '',
  address: '',
  genre: 'その他',
  photos: [],
  image_url: '',
  price: 0,
  rating: 0,
  visitedAt: new Date().toISOString().slice(0, 10),
  comment: '',
  isFavorite: false,
  latitude: null,
  longitude: null,
  links: [],
}

const COMMENT_TEMPLATES = [
  'また行きたい！',
  '景色が最高',
  '子供も楽しめた',
  '混んでたけど楽しかった',
  '空いていてゆっくりできた',
  '思ったより良かった',
  'コスパ最高',
  '少し期待外れ',
]

export default function SpotForm({ initial }: { initial?: Spot }) {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(initial ? { ...initial } : defaultForm)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const set = (key: keyof FormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const appendComment = (text: string) => {
    set('comment', form.comment ? form.comment + '。' + text : text)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSubmitError(null)
    setSaving(true)
    try {
      const url = initial ? `/api/spots/${initial.id}` : '/api/spots'
      const method = initial ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error || `request failed (${res.status})`)
      }
      router.push('/spots')
      router.refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setSubmitError(msg)
      console.error('[spot submit]', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-6">
      {/* Name */}
      <div className="space-y-1">
        <label className="text-sm font-semibold text-gray-700">場所名 *</label>
        <div className="flex gap-2">
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="例：東京ディズニーランド"
            required
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
          />
          <VoiceInput onResult={(t) => set('name', t)} />
        </div>
      </div>

      <AddressLocator
        address={form.address}
        latitude={form.latitude}
        longitude={form.longitude}
        onChange={({ address, latitude, longitude }) =>
          setForm((prev) => ({ ...prev, address, latitude, longitude }))
        }
        placeholder="例：千葉県浦安市"
      />

      {/* Genre */}
      <div className="space-y-1">
        <label className="text-sm font-semibold text-gray-700">ジャンル</label>
        <div className="flex flex-wrap gap-1.5">
          {SPOT_GENRES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => set('genre', g as SpotGenre)}
              className={[
                'text-xs px-3 py-1.5 rounded-full font-medium transition-all active:scale-95',
                form.genre === g ? 'bg-sky-400 text-white' : 'bg-white text-gray-500 border border-gray-200',
              ].join(' ')}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Price & Date */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">💴 金額（円）</label>
          <input
            type="number"
            value={form.price || ''}
            onChange={(e) => set('price', Number(e.target.value))}
            min={0}
            placeholder="2000"
            className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">🗓 行った日</label>
          <input
            type="date"
            value={form.visitedAt}
            onChange={(e) => set('visitedAt', e.target.value)}
            className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
          />
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">🚗 総合評価</label>
        <CarRating rating={form.rating} size="lg" interactive onChange={(v) => set('rating', v)} />
        <p className="text-xs text-gray-400">
          {form.rating === 0 ? 'タップして評価' : ['', 'また来ないかな', 'まあまあ', '良かった', 'また行きたい', '最高！'][form.rating]}
        </p>
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">💬 感想</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {COMMENT_TEMPLATES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => appendComment(t)}
              className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full active:scale-95 transition-all"
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <textarea
            value={form.comment}
            onChange={(e) => set('comment', e.target.value)}
            placeholder="感想を自由に入力..."
            rows={3}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none"
          />
          <VoiceInput onResult={(t) => set('comment', form.comment ? form.comment + '。' + t : t)} />
        </div>
      </div>

      {/* Photo */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">📷 写真</label>
        <SingleImageUpload imageUrl={form.image_url ?? ''} onChange={(url) => set('image_url', url)} />
      </div>

      {/* Links */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">🔗 公式サイト・SNS</label>
        <LinksEditor links={form.links ?? []} onChange={(l) => set('links', l)} />
      </div>

      {/* Favorite */}
      <div className="flex items-center gap-3 py-1">
        <label className="text-sm font-semibold text-gray-700">お気に入り</label>
        <button
          type="button"
          onClick={() => set('isFavorite', !form.isFavorite)}
          className={`text-2xl transition-all duration-200 ${form.isFavorite ? 'text-red-400' : 'text-gray-300'}`}
        >
          {form.isFavorite ? '♥' : '♡'}
        </button>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full py-4 bg-sky-400 text-white font-bold rounded-2xl text-base shadow-md active:scale-95 transition-all disabled:opacity-60"
      >
        {saving ? '保存中...' : initial ? '更新する' : '追加する'}
      </button>
      {submitError && (
        <p className="text-sm text-red-500 text-center break-all">{submitError}</p>
      )}
    </form>
  )
}
