import { useCallback, useEffect, useRef, useState } from 'react';
import { type CarouselApi } from '@/components/ui/carousel';

interface UseScrollCarouselOptions {
  throttleMs?: number;
  scrollThreshold?: number;
  autoScrollSpeed?: number;
}

export const useScrollCarousel = (
  carouselApi: CarouselApi | undefined,
  options: UseScrollCarouselOptions = {}
) => {
  const {
    throttleMs = 100,
    scrollThreshold = 50,
    autoScrollSpeed = 1
  } = options;

  const [isScrolling, setIsScrolling] = useState(false);
  const lastScrollY = useRef(0);
  const scrollDirection = useRef<'up' | 'down' | null>(null);
  const throttleTimer = useRef<NodeJS.Timeout>();
  const scrollTimer = useRef<NodeJS.Timeout>();

  const handleScroll = useCallback(() => {
    if (!carouselApi) return;

    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - lastScrollY.current;

    // Determine scroll direction
    if (Math.abs(scrollDelta) > scrollThreshold) {
      const newDirection = scrollDelta > 0 ? 'down' : 'up';
      
      // Only trigger carousel movement if direction changed or significant scroll
      if (newDirection !== scrollDirection.current || Math.abs(scrollDelta) > scrollThreshold * 2) {
        scrollDirection.current = newDirection;
        setIsScrolling(true);

        // Move carousel based on scroll direction
        if (newDirection === 'down') {
          carouselApi.scrollNext();
        } else {
          carouselApi.scrollPrev();
        }

        // Clear existing timer and set new one
        if (scrollTimer.current) {
          clearTimeout(scrollTimer.current);
        }
        
        scrollTimer.current = setTimeout(() => {
          setIsScrolling(false);
          scrollDirection.current = null;
        }, 500);
      }
    }

    lastScrollY.current = currentScrollY;
  }, [carouselApi, scrollThreshold]);

  const throttledHandleScroll = useCallback(() => {
    if (throttleTimer.current) {
      clearTimeout(throttleTimer.current);
    }
    
    throttleTimer.current = setTimeout(handleScroll, throttleMs);
  }, [handleScroll, throttleMs]);

  useEffect(() => {
    if (!carouselApi) return;

    // Initialize scroll position
    lastScrollY.current = window.scrollY;

    // Add scroll listener
    window.addEventListener('scroll', throttledHandleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      if (throttleTimer.current) {
        clearTimeout(throttleTimer.current);
      }
      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current);
      }
    };
  }, [carouselApi, throttledHandleScroll]);

  return {
    isScrolling,
    scrollDirection: scrollDirection.current,
  };
};