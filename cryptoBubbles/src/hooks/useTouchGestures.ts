import { useCallback, useRef } from 'react';

export interface TouchGestureHandlers {
  onTap?: (event: TouchEvent | MouseEvent) => void;
  onDoubleTap?: (event: TouchEvent | MouseEvent) => void;
  onLongPress?: (event: TouchEvent | MouseEvent) => void;
  onSwipe?: (direction: 'up' | 'down' | 'left' | 'right', distance: number, event: TouchEvent) => void;
  onPan?: (deltaX: number, deltaY: number, event: TouchEvent) => void;
  onPanStart?: (event: TouchEvent) => void;
  onPanEnd?: (event: TouchEvent) => void;
}

export interface TouchGestureConfig {
  tapDelay?: number;
  doubleTapDelay?: number;
  longPressDelay?: number;
  swipeThreshold?: number;
  panThreshold?: number;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

const DEFAULT_CONFIG: Required<TouchGestureConfig> = {
  tapDelay: 300,
  doubleTapDelay: 300,
  longPressDelay: 500,
  swipeThreshold: 50,
  panThreshold: 10,
  preventDefault: false,
  stopPropagation: false
};

export const useTouchGestures = (
  handlers: TouchGestureHandlers,
  config: TouchGestureConfig = {}
) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Gesture state
  const gestureState = useRef({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    startTime: 0,
    lastTapTime: 0,
    isPressed: false,
    isPanning: false,
    longPressTimer: null as number | null,
    tapTimer: null as number | null
  });

