/**
 * Memory management utilities for optimizing performance and preventing memory leaks
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  lastAccessed: number;
  accessCount: number;
  size?: number;
}

interface CacheConfig {
  maxItems?: number;
  maxAge?: number; // milliseconds
  maxMemory?: number; // approximate bytes
  cleanupInterval?: number; // milliseconds
}

/**
 * LRU Cache with memory management
 */
export class MemoryAwareCache<T> {
  private cache = new Map<string, CacheItem<T>>();
  private config: Required<CacheConfig>;
  private cleanupTimer?: number;
  private memoryUsage = 0;

  constructor(config: CacheConfig = {}) {
    this.config = {
      maxItems: config.maxItems ?? 100,
      maxAge: config.maxAge ?? 30 * 60 * 1000, // 30 minutes
      maxMemory: config.maxMemory ?? 50 * 1024 * 1024, // 50MB
      cleanupInterval: config.cleanupInterval ?? 5 * 60 * 1000 // 5 minutes
    };

    this.startCleanupTimer();
  }

  private startCleanupTimer() {
    this.cleanupTimer = window.setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private estimateSize(data: T): number {
    if (data instanceof HTMLImageElement) {
      return (data.width || 300) * (data.height || 200) * 4; // RGBA bytes
    }
    
    if (typeof data === 'string') {
      return data.length * 2; // UTF-16 encoding
    }
    
    if (typeof data === 'object') {
      return JSON.stringify(data).length * 2;
    }
    
    return 1024; // Default estimate
  }

  public set(key: string, data: T): void {
    const now = Date.now();
    const size = this.estimateSize(data);
    
    // Remove existing item if present
    if (this.cache.has(key)) {
      const existing = this.cache.get(key)!;
      this.memoryUsage -= existing.size || 0;
    }

    const item: CacheItem<T> = {
      data,
      timestamp: now,
      lastAccessed: now,
      accessCount: 1,
      size
    };

    this.cache.set(key, item);
    this.memoryUsage += size;

    // Enforce limits
    this.enforceLimits();
  }

  public get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    
    // Check if expired
    if (now - item.timestamp > this.config.maxAge) {
      this.delete(key);
      return null;
    }

    // Update access info
    item.lastAccessed = now;
    item.accessCount++;

    return item.data;
  }

  public has(key: string): boolean {
    return this.cache.has(key) && this.get(key) !== null;
  }

  public delete(key: string): boolean {
    const item = this.cache.get(key);
    if (item) {
      this.memoryUsage -= item.size || 0;
      this.cache.delete(key);
      return true;
    }
    return false;
  }

  public clear(): void {
    this.cache.clear();
    this.memoryUsage = 0;
  }

  private enforceLimits(): void {
    // Enforce memory limit
    while (this.memoryUsage > this.config.maxMemory && this.cache.size > 0) {
      this.evictLeastRecentlyUsed();
    }

    // Enforce item count limit
    while (this.cache.size > this.config.maxItems) {
      this.evictLeastRecentlyUsed();
    }
  }

  private evictLeastRecentlyUsed(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, item] of this.cache) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, item] of this.cache) {
      if (now - item.timestamp > this.config.maxAge) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));
  }

  public getStats() {
    return {
      size: this.cache.size,
      memoryUsage: this.memoryUsage,
      maxItems: this.config.maxItems,
      maxMemory: this.config.maxMemory
    };
  }

  public destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }
}

/**
 * Image cache with automatic cleanup
 */
export class ImageCache extends MemoryAwareCache<HTMLImageElement> {
  constructor() {
    super({
      maxItems: 50,
      maxAge: 15 * 60 * 1000, // 15 minutes
      maxMemory: 100 * 1024 * 1024, // 100MB
      cleanupInterval: 2 * 60 * 1000 // 2 minutes
    });
  }

