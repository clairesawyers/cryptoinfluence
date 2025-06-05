import React, { useRef, useEffect, useCallback } from 'react';
import { BubbleCard } from '../types';
import { formatViewCount, formatDuration } from '../utils/formatting';

interface BubbleCanvasProps {
  bubbles: BubbleCard[];
  onCardClick: (card: BubbleCard) => void;
  canvasSize: { width: number; height: number };
}

export const BubbleCanvas: React.FC<BubbleCanvasProps> = ({
  bubbles,
  onCardClick,
  canvasSize
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  
  // Cache for loaded images
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  // Load thumbnail images
  const loadImage = useCallback((url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      // Check cache first
      if (imageCache.current.has(url)) {
        resolve(imageCache.current.get(url)!);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous'; // Handle CORS
      img.onload = () => {
        imageCache.current.set(url, img);
        resolve(img);
      };
      img.onerror = () => {
        console.warn('Failed to load thumbnail:', url);
        reject(new Error(`Failed to load image: ${url}`));
      };
      img.src = url;
    });
  }, []);

  // Pre-load all thumbnail images
  useEffect(() => {
    bubbles.forEach(card => {
      if (card.thumbnail_url) {
        loadImage(card.thumbnail_url).catch(() => {
          // Silently handle errors - the drawCard will handle missing images
        });
      }
    });
  }, [bubbles, loadImage]);

  const drawCard = useCallback((
    ctx: CanvasRenderingContext2D,
    card: BubbleCard,
    timestamp: number
  ) => {
    const { x, y, size } = card.position;
    const cardWidth = size;
    const cardHeight = size * 0.75;
    
    // Hover animation for selected cards
    const hoverOffset = card.isSelected ? 4 : 0;
    const hoverScale = card.isSelected ? 1 + Math.sin(timestamp * 0.005) * 0.02 : 1;
    const actualWidth = cardWidth * hoverScale;
    const actualHeight = cardHeight * hoverScale;
    const actualX = x - actualWidth / 2 - hoverOffset * 0.5;
    const actualY = y - actualHeight / 2 - hoverOffset;
    
    ctx.save();
    
    // Multiple layered shadows for intense 3D effect
    if (card.isSelected) {
      // Intense selected shadows
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 10;
      ctx.shadowOffsetY = 10;
    } else {
      // Base card shadows
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 6;
      ctx.shadowOffsetY = 6;
    }
    
    // Main card gradient background (matching VideoReleaseCard)
    const gradient = ctx.createLinearGradient(
      actualX, 
      actualY, 
      actualX + actualWidth * 0.5, 
      actualY + actualHeight
    );
    gradient.addColorStop(0, '#1f1f1f');
    gradient.addColorStop(0.5, '#171717');
    gradient.addColorStop(1, '#121212');
    
    ctx.fillStyle = gradient;
    
    // Rounded rectangle for card
    const cornerRadius = 12;
    ctx.beginPath();
    ctx.moveTo(actualX + cornerRadius, actualY);
    ctx.lineTo(actualX + actualWidth - cornerRadius, actualY);
    ctx.quadraticCurveTo(actualX + actualWidth, actualY, actualX + actualWidth, actualY + cornerRadius);
    ctx.lineTo(actualX + actualWidth, actualY + actualHeight - cornerRadius);
    ctx.quadraticCurveTo(actualX + actualWidth, actualY + actualHeight, actualX + actualWidth - cornerRadius, actualY + actualHeight);
    ctx.lineTo(actualX + cornerRadius, actualY + actualHeight);
    ctx.quadraticCurveTo(actualX, actualY + actualHeight, actualX, actualY + actualHeight - cornerRadius);
    ctx.lineTo(actualX, actualY + cornerRadius);
    ctx.quadraticCurveTo(actualX, actualY, actualX + cornerRadius, actualY);
    ctx.closePath();
    ctx.fill();
    
    // Beveled border effect (different colors for top/left vs bottom/right)
    ctx.lineWidth = 2;
    
    // Top and left borders (lighter)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(actualX + cornerRadius, actualY);
    ctx.lineTo(actualX + actualWidth - cornerRadius, actualY);
    ctx.moveTo(actualX, actualY + cornerRadius);
    ctx.lineTo(actualX, actualY + actualHeight - cornerRadius);
    ctx.stroke();
    
    // Bottom and right borders (darker)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.moveTo(actualX + cornerRadius, actualY + actualHeight);
    ctx.lineTo(actualX + actualWidth - cornerRadius, actualY + actualHeight);
    ctx.moveTo(actualX + actualWidth, actualY + cornerRadius);
    ctx.lineTo(actualX + actualWidth, actualY + actualHeight - cornerRadius);
    ctx.stroke();
    
    // Main border
    ctx.strokeStyle = card.isSelected ? '#a855f7' : '#404040';
    ctx.lineWidth = card.isSelected ? 3 : 2;
    ctx.stroke();
    
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Thumbnail area (60% of card height) with rounded corners
    const thumbHeight = actualHeight * 0.6;
    const thumbY = actualY + 16;
    const thumbX = actualX + 16;
    const thumbWidth = actualWidth - 32;
    const actualThumbHeight = thumbHeight - 16;
    const thumbRadius = 8;
    
    // Thumbnail background with rounded corners
    ctx.fillStyle = '#262626';
    ctx.beginPath();
    ctx.moveTo(thumbX + thumbRadius, thumbY);
    ctx.lineTo(thumbX + thumbWidth - thumbRadius, thumbY);
    ctx.quadraticCurveTo(thumbX + thumbWidth, thumbY, thumbX + thumbWidth, thumbY + thumbRadius);
    ctx.lineTo(thumbX + thumbWidth, thumbY + actualThumbHeight - thumbRadius);
    ctx.quadraticCurveTo(thumbX + thumbWidth, thumbY + actualThumbHeight, thumbX + thumbWidth - thumbRadius, thumbY + actualThumbHeight);
    ctx.lineTo(thumbX + thumbRadius, thumbY + actualThumbHeight);
    ctx.quadraticCurveTo(thumbX, thumbY + actualThumbHeight, thumbX, thumbY + actualThumbHeight - thumbRadius);
    ctx.lineTo(thumbX, thumbY + thumbRadius);
    ctx.quadraticCurveTo(thumbX, thumbY, thumbX + thumbRadius, thumbY);
    ctx.closePath();
    ctx.fill();
    
    // Thumbnail border for 3D effect
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw thumbnail image if available
    if (card.thumbnail_url && imageCache.current.has(card.thumbnail_url)) {
      const img = imageCache.current.get(card.thumbnail_url)!;
      
      // Calculate aspect ratio to fit image properly
      const imgAspect = img.width / img.height;
      const thumbAspect = thumbWidth / actualThumbHeight;
      
      let drawWidth = thumbWidth;
      let drawHeight = actualThumbHeight;
      let drawX = thumbX;
      let drawY = thumbY;
      
      if (imgAspect > thumbAspect) {
        // Image is wider - fit to height and center horizontally
        drawHeight = actualThumbHeight;
        drawWidth = drawHeight * imgAspect;
        drawX = thumbX + (thumbWidth - drawWidth) / 2;
      } else {
        // Image is taller - fit to width and center vertically
        drawWidth = thumbWidth;
        drawHeight = drawWidth / imgAspect;
        drawY = thumbY + (actualThumbHeight - drawHeight) / 2;
      }
      
      // Clip to thumbnail bounds
      ctx.save();
      ctx.beginPath();
      ctx.rect(thumbX, thumbY, thumbWidth, actualThumbHeight);
      ctx.clip();
      
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      ctx.restore();
      
      // Add slight overlay for better text readability
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      // Use same clipping for overlay
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(thumbX + thumbRadius, thumbY);
      ctx.lineTo(thumbX + thumbWidth - thumbRadius, thumbY);
      ctx.quadraticCurveTo(thumbX + thumbWidth, thumbY, thumbX + thumbWidth, thumbY + thumbRadius);
      ctx.lineTo(thumbX + thumbWidth, thumbY + actualThumbHeight - thumbRadius);
      ctx.quadraticCurveTo(thumbX + thumbWidth, thumbY + actualThumbHeight, thumbX + thumbWidth - thumbRadius, thumbY + actualThumbHeight);
      ctx.lineTo(thumbX + thumbRadius, thumbY + actualThumbHeight);
      ctx.quadraticCurveTo(thumbX, thumbY + actualThumbHeight, thumbX, thumbY + actualThumbHeight - thumbRadius);
      ctx.lineTo(thumbX, thumbY + thumbRadius);
      ctx.quadraticCurveTo(thumbX, thumbY, thumbX + thumbRadius, thumbY);
      ctx.closePath();
      ctx.clip();
      ctx.fillRect(thumbX, thumbY, thumbWidth, actualThumbHeight);
      ctx.restore();
    } else {
      // Fallback: Platform icon when no thumbnail
      const iconSize = Math.min(thumbWidth, actualThumbHeight) * 0.3;
      const iconX = thumbX + thumbWidth / 2 - iconSize / 2;
      const iconY = thumbY + actualThumbHeight / 2 - iconSize / 2;
      
      ctx.fillStyle = card.influencer.platform === 'youtube' ? '#ff0000' : '#1da1f2';
      ctx.beginPath();
      ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Platform symbol
      ctx.fillStyle = 'white';
      ctx.font = `${iconSize * 0.4}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        card.influencer.platform === 'youtube' ? '▶' : '@',
        iconX + iconSize / 2,
        iconY + iconSize / 2
      );
    }
    
    // Play button overlay (matching VideoReleaseCard)
    const playSize = Math.min(thumbWidth, actualThumbHeight) * 0.3;
    const playX = thumbX + thumbWidth / 2;
    const playY = thumbY + actualThumbHeight / 2;
    
    // Play button background
    const playBgColor = card.isSelected ? 'rgba(168, 85, 247, 0.9)' : 'rgba(0, 0, 0, 0.8)';
    ctx.fillStyle = playBgColor;
    ctx.beginPath();
    ctx.arc(playX, playY, playSize / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Play button glow effect
    if (card.isSelected) {
      ctx.shadowColor = 'rgba(168, 85, 247, 0.8)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.fillStyle = playBgColor;
      ctx.beginPath();
      ctx.arc(playX, playY, playSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    
    // Play icon
    ctx.fillStyle = 'white';
    const triangleSize = playSize * 0.3;
    ctx.beginPath();
    ctx.moveTo(playX - triangleSize * 0.3, playY - triangleSize * 0.5);
    ctx.lineTo(playX - triangleSize * 0.3, playY + triangleSize * 0.5);
    ctx.lineTo(playX + triangleSize * 0.5, playY);
    ctx.closePath();
    ctx.fill();
    
    // External link indicator (top right)
    const linkIndicatorSize = 20;
    const linkX = actualX + actualWidth - linkIndicatorSize - 12;
    const linkY = actualY + 12;
    
    // Only show on hover/selected
    if (card.isSelected) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(linkX, linkY, linkIndicatorSize, linkIndicatorSize);
      
      // External link icon (simplified)
      ctx.strokeStyle = '#a3a3a3';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(linkX + 6, linkY + 14);
      ctx.lineTo(linkX + 14, linkY + 6);
      ctx.moveTo(linkX + 10, linkY + 6);
      ctx.lineTo(linkX + 14, linkY + 6);
      ctx.lineTo(linkX + 14, linkY + 10);
      ctx.stroke();
    }
    
    // Duration badge (YouTube only) - now over the thumbnail
    if (card.influencer.platform === 'youtube' && card.duration_seconds > 0) {
      const duration = formatDuration(card.duration_seconds);
      ctx.font = `${Math.max(8, actualWidth * 0.06)}px Inter`;
      ctx.textAlign = 'right';
      
      const badgeWidth = ctx.measureText(duration).width + 8;
      const badgeHeight = 16;
      const badgeX = thumbX + thumbWidth - badgeWidth - 4;
      const badgeY = thumbY + actualThumbHeight - badgeHeight - 4;
      
      // Badge background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);
      
      // Badge text
      ctx.fillStyle = 'white';
      ctx.textBaseline = 'middle';
      ctx.fillText(duration, badgeX + badgeWidth - 4, badgeY + badgeHeight / 2);
    }
    
    // Info area (40% of card height)
    const infoY = thumbY + actualThumbHeight + 12;
    
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // Video title (matching VideoReleaseCard)
    ctx.fillStyle = '#f5f5f5';
    ctx.font = `600 ${Math.max(9, actualWidth * 0.07)}px Inter`;
    const titleText = card.title;
    const maxTitleWidth = actualWidth - 32;
    let truncatedTitle = titleText;
    
    if (ctx.measureText(titleText).width > maxTitleWidth) {
      while (ctx.measureText(truncatedTitle + '...').width > maxTitleWidth && truncatedTitle.length > 0) {
        truncatedTitle = truncatedTitle.slice(0, -1);
      }
      truncatedTitle += '...';
    }
    
    // Add text shadow for depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 1;
    ctx.fillText(truncatedTitle, actualX + 16, infoY);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Influencer name (purple with glow like VideoReleaseCard)
    ctx.fillStyle = '#a855f7';
    ctx.font = `500 ${Math.max(8, actualWidth * 0.06)}px Inter`;
    const nameText = card.influencer.display_name;
    const maxNameWidth = actualWidth - 32;
    let truncatedName = nameText;
    
    if (ctx.measureText(nameText).width > maxNameWidth) {
      while (ctx.measureText(truncatedName + '...').width > maxNameWidth && truncatedName.length > 0) {
        truncatedName = truncatedName.slice(0, -1);
      }
      truncatedName += '...';
    }
    
    // Purple glow effect for influencer name
    ctx.shadowColor = 'rgba(168, 85, 247, 0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillText(truncatedName, actualX + 16, infoY + Math.max(14, actualWidth * 0.08));
    ctx.shadowBlur = 0;
    
    // View count and date
    ctx.fillStyle = '#a3a3a3';
    ctx.font = `500 ${Math.max(7, actualWidth * 0.05)}px Inter`;
    const viewText = formatViewCount(card.view_count) + ' views';
    ctx.fillText(viewText, actualX + 16, infoY + Math.max(28, actualWidth * 0.14));
    
    
    ctx.restore();
  }, []);

  const draw = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background pattern
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw subtle grid pattern
    ctx.strokeStyle = 'rgba(64, 64, 64, 0.1)';
    ctx.lineWidth = 1;
    const gridSize = 50;
    
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Draw cards (selected cards last to appear on top)
    const unselectedCards = bubbles.filter(card => !card.isSelected);
    const selectedCards = bubbles.filter(card => card.isSelected);
    
    [...unselectedCards, ...selectedCards].forEach(card => {
      drawCard(ctx, card, timestamp);
    });
    
    animationFrameRef.current = requestAnimationFrame(draw);
  }, [bubbles, drawCard]);

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    // Check if click is on any card
    for (const card of bubbles) {
      const { x, y, size } = card.position;
      const cardWidth = size;
      const cardHeight = size * 0.75;
      
      const cardLeft = x - cardWidth / 2;
      const cardRight = x + cardWidth / 2;
      const cardTop = y - cardHeight / 2;
      const cardBottom = y + cardHeight / 2;
      
      if (clickX >= cardLeft && clickX <= cardRight && 
          clickY >= cardTop && clickY <= cardBottom) {
        // Select the card to show detail panel (don't open video immediately)
        onCardClick(card);
        return;
      }
    }
    
    // If no card was clicked, deselect current selection
    onCardClick(null as unknown as BubbleCard);
  }, [bubbles, onCardClick]);

  useEffect(() => {
    if (bubbles.length > 0) {
      animationFrameRef.current = requestAnimationFrame(draw);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [bubbles, draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
  }, [canvasSize]);

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      className="cursor-pointer bg-gray-950"
      style={{ 
        width: canvasSize.width, 
        height: canvasSize.height,
        border: '2px solid #404040'
      }}
    />
  );
};