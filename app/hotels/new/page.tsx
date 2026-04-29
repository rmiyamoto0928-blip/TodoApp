import Link from 'next/link'
import HotelForm from '@/components/hotels/HotelForm'

export default function NewHotelPage() {
  return (
    <div className="px-4 pt-4">
      <div className="flex items-center gap-3 mb-5">
        <Link href="/hotels" className="text-gray-400 text-2xl leading-none">‹</Link>
        <h1 className="text-xl font-bold text-gray-900">ホテルを追加</h1>
      </div>
      <HotelForm />
    </div>
  )
}
