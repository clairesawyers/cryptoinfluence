import React, { useState } from 'react';
import { useInvestmentSimulation } from '../../hooks/useInvestmentSimulation';
import { InstrumentsService } from '../../services/instrumentsService';
import { AirtablePriceService } from '../../services/airtablePriceService';
import { formatCurrencyFull, formatPercentage } from '../../utils/formatting';
import { Play, Loader, AlertCircle, CheckCircle, TrendingUp, TrendingDown, Settings } from 'lucide-react';
import { EnvDebug } from '../EnvDebug';

interface LiveDataSimulatorProps {
  coinMentions: string[];
  videoTitle: string;
  publishDate: string;
  channelName?: string;
}

export const LiveDataSimulator: React.FC<LiveDataSimulatorProps> = ({
  coinMentions,
  videoTitle,
  publishDate,
  channelName = 'Crypto Channel'
}) => {
  const [testMode, setTestMode] = useState(false);
  const [testResults, setTestResults] = useState<{
    instruments: any[];
    prices: any[];
    errors: string[];
  }>({ instruments: [], prices: [], errors: [] });

  const {
    simulation,
    strategies,
    loading,
    error,
    runSimulation,
    clearSimulation
  } = useInvestmentSimulation();

  const handleRunSimulation = () => {
    console.log('🎯 LiveDataSimulator: Running simulation with:');
    console.log('  - coinMentions:', coinMentions);
    console.log('  - coinMentions type:', typeof coinMentions);
    console.log('  - coinMentions length:', coinMentions?.length);
    console.log('  - publishDate:', publishDate);
    console.log('  - videoTitle:', videoTitle);
    
    runSimulation(
      coinMentions,
      publishDate,
      1000, // $1000 investment
      24,   // 24 hour delay
      videoTitle,
      channelName
    );
  };

  const handleTestServices = async () => {
    setTestMode(true);
    const results = { instruments: [], prices: [], errors: [] };
    
    try {
      console.log('🧪 Testing Instruments Service...');
      
      // Test getting active instruments
      try {
        const instrumentsService = new InstrumentsService();
        const activeInstruments = await instrumentsService.getActiveInstruments();
        results.instruments = activeInstruments.slice(0, 5); // First 5 for display
        console.log('✅ Instruments service working');
      } catch (err) {
        results.errors.push(`Instruments Service: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }

      // Test finding specific coins
      try {
        const instrumentsService = new InstrumentsService();
        const foundCoins = await instrumentsService.findInstruments(coinMentions);
        console.log('✅ Coin finding working:', foundCoins.length, 'found');
      } catch (err) {
        results.errors.push(`Coin Finding: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }

      console.log('🧪 Testing Price Service...');
      const priceService = new AirtablePriceService();
      
      // Test getting latest prices
      try {
        const symbols = ['BTC', 'ETH', 'SOL'];
        const prices = [];
        for (const symbol of symbols) {
          const price = await priceService.getLatestPrice(symbol);
          if (price) {
            prices.push({ symbol, price, type: 'latest' });
          }
        }
        results.prices = prices;
        console.log('✅ Price service working');
      } catch (err) {
        results.errors.push(`Price Service: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }

    } catch (err) {
      results.errors.push(`General Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    
    setTestResults(results);
    setTestMode(false);
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-100">Live Data Investment Simulator</h3>
          <p className="text-sm text-gray-400 mt-1">
            Using new live data services with real Airtable integration
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleTestServices}
            disabled={testMode}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {testMode ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Test Services
          </button>
          <button
            onClick={handleRunSimulation}
            disabled={loading || coinMentions.length === 0}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Run Simulation
          </button>
        </div>
      </div>

      {/* Input Information */}
      <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Simulation Parameters</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Video:</span>
            <span className="text-gray-200 ml-2">{videoTitle}</span>
          </div>
          <div>
            <span className="text-gray-400">Channel:</span>
            <span className="text-gray-200 ml-2">{channelName}</span>
          </div>
          <div>
            <span className="text-gray-400">Publish Date:</span>
            <span className="text-gray-200 ml-2">{publishDate}</span>
          </div>
          <div>
            <span className="text-gray-400">Coins Mentioned:</span>
            <span className="text-gray-200 ml-2">{coinMentions.join(', ')}</span>
          </div>
        </div>
      </div>

      {/* Test Results */}
      {(testResults.instruments.length > 0 || testResults.prices.length > 0 || testResults.errors.length > 0) && (
        <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Service Test Results</h4>
          
          {testResults.errors.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-400 font-medium">Errors</span>
              </div>
              {testResults.errors.map((error, index) => (
                <div key={index} className="text-red-300 text-xs bg-red-900/20 p-2 rounded mb-1">
                  {error}
                </div>
              ))}
            </div>
          )}

          {testResults.instruments.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-medium">Instruments Found</span>
              </div>
              <div className="text-xs text-gray-300 space-y-1">
                {testResults.instruments.map((inst, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{inst.symbol}</span>
                    <span className="text-gray-400">{inst.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {testResults.prices.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-medium">Prices Retrieved</span>
              </div>
              <div className="text-xs text-gray-300 space-y-1">
                {testResults.prices.map((price, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{price.symbol}</span>
                    <span className="text-gray-400">${price.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 font-medium">Simulation Error</span>
          </div>
          <p className="text-red-300 text-sm">{error}</p>
          
          {/* Help text */}
          <div className="mt-3 text-xs text-red-200 bg-red-950/50 p-3 rounded">
            <div className="font-medium mb-1">Common Issues:</div>
            <ul className="list-disc list-inside space-y-1">
              <li>Instruments not found: Check if coin symbols exist in your Instruments table</li>
              <li>Price data missing: Verify price history exists for the investment date</li>
              <li>API configuration: Ensure all environment variables are set correctly</li>
            </ul>
          </div>
        </div>
      )}

      {/* Simulation Results */}
      {simulation && (
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-200 mb-3">Investment Results</h4>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-100">
                  {formatCurrencyFull(simulation.totalValue)}
                </div>
                <div className="text-sm text-gray-400">Current Value</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${
                  simulation.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {simulation.totalReturn >= 0 ? 
                    <TrendingUp className="w-5 h-5" /> : 
                    <TrendingDown className="w-5 h-5" />
                  }
                  {formatCurrencyFull(Math.abs(simulation.totalReturn))}
                </div>
                <div className="text-sm text-gray-400">Total Return</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  simulation.totalReturnPercentage >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {simulation.totalReturnPercentage >= 0 ? '+' : ''}
                  {formatPercentage(simulation.totalReturnPercentage)}
                </div>
                <div className="text-sm text-gray-400">Return %</div>
              </div>
            </div>

            {/* Positions */}
            <div>
              <h5 className="font-medium text-gray-300 mb-2">Positions</h5>
              <div className="space-y-2">
                {simulation.positions.map((position, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-800 p-3 rounded">
                    <div className="flex-1">
                      <div className="font-medium text-gray-200">{position.name}</div>
                      <div className="text-xs text-gray-400">{position.symbol}</div>
                    </div>
                    <div className="text-center px-4">
                      <div className="font-medium text-gray-200">
                        {formatCurrencyFull((position.allocation / 100) * simulation.investmentAmount)}
                      </div>
                      <div className="text-xs text-gray-400">Initial Investment</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-200">
                        {formatCurrencyFull(position.value)}
                      </div>
                      <div className={`text-xs ${
                        position.returnPercentage >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {position.returnPercentage >= 0 ? '+' : ''}
                        {formatPercentage(position.returnPercentage)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Date range information */}
              <div className="mt-3 text-xs text-gray-500 text-center">
                Hypothetical investment made {simulation.investmentDate} and remains open as of today, {new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}
              </div>
              {/* Price data disclaimer */}
              <div className="mt-1 text-xs text-gray-500 text-center">
                *As at day close {(() => {
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  return yesterday.toLocaleDateString('en-GB').replace(/\//g, '-');
                })()}
              </div>
              {/* CMC Data Timestamp Disclaimer */}
              <div className="mt-2 text-xs text-gray-500 text-center">
                Current prices from CoinMarketCap API • Data may be delayed up to 5 minutes
              </div>
            </div>
          </div>

          {/* Strategy Comparison */}
          {strategies.length > 0 && (
            <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-200 mb-3">Strategy Comparison</h4>
              <div className="grid grid-cols-3 gap-4">
                {strategies.map((strategy) => (
                  <div key={strategy.id} className="bg-gray-800 p-3 rounded">
                    <div className="font-medium text-gray-200 mb-1">{strategy.name}</div>
                    <div className="text-lg font-bold text-gray-100">
                      {formatCurrencyFull(strategy.currentValue)}
                    </div>
                    <div className={`text-sm ${
                      strategy.returnPercentage >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {strategy.returnPercentage >= 0 ? '+' : ''}
                      {formatPercentage(strategy.returnPercentage)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Environment Debug in Development */}
      {import.meta.env.DEV && <EnvDebug />}
    </div>
  );
};