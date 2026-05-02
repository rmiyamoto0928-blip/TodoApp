import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'

// Client-direct upload: the browser uses `upload()` from `@vercel/blob/client`,
// which makes 2 requests:
//   1) POST here for a signed token (tiny JSON body)
//   2) PUT directly to Blob storage with the file bytes (no proxy through us)
// This bypasses Vercel's 4.5MB function payload limit (the cause of the
// `FUNCTION_PAYLOAD_TOO_LARGE` 413 errors when uploading phone photos).
//
// See https://vercel.com/docs/storage/vercel-blob/client-uploads
export async function POST(request: Request): Promise<NextResponse> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'BLOB_READ_WRITE_TOKEN is not set on this deployment.' },
      { status: 500 }
    )
  }

  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Constrain what the client can upload. addRandomSuffix prevents
        // "blob already exists" collisions when two photos share a name.
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
          // 20 MB ceiling. Plenty for phone photos; rejects accidental videos.
          maximumSizeInBytes: 20 * 1024 * 1024,
        }
      },
      onUploadCompleted: async ({ blob }) => {
        // Hook for post-upload work. Nothing to do for now — the form will
        // store blob.url in `image_url` via its own state.
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
