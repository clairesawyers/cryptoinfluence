import React from 'react';
import { Clock, Calendar, DollarSign, Settings } from 'lucide-react';
import { InvestmentDataPoint } from './CryptoVideoSimulator';

interface InvestmentControlsProps {
  investmentDelay: '1hour' | '1day' | '1week';
  setInvestmentDelay: (delay: '1hour' | '1day' | '1week') => void;
  endDate: string;
  setEndDate: (date: string) => void;
  investmentAmount: number;
  setInvestmentAmount: (amount: number) => void;
  investmentMode: 'equal' | 'custom';
  setInvestmentMode: (mode: 'equal' | 'custom') => void;
  investmentData: InvestmentDataPoint[];
}

export const InvestmentControls: React.FC<InvestmentControlsProps> = ({
  investmentDelay,
  setInvestmentDelay,
  endDate,
  setEndDate,
  investmentAmount,
  setInvestmentAmount,
  investmentMode,
  setInvestmentMode,
  investmentData
}) => {
  return (
    <div className="bg-gray-800 border-2 border-gray-700 rounded-lg p-6 space-y-6">
      {/* Investment Timing */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
          <Clock size={16} className="text-primary-400" />
          Investment Timing (after video upload)
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['1hour', '1day', '1week'] as const).map((timing) => (
            <button
              key={timing}
              onClick={() => setInvestmentDelay(timing)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                investmentDelay === timing
                  ? 'bg-primary-600 text-white border-2 border-primary-400'
                  : 'bg-gray-700 text-gray-300 border-2 border-gray-600 hover:bg-gray-600'
              }`}
            >
              {timing === '1hour' ? '1 Hour' : timing === '1day' ? '1 Day' : '1 Week'}
            </button>
          ))}
        </div>
      </div>

      {/* Investment Period */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
          <Calendar size={16} className="text-primary-400" />
          Hold Until
        </label>
        <select
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 border-2 border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:border-primary-500 transition-colors"
        >
          <option value="current">Current (Open Position)</option>
          {investmentData
            .filter(d => d.rawDate !== 'current')
            .map(d => (
              <option key={d.rawDate} value={d.rawDate}>
                {d.date}
              </option>
            ))}
        </select>
      </div>

      {/* Investment Amount */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
          <DollarSign size={16} className="text-primary-400" />
          Investment Amount
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
          <input
            type="number"
            value={investmentAmount}
            onChange={(e) => setInvestmentAmount(Number(e.target.value))}
            className="w-full pl-8 pr-4 py-2 bg-gray-700 border-2 border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:border-primary-500 transition-colors"
            min="1"
            step="100"
          />
        </div>
      </div>

      {/* Allocation Mode */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
          <Settings size={16} className="text-primary-400" />
          Allocation Mode
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setInvestmentMode('equal')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              investmentMode === 'equal'
                ? 'bg-primary-600 text-white border-2 border-primary-400'
                : 'bg-gray-700 text-gray-300 border-2 border-gray-600 hover:bg-gray-600'
            }`}
          >
            Equal Weight
          </button>
          <button
            onClick={() => setInvestmentMode('custom')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              investmentMode === 'custom'
                ? 'bg-primary-600 text-white border-2 border-primary-400'
                : 'bg-gray-700 text-gray-300 border-2 border-gray-600 hover:bg-gray-600'
            }`}
          >
            Custom
          </button>
        </div>
      </div>
    </div>
  );
};