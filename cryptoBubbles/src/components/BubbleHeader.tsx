import React, { useState } from 'react';
import { Settings, User, Home } from 'lucide-react';

interface BubbleHeaderProps {
  onHomeClick?: () => void;
}

export const BubbleHeader: React.FC<BubbleHeaderProps> = ({ onHomeClick }) => {
  const [showSettingsTooltip, setShowSettingsTooltip] = useState(false);
  const [showProfileTooltip, setShowProfileTooltip] = useState(false);

  return (
    <header className="h-16 bg-gray-900 border-b-2 border-gray-700 px-6 flex items-center justify-between shadow-panel-raised">
      {/* Left side - Logo and Navigation */}
      <div className="flex items-center gap-8">
        {/* Logo */}
        <button 
          onClick={onHomeClick}
          className="flex items-center gap-2 group"
        >
          <div className="text-2xl font-mono font-bold bg-gradient-to-r from-accent-turquoise-light via-accent-turquoise to-accent-turquoise-dark bg-clip-text text-transparent group-hover:from-accent-turquoise to-primary-400 transition-all duration-200">
            v1bes
          </div>
        </button>
        
        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <button 
            onClick={onHomeClick}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:text-accent-turquoise hover:bg-gray-800 transition-all duration-200"
          >
            <Home size={16} />
            <span className="text-sm font-medium">Home</span>
          </button>
        </nav>
      </div>
      
      {/* Right side - User actions */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <button 
            onClick={() => {
              setShowSettingsTooltip(true);
              setTimeout(() => setShowSettingsTooltip(false), 2000);
            }}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-all duration-200"
          >
            <Settings size={20} />
          </button>
          {showSettingsTooltip && (
            <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-gray-800 border-2 border-gray-600 rounded-lg shadow-panel-floating whitespace-nowrap z-50">
              <div className="text-sm text-gray-300">Coming soon</div>
              <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-800 border-l-2 border-t-2 border-gray-600 transform rotate-45"></div>
            </div>
          )}
        </div>
        
        <div className="relative">
          <button 
            onClick={() => {
              setShowProfileTooltip(true);
              setTimeout(() => setShowProfileTooltip(false), 2000);
            }}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-all duration-200"
          >
            <User size={20} />
          </button>
          {showProfileTooltip && (
            <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-gray-800 border-2 border-gray-600 rounded-lg shadow-panel-floating whitespace-nowrap z-50">
              <div className="text-sm text-gray-300">Coming soon</div>
              <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-800 border-l-2 border-t-2 border-gray-600 transform rotate-45"></div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};