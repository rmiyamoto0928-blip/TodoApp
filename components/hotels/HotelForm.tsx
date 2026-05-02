'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Hotel, HotelCategory } from '@/lib/types'
import CarRating from '@/components/ui/CarRating'
import VoiceInput from '@/components/ui/VoiceInput'
import AddressLocator from '@/components/ui/AddressLocator'
import MultiImageUpload from '@/components/ui/MultiImageUpload'
import LinksEditor from '@/components/ui/LinksEditor'
import { HOTEL_CATEGORIES } from '@/lib/utils'

type FormData = Omit<Hotel, 'id' | 'createdAt' | 'updatedAt' | 'created_at'>

const defaultForm: FormData = {
  name: '',
  address: '',
  category: 'その他',
  photos: [],
  image_url: '',
  price: 0,
  visitedAt: new Date().toISOString().slice(0, 10),
  comment: '',
  ratingFood: 0,
  ratingBath: 0,
  ratingRoom: 0,
  breakfast: '',
  dinner: '',
  isFavorite: false,
  latitude: null,
  longitude: null,
  links: [],
  memo: '',
}

const COMMENT_TEMPLATES = [
  'また泊まりたい！',
  '部屋が広くて快適',
  '温泉が最高',
  '食事が豪華',
  'スタッフが親切',
  'コスパ良し',
  'アクセスが便利',
  '少し古かった',
]

export default function HotelForm({ initial }: { initial?: Hotel }) {
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
      const url = initial ? `/api/hotels/${initial.id}` : '/api/hotels'
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
      router.push('/hotels')
      router.refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setSubmitError(msg)
      console.error('[hotel submit]', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-6">
      {/* Name */}
      <div className="space-y-1">
        <label className="text-sm font-semibold text-gray-700">ホテル名 *</label>
        <div className="flex gap-2">
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="例：箱根温泉 山の宿"
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
        placeholder="例：神奈川県箱根町"
      />

      {/* Category */}
      <div className="space-y-1">
        <label className="text-sm font-semibold text-gray-700">カテゴリ</label>
        <div className="flex flex-wrap gap-1.5">
          {HOTEL_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => set('category', c as HotelCategory)}
              className={[
                'text-xs px-3 py-1.5 rounded-full font-medium transition-all active:scale-95',
                form.category === c ? 'bg-sky-400 text-white' : 'bg-white text-gray-500 border border-gray-200',
              ].join(' ')}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* 行った日 */}
      <div className="space-y-1">
        <label className="text-sm font-semibold text-gray-700">🗓 行った日</label>
        <input
          type="date"
          value={form.visitedAt}
          onChange={(e) => set('visitedAt', e.target.value)}
          className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
        />
      </div>

      {/* 金額メモ — replaces the dedicated price input */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">💰 金額メモ</label>
        <textarea
          value={form.memo ?? ''}
          onChange={(e) => set('memo', e.target.value)}
          placeholder={'例：\n素泊まり 12000円\n夕食 5000円\n駐車場 1000円'}
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none"
        />
      </div>

      {/* Sub-ratings */}
      <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-gray-700">🚗 詳細評価</h3>
        {([
          { key: 'ratingFood', icon: '🍽', label: 'ご飯' },
          { key: 'ratingBath', icon: '🛁', label: 'お風呂' },
          { key: 'ratingRoom', icon: '🛏', label: '部屋' },
        ] as const).map(({ key, icon, label }) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-16 shrink-0">{icon} {label}</span>
            <CarRating
              rating={form[key]}
              interactive
              onChange={(v) => set(key, v)}
            />
          </div>
        ))}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-gray-700">🌅 朝ごはん内容</label>
        <input
          value={form.breakfast}
          onChange={(e) => set('breakfast', e.target.value)}
          placeholder="例：和洋バイキング、ご当地料理"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-gray-700">🌙 夜ごはん内容</label>
        <input
          value={form.dinner}
          onChange={(e) => set('dinner', e.target.value)}
          placeholder="例：懐石料理、BBQ"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
        />
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

      {/* Photos — up to 5 */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">📷 写真（最大5枚）</label>
        <MultiImageUpload photos={form.photos} onChange={(p) => set('photos', p)} />
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
