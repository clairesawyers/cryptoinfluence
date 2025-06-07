export interface Instrument {
  id: string;
  symbol: string;
  name: string;
  category?: string;
  isActive: boolean;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InstrumentSearchResult {
  instrument: Instrument;
  matchType: 'symbol' | 'name' | 'alias';
  confidence: number;
}