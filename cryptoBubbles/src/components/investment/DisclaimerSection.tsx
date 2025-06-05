import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const DisclaimerSection: React.FC = () => {
  return (
    <div className="bg-loss-900 border-2 border-loss-600 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={16} className="text-loss-400" />
        <div className="text-sm font-semibold text-loss-200">This is not financial advice</div>
      </div>
      <div className="text-xs text-loss-300 leading-relaxed">
        Cryptocurrency investments carry high risk. This tool is for educational and research purposes only. 
        Past performance is not indicative of future results.
      </div>
    </div>
  );
};