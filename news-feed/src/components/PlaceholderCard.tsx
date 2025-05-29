import React from 'react';

interface PlaceholderCardProps {
  key?: string | number;
}

const PlaceholderCard: React.FC<PlaceholderCardProps> = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4 animate-pulse">
    <div className="aspect-video bg-gray-200"></div>
    <div className="p-4">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
      <div className="flex items-center space-x-2 mb-3">
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        <div className="h-3 bg-gray-200 rounded w-24"></div>
      </div>
      <div className="h-12 bg-gray-200 rounded"></div>
    </div>
  </div>
);

export default PlaceholderCard;
