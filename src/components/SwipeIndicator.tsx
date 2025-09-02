import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

interface SwipeIndicatorProps {
  progress: number;
  isVisible: boolean;
}

export function SwipeIndicator({ progress, isVisible }: SwipeIndicatorProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed left-4 top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ease-out ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
      style={{
        transform: `translateY(-50%) translateX(${Math.min(progress * 20, 20)}px)`,
      }}
    >
      <div className="bg-background/80 backdrop-blur-sm border border-border rounded-full p-3 shadow-lg">
        <ChevronRight 
          className="h-6 w-6 text-muted-foreground rotate-180" 
          style={{
            opacity: 0.5 + (progress * 0.5),
          }}
        />
      </div>
    </div>
  );
}