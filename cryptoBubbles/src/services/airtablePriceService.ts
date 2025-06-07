import axios, { AxiosResponse } from 'axios';
import { PriceHistory, PriceDataPoint, PriceRange } from '../types/priceHistory';
import { AirtableResponse, AirtableRecord, PriceHistoryFields, AirtableError } from '../types/api';

export class AirtablePriceService {
  private readonly baseId: string;
  private readonly apiKey: string;
  private readonly tableId: string;
  private readonly baseUrl: string;

  constructor() {
    this.baseId = import.meta.env.VITE_PRICE_HISTORY_AIRTABLE_BASE_ID;
    this.apiKey = import.meta.env.VITE_PRICE_HISTORY_AIRTABLE_API_KEY;
    this.tableId = import.meta.env.VITE_PRICE_HISTORY_AIRTABLE_TABLE_ID;
    this.baseUrl = `https://api.airtable.com/v0/${this.baseId}`;

    if (!this.baseId || !this.apiKey || !this.tableId) {
      throw new Error('Missing required Airtable configuration for Price History service');
    }
  }

  private get headers() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  private mapRecordToPriceHistory(record: AirtableRecord<PriceHistoryFields>): PriceHistory {
    return {
      id: record.id,
      symbol: record.fields.Symbol,
      price: record.fields.Price,
      recordedAt: record.fields['Recorded At'],
      source: record.fields.Source,
      volume: record.fields.Volume,
      marketCap: record.fields['Market Cap']
    };
  }

