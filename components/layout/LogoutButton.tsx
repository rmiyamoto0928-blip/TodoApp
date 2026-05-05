'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Small text-link logout button. Calls /api/logout to clear the session
 * cookie, then sends the user back to /login.
 */
export default function LogoutButton() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const onClick = async () => {
    if (busy) return
    setBusy(true)
    try {
      await fetch('/api/logout', { method: 'POST' })
    } catch {
      // Even if the network call fails, the next protected request will 401
      // and the user gets redirected — so just push to /login regardless.
    }
    router.replace('/login')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="text-xs text-gray-400 hover:text-red-400 transition-colors disabled:opacity-60"
    >
      {busy ? 'ログアウト中…' : '🔒 ログアウト'}
    </button>
  )
}
