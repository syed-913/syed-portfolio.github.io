import { auth } from './adminFirebase';

const MEDIA_WORKER_URL = (import.meta.env.VITE_MEDIA_WORKER_URL as string | undefined)?.replace(/\/$/, '');
const IMAGEKIT_UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload';

export interface UploadedMedia {
  url: string;
  fileId: string;
  filePath?: string;
  name?: string;
}

interface ImageKitAuthPayload {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
}

const requireWorkerUrl = () => {
  if (!MEDIA_WORKER_URL) {
    throw new Error('Media upload is not configured. Set VITE_MEDIA_WORKER_URL to your portfolio media Worker URL.');
  }
  return MEDIA_WORKER_URL;
};

const getAdminIdToken = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('Your dashboard session has expired. Sign in again.');
  return user.getIdToken(true);
};

const getImageKitAuth = async (): Promise<ImageKitAuthPayload> => {
  const workerUrl = requireWorkerUrl();
  const idToken = await getAdminIdToken();
  const response = await fetch(`${workerUrl}/auth`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || `Media authorization failed (${response.status}).`);
  }

  return response.json();
};

const sanitizeFileName = (name: string) => {
  const dot = name.lastIndexOf('.');
  const extension = dot >= 0 ? name.slice(dot).toLowerCase().replace(/[^a-z0-9.]/g, '') : '';
  const base = (dot >= 0 ? name.slice(0, dot) : name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'credential';
  return `${base}${extension}`;
};

export const uploadCredentialMedia = async (
  file: File,
  onProgress?: (progress: number) => void,
): Promise<UploadedMedia> => {
  const authPayload = await getImageKitAuth();
  const form = new FormData();
  form.append('file', file);
  form.append('fileName', sanitizeFileName(file.name));
  form.append('publicKey', authPayload.publicKey);
  form.append('token', authPayload.token);
  form.append('signature', authPayload.signature);
  form.append('expire', String(authPayload.expire));
  form.append('folder', '/certificates');
  form.append('useUniqueFileName', 'true');

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('POST', IMAGEKIT_UPLOAD_URL);

    request.upload.addEventListener('progress', (event) => {
      if (!event.lengthComputable) return;
      onProgress?.(Math.round((event.loaded / event.total) * 100));
    });

    request.addEventListener('load', () => {
      let body: any = null;
      try { body = JSON.parse(request.responseText || '{}'); } catch { /* no-op */ }

      if (request.status >= 200 && request.status < 300 && body?.url && body?.fileId) {
        onProgress?.(100);
        resolve({ url: body.url, fileId: body.fileId, filePath: body.filePath, name: body.name });
        return;
      }

      reject(new Error(body?.message || `Credential upload failed (${request.status}).`));
    });

    request.addEventListener('error', () => reject(new Error('Credential upload failed due to a network error.')));
    request.send(form);
  });
};

export const deleteCredentialMedia = async (fileId?: string) => {
  if (!fileId) return;
  const workerUrl = requireWorkerUrl();
  const idToken = await getAdminIdToken();
  const response = await fetch(`${workerUrl}/file/${encodeURIComponent(fileId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${idToken}` },
  });

  // Deleting an already-removed ImageKit file should not block dashboard cleanup.
  if (!response.ok && response.status !== 404) {
    const message = await response.text().catch(() => '');
    throw new Error(message || `Could not remove the old credential file (${response.status}).`);
  }
};
