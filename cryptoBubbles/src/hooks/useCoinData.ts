import { useState, useEffect } from 'react';
import { AirtableClient, CoinMetadata, HistoricalPrice } from '../services/airtableClient';
import { CoinMarketCapClient } from '../services/coinMarketCapClient';
import { CoinData } from '../components/investment/CryptoVideoSimulator';

interface UseCoinDataProps {
  videoDate: string; // Date when the video was published
  coinNames: string[]; // Symbols of coins mentioned in the video (e.g., ["BTC", "ETH"])
}

interface UseCoinDataReturn {
  coinsData: CoinData[];
  loading: boolean;
  error: string | null;
  refreshData: () => void;
}

export const useCoinData = ({ videoDate, coinNames }: UseCoinDataProps): UseCoinDataReturn => {
  const [coinsData, setCoinsData] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculatePriceChange = (initialPrice: number, currentPrice: number | null): number => {
    if (initialPrice === 0 || !currentPrice) return 0;
    return ((currentPrice - initialPrice) / initialPrice) * 100;
  };

  const calculateReturnAmount = (allocation: number, priceChange: number): number => {
    const investmentAmount = 1000 * (allocation / 100);
    return investmentAmount * (priceChange / 100);
  };

  const loadCoinData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 useCoinData: Starting to load coin data');
      console.log('📅 Video Date:', videoDate);
      console.log('🪙 Input coinNames:', coinNames);

      const airtableClient = new AirtableClient();
      const coinMarketCapClient = new CoinMarketCapClient();
      
      // Fetch metadata for all coins
      const coinMetadata = await airtableClient.fetchCoinMetadata();
      console.log('📊 Available coin metadata count:', coinMetadata.length);
      console.log('📊 Sample metadata:', coinMetadata.slice(0, 3).map(c => ({ name: c.name, ticker: c.ticker })));
      
      // coinNames might contain full names OR symbols, so we need to check both
      const coinSymbols: string[] = [];
      const symbolToMetadata: Record<string, CoinMetadata> = {};
      
      for (const coinInput of coinNames) {
        // Try to find by ticker symbol first
        let metadata = coinMetadata.find(coin => 
          coin.ticker.toLowerCase() === coinInput.toLowerCase()
        );
        
        // If not found by ticker, try by name
        if (!metadata) {
          metadata = coinMetadata.find(coin => 
            coin.name.toLowerCase() === coinInput.toLowerCase()
          );
          if (metadata) {
            console.log(`✅ Found by name: ${coinInput} -> ${metadata.ticker}`);
          }
        } else {
          console.log(`✅ Found by ticker: ${coinInput}`);
        }
        
        if (metadata) {
          coinSymbols.push(metadata.ticker);
          symbolToMetadata[coinInput.toUpperCase()] = metadata;
        } else {
          console.warn(`❌ Metadata not found for coin: ${coinInput}`);
        }
      }
      
      // Fetch current prices from CoinMarketCap in a single batch request
      console.log('useCoinData: Input coinNames (symbols):', coinNames);
      console.log('useCoinData: Mapped coinSymbols:', coinSymbols);
      console.log('useCoinData: Symbol to metadata mapping:', Object.keys(symbolToMetadata));
      const currentPrices = await coinMarketCapClient.getCurrentPrices(coinSymbols);
      console.log('useCoinData: Received prices:', currentPrices);
      
      // Process each coin mentioned in the video
      const coinDataPromises = coinNames.map(async (coinInput, index) => {
        try {
          // Find metadata for this coin (could be name or symbol)
          const metadata = symbolToMetadata[coinInput.toUpperCase()];

          if (!metadata) {
            console.warn(`Metadata not found for coin: ${coinInput}`);
            return null;
          }

          // Get price at video date (initial price for investment)
          const initialPrice = await airtableClient.getPriceAtDate(metadata.name, videoDate);
          
          // Get current price from CoinMarketCap
          const currentPrice = currentPrices[metadata.ticker];
          console.log(`useCoinData: ${metadata.name} (${metadata.ticker}) - Initial: $${initialPrice}, Current: $${currentPrice}, Logo: ${metadata.logoUrl}`);

          if (!initialPrice) {
            console.warn(`Initial price data not available for coin: ${metadata.name}`);
            return null;
          }

          // Calculate performance metrics (only if current price is available)
          const priceChange = currentPrice ? calculatePriceChange(initialPrice, currentPrice) : 0;
          const allocation = 100 / coinNames.length; // Equal allocation by default
          const returnAmount = currentPrice ? calculateReturnAmount(allocation, priceChange) : 0;

          return {
            symbol: metadata.ticker,
            name: metadata.name,
            category: metadata.category || 'Unknown',
            isSelected: true, // All coins selected by default
            allocation,
            initialPrice,
            currentPrice,
            priceChange,
            returnAmount,
            logoUrl: metadata.logoUrl
          } as CoinData;

        } catch (error) {
          console.error(`Error processing coin ${coinSymbol}:`, error);
          return null;
        }
      });

      const results = await Promise.all(coinDataPromises);
      const validCoins = results.filter((coin): coin is CoinData => coin !== null);

      setCoinsData(validCoins);
    } catch (error) {
      console.error('Error loading coin data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load coin data');
      
      // Fallback to create basic coin data using the actual mentioned coins
      const fallbackCoins = createFallbackCoinData(coinNames);
      setCoinsData(fallbackCoins);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadCoinData();
  };

  useEffect(() => {
    if (coinNames.length > 0 && videoDate) {
      loadCoinData();
    }
  }, [videoDate, coinNames.join(',')]);

  return {
    coinsData,
    loading,
    error,
    refreshData
  };
};

