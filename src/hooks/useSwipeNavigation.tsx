import { useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface SwipeGesture {
  startX: number;
  startY: number;
  startTime: number;
  currentX: number;
  currentY: number;
  isActive: boolean;
}

interface UseSwipeNavigationOptions {
  minDistance?: number;
  minVelocity?: number;
  maxVerticalDeviation?: number;
  targetRoute?: string;
  onSwipeStart?: () => void;
  onSwipeProgress?: (progress: number) => void;
  onSwipeEnd?: () => void;
}

export function useSwipeNavigation({
  minDistance = 100,
  minVelocity = 0.3,
  maxVerticalDeviation = 50,
  targetRoute = '/',
  onSwipeStart,
  onSwipeProgress,
  onSwipeEnd,
}: UseSwipeNavigationOptions = {}) {
  const navigate = useNavigate();
  const gestureRef = useRef<SwipeGesture>({
    startX: 0,
    startY: 0,
    startTime: 0,
    currentX: 0,
    currentY: 0,
    isActive: false,
  });

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    gestureRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      currentX: touch.clientX,
      currentY: touch.clientY,
      isActive: true,
    };
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!gestureRef.current.isActive) return;

    const touch = e.touches[0];
    gestureRef.current.currentX = touch.clientX;
    gestureRef.current.currentY = touch.clientY;

    const deltaX = touch.clientX - gestureRef.current.startX;
    const deltaY = Math.abs(touch.clientY - gestureRef.current.startY);

    // Check if this is a valid left swipe gesture
    if (deltaX > 0 && deltaX > minDistance / 2 && deltaY < maxVerticalDeviation) {
      const progress = Math.min(deltaX / minDistance, 1);
      onSwipeProgress?.(progress);
      
      if (!onSwipeStart && deltaX > 20) {
        onSwipeStart?.();
      }
    }
  }, [minDistance, maxVerticalDeviation, onSwipeStart, onSwipeProgress]);

  const handleTouchEnd = useCallback(() => {
    if (!gestureRef.current.isActive) return;

    const deltaX = gestureRef.current.currentX - gestureRef.current.startX;
    const deltaY = Math.abs(gestureRef.current.currentY - gestureRef.current.startY);
    const deltaTime = Date.now() - gestureRef.current.startTime;
    const velocity = deltaX / deltaTime;

    // Check if swipe meets thresholds for navigation
    const isValidSwipe = 
      deltaX > minDistance && 
      deltaY < maxVerticalDeviation && 
      velocity > minVelocity;

    if (isValidSwipe) {
      navigate(targetRoute);
    }

    onSwipeEnd?.();
    gestureRef.current.isActive = false;
  }, [navigate, targetRoute, minDistance, maxVerticalDeviation, minVelocity, onSwipeEnd]);

  useEffect(() => {
    const element = document.body;
    
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isActive: gestureRef.current.isActive,
  };
}