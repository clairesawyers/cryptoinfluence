import React, { useState } from 'react';
import { Trophy, TrendingUp, TrendingDown, DollarSign, Coins, Bitcoin, Info } from 'lucide-react';
import { formatCurrencyFull, formatPercentage } from '../../utils/formatting';

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
}

interface StrategyCardProps {
  strategy: Strategy;
  isBestStrategy: boolean;
}

interface StrategyComparisonProps {
  portfolioValue: number;
  portfolioReturn: number;
  portfolioReturnPercentage: number;
}

const StrategyCard: React.FC<StrategyCardProps> = ({ strategy, isBestStrategy }) => {
  const [showTooltip, setShowTooltip] = useState(false);

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
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
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
      <div className="space-y-3">
        <div className="text-2xl font-bold text-gray-100">
          {formatCurrencyFull(strategy.currentValue)}
        </div>
        <div className={`font-medium flex items-center gap-2 ${strategy.color}`}>
          {strategy.return > 0 ? (
            <TrendingUp size={16} />
          ) : strategy.return < 0 ? (
            <TrendingDown size={16} />
          ) : (
            <DollarSign size={16} />
          )}
          <span className="text-lg">
            {strategy.return >= 0 ? '+' : ''}{formatCurrencyFull(strategy.return)}
          </span>
          <span className="text-sm">
            ({strategy.returnPercentage >= 0 ? '+' : ''}{formatPercentage(strategy.returnPercentage)})
          </span>
        </div>
      </div>
    </div>
  );
};

export const StrategyComparison: React.FC<StrategyComparisonProps> = ({
  portfolioValue,
  portfolioReturn,
  portfolioReturnPercentage
}) => {
  // Log the data received for strategy comparison
  console.log('🏆 === STRATEGY COMPARISON DATA ===');
  console.log('💰 Portfolio Value:', portfolioValue);
  console.log('📈 Portfolio Return:', portfolioReturn);
  console.log('📊 Portfolio Return %:', portfolioReturnPercentage);
  console.log('🏆 === END STRATEGY COMPARISON DATA ===\n');

  // Show empty state if no portfolio data
  if (portfolioValue === 1000 && portfolioReturn === 0) {
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
  const strategies: Strategy[] = [
    {
      id: 'nothing',
      name: 'Hold As Cash',
      description: 'Keeping your entire investment in cash with no market exposure. Safe but no growth potential.',
      icon: <DollarSign size={18} />,
      initialValue: 1000,
      currentValue: 1000,
      return: 0,
      returnPercentage: 0,
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/10',
      borderColor: 'border-gray-500/30'
    },
    {
      id: 'portfolio',
      name: 'Mentioned Coins Portfolio',
      description: 'Investing equally across coins mentioned in the crypto influencer video at the time of publication.',
      icon: <Coins size={18} />,
      initialValue: 1000,
      currentValue: portfolioValue,
      return: portfolioReturn,
      returnPercentage: portfolioReturnPercentage,
      color: portfolioReturn >= 0 ? 'text-success-400' : 'text-loss-400',
      bgColor: portfolioReturn >= 0 ? 'bg-success-500/10' : 'bg-loss-500/10',
      borderColor: portfolioReturn >= 0 ? 'border-success-500/30' : 'border-loss-500/30'
    },
    {
      id: 'bitcoin',
      name: 'Hold as Bitcoin',
      description: 'Investing the entire amount solely in Bitcoin at the time of the video publication. NOTE: This is currently using mock data - real Bitcoin performance calculation not yet implemented.',
      icon: <Bitcoin size={18} />,
      initialValue: 1000,
      currentValue: 1156, // MOCK DATA - 15.56% return
      return: 156, // MOCK DATA
      returnPercentage: 15.56, // MOCK DATA
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30'
    }
  ];

  // Find the winning strategy
  const winningStrategy = strategies.reduce((prev, current) => 
    current.currentValue > prev.currentValue ? current : prev
  );

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg">
          <Trophy size={18} />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-200">Investment Strategy Comparison</h3>
          <p className="text-sm text-gray-400">Compare different investment approaches with detailed insights</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {strategies.map((strategy) => (
          <StrategyCard
            key={strategy.id}
            strategy={strategy}
            isBestStrategy={strategy.id === winningStrategy.id}
          />
        ))}
      </div>

      {/* Performance Insights */}
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
              outperformed other strategies with a <span className={`font-bold ${winningStrategy.color}`}>
                {winningStrategy.returnPercentage >= 0 ? '+' : ''}{formatPercentage(winningStrategy.returnPercentage)} return
              </span>
            </span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-lg">💡</span>
            <span>
              <span className="font-medium text-gray-200">Methodology:</span> Equal investment across coins 
              mentioned in the crypto influencer video, invested 1 day after publication
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
    </div>
  );
};