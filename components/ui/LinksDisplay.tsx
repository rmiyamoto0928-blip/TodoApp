interface LinksDisplayProps {
  links: string[] | undefined
}

/**
 * Read-only list of links shown on detail pages. Each row is a clickable
 * anchor that opens in a new tab. Server-renderable (no `'use client'`).
 */
export default function LinksDisplay({ links }: LinksDisplayProps) {
  if (!links || links.length === 0) return null

  const iconFor = (url: string): string => {
    const u = url.toLowerCase()
    if (u.includes('instagram')) return '📷'
    if (u.includes('twitter') || u.includes('x.com')) return '🐦'
    if (u.includes('facebook')) return '📘'
    if (u.includes('youtube')) return '▶️'
    if (u.includes('tabelog')) return '🍴'
    if (u.includes('tiktok')) return '🎵'
    if (u.includes('line.me')) return '💬'
    return '🔗'
  }

  const labelFor = (url: string): string => {
    try {
      const host = new URL(url).hostname.replace(/^www\./, '')
      return host
    } catch {
      return url
    }
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-bold text-gray-700">🔗 リンク</h2>
      <div className="space-y-1.5">
        {links.map((link, i) => (
          <a
            key={i}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl hover:bg-sky-50 transition-colors text-sm"
          >
            <span className="shrink-0">{iconFor(link)}</span>
            <span className="text-sky-600 truncate">{labelFor(link)}</span>
            <span className="ml-auto text-gray-300 text-xs shrink-0">↗</span>
          </a>
        ))}
      </div>
    </div>
  )
}
