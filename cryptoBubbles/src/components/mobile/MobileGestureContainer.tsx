import React, { useRef } from 'react';
import { useAdvancedGestures } from '../../hooks/useAdvancedGestures';
import { useMobileDetect } from '../../hooks/useMobileDetect';

interface MobileGestureContainerProps {
  children: React.ReactNode;
  enableZoom?: boolean;
  enablePan?: boolean;
  enableRotation?: boolean;
  minScale?: number;
  maxScale?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const MobileGestureContainer: React.FC<MobileGestureContainerProps> = ({
  children,
  enableZoom = true,
  enablePan = true,
  enableRotation = false,
  minScale = 0.8,
  maxScale = 3,
  className = '',
  style = {}
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useMobileDetect();
  
  const gestures = useAdvancedGestures({
    enablePinch: enableZoom,
    enablePan: enablePan,
    enableRotation: enableRotation,
    enableMomentum: true,
    enableRubberBand: true,
    minScale,
    maxScale,
    bounds: { width: 400, height: 600 }, // Default content bounds
    containerBounds: { width: window.innerWidth, height: window.innerHeight }
  });

  if (!isMobile) {
    // No gesture handling for non-mobile devices
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={style}
      onTouchStart={gestures.onTouchStart}
      onTouchMove={gestures.onTouchMove}
      onTouchEnd={gestures.onTouchEnd}
      onDoubleClick={gestures.onDoubleClick}
    >
      <div
        style={{
          transform: `translate(${gestures.transform.x}px, ${gestures.transform.y}px) scale(${gestures.transform.scale}) rotate(${gestures.transform.rotation}deg)`,
          transformOrigin: 'center center',
          transition: gestures.isGestureActive ? 'none' : 'transform 0.3s ease-out',
          width: '100%',
          height: '100%'
        }}
      >
        {children}
      </div>
      
      {/* Gesture indicator */}
      {gestures.isGestureActive && (
        <div className="absolute top-2 left-2 bg-black/50 rounded px-2 py-1 text-xs text-white">
          {Math.round(gestures.transform.scale * 100)}%
        </div>
      )}
    </div>
  );
};