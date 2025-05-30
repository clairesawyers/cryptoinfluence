# CryptoBubble Interface Code Documentation

This document provides detailed documentation for the code implementation of the CryptoBubble interface.

## Component Structure

### CryptoBubbleInterface

The main component that manages the canvas rendering and state for the bubble visualization.

```typescript
// src/components/CryptoBubbleInterface.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { fetchVideos } from '../services/airtable';
import { BubbleCard } from './BubbleCard';
import { BubbleHeader } from './BubbleHeader';
import { BubbleControls } from './BubbleControls';
import { calculateSpiralPositions, filterByDate, calculateCardSize } from '../utils/bubbleUtils';
import { useMobile } from '../hooks/use-mobile';
import { VideoData, ViewMode } from '../types';

export const CryptoBubbleInterface: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCard, setSelectedCard] = useState<VideoData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const isMobile = useMobile();
  
  // Fetch videos from Airtable
  useEffect(() => {
    const loadVideos = async () => {
      setLoading(true);
      try {
        const data = await fetchVideos();
        setVideos(data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadVideos();
  }, []);
  
  // Filter videos by date based on view mode
  const filteredVideos = filterByDate(videos, currentDate, viewMode);
  
  // Handle canvas rendering
  useEffect(() => {
    if (!canvasRef.current || loading) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 120; // Adjust for header and controls
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate positions using spiral algorithm
    const positions = calculateSpiralPositions(
      filteredVideos.length,
      canvas.width / 2,
      canvas.height / 2,
      isMobile ? 10 : 20
    );
    
    // Render each bubble card
    filteredVideos.forEach((video, index) => {
      const size = calculateCardSize(video.viewCount);
      const x = positions[index].x;
      const y = positions[index].y;
      
      const bubbleCard = new BubbleCard(ctx, {
        x,
        y,
        size,
        video,
        isSelected: selectedCard?.id === video.id
      });
      
      bubbleCard.render();
    });
  }, [filteredVideos, loading, selectedCard, isMobile]);
  
  // Handle canvas click events
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Calculate positions
    const positions = calculateSpiralPositions(
      filteredVideos.length,
      canvas.width / 2,
      canvas.height / 2,
      isMobile ? 10 : 20
    );
    
    // Check if click is within any bubble
    for (let i = 0; i < filteredVideos.length; i++) {
      const video = filteredVideos[i];
      const size = calculateCardSize(video.viewCount);
      const bubbleX = positions[i].x;
      const bubbleY = positions[i].y;
      
      // Check if click is within this bubble
      const distance = Math.sqrt(
        Math.pow(x - bubbleX, 2) + Math.pow(y - bubbleY, 2)
      );
      
      if (distance <= size / 2) {
        setSelectedCard(video);
        return;
      }
    }
    
    // If click is not on any bubble, deselect
    setSelectedCard(null);
  }, [filteredVideos, isMobile]);
  
  return (
    <div className="crypto-bubble-interface">
      <BubbleHeader />
      <BubbleControls
        viewMode={viewMode}
        setViewMode={setViewMode}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
      />
      
      {loading ? (
        <div className="loading-state">Loading cryptocurrency content...</div>
      ) : (
        <>
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="crypto-bubble-canvas"
          />
          
          {selectedCard && (
            <div className="selected-card-details">
              <h3>{selectedCard.title}</h3>
              <p>Views: {selectedCard.viewCount.toLocaleString()}</p>
              <p>Creator: {selectedCard.creator}</p>
              <p>Published: {new Date(selectedCard.publishedAt).toLocaleDateString()}</p>
              <button onClick={() => window.open(selectedCard.url, '_blank')}>
                Watch Video
              </button>
            </div>
          )}
          
          {filteredVideos.length === 0 && (
            <div className="empty-state">
              No cryptocurrency content found for this time period.
            </div>
          )}
        </>
      )}
    </div>
  );
};
```

### BubbleCard

A utility class for rendering individual video cards on the canvas.

