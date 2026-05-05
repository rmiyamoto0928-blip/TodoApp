import { NextRequest, NextResponse } from 'next/server'
import { issueSessionToken, passwordsMatch, SESSION_COOKIE, SESSION_TTL_SECONDS } from '@/lib/auth'

// Per-IP login attempt limiter to slow brute force. In-memory so it resets on
// cold starts — that's intentional, it just costs the attacker time without
// requiring a Redis dependency. Fluid Compute reuses instances so the bucket
// usually persists for several minutes between bursts.
const ATTEMPTS_PER_WINDOW = 5
const WINDOW_MS = 60_000 // 1 minute
const BLOCK_MS = 5 * 60_000 // 5 minutes after exhausting

type Bucket = { count: number; firstAt: number; blockedUntil: number }
const buckets = new Map<string, Bucket>()

function clientIp(req: NextRequest): string {
  // Vercel forwards client IP via this header; fall back to a stable string so
  // misconfigured infra still gets rate limited (just globally).
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

function checkLimit(ip: string): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now()
  const b = buckets.get(ip)
  if (!b) {
    buckets.set(ip, { count: 0, firstAt: now, blockedUntil: 0 })
    return { ok: true }
  }
  if (b.blockedUntil > now) {
    return { ok: false, retryAfterSec: Math.ceil((b.blockedUntil - now) / 1000) }
  }
  if (now - b.firstAt > WINDOW_MS) {
    b.count = 0
    b.firstAt = now
  }
  if (b.count >= ATTEMPTS_PER_WINDOW) {
    b.blockedUntil = now + BLOCK_MS
    return { ok: false, retryAfterSec: BLOCK_MS / 1000 }
  }
  return { ok: true }
}

function recordFailure(ip: string) {
  const b = buckets.get(ip) ?? { count: 0, firstAt: Date.now(), blockedUntil: 0 }
  b.count += 1
  buckets.set(ip, b)
}

function resetIp(ip: string) {
  buckets.delete(ip)
}

export async function POST(req: NextRequest) {
  const expected = process.env.APP_PASSWORD
  if (!expected) {
    return NextResponse.json(
      { error: 'APP_PASSWORD is not set on this deployment.' },
      { status: 500 }
    )
  }

  const ip = clientIp(req)
  const limit = checkLimit(ip)
  if (!limit.ok) {
    return NextResponse.json(
      { error: `試行回数が多すぎます。${Math.ceil(limit.retryAfterSec / 60)}分後に再度お試しください。` },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } }
    )
  }

  const body = (await req.json().catch(() => null)) as { password?: unknown } | null
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!passwordsMatch(password, expected)) {
    recordFailure(ip)
    return NextResponse.json({ error: 'パスワードが違います' }, { status: 401 })
  }

  resetIp(ip)
  const token = await issueSessionToken()
  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_TTL_SECONDS,
    path: '/',
  })
  return res
}
