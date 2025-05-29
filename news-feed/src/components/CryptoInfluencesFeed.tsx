import React, { useState, useEffect, useCallback } from 'react';
import { Filter, User, Clock } from 'lucide-react';
import VideoCard from './VideoCard';
import PlaceholderCard from './PlaceholderCard';
import { FeedState } from '../types';
import { fetchVideos, fetchInfluencers } from '../services/airtable';

const placeholderCount = 2;

function CryptoInfluencesFeed() {
  const [state, setState] = useState<FeedState>({
    videos: [],
    loading: true,
    loadingMore: false,
    error: null,
    hasMore: true,
    sortBy: 'newest',
    influencerFilter: 'all',
  });
  
  const [influencers, setInfluencers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [nextOffset, setNextOffset] = useState<string | undefined>(undefined);

  useEffect(() => {
    const getInfluencers = async () => {
      try {
        const influencerList = await fetchInfluencers();
        setInfluencers(influencerList);
      } catch (error) {
        console.error('Failed to fetch influencers:', error);
      }
    };
    
    getInfluencers();
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const { videos, nextOffset: offset } = await fetchVideos(
          placeholderCount,
          undefined,
          state.sortBy,
          state.influencerFilter !== 'all' ? state.influencerFilter : undefined
        );
        
        setState(prev => ({
          ...prev,
          videos,
          loading: false,
          hasMore: !!offset,
        }));
        
        setNextOffset(offset);
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load videos. Please try again.',
        }));
      }
    };
    
    fetchInitialData();
  }, [state.sortBy, state.influencerFilter]);

  const loadMore = useCallback(async () => {
    if (state.loadingMore || !state.hasMore || state.loading) return;
    
    setState(prev => ({ ...prev, loadingMore: true }));
    
    try {
      const { videos, nextOffset: offset } = await fetchVideos(
        placeholderCount,
        nextOffset,
        state.sortBy,
        state.influencerFilter !== 'all' ? state.influencerFilter : undefined
      );
      
      setState(prev => ({
        ...prev,
        videos: [...prev.videos, ...videos],
        loadingMore: false,
        hasMore: !!offset,
      }));
      
      setNextOffset(offset);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loadingMore: false,
        error: 'Failed to load more videos. Please try again.',
      }));
    }
  }, [nextOffset, state.loadingMore, state.hasMore, state.loading, state.sortBy, state.influencerFilter]);

  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 400
      ) {
        loadMore();
      }
    };
    
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [loadMore]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'newest' | 'oldest' | 'most_viewed';
    setState(prev => ({ ...prev, sortBy: value, videos: [] }));
    setNextOffset(undefined);
  };

  const handleInfluencerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setState(prev => ({ ...prev, influencerFilter: value, videos: [] }));
    setNextOffset(undefined);
  };

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b sticky top-0 z-10 px-4 py-3">
          <h1 className="text-lg font-bold text-gray-900">Crypto Influences</h1>
          <p className="text-sm text-gray-600">Latest crypto influencer content</p>
        </header>
        <div className="px-4 py-8">
          {Array.from({ length: placeholderCount }).map((_, i) => (
            <PlaceholderCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Crypto Influences</h1>
            <p className="text-sm text-gray-600">Latest crypto influencer content</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
        {showFilters && (
          <div className="mt-3 space-y-3 pt-3 border-t border-gray-100">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Sort by</label>
              <select 
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md"
                value={state.sortBy}
                onChange={handleSortChange}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="most_viewed">Most viewed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Filter by influencer
              </label>
              <select 
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md"
                value={state.influencerFilter}
                onChange={handleInfluencerChange}
              >
                <option value="all">All influencers</option>
                {influencers.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </header>

      <main className="px-4 py-4">
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-center text-red-800">⚠️ {state.error}</p>
          </div>
        )}

        {state.videos.length === 0 && !state.error
          ? Array.from({ length: placeholderCount }).map((_, i) => <PlaceholderCard key={i} />)
          : state.videos.map(video => <VideoCard key={video.id} video={video} />)
        }

        {state.loadingMore && <PlaceholderCard />}

        {!state.loadingMore && state.videos.length > 0 && !state.hasMore && (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">You've reached the end</div>
          </div>
        )}

        {!state.loadingMore && state.videos.length === 0 && !state.loading && !state.error && (
          <div className="text-center py-12 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <div className="text-lg font-medium mb-2">No videos found</div>
            <div className="text-sm">Try adjusting your filters</div>
          </div>
        )}
      </main>
    </div>
  );
}

export default CryptoInfluencesFeed;
