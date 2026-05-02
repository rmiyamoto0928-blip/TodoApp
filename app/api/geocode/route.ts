import { NextRequest, NextResponse } from 'next/server'

// Server-side proxy for OpenStreetMap Nominatim. Free, no API key, but requires
// a real User-Agent and is rate-limited (≤1 req/sec). We proxy through our own
// origin so we can set the UA correctly and avoid CORS issues.
//
// Modes:
//   GET /api/geocode?lat=35.68&lon=139.76        → reverse (coords → address)
//   GET /api/geocode?q=岐阜県岐阜市上土居1-5-2    → forward (address → coords)

const NOMINATIM = 'https://nominatim.openstreetmap.org'
// 国土地理院 (GSI) Reverse Geocoder. Free, no key, Japan-only. Returns the
// municipality code and the lv01 name (大字・字・町丁目). Combine with
// Nominatim's prefecture/city to get a finer Japanese address than OSM alone.
const GSI = 'https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress'
const UA = 'review-app/0.1 (personal review notebook)'

async function gsiReverse(lat: string, lon: string): Promise<{ lv01?: string; muniCd?: string } | null> {
  try {
    const res = await fetch(`${GSI}?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`, {
      next: { revalidate: 60 * 60 * 24 },
    })
    if (!res.ok) return null
    const j = (await res.json()) as { results?: { muniCd?: string; lv01Nm?: string } }
    if (!j.results) return null
    return { lv01: j.results.lv01Nm, muniCd: j.results.muniCd }
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const lat = url.searchParams.get('lat')
  const lon = url.searchParams.get('lon')
  const q = url.searchParams.get('q')

  try {
    if (lat && lon) {
      const target = `${NOMINATIM}/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&accept-language=ja&zoom=18`
      // Run both lookups in parallel — Nominatim for prefecture/city level,
      // GSI for 大字・丁目 level. Either may fail independently.
      const [nomRes, gsi] = await Promise.all([
        fetch(target, {
          headers: { 'User-Agent': UA, 'Accept-Language': 'ja' },
          next: { revalidate: 60 * 60 * 24 },
        }),
        gsiReverse(lat, lon),
      ])
      if (!nomRes.ok) return NextResponse.json({ error: 'reverse failed' }, { status: 502 })
      const data = (await nomRes.json()) as {
        display_name?: string
        address?: Record<string, string>
      }
      // Inject GSI's lv01 (大字・字・町丁目) into the parts object so the client
      // formatter can place it after the city/town segment.
      const parts: Record<string, string> = { ...(data.address ?? {}) }
      if (gsi?.lv01) parts.lv01 = gsi.lv01
      return NextResponse.json({
        address: data.display_name ?? '',
        latitude: Number(lat),
        longitude: Number(lon),
        // `parts` is Nominatim's structured address object plus a synthesized
        // `lv01` from GSI when available. The client reformats into JP order.
        parts,
      })
    }

    if (q) {
      const target = `${NOMINATIM}/search?format=jsonv2&q=${encodeURIComponent(q)}&limit=1&accept-language=ja`
      const res = await fetch(target, {
        headers: { 'User-Agent': UA, 'Accept-Language': 'ja' },
        next: { revalidate: 60 * 60 * 24 },
      })
      if (!res.ok) return NextResponse.json({ error: 'search failed' }, { status: 502 })
      const arr = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>
      const hit = arr[0]
      if (!hit) return NextResponse.json({ error: 'not found' }, { status: 404 })
      return NextResponse.json({
        address: hit.display_name,
        latitude: Number(hit.lat),
        longitude: Number(hit.lon),
      })
    }

    return NextResponse.json({ error: 'missing params (lat/lon or q)' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
