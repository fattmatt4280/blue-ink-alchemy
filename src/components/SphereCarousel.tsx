import { useState, useEffect, useRef, useCallback } from 'react';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  description?: string;
  image_url?: string;
  size?: string;
  popular?: boolean;
  most_popular?: boolean;
  display_order: number;
}

interface SphereCarouselProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onProductView: (product: Product) => void;
}

const SphereCarousel = ({ products, onAddToCart, onProductView }: SphereCarouselProps) => {
  const [rotationY, setRotationY] = useState(0);
  const [rotationX, setRotationX] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout>();
  const rafId = useRef<number | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTouchXRef = useRef(0);
  
  const radius = 250; // Sphere radius - reduced for better screen fit
  const itemsPerRow = Math.min(8, products.length); // Maximum 8 items in a circle

  const normalizeAngle = (angle: number) => ((angle % 360) + 360) % 360;

  // Disabled scroll-to-rotate functionality to prevent unwanted side-to-side movement
  // useEffect(() => {
  //   // Initialize to prevent a large first delta
  //   lastScrollY.current = window.scrollY;

  //   const onScroll = () => {
  //     if (rafId.current !== null) return;
  //     rafId.current = requestAnimationFrame(() => {
  //       const currentScrollY = window.scrollY;
  //       const scrollDelta = currentScrollY - lastScrollY.current;

  //       if (Math.abs(scrollDelta) > 8) {
  //         setIsScrolling(true);
  //         // Smooth proportional rotation with normalization
  //         setRotationY(prev => normalizeAngle(prev + scrollDelta * 0.25));

  //         if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
  //         scrollTimeout.current = setTimeout(() => setIsScrolling(false), 600);
  //       }

  //       lastScrollY.current = currentScrollY;
  //       rafId.current = null;
  //     });
  //   };

  //   window.addEventListener('scroll', onScroll, { passive: true });

  //   return () => {
  //     window.removeEventListener('scroll', onScroll);
  //     if (rafId.current !== null) cancelAnimationFrame(rafId.current);
  //     if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
  //   };
  // }, []);

  const getProductPosition = (index: number) => {
    const angleY = (index / itemsPerRow) * 360;
    const angleX = Math.sin(index * 0.5) * 30; // Slight vertical variation
    
    const x = Math.sin((angleY * Math.PI) / 180) * radius;
    const z = Math.cos((angleY * Math.PI) / 180) * radius;
    const y = Math.sin((angleX * Math.PI) / 180) * 100;

    return {
      transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${-angleY}deg)`,
      opacity: z > -200 ? 1 : 0.3, // Fade products that are far back
      scale: z > -200 ? 1 : 0.8, // Scale down distant products
    };
  };

  const handleTouchStart = useCallback((e: any) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
    lastTouchXRef.current = t.clientX;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: any) => {
    if (!isDragging) return;
    const t = e.touches[0];
    const dxTotal = t.clientX - touchStartRef.current.x;
    const dyTotal = t.clientY - touchStartRef.current.y;

    if (Math.abs(dxTotal) > Math.abs(dyTotal) && Math.abs(dxTotal) > 6) {
      e.preventDefault();
      const dx = t.clientX - lastTouchXRef.current;
      setRotationY(prev => normalizeAngle(prev - dx * 0.35));
      lastTouchXRef.current = t.clientX;
    }
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="relative w-full h-[400px] overflow-hidden">
      {/* 3D Container */}
      <div 
        className="relative w-full h-full"
        style={{
          perspective: '800px',
          perspectiveOrigin: 'center center',
        }}
      >
        {/* Sphere Container */}
        <div
          className={`relative w-full h-full transition-transform ease-out ${isDragging ? '' : 'duration-300'}`}
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
            transformOrigin: 'center center',
            willChange: 'transform',
            touchAction: 'pan-y',
            transitionDuration: isDragging ? '0ms' : undefined,
          }}
        >
          {products.map((product, index) => {
            const position = getProductPosition(index);
            return (
              <div
                key={product.id}
                className="absolute transition-all duration-500 ease-out"
                style={{
                  ...position,
                  left: '50%',
                  top: '50%',
                  width: '220px',
                  height: '320px',
                  marginLeft: '-110px',
                  marginTop: '-160px',
                  transformOrigin: 'center center',
                  backfaceVisibility: 'hidden',
                }}
              >
                <div 
                  className="w-full h-full transition-transform duration-300"
                  style={{
                    transform: `scale(${position.scale})`,
                    opacity: position.opacity,
                  }}
                >
                  <ProductCard
                    product={product}
                    onAddToCart={onAddToCart}
                    onProductView={onProductView}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-10">
        <button
          onClick={() => setRotationY(prev => normalizeAngle(prev - 45))}
          className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border border-primary/20 flex items-center justify-center hover:bg-primary/10 transition-colors"
          aria-label="Rotate left"
        >
          ←
        </button>
      </div>
      
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-10">
        <button
          onClick={() => setRotationY(prev => normalizeAngle(prev + 45))}
          className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border border-primary/20 flex items-center justify-center hover:bg-primary/10 transition-colors"
          aria-label="Rotate right"
        >
          →
        </button>
      </div>

      {/* Scroll Indicator */}
      {isScrolling && (
        <div className="absolute top-4 right-4 z-10 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm text-sm text-primary animate-fade-in">
          Scroll to rotate sphere
        </div>
      )}

      {/* Center Indicator */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary/30 z-0" />
    </div>
  );
};

export default SphereCarousel;