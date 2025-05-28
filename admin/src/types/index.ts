
export interface ContentItem {
  id: number;
  title: string;
  influencer: Influencer;
  published_at: string;
  duration_seconds: number;
  view_count: number;
  like_count: number;
  comment_count: number;
  content_url: string;
  thumbnail_url: string;
  status: 'pending' | 'processing' | 'published';
  mention_candidates: MentionCandidate[];
}

export interface MentionCandidate {
  id: number;
  suggested_symbol: string;
  suggested_instrument?: Instrument;
  sentiment_label: 'positive' | 'neutral' | 'negative';
  recommendation_type: 'buy' | 'hold' | 'sell' | 'avoid';
  exact_quote: string;
  context_snippet: string;
  timestamp_in_video?: number;
  confidence_score: number;
  is_recommendation: boolean;
  review_status: 'pending' | 'approved' | 'rejected' | 'modified';
}

export interface Influencer {
  id: number;
  username: string;
  display_name?: string;
  avatar_url?: string;
}

export interface Instrument {
  id: number;
  symbol: string;
  name: string;
  category: string;
  coinmarketcap_url?: string;
}

export interface ReviewStats {
  pending: number;
  approved: number;
  rejected: number;
  modified: number;
}
