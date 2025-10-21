import { useState, useEffect } from "react";
import { useCamera, CapturedPhoto, CameraMode } from "@/hooks/useCamera";
import { CameraModeSelector } from "./CameraModeSelector";
import { Button } from "./ui/button";
import { Camera, RotateCw, Zap, ZapOff, Image as ImageIcon, X, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface CameraCaptureProps {
  onPhotosCapture: (photos: CapturedPhoto[], mode: CameraMode) => void;
  maxPhotos?: number;
}

export const CameraCapture = ({ onPhotosCapture, maxPhotos = 5 }: CameraCaptureProps) => {
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

        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center gap-2">
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
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <div className="px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm border border-white/20">
            <p className="text-white text-sm font-medium">
              {selectedMode === 'progress' && '📊 Progress Tracking'}
              {selectedMode === 'concerns' && '⚠️ Possible Concerns'}
              {selectedMode === 'urgent' && '🚨 Urgent Assessment'}
            </p>
          </div>
        </div>

        {/* Capture Button & Gallery */}
        <div className="absolute bottom-24 left-0 right-0 flex items-center justify-center gap-6 px-6">
          {/* Gallery Button */}
          <label className="cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors">
              <ImageIcon className="h-6 w-6 text-white" />
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryUpload}
              className="hidden"
              disabled={!canCaptureMore}
            />
          </label>

          {/* Capture Button */}
          <button
            onClick={handleCapture}
            disabled={!canCaptureMore || isInitializing}
            className="relative w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
          >
            <div className="w-16 h-16 rounded-full border-4 border-black flex items-center justify-center">
              <Camera className="h-8 w-8 text-black" />
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
          <div className="absolute bottom-36 left-0 right-0 px-4">
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
            <label>
              <Button className="w-full">
                Upload from Gallery
              </Button>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
