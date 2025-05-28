import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui';
import { submitVideo } from '@/lib/api';

interface AddVideoModalProps {
  onClose: () => void;
}

export const AddVideoModal: React.FC<AddVideoModalProps> = ({ onClose }) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoUrl) {
      setError('Please enter a YouTube video URL');
      return;
    }
    
    if (!videoUrl.includes('youtube.com/watch?v=') && !videoUrl.includes('youtu.be/')) {
      setError('Please enter a valid YouTube video URL');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await submitVideo(videoUrl);
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to submit video');
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Add YouTube Video</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-1">
              YouTube Video URL
            </label>
            <input
              type="url"
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>
          
          <div className="text-sm text-gray-500 mb-4">
            <p>The video will be processed to extract crypto mentions.</p>
            <p>This may take a few minutes to complete.</p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              type="button"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Submit Video
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
