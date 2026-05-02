import { NextRequest } from 'next/server'
import { restaurantRepo } from '@/lib/db'
import { getHandler, updateHandler, deleteHandler } from '@/lib/apiHelpers'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return getHandler(id, restaurantRepo, `GET /api/restaurants/${id}`)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return updateHandler(req, id, restaurantRepo, `PUT /api/restaurants/${id}`)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return deleteHandler(id, restaurantRepo, `DELETE /api/restaurants/${id}`)
}
