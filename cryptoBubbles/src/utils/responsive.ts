import { MobileDetection } from '../hooks/useMobileDetect';

// Responsive sizing utilities that work with our mobile detection
export interface ResponsiveSize {
  phone: number;
  tablet: number;
  desktop: number;
}

export interface ResponsiveSpacing {
  phone: number;
  tablet: number;
  desktop: number;
}

// Get responsive value based on device type
export const getResponsiveValue = <T>(
  values: { phone: T; tablet: T; desktop: T },
  detection: MobileDetection
): T => {
  if (detection.isMobile) return values.phone;
  if (detection.isTablet) return values.tablet;
  return values.desktop;
};

// Canvas sizing for different devices
export const CANVAS_SIZES: ResponsiveSize = {
  phone: 350,    // Small canvas for phones
  tablet: 600,   // Medium canvas for tablets
  desktop: 800   // Full canvas for desktop
};

// Card sizes for bubbles
export const CARD_SIZES: ResponsiveSize = {
  phone: 120,    // Smaller cards on phone
  tablet: 160,   // Medium cards on tablet
  desktop: 200   // Full size cards on desktop
};

// Minimum touch target sizes (following Apple/Google guidelines)
export const TOUCH_TARGETS: ResponsiveSize = {
  phone: 44,     // 44px minimum on phones
  tablet: 44,    // Same on tablets
  desktop: 32    // Can be smaller on desktop (mouse precision)
};

// Spacing values
export const SPACING: ResponsiveSpacing = {
  phone: 8,      // Tighter spacing on phones
  tablet: 12,    // Medium spacing on tablets
  desktop: 16    // Full spacing on desktop
};

// Border radius values
export const BORDER_RADIUS: ResponsiveSpacing = {
  phone: 8,      // Slightly rounded on phones
  tablet: 10,    // Medium rounded on tablets
  desktop: 12    // Full rounded on desktop
};

// Font sizes
export const FONT_SIZES = {
  title: {
    phone: 16,
    tablet: 18,
    desktop: 20
  },
  subtitle: {
    phone: 14,
    tablet: 15,
    desktop: 16
  },
  body: {
    phone: 12,
    tablet: 13,
    desktop: 14
  },
  caption: {
    phone: 10,
    tablet: 11,
    desktop: 12
  }
} as const;

// Calculate grid layout based on screen size
export const calculateGridLayout = (
  containerWidth: number,
  detection: MobileDetection
) => {
  const cardSize = getResponsiveValue(CARD_SIZES, detection);
  const spacing = getResponsiveValue(SPACING, detection);
  
  // Calculate how many cards can fit horizontally
  const availableWidth = containerWidth - spacing * 2; // Account for container padding
  const cardWithSpacing = cardSize + spacing;
  const columns = Math.floor(availableWidth / cardWithSpacing);
  
  return {
    columns: Math.max(1, columns),
    cardSize,
    spacing,
    gridWidth: columns * cardWithSpacing - spacing + spacing * 2
  };
};

// Safe area utilities
export const getSafeAreaPadding = (detection: MobileDetection) => {
  // Only apply safe area padding on mobile devices
  if (!detection.isMobile) {
    return {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    };
  }

  return {
    top: detection.isIOS ? 'env(safe-area-inset-top)' : '0px',
    bottom: detection.isIOS ? 'env(safe-area-inset-bottom)' : '0px',
    left: detection.isIOS ? 'env(safe-area-inset-left)' : '0px',
    right: detection.isIOS ? 'env(safe-area-inset-right)' : '0px'
  };
};

// Animation durations (faster on mobile for better performance)
export const ANIMATION_DURATIONS = {
  fast: {
    phone: 150,
    tablet: 200,
    desktop: 250
  },
  normal: {
    phone: 200,
    tablet: 250,
    desktop: 300
  },
  slow: {
    phone: 300,
    tablet: 400,
    desktop: 500
  }
} as const;

// Responsive breakpoint utilities
export const BREAKPOINTS = {
  phone: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
  touch: '(hover: none) and (pointer: coarse)',
  mouse: '(hover: hover) and (pointer: fine)'
} as const;

// Generate CSS custom properties for responsive values
export const generateResponsiveCSS = (detection: MobileDetection) => {
  const cardSize = getResponsiveValue(CARD_SIZES, detection);
  const spacing = getResponsiveValue(SPACING, detection);
  const borderRadius = getResponsiveValue(BORDER_RADIUS, detection);
  const safeArea = getSafeAreaPadding(detection);
  
  return {
    '--card-size': `${cardSize}px`,
    '--spacing': `${spacing}px`,
    '--border-radius': `${borderRadius}px`,
    '--safe-area-top': safeArea.top,
    '--safe-area-bottom': safeArea.bottom,
    '--safe-area-left': safeArea.left,
    '--safe-area-right': safeArea.right,
    '--touch-target': `${getResponsiveValue(TOUCH_TARGETS, detection)}px`
  };
};

// Utility for responsive class names
export const getResponsiveClasses = (detection: MobileDetection) => {
  const classes = [];
  
  if (detection.isMobile) classes.push('is-mobile');
  if (detection.isTablet) classes.push('is-tablet');
  if (detection.isDesktop) classes.push('is-desktop');
  if (detection.isTouch) classes.push('is-touch');
  if (detection.isIOS) classes.push('is-ios');
  if (detection.isAndroid) classes.push('is-android');
  
  classes.push(`screen-${detection.screenSize}`);
  classes.push(`device-${detection.deviceType}`);
  classes.push(`orientation-${detection.orientation}`);
  
  return classes.join(' ');
};