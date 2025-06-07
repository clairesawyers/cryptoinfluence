export interface InvestmentPosition {
  symbol: string;
  name: string;
  allocation: number; // Percentage (0-100)
  purchasePrice: number;
  currentPrice: number;
  quantity: number;
  value: number;
  return: number;
  returnPercentage: number;
}

export interface InvestmentSimulation {
  id: string;
  videoTitle: string;
  channelName: string;
  videoPublishDate: string;
  investmentDate: string;
  investmentAmount: number;
  investmentDelayHours: number;
  positions: InvestmentPosition[];
  totalValue: number;
  totalReturn: number;
  totalReturnPercentage: number;
  performanceHistory: PerformanceDataPoint[];
  createdAt: string;
}

export interface PerformanceDataPoint {
  date: string;
  portfolioValue: number;
  return: number;
  returnPercentage: number;
}

export interface InvestmentStrategy {
  id: string;
  name: string;
  description: string;
  initialValue: number;
  currentValue: number;
  return: number;
  returnPercentage: number;
}