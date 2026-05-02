'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plan } from '@/lib/types'
import VoiceInput from '@/components/ui/VoiceInput'
import AddressLocator from '@/components/ui/AddressLocator'
import SingleImageUpload from '@/components/ui/SingleImageUpload'
import LinksEditor from '@/components/ui/LinksEditor'

type FormData = Omit<Plan, 'id' | 'createdAt' | 'updatedAt' | 'created_at'>

const defaultForm: FormData = {
  name: '',
  description: '',
  address: '',
  image_url: '',
  comment: '',
  scheduledAt: '',
  isFavorite: false,
  latitude: null,
  longitude: null,
  links: [],
  memo: '',
}

export default function PlanForm({ initial }: { initial?: Plan }) {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(initial ? { ...initial } : defaultForm)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const set = (key: keyof FormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSubmitError(null)
    setSaving(true)
    try {
      const url = initial ? `/api/plans/${initial.id}` : '/api/plans'
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
      router.push('/plans')
      router.refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setSubmitError(msg)
      console.error('[plan submit]', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-6">
      <div className="space-y-1">
        <label className="text-sm font-semibold text-gray-700">プラン名 *</label>
        <div className="flex gap-2">
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="例：箱根日帰り温泉プラン"
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

      <div className="space-y-1">
        <label className="text-sm font-semibold text-gray-700">📝 内容</label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="行程・行きたい場所・やりたいこと"
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-gray-700">🗓 予定日</label>
        <input
          type="date"
          value={form.scheduledAt}
          onChange={(e) => set('scheduledAt', e.target.value)}
          className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">💬 メモ</label>
        <div className="flex gap-2">
          <textarea
            value={form.comment}
            onChange={(e) => set('comment', e.target.value)}
            placeholder="補足メモ"
            rows={2}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none"
          />
          <VoiceInput onResult={(t) => set('comment', form.comment ? form.comment + '。' + t : t)} />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">📷 写真</label>
        <SingleImageUpload imageUrl={form.image_url} onChange={(url) => set('image_url', url)} />
      </div>

      {/* Links */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">🔗 関連リンク</label>
        <LinksEditor links={form.links ?? []} onChange={(l) => set('links', l)} />
      </div>

      {/* Memo — itemized budget etc. */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">💰 金額メモ</label>
        <textarea
          value={form.memo ?? ''}
          onChange={(e) => set('memo', e.target.value)}
          placeholder={'例：\n交通費 5000円\n宿泊費 12000円\n食費 8000円'}
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none"
        />
      </div>

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
