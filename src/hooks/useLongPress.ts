import { useCallback, useRef, useState } from 'react';

interface UseLongPressOptions {
  onLongPress: () => void;
  onPress?: () => void;
  onCancel?: () => void;
  threshold?: number;
  moveThreshold?: number;
  enabled?: boolean;
}

interface UseLongPressReturn {
  isPressed: boolean;
  isLongPressed: boolean;
  handlers: {
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseUp: (e: React.MouseEvent) => void;
    onMouseLeave: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onContextMenu: (e: React.MouseEvent | React.TouchEvent) => void;
  };
}

const DEFAULT_THRESHOLD = 500; // ms
const DEFAULT_MOVE_THRESHOLD = 10; // px

export function useLongPress({
  onLongPress,
  onPress,
  onCancel,
  threshold = DEFAULT_THRESHOLD,
  moveThreshold = DEFAULT_MOVE_THRESHOLD,
  enabled = true,
}: UseLongPressOptions): UseLongPressReturn {
  const [isPressed, setIsPressed] = useState(false);
  const [isLongPressed, setIsLongPressed] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const longPressTriggeredRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const triggerLongPress = useCallback(() => {
    if (!enabled) return;

    longPressTriggeredRef.current = true;
    setIsLongPressed(true);
    onLongPress();
  }, [enabled, onLongPress]);

  const start = useCallback(
    (clientX: number, clientY: number) => {
      if (!enabled) return;

      clearTimer();
      longPressTriggeredRef.current = false;
      startPosRef.current = { x: clientX, y: clientY };
      setIsPressed(true);

      timerRef.current = setTimeout(() => {
        triggerLongPress();
      }, threshold);
    },
    [enabled, clearTimer, threshold, triggerLongPress]
  );

  const end = useCallback(
    (cancelled = false) => {
      clearTimer();
      setIsPressed(false);
      setIsLongPressed(false);

      if (!longPressTriggeredRef.current && !cancelled && enabled) {
        onPress?.();
      }

      if (cancelled) {
        onCancel?.();
      }

      startPosRef.current = null;
      longPressTriggeredRef.current = false;
    },
    [clearTimer, enabled, onPress, onCancel]
  );

  const move = useCallback(
    (clientX: number, clientY: number) => {
      if (!startPosRef.current || longPressTriggeredRef.current) return;

      const dx = Math.abs(clientX - startPosRef.current.x);
      const dy = Math.abs(clientY - startPosRef.current.y);

      if (dx > moveThreshold || dy > moveThreshold) {
        end(true);
      }
    },
    [moveThreshold, end]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return; // Left button only
      start(e.clientX, e.clientY);
    },
    [start]
  );

  const handleMouseUp = useCallback(() => {
    end(false);
  }, [end]);

  const handleMouseLeave = useCallback(() => {
    end(true);
  }, [end]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      move(e.clientX, e.clientY);
    },
    [move]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        start(touch.clientX, touch.clientY);
      }
    },
    [start]
  );

  const handleTouchEnd = useCallback(() => {
    end(false);
  }, [end]);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        move(touch.clientX, touch.clientY);
      }
    },
    [move]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      // Prevent default context menu on touch devices
      if (enabled) {
        e.preventDefault();
      }
    },
    [enabled]
  );

  return {
    isPressed,
    isLongPressed,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave,
      onMouseMove: handleMouseMove,
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      onTouchMove: handleTouchMove,
      onContextMenu: handleContextMenu,
    },
  };
}
