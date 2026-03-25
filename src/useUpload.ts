import { useState, useCallback } from 'react';
import type { UploadResult } from '@tchomb/shared-types';

export type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export type UploadFn = (
  fileUri: string,
  caption: string,
  language: string,
  mediaType: 'video' | 'image',
  onProgress?: (pct: number) => void
) => Promise<UploadResult>;

export function useUpload(uploadFn: UploadFn) {
  const [state, setState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);

  const upload = useCallback(async (
    fileUri: string,
    caption: string,
    language: string,
    mediaType: 'video' | 'image' = 'video'
  ) => {
    setState('uploading');
    setProgress(0);
    setError(null);
    setVideoId(null);

    try {
      const result = await uploadFn(fileUri, caption, language, mediaType, setProgress);
      setVideoId(result.video.id);
      setState('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de l\'envoi');
      setState('error');
    }
  }, [uploadFn]);

  const reset = useCallback(() => {
    setState('idle');
    setProgress(0);
    setError(null);
    setVideoId(null);
  }, []);

  return { state, progress, error, videoId, upload, reset };
}
