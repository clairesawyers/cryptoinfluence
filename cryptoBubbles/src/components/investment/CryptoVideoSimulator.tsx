import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, BarChart3, AlertTriangle, ChevronDown } from 'lucide-react';
import { CompactCoinSelector } from './CompactCoinSelector';
import { CompactPerformanceChart } from './CompactPerformanceChart';
import { StrategyComparison } from './StrategyComparison';
import { formatCurrencyFull, formatPercentage } from '../../utils/formatting';
import { useCoinData } from '../../hooks/useCoinData';
import { useInvestmentData } from '../../hooks/useInvestmentData';

interface CryptoVideoSimulatorProps {
  videoId: string;
  videoTitle: string;
  publishDate: string;
  coinsMentioned?: string[]; // Array of coin names mentioned in the video
  onProfitabilityChange?: (isProfitable: boolean) => void;
}

export interface CoinData {
  symbol: string;
  name: string;
  category: string;
  isSelected: boolean;
  allocation: number;
  initialPrice: number;
  currentPrice: number;
  priceChange: number;
  returnAmount: number;
}

export interface VideoData {
  title: string;
  channel: string;
  views: number;
  uploadDate: string;
  duration: string;
}

export interface InvestmentDataPoint {
  date: string;
  value: number;
  change: number;
}

