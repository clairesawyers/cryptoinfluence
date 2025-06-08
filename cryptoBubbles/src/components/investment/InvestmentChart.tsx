import React, { useRef, useEffect } from 'react';
import { InvestmentDataPoint } from './CryptoVideoSimulator';
import { formatCurrency } from '../../utils/formatting';

interface InvestmentChartProps {
  investmentData: InvestmentDataPoint[];
  investmentAmount: number;
}

export const InvestmentChart: React.FC<InvestmentChartProps> = ({
  investmentData,
  investmentAmount
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || investmentData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate chart dimensions
    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;

    // Find min and max values for scaling
    const values = investmentData.map(d => d.value);
    const minValue = Math.min(...values, investmentAmount) * 0.95;
    const maxValue = Math.max(...values) * 1.05;
    const valueRange = maxValue - minValue;

    // Draw grid lines
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
    }

    // Vertical grid lines
    for (let i = 0; i <= investmentData.length - 1; i++) {
      const x = padding + (chartWidth / (investmentData.length - 1)) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, padding + chartHeight);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    // Draw investment baseline
    const baselineY = padding + chartHeight - ((investmentAmount - minValue) / valueRange) * chartHeight;
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, baselineY);
    ctx.lineTo(padding + chartWidth, baselineY);
    ctx.stroke();

    // Draw the investment line
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 3;
    ctx.beginPath();

    investmentData.forEach((point, index) => {
      const x = padding + (chartWidth / (investmentData.length - 1)) * index;
      const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw data points
    investmentData.forEach((point, index) => {
      const x = padding + (chartWidth / (investmentData.length - 1)) * index;
      const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;

      // Outer circle
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();

      // Inner circle
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw labels
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';

    // X-axis labels
    investmentData.forEach((point, index) => {
      const x = padding + (chartWidth / (investmentData.length - 1)) * index;
      ctx.fillText(point.date, x, canvas.height - 10);
    });

    // Y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = minValue + (valueRange / 5) * (5 - i);
      const y = padding + (chartHeight / 5) * i;
      ctx.fillText(formatCurrency(value), padding - 10, y + 4);
    }
  }, [investmentData, investmentAmount]);

  return (
    <div className="bg-gray-800 border-2 border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-200 mb-4">Investment Performance</h3>
      <div className="relative h-64">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ backgroundColor: '#111827' }}
        />
      </div>
      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          <span className="text-gray-400">Initial Investment</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
          <span className="text-gray-400">Portfolio Value</span>
        </div>
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