```typescript
// src/components/BubbleCard.ts
import { VideoData } from '../types';

interface BubbleCardProps {
  x: number;
  y: number;
  size: number;
  video: VideoData;
  isSelected: boolean;
}

export class BubbleCard {
  private ctx: CanvasRenderingContext2D;
  private x: number;
  private y: number;
  private size: number;
  private video: VideoData;
  private isSelected: boolean;
  
  constructor(ctx: CanvasRenderingContext2D, props: BubbleCardProps) {
    this.ctx = ctx;
    this.x = props.x;
    this.y = props.y;
    this.size = props.size;
    this.video = props.video;
    this.isSelected = props.isSelected;
  }
  
  render() {
    // Save context state
    this.ctx.save();
    
    // Draw bubble background
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
    
    // Create gradient background
    const gradient = this.ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.size / 2
    );
    
    // Set gradient colours based on platform
    switch (this.video.platform) {
      case 'youtube':
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(180, 0, 0, 0.6)');
        break;
      case 'twitter':
        gradient.addColorStop(0, 'rgba(29, 161, 242, 0.8)');
        gradient.addColorStop(1, 'rgba(29, 161, 242, 0.6)');
        break;
      case 'tiktok':
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(254, 44, 85, 0.6)');
        break;
      default:
        gradient.addColorStop(0, 'rgba(128, 90, 213, 0.8)');
        gradient.addColorStop(1, 'rgba(128, 90, 213, 0.6)');
    }
    
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
    
    // Add 3D shadow effect
    if (this.isSelected) {
      this.ctx.shadowColor = 'rgba(128, 90, 213, 0.8)';
      this.ctx.shadowBlur = 20;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 0;
      
      // Draw selection ring
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
    } else {
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      this.ctx.shadowBlur = 10;
      this.ctx.shadowOffsetX = 5;
      this.ctx.shadowOffsetY = 5;
    }
    
    // Draw platform icon
    this.drawPlatformIcon();
    
    // Draw title text
    this.drawTitle();
    
    // Draw view count
    this.drawViewCount();
    
    // Restore context state
    this.ctx.restore();
  }
  
  private drawPlatformIcon() {
    // Position for the icon
    const iconX = this.x - this.size / 4;
    const iconY = this.y - this.size / 4;
    const iconSize = this.size / 5;
    
    this.ctx.fillStyle = '#ffffff';
    
    // Draw platform-specific icon
    switch (this.video.platform) {
      case 'youtube':
        // YouTube play button
        this.ctx.beginPath();
        this.ctx.moveTo(iconX, iconY);
        this.ctx.lineTo(iconX, iconY + iconSize);
        this.ctx.lineTo(iconX + iconSize, iconY + iconSize / 2);
        this.ctx.closePath();
        this.ctx.fill();
        break;
      case 'twitter':
        // Twitter bird (simplified)
        this.ctx.beginPath();
        this.ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
        this.ctx.fill();
        break;
      case 'tiktok':
        // TikTok logo (simplified)
        this.ctx.fillRect(iconX, iconY, iconSize, iconSize);
        break;
      default:
        // Generic icon
        this.ctx.beginPath();
        this.ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
        this.ctx.fill();
    }
  }
  
  private drawTitle() {
    const titleX = this.x;
    const titleY = this.y;
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = `${this.size / 10}px 'Space Grotesk', sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // Truncate title if too long
    let title = this.video.title;
    if (title.length > 20) {
      title = title.substring(0, 17) + '...';
    }
    
    this.ctx.fillText(title, titleX, titleY);
  }
  
  private drawViewCount() {
    const viewX = this.x;
    const viewY = this.y + this.size / 5;
    
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.font = `${this.size / 12}px 'Inter', sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // Format view count
    const formattedViews = this.formatViewCount(this.video.viewCount);
    
    this.ctx.fillText(formattedViews, viewX, viewY);
  }
  
  private formatViewCount(views: number): string {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    } else {
      return `${views} views`;
    }
  }
}
```

### BubbleControls

Component for date navigation and view mode selection.

```typescript
// src/components/BubbleControls.tsx
import React from 'react';
import { ViewMode } from '../types';

interface BubbleControlsProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
}

export const BubbleControls: React.FC<BubbleControlsProps> = ({
  viewMode,
  setViewMode,
  currentDate,
  setCurrentDate
}) => {
  // Navigate to previous time period
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
    }
    
    setCurrentDate(newDate);
  };
  
  // Navigate to next time period
  const handleNext = () => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
    }
    
    setCurrentDate(newDate);
  };
  
  // Format date display based on view mode
  const formatDateDisplay = (): string => {
    const options: Intl.DateTimeFormatOptions = {};
    
    switch (viewMode) {
      case 'day':
        options.day = 'numeric';
        options.month = 'short';
        options.year = 'numeric';
        break;
      case 'week':
        // For week view, show range (e.g., "May 1 - May 7, 2025")
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        return `${startOfWeek.toLocaleDateString('en-NZ', {
          day: 'numeric',
          month: 'short'
        })} - ${endOfWeek.toLocaleDateString('en-NZ', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })}`;
      case 'month':
        options.month = 'long';
        options.year = 'numeric';
        break;
    }
    
    return currentDate.toLocaleDateString('en-NZ', options);
  };
  
  return (
    <div className="bubble-controls">
      <div className="view-mode-selector">
        <button
          className={viewMode === 'day' ? 'active' : ''}
          onClick={() => setViewMode('day')}
        >
          Day
        </button>
        <button
          className={viewMode === 'week' ? 'active' : ''}
          onClick={() => setViewMode('week')}
        >
          Week
        </button>
        <button
          className={viewMode === 'month' ? 'active' : ''}
          onClick={() => setViewMode('month')}
        >
          Month
        </button>
      </div>
      
      <div className="date-navigation">
        <button onClick={handlePrevious}>
          &lt; Previous
        </button>
        <span className="date-display">{formatDateDisplay()}</span>
        <button onClick={handleNext}>
          Next &gt;
        </button>
      </div>
    </div>
  );
};
```

