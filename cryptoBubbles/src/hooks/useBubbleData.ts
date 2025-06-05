// src/hooks/useBubbleData.ts
import { useState, useEffect, useCallback } from 'react';
import { VideoItem, BubbleCard, ViewMode, BubbleState, ContentItem } from '../types';
import { fetchContentItems } from '../utils/airtable';
import { calculateSpiralPositions } from '../utils/spiralLayout';

export const useBubbleData = (canvasSize: { width: number; height: number }) => {
  const [state, setState] = useState<BubbleState>({
    videos: [],
    bubbles: [],
    loading: true,
    error: null,
    selectedCard: null,
    selectedDate: new Date(), // Default to today's date
    viewMode: 'day' as ViewMode,
    canvasSize
  });

  // Convert ContentItem to VideoItem for compatibility
  const contentItemToVideoItem = useCallback((item: ContentItem): VideoItem => {
    return {
      id: item.id,
      title: item.title,
      thumbnail_url: item.thumbnail_url,
      duration_seconds: 0, // Content items don't have duration
      published_at: item.publish_date,
      view_count: item.views_count,
      like_count: Math.floor(item.views_count * 0.03), // Estimate likes as 3% of views
      watch_url: item.watch_url, // Include watch URL for opening videos
      short_summary: item.short_summary,
      influencer: {
        id: item.id,
        display_name: item.influencer_name,
        platform: 'youtube' as const, // Default to youtube for now
      }
    };
  }, []);

  // Define transformVideosToBubbles BEFORE it's used in loadData
  const transformVideosToBubbles = useCallback((videos: VideoItem[]): BubbleCard[] => {
    const positions = calculateSpiralPositions(canvasSize.width, canvasSize.height, videos);
    
    return videos.map((video, index) => ({
      ...video,
      position: positions[index] || { x: 0, y: 0, size: 120, scale: 1 },
      isSelected: false
    }));
  }, [canvasSize]);

  // Manual refresh function (for refresh button only)
  const loadData = useCallback(async (selectedDate?: Date, viewMode?: ViewMode) => {
    console.log('🔄 Manual refresh requested...');
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const contentItems = await fetchContentItems(selectedDate, viewMode);
      const videos = contentItems.map(contentItemToVideoItem);
      const bubbles = transformVideosToBubbles(videos);
      
      setState(prev => ({
        ...prev,
        videos,
        bubbles,
        loading: false
      }));
    } catch (error) {
      console.error('💥 Error in loadData:', error);
      setState(prev => ({
        ...prev,
        error: (error as Error).message || 'Failed to load data',
        loading: false
      }));
    }
  }, [contentItemToVideoItem, transformVideosToBubbles]);

  const selectCard = useCallback((card: BubbleCard | null) => {
    setState(prev => ({
      ...prev,
      bubbles: prev.bubbles.map(bubble => ({
        ...bubble,
        isSelected: card ? bubble.id === card.id : false
      })),
      selectedCard: card
    }));
  }, []);

  const changeDate = useCallback((date: Date) => {
    setState(prev => ({ ...prev, selectedDate: date }));
  }, []);

  const changeViewMode = useCallback((viewMode: ViewMode) => {
    setState(prev => ({ ...prev, viewMode }));
  }, []);

  const refreshData = useCallback(() => {
    loadData(state.selectedDate, state.viewMode);
  }, [loadData, state.selectedDate, state.viewMode]);

  // Update canvas size (no API call)
  useEffect(() => {
    setState(prev => ({ ...prev, canvasSize }));
    
    if (state.videos.length > 0) {
      const newBubbles = transformVideosToBubbles(state.videos);
      setState(prev => ({
        ...prev,
        bubbles: newBubbles.map(bubble => ({
          ...bubble,
          isSelected: prev.selectedCard?.id === bubble.id
        }))
      }));
    }
  }, [canvasSize, transformVideosToBubbles, state.videos]);

  // Single effect to load data when selectedDate or viewMode changes
  useEffect(() => {
    console.log('🚀 API Call - Loading data with date:', state.selectedDate, 'viewMode:', state.viewMode);
    
    const fetchData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const contentItems = await fetchContentItems(state.selectedDate, state.viewMode);
        const videos = contentItems.map(contentItemToVideoItem);
        const bubbles = transformVideosToBubbles(videos);
        
        setState(prev => ({
          ...prev,
          videos,
          bubbles,
          loading: false
        }));
      } catch (error) {
        console.error('💥 Error in loadData:', error);
        setState(prev => ({
          ...prev,
          error: (error as Error).message || 'Failed to load data',
          loading: false
        }));
      }
    };
    
    fetchData();
  }, [state.selectedDate, state.viewMode, contentItemToVideoItem, transformVideosToBubbles]);

  return {
    ...state,
    actions: {
      selectCard,
      changeDate,
      changeViewMode,
      refreshData
    }
  };
};