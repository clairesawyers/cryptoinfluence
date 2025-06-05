import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { ViewMode } from '../types';
import { formatDate } from '../utils/formatting';

interface BubbleControlsProps {
  selectedDate: Date;
  viewMode: ViewMode;
  loading: boolean;
  onDateChange: (date: Date) => void;
  onViewModeChange: (mode: ViewMode) => void;
}

export const BubbleControls: React.FC<BubbleControlsProps> = ({
  selectedDate,
  viewMode,
  loading,
  onDateChange,
  onViewModeChange
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  
  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };
    
    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);
  const handlePreviousDate = () => {
    const newDate = new Date(selectedDate);
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
    }
    onDateChange(newDate);
  };

  const handleNextDate = () => {
    const newDate = new Date(selectedDate);
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
    }
    onDateChange(newDate);
  };

  const getDateDisplayText = (): string => {
    switch (viewMode) {
      case 'day':
        return formatDate(selectedDate);
      case 'week': {
        const weekStart = new Date(selectedDate);
        weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
      }
      case 'month':
        return selectedDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        });
      default:
        return formatDate(selectedDate);
    }
  };

  return (
    <div className="h-16 bg-gray-850 border-b-2 border-gray-700 px-6 flex items-center justify-between shadow-panel-raised">
      {/* Left side - Date Navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={handlePreviousDate}
          disabled={loading}
          className="p-2 rounded-lg bg-gray-800 border-2 border-gray-600 text-gray-300 hover:text-gray-100 hover:border-gray-500 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-panel-raised hover:shadow-panel-floating active:shadow-panel-pressed transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="relative" ref={datePickerRef}>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 border-2 border-gray-600 rounded-lg shadow-panel-raised hover:bg-gray-800 hover:border-gray-500 transition-all duration-200"
          >
            <Calendar size={16} className="text-accent-turquoise" />
            <span className="text-gray-200 font-medium min-w-[200px] text-center">
              {getDateDisplayText()}
            </span>
          </button>
          
          {showDatePicker && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gray-900 border-2 border-gray-600 rounded-lg shadow-panel-floating z-50 p-4">
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  onDateChange(newDate);
                  setShowDatePicker(false);
                }}
                min={(() => {
                  const minDate = new Date();
                  minDate.setMonth(minDate.getMonth() - 12);
                  return minDate.toISOString().split('T')[0];
                })()}
                max={new Date().toISOString().split('T')[0]}
                className="bg-gray-800 border-2 border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-primary-500 transition-colors"
              />
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-900 border-l-2 border-t-2 border-gray-600 rotate-45"></div>
            </div>
          )}
        </div>
        
        <button
          onClick={handleNextDate}
          disabled={loading}
          className="p-2 rounded-lg bg-gray-800 border-2 border-gray-600 text-gray-300 hover:text-gray-100 hover:border-gray-500 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-panel-raised hover:shadow-panel-floating active:shadow-panel-pressed transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      
      {/* Center - View Mode Toggle */}
      <div className="flex items-center gap-1 bg-gray-900 border-2 border-gray-600 rounded-lg p-1 shadow-panel-raised">
        {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => onViewModeChange(mode)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              viewMode === mode
                ? 'bg-primary-600 text-white border-2 border-primary-400 shadow-panel-raised transform -translate-y-0.5'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Right side - Actions */}
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-400 bg-gray-900 border-2 border-gray-600 rounded-lg px-3 py-2 shadow-panel-raised">
          <span className="text-accent-turquoise font-medium">Live</span> • Real-time data
        </div>
      </div>
    </div>
  );
};