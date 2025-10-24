import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function upload(request: Request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return new Response('Missing BLOB_READ_WRITE_TOKEN. Please set it in your .env.local file.', { status: 500 });
  }

  if (!filename || !request.body) {
    const error = { code: 'BAD_REQUEST', message: 'No filename or file body provided.'};
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    const blob = await put(filename, request.body, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json(blob);
  } catch (error: any) {
    console.error("Vercel Blob API Error:", error);
    return NextResponse.json({ error: { code: error.code || 'UPLOAD_FAILED', message: error.message || 'File upload failed.' } }, { status: 500 });
  }
}
