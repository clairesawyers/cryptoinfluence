import React, { useState } from 'react';
import { CheckCircle, XCircle, Edit3, ExternalLink } from 'lucide-react';
import { MentionCandidate } from '@/types';
import { 
  formatVideoTime, 
  getSentimentColor, 
  getSentimentEmoji, 
  getRecommendationColor 
} from '@/utils/formatters';
import { Button } from '@/components/ui';

interface MentionReviewCardProps {
  mention: MentionCandidate;
  onStatusChange: (mentionId: number, status: string, updatedData?: Partial<MentionCandidate>) => void;
}

export const MentionReviewCard: React.FC<MentionReviewCardProps> = ({
  mention,
  onStatusChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMention, setEditedMention] = useState(mention);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedMention(mention);
  };

  const handleSave = () => {
    onStatusChange(mention.id, 'modified', editedMention);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedMention(mention);
    setIsEditing(false);
  };

  const handleApprove = () => {
    onStatusChange(mention.id, 'approved');
  };

  const handleReject = () => {
    onStatusChange(mention.id, 'rejected');
  };

  const cardClassName = `border rounded-lg p-4 ${
    mention.review_status === 'approved' ? 'border-green-200 bg-green-50' :
    mention.review_status === 'rejected' ? 'border-red-200 bg-red-50' :
    mention.review_status === 'modified' ? 'border-yellow-200 bg-yellow-50' :
    'border-gray-200'
  }`;

  if (isEditing) {
    return (
      <div className={cardClassName}>
        <div className="space-y-4">
          {/* Coin Header - Editable */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-gray-600">
                {editedMention.suggested_symbol[0]}
              </span>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Symbol</label>
                <input
                  type="text"
                  value={editedMention.suggested_symbol}
                  onChange={(e) => setEditedMention((prev: MentionCandidate) => ({ ...prev, suggested_symbol: e.target.value }))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editedMention.suggested_instrument?.name || ''}
                  onChange={(e) => setEditedMention((prev: MentionCandidate) => ({ 
                    ...prev, 
                    suggested_instrument: { ...prev.suggested_instrument!, name: e.target.value }
                  }))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select
                value={editedMention.suggested_instrument?.category || ''}
                onChange={(e) => setEditedMention((prev: MentionCandidate) => ({ 
                  ...prev, 
                  suggested_instrument: { ...prev.suggested_instrument!, category: e.target.value }
                }))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="DeFi">DeFi</option>
                <option value="L1">L1</option>
                <option value="L2">L2</option>
                <option value="Meme">Meme</option>
                <option value="Gaming">Gaming</option>
                <option value="AI">AI</option>
                <option value="Infrastructure">Infrastructure</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">CoinMarketCap URL</label>
              <div className="flex space-x-1">
                <input
                  type="url"
                  value={editedMention.suggested_instrument?.coinmarketcap_url || ''}
                  onChange={(e) => setEditedMention((prev: MentionCandidate) => ({ 
                    ...prev, 
                    suggested_instrument: { ...prev.suggested_instrument!, coinmarketcap_url: e.target.value }
                  }))}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://coinmarketcap.com/currencies/..."
                />
                <a
                  href={editedMention.suggested_instrument?.coinmarketcap_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border flex items-center"
                  title="Test link"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Sentiment & Recommendation - Editable */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Sentiment</label>
              <div className="flex space-x-3">
                {['positive', 'neutral', 'negative'].map(sentiment => (
                  <label key={sentiment} className="flex items-center text-sm">
                    <input
                      type="radio"
                      name={`sentiment-${mention.id}`}
                      value={sentiment}
                      checked={editedMention.sentiment_label === sentiment}
                      onChange={(e) => setEditedMention((prev: MentionCandidate) => ({ ...prev, sentiment_label: e.target.value as 'positive' | 'neutral' | 'negative' }))}
                      className="mr-1"
                    />
                    <span className="capitalize">{sentiment}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Recommendation</label>
              <div className="flex space-x-3">
                {['buy', 'hold', 'sell', 'avoid'].map(rec => (
                  <label key={rec} className="flex items-center text-sm">
                    <input
                      type="radio"
                      name={`recommendation-${mention.id}`}
                      value={rec}
                      checked={editedMention.recommendation_type === rec}
                      onChange={(e) => setEditedMention((prev: MentionCandidate) => ({ ...prev, recommendation_type: e.target.value as 'buy' | 'hold' | 'sell' | 'avoid' }))}
                      className="mr-1"
                    />
                    <span className="capitalize">{rec}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Quote & Context - Editable */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Quote</label>
              <textarea
                value={editedMention.exact_quote}
                onChange={(e) => setEditedMention((prev: MentionCandidate) => ({ ...prev, exact_quote: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Context</label>
              <textarea
                value={editedMention.context_snippet}
                onChange={(e) => setEditedMention((prev: MentionCandidate) => ({ ...prev, context_snippet: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
              />
            </div>
          </div>

          {/* Action Buttons for Edit Mode */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="text-xs text-gray-500">
              At {formatVideoTime(mention.timestamp_in_video || 0)}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClassName}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Coin Header */}
          <div 
            className="flex items-center space-x-3 mb-3 cursor-pointer hover:bg-gray-50 -m-2 p-2 rounded"
            onClick={handleEdit}
          >
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-gray-600">
                {mention.suggested_symbol[0]}
              </span>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 hover:text-blue-600">
                {mention.suggested_symbol} ({mention.suggested_instrument?.name || 'Unknown'})
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">{mention.suggested_instrument?.category}</span>
                {mention.suggested_instrument?.coinmarketcap_url && (
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500">CMC:</span>
                    <a
                      href={mention.suggested_instrument.coinmarketcap_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs ${mention.suggested_instrument?.category === 'DeFi' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
              {mention.suggested_instrument?.category}
            </div>
            <Edit3 className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" />
          </div>

          {/* Sentiment and Timing */}
          <div className="flex items-center space-x-6 mb-3">
            <div className="text-sm">
              <span className="text-gray-600">Sentiment:</span>
              <span className={`ml-1 px-2 py-1 rounded text-xs ${getSentimentColor(mention.sentiment_label)}`}>
                {getSentimentEmoji(mention.sentiment_label)} {mention.sentiment_label}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">⏰ At:</span>
              <span className="ml-1 font-medium">{formatVideoTime(mention.timestamp_in_video || 0)}</span>
            </div>
          </div>

          {/* Quote - Full Width */}
          <div 
            className="bg-gray-50 rounded p-3 mb-3 cursor-pointer hover:bg-gray-100 w-full"
            onClick={handleEdit}
          >
            <div className="text-sm text-gray-600 mb-1">💬 Quote:</div>
            <div className="font-medium text-gray-900">&ldquo;{mention.exact_quote}&rdquo;</div>
          </div>

          {/* Recommendation */}
          {mention.is_recommendation && (
            <div className="text-sm">
              <span className="text-gray-600">🎯 Recommendation:</span>
              <span className={`ml-1 px-2 py-1 rounded text-xs uppercase font-medium ${getRecommendationColor(mention.recommendation_type)}`}>
                {mention.recommendation_type}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={handleApprove}
            className={`p-2 rounded-full transition-colors ${
              mention.review_status === 'approved'
                ? 'bg-green-100 text-green-600'
                : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600'
            }`}
            title="Approve"
          >
            <CheckCircle className="w-5 h-5" />
          </button>
          <button
            onClick={handleReject}
            className={`p-2 rounded-full transition-colors ${
              mention.review_status === 'rejected'
                ? 'bg-red-100 text-red-600'
                : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600'
            }`}
            title="Reject"
          >
            <XCircle className="w-5 h-5" />
          </button>
          <button
            onClick={handleEdit}
            className="p-2 rounded-full bg-gray-100 text-gray-400 hover:bg-blue-100 hover:text-blue-600 transition-colors"
            title="Edit"
          >
            <Edit3 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