  const clearTimers = useCallback(() => {
    if (gestureState.current.longPressTimer) {
      clearTimeout(gestureState.current.longPressTimer);
      gestureState.current.longPressTimer = null;
    }
    if (gestureState.current.tapTimer) {
      clearTimeout(gestureState.current.tapTimer);
      gestureState.current.tapTimer = null;
    }
  }, []);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0];
    const now = Date.now();
    
    clearTimers();
    
    gestureState.current = {
      ...gestureState.current,
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      startTime: now,
      isPressed: true,
      isPanning: false
    };

    if (finalConfig.preventDefault) event.preventDefault();
    if (finalConfig.stopPropagation) event.stopPropagation();

    // Start long press timer
    if (handlers.onLongPress) {
      gestureState.current.longPressTimer = window.setTimeout(() => {
        if (gestureState.current.isPressed && !gestureState.current.isPanning) {
          handlers.onLongPress!(event.nativeEvent);
          clearTimers();
        }
      }, finalConfig.longPressDelay);
    }

    // Call pan start handler
    if (handlers.onPanStart) {
      handlers.onPanStart(event.nativeEvent);
    }
  }, [handlers, finalConfig, clearTimers]);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (!gestureState.current.isPressed) return;

    const touch = event.touches[0];
    const deltaX = touch.clientX - gestureState.current.startX;
    const deltaY = touch.clientY - gestureState.current.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    gestureState.current.currentX = touch.clientX;
    gestureState.current.currentY = touch.clientY;

    // Check if movement exceeds pan threshold
    if (distance > finalConfig.panThreshold && !gestureState.current.isPanning) {
      gestureState.current.isPanning = true;
      clearTimers(); // Cancel long press when panning starts
    }

    // Call pan handler
    if (gestureState.current.isPanning && handlers.onPan) {
      handlers.onPan(deltaX, deltaY, event.nativeEvent);
    }

    if (finalConfig.preventDefault) event.preventDefault();
    if (finalConfig.stopPropagation) event.stopPropagation();
  }, [handlers, finalConfig, clearTimers]);

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    if (!gestureState.current.isPressed) return;

    const now = Date.now();
    const deltaX = gestureState.current.currentX - gestureState.current.startX;
    const deltaY = gestureState.current.currentY - gestureState.current.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = now - gestureState.current.startTime;

    clearTimers();

    // Call pan end handler
    if (gestureState.current.isPanning && handlers.onPanEnd) {
      handlers.onPanEnd(event.nativeEvent);
    }

    // Check for swipe
    if (gestureState.current.isPanning && distance > finalConfig.swipeThreshold && handlers.onSwipe) {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      
      let direction: 'up' | 'down' | 'left' | 'right';
      if (absX > absY) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }
      
      handlers.onSwipe(direction, distance, event.nativeEvent);
    }
    // Check for tap (if not panning and quick enough)
    else if (!gestureState.current.isPanning && duration < finalConfig.tapDelay) {
      const timeSinceLastTap = now - gestureState.current.lastTapTime;
      
      // Check for double tap
      if (timeSinceLastTap < finalConfig.doubleTapDelay && handlers.onDoubleTap) {
        handlers.onDoubleTap(event.nativeEvent);
        gestureState.current.lastTapTime = 0; // Reset to prevent triple tap
      }
      // Single tap (with delay to check for double tap)
      else if (handlers.onTap) {
        if (handlers.onDoubleTap) {
          // Delay single tap to check for double tap
          gestureState.current.tapTimer = window.setTimeout(() => {
            handlers.onTap!(event.nativeEvent);
          }, finalConfig.doubleTapDelay);
        } else {
          // No double tap handler, immediate single tap
          handlers.onTap(event.nativeEvent);
        }
        gestureState.current.lastTapTime = now;
      }
    }

    gestureState.current.isPressed = false;
    gestureState.current.isPanning = false;

    if (finalConfig.preventDefault) event.preventDefault();
    if (finalConfig.stopPropagation) event.stopPropagation();
  }, [handlers, finalConfig, clearTimers]);

  // Mouse event handlers for desktop compatibility
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    const now = Date.now();
    
    clearTimers();
    
    gestureState.current = {
      ...gestureState.current,
      startX: event.clientX,
      startY: event.clientY,
      currentX: event.clientX,
      currentY: event.clientY,
      startTime: now,
      isPressed: true,
      isPanning: false
    };

    if (finalConfig.preventDefault) event.preventDefault();
    if (finalConfig.stopPropagation) event.stopPropagation();

    // Start long press timer
    if (handlers.onLongPress) {
      gestureState.current.longPressTimer = window.setTimeout(() => {
        if (gestureState.current.isPressed && !gestureState.current.isPanning) {
          handlers.onLongPress!(event.nativeEvent);
          clearTimers();
        }
      }, finalConfig.longPressDelay);
    }
  }, [handlers, finalConfig, clearTimers]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!gestureState.current.isPressed) return;

    const deltaX = event.clientX - gestureState.current.startX;
    const deltaY = event.clientY - gestureState.current.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    gestureState.current.currentX = event.clientX;
    gestureState.current.currentY = event.clientY;

    // Check if movement exceeds pan threshold
    if (distance > finalConfig.panThreshold && !gestureState.current.isPanning) {
      gestureState.current.isPanning = true;
      clearTimers(); // Cancel long press when panning starts
    }

    // Call pan handler
    if (gestureState.current.isPanning && handlers.onPan) {
      handlers.onPan(deltaX, deltaY, event.nativeEvent as any);
    }

    if (finalConfig.preventDefault) event.preventDefault();
    if (finalConfig.stopPropagation) event.stopPropagation();
  }, [handlers, finalConfig, clearTimers]);

  const handleMouseUp = useCallback((event: React.MouseEvent) => {
    if (!gestureState.current.isPressed) return;

    const now = Date.now();
    const duration = now - gestureState.current.startTime;

    clearTimers();

    // Call pan end handler
    if (gestureState.current.isPanning && handlers.onPanEnd) {
      handlers.onPanEnd(event.nativeEvent as any);
    }

    // Check for tap (if not panning and quick enough)
    if (!gestureState.current.isPanning && duration < finalConfig.tapDelay) {
      const timeSinceLastTap = now - gestureState.current.lastTapTime;
      
      // Check for double tap
      if (timeSinceLastTap < finalConfig.doubleTapDelay && handlers.onDoubleTap) {
        handlers.onDoubleTap(event.nativeEvent);
        gestureState.current.lastTapTime = 0; // Reset to prevent triple tap
      }
      // Single tap (with delay to check for double tap)
      else if (handlers.onTap) {
        if (handlers.onDoubleTap) {
          // Delay single tap to check for double tap
          gestureState.current.tapTimer = window.setTimeout(() => {
            handlers.onTap!(event.nativeEvent);
          }, finalConfig.doubleTapDelay);
        } else {
          // No double tap handler, immediate single tap
          handlers.onTap(event.nativeEvent);
        }
        gestureState.current.lastTapTime = now;
      }
    }

    gestureState.current.isPressed = false;
    gestureState.current.isPanning = false;

    if (finalConfig.preventDefault) event.preventDefault();
    if (finalConfig.stopPropagation) event.stopPropagation();
  }, [handlers, finalConfig, clearTimers]);

  // Cleanup on unmount
  const handleCleanup = useCallback(() => {
    clearTimers();
  }, [clearTimers]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    cleanup: handleCleanup
  };
};

// Convenience hook for simple tap handling
export const useSimpleTap = (onTap: (event: TouchEvent | MouseEvent) => void) => {
  return useTouchGestures({ onTap });
};

// Convenience hook for swipe handling
export const useSwipe = (onSwipe: TouchGestureHandlers['onSwipe']) => {
  return useTouchGestures({ onSwipe });
};