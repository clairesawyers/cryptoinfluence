/**
 * Loading animations and shimmer effects for canvas and UI elements
 */

export interface ShimmerConfig {
  baseColor?: string;
  highlightColor?: string;
  speed?: number;
  direction?: 'horizontal' | 'vertical' | 'diagonal';
  width?: number;
}

export interface LoadingConfig {
  showShimmer?: boolean;
  showSpinner?: boolean;
  showPulse?: boolean;
  backgroundColor?: string;
  foregroundColor?: string;
}

/**
 * Draw loading shimmer effect on canvas
 */
export const drawLoadingShimmer = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  timestamp: number = 0,
  config: ShimmerConfig = {}
): void => {
  const {
    baseColor = '#2a2a2a',
    highlightColor = '#3a3a3a',
    speed = 0.002,
    direction = 'horizontal',
    width: shimmerWidth = width * 0.3
  } = config;

  ctx.save();

  // Create base rectangle
  ctx.fillStyle = baseColor;
  ctx.fillRect(x, y, width, height);

  // Calculate shimmer position based on timestamp
  const progress = (timestamp * speed) % 2;
  let shimmerX = x;
  let shimmerY = y;
  let gradientEndX = x + shimmerWidth;
  let gradientEndY = y;

  switch (direction) {
    case 'horizontal':
      shimmerX = x + (width + shimmerWidth) * progress - shimmerWidth;
      gradientEndX = shimmerX + shimmerWidth;
      break;
    case 'vertical':
      shimmerY = y + (height + shimmerWidth) * progress - shimmerWidth;
      gradientEndY = shimmerY + shimmerWidth;
      gradientEndX = x;
      break;
    case 'diagonal':
      shimmerX = x + (width + shimmerWidth) * progress - shimmerWidth;
      shimmerY = y + (height + shimmerWidth) * progress - shimmerWidth;
      gradientEndX = shimmerX + shimmerWidth;
      gradientEndY = shimmerY + shimmerWidth;
      break;
  }

  // Create shimmer gradient
  const gradient = ctx.createLinearGradient(shimmerX, shimmerY, gradientEndX, gradientEndY);
  gradient.addColorStop(0, baseColor);
  gradient.addColorStop(0.3, highlightColor);
  gradient.addColorStop(0.7, highlightColor);
  gradient.addColorStop(1, baseColor);

  // Clip to original rectangle
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();

  // Draw shimmer
  ctx.fillStyle = gradient;
  ctx.fillRect(shimmerX, shimmerY, shimmerWidth, direction === 'vertical' ? shimmerWidth : height);

  ctx.restore();
};

/**
 * Draw loading spinner on canvas
 */
export const drawLoadingSpinner = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  timestamp: number = 0,
  config: LoadingConfig = {}
): void => {
  const {
    backgroundColor = 'rgba(0, 0, 0, 0.1)',
    foregroundColor = '#3b82f6'
  } = config;

  ctx.save();

  const rotation = (timestamp * 0.005) % (Math.PI * 2);

  // Draw background circle
  ctx.strokeStyle = backgroundColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Draw spinning arc
  ctx.strokeStyle = foregroundColor;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, rotation, rotation + Math.PI * 1.5);
  ctx.stroke();

  ctx.restore();
};

/**
 * Draw pulsing loading indicator
 */
export const drawLoadingPulse = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  baseRadius: number,
  timestamp: number = 0,
  config: LoadingConfig = {}
): void => {
  const {
    foregroundColor = '#3b82f6'
  } = config;

  ctx.save();

  const pulse = Math.sin(timestamp * 0.003) * 0.3 + 0.7;
  const currentRadius = baseRadius * pulse;
  const alpha = 0.3 + pulse * 0.4;

  ctx.globalAlpha = alpha;
  ctx.fillStyle = foregroundColor;
  ctx.beginPath();
  ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
  ctx.fill();

  // Outer ring
  ctx.globalAlpha = alpha * 0.3;
  ctx.strokeStyle = foregroundColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, currentRadius + 5, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
};

/**
 * Draw skeleton loading for thumbnail
 */
