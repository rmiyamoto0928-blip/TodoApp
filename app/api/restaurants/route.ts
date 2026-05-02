import { NextRequest } from 'next/server'
import { restaurantRepo } from '@/lib/db'
import { listHandler, createHandler } from '@/lib/apiHelpers'

export const GET = () => listHandler(restaurantRepo, 'GET /api/restaurants')
export const POST = (req: NextRequest) => createHandler(req, restaurantRepo, 'POST /api/restaurants')
