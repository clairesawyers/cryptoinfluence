/**
 * Advanced gesture utilities for mobile touch interactions
 */

export interface TouchPoint {
  x: number;
  y: number;
  id: number;
}

export interface GestureState {
  scale: number;
  rotation: number;
  translateX: number;
  translateY: number;
  velocity: { x: number; y: number };
  isActive: boolean;
}

export interface PinchGestureData {
  scale: number;
  center: { x: number; y: number };
  distance: number;
  angle: number;
}

export interface PanGestureData {
  deltaX: number;
  deltaY: number;
  velocityX: number;
  velocityY: number;
  center: { x: number; y: number };
}

/**
 * Calculate distance between two touch points
 */
export const getDistance = (touch1: TouchPoint, touch2: TouchPoint): number => {
  const dx = touch1.x - touch2.x;
  const dy = touch1.y - touch2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Calculate angle between two touch points
 */
export const getAngle = (touch1: TouchPoint, touch2: TouchPoint): number => {
  return Math.atan2(touch2.y - touch1.y, touch2.x - touch1.x) * (180 / Math.PI);
};

/**
 * Get center point between two touches
 */
export const getCenter = (touch1: TouchPoint, touch2: TouchPoint): { x: number; y: number } => {
  return {
    x: (touch1.x + touch2.x) / 2,
    y: (touch1.y + touch2.y) / 2
  };
};

/**
 * Convert Touch object to TouchPoint
 */
export const touchToPoint = (touch: Touch): TouchPoint => ({
  x: touch.clientX,
  y: touch.clientY,
  id: touch.identifier
});

/**
 * Get all touch points from TouchList
 */
export const getTouchPoints = (touches: TouchList): TouchPoint[] => {
  return Array.from(touches).map(touchToPoint);
};

/**
 * Clamp value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Linear interpolation between two values
 */
export const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

/**
 * Apply easing to a value (ease-out cubic)
 */
export const easeOut = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

/**
 * Calculate momentum-based animation values
 */
export const calculateMomentum = (
  current: number,
  velocity: number,
  deceleration: number = 0.0006,
  maxDistance: number = 2000
): { destination: number; duration: number } => {
  const distance = Math.min(
    maxDistance,
    Math.abs(velocity) / deceleration
  );
  
  const destination = current + (velocity > 0 ? distance : -distance);
  const duration = Math.abs(velocity) / deceleration;
  
  return { destination, duration };
};

/**
 * Constrain transform within bounds
 */
export const constrainTransform = (
  transform: { x: number; y: number; scale: number },
  bounds: { width: number; height: number },
  containerBounds: { width: number; height: number }
): { x: number; y: number; scale: number } => {
  const { x, y, scale } = transform;
  const { width, height } = bounds;
  const { width: containerWidth, height: containerHeight } = containerBounds;
  
  // Constrain scale
  const constrainedScale = clamp(scale, 0.5, 4);
  
  // Calculate content dimensions at current scale
  const scaledWidth = width * constrainedScale;
  const scaledHeight = height * constrainedScale;
  
  // Constrain pan based on scale
  let constrainedX = x;
  let constrainedY = y;
  
  if (scaledWidth > containerWidth) {
    const maxX = (scaledWidth - containerWidth) / 2;
    constrainedX = clamp(x, -maxX, maxX);
  } else {
    constrainedX = 0; // Center when content is smaller than container
  }
  
  if (scaledHeight > containerHeight) {
    const maxY = (scaledHeight - containerHeight) / 2;
    constrainedY = clamp(y, -maxY, maxY);
  } else {
    constrainedY = 0; // Center when content is smaller than container
  }
  
  return {
    x: constrainedX,
    y: constrainedY,
    scale: constrainedScale
  };
};

/**
 * Get optimal zoom level for content to fit container
 */
export const getFitZoom = (
  contentSize: { width: number; height: number },
  containerSize: { width: number; height: number },
  padding: number = 20
): number => {
  const scaleX = (containerSize.width - padding * 2) / contentSize.width;
  const scaleY = (containerSize.height - padding * 2) / contentSize.height;
  return Math.min(scaleX, scaleY, 1); // Never zoom in beyond 100%
};

/**
 * Animate transform changes with easing
 */
export const animateTransform = (
  from: { x: number; y: number; scale: number },
  to: { x: number; y: number; scale: number },
  duration: number,
  onUpdate: (transform: { x: number; y: number; scale: number }) => void,
  onComplete?: () => void
): () => void => {
  let startTime: number | null = null;
  let animationId: number;
  
  const animate = (timestamp: number) => {
    if (!startTime) startTime = timestamp;
    
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOut(progress);
    
    const current = {
      x: lerp(from.x, to.x, easedProgress),
      y: lerp(from.y, to.y, easedProgress),
      scale: lerp(from.scale, to.scale, easedProgress)
    };
    
    onUpdate(current);
    
    if (progress < 1) {
      animationId = requestAnimationFrame(animate);
    } else {
      onComplete?.();
    }
  };
  
  animationId = requestAnimationFrame(animate);
  
  // Return cancellation function
  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  };
};

/**
 * Calculate rubber band effect for overscroll
 */
export const rubberBand = (distance: number, dimension: number, constant: number = 0.55): number => {
  return (distance * dimension * constant) / (dimension + constant * distance);
};

/**
 * Apply rubber band constraint to transform
 */
export const applyRubberBand = (
  transform: { x: number; y: number; scale: number },
  bounds: { width: number; height: number },
  containerBounds: { width: number; height: number }
): { x: number; y: number; scale: number } => {
  const { x, y, scale } = transform;
  const { width, height } = bounds;
  const { width: containerWidth, height: containerHeight } = containerBounds;
  
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;
  
  let newX = x;
  let newY = y;
  
  // Apply rubber band to X axis
  if (scaledWidth > containerWidth) {
    const maxX = (scaledWidth - containerWidth) / 2;
    if (x > maxX) {
      newX = maxX + rubberBand(x - maxX, containerWidth);
    } else if (x < -maxX) {
      newX = -maxX - rubberBand(-x - maxX, containerWidth);
    }
  } else if (x !== 0) {
    newX = rubberBand(x, containerWidth);
  }
  
  // Apply rubber band to Y axis
  if (scaledHeight > containerHeight) {
    const maxY = (scaledHeight - containerHeight) / 2;
    if (y > maxY) {
      newY = maxY + rubberBand(y - maxY, containerHeight);
    } else if (y < -maxY) {
      newY = -maxY - rubberBand(-y - maxY, containerHeight);
    }
  } else if (y !== 0) {
    newY = rubberBand(y, containerHeight);
  }
  
  return { x: newX, y: newY, scale };
};