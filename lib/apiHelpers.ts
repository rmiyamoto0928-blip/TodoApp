import { NextRequest, NextResponse } from 'next/server'

// Shared CRUD route helpers. Each entity's route.ts file is a thin wrapper
// that calls into these — the heavy work (validation, error surfacing) is
// uniform across restaurants/hotels/spots/plans.
//
// Why surface the message: when a SQL error fires (e.g. missing column on a
// partially-migrated DB), the generic 500 body is opaque. We bubble the actual
// error string so it shows up in the form's error banner and the server log.

interface Repo<T, I> {
  findAll(): Promise<T[]>
  findById(id: string): Promise<T | null>
  create(input: I): Promise<T>
  update(id: string, input: I): Promise<T | null>
  delete(id: string): Promise<boolean>
}

const fail = (label: string, err: unknown, status = 500): NextResponse => {
  const message = err instanceof Error ? err.message : String(err)
  console.error(`[${label}]`, err)
  return NextResponse.json({ error: message }, { status })
}

export async function listHandler<T, I>(repo: Repo<T, I>, label: string) {
  try {
    return NextResponse.json(await repo.findAll())
  } catch (err) {
    return fail(label, err)
  }
}

export async function createHandler<T, I>(req: NextRequest, repo: Repo<T, I>, label: string) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 })
  }
  const b = body as { name?: unknown }
  if (!b?.name || typeof b.name !== 'string' || !b.name.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }
  try {
    const item = await repo.create(body as I)
    return NextResponse.json(item, { status: 201 })
  } catch (err) {
    return fail(label, err)
  }
}

export async function getHandler<T, I>(id: string, repo: Repo<T, I>, label: string) {
  try {
    const item = await repo.findById(id)
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(item)
  } catch (err) {
    return fail(label, err)
  }
}

export async function updateHandler<T, I>(req: NextRequest, id: string, repo: Repo<T, I>, label: string) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 })
  }
  const b = body as { name?: unknown }
  if (!b?.name || typeof b.name !== 'string' || !b.name.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }
  try {
    const item = await repo.update(id, body as I)
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(item)
  } catch (err) {
    return fail(label, err)
  }
}

export async function deleteHandler<T, I>(id: string, repo: Repo<T, I>, label: string) {
  try {
    const ok = await repo.delete(id)
    if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return fail(label, err)
  }
}
