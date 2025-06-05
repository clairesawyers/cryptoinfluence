import React from 'react';
import { ChevronDown, Info } from 'lucide-react';

interface MethodologySectionProps {
  showMethodology: boolean;
  setShowMethodology: (show: boolean) => void;
  investmentMode: 'equal' | 'custom';
}

export const MethodologySection: React.FC<MethodologySectionProps> = ({
  showMethodology,
  setShowMethodology,
  investmentMode
}) => {
  return (
    <div className="bg-gray-900 border-2 border-gray-700 rounded-lg">
      <button
        onClick={() => setShowMethodology(!showMethodology)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-800 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          <Info size={16} className="text-primary-400" />
          <span className="font-medium text-gray-200">Methodology & Settings</span>
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform ${showMethodology ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {showMethodology && (
        <div className="px-4 pb-4 border-t border-gray-700">
          <div className="space-y-2 text-sm text-gray-400 mt-4">
            <div className="flex items-start gap-2">
              <span className="text-primary-400">•</span>
              <div>
                <strong className="text-gray-300">Reference Point:</strong> Video Upload Time
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary-400">•</span>
              <div>
                <strong className="text-gray-300">Strategy:</strong> Buy and Hold (No Rebalancing)
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary-400">•</span>
              <div>
                <strong className="text-gray-300">Allocation:</strong> {
                  investmentMode === 'equal' 
                    ? 'Equal Amount Per Selected Coin' 
                    : 'Custom Amount Per Coin'
                }
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary-400">•</span>
              <div>
                <strong className="text-gray-300">Data Source:</strong> Historical price data
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary-400">•</span>
              <div>
                <strong className="text-primary-400">Future:</strong> Alternative strategies coming soon
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};