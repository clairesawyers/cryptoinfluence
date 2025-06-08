import React, { useState } from 'react';
import { Check, TrendingUp, TrendingDown, AlertCircle, ChevronDown, Settings } from 'lucide-react';
import { CoinData } from './CryptoVideoSimulator';
import { formatPercentage } from '../../utils/formatting';

interface CompactCoinSelectorProps {
  coinsData: CoinData[];
  investmentMode: 'equal' | 'custom';
  totalAllocation: number;
  isValidAllocation: boolean;
  onToggleCoin: (symbol: string) => void;
  onUpdateAllocation: (symbol: string, allocation: number) => void;
  onModeChange: (mode: 'equal' | 'custom') => void;
}

export const CompactCoinSelector: React.FC<CompactCoinSelectorProps> = ({
  coinsData,
  investmentMode,
  totalAllocation,
  isValidAllocation,
  onToggleCoin,
  onUpdateAllocation,
  onModeChange
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-200">Coins Mentioned</h3>
          <p className="text-xs text-gray-500 mt-1">Click coins to select • Dotted borders indicate editable fields</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Settings Button */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-300 hover:bg-gray-600 hover:border-gray-500 transition-all duration-200"
            >
              <Settings size={14} className="text-gray-400" />
              <span>Settings</span>
            </button>
            
            {showSettings && (
              <div className="absolute top-full right-0 mt-2 p-4 bg-gray-900 border border-gray-600 rounded-lg shadow-xl whitespace-nowrap z-50 min-w-64">
                <div className="space-y-4">
                  {/* Allocation Mode Toggle */}
                  <div>
                    <label className="text-xs text-gray-400 mb-2 block">Allocation Mode</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onModeChange('equal')}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          investmentMode === 'equal'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        Equal
                      </button>
                      <button
                        onClick={() => onModeChange('custom')}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          investmentMode === 'custom'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        Custom
                      </button>
                    </div>
                  </div>

                  {/* Investment Amount */}
                  <div>
                    <label className="text-xs text-gray-400 mb-2 block">Investment Amount</label>
                    <button
                      onClick={() => {
                        setShowTooltip(true);
                        setTimeout(() => setShowTooltip(false), 2000);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-300 hover:bg-gray-600 hover:border-gray-500 transition-all duration-200 w-full"
                    >
                      <span>Fixed Investment: $1,000</span>
                      <ChevronDown size={14} className="text-gray-400 ml-auto" />
                    </button>
                    
                    {showTooltip && (
                      <div className="mt-2 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg">
                        <div className="text-xs text-gray-300">More options coming soon</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 border-l border-t border-gray-600 transform rotate-45"></div>
              </div>
            )}
          </div>
          
          {investmentMode === 'custom' && (
            <div className={`flex items-center gap-1 text-sm ${
              isValidAllocation ? 'text-success-400' : 'text-yellow-400'
            }`}>
              {!isValidAllocation && <AlertCircle size={14} />}
              <span>Total: {totalAllocation.toFixed(1)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Responsive Grid Layout - Max 6 columns, auto-fit to take full width */}
      {coinsData.length === 0 ? (
        <div className="bg-gray-900 border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
          <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div className="text-gray-400 text-sm">No cryptocurrencies available</div>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(coinsData.length, 6)}, 1fr)` }}>
          {coinsData.map((coin) => (
          <div
            key={coin.symbol}
            className={`relative bg-gray-900 rounded-lg p-3 transition-all duration-200 cursor-pointer ${
              coin.isSelected
                ? 'border-2 border-primary-500 ring-1 ring-primary-500/50 shadow-lg shadow-primary-500/10'
                : 'border-2 border-dashed border-gray-600/50 hover:border-gray-500/80 hover:shadow-md'
            }`}
            onClick={() => onToggleCoin(coin.symbol)}
          >
            {/* Selection Indicator */}
            <div className={`absolute top-2 right-2 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
              coin.isSelected
                ? 'bg-primary-500 border-primary-500'
                : 'border-gray-500'
            }`}>
              {coin.isSelected && <Check size={10} className="text-white" />}
            </div>

            {/* Coin Info */}
            <div className="mb-2">
              <div className="flex flex-col items-center text-center mb-2">
                <div className="w-6 h-6 mb-1 flex items-center justify-center relative">
                  {coin.logoUrl && coin.logoUrl.trim() !== '' ? (
                    <>
                      <img 
                        src={coin.logoUrl} 
                        alt={`${coin.name} logo`}
                        className="w-6 h-6 rounded-full object-cover"
                        onError={(e) => {
                          // Fallback to letter circle if image fails to load
                          const target = e.currentTarget as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.parentElement?.querySelector('.fallback-logo') as HTMLElement;
                          if (fallback) {
                            fallback.style.display = 'flex';
                          }
                        }}
                      />
                      <div className="fallback-logo w-6 h-6 bg-gray-700 rounded-full items-center justify-center absolute inset-0" style={{ display: 'none' }}>
                        <span className="text-xs font-bold text-gray-300">{coin.symbol}</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-300">{coin.symbol}</span>
                    </div>
                  )}
                </div>
                <div className="text-xs font-medium text-gray-200 truncate">{coin.name}</div>
                <div className="text-xs text-gray-500">{coin.category}</div>
              </div>

              {/* Price Performance */}
              <div className="flex items-center justify-center">
                {coin.currentPrice !== undefined && coin.currentPrice !== null ? (
                  <div className={`flex items-center gap-1 text-xs ${
                    coin.priceChange >= 0 ? 'text-success-400' : 'text-loss-400'
                  }`}>
                    {coin.priceChange >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    <span className="text-xs">{formatPercentage(Math.abs(coin.priceChange))}</span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Allocation Input (only for selected coins in custom mode) */}
            {coin.isSelected && investmentMode === 'custom' && (
              <div className="border-t border-gray-700 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-gray-400">Allocation</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={coin.allocation.toFixed(1)}
                      onChange={(e) => onUpdateAllocation(coin.symbol, parseFloat(e.target.value) || 0)}
                      className="w-16 px-2 py-1 bg-gray-700 border-2 border-dashed border-primary-400/50 rounded text-xs text-gray-200 text-right hover:border-primary-400/80 focus:border-primary-400 focus:outline-none transition-colors"
                      min="0"
                      max="100"
                      step="0.1"
                      onClick={(e) => e.stopPropagation()}
                      placeholder="0.0"
                    />
                    <span className="text-xs text-gray-400">%</span>
                  </div>
                </div>

                {/* Allocation Amount */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Amount:</span>
                  <span className="text-xs font-medium text-gray-300">
                    ${(1000 * (coin.allocation / 100)).toFixed(0)}
                  </span>
                </div>
              </div>
            )}

            {/* Equal mode - minimal display */}
            {coin.isSelected && investmentMode === 'equal' && (
              <div className="border-t border-gray-700 pt-2">
                <div className="text-center">
                  <span className="text-xs text-gray-500">
                    {coin.allocation.toFixed(1)}% • ${(1000 * (coin.allocation / 100)).toFixed(0)}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
        </div>
      )}

      {/* Validation Message */}
      {investmentMode === 'custom' && !isValidAllocation && (
        <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-400 text-sm">
            <AlertCircle size={16} />
            <span>
              Total allocation must equal 100%. Current total: {totalAllocation.toFixed(1)}%
            </span>
          </div>
        </div>
      )}
      
      {/* CMC Data Timestamp Disclaimer */}
      {coinsData.length > 0 && (
        <div className="mt-3 text-xs text-gray-500 text-center">
          *As at day close {(() => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return yesterday.toLocaleDateString('en-GB').replace(/\//g, '-');
          })()}
        </div>
      )}
    </div>
  );
};