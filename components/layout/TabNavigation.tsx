'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/restaurants', label: '飲食店', icon: '🍜' },
  { href: '/hotels', label: 'ホテル', icon: '🏨' },
  { href: '/spots', label: 'スポット', icon: '🎡' },
  { href: '/plans', label: 'プラン', icon: '🗺' },
  { href: '/favorites', label: '♥', icon: '♥' },
]

export default function TabNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-100 safe-area-pb">
      <div className="flex max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={[
                'flex-1 flex flex-col items-center justify-center py-2 pt-2.5 gap-0.5 transition-colors duration-150 relative',
                active ? 'text-sky-400' : 'text-gray-400',
              ].join(' ')}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-sky-400 rounded-full" />
              )}
              <span className={`text-lg leading-none ${active ? 'scale-110' : ''} transition-transform`}>
                {tab.icon}
              </span>
              <span className={`text-[9px] font-medium ${active ? 'font-bold text-sky-400' : ''}`}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
