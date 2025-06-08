import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Settings } from 'lucide-react';
import { InvestmentDataPoint } from './CryptoVideoSimulator';
import { formatCurrencyFull, formatPercentage } from '../../utils/formatting';

interface CompactPerformanceChartProps {
  investmentData: InvestmentDataPoint[];
  investmentAmount: number;
}

export const CompactPerformanceChart: React.FC<CompactPerformanceChartProps> = ({
  investmentData,
  investmentAmount
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    data: InvestmentDataPoint;
  } | null>(null);
  const [displayMode, setDisplayMode] = useState<'value' | 'percentage'>('value');
  const [showSettings, setShowSettings] = useState(false);

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowSettings(false);
    if (showSettings) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showSettings]);

  // Show empty state if no investment data
  if (investmentData.length === 0) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={20} className="text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-100">Performance Chart</h3>
        </div>
        <div className="bg-gray-900 border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
          <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <BarChart3 size={24} className="text-gray-500" />
          </div>
          <div className="text-gray-400 text-sm">No performance data available</div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || investmentData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Calculate chart dimensions
    const padding = { top: 20, right: 60, bottom: 40, left: 60 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    // Calculate values based on display mode
    const values = displayMode === 'value' 
      ? investmentData.map(d => d.value)
      : investmentData.map(d => ((d.value - investmentAmount) / investmentAmount) * 100);
    
    const baselineValue = displayMode === 'value' ? investmentAmount : 0;
    const minValue = displayMode === 'value' ? 0 : Math.min(...values, 0) * 1.1;
    const maxValue = displayMode === 'value' 
      ? Math.max(...values, investmentAmount) * 1.05
      : Math.max(...values, 0) * 1.1;
    const valueRange = maxValue - minValue;

    // Draw grid lines
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);

    // Horizontal grid lines (5 lines)
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
    }

    // Vertical grid lines
    const xStep = chartWidth / (investmentData.length - 1);
    for (let i = 0; i < investmentData.length; i++) {
      const x = padding.left + xStep * i;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartHeight);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    // Draw baseline (investment amount for value mode, 0% for percentage mode)
    const baselineY = padding.top + chartHeight - ((baselineValue - minValue) / valueRange) * chartHeight;
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding.left, baselineY);
    ctx.lineTo(padding.left + chartWidth, baselineY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Create gradient for area fill
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    const currentValue = investmentData[investmentData.length - 1]?.value || investmentAmount;
    const isProfit = currentValue >= investmentAmount;
    
    if (isProfit) {
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.05)');
    } else {
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0.05)');
    }

    // Draw area fill
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(padding.left, baselineY);
    
    investmentData.forEach((point, index) => {
      const x = padding.left + xStep * index;
      const plotValue = displayMode === 'value' 
        ? point.value 
        : ((point.value - investmentAmount) / investmentAmount) * 100;
      const y = padding.top + chartHeight - ((plotValue - minValue) / valueRange) * chartHeight;
      ctx.lineTo(x, y);
    });
    
    ctx.lineTo(padding.left + chartWidth, baselineY);
    ctx.closePath();
    ctx.fill();

    // Draw the main line
    ctx.strokeStyle = isProfit ? '#10b981' : '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();

    investmentData.forEach((point, index) => {
      const x = padding.left + xStep * index;
      const plotValue = displayMode === 'value' 
        ? point.value 
        : ((point.value - investmentAmount) / investmentAmount) * 100;
      const y = padding.top + chartHeight - ((plotValue - minValue) / valueRange) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw data points
    investmentData.forEach((point, index) => {
      const x = padding.left + xStep * index;
      const plotValue = displayMode === 'value' 
        ? point.value 
        : ((point.value - investmentAmount) / investmentAmount) * 100;
      const y = padding.top + chartHeight - ((plotValue - minValue) / valueRange) * chartHeight;

      // Outer circle
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();

      // Inner circle
      ctx.fillStyle = isProfit ? '#10b981' : '#ef4444';
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw labels
    ctx.fillStyle = '#9ca3af';
    ctx.font = '11px Inter';
    ctx.textAlign = 'center';

    // X-axis labels
    investmentData.forEach((point, index) => {
      const x = padding.left + xStep * index;
      ctx.fillText(point.date, x, rect.height - 10);
    });

    // Y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const value = minValue + (valueRange / 4) * (4 - i);
      const y = padding.top + (chartHeight / 4) * i;
      const label = displayMode === 'value' 
        ? formatCurrencyFull(value)
        : formatPercentage(value);
      ctx.fillText(label, padding.left - 10, y + 4);
    }

    // Draw baseline label
    ctx.textAlign = 'left';
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px Inter';
    const baselineLabel = displayMode === 'value' ? 'Initial Investment' : '0% Return';
    ctx.fillText(baselineLabel, padding.left + chartWidth + 5, baselineY + 4);

  }, [investmentData, investmentAmount, displayMode]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || investmentData.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;

    const padding = { top: 20, right: 60, bottom: 40, left: 60 };
    const chartWidth = rect.width - padding.left - padding.right;
    const xStep = chartWidth / (investmentData.length - 1);

    // Find the closest data point
    let closestIndex = -1;
    let minDistance = Infinity;

    investmentData.forEach((_, index) => {
      const pointX = padding.left + xStep * index;
      const distance = Math.abs(mouseX - pointX);
      
      if (distance < minDistance && distance < 30) { // 30px tolerance
        minDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex >= 0) {
      const dataPoint = investmentData[closestIndex];
      setTooltip({
        visible: true,
        x: event.clientX,
        y: event.clientY,
        data: dataPoint
      });
    } else {
      setTooltip(null);
    }
  }, [investmentData]);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  const currentValue = investmentData[investmentData.length - 1]?.value || investmentAmount;
  const totalReturn = currentValue - investmentAmount;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-200 flex items-center gap-2">
          <BarChart3 size={18} className="text-primary-400" />
          Investment Performance Over Time
        </h3>
        <div className="flex items-center gap-4">
          {/* Legend */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-gray-500"></div>
              <span className="text-gray-400">{displayMode === 'value' ? 'Initial Investment' : '0% Return'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-0.5 ${totalReturn >= 0 ? 'bg-success-400' : 'bg-loss-400'}`}></div>
              <span className="text-gray-400">{displayMode === 'value' ? 'Portfolio Value' : 'Return %'}</span>
            </div>
          </div>
          
          {/* Settings Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSettings(!showSettings);
              }}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              title="Chart Settings"
            >
              <Settings size={16} className="text-gray-400" />
            </button>
            
            {showSettings && (
              <div 
                className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-10 min-w-[160px]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-2">
                  <div className="text-xs text-gray-400 mb-2 px-2">Display Mode</div>
                  <button
                    onClick={() => {
                      setDisplayMode('value');
                      setShowSettings(false);
                    }}
                    className={`w-full text-left px-2 py-1 rounded text-sm transition-colors ${
                      displayMode === 'value' ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Value ($)
                  </button>
                  <button
                    onClick={() => {
                      setDisplayMode('percentage');
                      setShowSettings(false);
                    }}
                    className={`w-full text-left px-2 py-1 rounded text-sm transition-colors ${
                      displayMode === 'percentage' ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Percentage (%)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-96 rounded cursor-crosshair"
          style={{ backgroundColor: '#111827' }}
        />
        
        {/* Hover Tooltip */}
        {tooltip && (
          <div 
            className="fixed bg-gray-900 border-2 border-gray-600 rounded-lg p-3 shadow-xl z-50 pointer-events-none"
            style={{
              left: tooltip.x + 10,
              top: tooltip.y - 80,
              transform: tooltip.x > window.innerWidth - 200 ? 'translateX(-100%)' : 'none'
            }}
          >
            <div className="text-sm font-medium text-gray-200 mb-2">{tooltip.data.date}</div>
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-gray-400">{displayMode === 'value' ? 'Portfolio Value:' : 'Return:'}</span>
                <span className="text-sm font-medium text-gray-200">
                  {displayMode === 'value' 
                    ? formatCurrencyFull(tooltip.data.value)
                    : formatPercentage(((tooltip.data.value - investmentAmount) / investmentAmount) * 100)
                  }
                </span>
              </div>
              {displayMode === 'value' && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-gray-400">Return:</span>
                  <div className={`flex items-center gap-1 ${
                    tooltip.data.value >= investmentAmount ? 'text-success-400' : 'text-loss-400'
                  }`}>
                    {tooltip.data.value >= investmentAmount ? (
                      <TrendingUp size={12} />
                    ) : (
                      <TrendingDown size={12} />
                    )}
                    <span className="text-sm font-medium">
                      {tooltip.data.value >= investmentAmount ? '+' : ''}
                      {formatCurrencyFull(tooltip.data.value - investmentAmount)} 
                      ({((tooltip.data.value - investmentAmount) / investmentAmount * 100).toFixed(2)}%)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* CMC Data Timestamp Disclaimer */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        *As at day close {(() => {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          return yesterday.toLocaleDateString('en-GB').replace(/\//g, '-');
        })()}
      </div>
    </div>
  );
};