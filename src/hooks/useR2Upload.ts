'use client';

import { useState, useCallback } from 'react';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UseR2UploadOptions {
  onSuccess?: (document: any) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: UploadProgress) => void;
}

interface UploadDocumentParams {
  file: File;
  clientId: string;
  sessionId?: string;
  description?: string;
}

export function useR2Upload(options: UseR2UploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const upload = useCallback(async ({ file, clientId, sessionId, description }: UploadDocumentParams) => {
    setIsUploading(true);
    setError(null);
    setProgress({ loaded: 0, total: file.size, percentage: 0 });

    try {
      // Build form data with file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('clientId', clientId);
      if (sessionId) formData.append('sessionId', sessionId);
      if (description) formData.append('description', description);

      // Simulate progress for large files (since we can't track server-side upload progress)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev && prev.percentage < 90) {
            return { ...prev, percentage: prev.percentage + 10 };
          }
          return prev;
        });
      }, 200);

      // Upload via server-side route (handles R2 upload + DB save)
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload document');
      }

      const { document } = await response.json();

      setProgress({ loaded: file.size, total: file.size, percentage: 100 });
      options.onSuccess?.(document);
      
      return document;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Upload failed');
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(null);
    setError(null);
  }, []);

  return {
    upload,
    isUploading,
    progress,
    error,
    reset,
  };
}
