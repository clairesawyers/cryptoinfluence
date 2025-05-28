/**
 * Format a date string to a relative time (e.g., "2 hours ago")
 */
export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }
  
  return 'just now';
};

/**
 * Format a number with commas for thousands (e.g., 1,234,567)
 */
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Format video time in seconds to MM:SS format
 */
export const formatVideoTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Get CSS class for sentiment label
 */
export const getSentimentColor = (sentiment: string): string => {
  switch (sentiment) {
    case 'positive':
      return 'bg-green-100 text-green-700';
    case 'negative':
      return 'bg-red-100 text-red-700';
    case 'neutral':
    default:
      return 'bg-blue-100 text-blue-700';
  }
};

/**
 * Get emoji for sentiment label
 */
export const getSentimentEmoji = (sentiment: string): string => {
  switch (sentiment) {
    case 'positive':
      return '😀';
    case 'negative':
      return '😟';
    case 'neutral':
    default:
      return '😐';
  }
};

/**
 * Get CSS class for recommendation type
 */
export const getRecommendationColor = (recommendation: string): string => {
  switch (recommendation) {
    case 'buy':
      return 'bg-green-100 text-green-700';
    case 'sell':
      return 'bg-red-100 text-red-700';
    case 'hold':
      return 'bg-blue-100 text-blue-700';
    case 'avoid':
      return 'bg-yellow-100 text-yellow-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};
