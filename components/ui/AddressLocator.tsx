'use client'

import { useState } from 'react'
import VoiceInput from './VoiceInput'
import { formatJpAddress, type NominatimAddress } from '@/lib/utils'

interface AddressLocatorProps {
  address: string
  latitude?: number | null
  longitude?: number | null
  onChange: (next: { address: string; latitude: number | null; longitude: number | null }) => void
  placeholder?: string
}

/**
 * Address input + "use current location" button + reverse geocoding.
 * Shared by all forms (restaurants/hotels/spots/plans). Calls /api/geocode
 * (which proxies Nominatim + GSI) and applies formatJpAddress so the result
 * reads as 都道府県→市町村→… in Japanese order.
 */
export default function AddressLocator({ address, latitude, longitude, onChange, placeholder }: AddressLocatorProps) {
  const [locating, setLocating] = useState(false)
  const [locError, setLocError] = useState<string | null>(null)

  const useCurrentLocation = () => {
    setLocError(null)
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocError('このブラウザは位置情報に対応していません')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude
        try {
          const res = await fetch(`/api/geocode?lat=${lat}&lon=${lon}`)
          if (res.ok) {
            const data = (await res.json()) as { address?: string; parts?: NominatimAddress | null }
            const jp = formatJpAddress(data.parts ?? undefined)
            const formatted = jp || data.address || ''
            onChange({ address: formatted || address, latitude: lat, longitude: lon })
          } else {
            onChange({ address, latitude: lat, longitude: lon })
            setLocError('住所の自動取得に失敗しました（座標は保存されます）')
          }
        } catch {
          onChange({ address, latitude: lat, longitude: lon })
          setLocError('住所の自動取得に失敗しました（座標は保存されます）')
        } finally {
          setLocating(false)
        }
      },
      (err) => {
        setLocating(false)
        setLocError(err.message || '位置情報の取得に失敗しました')
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    )
  }

  return (
    <div className="space-y-1">
      <label className="text-sm font-semibold text-gray-700">住所・最寄り駅</label>
      <div className="flex gap-2">
        <input
          value={address}
          onChange={(e) => onChange({ address: e.target.value, latitude: latitude ?? null, longitude: longitude ?? null })}
          placeholder={placeholder ?? '例：東京都渋谷区、渋谷駅近く'}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
        />
        <VoiceInput onResult={(t) => onChange({ address: t, latitude: latitude ?? null, longitude: longitude ?? null })} />
      </div>
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={locating}
          className="text-xs px-3 py-1.5 rounded-full bg-sky-50 text-sky-600 font-medium border border-sky-200 active:scale-95 transition-all disabled:opacity-60"
        >
          {locating ? '取得中…' : '📍 現在地から住所を取得'}
        </button>
        {latitude != null && longitude != null && (
          <span className="text-[10px] text-gray-400">
            ({latitude.toFixed(4)}, {longitude.toFixed(4)})
          </span>
        )}
      </div>
      {locError && <p className="text-xs text-red-500">{locError}</p>}
    </div>
  )
}
