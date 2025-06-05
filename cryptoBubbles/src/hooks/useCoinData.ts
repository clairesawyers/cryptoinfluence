import { useState, useEffect } from 'react';
import { AirtableClient, CoinMetadata, HistoricalPrice } from '../services/airtableClient';
import { CoinData } from '../components/investment/CryptoVideoSimulator';

interface UseCoinDataProps {
  videoDate: string; // Date when the video was published
  coinNames: string[]; // Names of coins mentioned in the video
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

  const calculatePriceChange = (initialPrice: number, currentPrice: number): number => {
    if (initialPrice === 0) return 0;
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

      const client = new AirtableClient();
      
      // Fetch metadata for all coins
      const coinMetadata = await client.fetchCoinMetadata();
      
      // Process each coin mentioned in the video
      const coinDataPromises = coinNames.map(async (coinName, index) => {
        try {
          // Find metadata for this coin
          const metadata = coinMetadata.find(coin => 
            coin.name.toLowerCase() === coinName.toLowerCase() ||
            coin.ticker.toLowerCase() === coinName.toLowerCase()
          );

          if (!metadata) {
            console.warn(`Metadata not found for coin: ${coinName}`);
            return null;
          }

          // Get price at video date (initial price for investment)
          const initialPrice = await client.getPriceAtDate(metadata.name, videoDate);
          
          // Get current price
          const currentPrice = await client.getCurrentPrice(metadata.name);

          if (!initialPrice || !currentPrice) {
            console.warn(`Price data not available for coin: ${metadata.name}`);
            return null;
          }

          // Calculate performance metrics
          const priceChange = calculatePriceChange(initialPrice, currentPrice);
          const allocation = 100 / coinNames.length; // Equal allocation by default
          const returnAmount = calculateReturnAmount(allocation, priceChange);

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
          } as CoinData & { logoUrl: string };

        } catch (error) {
          console.error(`Error processing coin ${coinName}:`, error);
          return null;
        }
      });

      const results = await Promise.all(coinDataPromises);
      const validCoins = results.filter((coin): coin is CoinData & { logoUrl: string } => coin !== null);

      setCoinsData(validCoins);
    } catch (error) {
      console.error('Error loading coin data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load coin data');
      
      // Fallback to mock data if real data fails
      setCoinsData(getMockCoinData());
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

// Fallback mock data for development/error scenarios
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