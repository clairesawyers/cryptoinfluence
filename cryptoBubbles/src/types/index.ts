export interface Influencer {
  id: string;
  display_name: string;
  profile_image_url?: string;
  relation?: string;
  platform: 'youtube' | 'twitter' | 'tiktok';
}

export interface VideoItem {
  id: string;
  title: string;
  thumbnail_url?: string;
  duration_seconds: number;
  published_at: string;
  publish_date?: string;
  view_count: number;
  like_count: number;
  influencer: Influencer;
  watch_url?: string; // Added to support opening videos in new tabs
  short_summary?: string;
  coins_mentioned?: string[];
}

export interface BubblePosition {
  x: number;
  y: number;
  size: number;
  scale: number;
}

export interface BubbleCard extends VideoItem {
  position: BubblePosition;
  isSelected: boolean;
}

export type ViewMode = 'day' | 'week' | 'month';

export interface BubbleState {
  videos: VideoItem[];
  bubbles: BubbleCard[];
  loading: boolean;
  error: string | null;
  selectedCard: BubbleCard | null;
  selectedDate: Date;
  viewMode: ViewMode;
  canvasSize: { width: number; height: number };
}

export interface ContentItem {
  id: string;
  thumbnail_url: string;
  title: string;
  influencer_name: string;
  watch_url: string;
  views_count: number;
  publish_date: string;
  short_summary?: string;
  coins_mentioned?: string[];
  publish_status?: string;
}