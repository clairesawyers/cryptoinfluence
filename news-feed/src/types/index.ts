export interface Influencer {
  id: string;
  display_name: string;
  profile_image_url?: string;
  relation?: string;
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
}

export interface FeedState {
  videos: VideoItem[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  sortBy: 'newest' | 'oldest' | 'most_viewed';
  influencerFilter: string;
}
