'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/restaurants'

  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        // Use replace so the back button doesn't return to /login.
        router.replace(next)
        router.refresh()
        return
      }
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      setError(data?.error || 'ログインに失敗しました')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-semibold text-gray-700">パスワード</label>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoFocus
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || !password}
        className="w-full py-3.5 bg-sky-400 text-white font-bold rounded-2xl text-sm shadow-md active:scale-95 transition-all disabled:opacity-60"
      >
        {submitting ? '確認中…' : 'ログイン'}
      </button>

      {error && (
        <p className="text-sm text-red-500 text-center break-all">{error}</p>
      )}
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#f8fafc]">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <div className="text-4xl">📒</div>
          <h1 className="text-xl font-bold text-gray-900">レビューノート</h1>
          <p className="text-xs text-gray-400">続けるにはパスワードを入力してください</p>
        </div>

        <Suspense fallback={<div className="text-center text-gray-400 text-sm">読み込み中…</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
