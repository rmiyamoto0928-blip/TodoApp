'use client'

import { useState } from 'react'

interface LinkIconProps {
  url: string
  size?: number
}

/**
 * Brand/site icon for a URL. Uses Google's favicon API which returns the real
 * logo for famous services (Instagram, X, Tabelog, …) AND the actual favicon
 * for any arbitrary website (店舗ホームページ等). Falls back to 🔗 if the
 * image 404s or the URL is malformed.
 *
 *   https://www.google.com/s2/favicons?domain=instagram.com&sz=128
 */
export default function LinkIcon({ url, size = 20 }: LinkIconProps) {
  const [errored, setErrored] = useState(false)

  let host = ''
  try {
    host = new URL(url).hostname
  } catch {
    return <span className="text-base shrink-0 leading-none">🔗</span>
  }

  if (errored) {
    return <span className="text-base shrink-0 leading-none">🔗</span>
  }

  return (
    // Plain <img> instead of next/image: favicons are tiny, the URL is dynamic,
    // and we don't want to pay the cost of allow-listing google.com in next.config.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setErrored(true)}
      className="rounded shrink-0"
      style={{ width: size, height: size }}
    />
  )
}
