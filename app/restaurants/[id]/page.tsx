import { notFound } from 'next/navigation'
import Link from 'next/link'
import { restaurantRepo } from '@/lib/db'
import RestaurantDetail from '@/components/restaurants/RestaurantDetail'

export default async function RestaurantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = restaurantRepo.findById(id)
  if (!item) notFound()

  return (
    <div>
      <div className="flex items-center gap-3 px-4 py-3 bg-[#f8fafc] sticky top-0 z-40">
        <Link href="/restaurants" className="text-gray-400 text-2xl leading-none">‹</Link>
        <h1 className="text-base font-bold text-gray-900 truncate">{item.name}</h1>
      </div>
      <RestaurantDetail item={item} />
    </div>
  )
}
