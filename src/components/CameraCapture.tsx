import { useState, useEffect } from "react";
import { useCamera, CapturedPhoto, CameraMode } from "@/hooks/useCamera";
import { CameraModeSelector } from "./CameraModeSelector";
import { Button } from "./ui/button";
import { Camera, RotateCw, Zap, ZapOff, Image as ImageIcon, X, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import healaidShield from "@/assets/healaid-shield-logo.jpeg";

interface CameraCaptureProps {
  onPhotosCapture: (photos: CapturedPhoto[], mode: CameraMode) => void;
  onCancel?: () => void;
  maxPhotos?: number;
}

export const CameraCapture = ({ onPhotosCapture, onCancel, maxPhotos = 5 }: CameraCaptureProps) => {
  const [selectedMode, setSelectedMode] = useState<CameraMode>('progress');
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  const {
    videoRef,
    isInitializing,
    error,
    hasFlash,
    flashEnabled,
    capturePhoto,
    toggleFlash,
    switchCamera,
    stopCamera
  } = useCamera();

  useEffect(() => {
    // Check if camera API is available
    if (!navigator.mediaDevices?.getUserMedia) {
      setShowPermissionPrompt(true);
    }
  }, []);

  const handleCapture = () => {
    const photo = capturePhoto(selectedMode);
    if (photo) {
      setCapturedPhotos(prev => [...prev, photo]);
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Gallery change fired, files:", e.target.files?.length);
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photo: CapturedPhoto = {
          id: `gallery-${Date.now()}-${Math.random()}`,
          dataUrl: reader.result as string,
          file,
          timestamp: Date.now(),
          mode: selectedMode
        };
        setCapturedPhotos(prev => [...prev, photo]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleRemovePhoto = (id: string) => {
    setCapturedPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleContinue = () => {
    if (capturedPhotos.length > 0) {
      stopCamera();
      onPhotosCapture(capturedPhotos, selectedMode);
    }
  };

  const handleClose = () => {
    stopCamera();
    onCancel?.();
  };

  const canCaptureMore = capturedPhotos.length < maxPhotos;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}

        {/* Heal-AId Branding Header - Full Width */}
        <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black via-black/90 to-transparent pb-4">
          <div className="flex items-center justify-center gap-4 py-4 px-6">
            <img 
              src={healaidShield} 
              alt="Heal-AId" 
              className="w-14 h-14 rounded-xl shadow-[0_0_25px_rgba(0,255,255,0.6)] border-2 border-cyan-400/50"
            />
            <div className="flex flex-col">
              <span className="text-3xl font-rajdhani font-bold tracking-wider bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,255,255,0.7)]">
                HEAL-AId
              </span>
              <span className="text-xs text-cyan-300/80 tracking-[0.3em] uppercase">
                Tattoo Healing Monitor
              </span>
            </div>
          </div>
          {/* Neon accent line */}
          <div className="h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_rgba(0,255,255,0.5)]" />
        </div>

        {/* Top Controls */}
        <div className="absolute top-24 left-0 right-0 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
            
            {hasFlash && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFlash}
                className="text-white hover:bg-white/20"
              >
                {flashEnabled ? <Zap className="h-5 w-5" /> : <ZapOff className="h-5 w-5" />}
              </Button>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={switchCamera}
            className="text-white hover:bg-white/20"
          >
            <RotateCw className="h-5 w-5" />
          </Button>
        </div>

        {/* Mode Indicator */}
        <div className="absolute top-28 left-1/2 -translate-x-1/2">
          <div className="px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm border border-white/20">
            <p className="text-white text-sm font-medium">
              {selectedMode === 'progress' && '📊 Progress Tracking'}
              {selectedMode === 'concerns' && '⚠️ Possible Concerns'}
              {selectedMode === 'urgent' && '🚨 Urgent Assessment'}
            </p>
          </div>
        </div>

        {/* Capture Button & Gallery */}
        <div className="absolute bottom-4 left-0 right-0 z-20 flex items-center justify-center gap-6 px-6">
          {/* Gallery Button */}
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors">
              <ImageIcon className="h-6 w-6 text-white" />
            </div>
            <input
              id="gallery-upload"
              type="file"
              accept="image/*,.heic,.heif"
              multiple
              onChange={handleGalleryUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={!canCaptureMore}
            />
          </div>

          {/* Capture Button - Heal-AId Branded */}
          <button
            onClick={handleCapture}
            disabled={!canCaptureMore || isInitializing}
            className="relative w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-[0_0_25px_rgba(0,255,255,0.6)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
          >
            <div className="w-16 h-16 rounded-full border-2 border-white/50 overflow-hidden">
              <img 
                src={healaidShield} 
                alt="Capture" 
                className="w-full h-full object-cover"
              />
            </div>
          </button>

          {/* Continue Button (when photos captured) */}
          {capturedPhotos.length > 0 && (
            <Button
              onClick={handleContinue}
              className="w-12 h-12 rounded-xl bg-primary hover:bg-primary/90"
            >
              ✓
            </Button>
          )}
        </div>

        {/* Photo Preview Strip */}
        {capturedPhotos.length > 0 && (
          <div className="absolute bottom-28 left-0 right-0 px-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {capturedPhotos.map((photo) => (
                <div key={photo.id} className="relative flex-shrink-0">
                  <img
                    src={photo.dataUrl}
                    alt="Captured"
                    className="w-16 h-16 rounded-lg object-cover border-2 border-white/50"
                  />
                  <button
                    onClick={() => handleRemovePhoto(photo.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mode Selector */}
      <CameraModeSelector selectedMode={selectedMode} onModeChange={setSelectedMode} />

      {/* Permission Prompt for Fallback */}
      {showPermissionPrompt && !error && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">Camera Access Required</h3>
            <p className="text-white/70 mb-6">
              Please allow camera access to capture photos. You can also upload from your gallery.
            </p>
            <div className="relative w-full">
              <Button className="w-full pointer-events-none">
                Upload from Gallery
              </Button>
              <input
                id="gallery-upload-fallback"
                type="file"
                accept="image/*,.heic,.heif"
                multiple
                onChange={handleGalleryUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
