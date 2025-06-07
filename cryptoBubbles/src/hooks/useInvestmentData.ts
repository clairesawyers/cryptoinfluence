import { useState, useEffect } from 'react';
import { AirtableClient } from '../services/airtableClient';
import { CoinData, InvestmentDataPoint } from '../components/investment/CryptoVideoSimulator';

interface UseInvestmentDataProps {
  coinsData: CoinData[];
  videoDate: string;
  investmentDelay: '1hour' | '1day' | '1week';
}

interface UseInvestmentDataReturn {
  investmentData: InvestmentDataPoint[];
  loading: boolean;
  error: string | null;
}

export const useInvestmentData = ({ 
  coinsData, 
  videoDate, 
  investmentDelay 
}: UseInvestmentDataProps): UseInvestmentDataReturn => {
  const [investmentData, setInvestmentData] = useState<InvestmentDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateInvestmentDate = (videoDate: string, delay: string): string => {
    const date = new Date(videoDate);
    
    switch (delay) {
      case '1hour':
        date.setHours(date.getHours() + 1);
        break;
      case '1day':
        date.setDate(date.getDate() + 1);
        break;
      case '1week':
        date.setDate(date.getDate() + 7);
        break;
    }
    
    return date.toISOString().split('T')[0];
  };

  const generateDateRange = (startDate: string, endDate: string): string[] => {
    const dates = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  const loadInvestmentData = async () => {
    if (coinsData.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      console.log('\n📈 === INVESTMENT TIMELINE CALCULATION START ===');
      console.log('📊 STEP 1: Investment Parameters');
      console.log('  💰 Initial Investment: $1,000');
      console.log('  📅 Video Publish Date:', videoDate);
      console.log('  ⏰ Investment Delay:', investmentDelay);
      console.log('  🪙 Number of selected coins:', coinsData.filter(c => c.isSelected).length);

      const airtableClient = new AirtableClient();
      
      // STEP 2: Calculate investment timeline
      console.log('\n📊 STEP 2: Calculate Investment Timeline');
      const investmentDate = calculateInvestmentDate(videoDate, investmentDelay);
      const today = new Date().toISOString().split('T')[0];
      console.log('  📅 Calculated Investment Date:', investmentDate);
      console.log('  📅 Current Date (End Date):', today);
      
      // STEP 3: Generate date range for portfolio tracking
      console.log('\n📊 STEP 3: Generate Portfolio Tracking Dates');
      const dateRange = generateDateRange(investmentDate, today);
      console.log('  📈 Total days in investment period:', dateRange.length);
      
      // Sample dates to avoid too many API calls (e.g., every 7 days)
      const sampleDates = dateRange.filter((_, index) => index % 7 === 0 || index === dateRange.length - 1);
      console.log('  📍 Sample dates for calculation:', sampleDates.length);
      console.log('  📅 Sample dates:', sampleDates);
      
      // STEP 4: Display selected coins and their allocations
      console.log('\n📊 STEP 4: Selected Coins Portfolio Breakdown');
      const selectedCoins = coinsData.filter(c => c.isSelected);
      selectedCoins.forEach((coin, index) => {
        console.log(`  ${index + 1}. 🪙 ${coin.name} (${coin.symbol}):`);
        console.log(`     📊 Allocation: ${coin.allocation.toFixed(2)}%`);
        console.log(`     💰 Initial Price: $${coin.initialPrice}`);
        console.log(`     💰 Current Price: $${coin.currentPrice}`);
        console.log(`     📈 Price Change: ${coin.priceChange >= 0 ? '+' : ''}${coin.priceChange.toFixed(2)}%`);
        console.log(`     💵 Allocation Amount: $${(1000 * coin.allocation / 100).toFixed(2)}`);
      });

      // STEP 5: Calculate portfolio value over time
      console.log('\n📊 STEP 5: Calculate Portfolio Performance Over Time');
      const portfolioValuePromises = sampleDates.map(async (date, index) => {
        let totalValue = 0;
        console.log(`\n📅 === Calculating portfolio value for ${date} (Day ${index + 1}/${sampleDates.length}) ===`);
        
        // Calculate portfolio value for each selected coin
        for (const coin of coinsData.filter(c => c.isSelected)) {
          try {
            const priceAtDate = await airtableClient.getPriceAtDate(coin.name, date);
            if (priceAtDate && coin.initialPrice) {
              const allocationAmount = 1000 * (coin.allocation / 100);
              const coinQuantity = allocationAmount / coin.initialPrice;
              const coinValue = coinQuantity * priceAtDate;
              totalValue += coinValue;
              
              console.log(`  🪙 ${coin.name} (${coin.symbol}):`);
              console.log(`    - Allocation: ${coin.allocation}% ($${allocationAmount})`);
              console.log(`    - Initial Price: $${coin.initialPrice}`);
              console.log(`    - Price on ${date}: $${priceAtDate}`);
              console.log(`    - Quantity: ${coinQuantity.toFixed(6)}`);
              console.log(`    - Value: $${coinValue.toFixed(2)}`);
            } else {
              console.warn(`  ⚠️ No price data for ${coin.name} on ${date}`);
            }
          } catch (error) {
            console.warn(`  ❌ Failed to get price for ${coin.name} on ${date}:`, error);
          }
        }

        // Calculate change from initial investment
        const change = ((totalValue - 1000) / 1000) * 100;
        
        console.log(`  💰 Total Portfolio Value: $${totalValue.toFixed(2)}`);
        console.log(`  📈 Change: ${change >= 0 ? '+' : ''}${change.toFixed(2)}%`);
        
        return {
          date: formatDateForDisplay(date, index),
          value: Math.round(totalValue),
          change: Math.round(change * 100) / 100
        };
      });

      const results = await Promise.all(portfolioValuePromises);
      
      // Filter out any failed calculations and ensure we have at least initial and current
      const validResults = results.filter(result => result.value > 0);
      
      console.log('\n📆 STEP 6: Final Investment Timeline Results');
      console.log('  📍 Total valid data points:', validResults.length);
      
      if (validResults.length === 0) {
        console.error('  ❌ CRITICAL: No valid investment data could be calculated');
        console.error('  📍 This means price data was not available for any tracking dates');
        throw new Error('No valid investment data could be calculated');
      }
      
      console.log('\n📈 PORTFOLIO TIMELINE PERFORMANCE:');
      validResults.forEach((result, index) => {
        const isFirst = index === 0;
        const isLast = index === validResults.length - 1;
        const icon = isFirst ? '🟢' : isLast ? '🏁' : '🟡';
        console.log(`  ${icon} ${result.date}: $${result.value} (${result.change >= 0 ? '+' : ''}${result.change}%)`);
      });
      
      const finalValue = validResults[validResults.length - 1].value;
      const totalReturn = finalValue - 1000;
      const totalReturnPercent = ((totalReturn / 1000) * 100);
      
      console.log('\n🏆 FINAL INVESTMENT PERFORMANCE SUMMARY:');
      console.log(`  💰 Initial Investment: $1,000`);
      console.log(`  💰 Final Portfolio Value: $${finalValue}`);
      console.log(`  💵 Total Return: $${totalReturn.toFixed(2)}`);
      console.log(`  📈 Total Return %: ${totalReturnPercent >= 0 ? '+' : ''}${totalReturnPercent.toFixed(2)}%`);
      console.log(`  📅 Investment Period: ${sampleDates.length} tracked days`);
      
      console.log('\n✅ === INVESTMENT TIMELINE CALCULATION COMPLETE ===\n');
      setInvestmentData(validResults);
      
    } catch (error) {
      console.error('Error loading investment data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load investment data');
      
      // Fallback to mock data
      setInvestmentData(getMockInvestmentData());
    } finally {
      setLoading(false);
    }
  };

  const formatDateForDisplay = (dateString: string, index: number): string => {
    const date = new Date(dateString);
    const today = new Date();
    
    if (index === 0) return 'Start';
    if (dateString === today.toISOString().split('T')[0]) return 'Current';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  useEffect(() => {
    if (coinsData.length > 0 && videoDate) {
      loadInvestmentData();
    }
  }, [coinsData, videoDate, investmentDelay]);

  return {
    investmentData,
    loading,
    error
  };
};

// Fallback mock data
const getMockInvestmentData = (): InvestmentDataPoint[] => [
  { date: 'Start', value: 1000, change: 0 },
  { date: 'Week 1', value: 1034, change: 3.4 },
  { date: 'Week 2', value: 1089, change: 8.9 },
  { date: 'Week 3', value: 1142, change: 14.2 },
  { date: 'Current', value: 1171, change: 17.1 }
];