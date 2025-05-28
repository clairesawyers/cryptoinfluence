import axios from 'axios';
import { ContentItem, MentionCandidate } from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const mockInfluencers = [
  {
    id: 1,
    username: 'cryptomaster',
    display_name: 'Crypto Master',
    avatar_url: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: 2,
    username: 'blockchainbabe',
    display_name: 'Blockchain Babe',
    avatar_url: 'https://i.pravatar.cc/150?img=5',
  },
  {
    id: 3,
    username: 'satoshisecrets',
    display_name: 'Satoshi Secrets',
    avatar_url: 'https://i.pravatar.cc/150?img=3',
  },
];

const mockInstruments = [
  {
    id: 1,
    symbol: 'BTC',
    name: 'Bitcoin',
    category: 'L1',
    coinmarketcap_url: 'https://coinmarketcap.com/currencies/bitcoin/',
  },
  {
    id: 2,
    symbol: 'ETH',
    name: 'Ethereum',
    category: 'L1',
    coinmarketcap_url: 'https://coinmarketcap.com/currencies/ethereum/',
  },
  {
    id: 3,
    symbol: 'HYPE',
    name: 'Hyperliquid',
    category: 'DeFi',
    coinmarketcap_url: 'https://coinmarketcap.com/currencies/hyperliquid/',
  },
  {
    id: 4,
    symbol: 'SOL',
    name: 'Solana',
    category: 'L1',
    coinmarketcap_url: 'https://coinmarketcap.com/currencies/solana/',
  },
  {
    id: 5,
    symbol: 'DOGE',
    name: 'Dogecoin',
    category: 'Meme',
    coinmarketcap_url: 'https://coinmarketcap.com/currencies/dogecoin/',
  },
];

const generateMockMentions = (contentId: number): MentionCandidate[] => {
  const count = Math.floor(Math.random() * 5) + 2; // 2-6 mentions
  const mentions: MentionCandidate[] = [];
  
  for (let i = 0; i < count; i++) {
    const instrumentIndex = Math.floor(Math.random() * mockInstruments.length);
    const instrument = mockInstruments[instrumentIndex];
    const sentimentOptions = ['positive', 'neutral', 'negative'] as const;
    const recommendationOptions = ['buy', 'hold', 'sell', 'avoid'] as const;
    const statusOptions = ['pending', 'approved', 'rejected', 'modified'] as const;
    
    mentions.push({
      id: contentId * 100 + i,
      suggested_symbol: instrument.symbol,
      suggested_instrument: instrument,
      sentiment_label: sentimentOptions[Math.floor(Math.random() * sentimentOptions.length)],
      recommendation_type: recommendationOptions[Math.floor(Math.random() * recommendationOptions.length)],
      exact_quote: `${instrument.symbol} is going to ${Math.random() > 0.5 ? 'explode' : 'crash'} with this new law`,
      context_snippet: `The new regulatory framework will impact ${instrument.name} significantly because...`,
      timestamp_in_video: Math.floor(Math.random() * 600), // 0-10 minutes
      confidence_score: Math.floor(Math.random() * 30) + 70, // 70-99%
      is_recommendation: Math.random() > 0.3, // 70% chance of being a recommendation
      review_status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
    });
  }
  
  return mentions;
};

const generateMockContent = (count: number): ContentItem[] => {
  const content: ContentItem[] = [];
  
  for (let i = 1; i <= count; i++) {
    const influencerIndex = Math.floor(Math.random() * mockInfluencers.length);
    const influencer = mockInfluencers[influencerIndex];
    const statusOptions = ['pending', 'processing', 'published'] as const;
    const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
    const publishedDate = new Date();
    publishedDate.setDate(publishedDate.getDate() - Math.floor(Math.random() * 30)); // 0-30 days ago
    
    const mentions = generateMockMentions(i);
    
    content.push({
      id: i,
      title: `Why ${mentions[0].suggested_symbol} Will ${Math.random() > 0.5 ? 'Moon' : 'Crash'} in 2025`,
      influencer,
      published_at: publishedDate.toISOString(),
      duration_seconds: Math.floor(Math.random() * 900) + 300, // 5-20 minutes
      view_count: Math.floor(Math.random() * 100000) + 1000,
      like_count: Math.floor(Math.random() * 10000) + 100,
      comment_count: Math.floor(Math.random() * 1000) + 10,
      content_url: `https://youtube.com/watch?v=${Math.random().toString(36).substring(2, 12)}`,
      thumbnail_url: `https://img.youtube.com/vi/${Math.random().toString(36).substring(2, 12)}/maxresdefault.jpg`,
      status,
      mention_candidates: mentions,
    });
  }
  
  return content;
};

const mockContentItems = generateMockContent(15);

export const getReviewQueue = async () => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  
  return mockContentItems;
};

export const getContentForReview = async (contentId: number) => {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  
  const content = mockContentItems.find(item => item.id === contentId);
  if (!content) {
    throw new Error('Content not found');
  }
  
  return content;
};

export const updateMention = async (
  contentId: number,
  mentionId: number,
  data: Partial<MentionCandidate>
) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  
  const content = mockContentItems.find(item => item.id === contentId);
  if (!content) {
    throw new Error('Content not found');
  }
  
  const mentionIndex = content.mention_candidates.findIndex(m => m.id === mentionId);
  if (mentionIndex === -1) {
    throw new Error('Mention not found');
  }
  
  content.mention_candidates[mentionIndex] = {
    ...content.mention_candidates[mentionIndex],
    ...data,
  };
  
  return content.mention_candidates[mentionIndex];
};

export const publishContent = async (contentId: number) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  
  const content = mockContentItems.find(item => item.id === contentId);
  if (!content) {
    throw new Error('Content not found');
  }
  
  content.status = 'published';
  
  return { success: true, content };
};

export const submitVideo = async (videoUrl: string) => {
  const videoId = videoUrl.includes('youtube.com/watch?v=') 
    ? videoUrl.split('v=')[1]?.split('&')[0]
    : videoUrl.includes('youtu.be/') 
    ? videoUrl.split('youtu.be/')[1]?.split('?')[0]
    : null;
  
  if (!videoId) {
    throw new Error('Invalid YouTube URL - could not extract video ID');
  }

  try {
    await axios.post('https://hook.us2.make.com/nwaqwkd66lcrlprmipihf2i9qic5yf9b', [{
      videoUrl: videoUrl,
      videoId: videoId,
      submitTime: new Date().toISOString()
    }]);
  } catch (error) {
    console.error('Failed to send to webhook:', error);
    throw new Error('Failed to submit video for processing');
  }

  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const newId = mockContentItems.length + 1;
  const influencerIndex = Math.floor(Math.random() * mockInfluencers.length);
  const influencer = mockInfluencers[influencerIndex];
  
  const newContent: ContentItem = {
    id: newId,
    title: `New Video Submission ${newId}`,
    influencer,
    published_at: new Date().toISOString(),
    duration_seconds: Math.floor(Math.random() * 900) + 300,
    view_count: Math.floor(Math.random() * 10000) + 100,
    like_count: Math.floor(Math.random() * 1000) + 10,
    comment_count: Math.floor(Math.random() * 100) + 5,
    content_url: videoUrl,
    thumbnail_url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    status: 'processing',
    mention_candidates: [],
  };
  
  mockContentItems.unshift(newContent);
  
  return { success: true, content: newContent };
};

export default api;
