'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Restaurant, RestaurantGenre } from '@/lib/types'
import CarRating from '@/components/ui/CarRating'
import ImageUpload from '@/components/ui/ImageUpload'
import VoiceInput from '@/components/ui/VoiceInput'
import { RESTAURANT_GENRES } from '@/lib/utils'

type FormData = Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'>

const defaultForm: FormData = {
  name: '',
  address: '',
  hours: '',
  openDays: '',
  genre: 'その他',
  foods: [],
  photos: [],
  price: 0,
  rating: 0,
  visitedAt: new Date().toISOString().slice(0, 10),
  comment: '',
  isFavorite: false,
}

const COMMENT_TEMPLATES = [
  'また来たい！',
  '雰囲気が最高',
  'コスパ良し',
  '量が多くて大満足',
  'スープが絶品',
  '接客が丁寧',
  'ボリューム満点',
  '少し残念だった',
]

const FOOD_SUGGESTIONS: Record<string, string[]> = {
  'ラーメン': ['チャーシューラーメン', '味噌ラーメン', '醤油ラーメン', '塩ラーメン', '替え玉'],
  '焼肉': ['カルビ', 'ロース', 'ハラミ', 'タン塩', 'ホルモン'],
  'カフェ': ['カフェラテ', 'アイスコーヒー', 'パンケーキ', 'スイーツ', 'サンドイッチ'],
  '居酒屋': ['枝豆', '唐揚げ', '刺し盛り', '焼き鳥', 'ビール'],
  '寿司': ['サーモン', 'マグロ', 'ウニ', 'イクラ', 'エビ'],
  'その他': ['メイン料理', 'サイドメニュー', 'ドリンク', 'デザート'],
}

interface RestaurantFormProps {
  initial?: Restaurant
}

export default function RestaurantForm({ initial }: RestaurantFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(initial ? { ...initial } : defaultForm)
  const [foodInput, setFoodInput] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (key: keyof FormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const addFood = (food?: string) => {
    const f = food ?? foodInput.trim()
    if (!f) return
    if (!form.foods.includes(f)) set('foods', [...form.foods, f])
    if (!food) setFoodInput('')
  }

  const removeFood = (i: number) => set('foods', form.foods.filter((_, idx) => idx !== i))

  const appendComment = (text: string) => {
    set('comment', form.comment ? form.comment + '。' + text : text)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const url = initial ? `/api/restaurants/${initial.id}` : '/api/restaurants'
      const method = initial ? 'PUT' : 'POST'
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      router.push('/restaurants')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  const suggestions = FOOD_SUGGESTIONS[form.genre] ?? FOOD_SUGGESTIONS['その他']

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-6">
      {/* Name */}
      <div className="space-y-1">
        <label className="text-sm font-semibold text-gray-700">店名 *</label>
        <div className="flex gap-2">
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="例：麺処 山田"
            required
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
          />
          <VoiceInput onResult={(t) => set('name', t)} />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-1">
        <label className="text-sm font-semibold text-gray-700">住所・最寄り駅</label>
        <div className="flex gap-2">
          <input
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
            placeholder="例：東京都渋谷区、渋谷駅近く"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
          />
          <VoiceInput onResult={(t) => set('address', t)} />
        </div>
      </div>

      {/* Genre */}
      <div className="space-y-1">
        <label className="text-sm font-semibold text-gray-700">ジャンル</label>
        <div className="flex flex-wrap gap-1.5">
          {RESTAURANT_GENRES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => set('genre', g as RestaurantGenre)}
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

      {/* Foods */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">食べたもの</label>
        {form.foods.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {form.foods.map((f, i) => (
              <span key={i} className="flex items-center gap-1 bg-sky-50 text-sky-600 text-xs px-2 py-1 rounded-full">
                {f}
                <button type="button" onClick={() => removeFood(i)} className="text-sky-400 hover:text-red-400">×</button>
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-1">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addFood(s)}
              disabled={form.foods.includes(s)}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg disabled:opacity-40 active:scale-95 transition-all"
            >
              + {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={foodInput}
            onChange={(e) => setFoodInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFood() } }}
            placeholder="その他を入力..."
            className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
          />
          <button type="button" onClick={() => addFood()} className="px-4 py-2.5 bg-sky-400 text-white rounded-xl text-sm font-medium">追加</button>
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
            placeholder="1200"
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

      {/* Hours & Days (collapsed section) */}
      <details className="bg-gray-50 rounded-xl">
        <summary className="px-4 py-3 text-sm text-gray-500 cursor-pointer select-none">
          営業時間・営業日（任意）
        </summary>
        <div className="px-4 pb-3 grid grid-cols-2 gap-3">
          <input
            value={form.hours}
            onChange={(e) => set('hours', e.target.value)}
            placeholder="11:00〜22:00"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
          />
          <input
            value={form.openDays}
            onChange={(e) => set('openDays', e.target.value)}
            placeholder="月〜金"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
          />
        </div>
      </details>

      {/* Rating */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">🚗 総合評価</label>
        <CarRating rating={form.rating} size="lg" interactive onChange={(v) => set('rating', v)} />
        <p className="text-xs text-gray-400">
          {form.rating === 0 ? 'タップして評価' : ['', '行くなら他を選ぶ', 'まあまあ', '良かった', 'また行きたい', '最高！'][form.rating]}
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

      {/* Photos */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">📷 写真</label>
        <ImageUpload photos={form.photos} onChange={(p) => set('photos', p)} />
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
    </form>
  )
}
