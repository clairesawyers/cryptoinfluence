import React from 'react';
import { Settings, User, LayoutDashboard, BarChart2, TrendingUp } from 'lucide-react';

interface BubbleHeaderProps {
  className?: string;
}

const BubbleHeader: React.FC<BubbleHeaderProps> = ({ className = '' }) => {
  return (
    <header className={`bg-gray-900 border-b border-gray-800 py-3 px-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="text-primary-400 font-display text-xl font-bold">
            v1bes
          </div>
          
          <nav className="hidden md:flex items-center space-x-4">
            <NavLink icon={<LayoutDashboard size={16} />} href="#" active>
              Dashboard
            </NavLink>
            <NavLink icon={<BarChart2 size={16} />} href="#">
              Analytics
            </NavLink>
            <NavLink icon={<TrendingUp size={16} />} href="#">
              Trends
            </NavLink>
          </nav>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="p-2 text-gray-400 hover:text-white rounded-full transition-colors">
            <Settings size={20} />
          </button>
          <button className="p-2 text-gray-400 hover:text-white rounded-full transition-colors">
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

interface NavLinkProps {
  children: React.ReactNode;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ children, href, icon, active = false }) => {
  const baseClasses = "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors";
  const activeClasses = "bg-gray-800 text-white";
  const inactiveClasses = "text-gray-400 hover:text-white hover:bg-gray-800";
  
  return (
    <a 
      href={href}
      className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </a>
  );
};

export default BubbleHeader;