### BubbleHeader

Navigation header component with links and branding.

```typescript
// src/components/BubbleHeader.tsx
import React from 'react';

export const BubbleHeader: React.FC = () => {
  return (
    <header className="bubble-header">
      <div className="logo">
        <h1>CryptoBubble</h1>
      </div>
      
      <nav className="navigation">
        <ul>
          <li><a href="#" className="active">Feed</a></li>
          <li><a href="#">Influencers</a></li>
          <li><a href="#">Coins</a></li>
          <li><a href="#">Analytics</a></li>
        </ul>
      </nav>
      
      <div className="user-controls">
        <button className="theme-toggle">
          <span className="sr-only">Toggle theme</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        </button>
        <button className="profile-button">
          <span className="sr-only">Profile</span>
          <div className="avatar">
            <span>JS</span>
          </div>
        </button>
      </div>
    </header>
  );
};
```

## Utility Functions

### bubbleUtils.ts

Utility functions for bubble positioning, sizing, and date filtering.

```typescript
// src/utils/bubbleUtils.ts
import { VideoData, ViewMode } from '../types';

interface Position {
  x: number;
  y: number;
}

/**
 * Calculate positions for video cards in a spiral pattern
 */
export function calculateSpiralPositions(
  count: number,
  centerX: number,
  centerY: number,
  spacing: number = 20
): Position[] {
  const positions: Position[] = [];
  
  // Golden angle (in radians)
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  
  for (let i = 0; i < count; i++) {
    // Distance from center increases with each item
    const distance = spacing * Math.sqrt(i);
    
    // Angle changes by golden angle with each item
    const angle = goldenAngle * i;
    
    // Calculate x and y coordinates
    const x = centerX + distance * Math.cos(angle);
    const y = centerY + distance * Math.sin(angle);
    
    positions.push({ x, y });
  }
  
  return positions;
}

/**
 * Calculate card size based on view count
 */
export function calculateCardSize(viewCount: number): number {
  // Base size
  const baseSize = 60;
  
  // Size multiplier based on view count
  let multiplier = 1;
  
  if (viewCount >= 1000000) {
    // 1M+ views
    multiplier = 3;
  } else if (viewCount >= 500000) {
    // 500K+ views
    multiplier = 2.5;
  } else if (viewCount >= 100000) {
    // 100K+ views
    multiplier = 2;
  } else if (viewCount >= 50000) {
    // 50K+ views
    multiplier = 1.75;
  } else if (viewCount >= 10000) {
    // 10K+ views
    multiplier = 1.5;
  } else if (viewCount >= 5000) {
    // 5K+ views
    multiplier = 1.25;
  }
  
  return baseSize * multiplier;
}

/**
 * Filter videos by date based on view mode
 */
export function filterByDate(
  videos: VideoData[],
  currentDate: Date,
  viewMode: ViewMode
): VideoData[] {
  // Create date bounds based on view mode
  const startDate = new Date(currentDate);
  const endDate = new Date(currentDate);
  
  switch (viewMode) {
    case 'day':
      // Set to start of day
      startDate.setHours(0, 0, 0, 0);
      // Set to end of day
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'week':
      // Set to start of week (Sunday)
      const dayOfWeek = currentDate.getDay();
      startDate.setDate(currentDate.getDate() - dayOfWeek);
      startDate.setHours(0, 0, 0, 0);
      
      // Set to end of week (Saturday)
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'month':
      // Set to start of month
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      
      // Set to end of month
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);
      break;
  }
  
  // Filter videos by date
  return videos.filter(video => {
    const publishDate = new Date(video.publishedAt);
    return publishDate >= startDate && publishDate <= endDate;
  });
}
```

