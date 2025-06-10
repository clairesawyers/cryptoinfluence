/**
 * Responsive sizing utilities for mobile devices
 */

export interface CardDimensions {
  width: number;
  height: number;
  minSize: number;
}

export interface BubbleSizeConfig {
  minRadius: number;
  maxRadius: number;
  scaleFactor: number;
  touchTargetMin: number;
}

/**
 * Calculate optimal card sizes based on screen dimensions
 */
export const getOptimalCardSize = (screenWidth: number, screenHeight: number): CardDimensions => {
  const isPortrait = screenHeight > screenWidth;
  const minTouchTarget = 44; // Apple's minimum touch target
  
  // iPhone SE and smaller
  if (screenWidth < 375) {
    return { 
      width: isPortrait ? 140 : 120, 
      height: isPortrait ? 105 : 90, 
      minSize: minTouchTarget 
    };
  } 
  // iPhone 12/13 mini
  else if (screenWidth < 414) {
    return { 
      width: isPortrait ? 160 : 140, 
      height: isPortrait ? 120 : 105, 
      minSize: minTouchTarget 
    };
  } 
  // iPhone 12/13/14 standard
  else if (screenWidth < 430) {
    return { 
      width: isPortrait ? 180 : 160, 
      height: isPortrait ? 135 : 120, 
      minSize: minTouchTarget 
    };
  }
  // iPhone Pro Max and larger
  else {
    return { 
      width: isPortrait ? 200 : 180, 
      height: isPortrait ? 150 : 135, 
      minSize: minTouchTarget 
    };
  }
};

/**
 * Calculate optimal bubble sizes for mobile screens
 */
export const getOptimalBubbleSize = (
  screenWidth: number, 
  screenHeight: number,
  bubbleCount: number
): BubbleSizeConfig => {
  const screenArea = screenWidth * screenHeight;
  const isPortrait = screenHeight > screenWidth;
  
  // Base configuration
  let config: BubbleSizeConfig = {
    minRadius: 30,
    maxRadius: 80,
    scaleFactor: 1,
    touchTargetMin: 44
  };
  
  // Adjust for screen size
  if (screenWidth < 375) {
    // iPhone SE
    config.minRadius = 25;
    config.maxRadius = 60;
    config.scaleFactor = 0.8;
  } else if (screenWidth < 414) {
    // iPhone 12/13 mini
    config.minRadius = 28;
    config.maxRadius = 70;
    config.scaleFactor = 0.9;
  } else if (screenWidth < 430) {
    // iPhone standard
    config.minRadius = 30;
    config.maxRadius = 75;
    config.scaleFactor = 0.95;
  }
  
  // Adjust for bubble density
  const density = bubbleCount / (screenArea / 10000);
  if (density > 5) {
    // High density - reduce sizes
    config.maxRadius *= 0.8;
    config.minRadius *= 0.9;
  } else if (density < 2) {
    // Low density - increase sizes
    config.maxRadius *= 1.2;
    config.minRadius *= 1.1;
  }
  
  // Portrait adjustments
  if (isPortrait) {
    config.maxRadius *= 0.95;
  }
  
  return config;
};

/**
 * Get responsive grid configuration for video cards
 */
export const getResponsiveGrid = (screenWidth: number): {
  columns: number;
  gap: number;
  padding: number;
} => {
  if (screenWidth < 375) {
    return { columns: 2, gap: 8, padding: 12 };
  } else if (screenWidth < 414) {
    return { columns: 2, gap: 12, padding: 16 };
  } else if (screenWidth < 768) {
    return { columns: 2, gap: 16, padding: 20 };
  } else if (screenWidth < 1024) {
    return { columns: 3, gap: 16, padding: 24 };
  } else {
    return { columns: 4, gap: 20, padding: 32 };
  }
};

/**
 * Calculate responsive font sizes with advanced mobile-first approach
 */
