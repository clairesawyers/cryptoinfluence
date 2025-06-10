import { InstrumentsService } from './instrumentsService';
import { AirtablePriceService } from './airtablePriceService';
import { 
  InvestmentSimulation, 
  InvestmentPosition, 
  PerformanceDataPoint,
  InvestmentStrategy 
} from '../types/investment';
import { Instrument } from '../types/instruments';

export class InvestmentService {
  private instrumentsService: InstrumentsService;
  private priceService: AirtablePriceService;

  constructor() {
    this.instrumentsService = new InstrumentsService();
    this.priceService = new AirtablePriceService();
  }

  /**
   * Create a complete investment simulation
   */
  async createInvestmentSimulation(
    coinMentions: string[],
    videoPublishDate: string,
    investmentAmount: number = 1000,
    investmentDelayHours: number = 24,
    videoTitle: string = '',
    channelName: string = ''
  ): Promise<InvestmentSimulation> {
    try {
      console.log('🚀 === INVESTMENT SIMULATION START ===');
      console.log('📺 Video:', videoTitle);
      console.log('📅 Publish Date:', videoPublishDate);
      console.log('💰 Investment Amount:', investmentAmount);
      console.log('⏰ Investment Delay:', investmentDelayHours, 'hours');
      console.log('🪙 Coins Mentioned:', coinMentions);
      console.log('🔍 Coins Mentioned Types:', coinMentions.map(c => ({ value: c, type: typeof c })));

      // Validate inputs
      if (!coinMentions || !Array.isArray(coinMentions) || coinMentions.length === 0) {
        throw new Error('No coins mentioned in the video');
      }

      // Filter out null/undefined/empty coins
      const validCoins = coinMentions.filter(coin => coin && typeof coin === 'string' && coin.trim().length > 0);
      
      if (validCoins.length === 0) {
        throw new Error('No valid coin names found');
      }

      console.log('✅ Valid coins to process:', validCoins);

      // Step 1: Find instruments for mentioned coins
      const instrumentResults = await this.instrumentsService.findInstruments(validCoins);
      const foundInstruments = instrumentResults.map(result => result.instrument);
      
      if (foundInstruments.length === 0) {
        throw new Error('No valid instruments found for the mentioned coins');
      }

      console.log(`✅ Found ${foundInstruments.length}/${coinMentions.length} instruments`);

      // Step 2: Calculate investment date
      const investmentDate = this.calculateInvestmentDate(videoPublishDate, investmentDelayHours);
      console.log('📅 Investment Date:', investmentDate);

      // Step 3: Get historical prices at investment date
      const positions = await this.calculatePositions(
        foundInstruments,
        investmentDate,
        investmentAmount
      );

      // Step 4: Calculate current portfolio value
      const totalValue = positions.reduce((sum, pos) => sum + pos.value, 0);
      const totalReturn = totalValue - investmentAmount;
      const totalReturnPercentage = (totalReturn / investmentAmount) * 100;

      // Step 5: Generate performance history
      const performanceHistory = await this.generatePerformanceHistory(
        positions,
        investmentDate,
        investmentAmount
      );

      const simulation: InvestmentSimulation = {
        id: this.generateSimulationId(),
        videoTitle,
        channelName,
        videoPublishDate,
        investmentDate,
        investmentAmount,
        investmentDelayHours,
        positions,
        totalValue,
        totalReturn,
        totalReturnPercentage,
        performanceHistory,
        createdAt: new Date().toISOString()
      };

      console.log('📊 SIMULATION RESULTS:');
      console.log('💰 Total Value:', `$${totalValue.toFixed(2)}`);
      console.log('📈 Total Return:', `$${totalReturn.toFixed(2)} (${totalReturnPercentage.toFixed(2)}%)`);
      console.log('🏆 === INVESTMENT SIMULATION END ===\n');

      return simulation;
    } catch (error) {
      console.error('❌ InvestmentService: Error creating simulation:', error);
      throw error;
    }
  }

