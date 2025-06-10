import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ViewMode } from '../../types';
import { formatDate } from '../../utils/formatting';
import { useMobileDetect } from '../../hooks/useMobileDetect';
import { getResponsiveValue, TOUCH_TARGETS } from '../../utils/responsive';

interface MobileBubbleControlsProps {
  selectedDate: Date;
  viewMode: ViewMode;
  loading: boolean;
  onDateChange: (date: Date) => void;
  onViewModeChange: (mode: ViewMode) => void;
}

export const MobileBubbleControls: React.FC<MobileBubbleControlsProps> = ({
  selectedDate,
  viewMode,
  loading,
  onDateChange,
  onViewModeChange
}) => {
  const detection = useMobileDetect();
  const touchTargetSize = getResponsiveValue(TOUCH_TARGETS, detection);
  
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
        if (detection.screenSize === 'xs') {
          // Short format for very small screens
          return selectedDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
        }
        return formatDate(selectedDate);
      case 'week': {
        const weekStart = new Date(selectedDate);
        weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        if (detection.screenSize === 'xs') {
          return `${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`;
        }
        
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      }
      case 'month':
        return selectedDate.toLocaleDateString('en-US', { 
          year: '2-digit', 
          month: 'short' 
        });
      default:
        return formatDate(selectedDate);
    }
  };

  const buttonStyle: React.CSSProperties = {
    minWidth: touchTargetSize,
    minHeight: touchTargetSize,
  };

  return (
    <div className="flex items-center justify-between gap-2 p-4">
      {/* Compact Date Navigation */}
      <button
        onClick={handlePreviousDate}
        disabled={loading}
        className="p-2 rounded-lg bg-gray-800 text-gray-300 active:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        style={buttonStyle}
        aria-label="Previous date"
      >
        <ChevronLeft size={18} />
      </button>
      
      <div className="flex-1 text-center">
        <div className="text-sm font-medium text-gray-200">
          {getDateDisplayText()}
        </div>
        <div className="text-xs text-gray-400">
          {viewMode === 'day' && 'Daily View'}
          {viewMode === 'week' && 'Weekly View'}
          {viewMode === 'month' && 'Monthly View'}
        </div>
      </div>
      
      <button
        onClick={handleNextDate}
        disabled={loading}
        className="p-2 rounded-lg bg-gray-800 text-gray-300 active:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        style={buttonStyle}
        aria-label="Next date"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};