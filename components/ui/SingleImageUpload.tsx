'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'

interface SingleImageUploadProps {
  imageUrl: string
  onChange: (url: string) => void
}

/**
 * Single-image uploader. Streams the file body to /api/upload (which forwards
 * to Vercel Blob `put()`), then stores the returned `blob.url` as a single
 * string. Used by all forms (restaurants/hotels/spots/plans) so the upload
 * path is identical everywhere.
 */
export default function SingleImageUpload({ imageUrl, onChange }: SingleImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        headers: { 'content-type': file.type },
        body: file,
      })
      if (!res.ok) {
        const msg = await res.text().catch(() => '')
        throw new Error(`upload failed (${res.status}) ${msg}`)
      }
      const blob = (await res.json()) as { url?: string; error?: string }
      if (!blob.url) throw new Error(blob.error || 'upload returned no url')
      onChange(blob.url)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      console.error('[image upload]', err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        {imageUrl ? (
          <div className="relative w-24 h-24 rounded-xl overflow-hidden shadow-sm">
            <Image src={imageUrl} alt="プレビュー" fill className="object-cover" sizes="96px" />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none"
              aria-label="写真を削除"
            >
              ×
            </button>
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-24 h-24 rounded-xl border-2 border-dashed border-sky-300 flex flex-col items-center justify-center text-sky-400 hover:bg-sky-50 transition-colors disabled:opacity-60"
        >
          {uploading ? (
            <span className="text-xs">アップロード中…</span>
          ) : (
            <>
              <span className="text-2xl">+</span>
              <span className="text-xs mt-0.5">{imageUrl ? '差し替え' : '写真を追加'}</span>
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
