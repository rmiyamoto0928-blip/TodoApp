import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth'

// Client-direct upload via the Vercel Blob `handleUpload` protocol.
//
// Two POSTs hit this route:
//   1) `blob.generate-client-token` — from the user's browser, asking for a
//      signed token. We require a valid session cookie here so randoms on the
//      internet can't get free uploads to our Blob store.
//   2) `blob.upload-completed` — from Vercel Blob infrastructure after the
//      direct PUT completes. This callback carries no session cookie; instead
//      it's authenticated by an HMAC computed with BLOB_READ_WRITE_TOKEN, and
//      handleUpload() verifies that signature internally.
//
// Because of (2), this route MUST be excluded from the session middleware —
// otherwise the callback gets 401 and the upload silently fails. The middleware
// has /api/upload in PUBLIC_PREFIXES; auth is enforced inline below.
export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'BLOB_READ_WRITE_TOKEN is not set on this deployment.' },
      { status: 500 }
    )
  }

  let body: HandleUploadBody
  try {
    body = (await request.json()) as HandleUploadBody
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 })
  }

  if (body.type === 'blob.generate-client-token') {
    const cookie = request.cookies.get(SESSION_COOKIE)?.value
    const authed = await verifySessionToken(cookie).catch(() => false)
    if (!authed) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'image/heic',
            'image/heif',
          ],
          addRandomSuffix: true,
          maximumSizeInBytes: 20 * 1024 * 1024,
        }
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('blob uploaded:', blob.url)
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Upload error:', err)
    return NextResponse.json({ error: `Upload failed: ${message}` }, { status: 400 })
  }
}
