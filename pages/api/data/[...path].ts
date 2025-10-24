import { list, put, del, head } from '@vercel/blob';
import { NextApiRequest, NextApiResponse } from 'next';

// This is NOT an edge function because we need to stream and parse JSON bodies
// which is easier with the default Node.js runtime.

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({ error: 'Missing BLOB_READ_WRITE_TOKEN. Please set it in your .env.local file.' });
  }
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  
  const { method } = req;
  const path = (req.query.path as string[]).join('/');

  try {
    switch (method) {
      case 'GET': {
        const { blobs } = await list({ prefix: `${path}/`, token });
        
        const dataPromises = blobs.map(async (blob) => {
            const response = await fetch(blob.url);
            if (!response.ok) return null;
            const itemData = await response.json();
            // Attach the blob URL for easy access for deletion/updates
            return { ...itemData, url: blob.url };
        });
        
        const data = (await Promise.all(dataPromises)).filter(Boolean);
        return res.status(200).json(data);
      }
        
      case 'POST': {
        const body = req.body;
        const id = `${path}_${Date.now()}`;
        const blob = await put(`${path}/${id}.json`, JSON.stringify({ ...body, id, createdAt: new Date().toISOString() }), {
          access: 'public',
          addRandomSuffix: false,
          token,
        });
        return res.status(201).json({ ...body, id, url: blob.url });
      }

      case 'DELETE': {
        const { url } = req.query;
        if (typeof url !== 'string') {
          return res.status(400).json({ error: 'A blob URL must be provided for deletion.' });
        }
        await del(url, { token });
        return res.status(204).end();
      }

      case 'PUT': {
        const { url } = req.query;
        if (typeof url !== 'string') {
            return res.status(400).json({ error: 'A blob URL must be provided for update.' });
        }
        // Extract pathname from the full URL to get the file path
        const pathname = new URL(url).pathname.slice(1);
        const body = req.body;
        
        // Re-upload the file to the same path, overwriting it
        const blob = await put(pathname, JSON.stringify(body), {
          access: 'public',
          addRandomSuffix: false, // Important to overwrite
          token,
        });

        return res.status(200).json({ ...body, url: blob.url });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PUT']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error: any) {
    console.error(`Vercel Blob API Error on path "${path}":`, error);
    return res.status(500).json({ error: error.message || 'An internal server error occurred.' });
  }
}
