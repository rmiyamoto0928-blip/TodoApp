import { notFound } from 'next/navigation'
import Link from 'next/link'
import { planRepo } from '@/lib/db'
import PlanForm from '@/components/plans/PlanForm'

export const revalidate = 0

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await planRepo.findById(id)
  if (!item) notFound()

  return (
    <div className="px-4 pt-4">
      <div className="flex items-center gap-3 mb-5">
        <Link href={`/plans/${id}`} className="text-gray-400 text-2xl leading-none">‹</Link>
        <h1 className="text-xl font-bold text-gray-900">編集</h1>
      </div>
      <PlanForm initial={item} />
    </div>
  )
}
