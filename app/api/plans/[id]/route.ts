import { NextRequest } from 'next/server'
import { planRepo } from '@/lib/db'
import { getHandler, updateHandler, deleteHandler } from '@/lib/apiHelpers'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return getHandler(id, planRepo, `GET /api/plans/${id}`)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return updateHandler(req, id, planRepo, `PUT /api/plans/${id}`)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return deleteHandler(id, planRepo, `DELETE /api/plans/${id}`)
}