## Custom Hooks

### use-mobile.ts

Custom hook for detecting mobile devices.

```typescript
// src/hooks/use-mobile.ts
import { useState, useEffect } from 'react';

export function useMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  return isMobile;
}
```

### use-toast.ts

Custom hook for displaying toast notifications.

```typescript
// src/hooks/use-toast.ts
import { useState } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Add a new toast
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto-remove toast after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3000);
    
    return id;
  };
  
  // Remove a toast by ID
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  // Convenience methods
  const success = (message: string) => addToast(message, 'success');
  const error = (message: string) => addToast(message, 'error');
  const info = (message: string) => addToast(message, 'info');
  
  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info
  };
}
```

## Type Definitions

```typescript
// src/types/index.ts
export interface VideoData {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  creator: string;
  platform: 'youtube' | 'twitter' | 'tiktok' | 'telegram';
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  mentions: CryptoMention[];
}

export interface CryptoMention {
  id: string;
  symbol: string;
  name: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

export type ViewMode = 'day' | 'week' | 'month';
```

## Design System Implementation

```css
/* src/styles/design-system.css */
:root {
  /* CryptoVibes Design System Colours */
  --color-primary-50: #f5f3ff;
  --color-primary-100: #ede9fe;
  --color-primary-200: #ddd6fe;
  --color-primary-300: #c4b5fd;
  --color-primary-400: #a78bfa;
  --color-primary-500: #8b5cf6;
  --color-primary-600: #7c3aed;
  --color-primary-700: #6d28d9;
  --color-primary-800: #5b21b6;
  --color-primary-900: #4c1d95;
  
  /* Background Gradients */
  --gradient-bg: linear-gradient(135deg, #2d1b69 0%, #1a103e 100%);
  --gradient-card: linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%);
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  --shadow-3d: 5px 5px 0px rgba(0, 0, 0, 0.5);
  
  /* Typography */
  --font-heading: 'Silkscreen', monospace;
  --font-body: 'Space Grotesk', sans-serif;
  --font-mono: 'Inter', monospace;
  
  /* Spacing */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-12: 3rem;
  --spacing-16: 4rem;
  
  /* Border Radius */
  --radius-sm: 0.125rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-full: 9999px;
}

/* Dark Mode (Default) */
.crypto-bubble-interface {
  background: var(--gradient-bg);
  color: white;
  min-height: 100vh;
  font-family: var(--font-body);
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: 700;
}

/* Buttons */
.bubble-controls button {
  background-color: var(--color-primary-700);
  color: white;
  border: none;
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  font-family: var(--font-heading);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-3d);
}

.bubble-controls button:hover {
  background-color: var(--color-primary-600);
  transform: translateY(-2px);
}

.bubble-controls button:active {
  transform: translateY(0);
  box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.5);
}

.bubble-controls button.active {
  background-color: var(--color-primary-500);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Header */
.bubble-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-4);
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.bubble-header .logo h1 {
  font-size: 1.5rem;
  margin: 0;
  background: linear-gradient(to right, #a78bfa, #c4b5fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.bubble-header .navigation ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.bubble-header .navigation li {
  margin-right: var(--spacing-4);
}

.bubble-header .navigation a {
  color: white;
  text-decoration: none;
  font-family: var(--font-heading);
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.bubble-header .navigation a:hover {
  color: var(--color-primary-300);
}

.bubble-header .navigation a.active {
  color: var(--color-primary-400);
  border-bottom: 2px solid var(--color-primary-400);
}

/* Controls */
.bubble-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-4);
  background-color: rgba(0, 0, 0, 0.1);
}

.date-navigation {
  display: flex;
  align-items: center;
}

.date-navigation .date-display {
  margin: 0 var(--spacing-4);
  font-family: var(--font-mono);
  font-size: 0.875rem;
}

/* Canvas */
.crypto-bubble-canvas {
  display: block;
  margin: 0 auto;
  cursor: pointer;
}

/* Selected Card Details */
.selected-card-details {
  position: fixed;
  bottom: var(--spacing-4);
  right: var(--spacing-4);
  background: var(--gradient-card);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  max-width: 300px;
  z-index: 10;
}

.selected-card-details h3 {
  margin-top: 0;
  font-size: 1.25rem;
}

.selected-card-details button {
  background-color: white;
  color: var(--color-primary-700);
  border: none;
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  font-family: var(--font-heading);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: var(--spacing-4);
  width: 100%;
}

.selected-card-details button:hover {
  background-color: var(--color-primary-50);
}

/* Loading State */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  font-family: var(--font-mono);
  font-size: 1.25rem;
  color: var(--color-primary-300);
}

/* Empty State */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  font-family: var(--font-mono);
  font-size: 1.25rem;
  color: var(--color-primary-300);
}

/* Responsive Design */
@media (max-width: 768px) {
  .bubble-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .bubble-header .navigation {
    margin-top: var(--spacing-4);
    width: 100%;
    overflow-x: auto;
  }
  
  .bubble-controls {
    flex-direction: column;
  }
  
  .view-mode-selector {
    margin-bottom: var(--spacing-4);
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
  
  .date-navigation {
    width: 100%;
    justify-content: space-between;
  }
  
  .selected-card-details {
    left: var(--spacing-4);
    right: var(--spacing-4);
    max-width: none;
  }
}
```

