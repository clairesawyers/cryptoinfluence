/**
 * Performance optimization utilities for mobile and web applications
 */

/**
 * Throttle function to limit function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Debounce function to delay function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * RequestAnimationFrame throttling for smooth animations
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let requestId: number | null = null;
  
  return function (this: any, ...args: Parameters<T>) {
    if (requestId === null) {
      requestId = requestAnimationFrame(() => {
        func.apply(this, args);
        requestId = null;
      });
    }
  };
}

/**
 * Performance monitor for tracking frame rates and render times
 */
export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 0;
  private renderTimes: number[] = [];
  private maxSamples = 60;

  public startFrame(): number {
    return performance.now();
  }

  public endFrame(startTime: number): void {
    const renderTime = performance.now() - startTime;
    this.renderTimes.push(renderTime);
    
    if (this.renderTimes.length > this.maxSamples) {
      this.renderTimes.shift();
    }
    
    this.frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - this.lastTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  }

  public getFPS(): number {
    return this.fps;
  }

  public getAverageRenderTime(): number {
    if (this.renderTimes.length === 0) return 0;
    return this.renderTimes.reduce((a, b) => a + b, 0) / this.renderTimes.length;
  }

  public isPerformancePoor(): boolean {
    return this.fps < 30 || this.getAverageRenderTime() > 16.67; // 60fps = 16.67ms per frame
  }
}

/**
 * Adaptive quality manager that adjusts rendering quality based on performance
 */
export class AdaptiveQualityManager {
  private monitor = new PerformanceMonitor();
  private qualityLevel = 1.0; // 1.0 = highest quality, 0.5 = medium, 0.25 = lowest
  private checkInterval = 2000; // Check every 2 seconds
  private lastCheck = 0;

  public getQualityLevel(): number {
    return this.qualityLevel;
  }

  public updatePerformance(startTime: number): void {
    this.monitor.endFrame(startTime);
    
    const now = performance.now();
    if (now - this.lastCheck > this.checkInterval) {
      this.adjustQuality();
      this.lastCheck = now;
    }
  }

  private adjustQuality(): void {
    const fps = this.monitor.getFPS();
    const avgRenderTime = this.monitor.getAverageRenderTime();
    
    if (fps < 30 || avgRenderTime > 20) {
      // Poor performance - reduce quality
      this.qualityLevel = Math.max(0.25, this.qualityLevel - 0.25);
    } else if (fps >= 55 && avgRenderTime < 10) {
      // Good performance - increase quality
      this.qualityLevel = Math.min(1.0, this.qualityLevel + 0.25);
    }
  }

  public startFrame(): number {
    return this.monitor.startFrame();
  }
}

/**
 * Battery and thermal management
 */
export class BatteryManager {
  private batteryLevel = 1.0;
  private isCharging = true;
  private lowPowerMode = false;

  constructor() {
    this.initBatteryAPI();
  }

  private async initBatteryAPI(): Promise<void> {
    try {
      // @ts-ignore - Battery API is experimental
      if ('getBattery' in navigator) {
        // @ts-ignore
        const battery = await navigator.getBattery();
        this.batteryLevel = battery.level;
        this.isCharging = battery.charging;
        
        battery.addEventListener('levelchange', () => {
          this.batteryLevel = battery.level;
          this.updateLowPowerMode();
        });
        
        battery.addEventListener('chargingchange', () => {
          this.isCharging = battery.charging;
          this.updateLowPowerMode();
        });
      }
    } catch (error) {
      console.warn('Battery API not supported:', error);
    }
  }

  private updateLowPowerMode(): void {
    this.lowPowerMode = !this.isCharging && this.batteryLevel < 0.2;
  }

  public shouldReducePerformance(): boolean {
    return this.lowPowerMode;
  }

  public getBatteryLevel(): number {
    return this.batteryLevel;
  }

  public isInLowPowerMode(): boolean {
    return this.lowPowerMode;
  }
}

/**
 * Intersection Observer for performance optimization
 */
export function createVisibilityObserver(
  callback: (isVisible: boolean) => void,
  threshold = 0.1
): IntersectionObserver {
  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        callback(entry.isIntersecting);
      });
    },
    { threshold }
  );
}

/**
 * Memory management utilities
 */
export class MemoryManager {
  private static instance: MemoryManager;
  private caches = new Map<string, Map<string, any>>();
  private maxCacheSize = 100;

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  public getCache(cacheKey: string): Map<string, any> {
    if (!this.caches.has(cacheKey)) {
      this.caches.set(cacheKey, new Map());
    }
    return this.caches.get(cacheKey)!;
  }

  public clearCache(cacheKey: string): void {
    const cache = this.caches.get(cacheKey);
    if (cache) {
      cache.clear();
    }
  }

  public trimCache(cacheKey: string): void {
    const cache = this.caches.get(cacheKey);
    if (cache && cache.size > this.maxCacheSize) {
      const entries = Array.from(cache.entries());
      const toRemove = entries.slice(0, cache.size - this.maxCacheSize);
      toRemove.forEach(([key]) => cache.delete(key));
    }
  }

  public getMemoryUsage(): number {
    // @ts-ignore - Memory API is experimental
    if ('memory' in performance) {
      // @ts-ignore
      return performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize;
    }
    return 0;
  }
}