'use client'

import { useRef } from 'react'
import Image from 'next/image'

interface ImageUploadProps {
  photos: string[]
  onChange: (photos: string[]) => void
}

export default function ImageUpload({ photos, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files) return
    const uploaded: string[] = []
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const { url } = await res.json()
        uploaded.push(url)
      }
    }
    onChange([...photos, ...uploaded])
  }

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {photos.map((src, i) => (
          <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden shadow-sm">
            <Image src={src} alt={`写真${i + 1}`} fill className="object-cover" />
            <button
              type="button"
              onClick={() => removePhoto(i)}
              className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-24 h-24 rounded-xl border-2 border-dashed border-sky-300 flex flex-col items-center justify-center text-sky-400 hover:bg-sky-50 transition-colors"
        >
          <span className="text-2xl">+</span>
          <span className="text-xs mt-0.5">追加</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