  public loadImage(url: string): Promise<HTMLImageElement> {
    // Check cache first
    const cached = this.get(url);
    if (cached) {
      return Promise.resolve(cached);
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        this.set(url, img);
        resolve(img);
      };
      
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${url}`));
      };
      
      img.src = url;
    });
  }

  public preloadImage(url: string): void {
    if (!this.has(url)) {
      this.loadImage(url).catch(() => {
        // Silently handle preload failures
      });
    }
  }
}

/**
 * Intersection Observer for lazy loading
 */
export class LazyLoadManager {
  private observer?: IntersectionObserver;
  private callbacks = new Map<Element, () => void>();
  private observedElements = new Set<Element>();

  constructor(private options: IntersectionObserverInit = {}) {
    this.options = {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    };
    
    this.initObserver();
  }

  private initObserver(): void {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const callback = this.callbacks.get(entry.target);
            if (callback) {
              callback();
              this.unobserve(entry.target);
            }
          }
        });
      }, this.options);
    }
  }

  public observe(element: Element, callback: () => void): void {
    if (!this.observer) {
      // Fallback: immediately execute callback if IntersectionObserver not supported
      callback();
      return;
    }

    this.callbacks.set(element, callback);
    this.observedElements.add(element);
    this.observer.observe(element);
  }

  public unobserve(element: Element): void {
    if (this.observer && this.observedElements.has(element)) {
      this.observer.unobserve(element);
      this.observedElements.delete(element);
      this.callbacks.delete(element);
    }
  }

  public disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observedElements.clear();
      this.callbacks.clear();
    }
  }
}

/**
 * Animation frame manager to prevent memory leaks
 */
export class AnimationFrameManager {
  private activeFrames = new Set<number>();
  private frameCallbacks = new Map<number, () => void>();

  public requestAnimationFrame(callback: () => void): number {
    const id = requestAnimationFrame(() => {
      this.activeFrames.delete(id);
      this.frameCallbacks.delete(id);
      callback();
    });
    
    this.activeFrames.add(id);
    this.frameCallbacks.set(id, callback);
    
    return id;
  }

  public cancelAnimationFrame(id: number): void {
    if (this.activeFrames.has(id)) {
      cancelAnimationFrame(id);
      this.activeFrames.delete(id);
      this.frameCallbacks.delete(id);
    }
  }

  public cancelAll(): void {
    this.activeFrames.forEach(id => {
      cancelAnimationFrame(id);
    });
    this.activeFrames.clear();
    this.frameCallbacks.clear();
  }

  public getActiveCount(): number {
    return this.activeFrames.size;
  }
}

/**
 * Event listener manager to prevent memory leaks
 */
export class EventListenerManager {
  private listeners = new Map<Element, Map<string, EventListener>>();

  public addEventListener(
    element: Element,
    type: string,
    listener: EventListener,
    options?: AddEventListenerOptions
  ): void {
    element.addEventListener(type, listener, options);
    
    if (!this.listeners.has(element)) {
      this.listeners.set(element, new Map());
    }
    
    this.listeners.get(element)!.set(`${type}-${listener}`, listener);
  }

  public removeEventListener(
    element: Element,
    type: string,
    listener: EventListener
  ): void {
    element.removeEventListener(type, listener);
    
    const elementListeners = this.listeners.get(element);
    if (elementListeners) {
      elementListeners.delete(`${type}-${listener}`);
      if (elementListeners.size === 0) {
        this.listeners.delete(element);
      }
    }
  }

  public removeAllListeners(element: Element): void {
    const elementListeners = this.listeners.get(element);
    if (elementListeners) {
      elementListeners.forEach((listener, key) => {
        const [type] = key.split('-');
        element.removeEventListener(type, listener);
      });
      this.listeners.delete(element);
    }
  }

  public cleanup(): void {
    this.listeners.forEach((elementListeners, element) => {
      elementListeners.forEach((listener, key) => {
        const [type] = key.split('-');
        element.removeEventListener(type, listener);
      });
    });
    this.listeners.clear();
  }
}

/**
 * Memory usage monitor
 */
export class MemoryMonitor {
  private static instance?: MemoryMonitor;
  private intervalId?: number;
  private callbacks = new Set<(info: any) => void>();

  private constructor() {}

  public static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }

  public startMonitoring(interval: number = 10000): void {
    this.stopMonitoring();
    
    this.intervalId = window.setInterval(() => {
      this.checkMemory();
    }, interval);
  }

  public stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  public onMemoryChange(callback: (info: any) => void): () => void {
    this.callbacks.add(callback);
    
    return () => {
      this.callbacks.delete(callback);
    };
  }

  private checkMemory(): void {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      
      const info = {
        usedJSHeapSize: memInfo.usedJSHeapSize,
        totalJSHeapSize: memInfo.totalJSHeapSize,
        jsHeapSizeLimit: memInfo.jsHeapSizeLimit,
        usagePercentage: (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100
      };
      
      this.callbacks.forEach(callback => callback(info));
    }
  }

  public getMemoryInfo(): any {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      return {
        usedJSHeapSize: memInfo.usedJSHeapSize,
        totalJSHeapSize: memInfo.totalJSHeapSize,
        jsHeapSizeLimit: memInfo.jsHeapSizeLimit,
        usagePercentage: (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100
      };
    }
    return null;
  }
}

// Global instances
export const globalImageCache = new ImageCache();
export const globalLazyLoader = new LazyLoadManager();
export const globalAnimationManager = new AnimationFrameManager();
export const globalEventManager = new EventListenerManager();
export const memoryMonitor = MemoryMonitor.getInstance();