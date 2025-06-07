import axios, { AxiosResponse } from 'axios';
import { Instrument, InstrumentSearchResult } from '../types/instruments';
import { AirtableResponse, AirtableRecord, InstrumentFields, AirtableError } from '../types/api';

export class InstrumentsService {
  private readonly baseId: string;
  private readonly apiKey: string;
  private readonly tableId: string;
  private readonly baseUrl: string;

  constructor() {
    this.baseId = import.meta.env.VITE_INSTRUMENTS_AIRTABLE_BASE_ID;
    this.apiKey = import.meta.env.VITE_INSTRUMENTS_AIRTABLE_API_KEY;
    this.tableId = import.meta.env.VITE_INSTRUMENTS_AIRTABLE_TABLE_ID;
    this.baseUrl = `https://api.airtable.com/v0/${this.baseId}`;

    if (!this.baseId || !this.apiKey || !this.tableId) {
      throw new Error('Missing required Airtable configuration for Instruments service');
    }
  }

  private get headers() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  private mapRecordToInstrument(record: AirtableRecord<InstrumentFields>): Instrument {
    return {
      id: record.id,
      symbol: record.fields.Symbol,
      name: record.fields.Name,
      category: record.fields.Category,
      isActive: record.fields['Is Active'] === 'Yes',
      logoUrl: record.fields['Logo URL'],
      createdAt: record.createdTime,
      updatedAt: record.createdTime
    };
  }

  /**
   * Get all active instruments
   */
  async getActiveInstruments(): Promise<Instrument[]> {
    try {
      console.log('🔧 InstrumentsService: Fetching active instruments...');
      
      const response: AxiosResponse<AirtableResponse<InstrumentFields>> = await axios.get(
        `${this.baseUrl}/${this.tableId}`,
        {
          headers: this.headers,
          params: {
            filterByFormula: "{Is Active} = 'Yes'",
            sort: [{ field: 'Symbol', direction: 'asc' }]
          }
        }
      );

      const instruments = response.data.records.map(this.mapRecordToInstrument);
      
      console.log(`✅ InstrumentsService: Found ${instruments.length} active instruments`);
      console.log('📊 Sample instruments:', instruments.slice(0, 3).map(i => ({ symbol: i.symbol, name: i.name })));
      
      return instruments;
    } catch (error) {
      console.error('❌ InstrumentsService: Error fetching active instruments:', error);
      if (axios.isAxiosError(error) && error.response?.data) {
        const airtableError = error.response.data as AirtableError;
        throw new Error(`Airtable API Error: ${airtableError.error?.message || 'Unknown error'}`);
      }
      throw error;
    }
  }

  /**
   * Find instruments by symbols or names with fuzzy matching
   */
  async findInstruments(coinInputs: string[]): Promise<InstrumentSearchResult[]> {
    try {
      console.log('🔍 InstrumentsService: Finding instruments for:', coinInputs);
      
      const activeInstruments = await this.getActiveInstruments();
      const results: InstrumentSearchResult[] = [];

      for (const input of coinInputs) {
        const inputLower = input.toLowerCase().trim();
        
        // Try exact symbol match first
        let instrument = activeInstruments.find(
          inst => inst.symbol.toLowerCase() === inputLower
        );
        
        if (instrument) {
          results.push({
            instrument,
            matchType: 'symbol',
            confidence: 1.0
          });
          console.log(`✅ Found exact symbol match: ${input} -> ${instrument.symbol}`);
          continue;
        }

        // Try exact name match
        instrument = activeInstruments.find(
          inst => inst.name.toLowerCase() === inputLower
        );
        
        if (instrument) {
          results.push({
            instrument,
            matchType: 'name',
            confidence: 1.0
          });
          console.log(`✅ Found exact name match: ${input} -> ${instrument.name} (${instrument.symbol})`);
          continue;
        }

        // Try partial name match
        instrument = activeInstruments.find(
          inst => inst.name.toLowerCase().includes(inputLower) || 
                 inputLower.includes(inst.name.toLowerCase())
        );
        
        if (instrument) {
          results.push({
            instrument,
            matchType: 'name',
            confidence: 0.8
          });
          console.log(`⚠️ Found partial name match: ${input} -> ${instrument.name} (${instrument.symbol})`);
          continue;
        }

        console.warn(`❌ No match found for: ${input}`);
      }

      console.log(`🎯 InstrumentsService: Found ${results.length}/${coinInputs.length} instruments`);
      return results;
    } catch (error) {
      console.error('❌ InstrumentsService: Error finding instruments:', error);
      throw error;
    }
  }

  /**
   * Get instrument by symbol
   */
  async getInstrumentBySymbol(symbol: string): Promise<Instrument | null> {
    try {
      console.log(`🔍 InstrumentsService: Getting instrument by symbol: ${symbol}`);
      
      const response: AxiosResponse<AirtableResponse<InstrumentFields>> = await axios.get(
        `${this.baseUrl}/${this.tableId}`,
        {
          headers: this.headers,
          params: {
            filterByFormula: `AND({Symbol} = '${symbol}', {Is Active} = 'Yes')`,
            maxRecords: 1
          }
        }
      );

      if (response.data.records.length === 0) {
        console.warn(`⚠️ InstrumentsService: No active instrument found for symbol: ${symbol}`);
        return null;
      }

      const instrument = this.mapRecordToInstrument(response.data.records[0]);
      console.log(`✅ InstrumentsService: Found instrument: ${instrument.name} (${instrument.symbol})`);
      
      return instrument;
    } catch (error) {
      console.error(`❌ InstrumentsService: Error getting instrument by symbol ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Get available symbols (useful for debugging)
   */
  async getAvailableSymbols(): Promise<string[]> {
    try {
      const instruments = await this.getActiveInstruments();
      return instruments.map(inst => inst.symbol).sort();
    } catch (error) {
      console.error('❌ InstrumentsService: Error getting available symbols:', error);
      throw error;
    }
  }
}