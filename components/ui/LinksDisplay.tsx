import LinkIcon from './LinkIcon'

interface LinksDisplayProps {
  links: string[] | undefined
}

/**
 * Read-only list of links shown on detail pages. Each row is a clickable
 * anchor that opens in a new tab, with the site's real favicon on the left.
 */
export default function LinksDisplay({ links }: LinksDisplayProps) {
  if (!links || links.length === 0) return null

  const labelFor = (url: string): string => {
    try {
      return new URL(url).hostname.replace(/^www\./, '')
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
            className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 rounded-xl hover:bg-sky-50 transition-colors text-sm"
          >
            <LinkIcon url={link} size={22} />
            <span className="text-sky-600 truncate">{labelFor(link)}</span>
            <span className="ml-auto text-gray-300 text-xs shrink-0">↗</span>
          </a>
        ))}
      </div>
    </div>
  )
}
