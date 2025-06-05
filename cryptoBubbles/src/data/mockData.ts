import { VideoItem, Influencer } from '../types';

export const mockInfluencers: Influencer[] = [
  {
    id: '1',
    display_name: 'Coin Bureau',
    profile_image_url: 'https://yt3.ggpht.com/a/AATXAJwAyCZGleVpp_e-jurqWYsH-PgRTcWVUgd854qr4w=s900-c-k-c0xffffffff-no-rj-mo',
    platform: 'youtube'
  },
  {
    id: '2', 
    display_name: 'Benjamin Cowen',
    profile_image_url: 'https://yt3.ggpht.com/a/AATXAJymy6xr9_W7GTkSdgz-u3hJu1RJJL4a7-sOyKUFfQ=s900-c-k-c0xffffffff-no-rj-mo',
    platform: 'youtube'
  },
  {
    id: '3',
    display_name: 'Raoul Pal',
    profile_image_url: 'https://pbs.twimg.com/profile_images/1442213668369862657/5_7dnT9q_400x400.jpg',
    platform: 'twitter'
  },
  {
    id: '4',
    display_name: 'Altcoin Daily',
    platform: 'youtube'
  },
  {
    id: '5',
    display_name: 'BitBoy Crypto',
    platform: 'youtube'
  },
  {
    id: '6',
    display_name: 'Crypto Zombie',
    platform: 'youtube'
  },
  {
    id: '7',
    display_name: 'InvestAnswers',
    platform: 'youtube'
  },
  {
    id: '8',
    display_name: 'Crypto Capital Venture',
    platform: 'youtube'
  }
];

export const mockVideos: VideoItem[] = [
  {
    id: '1',
    title: 'Bitcoin BREAKOUT Incoming! Critical Levels to Watch',
    thumbnail_url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration_seconds: 1245,
    published_at: '2024-01-15T10:30:00Z',
    view_count: 450000,
    like_count: 15000,
    influencer: mockInfluencers[0]
  },
  {
    id: '2',
    title: 'Market Correction Coming? On-Chain Data Reveals All',
    thumbnail_url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration_seconds: 890,
    published_at: '2024-01-15T08:15:00Z',
    view_count: 189000,
    like_count: 8500,
    influencer: mockInfluencers[1]
  },
  {
    id: '3',
    title: 'DeFi Summer 2.0 is HERE - My Top 5 Picks',
    duration_seconds: 0,
    published_at: '2024-01-15T12:00:00Z',
    view_count: 67000,
    like_count: 3200,
    influencer: mockInfluencers[2]
  },
  {
    id: '4',
    title: 'Ethereum 2.0 Staking Rewards EXPLAINED',
    thumbnail_url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration_seconds: 725,
    published_at: '2024-01-15T14:45:00Z',
    view_count: 125000,
    like_count: 6800,
    influencer: mockInfluencers[3]
  },
  {
    id: '5',
    title: 'MASSIVE Bitcoin News! El Salvador Buys More BTC',
    thumbnail_url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration_seconds: 654,
    published_at: '2024-01-15T16:20:00Z',
    view_count: 298000,
    like_count: 12000,
    influencer: mockInfluencers[4]
  },
  {
    id: '6',
    title: 'Top 10 Altcoins Ready to EXPLODE in 2024',
    thumbnail_url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration_seconds: 1180,
    published_at: '2024-01-15T09:30:00Z',
    view_count: 340000,
    like_count: 14500,
    influencer: mockInfluencers[5]
  },
  {
    id: '7',
    title: 'Technical Analysis: BTC Chart Shows THIS',
    thumbnail_url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration_seconds: 892,
    published_at: '2024-01-15T11:15:00Z',
    view_count: 156000,
    like_count: 7200,
    influencer: mockInfluencers[6]
  },
  {
    id: '8',
    title: 'Solana vs Ethereum: The REAL Winner',
    thumbnail_url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration_seconds: 967,
    published_at: '2024-01-15T13:00:00Z',
    view_count: 203000,
    like_count: 9800,
    influencer: mockInfluencers[7]
  },
  {
    id: '9',
    title: 'Crypto Regulations: What You NEED to Know',
    thumbnail_url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration_seconds: 1456,
    published_at: '2024-01-15T15:30:00Z',
    view_count: 87000,
    like_count: 4300,
    influencer: mockInfluencers[0]
  },
  {
    id: '10',
    title: 'NFT Market Recovery: Hidden Gems to Buy',
    thumbnail_url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration_seconds: 745,
    published_at: '2024-01-15T17:45:00Z',
    view_count: 112000,
    like_count: 5600,
    influencer: mockInfluencers[1]
  },
  {
    id: '11',
    title: 'BREAKING: Major Exchange Lists New Token',
    duration_seconds: 0,
    published_at: '2024-01-15T18:00:00Z',
    view_count: 45000,
    like_count: 2100,
    influencer: mockInfluencers[2]
  },
  {
    id: '12',
    title: 'Mining Profitability 2024: Complete Guide',
    thumbnail_url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration_seconds: 1823,
    published_at: '2024-01-15T07:00:00Z',
    view_count: 134000,
    like_count: 6700,
    influencer: mockInfluencers[3]
  }
];

export const generateMockVideos = (count: number = 25): VideoItem[] => {
  const videos: VideoItem[] = [];
  const titles = [
    'Bitcoin MASSIVE Breakout Alert!',
    'Ethereum Price Target REVEALED',
    'Top 5 Altcoins for Maximum Gains',
    'Crypto Market Analysis Deep Dive',
    'DeFi Protocol You Must Know About',
    'NFT Collection Going Parabolic',
    'Technical Analysis Says THIS',
    'Bullish News for Cryptocurrency',
    'Bear Market Finally OVER?',
    'Institutional Adoption Incoming',
    'On-Chain Data Shows Accumulation',
    'Smart Money Moving Into Crypto',
    'Regulatory News Impact Analysis',
    'Web3 Gaming Token Explosion',
    'Layer 2 Solutions Comparison',
    'Staking Rewards Calculator',
    'Crypto Predictions for 2024',
    'Market Maker Manipulation Exposed',
    'Best Hardware Wallet Review',
    'Trading Strategy That Works'
  ];

  for (let i = 0; i < count; i++) {
    const randomInfluencer = mockInfluencers[Math.floor(Math.random() * mockInfluencers.length)];
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    const viewCount = Math.floor(Math.random() * 500000) + 10000;
    const likeCount = Math.floor(viewCount * (Math.random() * 0.05 + 0.01));
    
    videos.push({
      id: `video-${i + 1}`,
      title: randomTitle,
      thumbnail_url: randomInfluencer.platform === 'youtube' ? 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg' : undefined,
      duration_seconds: randomInfluencer.platform === 'youtube' ? Math.floor(Math.random() * 1800) + 300 : 0,
      published_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      view_count: viewCount,
      like_count: likeCount,
      influencer: randomInfluencer
    });
  }

  return videos.sort((a, b) => b.view_count - a.view_count);
};