export const drawThumbnailSkeleton = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  timestamp: number = 0,
  config: ShimmerConfig = {}
): void => {
  const cornerRadius = 8;
  
  ctx.save();

  // Draw rounded rectangle background
  ctx.fillStyle = config.baseColor || '#2a2a2a';
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, cornerRadius);
  ctx.fill();

  // Add shimmer effect
  drawLoadingShimmer(ctx, x, y, width, height, timestamp, config);

  // Play button placeholder
  const playSize = Math.min(width, height) * 0.2;
  const playX = x + width / 2;
  const playY = y + height / 2;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.arc(playX, playY, playSize, 0, Math.PI * 2);
  ctx.fill();

  // Play triangle
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  const triangleSize = playSize * 0.4;
  ctx.beginPath();
  ctx.moveTo(playX - triangleSize * 0.3, playY - triangleSize * 0.5);
  ctx.lineTo(playX - triangleSize * 0.3, playY + triangleSize * 0.5);
  ctx.lineTo(playX + triangleSize * 0.5, playY);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
};

/**
 * Draw text skeleton loading
 */
export const drawTextSkeleton = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  lines: Array<{ width: number; height: number }>,
  timestamp: number = 0,
  config: ShimmerConfig = {}
): void => {
  const lineSpacing = 6;
  let currentY = y;

  lines.forEach((line, index) => {
    drawLoadingShimmer(
      ctx,
      x,
      currentY,
      line.width,
      line.height,
      timestamp + index * 200, // Stagger animation
      { ...config, direction: 'horizontal' }
    );
    currentY += line.height + lineSpacing;
  });
};

/**
 * Draw card skeleton loading
 */
export const drawCardSkeleton = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  timestamp: number = 0,
  config: ShimmerConfig = {}
): void => {
  const padding = 16;
  const thumbnailHeight = height * 0.6;
  const textY = y + thumbnailHeight + padding;

  // Thumbnail skeleton
  drawThumbnailSkeleton(
    ctx,
    x + padding,
    y + padding,
    width - padding * 2,
    thumbnailHeight - padding,
    timestamp,
    config
  );

  // Text skeletons
  const textLines = [
    { width: width * 0.8, height: 14 }, // Title line 1
    { width: width * 0.6, height: 14 }, // Title line 2
    { width: width * 0.4, height: 12 }, // Channel name
    { width: width * 0.3, height: 10 }  // Views/date
  ];

  drawTextSkeleton(
    ctx,
    x + padding,
    textY,
    textLines,
    timestamp,
    config
  );
};

/**
 * Progressive loading with multiple states
 */
export class ProgressiveLoader {
  private loadingStates = ['skeleton', 'shimmer', 'fade-in'] as const;
  private currentState: typeof this.loadingStates[number] = 'skeleton';
  private startTime: number = Date.now();
  private stateDuration: number = 1000; // ms per state

  constructor(private onStateChange?: (state: string) => void) {}

  public update(timestamp: number): string {
    const elapsed = timestamp - this.startTime;
    const stateIndex = Math.floor(elapsed / this.stateDuration);
    
    if (stateIndex < this.loadingStates.length) {
      const newState = this.loadingStates[stateIndex];
      if (newState !== this.currentState) {
        this.currentState = newState;
        this.onStateChange?.(this.currentState);
      }
    }

    return this.currentState;
  }

  public reset() {
    this.startTime = Date.now();
    this.currentState = 'skeleton';
  }

  public getCurrentState(): string {
    return this.currentState;
  }
}

/**
 * Loading state manager for canvas elements
 */
export class CanvasLoadingManager {
  private loadingElements = new Map<string, ProgressiveLoader>();
  private activeAnimations = new Set<string>();

  public startLoading(elementId: string, onStateChange?: (state: string) => void): void {
    const loader = new ProgressiveLoader(onStateChange);
    this.loadingElements.set(elementId, loader);
    this.activeAnimations.add(elementId);
  }

  public stopLoading(elementId: string): void {
    this.loadingElements.delete(elementId);
    this.activeAnimations.delete(elementId);
  }

  public updateLoading(elementId: string, timestamp: number): string | null {
    const loader = this.loadingElements.get(elementId);
    if (!loader) return null;

    return loader.update(timestamp);
  }

  public isLoading(elementId: string): boolean {
    return this.activeAnimations.has(elementId);
  }

  public getActiveAnimations(): string[] {
    return Array.from(this.activeAnimations);
  }

  public clearAll(): void {
    this.loadingElements.clear();
    this.activeAnimations.clear();
  }
}