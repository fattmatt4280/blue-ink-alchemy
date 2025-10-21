import { useState } from "react";
import { CapturedPhoto, CameraMode } from "@/hooks/useCamera";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Camera, ArrowRight } from "lucide-react";

interface PhotoReviewScreenProps {
  photos: CapturedPhoto[];
  mode: CameraMode;
  onRetake: () => void;
  onContinue: () => void;
}

export const PhotoReviewScreen = ({ photos, mode, onRetake, onContinue }: PhotoReviewScreenProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentPhoto = photos[currentIndex];

  const nextPhoto = () => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevPhoto = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case 'progress': return 'text-green-500';
      case 'concerns': return 'text-yellow-500';
      case 'urgent': return 'text-red-500';
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case 'progress': return 'Progress Tracking';
      case 'concerns': return 'Possible Concerns';
      case 'urgent': return 'Urgent Assessment';
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-white text-lg font-semibold">Review Photo{photos.length > 1 ? 's' : ''}</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getModeColor()} bg-white/10`}>
            {getModeLabel()}
          </span>
        </div>
        {photos.length > 1 && (
          <p className="text-white/60 text-sm">
            Photo {currentIndex + 1} of {photos.length}
          </p>
        )}
      </div>

      {/* Photo Display */}
      <div className="flex-1 relative flex items-center justify-center bg-black">
        <img
          src={currentPhoto.dataUrl}
          alt={`Review ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />

        {/* Navigation Arrows for Multiple Photos */}
        {photos.length > 1 && (
          <>
            {currentIndex > 0 && (
              <button
                onClick={prevPhoto}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
            )}
            {currentIndex < photos.length - 1 && (
              <button
                onClick={nextPhoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
            )}
          </>
        )}

        {/* Photo Indicators */}
        {photos.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-white w-6' 
                    : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-6 bg-gradient-to-t from-black/80 to-transparent space-y-3">
        <Button
          onClick={onContinue}
          className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90"
        >
          Continue to Questions
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        <Button
          onClick={onRetake}
          variant="outline"
          className="w-full h-12 border-white/20 text-white hover:bg-white/10"
        >
          <Camera className="mr-2 h-4 w-4" />
          Retake Photo{photos.length > 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  );
};
