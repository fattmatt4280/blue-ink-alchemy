import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const AnnouncementBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem('announcement-banner-easter-dismissed');
    if (dismissed) setIsVisible(false);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('announcement-banner-easter-dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-purple-300 via-pink-200 to-yellow-200 text-purple-900 py-2 relative overflow-hidden z-50">
      <div className="animate-marquee whitespace-nowrap flex">
        {/* Repeated content for seamless loop */}
        {[...Array(4)].map((_, i) => (
          <span key={i} className="mx-8 flex items-center gap-2 text-sm md:text-base">
            <span>🐣 Use code <strong className="font-bold text-purple-700">EASTER15</strong> for 15% OFF</span>
            <span className="mx-4">•</span>
            <span>🌷 Free shipping on orders over $50</span>
            <span className="mx-4">•</span>
            <span>🐰 Easter Sale — Limited Time!</span>
          </span>
        ))}
      </div>
      <button 
        onClick={handleDismiss} 
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
        aria-label="Dismiss announcement"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default AnnouncementBanner;
