import { useEffect, useRef, useState } from 'react';
import { globalLazyLoader } from '../utils/memoryManager';

interface LazyLoadingConfig {
  rootMargin?: string;
  threshold?: number | number[];
  triggerOnce?: boolean;
  placeholder?: () => React.ReactNode;
}

/**
 * Hook for lazy loading elements with Intersection Observer
 */
export const useLazyLoading = (config: LazyLoadingConfig = {}) => {
  const {
    rootMargin = '50px',
    threshold = 0.1,
    triggerOnce = true
  } = config;

  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // If already triggered and triggerOnce is true, don't observe again
    if (hasTriggered && triggerOnce) return;

    const handleIntersect = () => {
      setIsVisible(true);
      setHasTriggered(true);
      
      if (triggerOnce) {
        globalLazyLoader.unobserve(element);
      }
    };

    globalLazyLoader.observe(element, handleIntersect);

    return () => {
      globalLazyLoader.unobserve(element);
    };
  }, [hasTriggered, triggerOnce]);

  const reset = () => {
    setIsVisible(false);
    setHasTriggered(false);
  };

  return {
    elementRef,
    isVisible: triggerOnce ? hasTriggered : isVisible,
    hasTriggered,
    reset
  };
};

/**
 * Hook for lazy loading images
 */
export const useLazyImage = (src: string, config: LazyLoadingConfig = {}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const { elementRef, isVisible } = useLazyLoading(config);

  useEffect(() => {
    if (isVisible && src && !isLoaded && !isError) {
      const img = new Image();
      
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
      
      img.onerror = () => {
        setIsError(true);
      };
      
      img.src = src;
    }
  }, [isVisible, src, isLoaded, isError]);

  return {
    elementRef,
    imageSrc,
    isLoaded,
    isError,
    isVisible
  };
};

/**
 * Hook for lazy loading video thumbnails with preloading
 */
export const useLazyVideoThumbnail = (
  thumbnailUrl: string,
  preloadDistance: number = 200
) => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [shouldPreload, setShouldPreload] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const distance = entry.boundingClientRect.top;
          
          // Preload when within preload distance
          if (distance < preloadDistance && !shouldPreload) {
            setShouldPreload(true);
          }
          
          // Load when visible
          if (entry.isIntersecting && !shouldLoad) {
            setShouldLoad(true);
          }
        });
      },
      {
        rootMargin: `${preloadDistance}px`,
        threshold: 0
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [preloadDistance, shouldLoad, shouldPreload]);

  // Preload image
  useEffect(() => {
    if (shouldPreload && thumbnailUrl && !isLoaded && !isError) {
      const img = new Image();
      img.src = thumbnailUrl; // Start loading but don't set to visible yet
    }
  }, [shouldPreload, thumbnailUrl, isLoaded, isError]);

  // Load image when visible
  useEffect(() => {
    if (shouldLoad && thumbnailUrl && !isLoaded && !isError) {
      const img = new Image();
      
      img.onload = () => {
        setIsLoaded(true);
      };
      
      img.onerror = () => {
        setIsError(true);
      };
      
      img.src = thumbnailUrl;
    }
  }, [shouldLoad, thumbnailUrl, isLoaded, isError]);

  return {
    elementRef,
    shouldLoad,
    shouldPreload,
    isLoaded,
    isError,
    imageSrc: isLoaded ? thumbnailUrl : undefined
  };
};

/**
 * Hook for viewport-based visibility detection
 */
export const useViewportVisibility = (threshold: number = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const [visibilityRatio, setVisibilityRatio] = useState(0);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
          setVisibilityRatio(entry.intersectionRatio);
        });
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  return {
    elementRef,
    isVisible,
    visibilityRatio
  };
};

/**
 * Hook for managing multiple lazy-loaded items
 */
export const useLazyList = <T>(
  items: T[],
  getKey: (item: T) => string,
  batchSize: number = 10
) => {
  const [loadedCount, setLoadedCount] = useState(batchSize);
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const sentinelRef = useRef<HTMLElement>(null);

  // Intersection observer for loading more items
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && loadedCount < items.length) {
            setLoadedCount(prev => Math.min(prev + batchSize, items.length));
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [loadedCount, items.length, batchSize]);

  // Track visible items for memory management
  const registerItemVisibility = (key: string, isVisible: boolean) => {
    setVisibleItems(prev => {
      const next = new Set(prev);
      if (isVisible) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  };

  const visibleItemsList = items.slice(0, loadedCount);
  const hasMore = loadedCount < items.length;

  return {
    sentinelRef,
    visibleItems: visibleItemsList,
    visibleItemsSet: visibleItems,
    hasMore,
    loadedCount,
    totalCount: items.length,
    registerItemVisibility
  };
};