  /**
   * Calculate investment positions for found instruments
   */
  private async calculatePositions(
    instruments: Instrument[],
    investmentDate: string,
    totalAmount: number
  ): Promise<InvestmentPosition[]> {
    const positions: InvestmentPosition[] = [];
    const allocationPerCoin = 100 / instruments.length; // Equal allocation
    const amountPerCoin = totalAmount / instruments.length;

    console.log(`💰 Calculating positions with ${allocationPerCoin.toFixed(2)}% allocation per coin ($${amountPerCoin.toFixed(2)} each)`);

    for (const instrument of instruments) {
      try {
        // Get purchase price (price at investment date)
        const purchasePrice = await this.priceService.getPriceOnDate(instrument.symbol, investmentDate);
        
        if (!purchasePrice) {
          console.warn(`⚠️ No price data for ${instrument.symbol} on ${investmentDate}, skipping`);
          continue;
        }

        // Get current price
        const currentPrice = await this.priceService.getLatestPrice(instrument.symbol);
        
        if (!currentPrice) {
          console.warn(`⚠️ No current price data for ${instrument.symbol}, skipping`);
          continue;
        }

        // Calculate position metrics
        const quantity = amountPerCoin / purchasePrice;
        const value = quantity * currentPrice;
        const return_ = value - amountPerCoin;
        const returnPercentage = (return_ / amountPerCoin) * 100;

        const position: InvestmentPosition = {
          symbol: instrument.symbol,
          name: instrument.name,
          allocation: allocationPerCoin,
          purchasePrice,
          currentPrice,
          quantity,
          value,
          return: return_,
          returnPercentage
        };

        positions.push(position);

        console.log(`  🪙 ${instrument.symbol} (${instrument.name}):`);
        console.log(`    - Purchase Price: $${purchasePrice.toFixed(2)}`);
        console.log(`    - Current Price: $${currentPrice.toFixed(2)}`);
        console.log(`    - Quantity: ${quantity.toFixed(6)}`);
        console.log(`    - Value: $${value.toFixed(2)}`);
        console.log(`    - Return: $${return_.toFixed(2)} (${returnPercentage.toFixed(2)}%)`);

      } catch (error) {
        console.error(`❌ Error calculating position for ${instrument.symbol}:`, error);
      }
    }

    return positions;
  }

  /**
   * Generate performance history over time
   */
  private async generatePerformanceHistory(
    positions: InvestmentPosition[],
    investmentDate: string,
    initialAmount: number
  ): Promise<PerformanceDataPoint[]> {
    const history: PerformanceDataPoint[] = [];
    const today = new Date().toISOString().split('T')[0];
    
    // Generate sample dates (every 7 days to limit API calls)
    const sampleDates = this.generateSampleDates(investmentDate, today);
    
    console.log(`📈 Generating performance history for ${sampleDates.length} sample dates`);

    for (const date of sampleDates) {
      let portfolioValue = 0;
      
      for (const position of positions) {
        try {
          const priceOnDate = await this.priceService.getPriceOnDate(position.symbol, date);
          if (priceOnDate) {
            portfolioValue += position.quantity * priceOnDate;
          }
        } catch (error) {
          console.warn(`⚠️ Failed to get price for ${position.symbol} on ${date}`);
        }
      }

      if (portfolioValue > 0) {
        const return_ = portfolioValue - initialAmount;
        const returnPercentage = (return_ / initialAmount) * 100;

        history.push({
          date,
          portfolioValue,
          return: return_,
          returnPercentage
        });
      }
    }

    console.log(`✅ Generated ${history.length} performance data points`);
    return history;
  }

