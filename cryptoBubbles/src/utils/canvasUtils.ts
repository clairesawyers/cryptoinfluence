/**
 * Canvas utilities for high-DPI rendering and performance optimization
 */

export interface CanvasConfig {
  width: number;
  height: number;
  devicePixelRatio: number;
  scaledWidth: number;
  scaledHeight: number;
}

/**
 * Setup high-DPI canvas rendering for crisp visuals on Retina displays
 */
export const setupHighDPICanvas = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): CanvasConfig => {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get 2D context from canvas');
  }

  const devicePixelRatio = window.devicePixelRatio || 1;
  
  // Set actual canvas size in memory (scaled for high-DPI)
  const scaledWidth = width * devicePixelRatio;
  const scaledHeight = height * devicePixelRatio;
  
  canvas.width = scaledWidth;
  canvas.height = scaledHeight;
  
  // Set display size (CSS pixels)
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  
  // Scale the drawing context to match device pixel ratio
  ctx.scale(devicePixelRatio, devicePixelRatio);
  
  // Enable high-quality rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  return {
    width,
    height,
    devicePixelRatio,
    scaledWidth,
    scaledHeight
  };
};

/**
 * Get optimized canvas context with performance settings
 */
export const getOptimizedCanvasContext = (canvas: HTMLCanvasElement): CanvasRenderingContext2D => {
  const ctx = canvas.getContext('2d', {
    alpha: true,
    desynchronized: true, // For better performance
    willReadFrequently: false // We don't read pixel data frequently
  });
  
  if (!ctx) {
    throw new Error('Could not get 2D context from canvas');
  }
  
  // Optimize text rendering
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  
  // Enable image smoothing for better quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  return ctx;
};

/**
 * Scale coordinates for high-DPI rendering
 */
export const scaleCoordinates = (
  x: number,
  y: number,
  devicePixelRatio: number = window.devicePixelRatio || 1
): { x: number; y: number } => {
  return {
    x: x * devicePixelRatio,
    y: y * devicePixelRatio
  };
};

/**
 * Convert canvas coordinates to logical coordinates
 */
export const canvasToLogicalCoordinates = (
  canvasX: number,
  canvasY: number,
  canvas: HTMLCanvasElement,
  devicePixelRatio: number = window.devicePixelRatio || 1
): { x: number; y: number } => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (canvasX - rect.left) * devicePixelRatio,
    y: (canvasY - rect.top) * devicePixelRatio
  };
};

/**
 * Optimize canvas for animations
 */
export const optimizeCanvasForAnimation = (ctx: CanvasRenderingContext2D): void => {
  // Use path optimization
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Optimize composite operations
  ctx.globalCompositeOperation = 'source-over';
};

/**
 * Clear canvas efficiently
 */
export const clearCanvas = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void => {
  // Use clearRect for better performance than fillRect with white
  ctx.clearRect(0, 0, width, height);
};

/**
 * Calculate responsive font size for high-DPI displays
 */
export const getHighDPIFontSize = (
  baseFontSize: number,
  devicePixelRatio: number = window.devicePixelRatio || 1
): number => {
  // Ensure font size looks consistent across different DPI displays
  return Math.round(baseFontSize * Math.max(1, devicePixelRatio * 0.75));
};