// Create fallback coin data using the actual mentioned coins
const createFallbackCoinData = (coinNames: string[]): CoinData[] => {
  console.log('🚨 Creating fallback coin data for:', coinNames);
  
  // Filter out null values and create basic coin data
  const validCoinNames = coinNames.filter(coin => coin && coin.trim() !== '');
  const equalAllocation = validCoinNames.length > 0 ? 100 / validCoinNames.length : 100;
  
  return validCoinNames.map((coinSymbol, index) => ({
    symbol: coinSymbol.toUpperCase(),
    name: getCoinName(coinSymbol), // Get a reasonable name for the coin
    category: 'Layer 1', // Default category
    isSelected: true,
    allocation: parseFloat(equalAllocation.toFixed(2)),
    initialPrice: 1000 + (index * 100), // Mock price
    currentPrice: 1000 + (index * 100) + (Math.random() * 200 - 100), // Mock current price with some variance
    priceChange: (Math.random() * 40) - 20, // Random change between -20% and +20%
    returnAmount: (Math.random() * 200) - 100 // Random return
  }));
};

// Helper function to get reasonable coin names
const getCoinName = (symbol: string): string => {
  const coinNames: Record<string, string> = {
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum', 
    'SOL': 'Solana',
    'DOGE': 'Dogecoin',
    'USDT': 'Tether',
    'ADA': 'Cardano',
    'DOT': 'Polkadot',
    'MATIC': 'Polygon',
    'AVAX': 'Avalanche',
    'LINK': 'Chainlink',
    'UNI': 'Uniswap',
    'MKR': 'Maker',
    'FXS': 'Frax Share',
    'ATH': 'Aethir',
    'ASF': 'ASF Token',
    'ZEUS': 'Zeus Network',
    'CURVE': 'Curve DAO',
    'ANON': 'Anon',
    'FAI': 'FAI',
    'COOKIE': 'Cookie',
    'TAO': 'Bittensor',
    'SPX': 'SPX'
  };
  
  return coinNames[symbol.toUpperCase()] || `${symbol.toUpperCase()} Token`;
};

// Original fallback mock data (kept for reference)
const getMockCoinData = (): CoinData[] => [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    category: 'Layer 1',
    isSelected: true,
    allocation: 16.67,
    initialPrice: 45000,
    currentPrice: 52000,
    priceChange: 15.56,
    returnAmount: 26.00
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    category: 'Layer 1',
    isSelected: true,
    allocation: 16.67,
    initialPrice: 3000,
    currentPrice: 3450,
    priceChange: 15.00,
    returnAmount: 25.00
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    category: 'Layer 1',
    isSelected: true,
    allocation: 16.67,
    initialPrice: 120,
    currentPrice: 145,
    priceChange: 20.83,
    returnAmount: 34.72
  },
  {
    symbol: 'ADA',
    name: 'Cardano',
    category: 'Layer 1',
    isSelected: true,
    allocation: 16.67,
    initialPrice: 0.5,
    currentPrice: 0.62,
    priceChange: 24.00,
    returnAmount: 40.00
  },
  {
    symbol: 'MATIC',
    name: 'Polygon',
    category: 'Layer 2',
    isSelected: true,
    allocation: 16.67,
    initialPrice: 0.8,
    currentPrice: 0.95,
    priceChange: 18.75,
    returnAmount: 31.25
  },
  {
    symbol: 'DOT',
    name: 'Polkadot',
    category: 'Layer 0',
    isSelected: true,
    allocation: 16.65,
    initialPrice: 7.2,
    currentPrice: 8.1,
    priceChange: 12.50,
    returnAmount: 20.81
  }
];