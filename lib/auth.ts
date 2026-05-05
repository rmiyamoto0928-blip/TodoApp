import { jwtVerify, SignJWT } from 'jose'

// Single-password authentication. The shared APP_PASSWORD lives in Vercel env;
// successful login mints a signed JWT that's stored in an httpOnly cookie.
// The middleware (../middleware.ts) verifies the cookie on every request.

export const SESSION_COOKIE = 'session'
export const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60 // 30 days

function getSecret(): Uint8Array {
  const raw = process.env.AUTH_SECRET
  if (!raw || raw.length < 16) {
    // Fail loud at runtime rather than mint tokens with a known weak key.
    throw new Error('AUTH_SECRET is missing or too short. Set a random 32+ char string in Vercel env.')
  }
  return new TextEncoder().encode(raw)
}

export async function issueSessionToken(): Promise<string> {
  return new SignJWT({})
    .setSubject('user')
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .setProtectedHeader({ alg: 'HS256' })
    .sign(getSecret())
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false
  try {
    await jwtVerify(token, getSecret())
    return true
  } catch {
    return false
  }
}

/**
 * Constant-time-ish password compare. Not 100% timing-safe in JS, but good
 * enough to defeat trivial probe attacks; serious brute force is blocked by
 * the per-IP rate limit on the /api/login route.
 */
export function passwordsMatch(input: string, expected: string): boolean {
  if (typeof input !== 'string' || typeof expected !== 'string') return false
  if (input.length !== expected.length) return false
  let mismatch = 0
  for (let i = 0; i < input.length; i++) {
    mismatch |= input.charCodeAt(i) ^ expected.charCodeAt(i)
  }
  return mismatch === 0
}
