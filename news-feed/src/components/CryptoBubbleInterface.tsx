import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BubbleState, VideoItem, BubblePosition, CardSize } from '../types';
import { fetchVideos } from '../services/airtable';
import BubbleHeader from './BubbleHeader';
import BubbleControls from './BubbleControls';
import { BubbleCard } from './BubbleCard';
import { 
  calculateSpiralPositions, 
  calculateCardSize, 
  filterVideosByDate,
  getCardAtPoint
} from '../utils/bubbleUtils';

const CryptoBubbleInterface: React.FC = () => {
  const [state, setState] = useState<BubbleState>({
    videos: [],
    loading: true,
    error: null,
    selectedCard: null,
    selectedDate: new Date(),
    viewMode: 'day',
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const positionsRef = useRef<BubblePosition[]>([]);
  const cardSizesRef = useRef<CardSize[]>([]);
  const filteredVideosRef = useRef<VideoItem[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const { videos } = await fetchVideos(50); // Fetch up to 50 videos
        setState(prev => ({
          ...prev,
          videos,
          loading: false,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load videos. Please try again.',
        }));
      }
    };
    
    fetchData();
  }, []);
  
  useEffect(() => {
    if (state.videos.length > 0) {
      const filtered = filterVideosByDate(
        state.videos,
        state.selectedDate,
        state.viewMode
      );
      
      filteredVideosRef.current = filtered;
      
      filteredVideosRef.current.sort((a, b) => b.view_count - a.view_count);
      
      if (state.selectedCard) {
        const stillExists = filtered.some(v => v.id === state.selectedCard?.id);
        if (!stillExists) {
          setState(prev => ({ ...prev, selectedCard: null }));
        }
      }
      
      updateCanvasLayout();
    }
  }, [state.videos, state.selectedDate, state.viewMode]);
  
  useEffect(() => {
    const handleResize = () => {
      updateCanvasLayout();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const updateCanvasLayout = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;
    
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    const { width, height } = container.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
    
    const videos = filteredVideosRef.current;
    if (videos.length > 0) {
      const maxViews = Math.max(...videos.map(v => v.view_count));
      
      cardSizesRef.current = videos.map(video => 
        calculateCardSize(video.view_count, maxViews)
      );
      
      positionsRef.current = calculateSpiralPositions(width, height, videos);
    }
    
    renderCanvas();
  }, []);
  
  const renderCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
    
    const videos = filteredVideosRef.current;
    const positions = positionsRef.current;
    const sizes = cardSizesRef.current;
    
    videos.forEach((video, index) => {
      if (index < positions.length && index < sizes.length) {
        const isSelected = state.selectedCard?.id === video.id;
        const card = new BubbleCard(
          ctx,
          video,
          positions[index].x,
          positions[index].y,
          sizes[index],
          isSelected
        );
        card.draw();
      }
    });
    
    animationRef.current = requestAnimationFrame(renderCanvas);
  }, [state.selectedCard]);
  
  useEffect(() => {
    renderCanvas();
    return () => cancelAnimationFrame(animationRef.current);
  }, [renderCanvas]);
  
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const videos = filteredVideosRef.current;
    const positions = positionsRef.current;
    const sizes = cardSizesRef.current;
    
    const cardIndex = getCardAtPoint(x, y, positions, sizes);
    
    if (cardIndex >= 0 && cardIndex < videos.length) {
      setState(prev => ({ 
        ...prev, 
        selectedCard: videos[cardIndex]
      }));
    } else {
      setState(prev => ({ ...prev, selectedCard: null }));
    }
  }, []);
  
  const handleDateChange = useCallback((date: Date) => {
    setState(prev => ({ ...prev, selectedDate: date }));
  }, []);
  
  const handleViewModeChange = useCallback((mode: 'day' | 'week' | 'month') => {
    setState(prev => ({ ...prev, viewMode: mode }));
  }, []);
  
  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <BubbleHeader />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-pulse text-primary-400 text-4xl mb-4">●</div>
            <p className="text-gray-400">Loading crypto influences...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <BubbleHeader />
      
      <BubbleControls
        selectedDate={state.selectedDate}
        viewMode={state.viewMode}
        onDateChange={handleDateChange}
        onViewModeChange={handleViewModeChange}
      />
      
      {state.error && (
        <div className="bg-loss-900 border border-loss-800 m-4 p-4 rounded-lg">
          <p className="text-center text-loss-200">⚠️ {state.error}</p>
        </div>
      )}
      
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="absolute inset-0"
        />
        
        {filteredVideosRef.current.length === 0 && !state.loading && !state.error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-6">
              <div className="text-gray-500 text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-heading font-medium text-gray-300 mb-2">
                No videos found
              </h3>
              <p className="text-gray-500">
                Try selecting a different date or view mode
              </p>
            </div>
          </div>
        )}
        
        {state.selectedCard && (
          <div className="absolute bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4 shadow-xl">
            <div className="flex items-start space-x-4">
              <div className="w-32 h-20 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                {state.selectedCard.thumbnail_url ? (
                  <img 
                    src={state.selectedCard.thumbnail_url} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <span className="text-2xl text-gray-600">▶</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-medium text-white mb-1">
                  {state.selectedCard.title}
                </h3>
                
                <div className="flex items-center text-sm text-gray-400 mb-2">
                  <span className="mr-3">{state.selectedCard.influencer.display_name}</span>
                  <span className="mr-3">
                    {new Date(state.selectedCard.publish_date || state.selectedCard.published_at).toLocaleDateString('en-NZ')}
                  </span>
                  <span>{state.selectedCard.view_count.toLocaleString()} views</span>
                </div>
                
                <div className="flex space-x-2">
                  <button className="btn btn-primary">
                    Watch Video
                  </button>
                  <button className="btn btn-success">
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoBubbleInterface;
