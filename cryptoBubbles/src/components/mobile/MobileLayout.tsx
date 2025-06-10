import React from 'react';
import { useMobileDetect } from '../../hooks/useMobileDetect';
import { getSafeAreaPadding, getResponsiveClasses } from '../../utils/responsive';

interface MobileLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  sidebarContent?: React.ReactNode;
  className?: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  header,
  footer,
  sidebarContent,
  className = ''
}) => {
  const detection = useMobileDetect();
  const safeArea = getSafeAreaPadding(detection);
  const responsiveClasses = getResponsiveClasses(detection);
  
  if (!detection.isMobile) {
    // Fallback to regular layout for non-mobile devices
    return (
      <div className={`flex flex-col h-screen ${className}`}>
        {header && (
          <header className="flex-shrink-0">
            {header}
          </header>
        )}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
        {footer && (
          <footer className="flex-shrink-0">
            {footer}
          </footer>
        )}
      </div>
    );
  }

  const layoutStyles: React.CSSProperties = {
    paddingTop: safeArea.top,
    paddingBottom: safeArea.bottom,
    paddingLeft: safeArea.left,
    paddingRight: safeArea.right,
    minHeight: '100dvh', // Dynamic viewport height for mobile, fallback to 100vh
  };
  
  return (
    <div 
      className={`mobile-layout flex flex-col ${responsiveClasses} ${className}`}
      style={layoutStyles}
    >
      {/* Header */}
      {header && (
        <header className="flex-shrink-0 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800">
          {header}
        </header>
      )}
      
      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {sidebarContent ? (
          <div className="flex h-full">
            <div className="flex-1 overflow-hidden">
              {children}
            </div>
            <div className="w-80 flex-shrink-0 bg-gray-900 border-l border-gray-800 overflow-y-auto mobile-scroll">
              {sidebarContent}
            </div>
          </div>
        ) : (
          children
        )}
      </main>
      
      {/* Footer */}
      {footer && (
        <footer className="flex-shrink-0 bg-gray-950/95 backdrop-blur-sm border-t border-gray-800">
          {footer}
        </footer>
      )}
    </div>
  );
};