import { notFound } from 'next/navigation'
import Link from 'next/link'
import { hotelRepo } from '@/lib/db'
import HotelForm from '@/components/hotels/HotelForm'

export default async function EditHotelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = hotelRepo.findById(id)
  if (!item) notFound()

  return (
    <div className="px-4 pt-4">
      <div className="flex items-center gap-3 mb-5">
        <Link href={`/hotels/${id}`} className="text-gray-400 text-2xl leading-none">‹</Link>
        <h1 className="text-xl font-bold text-gray-900">編集</h1>
      </div>
      <HotelForm initial={item} />
    </div>
  )
}
