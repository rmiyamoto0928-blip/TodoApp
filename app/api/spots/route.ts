import { NextRequest } from 'next/server'
import { spotRepo } from '@/lib/db'
import { listHandler, createHandler } from '@/lib/apiHelpers'

export const GET = () => listHandler(spotRepo, 'GET /api/spots')
export const POST = (req: NextRequest) => createHandler(req, spotRepo, 'POST /api/spots')
