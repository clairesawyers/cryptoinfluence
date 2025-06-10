import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  TouchPoint, 
  GestureState, 
  PinchGestureData, 
  PanGestureData,
  getTouchPoints,
  getDistance,
  getAngle,
  getCenter,
  constrainTransform,
  calculateMomentum,
  animateTransform,
  applyRubberBand,
  getFitZoom
} from '../utils/gestureUtils';

interface AdvancedGestureConfig {
  enablePinch?: boolean;
  enablePan?: boolean;
  enableRotation?: boolean;
  enableMomentum?: boolean;
  enableRubberBand?: boolean;
  minScale?: number;
  maxScale?: number;
  bounds?: { width: number; height: number };
  containerBounds?: { width: number; height: number };
  onGestureStart?: () => void;
  onGestureEnd?: () => void;
  onPinch?: (data: PinchGestureData) => void;
  onPan?: (data: PanGestureData) => void;
  onTransformChange?: (transform: { x: number; y: number; scale: number; rotation: number }) => void;
}

interface AdvancedGestureHandlers {
  onTouchStart: (event: React.TouchEvent) => void;
  onTouchMove: (event: React.TouchEvent) => void;
  onTouchEnd: (event: React.TouchEvent) => void;
  onDoubleClick: () => void;
  reset: () => void;
  fitToScreen: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  transform: { x: number; y: number; scale: number; rotation: number };
  isGestureActive: boolean;
}

