import { notFound } from 'next/navigation'
import Link from 'next/link'
import { restaurantRepo } from '@/lib/db'
import RestaurantDetail from '@/components/restaurants/RestaurantDetail'

export const revalidate = 0

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const item = await restaurantRepo.findById(id)
  if (!item) notFound()

  return (
    <div className="px-4 pt-4">
      <Link href="/restaurants" className="text-sky-500 hover:underline mb-4 inline-block text-sm">
        ← 一覧に戻る
      </Link>
      <RestaurantDetail item={item} />
    </div>
  )
}
