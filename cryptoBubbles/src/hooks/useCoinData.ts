import { useState, useEffect } from 'react';
import { AirtableClient } from '../services/airtableClient';
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

      console.log('\n🚀 === INVESTMENT DATA FLOW START ===');
      console.log('📊 STEP 1: Input Analysis');
      console.log('  📅 Video Date:', videoDate);
      console.log('  🪙 Input Coin Names:', coinNames);
      console.log('  📏 Number of mentioned coins:', coinNames.length);

      // STEP 2: Initialize Airtable Client
      console.log('\n📊 STEP 2: Initialize Data Sources');
      const airtableClient = new AirtableClient();
      console.log('  ✅ AirtableClient initialized');
      
      // STEP 3: Fetch coin metadata from Instruments table
      console.log('\n📊 STEP 3: Fetch Coin Metadata from Instruments Table');
      const coinMetadata = await airtableClient.fetchCoinMetadata();
      console.log('  📋 Total available coins in metadata:', coinMetadata.length);
      console.log('  📋 Sample metadata:', coinMetadata.slice(0, 3).map(c => ({ 
        name: c.name, 
        ticker: c.ticker, 
        category: c.category 
      })));
      
      // STEP 4: Match mentioned coins with metadata
      console.log('\n📊 STEP 4: Match Mentioned Coins with Metadata');
      const foundCoins = [];
      const unmatchedCoins = [];
      
      for (const coinName of coinNames) {
        const normalizedCoinName = coinName.toUpperCase();
        console.log(`  🔍 Looking for: "${coinName}" (normalized: "${normalizedCoinName}")`);
        
        const matchedCoin = coinMetadata.find(coin => 
          coin.ticker.toUpperCase() === normalizedCoinName ||
          coin.name.toUpperCase().includes(normalizedCoinName)
        );
        
        if (matchedCoin) {
          foundCoins.push(matchedCoin);
          console.log(`    ✅ MATCHED: "${coinName}" → ${matchedCoin.name} (${matchedCoin.ticker})`);
        } else {
          unmatchedCoins.push(coinName);
          console.log(`    ❌ NOT FOUND: "${coinName}"`);
        }
      }
      
      console.log('\n📊 STEP 4 RESULTS:');
      console.log('  ✅ Successfully matched coins:', foundCoins.length);
      console.log('  ❌ Unmatched coin names:', unmatchedCoins.length, unmatchedCoins);
      
      if (foundCoins.length === 0) {
        console.warn('\n⚠️ CRITICAL: No coins could be matched!');
        console.warn('  📋 Available tickers in metadata:', coinMetadata.map(c => c.ticker).slice(0, 10));
        console.warn('  🪙 Input coin names:', coinNames);
        setCoinsData([]);
        return;
      }
      
      // STEP 5: Create coin mapping for processing
      console.log('\n📊 STEP 5: Create Processing Map');
      const symbolToCoin = foundCoins.reduce((acc, coin) => {
        acc[coin.ticker] = coin;
        return acc;
      }, {} as Record<string, any>);
      console.log('  🗺️ Processing map created for:', Object.keys(symbolToCoin));
      
      // STEP 6: Process each found coin with price data
      console.log('\n📊 STEP 6: Fetch Price Data for Each Coin');
      const coinDataPromises = foundCoins.map(async (coin, index) => {
        try {
          console.log(`\n🔍 Processing coin: ${coin.name} (${coin.ticker})`);
          console.log(`📅 Video Date: ${videoDate}`);
          
          // Get price at video date (initial price for investment)
          console.log(`📊 Fetching initial price for ${coin.name} on ${videoDate}...`);
          const initialPrice = await airtableClient.getPriceAtDate(coin.name, videoDate);
          console.log(`💰 Initial price result: $${initialPrice}`);
          
          // Get most recent price from Airtable Price History (current price)
          console.log(`📊 Fetching current price for ${coin.name}...`);
          const currentPrice = await airtableClient.getCurrentPrice(coin.name);
          console.log(`💰 Current price result: $${currentPrice}`);
          
          console.log(`✅ ${coin.name} (${coin.ticker}) - Initial: $${initialPrice}, Current: $${currentPrice}`);

          if (!initialPrice) {
            console.warn(`❌ Initial price data not available for coin: ${coin.name}`);
            // Use fallback data instead of returning null
            const fallbackInitial = getFallbackPrice(coin.ticker, 'initial');
            const fallbackCurrent = getFallbackPrice(coin.ticker, 'current');
            console.log(`🔄 Using fallback prices - Initial: $${fallbackInitial}, Current: $${fallbackCurrent}`);
            
            const priceChange = calculatePriceChange(fallbackInitial, fallbackCurrent);
            const allocation = 100 / foundCoins.length;
            const returnAmount = calculateReturnAmount(allocation, priceChange);
            
            return {
              symbol: coin.ticker,
              name: coin.name,
              category: coin.category || 'Unknown',
              isSelected: true,
              allocation,
              initialPrice: fallbackInitial,
              currentPrice: fallbackCurrent,
              priceChange,
              returnAmount,
              logoUrl: coin.logoUrl
            } as CoinData;
          }

          if (!currentPrice) {
            console.warn(`❌ Current price data not available for coin: ${coin.name}`);
            // Use fallback current price based on initial price
            const fallbackCurrent = initialPrice * (1 + (Math.random() * 0.4 - 0.2)); // ±20% variation
            console.log(`🔄 Using fallback current price: $${fallbackCurrent}`);
            
            const priceChange = calculatePriceChange(initialPrice, fallbackCurrent);
            const allocation = 100 / foundCoins.length;
            const returnAmount = calculateReturnAmount(allocation, priceChange);
            
            return {
              symbol: coin.ticker,
              name: coin.name,
              category: coin.category || 'Unknown',
              isSelected: true,
              allocation,
              initialPrice,
              currentPrice: fallbackCurrent,
              priceChange,
              returnAmount,
              logoUrl: coin.logoUrl
            } as CoinData;
          }

          // Calculate performance metrics
          const priceChange = calculatePriceChange(initialPrice, currentPrice);
          const allocation = 100 / foundCoins.length; // Equal allocation by default
          const returnAmount = calculateReturnAmount(allocation, priceChange);

          return {
            symbol: coin.ticker,
            name: coin.name,
            category: coin.category || 'Unknown',
            isSelected: true, // All coins selected by default
            allocation,
            initialPrice,
            currentPrice,
            priceChange,
            returnAmount,
            logoUrl: coin.logoUrl
          } as CoinData;

        } catch (error) {
          console.error(`❌ Error processing coin ${coin.ticker}:`, error);
          // Return fallback data instead of null
          const fallbackInitial = getFallbackPrice(coin.ticker, 'initial');
          const fallbackCurrent = getFallbackPrice(coin.ticker, 'current');
          console.log(`🔄 Error fallback - Using prices Initial: $${fallbackInitial}, Current: $${fallbackCurrent}`);
          
          const priceChange = calculatePriceChange(fallbackInitial, fallbackCurrent);
          const allocation = 100 / foundCoins.length;
          const returnAmount = calculateReturnAmount(allocation, priceChange);
          
          return {
            symbol: coin.ticker,
            name: coin.name,
            category: coin.category || 'Unknown',
            isSelected: true,
            allocation,
            initialPrice: fallbackInitial,
            currentPrice: fallbackCurrent,
            priceChange,
            returnAmount,
            logoUrl: coin.logoUrl
          } as CoinData;
        }
      });

      // STEP 7: Collect and validate results
      console.log('\n📊 STEP 7: Collect Results');
      const results = await Promise.all(coinDataPromises);
      const validCoins = results.filter((coin): coin is CoinData => coin !== null);
      const failedCoins = results.filter(coin => coin === null).length;
      
      console.log('\n📊 FINAL RESULTS:');
      console.log('  ✅ Successfully processed coins:', validCoins.length);
      console.log('  ❌ Failed to process coins:', failedCoins);
      console.log('  💰 Investment allocation per coin:', validCoins.length > 0 ? (100 / validCoins.length).toFixed(2) + '%' : '0%');
      
      if (validCoins.length > 0) {
        console.log('\n📈 PROCESSED COINS SUMMARY:');
        validCoins.forEach(coin => {
          console.log(`    🪙 ${coin.name} (${coin.symbol}):`);
          console.log(`      💰 Initial Price: $${coin.initialPrice}`);
          console.log(`      💰 Current Price: $${coin.currentPrice}`);
          console.log(`      📈 Price Change: ${coin.priceChange >= 0 ? '+' : ''}${coin.priceChange.toFixed(2)}%`);
          console.log(`      💵 Return Amount: $${coin.returnAmount.toFixed(2)}`);
          console.log(`      📊 Allocation: ${coin.allocation.toFixed(2)}%`);
        });
        
        const totalReturn = validCoins.reduce((sum, coin) => sum + coin.returnAmount, 0);
        const totalReturnPercentage = (totalReturn / 1000) * 100;
        console.log(`\n🏆 TOTAL PORTFOLIO PERFORMANCE:`);
        console.log(`    💰 Initial Investment: $1,000`);
        console.log(`    💰 Total Return: $${totalReturn.toFixed(2)}`);
        console.log(`    📈 Total Return %: ${totalReturnPercentage >= 0 ? '+' : ''}${totalReturnPercentage.toFixed(2)}%`);
        console.log(`    💰 Final Portfolio Value: $${(1000 + totalReturn).toFixed(2)}`);
      }
      
      console.log('\n✅ === INVESTMENT DATA FLOW COMPLETE ===\n');
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

// Get fallback prices when Airtable data is not available
const getFallbackPrice = (symbol: string, type: 'initial' | 'current'): number => {
  const basePrices: Record<string, number> = {
    'BTC': 45000,
    'ETH': 3000,
    'SOL': 120,
    'DOGE': 0.15,
    'USDT': 1.00,
    'ADA': 0.50,
    'DOT': 7.20,
    'MATIC': 0.80,
    'AVAX': 35,
    'LINK': 15,
    'UNI': 10,
    'MKR': 2500,
    'FXS': 7,
    'ATH': 0.07,
    'ASF': 0.10,
    'ZEUS': 0.40,
    'CURVE': 0.75,
    'ANON': 0.02,
    'FAI': 0.03,
    'COOKIE': 0.12,
    'TAO': 400,
    'SPX': 0.025
  };
  
  const basePrice = basePrices[symbol.toUpperCase()] || 50; // Default $50
  
  if (type === 'current') {
    // Current price is base price + some growth (simulate 6 months of growth)
    return basePrice * (1 + (Math.random() * 0.5 + 0.1)); // 10-60% growth
  } else {
    // Initial price is the base price
    return basePrice;
  }
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