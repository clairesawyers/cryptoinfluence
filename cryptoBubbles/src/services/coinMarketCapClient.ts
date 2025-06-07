import axios from 'axios';

interface CoinMarketCapResponse {
  status: {
    timestamp: string;
    error_code: number;
    error_message: string | null;
    elapsed: number;
    credit_count: number;
  };
  data: {
    [symbol: string]: {
      id: number;
      name: string;
      symbol: string;
      slug: string;
      is_active: number;
      is_fiat: number;
      category: string;
      description: string;
      logo: string;
      urls: {
        website: string[];
        technical_doc: string[];
        twitter: string[];
        reddit: string[];
        message_board: string[];
        announcement: string[];
        chat: string[];
        explorer: string[];
        source_code: string[];
      };
    };
  };
}

interface CoinMarketCapQuoteResponse {
  status: {
    timestamp: string;
    error_code: number;
    error_message: string | null;
    elapsed: number;
    credit_count: number;
  };
  data: {
    [symbol: string]: {
      id: number;
      name: string;
      symbol: string;
      slug: string;
      num_market_pairs: number;
      date_added: string;
      tags: string[];
      max_supply: number | null;
      circulating_supply: number;
      total_supply: number;
      is_active: number;
      platform: null | object;
      cmc_rank: number;
      is_fiat: number;
      self_reported_circulating_supply: null | number;
      self_reported_market_cap: null | number;
      tvl_ratio: null | number;
      last_updated: string;
      quote: {
        USD: {
          price: number;
          volume_24h: number;
          volume_change_24h: number;
          percent_change_1h: number;
          percent_change_24h: number;
          percent_change_7d: number;
          percent_change_30d: number;
          percent_change_60d: number;
          percent_change_90d: number;
          market_cap: number;
          market_cap_dominance: number;
          fully_diluted_market_cap: number;
          tvl: null | number;
          last_updated: string;
        };
      };
    };
  };
}

export class CoinMarketCapClient {
  private baseUrl = 'https://pro-api.coinmarketcap.com/v1';
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_COINMARKETCAP_API_KEY || '';
    console.log('CoinMarketCap Client initialized. API Key available:', !!this.apiKey);
    if (!this.apiKey) {
      console.warn('CoinMarketCap API key not found in environment variables');
    }
  }

  private get headers() {
    return {
      'X-CMC_PRO_API_KEY': this.apiKey,
      'Accept': 'application/json',
    };
  }

  async getCurrentPrice(symbol: string): Promise<number | null> {
    if (!this.apiKey) {
      console.error('CoinMarketCap API key is not configured');
      return null;
    }

    try {
      const response = await axios.get<CoinMarketCapQuoteResponse>(
        `${this.baseUrl}/cryptocurrency/quotes/latest`,
        {
          headers: this.headers,
          params: {
            symbol: symbol.toUpperCase(),
            convert: 'USD'
          }
        }
      );

      const data = response.data.data[symbol.toUpperCase()];
      if (data && data.quote && data.quote.USD) {
        return data.quote.USD.price;
      }

      return null;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`Error fetching price for ${symbol}:`, error.response?.data || error.message);
      } else {
        console.error(`Error fetching price for ${symbol}:`, error);
      }
      return null;
    }
  }

  async getCurrentPrices(symbols: string[]): Promise<Record<string, number | null>> {
    console.log('CoinMarketCap: Getting current prices for symbols:', symbols);
    
    if (!this.apiKey) {
      console.error('CoinMarketCap API key is not configured');
      return symbols.reduce((acc, symbol) => ({ ...acc, [symbol]: null }), {});
    }

    try {
      const symbolList = symbols.map(s => s.toUpperCase()).join(',');
      console.log('CoinMarketCap: Requesting prices for symbol list:', symbolList);
      
      const response = await axios.get<CoinMarketCapQuoteResponse>(
        `${this.baseUrl}/cryptocurrency/quotes/latest`,
        {
          headers: this.headers,
          params: {
            symbol: symbolList,
            convert: 'USD'
          }
        }
      );
      
      console.log('CoinMarketCap: API Response status:', response.status);
      console.log('CoinMarketCap: API Response data keys:', Object.keys(response.data.data));

      const prices: Record<string, number | null> = {};
      
      for (const symbol of symbols) {
        const upperSymbol = symbol.toUpperCase();
        const data = response.data.data[upperSymbol];
        
        if (data && data.quote && data.quote.USD) {
          prices[symbol] = data.quote.USD.price;
          console.log(`CoinMarketCap: Got price for ${symbol}: $${data.quote.USD.price}`);
        } else {
          prices[symbol] = null;
          console.log(`CoinMarketCap: No price data for ${symbol}`);
        }
      }

      console.log('CoinMarketCap: Final prices object:', prices);
      return prices;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error fetching prices:', error.response?.data || error.message);
      } else {
        console.error('Error fetching prices:', error);
      }
      
      // Return null for all symbols on error
      return symbols.reduce((acc, symbol) => ({ ...acc, [symbol]: null }), {});
    }
  }

  async getCoinInfo(symbol: string): Promise<any | null> {
    if (!this.apiKey) {
      console.error('CoinMarketCap API key is not configured');
      return null;
    }

    try {
      const response = await axios.get<CoinMarketCapResponse>(
        `${this.baseUrl}/cryptocurrency/info`,
        {
          headers: this.headers,
          params: {
            symbol: symbol.toUpperCase()
          }
        }
      );

      return response.data.data[symbol.toUpperCase()] || null;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`Error fetching info for ${symbol}:`, error.response?.data || error.message);
      } else {
        console.error(`Error fetching info for ${symbol}:`, error);
      }
      return null;
    }
  }
}