import React, { useState } from 'react';
import { Heart, Eye, MessageCircle, Clock, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import { formatViewCount, formatRelativeTime } from '../../utils/formatting';
import { VideoItem } from '../../types';
import { useTouchGestures } from '../../hooks/useTouchGestures';
import { useMobileDetect } from '../../hooks/useMobileDetect';
import { getOptimalCardSize, getResponsiveFontSize, getMobileFontStack, getOptimalLineHeight } from '../../utils/responsiveSizing';
import { useSafeAreaInsets } from '../../utils/safeArea';
import { useHapticFeedback } from '../../utils/hapticFeedback';
import { useLazyImage } from '../../hooks/useLazyLoading';

interface MobileVideoCardProps {
  video: VideoItem;
  onSelect: (video: VideoItem) => void;
  isSelected: boolean;
  profitability?: {
    isProfitable: boolean;
    percentage: number;
  };
}

export const MobileVideoCard: React.FC<MobileVideoCardProps> = ({
  video,
  onSelect,
  isSelected,
  profitability
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [showFullSummary, setShowFullSummary] = useState(false);
  const { screenSize } = useMobileDetect();
  const { getSafeTouchStyle } = useSafeAreaInsets();
  const haptic = useHapticFeedback();
  
  // Lazy load thumbnail image
  const {
    elementRef: imageRef,
    imageSrc,
    isLoaded: imageLoaded,
    isError: imageError,
    isVisible: imageVisible
  } = useLazyImage(video.thumbnail, {
    rootMargin: '100px', // Start loading when 100px away
    threshold: 0.1
  });
  
  // Get responsive sizing with card-relative scaling
  const cardSize = getOptimalCardSize(window.innerWidth, window.innerHeight);
  const titleFontSize = getResponsiveFontSize(14, window.innerWidth, 'title', cardSize.width);
  const bodyFontSize = getResponsiveFontSize(12, window.innerWidth, 'body', cardSize.width);
  const captionFontSize = getResponsiveFontSize(10, window.innerWidth, 'caption', cardSize.width);
  
  // Get optimal line heights for readability
  const titleLineHeight = getOptimalLineHeight(titleFontSize, 'title');
  const bodyLineHeight = getOptimalLineHeight(bodyFontSize, 'body');
  
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchGestures({
    onTap: () => {
      haptic.selection();
      onSelect(video);
    },
    onLongPress: () => {
      haptic.impact('medium');
      setShowFullSummary(true);
    }
  });

  const handleCardTouch = (e: React.TouchEvent) => {
    handleTouchStart(e);
    setIsPressed(true);
  };

  const handleCardTouchEnd = (e: React.TouchEvent) => {
    handleTouchEnd(e);
    setIsPressed(false);
  };

  return (
    <div
      className={`
        relative bg-gray-900 rounded-lg overflow-hidden
        transition-all duration-200 transform
        ${isSelected ? 'ring-2 ring-primary-500 shadow-lg' : 'shadow-md'}
        ${isPressed ? 'scale-95' : 'scale-100'}
        active:scale-95
      `}
      style={{
        minWidth: cardSize.width,
        minHeight: cardSize.height,
        minTouchTargetSize: `${cardSize.minSize}px`,
        ...getSafeTouchStyle(cardSize.height)
      }}
      onTouchStart={handleCardTouch}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleCardTouchEnd}
    >
      {/* Profitability Indicator */}
      {profitability && (
        <div className={`
          absolute top-2 right-2 z-10
          px-2 py-1 rounded-full text-xs font-medium
          flex items-center gap-1
          ${profitability.isProfitable 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-red-500/20 text-red-400'
          }
        `}>
          {profitability.isProfitable ? (
            <TrendingUp size={12} />
          ) : (
            <TrendingDown size={12} />
          )}
          {profitability.isProfitable ? '+' : ''}{profitability.percentage.toFixed(1)}%
        </div>
      )}

      {/* Thumbnail */}
      <div 
        ref={imageRef}
        className="relative aspect-video bg-gray-800"
      >
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 loading-skeleton rounded-t-lg" />
        )}
        
        {imageSrc && !imageError && (
          <img
            src={imageSrc}
            alt={video.title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100 loading-fade-in' : 'opacity-0'
            }`}
            loading="lazy"
          />
        )}
        
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-gray-500 text-center">
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                <Eye size={20} />
              </div>
              <span className="text-xs">Image unavailable</span>
            </div>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* View Count Overlay */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white/90 text-xs">
          <Eye size={12} />
          {formatViewCount(video.viewCount)}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Title */}
        <h3 
          className="font-medium line-clamp-2 mb-2 text-gray-100"
          style={{ 
            fontSize: `${titleFontSize}px`,
            lineHeight: titleLineHeight,
            fontFamily: getMobileFontStack()
          }}
        >
          {video.title}
        </h3>

        {/* Channel & Time */}
        <div 
          className="flex items-center justify-between text-gray-400 mb-2"
          style={{ 
            fontSize: `${bodyFontSize}px`,
            lineHeight: bodyLineHeight,
            fontFamily: getMobileFontStack()
          }}
        >
          <span className="truncate mr-2">{video.channel_name}</span>
          <span className="flex items-center gap-1">
            <Clock size={captionFontSize} />
            {formatRelativeTime(video.publish_date)}
          </span>
        </div>

        {/* Stats */}
        <div 
          className="flex items-center gap-3 text-gray-500"
          style={{ fontSize: `${captionFontSize}px` }}
        >
          <span className="flex items-center gap-1">
            <Heart size={captionFontSize} />
            {formatViewCount(video.likeCount || 0)}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={captionFontSize} />
            {formatViewCount(video.commentCount || 0)}
          </span>
          <span className="flex items-center gap-1">
            {video.coins_mentioned?.length || 0} coins
          </span>
        </div>

        {/* Summary (expandable) */}
        {video.short_summary && (
          <div className="mt-2">
            <p 
              className={`text-gray-400 ${showFullSummary ? '' : 'line-clamp-2'}`}
              style={{ fontSize: `${captionFontSize}px` }}
            >
              {video.short_summary}
            </p>
            {video.short_summary.length > 100 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  haptic.light();
                  setShowFullSummary(!showFullSummary);
                }}
                className="text-primary-400 hover:text-primary-300 mt-1 haptic-feedback active:haptic-feedback-active"
                style={{ 
                  fontSize: `${captionFontSize}px`,
                  minHeight: `${cardSize.minSize}px`
                }}
              >
                {showFullSummary ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-2">
            {video.coins_mentioned?.slice(0, 3).map((coin, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-gray-800 rounded text-gray-300"
                style={{ fontSize: `${captionFontSize}px` }}
              >
                {coin}
              </span>
            ))}
            {video.coins_mentioned && video.coins_mentioned.length > 3 && (
              <span 
                className="px-2 py-1 bg-gray-800 rounded text-gray-400"
                style={{ fontSize: `${captionFontSize}px` }}
              >
                +{video.coins_mentioned.length - 3}
              </span>
            )}
          </div>
          
          <a
            href={video.watch_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              haptic.impact('light');
            }}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors haptic-feedback active:haptic-feedback-active"
            style={{ 
              minWidth: `${cardSize.minSize}px`,
              minHeight: `${cardSize.minSize}px`
            }}
          >
            <ExternalLink size={bodyFontSize} />
          </a>
        </div>
      </div>
    </div>
  );
};