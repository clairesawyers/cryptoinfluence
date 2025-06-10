import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, TrendingUp, TrendingDown, DollarSign, Coins, Bitcoin, Info } from 'lucide-react';
import { formatCurrencyFull, formatPercentage } from '../../utils/formatting';
import { AirtablePriceService } from '../../services/airtablePriceService';

interface Strategy {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  initialValue: number;
  currentValue: number;
  return: number;
  returnPercentage: number;
  color: string;
  bgColor: string;
  borderColor: string;
  isCalculating?: boolean;
  calculationError?: string;
}

interface StrategyCardProps {
  strategy: Strategy;
  isBestStrategy: boolean;
  hasUnsavedChanges?: boolean;
  onRefresh?: () => void;
}

interface DynamicStrategyComparisonProps {
  portfolioValue: number;
  portfolioReturn: number;
  portfolioReturnPercentage: number;
  publishDate: string;
  coinsMentioned: string[];
  coinAllocations?: Record<string, number>;
  videoTitle: string;
  hasUnsavedChanges?: boolean;
  onRefresh?: () => void;
}

const StrategyCard: React.FC<StrategyCardProps> = ({ strategy, isBestStrategy, hasUnsavedChanges, onRefresh }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const showRefresh = strategy.id === 'portfolio' && hasUnsavedChanges && onRefresh;
  
  // Refs for timeout management
  const timeoutRef = React.useRef<number | null>(null);
  
  // Debounce tooltip to prevent flickering
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => setShowTooltip(true), 100);
  };
  
  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowTooltip(false);
  };
  
  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`
      relative p-5 rounded-lg border-2 transition-all duration-200 hover:shadow-lg
      ${isBestStrategy 
        ? 'border-yellow-500/50 bg-yellow-500/5 shadow-lg shadow-yellow-500/10 transform scale-105' 
        : `${strategy.borderColor} ${strategy.bgColor} hover:scale-102`
      }
    `}>
      {/* Best Strategy Badge */}
      {isBestStrategy && (
        <div className="absolute -top-2 -right-2 bg-yellow-500 text-gray-900 text-xs px-2 py-1 rounded-full shadow-lg font-medium">
          🏆 Best Strategy
        </div>
      )}
      
      {/* Strategy Header */}
      <div className="flex items-center mb-4">
        <div className={`p-2 rounded-lg ${strategy.bgColor} ${strategy.color}`}>
          {strategy.icon}
        </div>
        <h3 className="ml-3 text-base font-semibold text-gray-200">{strategy.name}</h3>
        <div 
          className="ml-2 cursor-pointer relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Info className="w-4 h-4 text-gray-400 hover:text-gray-300 transition-colors" />
          {showTooltip && (
            <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 
              bg-gray-900 border border-gray-600 text-white text-xs rounded-lg p-3 w-64 
              shadow-xl mb-2">
              <div className="text-gray-300 leading-relaxed">{strategy.description}</div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 
                w-2 h-2 bg-gray-900 border-r border-b border-gray-600 rotate-45 -mt-1"></div>
            </div>
          )}
        </div>
      </div>
      
      {/* Performance Metrics */}
      <div className="space-y-3 relative">
        {strategy.isCalculating ? (
          <div className="space-y-2">
            <div className="text-sm text-gray-400">Calculating...</div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-primary-500 h-2 rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        ) : strategy.calculationError ? (
          <div className="space-y-2">
            <div className="text-sm text-red-400">Calculation Error</div>
            <div className="text-xs text-gray-500">{strategy.calculationError}</div>
          </div>
        ) : (
          <>
            <div className={`${showRefresh ? 'opacity-30 blur-sm' : ''} transition-all duration-200`}>
              <div className="text-2xl font-bold text-gray-100">
                {isNaN(strategy.currentValue) ? '—' : formatCurrencyFull(strategy.currentValue)}
              </div>
              <div className={`font-medium flex items-center gap-2 ${strategy.color}`}>
                {!isNaN(strategy.return) && (
                  <>
                    {strategy.return > 0 ? (
                      <TrendingUp size={16} />
                    ) : strategy.return < 0 ? (
                      <TrendingDown size={16} />
                    ) : (
                      <DollarSign size={16} />
                    )}
                  </>
                )}
                <span className="text-lg">
                  {isNaN(strategy.return) ? '—' : `${strategy.return >= 0 ? '+' : ''}${formatCurrencyFull(strategy.return)}`}
                </span>
                <span className="text-sm">
                  {isNaN(strategy.returnPercentage) ? '' : `(${strategy.returnPercentage >= 0 ? '+' : ''}${formatPercentage(strategy.returnPercentage)})`}
                </span>
              </div>
            </div>
            
            {/* Refresh overlay */}
            {showRefresh && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <button
                  onClick={onRefresh}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg 
                    font-medium text-sm transition-colors shadow-lg flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Refresh to see updated predictions
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Helper function to format date in human readable format
const formatHumanDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const year = date.getFullYear();
  
  // Add ordinal suffix to day
  const suffix = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  
  return `${day}${suffix(day)} ${month} ${year}`;
};

export const StrategyComparison: React.FC<DynamicStrategyComparisonProps> = ({
  portfolioValue,
  portfolioReturn,
  portfolioReturnPercentage,
  publishDate,
  coinsMentioned,
  coinAllocations,
  videoTitle,
  hasUnsavedChanges = false,
  onRefresh
}) => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);

  // Debug log to confirm component is being used
  console.log('🔥 DynamicStrategyComparison component rendered');
  console.log('🔥 Props received:', { portfolioValue, portfolioReturn, portfolioReturnPercentage, publishDate, coinsMentioned: coinsMentioned?.length, videoTitle, hasUnsavedChanges });

  // Calculate strategies on component mount
  useEffect(() => {
    calculateStrategies();
  }, [publishDate, coinsMentioned]);

  const calculateStrategies = async () => {
    try {
      setLoading(true);
      
      const today = new Date().toISOString().split('T')[0];
      const investmentDate = new Date(publishDate);
      investmentDate.setDate(investmentDate.getDate() + 1); // Invest 1 day after video
      const investmentDateStr = investmentDate.toISOString().split('T')[0];
      
      setDateRange({ start: investmentDateStr, end: today });
      
      console.log(`📊 Calculating strategies from ${investmentDateStr} to ${today}`);
      console.log(`🎬 Video: "${videoTitle}"`);
      console.log(`🪙 Coins mentioned: ${coinsMentioned.join(', ')}`);
      
      const priceService = new AirtablePriceService();
      const initialStrategies: Strategy[] = [];

      // Strategy 1: Hold as Cash (always first, no calculation needed)
      initialStrategies.push({
        id: 'cash',
        name: 'Hold As Cash',
        description: 'Keep your entire investment in cash with no market exposure. Safe but no growth potential.',
        icon: <DollarSign size={18} />,
        initialValue: 1000,
        currentValue: 1000,
        return: 0,
        returnPercentage: 0,
        color: 'text-gray-400',
        bgColor: 'bg-gray-500/10',
        borderColor: 'border-gray-500/30'
      });

      // Strategy 2: Video Portfolio (calculate dynamically)
      const portfolioStrategy: Strategy = {
        id: 'portfolio',
        name: 'Video Portfolio',
        description: `Investing equally across the ${coinsMentioned.length} coins mentioned in "${videoTitle}" on ${formatHumanDate(investmentDateStr)}.`,
        icon: <Coins size={18} />,
        initialValue: 1000,
        currentValue: 1000, // Will be updated
        return: 0,
        returnPercentage: 0,
        color: 'text-gray-400',
        bgColor: 'bg-gray-500/10',
        borderColor: 'border-gray-500/30',
        isCalculating: true
      };
      
      initialStrategies.push(portfolioStrategy);

      // Strategy 3: BTC Only (calculate dynamically)
      const btcStrategy: Strategy = {
        id: 'bitcoin',
        name: 'BTC Only',
        description: `Investing the entire $1,000 solely in Bitcoin on ${formatHumanDate(investmentDateStr)} instead of the mentioned coins.`,
        icon: <Bitcoin size={18} />,
        initialValue: 1000,
        currentValue: 1000,
        return: 0,
        returnPercentage: 0,
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        isCalculating: true
      };
      
      initialStrategies.push(btcStrategy);
      setStrategies(initialStrategies);

      // Calculate Bitcoin strategy asynchronously
      try {
        console.log('💰 Calculating Bitcoin strategy...');
        
        // Get yesterday's date for current price check
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        // First check what symbols are available
        try {
          const availableSymbols = await priceService.getAvailableSymbols();
          console.log('📊 Available symbols in price data:', availableSymbols.slice(0, 20)); // Show first 20
          const bitcoinMatches = availableSymbols.filter(s => s.toLowerCase().includes('bitcoin') || s.toLowerCase().includes('btc'));
          console.log('🪙 Bitcoin-related symbols found:', bitcoinMatches);
        } catch (error) {
          console.warn('⚠️ Could not fetch available symbols:', error);
        }
        
        // Try different Bitcoin symbols in order of preference
        const bitcoinSymbols = ['Bitcoin', 'BTC', 'BITCOIN'];
        let btcPurchasePrice: number | null = null;
        let btcCurrentPriceData: { price: number; date: string } | null = null;
        let usedSymbol = '';
        
        for (const symbol of bitcoinSymbols) {
          console.log(`🔍 Trying Bitcoin symbol: ${symbol}`);
          try {
            btcPurchasePrice = await priceService.getPriceOnDate(symbol, investmentDateStr);
            if (btcPurchasePrice) {
              btcCurrentPriceData = await priceService.getLatestPriceWithDate(symbol);
              if (btcCurrentPriceData) {
                usedSymbol = symbol;
                console.log(`✅ Found Bitcoin data using symbol: ${symbol}`);
                break;
              }
            }
          } catch (error) {
            console.log(`❌ Symbol ${symbol} failed:`, error);
          }
        }
        
        console.log(`💰 Bitcoin price on ${investmentDateStr}: $${btcPurchasePrice} (using ${usedSymbol})`);
        
        if (!btcPurchasePrice) {
          throw new Error(`No Bitcoin price data for ${investmentDateStr} with any symbol`);
        }

        if (!btcCurrentPriceData) {
          throw new Error('No current Bitcoin price data');
        }
        
        console.log(`💰 Bitcoin current price: $${btcCurrentPriceData.price} (${btcCurrentPriceData.date}) (using ${usedSymbol})`);
        
        // Check if the price is current
        const priceDate = new Date(btcCurrentPriceData.date);
        const daysDifference = Math.floor((yesterday.getTime() - priceDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDifference > 1) {
          console.warn(`⚠️ Bitcoin price is stale (${btcCurrentPriceData.date}), ${daysDifference} days old`);
          
          // Update with "-" for return values
          setStrategies(prev => prev.map(strategy => 
            strategy.id === 'bitcoin' 
              ? {
                  ...strategy,
                  currentValue: NaN,
                  return: NaN,
                  returnPercentage: NaN,
                  color: 'text-gray-400',
                  bgColor: 'bg-gray-500/10',
                  borderColor: 'border-gray-500/30',
                  isCalculating: false,
                  calculationError: `Current Bitcoin price unavailable (last update: ${btcCurrentPriceData.date})`
                }
              : strategy
          ));
          return;
        }

        const btcQuantity = 1000 / btcPurchasePrice;
        const btcCurrentValue = btcQuantity * btcCurrentPriceData.price;
        const btcReturn = btcCurrentValue - 1000;
        const btcReturnPercentage = (btcReturn / 1000) * 100;

        console.log('✅ Bitcoin strategy calculated:', {
          purchasePrice: btcPurchasePrice,
          currentPrice: btcCurrentPriceData.price,
          quantity: btcQuantity,
          currentValue: btcCurrentValue,
          return: btcReturn,
          returnPercentage: btcReturnPercentage
        });

        // Update the Bitcoin strategy
        setStrategies(prev => prev.map(strategy => 
          strategy.id === 'bitcoin' 
            ? {
                ...strategy,
                currentValue: btcCurrentValue,
                return: btcReturn,
                returnPercentage: btcReturnPercentage,
                color: btcReturn >= 0 ? 'text-orange-400' : 'text-loss-400',
                bgColor: btcReturn >= 0 ? 'bg-orange-500/10' : 'bg-loss-500/10',
                borderColor: btcReturn >= 0 ? 'border-orange-500/30' : 'border-loss-500/30',
                isCalculating: false
              }
            : strategy
        ));

      } catch (error) {
        console.error('❌ Error calculating Bitcoin strategy:', error);
        
        // Update with error state
        setStrategies(prev => prev.map(strategy => 
          strategy.id === 'bitcoin' 
            ? {
                ...strategy,
                isCalculating: false,
                calculationError: 'Unable to fetch Bitcoin price data'
              }
            : strategy
        ));
      }

      // Calculate Video Portfolio strategy asynchronously
      try {
        console.log('💰 Calculating Video Portfolio strategy...');
        console.log(`🪙 Coins to process: ${coinsMentioned.join(', ')}`);
        
        // Get yesterday's date for current price check
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        console.log(`📅 Checking for current prices as of: ${yesterdayStr}`);
        
        let totalPortfolioValue = 0;
        const defaultAllocationPerCoin = 1000 / coinsMentioned.length; // Equal allocation by default
        let successfulCoins = 0;
        let hasCurrentPrices = true;
        let missingCurrentPriceCoins: string[] = [];
        
        for (const coinName of coinsMentioned) {
          try {
            console.log(`🔍 Processing coin: ${coinName}`);
            
            // Get allocation for this coin (custom or equal)
            const coinAllocation = coinAllocations?.[coinName] 
              ? (coinAllocations[coinName] / 100) * 1000 
              : defaultAllocationPerCoin;
            
            console.log(`📊 ${coinName} allocation: ${((coinAllocation / 1000) * 100).toFixed(2)}% ($${coinAllocation.toFixed(2)})`);
            
            // Get purchase price on investment date
            const purchasePrice = await priceService.getPriceOnDate(coinName, investmentDateStr);
            console.log(`💰 ${coinName} price on ${investmentDateStr}: $${purchasePrice}`);
            
            if (!purchasePrice) {
              console.warn(`⚠️ No purchase price for ${coinName} on ${investmentDateStr}`);
              continue;
            }
            
            // Get current price and verify it's recent
            const currentPriceData = await priceService.getLatestPriceWithDate(coinName);
            
            if (!currentPriceData || !currentPriceData.date) {
              console.warn(`⚠️ No price data for ${coinName}`);
              missingCurrentPriceCoins.push(coinName);
              hasCurrentPrices = false;
              continue;
            }
            
            // Check if the price is from yesterday or today
            const priceDate = new Date(currentPriceData.date);
            const daysDifference = Math.floor((yesterday.getTime() - priceDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysDifference > 1) {
              console.warn(`⚠️ Price for ${coinName} is stale (${currentPriceData.date}), ${daysDifference} days old`);
              missingCurrentPriceCoins.push(coinName);
              hasCurrentPrices = false;
              continue;
            }
            
            const currentPrice = currentPriceData.price;
            console.log(`💰 ${coinName} current price: $${currentPrice} (${currentPriceData.date})`);
            
            // Calculate this coin's contribution to portfolio
            const coinQuantity = coinAllocation / purchasePrice;
            const coinValue = coinQuantity * currentPrice;
            totalPortfolioValue += coinValue;
            successfulCoins++;
            
            console.log(`✅ ${coinName}: $${coinAllocation.toFixed(2)} → $${coinValue.toFixed(2)} (${((coinValue - coinAllocation) / coinAllocation * 100).toFixed(2)}%)`);
            
          } catch (error) {
            console.error(`❌ Error processing coin ${coinName}:`, error);
            missingCurrentPriceCoins.push(coinName);
            hasCurrentPrices = false;
          }
        }
        
        console.log(`📊 Portfolio calculation complete: ${successfulCoins}/${coinsMentioned.length} coins processed`);
        console.log(`💰 Total portfolio value: $${totalPortfolioValue.toFixed(2)}`);
        
        // If we're missing current prices for any coins, show "-" instead
        if (!hasCurrentPrices || successfulCoins === 0) {
          console.warn(`⚠️ Missing current prices for: ${missingCurrentPriceCoins.join(', ')}`);
          
          // Update with "-" for return values
          setStrategies(prev => prev.map(strategy => 
            strategy.id === 'portfolio' 
              ? {
                  ...strategy,
                  currentValue: NaN, // This will display as "-"
                  return: NaN,
                  returnPercentage: NaN,
                  color: 'text-gray-400',
                  bgColor: 'bg-gray-500/10',
                  borderColor: 'border-gray-500/30',
                  isCalculating: false,
                  calculationError: missingCurrentPriceCoins.length > 0 
                    ? `Current price data unavailable for: ${missingCurrentPriceCoins.join(', ')}`
                    : 'No current price data available'
                }
              : strategy
          ));
          return;
        }
        
        if (successfulCoins > 0 && successfulCoins === coinsMentioned.length) {
          // Only calculate returns if we have ALL coins with current prices
          const portfolioReturn = totalPortfolioValue - 1000;
          const portfolioReturnPercentage = (portfolioReturn / 1000) * 100;
          
          console.log('✅ Video Portfolio strategy calculated:', {
            totalValue: totalPortfolioValue,
            return: portfolioReturn,
            returnPercentage: portfolioReturnPercentage,
            successfulCoins: successfulCoins
          });
          
          // Update the portfolio strategy
          setStrategies(prev => prev.map(strategy => 
            strategy.id === 'portfolio' 
              ? {
                  ...strategy,
                  currentValue: totalPortfolioValue,
                  return: portfolioReturn,
                  returnPercentage: portfolioReturnPercentage,
                  color: portfolioReturn >= 0 ? 'text-success-400' : 'text-loss-400',
                  bgColor: portfolioReturn >= 0 ? 'bg-success-500/10' : 'bg-loss-500/10',
                  borderColor: portfolioReturn >= 0 ? 'border-success-500/30' : 'border-loss-500/30',
                  isCalculating: false
                }
              : strategy
          ));
        } else {
          // Update with error state
          setStrategies(prev => prev.map(strategy => 
            strategy.id === 'portfolio' 
              ? {
                  ...strategy,
                  isCalculating: false,
                  calculationError: 'Unable to fetch price data for any mentioned coins'
                }
              : strategy
          ));
        }
        
      } catch (error) {
        console.error('❌ Error calculating Video Portfolio strategy:', error);
        
        // Update with error state
        setStrategies(prev => prev.map(strategy => 
          strategy.id === 'portfolio' 
            ? {
                ...strategy,
                isCalculating: false,
                calculationError: 'Failed to calculate portfolio performance'
              }
            : strategy
        ));
      }

    } catch (error) {
      console.error('❌ Error calculating strategies:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show empty state if no portfolio data
  if (!loading && portfolioValue === 1000 && portfolioReturn === 0) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg">
            <Trophy size={18} />
          </div>
          <h3 className="text-lg font-medium text-gray-200">Investment Strategy Comparison</h3>
        </div>
        <div className="bg-gray-900 border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
          <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <Trophy size={24} className="text-gray-500" />
          </div>
          <div className="text-gray-400 text-sm">No strategy comparison available</div>
        </div>
      </div>
    );
  }

  // Find the winning strategy - only after ALL strategies have completed loading
  const winningStrategy = useMemo(() => {
    // Check if all strategies have finished calculating (success or error)
    const allStrategiesComplete = strategies.every(s => !s.isCalculating);
    
    if (!allStrategiesComplete) {
      // Don't award a winner until all strategies are done loading
      return null;
    }
    
    // Only consider strategies that completed successfully with valid data
    const completedStrategies = strategies.filter(s => 
      !s.isCalculating && 
      !s.calculationError && 
      !isNaN(s.currentValue) && 
      s.currentValue > 0
    );
    
    if (completedStrategies.length === 0) {
      // If no strategies completed successfully, don't show a winner
      return null;
    }
    
    // Find strategy with highest current value, with tie-breaking by return percentage
    return completedStrategies.reduce((prev, current) => {
      const valueDifference = current.currentValue - prev.currentValue;
      const threshold = 0.01; // $0.01 threshold to prevent flickering on tiny differences
      
      // First compare by current value (with threshold)
      if (valueDifference > threshold) return current;
      if (valueDifference < -threshold) return prev;
      
      // Tie-breaker: higher return percentage wins
      const percentageDiff = current.returnPercentage - prev.returnPercentage;
      if (Math.abs(percentageDiff) < 0.001) {
        // If very close, prefer the current winner to reduce flickering
        return prev;
      }
      return current.returnPercentage > prev.returnPercentage ? current : prev;
    }, completedStrategies[0]);
  }, [strategies]);

  // Check if any strategies are still calculating
  const hasCalculatingStrategies = strategies.some(s => s.isCalculating);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg">
          <Trophy size={18} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-gray-200">Investment Strategy Comparison</h3>
            {hasCalculatingStrategies && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-400">Calculating...</span>
              </div>
            )}
          </div>
          {dateRange && (
            <p className="text-sm text-gray-400">
              Performance from {new Date(dateRange.start).toLocaleDateString()} → Present
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {strategies.map((strategy) => (
          <StrategyCard
            key={strategy.id}
            strategy={strategy}
            isBestStrategy={strategy.id === winningStrategy?.id && !strategy.isCalculating && !strategy.calculationError}
            hasUnsavedChanges={hasUnsavedChanges}
            onRefresh={onRefresh}
          />
        ))}
      </div>

      {/* Performance Insights */}
      {winningStrategy && !winningStrategy.isCalculating && !winningStrategy.calculationError && (
        <div className="bg-gray-900 border border-gray-600 rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-4 text-gray-200 flex items-center gap-2">
            <Trophy size={16} className="text-yellow-400" />
            Performance Insights
          </h4>
          <div className="space-y-3 text-gray-300">
            <p className="flex items-start gap-2">
              <span className="text-lg">🏆</span>
              <span>
                <span className="font-bold text-yellow-400">Best Strategy:</span> {winningStrategy.name} 
                {' '}outperformed other strategies with a <span className={`font-bold ${winningStrategy.color}`}>
                  {winningStrategy.returnPercentage >= 0 ? '+' : ''}{formatPercentage(winningStrategy.returnPercentage)} return
                </span>
              </span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-lg">💡</span>
              <span>
                <span className="font-medium text-gray-200">Analysis:</span> This comparison shows what would have happened 
                if you invested $1,000 using different strategies on {dateRange?.start ? formatHumanDate(dateRange.start) : 'the investment date'}
              </span>
            </p>
            <p className="flex items-start gap-2 text-sm text-gray-400">
              <span className="text-base">⚠️</span>
              <span>
                Past performance is not indicative of future results. This simulation is for educational 
                purposes only and does not constitute financial advice.
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};