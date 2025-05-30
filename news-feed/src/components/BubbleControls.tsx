import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BubbleControlsProps {
  selectedDate: Date;
  viewMode: 'day' | 'week' | 'month';
  onDateChange: (date: Date) => void;
  onViewModeChange: (mode: 'day' | 'week' | 'month') => void;
  className?: string;
}

const BubbleControls: React.FC<BubbleControlsProps> = ({
  selectedDate,
  viewMode,
  onDateChange,
  onViewModeChange,
  className = '',
}) => {
  const formatDate = (): string => {
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    };
    
    if (viewMode === 'week') {
      const startOfWeek = new Date(selectedDate);
      const day = startOfWeek.getDay();
      startOfWeek.setDate(startOfWeek.getDate() - day);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      
      return `${startOfWeek.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } else if (viewMode === 'month') {
      return selectedDate.toLocaleDateString('en-NZ', { month: 'long', year: 'numeric' });
    }
    
    return selectedDate.toLocaleDateString('en-NZ', options);
  };
  
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    
    onDateChange(newDate);
  };
  
  return (
    <div className={`flex items-center justify-between bg-gray-800 border-b border-gray-700 py-2 px-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => navigateDate('prev')}
          className="p-1 text-gray-400 hover:text-white rounded transition-colors"
          aria-label="Previous date"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="text-white font-medium">
          {formatDate()}
        </div>
        
        <button 
          onClick={() => navigateDate('next')}
          className="p-1 text-gray-400 hover:text-white rounded transition-colors"
          aria-label="Next date"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      
      <div className="flex items-center bg-gray-900 rounded-lg p-1">
        <ViewModeButton 
          active={viewMode === 'day'} 
          onClick={() => onViewModeChange('day')}
        >
          Day
        </ViewModeButton>
        <ViewModeButton 
          active={viewMode === 'week'} 
          onClick={() => onViewModeChange('week')}
        >
          Week
        </ViewModeButton>
        <ViewModeButton 
          active={viewMode === 'month'} 
          onClick={() => onViewModeChange('month')}
        >
          Month
        </ViewModeButton>
      </div>
    </div>
  );
};

interface ViewModeButtonProps {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

const ViewModeButton: React.FC<ViewModeButtonProps> = ({ children, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
        active 
          ? 'bg-primary-600 text-white' 
          : 'text-gray-400 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
};

export default BubbleControls;
