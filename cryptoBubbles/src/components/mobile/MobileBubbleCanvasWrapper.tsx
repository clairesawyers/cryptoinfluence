import React, { useRef, useEffect, useState } from 'react';
import { BubbleCanvas } from '../BubbleCanvas';
import { BubbleCard } from '../../types';
import { useMobileDetect } from '../../hooks/useMobileDetect';
import { useTouchGestures } from '../../hooks/useTouchGestures';
import { getResponsiveValue, CANVAS_SIZES, getSafeAreaPadding } from '../../utils/responsive';

interface MobileBubbleCanvasWrapperProps {
  bubbles: BubbleCard[];
  onCardClick: (card: BubbleCard) => void;
  canvasSize: { width: number; height: number };
}

export const MobileBubbleCanvasWrapper: React.FC<MobileBubbleCanvasWrapperProps> = ({
  bubbles,
  onCardClick,
  canvasSize
}) => {
  const detection = useMobileDetect();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  
  // Get responsive canvas size
  const responsiveCanvasSize = detection.isMobile 
    ? getResponsiveValue(CANVAS_SIZES, detection)
    : canvasSize.width;

  // Calculate actual canvas dimensions
  const mobileCanvasSize = detection.isMobile
    ? { 
        width: Math.min(responsiveCanvasSize, detection.viewportWidth - 32), 
        height: Math.min(responsiveCanvasSize * 0.75, detection.viewportHeight - 200) 
      }
    : canvasSize;

  // Touch gesture handling for zoom and pan
  const touchGestures = useTouchGestures({
    onDoubleTap: () => {
      // Reset zoom on double tap
      setScale(1);
      setPosition({ x: 0, y: 0 });
    },
    onPanStart: () => {
      setIsPanning(true);
    },
    onPan: (deltaX, deltaY) => {
      if (scale > 1) {
        // Only allow panning when zoomed in
        setPosition(prev => ({
          x: prev.x + deltaX * 0.5,
          y: prev.y + deltaY * 0.5
        }));
      }
    },
    onPanEnd: () => {
      setIsPanning(false);
    }
  }, {
    panThreshold: 10,
    preventDefault: true
  });

  // Reset on orientation change
  useEffect(() => {
    const handleOrientationChange = () => {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    return () => window.removeEventListener('orientationchange', handleOrientationChange);
  }, []);

  if (!detection.isMobile) {
    // On desktop, use the regular canvas
    return <BubbleCanvas bubbles={bubbles} onCardClick={onCardClick} canvasSize={canvasSize} />;
  }

  const transformStyle: React.CSSProperties = {
    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
    transition: isPanning ? 'none' : 'transform 0.3s ease-out',
    transformOrigin: 'center center',
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gray-950">
      {/* Canvas Container with touch handling */}
      <div 
        ref={containerRef}
        className="relative touch-none"
        style={{
          width: mobileCanvasSize.width,
          height: mobileCanvasSize.height,
          ...transformStyle
        }}
        {...touchGestures}
      >
        <BubbleCanvas 
          bubbles={bubbles} 
          onCardClick={onCardClick} 
          canvasSize={mobileCanvasSize} 
        />
      </div>

      {/* Mobile Controls Overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center pointer-events-none">
        {/* Zoom Controls */}
        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={() => setScale(prev => Math.max(0.5, prev - 0.25))}
            className="bg-gray-800/90 text-white p-2 rounded-lg text-sm font-medium min-w-[44px] min-h-[44px] flex items-center justify-center active:bg-gray-700"
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            onClick={() => setScale(prev => Math.min(3, prev + 0.25))}
            className="bg-gray-800/90 text-white p-2 rounded-lg text-sm font-medium min-w-[44px] min-h-[44px] flex items-center justify-center active:bg-gray-700"
            aria-label="Zoom in"
          >
            +
          </button>
        </div>

        {/* Reset Button */}
        <button
          onClick={() => {
            setScale(1);
            setPosition({ x: 0, y: 0 });
          }}
          className="bg-gray-800/90 text-white px-4 py-2 rounded-lg text-sm font-medium min-h-[44px] pointer-events-auto active:bg-gray-700"
        >
          Reset View
        </button>
      </div>

      {/* Zoom Indicator */}
      {scale !== 1 && (
        <div className="absolute top-4 right-4 bg-gray-800/90 text-white px-3 py-1 rounded-lg text-sm">
          {Math.round(scale * 100)}%
        </div>
      )}

      {/* Touch Instructions (show briefly) */}
      {detection.isTouch && bubbles.length > 0 && (
        <div className="absolute top-4 left-4 right-4 bg-gray-800/90 text-white p-3 rounded-lg text-xs animate-pulse">
          <div className="text-center">
            Double tap to reset • Use controls to zoom
          </div>
        </div>
      )}
    </div>
  );
};