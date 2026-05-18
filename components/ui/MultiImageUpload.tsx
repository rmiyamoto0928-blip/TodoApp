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
 * Heuristic for "this looks like a HEIC/HEIF file".
 *
 * iOS sometimes hands us a File with empty `type` (especially when picked via
 * "Photos" app rather than "Camera"), so we also check the extension.
 */
function isHeicFile(file: File): boolean {
  if (file.type === 'image/heic' || file.type === 'image/heif') return true
  return /\.(heic|heif)$/i.test(file.name)
}

/**
 * Convert HEIC/HEIF → JPEG entirely in the browser using heic2any. Lazy-loaded
 * so the WASM/decoder isn't shipped to users who never touch HEIC files.
 */
async function heicToJpeg(file: File): Promise<File> {
  const { default: heic2any } = await import('heic2any')
  const out = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 })
  // heic2any returns Blob | Blob[] (multi-image HEIC sequences). Take the first.
  const blob = Array.isArray(out) ? out[0] : out
  const jpegName = file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg')
  return new File([blob], jpegName, { type: 'image/jpeg' })
}

/**
 * Multi-image uploader (up to maxPhotos, default 5). Each file streams directly
 * to Vercel Blob via the client-upload flow — sidesteps the 4.5MB function
 * payload limit. HEIC files are transparently converted to JPEG in the browser
 * before upload so the saved file works on every device.
 *
 * Photos are appended in upload order; tap × on a thumbnail to remove. The
 * first photo (photos[0]) is what the server stores in the `image_url` column
 * for back-compat with cards / list view.
 */
export default function MultiImageUpload({ photos, onChange, maxPhotos = 5 }: MultiImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<'idle' | 'converting' | 'uploading'>('idle')
  const [error, setError] = useState<string | null>(null)

  const busy = phase !== 'idle'
  const remaining = Math.max(0, maxPhotos - photos.length)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // IMPORTANT: snapshot the FileList into a plain array BEFORE clearing the
    // input. iOS Safari nullifies the live FileList the moment we set value=''.
    const fileArray = e.target.files ? Array.from(e.target.files) : []
    e.target.value = ''
    if (fileArray.length === 0) return
    setError(null)

    const toUpload = fileArray.slice(0, remaining)
    const uploaded: string[] = []
    try {
      for (const original of toUpload) {
        let file = original
        if (isHeicFile(original)) {
          setPhase('converting')
          file = await heicToJpeg(original)
        }

        setPhase('uploading')
        // 90s timeout — HEIC conversion + big-photo upload from cellular can
        // be slow on iPhone. Surfaces a clear error instead of an infinite spinner.
        const timeoutMs = 90_000
        const blob = await Promise.race<{ url: string }>([
          upload(file.name, file, {
            access: 'public',
            handleUploadUrl: '/api/upload',
            contentType: file.type,
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('upload timed out after 90s')), timeoutMs)
          ),
        ])
        uploaded.push(blob.url)
      }
      onChange([...photos, ...uploaded])
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      console.error('[image upload]', err)
      if (uploaded.length > 0) onChange([...photos, ...uploaded])
    } finally {
      setPhase('idle')
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
            disabled={busy}
            className="w-24 h-24 rounded-xl border-2 border-dashed border-sky-300 flex flex-col items-center justify-center text-sky-400 hover:bg-sky-50 transition-colors disabled:opacity-60"
          >
            {phase === 'converting' ? (
              <span className="text-[11px] text-center leading-tight">HEIC<br />変換中…</span>
            ) : phase === 'uploading' ? (
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
          accept="image/*,.heic,.heif"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      <p className="text-xs text-gray-400">
        {photos.length} / {maxPhotos} 枚
        {photos.length > 0 && '（先頭の写真がカード一覧に表示されます）'}
      </p>
      {error && <p className="text-xs text-red-500 break-all">{error}</p>}
    </div>
  )
}
