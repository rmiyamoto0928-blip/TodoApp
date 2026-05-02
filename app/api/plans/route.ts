import { NextRequest } from 'next/server'
import { planRepo } from '@/lib/db'
import { listHandler, createHandler } from '@/lib/apiHelpers'

export const GET = () => listHandler(planRepo, 'GET /api/plans')
export const POST = (req: NextRequest) => createHandler(req, planRepo, 'POST /api/plans')
