import Link from 'next/link'
import SpotForm from '@/components/spots/SpotForm'

export default function NewSpotPage() {
  return (
    <div className="px-4 pt-4">
      <div className="flex items-center gap-3 mb-5">
        <Link href="/spots" className="text-gray-400 text-2xl leading-none">‹</Link>
        <h1 className="text-xl font-bold text-gray-900">スポットを追加</h1>
      </div>
      <SpotForm />
    </div>
  )
}
