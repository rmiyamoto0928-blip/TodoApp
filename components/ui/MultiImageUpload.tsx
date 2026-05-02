'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { upload } from '@vercel/blob/client'

interface MultiImageUploadProps {
  photos: string[]
  onChange: (photos: string[]) => void
  maxPhotos?: number
}

/**
 * Multi-image uploader (up to maxPhotos, default 5). Each file streams directly
 * to Vercel Blob via the client-upload flow — sidesteps the 4.5MB function
 * payload limit. Photos are appended in upload order; tap × on a thumbnail
 * to remove. The first photo (photos[0]) is what the server stores in the
 * `image_url` column for back-compat with cards / list view.
 */
export default function MultiImageUpload({ photos, onChange, maxPhotos = 5 }: MultiImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const remaining = Math.max(0, maxPhotos - photos.length)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // IMPORTANT: snapshot the FileList into a plain array BEFORE clearing the
    // input. iOS Safari nullifies the live FileList the moment we set value=''.
    const fileArray = e.target.files ? Array.from(e.target.files) : []
    e.target.value = ''
    if (fileArray.length === 0) return
    setError(null)
    setUploading(true)

    // Allow multi-select but cap at remaining slots.
    const toUpload = fileArray.slice(0, remaining)
    const uploaded: string[] = []
    try {
      for (const file of toUpload) {
        const blob = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: '/api/upload',
          contentType: file.type,
        })
        uploaded.push(blob.url)
      }
      onChange([...photos, ...uploaded])
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      console.error('[image upload]', err)
      // Still surface anything that did succeed before the error.
      if (uploaded.length > 0) onChange([...photos, ...uploaded])
    } finally {
      setUploading(false)
    }
  }

  const removeAt = (i: number) => {
    onChange(photos.filter((_, idx) => idx !== i))
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        {photos.map((url, i) => (
          <div key={`${url}-${i}`} className="relative w-24 h-24 rounded-xl overflow-hidden shadow-sm">
            <Image src={url} alt={`写真${i + 1}`} fill className="object-cover" sizes="96px" />
            {i === 0 && (
              <span className="absolute top-1 left-1 bg-sky-400 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                メイン
              </span>
            )}
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none"
              aria-label={`写真${i + 1}を削除`}
            >
              ×
            </button>
          </div>
        ))}
        {photos.length < maxPhotos && (
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
                <span className="text-xs mt-0.5">写真を追加</span>
              </>
            )}
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      <p className="text-xs text-gray-400">
        {photos.length} / {maxPhotos} 枚
        {photos.length > 0 && '（先頭の写真がカード一覧に表示されます）'}
      </p>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
