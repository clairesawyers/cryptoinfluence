import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, BarChart3, AlertTriangle, ChevronDown, Toggle } from 'lucide-react';
import { CompactCoinSelector } from './CompactCoinSelector';
import { CompactPerformanceChart } from './CompactPerformanceChart';
import { StrategyComparison } from './StrategyComparison';
import { LiveDataSimulator } from './LiveDataSimulator';
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
  logoUrl?: string;
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
  coinsMentioned = ['Bitcoin', 'Ethereum', 'Solana'], // Reduced default coins
  onProfitabilityChange
}) => {
  // Debug log to see what coins are being passed
  console.log('🚀 CryptoVideoSimulator initialized');
  console.log('🪙 Received coinsMentioned:', coinsMentioned);
  console.log('  - Type:', typeof coinsMentioned);
  console.log('  - Is Array?:', Array.isArray(coinsMentioned));
  console.log('  - Length:', coinsMentioned?.length);
  console.log('  - Raw value:', JSON.stringify(coinsMentioned));
  console.log('📺 Video:', videoTitle);
  console.log('📅 Publish Date:', publishDate);
  const FIXED_INVESTMENT = 1000;
  const [investmentDelay, setInvestmentDelay] = useState<'1hour' | '1day' | '1week'>('1day');
  const [investmentMode, setInvestmentMode] = useState<'equal' | 'custom'>('equal');
  const [showMethodology, setShowMethodology] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [useLiveData, setUseLiveData] = useState(false);
  
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

  // Show empty state if no coins are available
  if (!isLoading && coinsData.length === 0) {
    return (
      <div className="h-full overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-100 mb-2">No Cryptocurrencies Available</h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto mb-4">
                {coinsMentioned && coinsMentioned.length > 0 
                  ? `Unable to fetch price data for the mentioned cryptocurrencies: ${coinsMentioned.join(', ')}`
                  : 'This video doesn\'t have any cryptocurrency mentions tagged for investment simulation.'}
              </p>
              
              {/* Debug information in development */}
              {import.meta.env.DEV && (
                <div className="mt-6 p-4 bg-gray-900 rounded-lg text-left">
                  <div className="text-xs font-mono text-gray-500">
                    <div className="mb-2 text-gray-400 font-semibold">Debug Info:</div>
                    <div>Video ID: {videoId}</div>
                    <div>Publish Date: {publishDate}</div>
                    <div>Coins Mentioned: {JSON.stringify(coinsMentioned)}</div>
                    <div>Coins Data Length: {realCoinsData.length}</div>
                    {coinsError && <div className="text-red-400 mt-2">Error: {coinsError}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If using live data, show the new simulator
  if (useLiveData) {
    return (
      <div className="h-full overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Data Source Toggle */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-100">Data Source</h3>
                <p className="text-xs text-gray-400">Switch between legacy mock data and live Airtable data</p>
              </div>
              <button
                onClick={() => setUseLiveData(false)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Toggle className="w-4 h-4" />
                Using Live Data
              </button>
            </div>
          </div>

          <LiveDataSimulator
            coinMentions={coinsMentioned || []}
            videoTitle={videoTitle}
            publishDate={publishDate}
            channelName="Crypto Influencer"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Data Source Toggle */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-100">Data Source</h3>
              <p className="text-xs text-gray-400">Switch between legacy mock data and live Airtable data</p>
            </div>
            <button
              onClick={() => setUseLiveData(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
            >
              <Toggle className="w-4 h-4" />
              Using Legacy Data
            </button>
          </div>
        </div>
        {/* Initial Investment Section */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Initial Investment</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-300 min-w-[120px]">Initial Investment</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">$</span>
                <div className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm font-medium text-gray-300">
                  1,000
                </div>
                <span className="text-xs text-gray-500">(uneditable)</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-400">
              Distribute amongst top mentioned cryptocurrencies.
            </div>
          </div>
        </div>

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