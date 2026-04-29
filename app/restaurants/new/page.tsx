import Link from 'next/link'
import RestaurantForm from '@/components/restaurants/RestaurantForm'

export default function NewRestaurantPage() {
  return (
    <div className="px-4 pt-4">
      <div className="flex items-center gap-3 mb-5">
        <Link href="/restaurants" className="text-gray-400 text-2xl leading-none">‹</Link>
        <h1 className="text-xl font-bold text-gray-900">飲食店を追加</h1>
      </div>
      <RestaurantForm />
    </div>
  )
}
