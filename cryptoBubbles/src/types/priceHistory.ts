export interface PriceHistory {
  id: string;
  symbol: string;
  price: number;
  recordedAt: string; // ISO date string
  source?: string;
  volume?: number;
  marketCap?: number;
}

export interface PriceDataPoint {
  date: string;
  price: number;
  symbol: string;
}

export interface PriceRange {
  symbol: string;
  startDate: string;
  endDate: string;
  prices: PriceDataPoint[];
  missingDates: string[];
}