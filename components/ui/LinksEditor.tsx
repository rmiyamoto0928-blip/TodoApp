'use client'

import { useState } from 'react'

interface LinksEditorProps {
  links: string[]
  onChange: (links: string[]) => void
}

/**
 * Editable list of URLs (homepage / SNS / 食べログ / etc.).
 * Each row is a URL input with a remove button. "+ 追加" appends a row.
 * Used by every form so the UX is identical across categories.
 */
export default function LinksEditor({ links, onChange }: LinksEditorProps) {
  const [draft, setDraft] = useState('')

  const addDraft = () => {
    const v = draft.trim()
    if (!v) return
    onChange([...links, v])
    setDraft('')
  }

  const updateAt = (i: number, value: string) => {
    onChange(links.map((l, idx) => (idx === i ? value : l)))
  }

  const removeAt = (i: number) => {
    onChange(links.filter((_, idx) => idx !== i))
  }

  // A small heuristic for the icon next to each URL — purely decorative.
  const iconFor = (url: string): string => {
    const u = url.toLowerCase()
    if (u.includes('instagram')) return '📷'
    if (u.includes('twitter') || u.includes('x.com')) return '🐦'
    if (u.includes('facebook')) return '📘'
    if (u.includes('youtube')) return '▶️'
    if (u.includes('tabelog')) return '🍴'
    if (u.includes('tiktok')) return '🎵'
    if (u.includes('line.me')) return '💬'
    return '🔗'
  }

  return (
    <div className="space-y-2">
      {links.length > 0 && (
        <div className="space-y-1.5">
          {links.map((link, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-sm shrink-0">{iconFor(link)}</span>
              <input
                type="url"
                value={link}
                onChange={(e) => updateAt(i, e.target.value)}
                placeholder="https://..."
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label="削除"
                className="text-gray-300 hover:text-red-400 text-lg leading-none px-2"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="url"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addDraft()
            }
          }}
          placeholder="ホームページや SNS の URL"
          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
        />
        <button
          type="button"
          onClick={addDraft}
          className="px-4 py-2 bg-sky-400 text-white rounded-xl text-sm font-medium active:scale-95 transition-all"
        >
          追加
        </button>
      </div>
    </div>
  )
}