export const getResponsiveFontSize = (
  baseFontSize: number,
  screenWidth: number,
  elementType: 'title' | 'subtitle' | 'body' | 'caption' | 'label' = 'body',
  cardWidth?: number
): number => {
  // Base scale factor based on screen width (iPhone SE = 375px baseline)
  const baselineWidth = 375;
  let scaleFactor = Math.min(screenWidth / baselineWidth, 1.2); // Cap at 120% scaling
  
  // Apply device-specific adjustments
  if (screenWidth < 320) {
    // Very small screens (older devices)
    scaleFactor = 0.8;
  } else if (screenWidth < 375) {
    // iPhone SE and similar
    scaleFactor = 0.85;
  } else if (screenWidth < 414) {
    // iPhone 12/13 mini
    scaleFactor = 0.9;
  } else if (screenWidth < 430) {
    // iPhone 12/13/14 standard
    scaleFactor = 0.95;
  } else if (screenWidth >= 430) {
    // iPhone Pro Max and larger
    scaleFactor = Math.min(screenWidth / baselineWidth, 1.2);
  }
  
  // Additional scaling based on element type
  switch (elementType) {
    case 'title':
      scaleFactor *= 1.15; // Titles slightly larger
      break;
    case 'subtitle':
      scaleFactor *= 1.05; // Subtitles moderately larger
      break;
    case 'caption':
      scaleFactor *= 0.85; // Captions smaller
      break;
    case 'label':
      scaleFactor *= 0.9; // Labels smaller
      break;
    case 'body':
    default:
      // No additional scaling for body text
      break;
  }
  
  // If card width is provided, consider card-relative scaling
  if (cardWidth) {
    const cardScaleFactor = Math.min(cardWidth / 200, 1.1); // Base card width 200px
    scaleFactor *= cardScaleFactor;
  }
  
  // Calculate final font size with minimum readable size
  const calculatedSize = baseFontSize * scaleFactor;
  
  // Set minimum sizes based on element type for accessibility
  const minimumSizes = {
    title: 16,
    subtitle: 14,
    body: 12,
    caption: 10,
    label: 10
  };
  
  return Math.max(Math.round(calculatedSize), minimumSizes[elementType]);
};

/**
 * Get optimal font family stack for mobile devices
 */
export const getMobileFontStack = (platform?: 'ios' | 'android' | 'web'): string => {
  switch (platform) {
    case 'ios':
      return '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif';
    case 'android':
      return '"Roboto", "Noto Sans", "Droid Sans", sans-serif';
    case 'web':
    default:
      return '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif';
  }
};

/**
 * Calculate line height for optimal readability
 */
export const getOptimalLineHeight = (
  fontSize: number,
  elementType: 'title' | 'subtitle' | 'body' | 'caption' | 'label' = 'body'
): number => {
  const baseLineHeights = {
    title: 1.2,
    subtitle: 1.3,
    body: 1.4,
    caption: 1.3,
    label: 1.2
  };
  
  // Adjust line height for very small or large font sizes
  if (fontSize < 12) {
    return baseLineHeights[elementType] + 0.1; // Increase line height for small text
  } else if (fontSize > 24) {
    return baseLineHeights[elementType] - 0.1; // Decrease line height for large text
  }
  
  return baseLineHeights[elementType];
};

/**
 * Get responsive canvas font configuration
 */
export const getCanvasFontConfig = (
  baseFontSize: number,
  screenWidth: number,
  cardWidth: number,
  elementType: 'title' | 'subtitle' | 'body' | 'caption' | 'label' = 'body',
  devicePixelRatio: number = 1
): {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
} => {
  const fontSize = getResponsiveFontSize(baseFontSize, screenWidth, elementType, cardWidth);
  const adjustedFontSize = Math.round(fontSize * Math.max(1, devicePixelRatio * 0.75));
  
  return {
    fontSize: adjustedFontSize,
    fontFamily: getMobileFontStack(),
    lineHeight: getOptimalLineHeight(fontSize, elementType)
  };
};