export const useAdvancedGestures = (config: AdvancedGestureConfig = {}): AdvancedGestureHandlers => {
  const {
    enablePinch = true,
    enablePan = true,
    enableRotation = false,
    enableMomentum = true,
    enableRubberBand = true,
    minScale = 0.5,
    maxScale = 4,
    bounds,
    containerBounds,
    onGestureStart,
    onGestureEnd,
    onPinch,
    onPan,
    onTransformChange
  } = config;

  const [transform, setTransform] = useState({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0
  });

  const [isGestureActive, setIsGestureActive] = useState(false);
  
  // Gesture state tracking
  const gestureRef = useRef<{
    isActive: boolean;
    startTouches: TouchPoint[];
    lastTouches: TouchPoint[];
    startTransform: { x: number; y: number; scale: number; rotation: number };
    startDistance: number;
    startAngle: number;
    lastTime: number;
    velocity: { x: number; y: number };
    cancelAnimation?: () => void;
  }>({
    isActive: false,
    startTouches: [],
    lastTouches: [],
    startTransform: { x: 0, y: 0, scale: 1, rotation: 0 },
    startDistance: 0,
    startAngle: 0,
    lastTime: Date.now(),
    velocity: { x: 0, y: 0 }
  });

  // Update transform with constraints
  const updateTransform = useCallback((newTransform: Partial<typeof transform>) => {
    setTransform(current => {
      const updated = { ...current, ...newTransform };
      
      // Apply scale constraints
      updated.scale = Math.max(minScale, Math.min(maxScale, updated.scale));
      
      // Apply bounds constraints if provided
      if (bounds && containerBounds) {
        if (enableRubberBand && gestureRef.current.isActive) {
          // Apply rubber band during active gesture
          const constrained = applyRubberBand(updated, bounds, containerBounds);
          updated.x = constrained.x;
          updated.y = constrained.y;
        } else {
          // Hard constraint when not actively gesturing
          const constrained = constrainTransform(updated, bounds, containerBounds);
          updated.x = constrained.x;
          updated.y = constrained.y;
        }
      }
      
      onTransformChange?.(updated);
      return updated;
    });
  }, [bounds, containerBounds, enableRubberBand, minScale, maxScale, onTransformChange]);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    // Prevent default scrolling
    event.preventDefault();
    
    const touches = getTouchPoints(event.touches);
    const now = Date.now();
    
    // Cancel any ongoing animation
    if (gestureRef.current.cancelAnimation) {
      gestureRef.current.cancelAnimation();
      gestureRef.current.cancelAnimation = undefined;
    }
    
    gestureRef.current.isActive = true;
    gestureRef.current.startTouches = touches;
    gestureRef.current.lastTouches = touches;
    gestureRef.current.startTransform = { ...transform };
    gestureRef.current.lastTime = now;
    gestureRef.current.velocity = { x: 0, y: 0 };
    
    if (touches.length === 2 && enablePinch) {
      gestureRef.current.startDistance = getDistance(touches[0], touches[1]);
      gestureRef.current.startAngle = getAngle(touches[0], touches[1]);
    }
    
    setIsGestureActive(true);
    onGestureStart?.();
  }, [transform, enablePinch, onGestureStart]);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (!gestureRef.current.isActive) return;
    
    event.preventDefault();
    
    const touches = getTouchPoints(event.touches);
    const now = Date.now();
    const deltaTime = now - gestureRef.current.lastTime;
    
    if (touches.length === 1 && enablePan) {
      // Single touch - pan gesture
      const touch = touches[0];
      const lastTouch = gestureRef.current.lastTouches[0];
      
      if (lastTouch) {
        const deltaX = touch.x - lastTouch.x;
        const deltaY = touch.y - lastTouch.y;
        
        // Calculate velocity for momentum
        if (deltaTime > 0) {
          gestureRef.current.velocity = {
            x: deltaX / deltaTime,
            y: deltaY / deltaTime
          };
        }
        
        const newTransform = {
          x: transform.x + deltaX,
          y: transform.y + deltaY
        };
        
        updateTransform(newTransform);
        
        onPan?.({
          deltaX,
          deltaY,
          velocityX: gestureRef.current.velocity.x,
          velocityY: gestureRef.current.velocity.y,
          center: { x: touch.x, y: touch.y }
        });
      }
    } else if (touches.length === 2 && enablePinch) {
      // Two touches - pinch/zoom gesture
      const [touch1, touch2] = touches;
      const center = getCenter(touch1, touch2);
      const distance = getDistance(touch1, touch2);
      const angle = getAngle(touch1, touch2);
      
      // Calculate scale change
      const scaleChange = distance / gestureRef.current.startDistance;
      const newScale = gestureRef.current.startTransform.scale * scaleChange;
      
      // Calculate rotation change (if enabled)
      let rotationChange = 0;
      if (enableRotation) {
        rotationChange = angle - gestureRef.current.startAngle;
      }
      
      // Calculate center offset for pinch-to-zoom around gesture center
      const centerX = center.x - (containerBounds?.width || 0) / 2;
      const centerY = center.y - (containerBounds?.height || 0) / 2;
      
      const scaleRatio = newScale / transform.scale;
      const newX = gestureRef.current.startTransform.x + centerX * (1 - scaleRatio);
      const newY = gestureRef.current.startTransform.y + centerY * (1 - scaleRatio);
      
      const newTransform = {
        x: newX,
        y: newY,
        scale: newScale,
        ...(enableRotation && { rotation: gestureRef.current.startTransform.rotation + rotationChange })
      };
      
      updateTransform(newTransform);
      
      onPinch?.({
        scale: newScale,
        center,
        distance,
        angle
      });
    }
    
    gestureRef.current.lastTouches = touches;
    gestureRef.current.lastTime = now;
  }, [transform, enablePan, enablePinch, enableRotation, containerBounds, updateTransform, onPan, onPinch]);

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    event.preventDefault();
    
    const remainingTouches = getTouchPoints(event.touches);
    
    if (remainingTouches.length === 0) {
      // All fingers lifted - end gesture
      gestureRef.current.isActive = false;
      setIsGestureActive(false);
      
      // Apply momentum if enabled and there's significant velocity
      if (enableMomentum && enablePan) {
        const { x: vx, y: vy } = gestureRef.current.velocity;
        const speed = Math.sqrt(vx * vx + vy * vy);
        
        if (speed > 0.5) { // Minimum velocity threshold
          const momentumX = calculateMomentum(transform.x, vx * 1000);
          const momentumY = calculateMomentum(transform.y, vy * 1000);
          
          const targetTransform = {
            x: momentumX.destination,
            y: momentumY.destination,
            scale: transform.scale,
            rotation: transform.rotation
          };
          
          // Apply constraints to momentum target
          let constrainedTarget = targetTransform;
          if (bounds && containerBounds) {
            constrainedTarget = {
              ...constrainTransform(targetTransform, bounds, containerBounds),
              rotation: targetTransform.rotation
            };
          }
          
          const duration = Math.max(momentumX.duration, momentumY.duration);
          
          gestureRef.current.cancelAnimation = animateTransform(
            transform,
            constrainedTarget,
            Math.min(duration, 1000), // Cap duration at 1 second
            updateTransform,
            () => {
              gestureRef.current.cancelAnimation = undefined;
            }
          );
        } else if (bounds && containerBounds) {
          // Snap back to bounds if outside
          const constrained = constrainTransform(transform, bounds, containerBounds);
          if (constrained.x !== transform.x || constrained.y !== transform.y) {
            gestureRef.current.cancelAnimation = animateTransform(
              transform,
              { ...constrained, rotation: transform.rotation },
              300,
              updateTransform,
              () => {
                gestureRef.current.cancelAnimation = undefined;
              }
            );
          }
        }
      } else if (bounds && containerBounds) {
        // Snap back to bounds
        const constrained = constrainTransform(transform, bounds, containerBounds);
        if (constrained.x !== transform.x || constrained.y !== transform.y) {
          gestureRef.current.cancelAnimation = animateTransform(
            transform,
            { ...constrained, rotation: transform.rotation },
            300,
            updateTransform,
            () => {
              gestureRef.current.cancelAnimation = undefined;
            }
          );
        }
      }
      
      onGestureEnd?.();
    } else if (remainingTouches.length === 1 && gestureRef.current.lastTouches.length === 2) {
      // Transition from pinch to pan
      gestureRef.current.startTouches = remainingTouches;
      gestureRef.current.lastTouches = remainingTouches;
      gestureRef.current.startTransform = { ...transform };
      gestureRef.current.velocity = { x: 0, y: 0 };
    }
  }, [transform, enableMomentum, enablePan, bounds, containerBounds, updateTransform, onGestureEnd]);

  // Double tap to zoom
  const handleDoubleClick = useCallback(() => {
    if (gestureRef.current.cancelAnimation) {
      gestureRef.current.cancelAnimation();
    }
    
    let targetScale: number;
    let targetX = 0;
    let targetY = 0;
    
    if (transform.scale > 1.5) {
      // Zoom out to fit
      if (bounds && containerBounds) {
        targetScale = getFitZoom(bounds, containerBounds);
      } else {
        targetScale = 1;
      }
    } else {
      // Zoom in
      targetScale = Math.min(maxScale, 2.5);
    }
    
    gestureRef.current.cancelAnimation = animateTransform(
      transform,
      { x: targetX, y: targetY, scale: targetScale, rotation: transform.rotation },
      300,
      updateTransform,
      () => {
        gestureRef.current.cancelAnimation = undefined;
      }
    );
  }, [transform, bounds, containerBounds, maxScale, updateTransform]);

  // Reset transform
  const reset = useCallback(() => {
    if (gestureRef.current.cancelAnimation) {
      gestureRef.current.cancelAnimation();
    }
    
    gestureRef.current.cancelAnimation = animateTransform(
      transform,
      { x: 0, y: 0, scale: 1, rotation: 0 },
      300,
      updateTransform,
      () => {
        gestureRef.current.cancelAnimation = undefined;
      }
    );
  }, [transform, updateTransform]);

  // Fit to screen
  const fitToScreen = useCallback(() => {
    if (!bounds || !containerBounds) return;
    
    if (gestureRef.current.cancelAnimation) {
      gestureRef.current.cancelAnimation();
    }
    
    const fitScale = getFitZoom(bounds, containerBounds);
    
    gestureRef.current.cancelAnimation = animateTransform(
      transform,
      { x: 0, y: 0, scale: fitScale, rotation: 0 },
      300,
      updateTransform,
      () => {
        gestureRef.current.cancelAnimation = undefined;
      }
    );
  }, [transform, bounds, containerBounds, updateTransform]);

  // Zoom in
  const zoomIn = useCallback(() => {
    const newScale = Math.min(maxScale, transform.scale * 1.5);
    updateTransform({ scale: newScale });
  }, [transform.scale, maxScale, updateTransform]);

  // Zoom out
  const zoomOut = useCallback(() => {
    const newScale = Math.max(minScale, transform.scale / 1.5);
    updateTransform({ scale: newScale });
  }, [transform.scale, minScale, updateTransform]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gestureRef.current.cancelAnimation) {
        gestureRef.current.cancelAnimation();
      }
    };
  }, []);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onDoubleClick: handleDoubleClick,
    reset,
    fitToScreen,
    zoomIn,
    zoomOut,
    transform,
    isGestureActive
  };
};