import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename || !request.body) {
    return NextResponse.json({ error: 'Filename or body missing' }, { status: 400 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    // The token is the typical missing piece on Vercel deployments — surface it
    // explicitly so the client error banner says exactly what to do.
    return NextResponse.json(
      { error: 'BLOB_READ_WRITE_TOKEN is not set on this deployment. Connect a Vercel Blob store to the project.' },
      { status: 500 }
    );
  }

  try {
    // addRandomSuffix: true → 同名のファイル（例: IMG_0001.jpg）を何度アップしても
    // ユニークな URL になり、`This blob already exists` エラーを回避できる。
    const blob = await put(filename, request.body, {
      access: 'public',
      addRandomSuffix: true,
    });

    return NextResponse.json(blob);
  } catch (error) {
    // Surface the underlying error message instead of a generic "Upload failed".
    const message = error instanceof Error ? error.message : String(error);
    console.error('Upload error:', error);
    return NextResponse.json({ error: `Upload failed: ${message}` }, { status: 500 });
  }
}
