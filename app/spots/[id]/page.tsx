import { notFound } from 'next/navigation'
import Link from 'next/link'
import { spotRepo } from '@/lib/db'
import SpotDetail from '@/components/spots/SpotDetail'

export const revalidate = 0

export default async function SpotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await spotRepo.findById(id)
  if (!item) notFound()

  return (
    <div>
      <div className="flex items-center gap-3 px-4 py-3 bg-[#f8fafc] sticky top-0 z-40">
        <Link href="/spots" className="text-gray-400 text-2xl leading-none">‹</Link>
        <h1 className="text-base font-bold text-gray-900 truncate">{item.name}</h1>
      </div>
      <SpotDetail item={item} />
    </div>
  )
}
