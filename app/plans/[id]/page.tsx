import { notFound } from 'next/navigation'
import Link from 'next/link'
import { planRepo } from '@/lib/db'
import PlanDetail from '@/components/plans/PlanDetail'

export const revalidate = 0

export default async function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await planRepo.findById(id)
  if (!item) notFound()

  return (
    <div className="px-4 pt-4">
      <Link href="/plans" className="text-sky-500 hover:underline mb-4 inline-block text-sm">
        ← 一覧に戻る
      </Link>
      <PlanDetail item={item} />
    </div>
  )
}
