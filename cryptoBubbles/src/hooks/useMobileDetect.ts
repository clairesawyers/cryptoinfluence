import { useState, useEffect } from 'react';

export interface MobileDetection {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  deviceType: 'phone' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
  viewportWidth: number;
  viewportHeight: number;
}

// Breakpoints matching Tailwind CSS
const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

export const useMobileDetect = (): MobileDetection => {
  const [detection, setDetection] = useState<MobileDetection>(() => {
    // Initialize with safe defaults for SSR
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouch: false,
        isIOS: false,
        isAndroid: false,
        screenSize: 'lg',
        deviceType: 'desktop',
        orientation: 'landscape',
        viewportWidth: 1024,
        viewportHeight: 768
      };
    }

    // Get initial values
    const width = window.innerWidth;
    const height = window.innerHeight;
    const userAgent = navigator.userAgent.toLowerCase();
    
    return calculateDetection(width, height, userAgent);
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent.toLowerCase();
      
      setDetection(calculateDetection(width, height, userAgent));
    };

    // Set initial values
    handleResize();

    // Listen for resize events
    window.addEventListener('resize', handleResize);
    
    // Listen for orientation changes on mobile
    window.addEventListener('orientationchange', () => {
      // Delay to allow orientation change to complete
      setTimeout(handleResize, 100);
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return detection;
};

function calculateDetection(width: number, height: number, userAgent: string): MobileDetection {
  // Determine screen size
  let screenSize: MobileDetection['screenSize'] = 'xs';
  if (width >= BREAKPOINTS['2xl']) screenSize = '2xl';
  else if (width >= BREAKPOINTS.xl) screenSize = 'xl';
  else if (width >= BREAKPOINTS.lg) screenSize = 'lg';
  else if (width >= BREAKPOINTS.md) screenSize = 'md';
  else if (width >= BREAKPOINTS.sm) screenSize = 'sm';

  // Device detection
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isMobileUA = /mobi|android|touch|mini/.test(userAgent);
  const isTabletUA = /ipad|tablet|(android(?!.*mobi))|(windows(?!.*phone))/.test(userAgent);
  
  // Touch detection
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Size-based detection (more reliable than user agent)
  const isMobileSize = width < BREAKPOINTS.md; // < 768px
  const isTabletSize = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg; // 768px - 1024px
  const isDesktopSize = width >= BREAKPOINTS.lg; // >= 1024px

  // Combine user agent and size detection
  // Only consider it mobile if BOTH size is small AND it has mobile user agent or touch
  const isMobile = isMobileSize && (isMobileUA || (isTouch && !isDesktopSize));
  const isTablet = isTabletSize && (isTabletUA || (isTouch && !isMobile));
  const isDesktop = !isMobile && !isTablet;

  // Device type classification
  let deviceType: MobileDetection['deviceType'] = 'desktop';
  if (isMobile) deviceType = 'phone';
  else if (isTablet) deviceType = 'tablet';

  // Orientation
  const orientation: MobileDetection['orientation'] = width > height ? 'landscape' : 'portrait';

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouch,
    isIOS,
    isAndroid,
    screenSize,
    deviceType,
    orientation,
    viewportWidth: width,
    viewportHeight: height
  };
}

// Helper functions for common checks
export const useIsMobile = (): boolean => {
  const { isMobile } = useMobileDetect();
  return isMobile;
};

export const useIsTablet = (): boolean => {
  const { isTablet } = useMobileDetect();
  return isTablet;
};

export const useIsDesktop = (): boolean => {
  const { isDesktop } = useMobileDetect();
  return isDesktop;
};

export const useScreenSize = (): MobileDetection['screenSize'] => {
  const { screenSize } = useMobileDetect();
  return screenSize;
};