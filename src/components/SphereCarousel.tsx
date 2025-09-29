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
  const [containerWidth, setContainerWidth] = useState(800);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout>();
  const rafId = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTouchXRef = useRef(0);
  
  // Responsive sizing
  const cardWidth = Math.max(180, Math.min(260, containerWidth * 0.55));
  const cardHeight = cardWidth * 1.4;
  const radius = Math.max(110, Math.min(260, containerWidth / 2 - cardWidth / 2 - 16));
  const totalProducts = Math.max(products.length, 4);

  const normalizeAngle = (angle: number) => ((angle % 360) + 360) % 360;
  const snapToNearest90 = (angle: number) => Math.round(angle / 90) * 90;

  // Set up ResizeObserver for responsive sizing
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    
    resizeObserver.observe(containerRef.current);
    setContainerWidth(containerRef.current.clientWidth);
    
    return () => resizeObserver.disconnect();
  }, []);

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
    // Distribute products evenly around the sphere (90 degrees apart for 4 products)
    const baseAngle = (index / totalProducts) * 360;
    const angleY = baseAngle + rotationY; // Add rotation state
    const angleX = Math.sin(index * 0.3) * 10; // Subtle vertical variation
    
    const x = Math.sin((angleY * Math.PI) / 180) * radius;
    const z = Math.cos((angleY * Math.PI) / 180) * radius;
    const y = Math.sin((angleX * Math.PI) / 180) * 30;

    // Ensure all cards are visible with proper depth sorting
    const normalizedZ = (z + radius) / (2 * radius); // 0 to 1
    const opacity = Math.max(0.7, normalizedZ * 0.3 + 0.7); // Minimum 70% opacity
    const scale = Math.max(0.85, normalizedZ * 0.15 + 0.85); // Minimum 85% scale
    
    // Better z-index calculation to prevent overlap issues
    const zIndex = Math.round((z + radius) * 10) + index;

    return {
      transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${-angleY}deg)`,
      opacity,
      scale,
      zIndex,
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
    
    // Only prevent default for horizontal movements to allow clicks
    const t = e.touches[0];
    const dxTotal = t.clientX - touchStartRef.current.x;
    const dyTotal = t.clientY - touchStartRef.current.y;

    // Only rotate if significant horizontal movement
    if (Math.abs(dxTotal) > Math.abs(dyTotal) && Math.abs(dxTotal) > 10) {
      e.preventDefault();
      const dx = t.clientX - lastTouchXRef.current;
      setRotationY(prev => normalizeAngle(prev - dx * 0.35));
      lastTouchXRef.current = t.clientX;
    }
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    // Snap to nearest 90 degrees for clean alignment
    setRotationY(prev => snapToNearest90(prev));
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-[400px] overflow-hidden">
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
            transform: `translate3d(0,0,0) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
            transformOrigin: 'center center',
            willChange: isDragging ? 'transform' : 'auto',
            touchAction: 'manipulation', // Better for clicks
            transitionDuration: isDragging ? '0ms' : undefined,
            backfaceVisibility: 'hidden',
            contain: 'layout style paint',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {products.map((product, index) => {
            const position = getProductPosition(index);
            return (
                <div
                key={product.id}
                className="absolute transition-all duration-300 ease-out"
                style={{
                  transform: position.transform,
                  left: '50%',
                  top: '50%',
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                  marginLeft: `${-cardWidth / 2}px`,
                  marginTop: `${-cardHeight / 2}px`,
                  transformOrigin: 'center center',
                  backfaceVisibility: 'visible',
                  willChange: isDragging ? 'transform, opacity' : 'auto',
                  zIndex: position.zIndex,
                  pointerEvents: 'auto',
                }}
              >
                <div 
                  className="w-full h-full transition-all duration-300 hover:scale-105"
                  style={{
                    transform: `scale(${position.scale})`,
                    opacity: position.opacity,
                    pointerEvents: 'auto', // Ensure clicks work
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
          onClick={() => setRotationY(prev => snapToNearest90(prev - 90))}
          className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border border-primary/20 flex items-center justify-center hover:bg-primary/10 transition-colors"
          aria-label="Rotate left"
        >
          ←
        </button>
      </div>
      
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-10">
        <button
          onClick={() => setRotationY(prev => snapToNearest90(prev + 90))}
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