import { NextRequest, NextResponse } from 'next/server'
import { restaurantRepo } from '@/lib/db'

export async function GET(req: NextRequest) {
  const items = restaurantRepo.findAll()
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const item = restaurantRepo.create(body)
  return NextResponse.json(item, { status: 201 })
}
