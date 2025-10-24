import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from './firebase';

// This storage service is designed to be provider-agnostic.
// The current implementation uses Firebase Storage, but it can be swapped
// with another provider like Vercel Blob by changing the implementation
// of the `uploadFile` function.

// NOTE ON VERCEL BLOB:
// To implement file uploads with Vercel Blob, you would typically create a
// serverless function (e.g., an API route at `/api/upload`) on your backend.
// This is crucial for security as it prevents exposing your Blob Read-Write Token
// to the client-side. The client would request a secure upload URL from your
// API route and then upload the file directly to Vercel's storage.

/**
 * Uploads a file to the application's configured cloud storage.
 *
 * @param {File} file - The file to be uploaded.
 * @param {string} path - The destination path or folder in the storage bucket (e.g., 'order-attachments').
 * @returns {Promise<string>} A promise that resolves with the public download URL of the uploaded file.
 */
export const uploadFile = async (file: File, path: string): Promise<string> => {
  // Current Implementation: Firebase Storage
  if (!file || !path) {
    throw new Error("A file and a destination path must be provided.");
  }

  const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};