## Main Application Entry Point

```typescript
// src/app/App.tsx
import React from 'react';
import { CryptoBubbleInterface } from '../components/CryptoBubbleInterface';
import '../styles/design-system.css';

function App() {
  return (
    <div className="app">
      <CryptoBubbleInterface />
    </div>
  );
}

export default App;
```

## Airtable Integration

```typescript
// src/services/airtable.ts
import axios from 'axios';
import { VideoData } from '../types';

const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = import.meta.env.VITE_AIRTABLE_TABLE_NAME;

const airtableApi = axios.create({
  baseURL: `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`,
  headers: {
    Authorization: `Bearer ${AIRTABLE_API_KEY}`
  }
});

export async function fetchVideos(): Promise<VideoData[]> {
  try {
    const response = await airtableApi.get('');
    
    // Transform Airtable records to VideoData format
    return response.data.records.map((record: any) => ({
      id: record.id,
      title: record.fields.Title || '',
      description: record.fields.Description || '',
      url: record.fields.URL || '',
      thumbnailUrl: record.fields.ThumbnailURL?.[0]?.url || '',
      creator: record.fields.Creator || '',
      platform: record.fields.Platform || 'youtube',
      publishedAt: record.fields.PublishedAt || new Date().toISOString(),
      viewCount: record.fields.ViewCount || 0,
      likeCount: record.fields.LikeCount || 0,
      commentCount: record.fields.CommentCount || 0,
      mentions: (record.fields.Mentions || []).map((mention: any) => ({
        id: mention.id,
        symbol: mention.fields.Symbol,
        name: mention.fields.Name,
        sentiment: mention.fields.Sentiment || 'neutral',
        confidence: mention.fields.Confidence || 0.5
      }))
    }));
  } catch (error) {
    console.error('Error fetching videos from Airtable:', error);
    return [];
  }
}
```
