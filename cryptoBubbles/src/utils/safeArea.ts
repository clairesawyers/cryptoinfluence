/**
 * Safe area utilities for handling device notches and rounded corners
 */

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * Get safe area insets from CSS environment variables
 */
export const getSafeAreaInsets = (): SafeAreaInsets => {
  const getInsetValue = (property: string): number => {
    if (typeof window === 'undefined') return 0;
    
    try {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(`--safe-area-inset-${property}`)
        .replace('px', '');
      return parseFloat(value) || 0;
    } catch {
      return 0;
    }
  };

  return {
    top: getInsetValue('top'),
    bottom: getInsetValue('bottom'),
    left: getInsetValue('left'),
    right: getInsetValue('right')
  };
};

/**
 * Check if device has safe area insets (notch/rounded corners)
 */
export const hasSafeAreaInsets = (): boolean => {
  const insets = getSafeAreaInsets();
  return insets.top > 0 || insets.bottom > 0 || insets.left > 0 || insets.right > 0;
};

/**
 * Get safe area CSS properties
 */
export const getSafeAreaStyle = (options: {
  respectTop?: boolean;
  respectBottom?: boolean;
  respectLeft?: boolean;
  respectRight?: boolean;
} = {}): React.CSSProperties => {
  const {
    respectTop = true,
    respectBottom = true,
    respectLeft = true,
    respectRight = true
  } = options;

  return {
    paddingTop: respectTop ? 'env(safe-area-inset-top)' : undefined,
    paddingBottom: respectBottom ? 'env(safe-area-inset-bottom)' : undefined,
    paddingLeft: respectLeft ? 'env(safe-area-inset-left)' : undefined,
    paddingRight: respectRight ? 'env(safe-area-inset-right)' : undefined,
  };
};

/**
 * Get safe area margin style (alternative to padding)
 */
export const getSafeAreaMarginStyle = (options: {
  respectTop?: boolean;
  respectBottom?: boolean;
  respectLeft?: boolean;
  respectRight?: boolean;
} = {}): React.CSSProperties => {
  const {
    respectTop = true,
    respectBottom = true,
    respectLeft = true,
    respectRight = true
  } = options;

  return {
    marginTop: respectTop ? 'env(safe-area-inset-top)' : undefined,
    marginBottom: respectBottom ? 'env(safe-area-inset-bottom)' : undefined,
    marginLeft: respectLeft ? 'env(safe-area-inset-left)' : undefined,
    marginRight: respectRight ? 'env(safe-area-inset-right)' : undefined,
  };
};

/**
 * Calculate viewport dimensions accounting for safe areas
 */
export const getSafeAreaAdjustedDimensions = (): {
  width: number;
  height: number;
  availableWidth: number;
  availableHeight: number;
} => {
  const insets = getSafeAreaInsets();
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  return {
    width,
    height,
    availableWidth: width - insets.left - insets.right,
    availableHeight: height - insets.top - insets.bottom
  };
};

/**
 * Get minimum safe touch target positioning
 */
export const getSafeTouchTargetStyle = (elementHeight: number = 44): React.CSSProperties => {
  const insets = getSafeAreaInsets();
  
  return {
    minHeight: `${Math.max(elementHeight, 44)}px`, // Apple's minimum touch target
    paddingTop: `max(16px, env(safe-area-inset-top))`,
    paddingBottom: `max(16px, env(safe-area-inset-bottom))`,
    paddingLeft: `max(16px, env(safe-area-inset-left))`,
    paddingRight: `max(16px, env(safe-area-inset-right))`,
  };
};

/**
 * Get canvas positioning that avoids safe areas
 */
export const getSafeAreaCanvasStyle = (
  canvasSize: { width: number; height: number },
  options: {
    respectTop?: boolean;
    respectBottom?: boolean;
    respectLeft?: boolean;
    respectRight?: boolean;
    useMargin?: boolean;
  } = {}
): React.CSSProperties => {
  const {
    respectTop = true,
    respectBottom = true,
    respectLeft = true,
    respectRight = true,
    useMargin = false
  } = options;

  const baseStyle: React.CSSProperties = {
    width: canvasSize.width,
    height: canvasSize.height,
    maxWidth: '100vw',
    maxHeight: '100vh',
  };

  if (useMargin) {
    return {
      ...baseStyle,
      ...getSafeAreaMarginStyle({ respectTop, respectBottom, respectLeft, respectRight })
    };
  } else {
    return {
      ...baseStyle,
      ...getSafeAreaStyle({ respectTop, respectBottom, respectLeft, respectRight })
    };
  }
};

import { useState, useEffect } from 'react';

/**
 * Hook to monitor safe area changes
 */

export const useSafeAreaInsets = () => {
  const [insets, setInsets] = useState<SafeAreaInsets>(getSafeAreaInsets());

  useEffect(() => {
    const updateInsets = () => {
      setInsets(getSafeAreaInsets());
    };

    // Update on resize or orientation change
    window.addEventListener('resize', updateInsets);
    window.addEventListener('orientationchange', updateInsets);

    // Update on safe area change (if supported)
    const observer = new ResizeObserver(updateInsets);
    observer.observe(document.documentElement);

    return () => {
      window.removeEventListener('resize', updateInsets);
      window.removeEventListener('orientationchange', updateInsets);
      observer.disconnect();
    };
  }, []);

  return {
    insets,
    hasSafeArea: hasSafeAreaInsets(),
    getSafeStyle: getSafeAreaStyle,
    getSafeMarginStyle: getSafeAreaMarginStyle,
    getSafeTouchStyle: getSafeTouchTargetStyle,
    getSafeCanvasStyle: getSafeAreaCanvasStyle,
    getSafeDimensions: getSafeAreaAdjustedDimensions
  };
};