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
        <link rel="apple-touch-icon" href="/icon-192.png" />
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
