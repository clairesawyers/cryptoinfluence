import React, { useState, useEffect } from 'react';
import VideoReleaseCard from './VideoReleaseCard';
import { fetchContentItems } from '../utils/airtable';
import type { ContentItem } from '../types';

const VideoReleaseGrid: React.FC = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContentItems = async () => {
      try {
        const items = await fetchContentItems();
        setContentItems(items);
      } catch (error) {
        console.error('Failed to load content items:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContentItems();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading video releases...</div>
      </div>
    );
  }

  if (contentItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">No video releases available</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {contentItems.map(item => (
        <VideoReleaseCard
          key={item.id}
          id={item.id}
          thumbnailUrl={item.thumbnail_url}
          title={item.title}
          influencerName={item.influencer_name}
          watchUrl={item.watch_url}
          viewsCount={item.views_count}
          publishDate={item.publish_date}
        />
      ))}
    </div>
  );
};

export default VideoReleaseGrid;