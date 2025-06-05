import { VideoItem, BubblePosition } from '../types';

export const calculateCardSize = (viewCount: number, maxViews: number): number => {
  const minSize = 120;
  const maxSize = 220;
  const sizeRatio = Math.sqrt(viewCount / maxViews); // Square root for more balanced sizing
  return minSize + (maxSize - minSize) * sizeRatio;
};

export const calculateSpiralPositions = (
  canvasWidth: number,
  canvasHeight: number,
  videos: VideoItem[]
): BubblePosition[] => {
  if (videos.length === 0) return [];
  
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const positions: BubblePosition[] = [];
  const maxViews = Math.max(...videos.map(v => v.view_count));
  
  // Center the highest view count video
  const centerSize = calculateCardSize(videos[0].view_count, maxViews);
  positions.push({
    x: centerX,
    y: centerY,
    size: centerSize,
    scale: 1.0
  });
  
  if (videos.length === 1) return positions;
  
  // Arrange others in spiral pattern
  let angle = 0;
  let radius = centerSize / 2 + 80; // Start radius based on center card size
  const radiusIncrement = 60;
  const angleIncrement = Math.PI * 0.75; // Golden ratio for more natural distribution
  let itemsInCurrentRing = 0;
  const maxItemsPerRing = 6;
  
  for (let i = 1; i < videos.length; i++) {
    const cardSize = calculateCardSize(videos[i].view_count, maxViews);
    
    // Calculate position
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    // Ensure cards don't go off canvas
    const clampedX = Math.max(cardSize / 2 + 10, Math.min(canvasWidth - cardSize / 2 - 10, x));
    const clampedY = Math.max(cardSize / 2 + 10, Math.min(canvasHeight - cardSize / 2 - 10, y));
    
    positions.push({
      x: clampedX,
      y: clampedY,
      size: cardSize,
      scale: 0.9 + (videos[i].view_count / maxViews) * 0.1 // Slight scale variation
    });
    
    // Update angle and potentially radius
    angle += angleIncrement;
    itemsInCurrentRing++;
    
    if (itemsInCurrentRing >= maxItemsPerRing) {
      radius += radiusIncrement;
      itemsInCurrentRing = 0;
      angle += Math.PI * 0.1; // Offset next ring slightly
    }
  }
  
  return positions;
};

export const checkCollision = (
  x1: number, y1: number, size1: number,
  x2: number, y2: number, size2: number
): boolean => {
  const dx = x1 - x2;
  const dy = y1 - y2;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const minDistance = (size1 + size2) / 2 + 10; // 10px padding
  return distance < minDistance;
};

export const findNonCollidingPosition = (
  x: number, y: number, size: number,
  existingPositions: BubblePosition[],
  canvasWidth: number, canvasHeight: number
): { x: number; y: number } => {
  let attempts = 0;
  let newX = x;
  let newY = y;
  
  while (attempts < 50) {
    let hasCollision = false;
    
    for (const pos of existingPositions) {
      if (checkCollision(newX, newY, size, pos.x, pos.y, pos.size)) {
        hasCollision = true;
        break;
      }
    }
    
    if (!hasCollision) {
      return { x: newX, y: newY };
    }
    
    // Try a new position in a spiral pattern
    const angle = attempts * 0.5;
    const radius = attempts * 5;
    newX = x + Math.cos(angle) * radius;
    newY = y + Math.sin(angle) * radius;
    
    // Keep within canvas bounds
    newX = Math.max(size / 2 + 10, Math.min(canvasWidth - size / 2 - 10, newX));
    newY = Math.max(size / 2 + 10, Math.min(canvasHeight - size / 2 - 10, newY));
    
    attempts++;
  }
  
  return { x: newX, y: newY };
};