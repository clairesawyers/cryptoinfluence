import { useQuery } from '@tanstack/react-query';
import { getReviewQueue, getContentForReview } from '@/lib/api';

export const useReviewQueue = () => {
  return useQuery({
    queryKey: ['reviewQueue'],
    queryFn: getReviewQueue,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
};

export const useContentReview = (contentId: number) => {
  return useQuery({
    queryKey: ['contentReview', contentId],
    queryFn: () => getContentForReview(contentId),
    enabled: !!contentId,
  });
};

export const useRefreshQueue = () => {
  const { refetch } = useReviewQueue();
  return () => refetch();
};
