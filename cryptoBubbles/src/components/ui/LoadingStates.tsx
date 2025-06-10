import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  animate?: boolean;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  className = '', 
  animate = true 
}) => (
  <div 
    className={`bg-gray-700 rounded ${animate ? 'animate-pulse' : ''} ${className}`}
    style={{ minHeight: '1rem' }}
  />
);

interface LoadingShimmerProps {
  className?: string;
  children?: React.ReactNode;
}

export const LoadingShimmer: React.FC<LoadingShimmerProps> = ({ 
  className = '', 
  children 
}) => (
  <div className={`relative overflow-hidden ${className}`}>
    {children}
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
  </div>
);

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '',
  color = 'border-primary-500'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div 
      className={`animate-spin rounded-full border-2 border-transparent ${color} border-t-transparent ${sizeClasses[size]} ${className}`}
    />
  );
};

interface LoadingDotsProps {
  className?: string;
  color?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({ 
  className = '',
  color = 'bg-primary-500'
}) => (
  <div className={`flex items-center space-x-1 ${className}`}>
    <div className={`w-2 h-2 rounded-full ${color} animate-bounce [animation-delay:-0.3s]`} />
    <div className={`w-2 h-2 rounded-full ${color} animate-bounce [animation-delay:-0.15s]`} />
    <div className={`w-2 h-2 rounded-full ${color} animate-bounce`} />
  </div>
);

interface LoadingProgressProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
  color?: string;
}

export const LoadingProgress: React.FC<LoadingProgressProps> = ({ 
  progress, 
  className = '',
  showPercentage = false,
  color = 'bg-primary-500'
}) => (
  <div className={`w-full ${className}`}>
    <div className="flex items-center justify-between mb-1">
      <span className="text-sm font-medium text-gray-300">Loading</span>
      {showPercentage && (
        <span className="text-sm font-medium text-gray-300">{Math.round(progress)}%</span>
      )}
    </div>
    <div className="w-full bg-gray-700 rounded-full h-2">
      <div 
        className={`h-2 rounded-full transition-all duration-300 ${color}`}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  </div>
);

interface LoadingPulseProps {
  className?: string;
  color?: string;
}

export const LoadingPulse: React.FC<LoadingPulseProps> = ({ 
  className = '',
  color = 'bg-primary-500'
}) => (
  <div className={`relative ${className}`}>
    <div className={`w-4 h-4 rounded-full ${color} animate-ping absolute`} />
    <div className={`w-4 h-4 rounded-full ${color}`} />
  </div>
);

interface VideoCardSkeletonProps {
  className?: string;
}

export const VideoCardSkeleton: React.FC<VideoCardSkeletonProps> = ({ 
  className = '' 
}) => (
  <div className={`bg-gray-900 rounded-lg overflow-hidden shadow-md ${className}`}>
    <LoadingShimmer className="w-full">
      <LoadingSkeleton className="aspect-video w-full" />
    </LoadingShimmer>
    
    <div className="p-3 space-y-2">
      <LoadingShimmer>
        <LoadingSkeleton className="h-4 w-full" />
      </LoadingShimmer>
      <LoadingShimmer>
        <LoadingSkeleton className="h-4 w-3/4" />
      </LoadingShimmer>
      <LoadingShimmer>
        <LoadingSkeleton className="h-3 w-1/2" />
      </LoadingShimmer>
      
      <div className="flex items-center justify-between pt-2">
        <LoadingShimmer>
          <LoadingSkeleton className="h-3 w-16" />
        </LoadingShimmer>
        <LoadingShimmer>
          <LoadingSkeleton className="h-3 w-12" />
        </LoadingShimmer>
      </div>
    </div>
  </div>
);

interface BubbleCanvasSkeletonProps {
  width: number;
  height: number;
  bubbleCount?: number;
  className?: string;
}

export const BubbleCanvasSkeleton: React.FC<BubbleCanvasSkeletonProps> = ({ 
  width, 
  height, 
  bubbleCount = 8,
  className = '' 
}) => {
  const bubbles = Array.from({ length: bubbleCount }, (_, i) => ({
    id: i,
    x: Math.random() * (width - 100) + 50,
    y: Math.random() * (height - 100) + 50,
    size: Math.random() * 40 + 30
  }));

  return (
    <div 
      className={`relative bg-gray-950 border-2 border-gray-700 rounded ${className}`}
      style={{ width, height }}
    >
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      {/* Skeleton bubbles */}
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute rounded-full bg-gray-700 animate-pulse"
          style={{
            left: bubble.x - bubble.size / 2,
            top: bubble.y - bubble.size / 2,
            width: bubble.size,
            height: bubble.size,
            animationDelay: `${bubble.id * 0.1}s`
          }}
        />
      ))}
      
      {/* Loading indicator */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-black/70 rounded-lg p-4 flex items-center space-x-3">
          <LoadingSpinner />
          <span className="text-gray-300 text-sm">Loading bubbles...</span>
        </div>
      </div>
    </div>
  );
};

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  progress?: number;
  className?: string;
  children?: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isVisible,
  message = 'Loading...',
  progress,
  className = '',
  children
}) => {
  if (!isVisible) return <>{children}</>;

  return (
    <div className={`relative ${className}`}>
      {children}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-6 max-w-sm w-full mx-4 text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-300 mb-4">{message}</p>
          {typeof progress === 'number' && (
            <LoadingProgress progress={progress} showPercentage />
          )}
        </div>
      </div>
    </div>
  );
};