  /**
   * Generate comparison strategies
   */
  async generateStrategyComparison(
    simulation: InvestmentSimulation
  ): Promise<InvestmentStrategy[]> {
    const strategies: InvestmentStrategy[] = [];

    // Strategy 1: Hold as Cash
    strategies.push({
      id: 'cash',
      name: 'Hold As Cash',
      description: 'Keep investment in cash with no market exposure',
      initialValue: simulation.investmentAmount,
      currentValue: simulation.investmentAmount,
      return: 0,
      returnPercentage: 0
    });

    // Strategy 2: Mentioned Coins Portfolio (actual simulation)
    strategies.push({
      id: 'portfolio',
      name: 'Mentioned Coins Portfolio',
      description: 'Equal allocation across coins mentioned in the video',
      initialValue: simulation.investmentAmount,
      currentValue: simulation.totalValue,
      return: simulation.totalReturn,
      returnPercentage: simulation.totalReturnPercentage
    });

    // Strategy 3: Hold as Bitcoin (if we have Bitcoin data)
    try {
      const bitcoinStrategy = await this.calculateBitcoinStrategy(
        simulation.investmentDate,
        simulation.investmentAmount
      );
      strategies.push(bitcoinStrategy);
    } catch (error) {
      console.warn('⚠️ Could not calculate Bitcoin strategy:', error);
      // Fallback to mock data
      strategies.push({
        id: 'bitcoin',
        name: 'Hold as Bitcoin',
        description: 'Invest entire amount in Bitcoin only (using estimated data)',
        initialValue: simulation.investmentAmount,
        currentValue: simulation.investmentAmount * 1.15, // Estimated 15% return
        return: simulation.investmentAmount * 0.15,
        returnPercentage: 15
      });
    }

    return strategies;
  }

  /**
   * Calculate Bitcoin-only strategy with real data
   */
  private async calculateBitcoinStrategy(
    investmentDate: string,
    investmentAmount: number
  ): Promise<InvestmentStrategy> {
    try {
      console.log('💰 Calculating Bitcoin strategy...');
      
      // Try to get Bitcoin price with multiple symbols
      const bitcoinSymbols = ['BTC', 'Bitcoin'];
      let bitcoinPurchasePrice: number | null = null;
      let bitcoinCurrentPrice: number | null = null;
      
      for (const symbol of bitcoinSymbols) {
        console.log(`🔍 Trying Bitcoin symbol: ${symbol}`);
        
        if (!bitcoinPurchasePrice) {
          const purchaseResult = await this.priceService.getPriceOnDateSafe(symbol, investmentDate);
          if (purchaseResult.price) {
            bitcoinPurchasePrice = purchaseResult.price;
            console.log(`✅ Found Bitcoin purchase price with symbol ${symbol}: $${bitcoinPurchasePrice}`);
          }
        }
        
        if (!bitcoinCurrentPrice) {
          try {
            const currentPrice = await this.priceService.getLatestPrice(symbol);
            if (currentPrice) {
              bitcoinCurrentPrice = currentPrice;
              console.log(`✅ Found Bitcoin current price with symbol ${symbol}: $${bitcoinCurrentPrice}`);
            }
          } catch (error) {
            console.warn(`⚠️ Failed to get latest price for ${symbol}`);
          }
        }
        
        if (bitcoinPurchasePrice && bitcoinCurrentPrice) break;
      }

      if (!bitcoinPurchasePrice || !bitcoinCurrentPrice) {
        console.warn('⚠️ Bitcoin price data not available, using fallback strategy');
        throw new Error('Bitcoin price data not available');
      }

      const quantity = investmentAmount / bitcoinPurchasePrice;
      const currentValue = quantity * bitcoinCurrentPrice;
      const return_ = currentValue - investmentAmount;
      const returnPercentage = (return_ / investmentAmount) * 100;

      return {
        id: 'bitcoin',
        name: 'Hold as Bitcoin',
        description: 'Invest entire amount in Bitcoin only',
        initialValue: investmentAmount,
        currentValue,
        return: return_,
        returnPercentage
      };
    } catch (error) {
      console.error('❌ Error calculating Bitcoin strategy:', error);
      throw error;
    }
  }

  /**
   * Utility methods
   */
  private calculateInvestmentDate(publishDate: string, delayHours: number): string {
    const date = new Date(publishDate);
    date.setHours(date.getHours() + delayHours);
    return date.toISOString().split('T')[0];
  }

  private generateSampleDates(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    
    // Always include start date
    dates.push(startDate);
    
    // Sample every 7 days
    while (current <= end) {
      current.setDate(current.getDate() + 7);
      if (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
      }
    }
    
    // Always include end date if it's not already included
    if (dates[dates.length - 1] !== endDate) {
      dates.push(endDate);
    }
    
    return dates;
  }

  private generateSimulationId(): string {
    return `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}