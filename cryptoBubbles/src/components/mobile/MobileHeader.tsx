import React from 'react';
import { ArrowLeft, Menu, Settings } from 'lucide-react';
import { useMobileDetect } from '../../hooks/useMobileDetect';
import { getResponsiveValue, TOUCH_TARGETS } from '../../utils/responsive';

interface MobileHeaderProps {
  title?: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  showSettingsButton?: boolean;
  onBackPress?: () => void;
  onMenuPress?: () => void;
  onSettingsPress?: () => void;
  rightElement?: React.ReactNode;
  className?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title = 'V1bes',
  showBackButton = false,
  showMenuButton = true,
  showSettingsButton = true,
  onBackPress,
  onMenuPress,
  onSettingsPress,
  rightElement,
  className = ''
}) => {
  const detection = useMobileDetect();
  const touchTargetSize = getResponsiveValue(TOUCH_TARGETS, detection);

  if (!detection.isMobile) {
    return null; // Don't render mobile header on desktop
  }

  const buttonStyle: React.CSSProperties = {
    minWidth: touchTargetSize,
    minHeight: touchTargetSize,
  };

  return (
    <header 
      className={`
        bg-gray-900/95 backdrop-blur-md border-b border-gray-800
        flex items-center justify-between px-4 py-3
        ${className}
      `}
      style={{ minHeight: 64 }}
    >
      {/* Left Section */}
      <div className="flex items-center">
        {showBackButton && onBackPress && (
          <button
            onClick={onBackPress}
            className="
              p-2 hover:bg-gray-800 rounded-lg transition-colors
              flex items-center justify-center
            "
            style={buttonStyle}
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-gray-300" />
          </button>
        )}
        
        {showMenuButton && !showBackButton && onMenuPress && (
          <button
            onClick={onMenuPress}
            className="
              p-2 hover:bg-gray-800 rounded-lg transition-colors
              flex items-center justify-center
            "
            style={buttonStyle}
            aria-label="Open menu"
          >
            <Menu size={20} className="text-gray-300" />
          </button>
        )}
      </div>

      {/* Center Section - Title */}
      <div className="flex-1 flex justify-center">
        <h1 className="text-lg font-semibold text-gray-100 truncate px-4">
          {title}
        </h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {rightElement}
        
        {showSettingsButton && onSettingsPress && (
          <button
            onClick={onSettingsPress}
            className="
              p-2 hover:bg-gray-800 rounded-lg transition-colors
              flex items-center justify-center
            "
            style={buttonStyle}
            aria-label="Settings"
          >
            <Settings size={20} className="text-gray-300" />
          </button>
        )}
      </div>
    </header>
  );
};