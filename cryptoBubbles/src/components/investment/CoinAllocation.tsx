import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { CoinData } from './CryptoVideoSimulator';
import { formatCurrency, formatPercentage } from '../../utils/formatting';

interface CoinAllocationProps {
  coinsData: CoinData[];
  investmentMode: 'equal' | 'custom';
  updateCoinAllocation: (symbol: string, allocation: number) => void;
}

export const CoinAllocation: React.FC<CoinAllocationProps> = ({
  coinsData,
  investmentMode,
  updateCoinAllocation
}) => {
  return (
    <div className="bg-gray-800 border-2 border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-200 mb-4">Coin Allocation</h3>
      
      <div className="space-y-4">
        {coinsData.map((coin) => (
          <div key={coin.symbol} className="bg-gray-900 border border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-300">{coin.symbol}</span>
                </div>
                <div>
                  <div className="font-medium text-gray-200">{coin.name}</div>
                  <div className="text-sm text-gray-400">{coin.symbol}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`flex items-center gap-1 justify-end ${
                  coin.priceChange >= 0 ? 'text-success-400' : 'text-loss-400'
                }`}>
                  {coin.priceChange >= 0 ? (
                    <TrendingUp size={16} />
                  ) : (
                    <TrendingDown size={16} />
                  )}
                  <span className="font-medium">{formatPercentage(coin.priceChange)}</span>
                </div>
                <div className="text-sm text-gray-400">
                  ${coin.currentPrice.toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Allocation</span>
                <div className="flex items-center gap-2">
                  {investmentMode === 'custom' ? (
                    <input
                      type="number"
                      value={coin.allocation}
                      onChange={(e) => updateCoinAllocation(coin.symbol, Number(e.target.value))}
                      className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-gray-200 text-right"
                      min="0"
                      max="100"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-200">{coin.allocation}</span>
                  )}
                  <span className="text-sm text-gray-400">%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Return</span>
                <span className={`text-sm font-medium ${
                  coin.returnAmount >= 0 ? 'text-success-400' : 'text-loss-400'
                }`}>
                  {formatCurrency(coin.returnAmount)}
                </span>
              </div>
            </div>
            
            {/* Allocation bar */}
            <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-500 transition-all duration-300"
                style={{ width: `${coin.allocation}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      
      {investmentMode === 'custom' && (
        <div className="mt-4 p-3 bg-gray-900 border border-gray-600 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Total Allocation</span>
            <span className={`font-medium ${
              coinsData.reduce((sum, coin) => sum + coin.allocation, 0) === 100
                ? 'text-success-400'
                : 'text-yellow-400'
            }`}>
              {coinsData.reduce((sum, coin) => sum + coin.allocation, 0)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};