const CryptoVideoSimulator: React.FC<CryptoVideoSimulatorProps> = ({
  videoId,
  videoTitle,
  publishDate,
  coinsMentioned = ['Bitcoin', 'Ethereum', 'Solana', 'Cardano', 'Polygon', 'Polkadot'], // Default coins
  onProfitabilityChange
}) => {
  const FIXED_INVESTMENT = 1000;
  const [investmentDelay, setInvestmentDelay] = useState<'1hour' | '1day' | '1week'>('1day');
  const [investmentMode, setInvestmentMode] = useState<'equal' | 'custom'>('equal');
  const [showMethodology, setShowMethodology] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  
  // Real data hooks
  const { 
    coinsData: realCoinsData, 
    loading: coinsLoading, 
    error: coinsError 
  } = useCoinData({
    videoDate: publishDate,
    coinNames: coinsMentioned
  });

  const {
    investmentData: realInvestmentData,
    loading: investmentLoading,
    error: investmentError
  } = useInvestmentData({
    coinsData: realCoinsData,
    videoDate: publishDate,
    investmentDelay
  });
  
  // Local state for user modifications
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [coinsData, setCoinsData] = useState<CoinData[]>([]);
  const [investmentData, setInvestmentData] = useState<InvestmentDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Update local state when real data loads
  useEffect(() => {
    if (realCoinsData.length > 0) {
      setCoinsData(realCoinsData);
    }
  }, [realCoinsData]);

  useEffect(() => {
    if (realInvestmentData.length > 0) {
      setInvestmentData(realInvestmentData);
    }
  }, [realInvestmentData]);

  // Set loading state
  useEffect(() => {
    setIsLoading(coinsLoading || investmentLoading);
  }, [coinsLoading, investmentLoading]);

  // Initialize video data
  useEffect(() => {
    setVideoData({
      title: videoTitle,
      channel: 'Crypto Influencer',
      views: 125000,
      uploadDate: publishDate,
      duration: '12:34'
    });
  }, [videoTitle, publishDate]);

  const selectedCoins = coinsData.filter(coin => coin.isSelected);
  const totalReturn = investmentData.length > 0 
    ? investmentData[investmentData.length - 1].value - FIXED_INVESTMENT
    : 0;
  
  const returnPercentage = investmentData.length > 0
    ? ((investmentData[investmentData.length - 1].value - FIXED_INVESTMENT) / FIXED_INVESTMENT) * 100
    : 0;

  const toggleCoinSelection = (symbol: string) => {
    setCoinsData(prev => {
      const updated = prev.map(coin => 
        coin.symbol === symbol ? { ...coin, isSelected: !coin.isSelected } : coin
      );
      
      // Always auto-adjust allocations for equal mode, and reset to equal when switching to equal mode
      const selectedCount = updated.filter(coin => coin.isSelected).length;
      const equalAllocation = selectedCount > 0 ? 100 / selectedCount : 0;
      
      return updated.map(coin => ({
        ...coin,
        allocation: coin.isSelected ? equalAllocation : 0
      }));
    });
  };

  // Update allocations when switching to equal mode
  useEffect(() => {
    if (investmentMode === 'equal') {
      setCoinsData(prev => {
        const selectedCount = prev.filter(coin => coin.isSelected).length;
        const equalAllocation = selectedCount > 0 ? 100 / selectedCount : 0;
        
        return prev.map(coin => ({
          ...coin,
          allocation: coin.isSelected ? equalAllocation : 0
        }));
      });
    }
  }, [investmentMode]);

  const updateCoinAllocation = (symbol: string, newAllocation: number) => {
    setCoinsData(prev => prev.map(coin => 
      coin.symbol === symbol ? { ...coin, allocation: newAllocation } : coin
    ));
  };

  const totalAllocation = coinsData.reduce((sum, coin) => coin.isSelected ? sum + coin.allocation : sum, 0);
  const isValidAllocation = Math.abs(totalAllocation - 100) < 0.01;

  // Notify parent of profitability status
  useEffect(() => {
    if (onProfitabilityChange && investmentData.length > 0) {
      const isProfitable = totalReturn >= 0;
      onProfitabilityChange(isProfitable);
    }
  }, [totalReturn, onProfitabilityChange, investmentData.length]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-gray-400">Loading investment simulation...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Coin Selection */}
        <CompactCoinSelector
          coinsData={coinsData}
          investmentMode={investmentMode}
          totalAllocation={totalAllocation}
          isValidAllocation={isValidAllocation}
          onToggleCoin={toggleCoinSelection}
          onUpdateAllocation={updateCoinAllocation}
          onModeChange={setInvestmentMode}
        />

        {/* Header - Performance Summary */}
        <div className="max-w-lg">
          {/* Performance Summary */}
          <div className={`relative bg-gradient-to-br from-gray-800 via-gray-850 to-gray-900 border-2 rounded-xl p-6 shadow-2xl ${
            totalReturn >= 0 
              ? 'border-success-500/30 shadow-success-500/10' 
              : 'border-loss-500/30 shadow-loss-500/10'
          }`}>
            {/* Subtle glow effect */}
            <div className={`absolute inset-0 rounded-xl opacity-20 ${
              totalReturn >= 0 ? 'bg-success-500/5' : 'bg-loss-500/5'
            }`}></div>
            
            {/* Header with icon */}
            <div className="relative flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${
                totalReturn >= 0 
                  ? 'bg-success-500/20 text-success-400' 
                  : 'bg-loss-500/20 text-loss-400'
              }`}>
                {totalReturn >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-100">Investment Summary</h3>
                <p className="text-xs text-gray-400">Open Position • Real-time</p>
              </div>
            </div>

            <div className="relative space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Initial Investment:</span>
                <span className="text-sm font-semibold text-gray-100">{formatCurrencyFull(FIXED_INVESTMENT)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Current Value:</span>
                <span className="text-base font-bold text-gray-100">
                  {formatCurrencyFull(investmentData[investmentData.length - 1]?.value || FIXED_INVESTMENT)}
                </span>
              </div>
              
              {/* Prominent return display */}
              <div className={`flex items-center justify-between p-3 rounded-lg border ${
                totalReturn >= 0 
                  ? 'bg-success-500/10 border-success-500/20' 
                  : 'bg-loss-500/10 border-loss-500/20'
              }`}>
                <span className="text-sm font-medium text-gray-300">Total Return:</span>
                <div className={`flex items-center gap-2 ${totalReturn >= 0 ? 'text-success-400' : 'text-loss-400'}`}>
                  {totalReturn >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {totalReturn >= 0 ? '+' : ''}{formatCurrencyFull(totalReturn)}
                    </div>
                    <div className="text-sm font-medium">
                      ({totalReturn >= 0 ? '+' : ''}{formatPercentage(returnPercentage)})
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Animated border glow */}
            <div className={`absolute inset-0 rounded-xl pointer-events-none ${
              totalReturn >= 0 
                ? 'shadow-lg shadow-success-500/5' 
                : 'shadow-lg shadow-loss-500/5'
            }`}></div>
          </div>
        </div>

        {/* Performance Chart */}
        <CompactPerformanceChart
          investmentData={investmentData}
          investmentAmount={FIXED_INVESTMENT}
        />

        {/* Strategy Comparison */}
        <StrategyComparison
          portfolioValue={investmentData[investmentData.length - 1]?.value || FIXED_INVESTMENT}
          portfolioReturn={totalReturn}
          portfolioReturnPercentage={returnPercentage}
        />

        {/* Footer - Methodology & Disclaimer */}
        <div className="space-y-4">
          {/* Methodology */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg">
            <button
              onClick={() => setShowMethodology(!showMethodology)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-750 transition-colors rounded-t-lg"
            >
              <div className="flex items-center gap-2">
                <BarChart3 size={14} className="text-primary-400" />
                <span className="text-sm font-medium text-gray-300">Methodology</span>
              </div>
              <ChevronDown 
                className={`w-4 h-4 text-gray-400 transition-transform ${showMethodology ? 'rotate-180' : ''}`} 
              />
            </button>
            
            {showMethodology && (
              <div className="px-4 pb-4 border-t border-gray-700 bg-gray-850">
                <div className="text-xs text-gray-400 space-y-1 mt-3">
                  <div>• Buy and Hold strategy (No rebalancing)</div>
                  <div>• Investment made {investmentDelay === '1hour' ? '1 hour' : investmentDelay === '1day' ? '1 day' : '1 week'} after upload</div>
                  <div>• {investmentMode === 'equal' ? 'Equal allocation' : 'Custom allocation'} across selected coins</div>
                  <div>• Historical price data source</div>
                  <div className="text-primary-400">• Alternative strategies coming soon</div>
                </div>
              </div>
            )}
          </div>

          {/* Risk Disclaimer */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg">
            <button
              onClick={() => setShowDisclaimer(!showDisclaimer)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-750 transition-colors rounded-t-lg"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">⚠️</span>
                <span className="text-sm font-medium text-gray-300">Risk Disclaimer</span>
              </div>
              <ChevronDown 
                className={`w-4 h-4 text-gray-400 transition-transform ${showDisclaimer ? 'rotate-180' : ''}`} 
              />
            </button>
            
            {showDisclaimer && (
              <div className="px-4 pb-4 border-t border-gray-700 bg-gray-850">
                <div className="text-xs text-gray-400 leading-relaxed mt-3">
                  This simulation is for educational purposes only and does not constitute financial advice. 
                  Cryptocurrency investments carry high risk. Past performance is not indicative of future results.
                  Never invest more than you can afford to lose. Always conduct your own research before making investment decisions.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoVideoSimulator;