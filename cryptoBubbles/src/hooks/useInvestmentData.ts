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

      const client = new AirtableClient();
      const investmentDate = calculateInvestmentDate(videoDate, investmentDelay);
      const today = new Date().toISOString().split('T')[0];
      
      // Generate date range from investment date to today
      const dateRange = generateDateRange(investmentDate, today);
      
      // Sample dates to avoid too many API calls (e.g., every 7 days)
      const sampleDates = dateRange.filter((_, index) => index % 7 === 0 || index === dateRange.length - 1);
      
      const portfolioValuePromises = sampleDates.map(async (date, index) => {
        let totalValue = 0;
        
        // Calculate portfolio value for each selected coin
        for (const coin of coinsData.filter(c => c.isSelected)) {
          try {
            const priceAtDate = await client.getPriceAtDate(coin.name, date);
            if (priceAtDate && coin.initialPrice) {
              const allocationAmount = 1000 * (coin.allocation / 100);
              const coinQuantity = allocationAmount / coin.initialPrice;
              const coinValue = coinQuantity * priceAtDate;
              totalValue += coinValue;
            }
          } catch (error) {
            console.warn(`Failed to get price for ${coin.name} on ${date}`);
            // Use interpolated value or skip
          }
        }

        // Calculate change from initial investment
        const change = ((totalValue - 1000) / 1000) * 100;
        
        return {
          date: formatDateForDisplay(date, index),
          value: Math.round(totalValue),
          change: Math.round(change * 100) / 100
        };
      });

      const results = await Promise.all(portfolioValuePromises);
      
      // Filter out any failed calculations and ensure we have at least initial and current
      const validResults = results.filter(result => result.value > 0);
      
      if (validResults.length === 0) {
        throw new Error('No valid investment data could be calculated');
      }

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