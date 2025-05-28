import React, { useState } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { ContentItem, MentionCandidate } from '@/types';
import { formatTimeAgo, formatNumber } from '@/utils/formatters';
import { Button, LoadingSpinner } from '@/components/ui';
import { MentionReviewCard } from './MentionReviewCard';
import { updateMention, publishContent } from '@/lib/api';
import { useContentReview } from '@/hooks/useReviewQueue';

interface ContentReviewProps {
  contentId: number;
  onBack: () => void;
}

export const ContentReview: React.FC<ContentReviewProps> = ({ contentId, onBack }) => {
  const { data: content, isLoading, error, refetch } = useContentReview(contentId);
  const [isPublishing, setIsPublishing] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  
  const getStats = (content?: ContentItem) => {
    if (!content) return { pending: 0, approved: 0, rejected: 0, modified: 0 };
    
    return content.mention_candidates.reduce((acc: Record<string, number>, mention: MentionCandidate) => {
      acc[mention.review_status]++;
      return acc;
    }, {
      pending: 0,
      approved: 0,
      rejected: 0,
      modified: 0
    });
  };
  
  const stats = getStats(content);
  
  const handleStatusChange = async (mentionId: number, status: string, updatedData?: Partial<MentionCandidate>) => {
    if (!content) return;
    
    try {
      await updateMention(content.id, mentionId, {
        review_status: status as 'pending' | 'approved' | 'rejected' | 'modified',
        ...updatedData
      });
      
      refetch();
    } catch (error) {
      console.error('Failed to update mention status:', error);
    }
  };
  
  const handlePublish = async () => {
    if (!content) return;
    
    setIsPublishing(true);
    try {
      await publishContent(content.id);
      onBack();
    } catch (error) {
      console.error('Failed to publish content:', error);
    } finally {
      setIsPublishing(false);
    }
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
        <h3 className="font-semibold mb-2">Error loading content</h3>
        <p>{(error as Error).message || 'Failed to load content for review'}</p>
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
  
  if (!content) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
        <h3 className="font-semibold mb-2">Content not found</h3>
        <p>The requested content could not be found.</p>
        <Button 
          variant="secondary" 
          className="mt-3"
          onClick={onBack}
        >
          Back to Review Queue
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Back to Queue</span>
        </button>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            Status: 
            <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${
              content.status === 'published' ? 'bg-green-100 text-green-700' :
              content.status === 'processing' ? 'bg-blue-100 text-blue-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {content.status.toUpperCase()}
            </span>
          </span>
          
          <Button
            variant="primary"
            size="sm"
            loading={isPublishing}
            disabled={isPublishing || content.status === 'published' || stats.pending > 0}
            onClick={handlePublish}
          >
            Publish Review
          </Button>
        </div>
      </div>
      
      {/* Content info card */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-start">
          {/* Thumbnail */}
          <div className="w-48 h-27 bg-gray-100 rounded overflow-hidden mr-4 flex-shrink-0">
            {content.thumbnail_url ? (
              <img 
                src={content.thumbnail_url} 
                alt={content.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Thumbnail
              </div>
            )}
          </div>
          
          {/* Content details */}
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{content.title}</h2>
            
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full overflow-hidden mr-2">
                {content.influencer.avatar_url ? (
                  <img 
                    src={content.influencer.avatar_url} 
                    alt={content.influencer.display_name || content.influencer.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold">
                    {(content.influencer.display_name || content.influencer.username)[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {content.influencer.display_name || content.influencer.username}
                </div>
                <div className="text-sm text-gray-500">@{content.influencer.username}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-3">
              <div className="text-sm">
                <div className="text-gray-500">Published</div>
                <div className="font-medium">{formatTimeAgo(content.published_at)}</div>
              </div>
              <div className="text-sm">
                <div className="text-gray-500">Views</div>
                <div className="font-medium">{formatNumber(content.view_count)}</div>
              </div>
              <div className="text-sm">
                <div className="text-gray-500">Likes</div>
                <div className="font-medium">{formatNumber(content.like_count)}</div>
              </div>
              <div className="text-sm">
                <div className="text-gray-500">Comments</div>
                <div className="font-medium">{formatNumber(content.comment_count)}</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <a
                href={content.content_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <span>Watch on YouTube</span>
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Review stats */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3">Review Progress</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-500">Approved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-500">Rejected</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.modified}</div>
            <div className="text-sm text-gray-500">Modified</div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-blue-500"
            style={{ 
              width: `${content.mention_candidates.length > 0 
                ? ((stats.approved + stats.rejected + stats.modified) / content.mention_candidates.length) * 100 
                : 0}%` 
            }}
          ></div>
        </div>
      </div>
      
      {/* Review notes */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3">Review Notes</h3>
        <textarea
          value={reviewNotes}
          onChange={(e) => setReviewNotes(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="Add any notes about this review..."
        />
      </div>
      
      {/* Mentions list */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">
          Mentions ({content.mention_candidates.length})
        </h3>
        
        {content.mention_candidates.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-500">
            No mentions found in this content
          </div>
        ) : (
          content.mention_candidates.map((mention) => (
            <MentionReviewCard
              key={mention.id}
              mention={mention}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
};
