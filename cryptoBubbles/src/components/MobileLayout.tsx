import React, { useState } from 'react';
import { Menu, X, Calendar, BarChart3 } from 'lucide-react';
import { useMobileDetect } from '../hooks/useMobileDetect';
import { useTouchGestures } from '../hooks/useTouchGestures';

interface MobileLayoutProps {
  children: React.ReactNode;
  headerContent?: React.ReactNode;
  navigationContent?: React.ReactNode;
  sidebarContent?: React.ReactNode;
  bottomBarContent?: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  headerContent,
  navigationContent,
  sidebarContent,
  bottomBarContent
}) => {
  const { isMobile, isTablet, screenSize } = useMobileDetect();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchGestures({
    onSwipe: (direction) => {
      if (direction === 'right' && !isMenuOpen) {
        setIsMenuOpen(true);
      } else if (direction === 'left' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    }
  });

  // Desktop layout
  if (!isMobile && !isTablet) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col">
        {headerContent && (
          <header className="bg-gray-900 border-b border-gray-800">
            {headerContent}
          </header>
        )}
        <div className="flex-1 flex">
          {navigationContent && (
            <nav className="w-64 bg-gray-900 border-r border-gray-800">
              {navigationContent}
            </nav>
          )}
          <main className="flex-1 flex">
            <div className="flex-1">{children}</div>
            {sidebarContent && (
              <aside className="w-80 bg-gray-900 border-l border-gray-800">
                {sidebarContent}
              </aside>
            )}
          </main>
        </div>
      </div>
    );
  }

  // Mobile/Tablet layout
  return (
    <div 
      className="min-h-screen bg-gray-950 flex flex-col relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Mobile Header */}
      <header className="bg-gray-900 border-b border-gray-800 h-14 flex items-center justify-between px-4 sticky top-0 z-50">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 -ml-2 hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        <div className="flex-1 mx-4">
          {headerContent}
        </div>
        
        {sidebarContent && (
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 -mr-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <BarChart3 size={24} />
          </button>
        )}
      </header>

      {/* Mobile Navigation Drawer */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          className="absolute inset-0 bg-black/50"
          onClick={() => setIsMenuOpen(false)}
        />
        <nav
          className={`absolute left-0 top-0 h-full w-64 bg-gray-900 shadow-xl transform transition-transform duration-300 ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold">Navigation</h2>
          </div>
          <div className="p-4">
            {navigationContent}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main className={`flex-1 ${bottomBarContent ? 'pb-16' : ''}`}>
        {children}
      </main>

      {/* Mobile Sidebar Drawer */}
      {sidebarContent && (
        <div
          className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
            isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsSidebarOpen(false)}
          />
          <aside
            className={`absolute right-0 top-0 h-full w-full max-w-sm bg-gray-900 shadow-xl transform transition-transform duration-300 ${
              isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="h-full overflow-y-auto">
              {sidebarContent}
            </div>
          </aside>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      {bottomBarContent && (
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 h-16 z-30">
          {bottomBarContent}
        </nav>
      )}
    </div>
  );
};