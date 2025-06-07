import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { InvestmentDataPoint } from './CryptoVideoSimulator';
import { formatCurrencyFull } from '../../utils/formatting';

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

    // Find min and max values for scaling
    const values = investmentData.map(d => d.value);
    const minValue = 0; // Always start at $0
    const maxValue = Math.max(...values, investmentAmount) * 1.05;
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

    // Draw investment baseline
    const baselineY = padding.top + chartHeight - ((investmentAmount - minValue) / valueRange) * chartHeight;
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
      const y = padding.top + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
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
      const y = padding.top + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;

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
      const y = padding.top + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;

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
      ctx.fillText(formatCurrencyFull(value), padding.left - 10, y + 4);
    }

    // Draw baseline label
    ctx.textAlign = 'left';
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px Inter';
    ctx.fillText('Initial Investment', padding.left + chartWidth + 5, baselineY + 4);

  }, [investmentData, investmentAmount]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || investmentData.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

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
  const returnPercentage = ((totalReturn / investmentAmount) * 100);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-200 flex items-center gap-2">
          <BarChart3 size={18} className="text-primary-400" />
          Investment Performance Over Time
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-gray-500"></div>
            <span className="text-gray-400">Initial Investment</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-0.5 ${totalReturn >= 0 ? 'bg-success-400' : 'bg-loss-400'}`}></div>
            <span className="text-gray-400">Portfolio Value</span>
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
                <span className="text-xs text-gray-400">Portfolio Value:</span>
                <span className="text-sm font-medium text-gray-200">
                  {formatCurrencyFull(tooltip.data.value)}
                </span>
              </div>
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};