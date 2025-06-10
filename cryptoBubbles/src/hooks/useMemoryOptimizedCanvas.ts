import { useEffect, useRef, useCallback } from 'react';
import { globalAnimationManager, globalImageCache, memoryMonitor } from '../utils/memoryManager';

interface MemoryOptimizedCanvasConfig {
  onMemoryWarning?: (info: any) => void;
  enableMemoryMonitoring?: boolean;
  maxImageCacheSize?: number;
}

/**
 * Hook for memory-optimized canvas operations
 */
export const useMemoryOptimizedCanvas = (config: MemoryOptimizedCanvasConfig = {}) => {
  const {
    onMemoryWarning,
    enableMemoryMonitoring = true,
    maxImageCacheSize = 50
  } = config;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const imageLoadingPromises = useRef(new Map<string, Promise<HTMLImageElement>>());
  const visibleImages = useRef(new Set<string>());

  // Memory monitoring
  useEffect(() => {
    if (!enableMemoryMonitoring) return;

    const unsubscribe = memoryMonitor.onMemoryChange((info) => {
      // If memory usage is high, trigger cleanup
      if (info.usagePercentage > 80) {
        cleanup();
        onMemoryWarning?.(info);
      }
    });

    memoryMonitor.startMonitoring(5000); // Check every 5 seconds

    return () => {
      unsubscribe();
      memoryMonitor.stopMonitoring();
    };
  }, [enableMemoryMonitoring, onMemoryWarning]);

  // Get canvas context with memory optimization
  const getContext = useCallback(() => {
    if (!canvasRef.current) return null;
    
    if (!contextRef.current) {
      contextRef.current = canvasRef.current.getContext('2d', {
        alpha: true,
        desynchronized: true, // Better performance on some browsers
        willReadFrequently: false // Optimize for write-heavy operations
      });
    }
    
    return contextRef.current;
  }, []);

  // Load image with caching and memory management
  const loadImage = useCallback(async (url: string): Promise<HTMLImageElement | null> => {
    try {
      // Check if already loading
      if (imageLoadingPromises.current.has(url)) {
        return await imageLoadingPromises.current.get(url)!;
      }

      // Load from cache or fetch
      const loadPromise = globalImageCache.loadImage(url);
      imageLoadingPromises.current.set(url, loadPromise);

      const image = await loadPromise;
      
      // Track as visible
      visibleImages.current.add(url);
      
      // Clean up loading promise
      imageLoadingPromises.current.delete(url);
      
      return image;
    } catch (error) {
      console.warn('Failed to load image:', url, error);
      imageLoadingPromises.current.delete(url);
      return null;
    }
  }, []);

  // Preload image only if needed
  const preloadImage = useCallback((url: string) => {
    if (!globalImageCache.has(url) && !imageLoadingPromises.current.has(url)) {
      globalImageCache.preloadImage(url);
    }
  }, []);

  // Check if element is visible in viewport
  const isInViewport = useCallback((x: number, y: number, width: number, height: number): boolean => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    const rect = canvas.getBoundingClientRect();
    
    return !(
      x + width < 0 ||
      y + height < 0 ||
      x > rect.width ||
      y > rect.height
    );
  }, []);

  // Optimized animation frame request
  const requestAnimationFrame = useCallback((callback: () => void): number => {
    // Cancel previous frame if still pending
    if (animationIdRef.current !== null) {
      globalAnimationManager.cancelAnimationFrame(animationIdRef.current);
    }
    
    animationIdRef.current = globalAnimationManager.requestAnimationFrame(() => {
      animationIdRef.current = null;
      callback();
    });
    
    return animationIdRef.current;
  }, []);

  // Cancel animation frame
  const cancelAnimationFrame = useCallback(() => {
    if (animationIdRef.current !== null) {
      globalAnimationManager.cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }
  }, []);

  // Cleanup unused images from cache
  const cleanupImages = useCallback(() => {
    const cacheStats = globalImageCache.getStats();
    
    // If cache is getting full, remove images not currently visible
    if (cacheStats.size > maxImageCacheSize * 0.8) {
      // This would require cache to expose keys, simplified for now
      console.log('Image cache cleanup triggered');
    }
    
    // Clear visible tracking periodically
    if (visibleImages.current.size > 100) {
      visibleImages.current.clear();
    }
  }, [maxImageCacheSize]);

  // General cleanup function
  const cleanup = useCallback(() => {
    // Cancel pending animations
    cancelAnimationFrame();
    
    // Cancel pending image loads
    imageLoadingPromises.current.clear();
    
    // Clean up images
    cleanupImages();
    
    // Force garbage collection if available (Chrome DevTools)
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }
  }, [cancelAnimationFrame, cleanupImages]);

  // Enhanced canvas clearing with memory optimization
  const clearCanvas = useCallback((width?: number, height?: number) => {
    const ctx = getContext();
    if (!ctx || !canvasRef.current) return;

    const w = width || canvasRef.current.width;
    const h = height || canvasRef.current.height;

    // Use clearRect instead of fillRect for better performance
    ctx.clearRect(0, 0, w, h);
    
    // Reset transform to avoid memory accumulation
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }, [getContext]);

  // Draw image with memory optimization
  const drawImage = useCallback((
    image: HTMLImageElement,
    sx: number,
    sy: number,
    sw?: number,
    sh?: number,
    dx?: number,
    dy?: number,
    dw?: number,
    dh?: number
  ) => {
    const ctx = getContext();
    if (!ctx) return;

    try {
      if (arguments.length === 3) {
        ctx.drawImage(image, sx, sy);
      } else if (arguments.length === 5) {
        ctx.drawImage(image, sx, sy, sw!, sh!);
      } else if (arguments.length === 9) {
        ctx.drawImage(image, sx, sy, sw!, sh!, dx!, dy!, dw!, dh!);
      }
    } catch (error) {
      console.warn('Error drawing image:', error);
    }
  }, [getContext]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      
      // Clear context reference
      contextRef.current = null;
    };
  }, [cleanup]);

  return {
    canvasRef,
    getContext,
    loadImage,
    preloadImage,
    isInViewport,
    requestAnimationFrame,
    cancelAnimationFrame,
    clearCanvas,
    drawImage,
    cleanup,
    memoryStats: {
      imageCache: globalImageCache.getStats(),
      activeAnimations: globalAnimationManager.getActiveCount(),
      memoryInfo: memoryMonitor.getMemoryInfo()
    }
  };
};