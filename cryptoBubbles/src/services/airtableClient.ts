import axios from 'axios';

// Airtable Configuration
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;

// Interfaces for type safety
export interface CoinMetadata {
  ticker: string;
  name: string;
  category: string;
  logoUrl: string;
}

export interface HistoricalPrice {
  date: string;
  price: number;
}

// Airtable API Client
export class AirtableClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;
    this.headers = {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    };
  }

  // Fetch Coin Metadata from Instruments table
  async fetchCoinMetadata(): Promise<CoinMetadata[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/tbloUN2XCE2uOUTgG`, {
        headers: this.headers,
        params: {
          // Optional: Add filtering or sorting if needed
          // view: 'Active Coins',
          // filterByFormula: 'AND({Active} = 1)',
          maxRecords: 100 // Adjust as needed
        }
      });

      return response.data.records.map((record: any) => ({
        ticker: record.fields.Symbol,
        name: record.fields.Name,
        category: record.fields.Category,
        logoUrl: record.fields.Logo?.[0]?.url || '' // Handle potential missing logo
      }));
    } catch (error) {
      console.error('Error fetching coin metadata:', error);
      throw error;
    }
  }

  // Fetch Historical Price Data for a specific coin
  async fetchHistoricalPrices(coinName: string, daysBack: number = 30): Promise<HistoricalPrice[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/tblXhhrCxFJiYmgqt`, {
        headers: this.headers,
        params: {
          // Filter by specific instrument (coin)
          filterByFormula: `SEARCH("${coinName}", {Instrument Relation})`,
          
          // Sort by most recent first
          sort: [
            { field: "Recorded At", direction: "desc" }
          ],
          
          // Limit to recent days
          maxRecords: daysBack
        }
      });

      return response.data.records.map((record: any) => ({
        date: record.fields['Recorded At'],
        price: parseFloat(record.fields.Price)
      })).reverse(); // Ensure chronological order
    } catch (error) {
      console.error(`Error fetching historical prices for ${coinName}:`, error);
      throw error;
    }
  }

  // Comprehensive method to get full coin data with historical prices
  async getCoinDataWithPriceHistory(coinName: string, daysBack: number = 30): Promise<{
    metadata: CoinMetadata,
    historicalPrices: HistoricalPrice[]
  }> {
    try {
      // Fetch coin metadata
      const coinsMetadata = await this.fetchCoinMetadata();
      const coinMetadata = coinsMetadata.find(coin => coin.name === coinName);

      if (!coinMetadata) {
        throw new Error(`Coin ${coinName} not found`);
      }

      // Fetch historical prices
      const historicalPrices = await this.fetchHistoricalPrices(coinName, daysBack);

      return {
        metadata: coinMetadata,
        historicalPrices
      };
    } catch (error) {
      console.error(`Error getting comprehensive data for ${coinName}:`, error);
      throw error;
    }
  }

  // Get price at specific date for investment simulation
  async getPriceAtDate(coinName: string, targetDate: string): Promise<number | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/tblXhhrCxFJiYmgqt`, {
        headers: this.headers,
        params: {
          filterByFormula: `AND(SEARCH("${coinName}", {Instrument Relation}), IS_SAME({Recorded At}, DATETIME_PARSE("${targetDate}", "YYYY-MM-DD"), "day"))`,
          maxRecords: 1
        }
      });

      if (response.data.records.length > 0) {
        return parseFloat(response.data.records[0].fields.Price);
      }
      return null;
    } catch (error) {
      console.error(`Error fetching price for ${coinName} at ${targetDate}:`, error);
      return null;
    }
  }

  // Get current price (most recent)
  async getCurrentPrice(coinName: string): Promise<number | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/tblXhhrCxFJiYmgqt`, {
        headers: this.headers,
        params: {
          filterByFormula: `SEARCH("${coinName}", {Instrument Relation})`,
          sort: [{ field: "Recorded At", direction: "desc" }],
          maxRecords: 1
        }
      });

      if (response.data.records.length > 0) {
        return parseFloat(response.data.records[0].fields.Price);
      }
      return null;
    } catch (error) {
      console.error(`Error fetching current price for ${coinName}:`, error);
      return null;
    }
  }
}

// Example usage and error handling
export async function fetchAndProcessCoinData() {
  const client = new AirtableClient();

  try {
    // Fetch all coin metadata
    const coinMetadata = await client.fetchCoinMetadata();
    console.log('All Coins:', coinMetadata);

    // Fetch historical prices for a specific coin
    const bitcoinPrices = await client.fetchHistoricalPrices('Bitcoin');
    console.log('Bitcoin Prices:', bitcoinPrices);

    // Get comprehensive data for a coin
    const bitcoinData = await client.getCoinDataWithPriceHistory('Bitcoin');
    console.log('Bitcoin Full Data:', bitcoinData);
  } catch (error) {
    console.error('Data fetching failed:', error);
    // Implement fallback or error handling strategy
  }
}