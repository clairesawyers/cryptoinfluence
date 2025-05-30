import { VideoItem, BubblePosition, CardSize } from '../types';

/**
 * Calculate positions for video cards in a spiral layout
 * @param canvasWidth Width of the canvas
 * @param canvasHeight Height of the canvas
 * @param cards Array of video items to position
 * @returns Array of positions for each card
 */
export const calculateSpiralPositions = (
  canvasWidth: number, 
  canvasHeight: number, 
  cards: VideoItem[]
): BubblePosition[] => {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const positions: BubblePosition[] = [];
  
  if (cards.length > 0) {
    positions.push({ x: centerX, y: centerY });
  }
  
  let angle = 0;
  let radius = 120;
  const radiusIncrement = 40;
  const angleIncrement = Math.PI * 0.8;
  
  for (let i = 1; i < cards.length; i++) {
    angle += angleIncrement;
    if (i % 3 === 0) radius += radiusIncrement;
    
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    positions.push({ x, y });
  }
  
  return positions;
};

/**
 * Calculate card size based on view count
 * @param viewCount Number of views for the video
 * @param maxViews Maximum view count in the dataset
 * @returns Object with cardWidth and cardHeight
 */
export const calculateCardSize = (viewCount: number, maxViews: number): CardSize => {
  const minSize = 100;
  const maxSize = 200;
  const sizeRatio = viewCount / maxViews;
  const cardWidth = minSize + (maxSize - minSize) * sizeRatio;
  const cardHeight = cardWidth * 0.65; // Maintain card proportions
  
  return { cardWidth, cardHeight };
};

/**
 * Format view count for display (e.g., 1.2M, 345K)
 * @param count Number to format
 * @returns Formatted string
 */
export const formatViewCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

/**
 * Format duration in seconds to MM:SS format
 * @param seconds Duration in seconds
 * @returns Formatted duration string
 */
export const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

/**
 * Filter videos by date range based on view mode
 * @param videos Array of videos to filter
 * @param selectedDate Selected date for filtering
 * @param viewMode Current view mode (day, week, month)
 * @returns Filtered array of videos
 */
export const filterVideosByDate = (
  videos: VideoItem[],
  selectedDate: Date,
  viewMode: 'day' | 'week' | 'month'
): VideoItem[] => {
  const startDate = new Date(selectedDate);
  const endDate = new Date(selectedDate);
  
  startDate.setHours(0, 0, 0, 0);
  
  if (viewMode === 'day') {
    endDate.setHours(23, 59, 59, 999);
  } else if (viewMode === 'week') {
    const day = startDate.getDay();
    startDate.setDate(startDate.getDate() - day);
    
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
  } else if (viewMode === 'month') {
    startDate.setDate(1);
    
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);
    endDate.setHours(23, 59, 59, 999);
  }
  
  return videos.filter(video => {
    const publishDate = new Date(video.publish_date || video.published_at);
    return publishDate >= startDate && publishDate <= endDate;
  });
};

/**
 * Check if a point is inside a card
 * @param x X coordinate of the point
 * @param y Y coordinate of the point
 * @param cardX X coordinate of the card
 * @param cardY Y coordinate of the card
 * @param cardWidth Width of the card
 * @param cardHeight Height of the card
 * @returns Boolean indicating if the point is inside the card
 */
export const isPointInCard = (
  x: number,
  y: number,
  cardX: number,
  cardY: number,
  cardWidth: number,
  cardHeight: number
): boolean => {
  return (
    x >= cardX - cardWidth / 2 &&
    x <= cardX + cardWidth / 2 &&
    y >= cardY - cardHeight / 2 &&
    y <= cardY + cardHeight / 2
  );
};

/**
 * Get the index of the card at a specific point
 * @param x X coordinate of the point
 * @param y Y coordinate of the point
 * @param positions Array of card positions
 * @param sizes Array of card sizes
 * @returns Index of the card or -1 if no card at the point
 */
export const getCardAtPoint = (
  x: number,
  y: number,
  positions: BubblePosition[],
  sizes: CardSize[]
): number => {
  for (let i = positions.length - 1; i >= 0; i--) {
    const { x: cardX, y: cardY } = positions[i];
    const { cardWidth, cardHeight } = sizes[i];
    
    if (isPointInCard(x, y, cardX, cardY, cardWidth, cardHeight)) {
      return i;
    }
  }
  
  return -1;
};
