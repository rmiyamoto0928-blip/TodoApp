import { NextRequest, NextResponse } from 'next/server'
import { spotRepo } from '@/lib/db'

export async function GET() {
  return NextResponse.json(spotRepo.findAll())
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const item = spotRepo.create(body)
  return NextResponse.json(item, { status: 201 })
}
