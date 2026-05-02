import { NextRequest } from 'next/server'
import { hotelRepo } from '@/lib/db'
import { listHandler, createHandler } from '@/lib/apiHelpers'

export const GET = () => listHandler(hotelRepo, 'GET /api/hotels')
export const POST = (req: NextRequest) => createHandler(req, hotelRepo, 'POST /api/hotels')
