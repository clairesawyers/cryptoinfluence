import React from 'react';
import { Eye } from 'lucide-react';
import { VideoItem } from '../types';

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString();
};

interface VideoCardProps {
  video: VideoItem;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
    <div className="relative">
      {video?.thumbnail_url ? (
        <div className="w-full h-0 pb-[25%] overflow-hidden">
          <img src={video.thumbnail_url} alt="" className="w-full object-cover" />
        </div>
      ) : (
        <div className="w-full h-0 pb-[25%] bg-gray-900 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-4xl mb-2 opacity-75">▶</div>
            <div className="text-sm opacity-60">Video</div>
          </div>
        </div>
      )}
      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
        {formatDuration(video.duration_seconds)}
      </div>
    </div>
    <div className="p-4">
      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
        {video?.title || '—'}
      </h3>
      <div className="flex items-center space-x-2 mb-3">
        {video?.influencer?.profile_image_url ? (
          <img 
            src={video.influencer.profile_image_url} 
            alt="" 
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {video?.influencer?.display_name?.[0]?.toUpperCase() || ''}
            </span>
          </div>
        )}
        <div>
          <div className="text-sm font-medium text-gray-900">
            {video?.influencer?.display_name || 'Unknown'}
          </div>
          <div className="text-xs text-gray-500">
            {formatDate(video.publish_date || video.published_at)}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <div className="flex items-center space-x-1">
          <Eye className="w-3 h-3" />
          <span>{video?.view_count ? formatNumber(video.view_count) : '—'} views</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>❤️ {video?.like_count ? formatNumber(video.like_count) : '—'}</span>
        </div>
      </div>
    </div>
  </div>
);

export default VideoCard;
