import { NextRequest, NextResponse } from 'next/server'
import { hotelRepo } from '@/lib/db'

export async function GET() {
  return NextResponse.json(hotelRepo.findAll())
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const item = hotelRepo.create(body)
  return NextResponse.json(item, { status: 201 })
}
