import type { UploadResult } from '@tchomb/shared-types';

export type UploadAdapter = {
  getAuthHeaders: () => Promise<Record<string, string>>;
  baseUrl: string;
};

export function createUploader({ getAuthHeaders, baseUrl }: UploadAdapter) {
  return async function uploadMedia(
    fileUri: string,
    caption: string,
    language: string,
    mediaType: 'video' | 'image',
    onProgress?: (pct: number) => void,
    thumbnailUri?: string
  ): Promise<UploadResult> {
    const headers = await getAuthHeaders();

    const isImage = mediaType === 'image';
    const ext = fileUri.split('.').pop()?.toLowerCase() ?? (isImage ? 'jpg' : 'mp4');
    const mimeType = isImage
      ? (ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg')
      : 'video/mp4';
    const fileName = isImage ? `photo.${ext}` : 'video.mp4';

    const formData = new FormData();
    formData.append('media', {
      uri: fileUri,
      name: fileName,
      type: mimeType,
    } as unknown as Blob);
    formData.append('caption', caption);
    formData.append('language', language);
    formData.append('media_type', mediaType);

    // Attach thumbnail for video uploads
    if (thumbnailUri && !isImage) {
      const thumbExt = thumbnailUri.split('.').pop()?.toLowerCase() ?? 'jpg';
      formData.append('thumbnail', {
        uri: thumbnailUri,
        name: `thumbnail.${thumbExt}`,
        type: thumbExt === 'png' ? 'image/png' : 'image/jpeg',
      } as unknown as Blob);
    }

    return new Promise<UploadResult>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${baseUrl}/api/upload`);

      Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          try {
            reject(new Error(JSON.parse(xhr.responseText)?.error ?? 'Échec de l\'envoi'));
          } catch {
            reject(new Error('Échec de l\'envoi'));
          }
        }
      };

      xhr.onerror = () => reject(new Error('Erreur réseau'));
      xhr.send(formData);
    });
  };
}
