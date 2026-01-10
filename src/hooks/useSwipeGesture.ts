import { useRef, useCallback, useEffect } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number; // minimum distance in pixels to trigger swipe
  enabled?: boolean;
}

interface SwipeState {
  startX: number;
  startY: number;
  currentX: number;
  isSwiping: boolean;
}

interface UseSwipeGestureReturn {
  ref: React.RefObject<HTMLDivElement | null>;
  swipeOffset: number;
  isSwiping: boolean;
  resetSwipe: () => void;
}

export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  threshold = 80,
  enabled = true,
}: SwipeGestureOptions): UseSwipeGestureReturn {
  const ref = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<SwipeState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    isSwiping: false,
  });

  const swipeOffsetRef = useRef(0);
  const isSwipingRef = useRef(false);

  const resetSwipe = useCallback(() => {
    swipeOffsetRef.current = 0;
    isSwipingRef.current = false;
    stateRef.current = {
      startX: 0,
      startY: 0,
      currentX: 0,
      isSwiping: false,
    };

    if (ref.current) {
      ref.current.style.transform = '';
      ref.current.style.transition = 'transform 0.2s ease-out';
    }
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;

    const touch = e.touches[0];
    stateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      isSwiping: false,
    };
  }, [enabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - stateRef.current.startX;
    const deltaY = touch.clientY - stateRef.current.startY;

    // Only start swiping if horizontal movement is greater than vertical
    // This prevents swiping when scrolling
    if (!stateRef.current.isSwiping) {
      if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY)) {
        stateRef.current.isSwiping = true;
        isSwipingRef.current = true;
      } else if (Math.abs(deltaY) > 10) {
        // Vertical scroll detected, don't start swipe
        return;
      }
    }

    if (stateRef.current.isSwiping) {
      e.preventDefault();
      stateRef.current.currentX = touch.clientX;

      // Apply resistance at edges
      const resistance = 0.4;
      let offset = deltaX;

      // Apply resistance when swiping beyond threshold
      if (Math.abs(offset) > threshold) {
        const excess = Math.abs(offset) - threshold;
        offset = (threshold + excess * resistance) * Math.sign(offset);
      }

      swipeOffsetRef.current = offset;

      if (ref.current) {
        ref.current.style.transition = 'none';
        ref.current.style.transform = `translateX(${offset}px)`;
      }
    }
  }, [enabled, threshold]);

  const handleTouchEnd = useCallback(() => {
    if (!enabled || !stateRef.current.isSwiping) {
      resetSwipe();
      return;
    }

    const deltaX = stateRef.current.currentX - stateRef.current.startX;

    if (deltaX < -threshold && onSwipeLeft) {
      onSwipeLeft();
    } else if (deltaX > threshold && onSwipeRight) {
      onSwipeRight();
    }

    resetSwipe();
  }, [enabled, threshold, onSwipeLeft, onSwipeRight, resetSwipe]);

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', resetSwipe, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', resetSwipe);
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd, resetSwipe]);

  return {
    ref,
    swipeOffset: swipeOffsetRef.current,
    isSwiping: isSwipingRef.current,
    resetSwipe,
  };
}
