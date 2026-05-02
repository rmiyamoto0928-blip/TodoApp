import Link from 'next/link'
import PlanForm from '@/components/plans/PlanForm'

export default function NewPlanPage() {
  return (
    <div className="px-4 pt-4">
      <div className="flex items-center gap-3 mb-5">
        <Link href="/plans" className="text-gray-400 text-2xl leading-none">‹</Link>
        <h1 className="text-xl font-bold text-gray-900">プランを追加</h1>
      </div>
      <PlanForm />
    </div>
  )
}
