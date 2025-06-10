import React, { useState, useEffect } from 'react';
import { memoryMonitor, globalImageCache, globalAnimationManager } from '../../utils/memoryManager';

interface MemoryDebugPanelProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

export const MemoryDebugPanel: React.FC<MemoryDebugPanelProps> = ({ 
  isVisible = false, 
  onToggle 
}) => {
  const [memoryInfo, setMemoryInfo] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [animationStats, setAnimationStats] = useState<any>(null);

  useEffect(() => {
    if (!isVisible) return;

    const updateStats = () => {
      setMemoryInfo(memoryMonitor.getMemoryInfo());
      setCacheStats(globalImageCache.getStats());
      setAnimationStats({
        activeAnimations: globalAnimationManager.getActiveCount()
      });
    };

    // Initial update
    updateStats();

    // Update every 2 seconds when visible
    const interval = setInterval(updateStats, 2000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-lg text-xs z-50"
      >
        Memory
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 border border-gray-700 rounded-lg p-4 text-xs text-white max-w-sm z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">Memory Debug</h3>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>

      {/* Memory Info */}
      {memoryInfo && (
        <div className="mb-3">
          <h4 className="font-medium text-gray-300 mb-1">JavaScript Heap</h4>
          <div className="space-y-1">
            <div>Used: {formatBytes(memoryInfo.usedJSHeapSize)}</div>
            <div>Total: {formatBytes(memoryInfo.totalJSHeapSize)}</div>
            <div>Limit: {formatBytes(memoryInfo.jsHeapSizeLimit)}</div>
            <div 
              className={`font-medium ${
                memoryInfo.usagePercentage > 80 ? 'text-red-400' :
                memoryInfo.usagePercentage > 60 ? 'text-yellow-400' :
                'text-green-400'
              }`}
            >
              Usage: {memoryInfo.usagePercentage.toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* Image Cache Stats */}
      {cacheStats && (
        <div className="mb-3">
          <h4 className="font-medium text-gray-300 mb-1">Image Cache</h4>
          <div className="space-y-1">
            <div>Images: {cacheStats.size}/{cacheStats.maxItems}</div>
            <div>Memory: {formatBytes(cacheStats.memoryUsage)}</div>
            <div>Max: {formatBytes(cacheStats.maxMemory)}</div>
            <div 
              className={`font-medium ${
                (cacheStats.memoryUsage / cacheStats.maxMemory) > 0.8 ? 'text-red-400' :
                (cacheStats.memoryUsage / cacheStats.maxMemory) > 0.6 ? 'text-yellow-400' :
                'text-green-400'
              }`}
            >
              Usage: {((cacheStats.memoryUsage / cacheStats.maxMemory) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* Animation Stats */}
      {animationStats && (
        <div className="mb-3">
          <h4 className="font-medium text-gray-300 mb-1">Animations</h4>
          <div>
            Active: {animationStats.activeAnimations}
          </div>
        </div>
      )}

      {/* Memory Actions */}
      <div className="space-y-2 pt-2 border-t border-gray-700">
        <button
          onClick={() => globalImageCache.clear()}
          className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
        >
          Clear Image Cache
        </button>
        
        <button
          onClick={() => globalAnimationManager.cancelAll()}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs"
        >
          Cancel All Animations
        </button>

        {typeof (window as any).gc === 'function' && (
          <button
            onClick={() => (window as any).gc()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
          >
            Force GC (Dev Only)
          </button>
        )}
      </div>
    </div>
  );
};