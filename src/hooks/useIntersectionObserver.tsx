import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useIntersectionObserver = (
  options: UseIntersectionObserverOptions = {}
) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true
  } = options;
  
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        
        // Cancel any pending RAF
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }

        // Debounce state updates using requestAnimationFrame
        rafRef.current = requestAnimationFrame(() => {
          if (isVisible && (!triggerOnce || !hasTriggered)) {
            setIsIntersecting(true);
            setHasTriggered(true);
          } else if (!triggerOnce) {
            setIsIntersecting(isVisible);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce, hasTriggered]);

  return { elementRef, isIntersecting };
};