  private formatDateForAirtable(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  /**
   * Get price for a specific symbol on a specific date
   */
  async getPriceOnDate(symbol: string, date: string): Promise<number | null> {
    try {
      const formattedDate = this.formatDateForAirtable(date);
      console.log(`💰 PriceService: Getting price for ${symbol} on ${formattedDate}`);
      
      const response: AxiosResponse<AirtableResponse<PriceHistoryFields>> = await axios.get(
        `${this.baseUrl}/${this.tableId}`,
        {
          headers: this.headers,
          params: {
            filterByFormula: `AND({Symbol} = '${symbol}', {Recorded At} = '${formattedDate}')`,
            maxRecords: 1,
            sort: [{ field: 'Recorded At', direction: 'desc' }]
          }
        }
      );

      if (response.data.records.length === 0) {
        console.warn(`⚠️ PriceService: No price found for ${symbol} on ${formattedDate}`);
        return null;
      }

      const price = response.data.records[0].fields.Price;
      console.log(`✅ PriceService: Found price for ${symbol} on ${formattedDate}: $${price}`);
      
      return price;
    } catch (error) {
      console.error(`❌ PriceService: Error getting price for ${symbol} on ${date}:`, error);
      throw error;
    }
  }

  /**
   * Get latest price for a symbol
   */
  async getLatestPrice(symbol: string): Promise<number | null> {
    try {
      console.log(`💰 PriceService: Getting latest price for ${symbol}`);
      
      const response: AxiosResponse<AirtableResponse<PriceHistoryFields>> = await axios.get(
        `${this.baseUrl}/${this.tableId}`,
        {
          headers: this.headers,
          params: {
            filterByFormula: `{Symbol} = '${symbol}'`,
            maxRecords: 1,
            sort: [{ field: 'Recorded At', direction: 'desc' }]
          }
        }
      );

      if (response.data.records.length === 0) {
        console.warn(`⚠️ PriceService: No price data found for ${symbol}`);
        return null;
      }

      const record = response.data.records[0];
      const price = record.fields.Price;
      const date = record.fields['Recorded At'];
      
      console.log(`✅ PriceService: Latest price for ${symbol}: $${price} (${date})`);
      return price;
    } catch (error) {
      console.error(`❌ PriceService: Error getting latest price for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Get price history for a symbol within a date range
   */
  async getPriceRange(symbol: string, startDate: string, endDate: string): Promise<PriceRange> {
    try {
      const formattedStartDate = this.formatDateForAirtable(startDate);
      const formattedEndDate = this.formatDateForAirtable(endDate);
      
      console.log(`📈 PriceService: Getting price range for ${symbol} from ${formattedStartDate} to ${formattedEndDate}`);
      
      // Get all records in the date range
      let allRecords: AirtableRecord<PriceHistoryFields>[] = [];
      let offset: string | undefined;
      
      do {
        const params: any = {
          filterByFormula: `AND(
            {Symbol} = '${symbol}',
            IS_AFTER({Recorded At}, '${formattedStartDate}'),
            IS_BEFORE({Recorded At}, '${formattedEndDate}')
          )`.replace(/\s+/g, ' '),
          sort: [{ field: 'Recorded At', direction: 'asc' }],
          pageSize: 100
        };
        
        if (offset) {
          params.offset = offset;
        }

        const response: AxiosResponse<AirtableResponse<PriceHistoryFields>> = await axios.get(
          `${this.baseUrl}/${this.tableId}`,
          {
            headers: this.headers,
            params
          }
        );

        allRecords = allRecords.concat(response.data.records);
        offset = response.data.offset;
      } while (offset);

      // Convert to price data points
      const prices: PriceDataPoint[] = allRecords.map(record => ({
        date: record.fields['Recorded At'],
        price: record.fields.Price,
        symbol: record.fields.Symbol
      }));

      // Generate list of expected dates
      const expectedDates = this.generateDateRange(formattedStartDate, formattedEndDate);
      const actualDates = new Set(prices.map(p => p.date));
      const missingDates = expectedDates.filter(date => !actualDates.has(date));

      console.log(`📊 PriceService: Found ${prices.length} price points for ${symbol}, missing ${missingDates.length} dates`);
      
      if (missingDates.length > 0) {
        console.warn(`⚠️ PriceService: Missing price data for ${symbol} on dates:`, missingDates.slice(0, 5));
      }

      return {
        symbol,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        prices,
        missingDates
      };
    } catch (error) {
      console.error(`❌ PriceService: Error getting price range for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Get latest prices for multiple symbols
   */
  async getLatestPrices(symbols: string[]): Promise<Record<string, number>> {
    try {
      console.log(`💰 PriceService: Getting latest prices for ${symbols.length} symbols:`, symbols);
      
      const prices: Record<string, number> = {};
      
      // Process symbols in parallel with limited concurrency
      const batchSize = 5;
      for (let i = 0; i < symbols.length; i += batchSize) {
        const batch = symbols.slice(i, i + batchSize);
        const batchPromises = batch.map(async (symbol) => {
          const price = await this.getLatestPrice(symbol);
          if (price !== null) {
            prices[symbol] = price;
          }
        });
        
        await Promise.all(batchPromises);
      }

      console.log(`✅ PriceService: Retrieved ${Object.keys(prices).length}/${symbols.length} latest prices`);
      return prices;
    } catch (error) {
      console.error('❌ PriceService: Error getting latest prices:', error);
      throw error;
    }
  }

  /**
   * Get available symbols in price history (useful for debugging)
   */
  async getAvailableSymbols(): Promise<string[]> {
    try {
      console.log('🔍 PriceService: Getting available symbols...');
      
      const response: AxiosResponse<AirtableResponse<PriceHistoryFields>> = await axios.get(
        `${this.baseUrl}/${this.tableId}`,
        {
          headers: this.headers,
          params: {
            fields: ['Symbol'],
            sort: [{ field: 'Symbol', direction: 'asc' }]
          }
        }
      );

      const symbols = [...new Set(response.data.records.map(record => record.fields.Symbol))];
      console.log(`📊 PriceService: Found ${symbols.length} unique symbols in price history`);
      
      return symbols.sort();
    } catch (error) {
      console.error('❌ PriceService: Error getting available symbols:', error);
      throw error;
    }
  }

  /**
   * Generate array of dates between start and end date
   */
  private generateDateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  }
}