import React, { useRef, useEffect, useState, useCallback } from 'react';
import { BubbleCard } from '../../types';
import { useTouchGestures } from '../../hooks/useTouchGestures';
import { useMobileDetect } from '../../hooks/useMobileDetect';
import { usePerformantAnimation } from '../../hooks/usePerformantAnimation';
import { useAdvancedGestures } from '../../hooks/useAdvancedGestures';
import { getOptimalBubbleSize, getCanvasFontConfig } from '../../utils/responsiveSizing';
import { setupHighDPICanvas, getOptimizedCanvasContext, clearCanvas, getHighDPIFontSize } from '../../utils/canvasUtils';
import { useSafeAreaInsets } from '../../utils/safeArea';
import { useHapticFeedback } from '../../utils/hapticFeedback';
import { 
  drawLoadingShimmer, 
  drawThumbnailSkeleton, 
  drawLoadingSpinner,
  CanvasLoadingManager 
} from '../../utils/loadingAnimations';

interface MobileBubbleCanvasProps {
  bubbles: Bubble[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  width: number;
  height: number;
}

export const MobileBubbleCanvas: React.FC<MobileBubbleCanvasProps> = ({
  bubbles,
  selectedId,
  onSelect,
  width,
  height
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasConfigRef = useRef<any>(null);
  const [touchFeedback, setTouchFeedback] = useState<{ x: number; y: number } | null>(null);
  const [isGestureMode, setIsGestureMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isMobile, isTouch } = useMobileDetect();
  const { getSafeCanvasStyle, getSafeDimensions } = useSafeAreaInsets();
  const haptic = useHapticFeedback();
  const loadingManagerRef = useRef(new CanvasLoadingManager());
  
  // Calculate responsive bubble sizes
  const bubbleConfig = getOptimalBubbleSize(width, height, bubbles.length);
  
  // Advanced gesture handling
  const advancedGestures = useAdvancedGestures({
    enablePinch: true,
    enablePan: true,
    enableMomentum: true,
    enableRubberBand: true,
    minScale: 0.5,
    maxScale: 4,
    bounds: { width, height },
    containerBounds: { width, height },
    onGestureStart: () => {
      setIsGestureMode(true);
    },
    onGestureEnd: () => {
      setIsGestureMode(false);
    },
    onTransformChange: (transform) => {
      // Transform is automatically managed by the hook
    }
  });

  // Performance-optimized drawing function
  const drawCanvas = useCallback((timestamp: number, qualityLevel: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasConfigRef.current) return;
    
    const ctx = getOptimizedCanvasContext(canvas);
    const canvasConfig = canvasConfigRef.current;
    
    // Clear canvas with high-DPI support
    clearCanvas(ctx, width, height);
    
    // Apply advanced gesture transform
    ctx.save();
    ctx.translate(width / 2, height / 2); // Center the transform origin
    ctx.translate(advancedGestures.transform.x, advancedGestures.transform.y);
    ctx.scale(advancedGestures.transform.scale, advancedGestures.transform.scale);
    if (advancedGestures.transform.rotation !== 0) {
      ctx.rotate(advancedGestures.transform.rotation * Math.PI / 180);
    }
    ctx.translate(-width / 2, -height / 2); // Reset origin
    
    // Adjust rendering quality based on performance
    const renderQuality = qualityLevel;
    const shouldRenderShadows = renderQuality > 0.5;
    const shouldRenderLabels = renderQuality > 0.25;
    
    // Show loading state if no bubbles or still loading
    if (bubbles.length === 0 || isLoading) {
      // Draw loading spinner in center
      drawLoadingSpinner(
        ctx,
        width / 2,
        height / 2,
        30,
        timestamp,
        { foregroundColor: '#3b82f6', backgroundColor: 'rgba(255, 255, 255, 0.1)' }
      );
      
      // Draw skeleton bubbles
      const skeletonCount = 6;
      for (let i = 0; i < skeletonCount; i++) {
        const angle = (i / skeletonCount) * Math.PI * 2;
        const radius = Math.min(width, height) * 0.25;
        const x = width / 2 + Math.cos(angle) * radius;
        const y = height / 2 + Math.sin(angle) * radius;
        const size = 40 + Math.sin(timestamp * 0.003 + i) * 10;
        
        drawLoadingShimmer(
          ctx,
          x - size / 2,
          y - size / 2,
          size,
          size,
          timestamp + i * 200,
          { baseColor: '#2a2a2a', highlightColor: '#3a3a3a', direction: 'diagonal' }
        );
      }
      
      ctx.restore();
      return;
    }
    
    // Draw bubbles with responsive sizing and quality adjustments
    bubbles.forEach(bubble => {
      const isSelected = bubble.id === selectedId;
      
      // Apply responsive sizing
      const scaledSize = Math.max(
        bubbleConfig.minRadius,
        Math.min(bubbleConfig.maxRadius, bubble.size * bubbleConfig.scaleFactor * renderQuality)
      );
      
      // Ensure minimum touch target
      const finalSize = Math.max(scaledSize, bubbleConfig.touchTargetMin / 2);
      
      // Shadow for depth (only if quality allows)
      if (shouldRenderShadows && (isSelected || (isMobile && finalSize > bubbleConfig.minRadius))) {
        ctx.shadowColor = bubble.color + '40';
        ctx.shadowBlur = finalSize * 0.5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
      }
      
      // Bubble fill
      const gradient = ctx.createRadialGradient(
        bubble.x - finalSize * 0.3,
        bubble.y - finalSize * 0.3,
        0,
        bubble.x,
        bubble.y,
        finalSize
      );
      gradient.addColorStop(0, bubble.color + 'FF');
      gradient.addColorStop(0.7, bubble.color + 'CC');
      gradient.addColorStop(1, bubble.color + '99');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, finalSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      
      // Selection ring
      if (isSelected) {
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, finalSize + 5, 0, Math.PI * 2);
        ctx.stroke();
        
        // Pulsing effect (only if high quality)
        if (shouldRenderShadows) {
          const pulse = Math.sin(timestamp * 0.003) * 0.5 + 0.5;
          ctx.strokeStyle = `rgba(59, 130, 246, ${pulse * 0.5})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(bubble.x, bubble.y, finalSize + 10, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      
      // Label (only for larger bubbles and if quality allows)
      if (shouldRenderLabels && (!isMobile || finalSize > bubbleConfig.minRadius)) {
        ctx.fillStyle = 'white';
        
        // Use mobile-first responsive font sizing
        const baseFontSize = Math.max(10, finalSize * 0.3);
        const labelFontConfig = getCanvasFontConfig(
          baseFontSize,
          width, // screen width
          finalSize * 2, // approximate "card" width for bubble
          'label',
          canvasConfig.devicePixelRatio
        );
        
        ctx.font = `600 ${labelFontConfig.fontSize}px ${labelFontConfig.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Truncate label if needed
        let label = bubble.label;
        if (isMobile && label.length > 10) {
          label = label.substring(0, 9) + '...';
        }
        
        ctx.fillText(label, bubble.x, bubble.y);
      }
    });
    
    ctx.restore();
    
    // Draw touch feedback (only if high quality and not in gesture mode)
    if (shouldRenderShadows && touchFeedback && !isGestureMode) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform for UI elements
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(touchFeedback.x, touchFeedback.y, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }, [bubbles, selectedId, width, height, advancedGestures.transform, touchFeedback, isMobile, bubbleConfig, isGestureMode]);

  // Performance-optimized animation
  const {
    isAnimating,
    qualityLevel,
    startAnimation,
    stopAnimation,
    recordInteraction,
    getPerformanceMetrics
  } = usePerformantAnimation(drawCanvas, {
    inactivityTimeout: 3000,
    throttleMs: isMobile ? 33 : 16, // 30fps on mobile, 60fps on desktop
    adaptiveQuality: true,
    batteryOptimization: true
  });
  
  // Legacy touch gestures for simple tap detection (when not in gesture mode)
  const { handleTouchStart: legacyTouchStart, handleTouchMove: legacyTouchMove, handleTouchEnd: legacyTouchEnd } = useTouchGestures({
    onTap: (point) => {
      if (isGestureMode || advancedGestures.isGestureActive) return;
      
      recordInteraction(); // Record interaction for performance optimization
      
      // Find bubble at tap point with transform applied
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const canvasX = point.x - rect.left;
      const canvasY = point.y - rect.top;
      
      // Convert screen coordinates to canvas coordinates with transform
      const { x: transformX, y: transformY, scale } = advancedGestures.transform;
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Reverse the transform to get actual canvas coordinates
      const x = (canvasX - centerX - transformX) / scale + centerX;
      const y = (canvasY - centerY - transformY) / scale + centerY;
      
      // Check bubbles in reverse order (top to bottom)
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const bubble = bubbles[i];
        // Use responsive sizing for hit detection
        const scaledSize = Math.max(
          bubbleConfig.minRadius,
          Math.min(bubbleConfig.maxRadius, bubble.size * bubbleConfig.scaleFactor)
        );
        const finalSize = Math.max(scaledSize, bubbleConfig.touchTargetMin / 2);
        
        const distance = Math.sqrt((x - bubble.x) ** 2 + (y - bubble.y) ** 2);
        if (distance <= finalSize) {
          onSelect(bubble.id);
          // Trigger haptic feedback for selection
          haptic.selection();
          return;
        }
      }
      
      // Tap on empty space - deselect
      onSelect(null);
    }
  });

  // Combined touch handler that prioritizes advanced gestures over legacy
  const handleTouchStart = (e: React.TouchEvent) => {
    recordInteraction();
    
    // Trigger light haptic feedback for touch start
    if (e.touches.length === 1) {
      haptic.light();
    } else if (e.touches.length === 2) {
      // Medium haptic for pinch start
      haptic.medium();
    }
    
    // Always handle advanced gestures first
    advancedGestures.onTouchStart(e);
    
    // Add visual feedback for single touch
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setTouchFeedback({
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top
        });
      }
    }
    
    // Handle legacy gestures only for single tap detection
    if (e.touches.length === 1 && !advancedGestures.isGestureActive) {
      legacyTouchStart(e);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Advanced gestures take priority
    advancedGestures.onTouchMove(e);
    
    // Update touch feedback position
    if (e.touches.length === 1 && !isGestureMode) {
      const touch = e.touches[0];
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setTouchFeedback({
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top
        });
      }
    } else {
      setTouchFeedback(null);
    }
    
    // Handle legacy gestures only if not in advanced gesture mode
    if (!advancedGestures.isGestureActive) {
      legacyTouchMove(e);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Advanced gestures handle the event
    advancedGestures.onTouchEnd(e);
    
    // Clear touch feedback
    setTouchFeedback(null);
    
    // Handle legacy gestures for tap detection
    if (!advancedGestures.isGestureActive && e.touches.length === 0) {
      legacyTouchEnd(e);
    }
  };

  // Setup high-DPI canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    try {
      const canvasConfig = setupHighDPICanvas(canvas, width, height);
      canvasConfigRef.current = canvasConfig;
    } catch (error) {
      console.error('Failed to setup high-DPI canvas:', error);
    }
  }, [width, height]);

  // Handle loading states and animation
  useEffect(() => {
    if (bubbles.length > 0) {
      setIsLoading(false);
      startAnimation();
    } else {
      setIsLoading(true);
      startAnimation(); // Keep animation running for loading effects
    }
  }, [bubbles.length, startAnimation, stopAnimation]);

  // Simulate initial loading delay
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      if (bubbles.length > 0) {
        setIsLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Get safe area adjusted canvas style
  const canvasStyle = getSafeCanvasStyle(
    { width, height },
    { respectTop: true, respectBottom: false, respectLeft: true, respectRight: true }
  );

  return (
    <div className="relative w-full h-full overflow-hidden safe-area-x">
      <canvas
        ref={canvasRef}
        className="w-full h-full touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={advancedGestures.onDoubleClick}
        style={{
          ...canvasStyle,
          cursor: isTouch ? 'default' : 'pointer'
        }}
      />
      
      {/* Gesture Controls */}
      {isMobile && (
        <>
          {/* Touch Controls Hint */}
          <div className="absolute bottom-4 left-4 right-4 bg-black/70 rounded-lg p-3 text-xs text-white/80 safe-area-bottom">
            <div className="flex justify-around text-center">
              <div>
                <div className="font-medium">Tap</div>
                <div className="text-white/60">Select</div>
              </div>
              <div>
                <div className="font-medium">Pinch</div>
                <div className="text-white/60">Zoom</div>
              </div>
              <div>
                <div className="font-medium">Double Tap</div>
                <div className="text-white/60">Fit/Zoom</div>
              </div>
              <div>
                <div className="font-medium">Drag</div>
                <div className="text-white/60">Pan</div>
              </div>
            </div>
          </div>
          
          {/* Gesture Control Buttons */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 safe-area-top safe-area-left">
            <button
              onClick={() => {
                haptic.impact('medium');
                advancedGestures.reset();
              }}
              className="bg-black/70 p-2 rounded-lg text-white/80 text-xs font-medium min-w-12 min-h-12 flex items-center justify-center haptic-feedback active:haptic-feedback-active"
              title="Reset zoom and position"
            >
              Reset
            </button>
            <button
              onClick={() => {
                haptic.impact('light');
                advancedGestures.fitToScreen();
              }}
              className="bg-black/70 p-2 rounded-lg text-white/80 text-xs font-medium min-w-12 min-h-12 flex items-center justify-center haptic-feedback active:haptic-feedback-active"
              title="Fit to screen"
            >
              Fit
            </button>
          </div>
          
          {/* Zoom Level Indicator */}
          {(advancedGestures.transform.scale !== 1 || advancedGestures.isGestureActive) && !import.meta.env.DEV && (
            <div className="absolute top-4 right-4 bg-black/70 rounded-lg px-3 py-2 text-xs text-white/80 safe-area-top safe-area-right">
              {Math.round(advancedGestures.transform.scale * 100)}%
            </div>
          )}
        </>
      )}

      {/* Performance Metrics (Dev Only) */}
      {import.meta.env.DEV && (
        <div className="absolute top-4 right-4 bg-black/70 rounded-lg p-2 text-xs text-white/80 safe-area-top safe-area-right">
          <div>Quality: {Math.round(qualityLevel * 100)}%</div>
          <div>Zoom: {Math.round(advancedGestures.transform.scale * 100)}%</div>
          <div>Gesture: {advancedGestures.isGestureActive ? 'Active' : 'Idle'}</div>
          <div>Animating: {isAnimating ? 'Yes' : 'No'}</div>
          {(() => {
            const metrics = getPerformanceMetrics();
            return (
              <>
                <div>FPS: {metrics.fps}</div>
                <div>Battery: {Math.round(metrics.batteryLevel * 100)}%</div>
                {metrics.isLowPowerMode && <div className="text-yellow-400">Low Power Mode</div>}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};