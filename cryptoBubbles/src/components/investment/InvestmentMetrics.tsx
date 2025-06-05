import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/formatting';
import { InvestmentDataPoint } from './CryptoVideoSimulator';

interface InvestmentMetricsProps {
  totalReturn: number;
  returnPercentage: number;
  investmentData: InvestmentDataPoint[];
  investmentDelay: '1hour' | '1day' | '1week';
  endDate: string;
  publishDate: string;
}

export const InvestmentMetrics: React.FC<InvestmentMetricsProps> = ({
  totalReturn,
  returnPercentage,
  investmentData,
  investmentDelay,
  endDate,
  publishDate
}) => {
  const delayText = investmentDelay === '1hour' ? '1 hour' : investmentDelay === '1day' ? '1 day' : '1 week';
  
  return (
    <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-200 mb-4">Investment Summary</h3>
      
      <div className="space-y-4">
        {/* Total Return */}
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={16} className="text-gray-400" />
            <span className="text-sm text-gray-400">Total Return</span>
          </div>
          {investmentData.length > 0 ? (
            <div className={`flex items-center gap-2 ${totalReturn >= 0 ? 'text-success-400' : 'text-loss-400'}`}>
              {totalReturn >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              <span className="text-2xl font-bold">{formatCurrency(Math.abs(totalReturn))}</span>
            </div>
          ) : (
            <div className="text-2xl font-bold text-gray-500">N/A</div>
          )}
        </div>

        {/* Percentage Return */}
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Percent size={16} className="text-gray-400" />
            <span className="text-sm text-gray-400">Percentage Return</span>
          </div>
          {investmentData.length > 0 ? (
            <div className={`flex items-center gap-2 ${returnPercentage >= 0 ? 'text-success-400' : 'text-loss-400'}`}>
              {returnPercentage >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              <span className="text-2xl font-bold">{formatPercentage(Math.abs(returnPercentage))}</span>
            </div>
          ) : (
            <div className="text-2xl font-bold text-gray-500">N/A</div>
          )}
        </div>
      </div>

      {/* Investment Timeline Info */}
      <div className="mt-4 p-3 bg-gray-800 border border-gray-600 rounded-lg">
        <div className="text-xs text-gray-400 space-y-1">
          {investmentData.length === 0 ? (
            <p>Investment date not yet reached</p>
          ) : (
            <>
              {endDate === 'current' ? (
                <p>Open investment</p>
              ) : (
                <p>Closed on {investmentData.find(d => d.rawDate === endDate)?.date}</p>
              )}
            </>
          )}
          <p className="text-gray-500">
            Investment made {delayText} after video upload ({publishDate})
          </p>
        </div>
      </div>
    </div>
  );
};