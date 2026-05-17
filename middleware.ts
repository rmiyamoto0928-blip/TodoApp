import { NextResponse, type NextRequest } from 'next/server'
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth'

// Routing middleware: every request to a non-public path must carry a valid
// session cookie. Unauthenticated browsers get redirected to /login;
// unauthenticated API clients get a 401 JSON.
//
// Note: Next 16 + Vercel Fluid Compute runs middleware in Node.js, so jose's
// crypto verify path works without any edge-runtime tweaks.

const PUBLIC_PREFIXES = [
  '/login',
  '/api/login',
  '/api/logout',
  // /api/upload uses the Vercel Blob handleUpload protocol. The 2nd-stage
  // `blob.upload-completed` callback comes from Vercel Blob infrastructure
  // without our session cookie (it's authenticated by HMAC signed with
  // BLOB_READ_WRITE_TOKEN, which handleUpload verifies internally). The route
  // itself performs an extra session check on the 1st-stage browser request.
  '/api/upload',
  '/_next',
  '/favicon',
  '/icon',
  '/manifest',
  '/sw.js',
  '/robots.txt',
  '/uploads', // legacy local upload dir; harmless if missing
]

function isPublic(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/') || pathname.startsWith(prefix + '.'))
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (isPublic(pathname)) {
    return NextResponse.next()
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value
  const ok = await verifySessionToken(token).catch(() => false)
  if (ok) return NextResponse.next()

  // API clients want JSON, browsers want a redirect.
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const url = req.nextUrl.clone()
  url.pathname = '/login'
  // Preserve where the user was going so we can redirect back after login.
  if (pathname !== '/' && pathname !== '/login') {
    url.searchParams.set('next', pathname)
  } else {
    url.searchParams.delete('next')
  }
  return NextResponse.redirect(url)
}

export const config = {
  // Skip Next.js internals and the static asset prefixes. Public-path checks
  // happen inside the function for clarity.
  matcher: ['/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|webp|svg|gif|ico|json|js|map)$).*)'],
}
