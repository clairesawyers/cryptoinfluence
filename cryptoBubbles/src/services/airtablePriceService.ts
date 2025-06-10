import axios, { AxiosResponse } from 'axios';
import { PriceDataPoint, PriceRange } from '../types/priceHistory';
import { AirtableResponse, AirtableRecord, PriceHistoryFields } from '../types/api';

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

    // Don't throw error in constructor, check when methods are called
  }

  private checkConfiguration() {
    console.log('🔍 PriceService Configuration Check:');
    console.log('  - Base ID:', this.baseId ? '✅ Set' : '❌ Missing');
    console.log('  - API Key:', this.apiKey ? '✅ Set' : '❌ Missing');
    console.log('  - Table ID:', this.tableId ? '✅ Set' : '❌ Missing');
    console.log('  - Actual values:', {
      baseId: this.baseId,
      apiKey: this.apiKey ? `${this.apiKey.substring(0, 8)}...` : 'undefined',
      tableId: this.tableId
    });
    
    if (!this.baseId || !this.apiKey || !this.tableId) {
      throw new Error(`Missing required Airtable configuration for Price History service. Missing: ${
        [
          !this.baseId ? 'VITE_PRICE_HISTORY_AIRTABLE_BASE_ID' : null,
          !this.apiKey ? 'VITE_PRICE_HISTORY_AIRTABLE_API_KEY' : null,
          !this.tableId ? 'VITE_PRICE_HISTORY_AIRTABLE_TABLE_ID' : null
        ].filter(Boolean).join(', ')
      }`);
    }
  }

  private get headers() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
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
      this.checkConfiguration();
      const formattedDate = this.formatDateForAirtable(date);
      console.log(`💰 PriceService: Getting price for ${symbol} on ${formattedDate}`);
      
      const response: AxiosResponse<AirtableResponse<PriceHistoryFields>> = await axios.get(
        `${this.baseUrl}/${this.tableId}`,
        {
          headers: this.headers,
          params: {
            filterByFormula: `AND({Symbol} = '${symbol}', DATETIME_PARSE({Date}, "YYYY-MM-DD") = DATETIME_PARSE("${formattedDate}", "YYYY-MM-DD"))`,
            maxRecords: 1,
            sort: [{ field: 'Date', direction: 'desc' }]
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
      this.checkConfiguration();
      console.log(`💰 PriceService: Getting latest price for ${symbol}`);
      
      const response: AxiosResponse<AirtableResponse<PriceHistoryFields>> = await axios.get(
        `${this.baseUrl}/${this.tableId}`,
        {
          headers: this.headers,
          params: {
            filterByFormula: `{Symbol} = '${symbol}'`,
            maxRecords: 1,
            sort: [{ field: 'Date', direction: 'desc' }]
          }
        }
      );

      if (response.data.records.length === 0) {
        console.warn(`⚠️ PriceService: No price data found for ${symbol}`);
        return null;
      }

      const record = response.data.records[0];
      const price = record.fields.Price;
      const date = record.fields['Date'];
      
      console.log(`✅ PriceService: Latest price for ${symbol}: $${price} (${date})`);
      return price;
    } catch (error) {
      console.error(`❌ PriceService: Error getting latest price for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Get latest price for a symbol with date information
   */
  async getLatestPriceWithDate(symbol: string): Promise<{ price: number; date: string } | null> {
    try {
      this.checkConfiguration();
      console.log(`💰 PriceService: Getting latest price with date for ${symbol}`);
      
      const response: AxiosResponse<AirtableResponse<PriceHistoryFields>> = await axios.get(
        `${this.baseUrl}/${this.tableId}`,
        {
          headers: this.headers,
          params: {
            filterByFormula: `{Symbol} = '${symbol}'`,
            maxRecords: 1,
            sort: [{ field: 'Date', direction: 'desc' }]
          }
        }
      );

      if (response.data.records.length === 0) {
        console.warn(`⚠️ PriceService: No price data found for ${symbol}`);
        return null;
      }

      const record = response.data.records[0];
      const price = record.fields.Price;
      const date = record.fields['Date'];
      
      console.log(`✅ PriceService: Latest price for ${symbol}: $${price} (${date})`);
      return { price, date };
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
            IS_AFTER({Date}, '${formattedStartDate}'),
            IS_BEFORE({Date}, '${formattedEndDate}')
          )`.replace(/\s+/g, ' '),
          sort: [{ field: 'Date', direction: 'asc' }],
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
        date: record.fields['Date'],
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

  /**
   * Validate and map symbols to ensure they exist in price history
   */
  async validateSymbols(symbols: string[]): Promise<{
    valid: string[];
    invalid: string[];
    mappings: Record<string, string>;
  }> {
    try {
      console.log('🔍 Validating symbols:', symbols);
      
      // Get all available symbols from price history
      const availableSymbols = await this.getAvailableSymbols();
      console.log('📊 Available symbols in price history:', availableSymbols.slice(0, 10), '...'); // Show first 10
      
      const valid: string[] = [];
      const invalid: string[] = [];
      const mappings: Record<string, string> = {};
      
      for (const symbol of symbols) {
        const upperSymbol = symbol.toUpperCase();
        
        // Check exact match first
        if (availableSymbols.includes(upperSymbol)) {
          valid.push(upperSymbol);
          mappings[symbol] = upperSymbol;
          console.log(`✅ Symbol ${symbol} -> ${upperSymbol} (exact match)`);
        } else {
          // Try common mappings
          const symbolMappings: Record<string, string> = {
            'RNDR': 'RENDER',  // Common mapping
            'RENDER': 'RNDR',  // Reverse mapping
            // Add more mappings as needed
          };
          
          const mappedSymbol = symbolMappings[upperSymbol];
          if (mappedSymbol && availableSymbols.includes(mappedSymbol)) {
            valid.push(mappedSymbol);
            mappings[symbol] = mappedSymbol;
            console.log(`✅ Symbol ${symbol} -> ${mappedSymbol} (mapped)`);
          } else {
            invalid.push(symbol);
            console.log(`❌ Symbol ${symbol} not found in price history`);
          }
        }
      }
      
      return { valid, invalid, mappings };
    } catch (error) {
      console.error('❌ Error validating symbols:', error);
      return { valid: [], invalid: symbols, mappings: {} };
    }
  }

  /**
   * Enhanced getPriceOnDate with better error handling
   */
  async getPriceOnDateSafe(symbol: string, date: string): Promise<{
    price: number | null;
    error?: string;
  }> {
    try {
      const price = await this.getPriceOnDate(symbol, date);
      if (price === null) {
        return {
          price: null,
          error: `No price data found for ${symbol} on ${date}`
        };
      }
      return { price };
    } catch (error) {
      console.error(`❌ Error getting price for ${symbol}:`, error);
      return {
        price: null,
        error: `API error for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}