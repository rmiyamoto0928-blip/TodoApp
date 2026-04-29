import { notFound } from 'next/navigation'
import Link from 'next/link'
import { spotRepo } from '@/lib/db'
import SpotForm from '@/components/spots/SpotForm'

export default async function EditSpotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = spotRepo.findById(id)
  if (!item) notFound()

  return (
    <div className="px-4 pt-4">
      <div className="flex items-center gap-3 mb-5">
        <Link href={`/spots/${id}`} className="text-gray-400 text-2xl leading-none">‹</Link>
        <h1 className="text-xl font-bold text-gray-900">編集</h1>
      </div>
      <SpotForm initial={item} />
    </div>
  )
}
