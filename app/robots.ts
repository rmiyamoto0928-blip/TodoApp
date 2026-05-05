import type { MetadataRoute } from 'next'

// Personal app — keep it out of search engines entirely.
// Combined with the X-Robots-Tag header in next.config.ts and the noindex meta
// in layout.tsx, this is belt-and-braces deindexing.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', disallow: '/' }],
  }
}
