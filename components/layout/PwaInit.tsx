'use client'

import { useEffect } from 'react'

/**
 * Registers the PWA service worker — but only in production.
 *
 * In development, the SW aggressively caches HMR'd files and stale RSC payloads,
 * which can cause hydration to silently fail (the page renders but `onClick`
 * handlers never attach, so every button feels dead while text inputs still
 * work natively). Always unregister any leftover dev-time SW so a previously
 * cached registration doesn't keep serving old code.
 */
export default function PwaInit() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    if (process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
      return
    }

    // Dev: clean up any SW + caches a previous run installed on this origin.
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister())
    })
    if ('caches' in window) {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)))
    }
  }, [])

  return null
}
