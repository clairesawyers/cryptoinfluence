import React from 'react';
import { Play, ExternalLink } from 'lucide-react';
import { formatViewCount, formatRelativeTime } from '../utils/formatting';

interface VideoReleaseCardProps {
  id: string;
  thumbnailUrl: string;
  title: string;
  influencerName: string;
  watchUrl: string;
  viewsCount: number;
  publishDate: string;
  onCardClick?: () => void;
}

const VideoReleaseCard: React.FC<VideoReleaseCardProps> = ({
  thumbnailUrl,
  title,
  influencerName,
  watchUrl,
  viewsCount,
  publishDate,
  onCardClick
}) => {
  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick();
    } else {
      // Fallback to opening URL directly if no onCardClick provided
      window.open(watchUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      className="card-videorelease"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-label={`Watch ${title} by ${influencerName}`}
    >
      {/* External link indicator */}
      <div className="card-videorelease-link-indicator">
        <ExternalLink size={12} />
      </div>

      {/* Thumbnail with play overlay */}
      <div className="card-videorelease-thumbnail">
        <img 
          src={thumbnailUrl} 
          alt={`${title} thumbnail`}
          loading="lazy"
          onError={(e) => {
            // Fallback for broken images
            e.currentTarget.src = '/placeholder-thumbnail.jpg';
          }}
        />
        <div className="card-videorelease-play-overlay">
          <Play size={20} fill="currentColor" />
        </div>
      </div>

      {/* Content */}
      <div className="card-videorelease-content">
        <h3 className="card-videorelease-title">
          {title}
        </h3>
        
        <div className="card-videorelease-influencer">
          {influencerName}
        </div>
        
        <div className="card-videorelease-metadata">
          <span className="card-videorelease-views">
            {formatViewCount(viewsCount)} views
          </span>
          <span className="card-videorelease-date">
            {formatRelativeTime(publishDate)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoReleaseCard;