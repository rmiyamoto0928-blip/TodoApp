import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import TabNavigation from '@/components/layout/TabNavigation'
import PwaInit from '@/components/layout/PwaInit'

const geist = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'レビューノート',
  description: '飲食店・ホテル・遊びスポットのレビュー管理アプリ',
  manifest: '/manifest.json',
  // Personal/private app — explicitly opt out of indexing in addition to the
  // X-Robots-Tag header and robots.ts rules.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'レビューノート',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#38BDF8',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${geist.variable} h-full antialiased`}>
      <head>
        {/* iOS Safari is happy with SVG since 13.4. Modern Android Chrome
            installs from manifest.json icons, also SVG. */}
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="min-h-full bg-[#f8fafc]">
        <PwaInit />
        <div className="max-w-lg mx-auto relative min-h-screen">
          <main className="pb-20">{children}</main>
          <TabNavigation />
        </div>
      </body>
    </html>
  )
}
