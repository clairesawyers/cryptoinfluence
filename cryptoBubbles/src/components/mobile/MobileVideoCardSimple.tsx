import React, { useState } from 'react';
import { Heart, Eye, Clock, ExternalLink, Play } from 'lucide-react';
import { formatViewCount, formatDuration } from '../../utils/formatting';
import { BubbleCard } from '../../types';
import { useTouchGestures } from '../../hooks/useTouchGestures';
import { useMobileDetect } from '../../hooks/useMobileDetect';
import { getResponsiveValue, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../utils/responsive';

interface MobileVideoCardSimpleProps {
  card: BubbleCard;
  onSelect: (card: BubbleCard) => void;
  isSelected: boolean;
  className?: string;
}

export const MobileVideoCardSimple: React.FC<MobileVideoCardSimpleProps> = ({
  card,
  onSelect,
  isSelected,
  className = ''
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [imageError, setImageError] = useState(false);
  const detection = useMobileDetect();
  
  // Get responsive values
  const spacing = getResponsiveValue(SPACING, detection);
  const borderRadius = getResponsiveValue(BORDER_RADIUS, detection);
  const titleSize = getResponsiveValue(FONT_SIZES.title, detection);
  const subtitleSize = getResponsiveValue(FONT_SIZES.subtitle, detection);
  const captionSize = getResponsiveValue(FONT_SIZES.caption, detection);

  // Touch handling
  const touchGestures = useTouchGestures({
    onTap: () => {
      onSelect(card);
    }
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    touchGestures.handleTouchStart(e);
    setIsPressed(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchGestures.handleTouchEnd(e);
    setIsPressed(false);
  };

  return (
    <div
      className={`
        relative bg-gray-900 border border-gray-700 overflow-hidden
        transition-all duration-200 transform touch-none
        ${isSelected ? 'ring-2 ring-primary-500 shadow-lg' : 'shadow-md'}
        ${isPressed ? 'scale-95' : 'scale-100'}
        ${className}
      `}
      style={{
        borderRadius: `${borderRadius}px`,
        minHeight: detection.isMobile ? '160px' : '200px'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={touchGestures.handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => !detection.isTouch && onSelect(card)}
    >
      <div className="flex h-full">
        {/* Thumbnail Section */}
        <div className="relative w-2/5 bg-gray-800">
          {card.thumbnail_url && !imageError ? (
            <img 
              src={card.thumbnail_url}
              alt={card.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center
                ${card.influencer.platform === 'youtube' ? 'bg-red-600' : 'bg-blue-500'}
              `}>
                <Play size={20} className="text-white" />
              </div>
            </div>
          )}
          
          {/* Duration Badge */}
          {card.influencer.platform === 'youtube' && card.duration_seconds > 0 && (
            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
              {formatDuration(card.duration_seconds)}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-3 flex flex-col">
          {/* Title */}
          <h3 
            className="font-semibold text-gray-100 line-clamp-2 mb-1"
            style={{ fontSize: `${titleSize}px` }}
          >
            {card.title}
          </h3>

          {/* Influencer */}
          <p 
            className="text-primary-400 font-medium mb-2"
            style={{ fontSize: `${subtitleSize}px` }}
          >
            {card.influencer.display_name}
          </p>

          {/* Metrics */}
          <div className="flex items-center gap-3 mt-auto">
            <div className="flex items-center gap-1">
              <Eye size={12} className="text-gray-500" />
              <span 
                className="text-gray-400"
                style={{ fontSize: `${captionSize}px` }}
              >
                {formatViewCount(card.view_count)}
              </span>
            </div>
            
            {card.like_count > 0 && (
              <div className="flex items-center gap-1">
                <Heart size={12} className="text-gray-500" />
                <span 
                  className="text-gray-400"
                  style={{ fontSize: `${captionSize}px` }}
                >
                  {formatViewCount(card.like_count)}
                </span>
              </div>
            )}
          </div>

          {/* Date */}
          <div className="flex items-center gap-1 mt-1">
            <Clock size={10} className="text-gray-500" />
            <span 
              className="text-gray-500"
              style={{ fontSize: `${captionSize - 1}px` }}
            >
              {new Date(card.published_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* External Link Indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2">
            <ExternalLink size={16} className="text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );
};