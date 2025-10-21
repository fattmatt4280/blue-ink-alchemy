import { useState, useRef, useCallback, useEffect } from "react";

export type CameraMode = 'progress' | 'concerns' | 'urgent';

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  file: File;
  timestamp: number;
  mode: CameraMode;
}

export const useCamera = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [hasFlash, setHasFlash] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const initializeCamera = useCallback(async () => {
    setIsInitializing(true);
    setError(null);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      // Check if device has flash/torch
      const videoTrack = mediaStream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities() as any;
      setHasFlash(capabilities.torch === true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera initialization error:', err);
      setError('Unable to access camera. Please check permissions.');
    } finally {
      setIsInitializing(false);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = useCallback((mode: CameraMode): CapturedPhoto | null => {
    if (!videoRef.current) return null;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    // Convert data URL to File
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const file = new File([u8arr], `healing-photo-${Date.now()}.jpg`, { type: mime });

    return {
      id: `photo-${Date.now()}`,
      dataUrl,
      file,
      timestamp: Date.now(),
      mode
    };
  }, []);

  const toggleFlash = useCallback(async () => {
    if (!stream || !hasFlash) return;

    const videoTrack = stream.getVideoTracks()[0];
    try {
      await videoTrack.applyConstraints({
        // @ts-ignore - torch is not in TypeScript definitions yet
        advanced: [{ torch: !flashEnabled }]
      });
      setFlashEnabled(!flashEnabled);
    } catch (err) {
      console.error('Flash toggle error:', err);
    }
  }, [stream, hasFlash, flashEnabled]);

  const switchCamera = useCallback(() => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, [stopCamera]);

  useEffect(() => {
    if (facingMode) {
      initializeCamera();
    }
    return () => stopCamera();
  }, [facingMode, initializeCamera, stopCamera]);

  return {
    stream,
    isInitializing,
    error,
    videoRef,
    facingMode,
    hasFlash,
    flashEnabled,
    capturePhoto,
    toggleFlash,
    switchCamera,
    initializeCamera,
    stopCamera
  };
};
