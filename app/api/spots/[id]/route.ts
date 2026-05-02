import { NextRequest } from 'next/server'
import { spotRepo } from '@/lib/db'
import { getHandler, updateHandler, deleteHandler } from '@/lib/apiHelpers'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return getHandler(id, spotRepo, `GET /api/spots/${id}`)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return updateHandler(req, id, spotRepo, `PUT /api/spots/${id}`)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return deleteHandler(id, spotRepo, `DELETE /api/spots/${id}`)
}
