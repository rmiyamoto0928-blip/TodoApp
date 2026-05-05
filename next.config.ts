import type { NextConfig } from 'next'

// Security headers applied to every response. The CSP is intentionally tight:
// - default-src 'self' rejects most third-party loads
// - 'unsafe-inline' is needed for Next.js dev/streaming RSC and Tailwind <style> tags
// - script-src whitelists Vercel scripts when running on review-app-*.vercel.app
// - img-src includes Vercel Blob (for uploaded photos), Google favicon API, and
//   maps embed (the iframe loads from google.com)
// - frame-src allows the Google Maps embed iframe
// - connect-src allows the Vercel Blob direct upload URL plus the geocode proxies
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.vercel-storage.com https://www.google.com https://maps.googleapis.com https://maps.gstatic.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.vercel-storage.com https://blob.vercel-storage.com https://nominatim.openstreetmap.org https://mreversegeocoder.gsi.go.jp https://www.google.com",
  "frame-src 'self' https://www.google.com https://maps.google.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'geolocation=(self), camera=(), microphone=(self), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  // Even though the middleware noindex-redirects unauthenticated browsers, this
  // belt-and-braces header tells search engine crawlers explicitly.
  { key: 'X-Robots-Tag', value: 'noindex, nofollow, nosnippet, noarchive' },
]

const nextConfig: NextConfig = {
  // Don't expose the framework version to attackers fingerprinting endpoints.
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.vercel-storage.com' },
    ],
    localPatterns: [{ pathname: '/uploads/**' }],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
