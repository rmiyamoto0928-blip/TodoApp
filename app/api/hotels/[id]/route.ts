import { NextRequest } from 'next/server'
import { hotelRepo } from '@/lib/db'
import { getHandler, updateHandler, deleteHandler } from '@/lib/apiHelpers'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return getHandler(id, hotelRepo, `GET /api/hotels/${id}`)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return updateHandler(req, id, hotelRepo, `PUT /api/hotels/${id}`)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return deleteHandler(id, hotelRepo, `DELETE /api/hotels/${id}`)
}
