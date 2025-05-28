import React, { useState } from 'react';
import { Search, Filter, RefreshCw, Plus, ExternalLink } from 'lucide-react';
import { formatTimeAgo, formatNumber } from '@/utils/formatters';
import { Button, LoadingSpinner } from '@/components/ui';
import { useReviewQueue } from '@/hooks/useReviewQueue';
import { AddVideoModal } from './AddVideoModal';

interface ReviewQueueProps {
  onSelectContent: (contentId: number) => void;
}

export const ReviewQueue: React.FC<ReviewQueueProps> = ({ onSelectContent }) => {
  const { data: contentItems, isLoading, error, refetch } = useReviewQueue();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const filteredItems = React.useMemo(() => {
    if (!contentItems) return [];
    
    return contentItems.filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.influencer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.influencer.display_name && 
          item.influencer.display_name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [contentItems, searchTerm, statusFilter]);
  
  const handleRefresh = () => {
    refetch();
  };
  
  const handleAddVideo = () => {
    setIsAddModalOpen(true);
  };
  
  const handleAddModalClose = () => {
    setIsAddModalOpen(false);
    refetch();
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <h3 className="font-semibold mb-2">Error loading review queue</h3>
        <p>{(error as Error).message || 'Failed to load review queue'}</p>
        <Button 
          variant="secondary" 
          className="mt-3"
          onClick={() => refetch()}
        >
          Try Again
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Review Queue</h1>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleAddVideo}
          >
            Add Video
          </Button>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by title or influencer..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>
      
      {/* Content items list */}
      {filteredItems.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No content items found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Add a new video to get started'}
          </p>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleAddVideo}
          >
            Add Video
          </Button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Influencer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Published
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mentions
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr 
                  key={item.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onSelectContent(item.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-16 bg-gray-100 rounded overflow-hidden mr-3 flex-shrink-0">
                        {item.thumbnail_url ? (
                          <img 
                            src={item.thumbnail_url} 
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {item.title}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <a
                            href={item.content_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span>YouTube</span>
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-100 mr-2 overflow-hidden">
                        {item.influencer.avatar_url ? (
                          <img 
                            src={item.influencer.avatar_url} 
                            alt={item.influencer.display_name || item.influencer.username}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-600 text-xs font-bold">
                            {(item.influencer.display_name || item.influencer.username)[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.influencer.display_name || item.influencer.username}
                        </div>
                        <div className="text-xs text-gray-500">
                          @{item.influencer.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTimeAgo(item.published_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>👁️ {formatNumber(item.view_count)} views</div>
                      <div>👍 {formatNumber(item.like_count)} likes</div>
                      <div>💬 {formatNumber(item.comment_count)} comments</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      item.status === 'published' ? 'bg-green-100 text-green-800' :
                      item.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.mention_candidates.length} mentions
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectContent(item.id);
                      }}
                    >
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Add Video Modal */}
      {isAddModalOpen && (
        <AddVideoModal onClose={handleAddModalClose} />
      )}
    </div>
  );
};
