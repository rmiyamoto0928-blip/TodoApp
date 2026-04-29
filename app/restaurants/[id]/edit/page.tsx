import { notFound } from 'next/navigation'
import Link from 'next/link'
import { restaurantRepo } from '@/lib/db'
import RestaurantForm from '@/components/restaurants/RestaurantForm'

export default async function EditRestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = restaurantRepo.findById(id)
  if (!item) notFound()

  return (
    <div className="px-4 pt-4">
      <div className="flex items-center gap-3 mb-5">
        <Link href={`/restaurants/${id}`} className="text-gray-400 text-2xl leading-none">‹</Link>
        <h1 className="text-xl font-bold text-gray-900">編集</h1>
      </div>
      <RestaurantForm initial={item} />
    </div>
  )
}
