import React from 'react';
import { HiOutlineMenu, HiOutlineSearch, HiSun, HiMoon } from 'react-icons/hi';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import NotificationBell from '../notifications/NotificationBell';

const Header = ({ onMenuToggle }) => {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white/85 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md sticky top-0 z-30 px-4 flex items-center justify-between shadow-sm dark:shadow-none">
      <div className="flex items-center gap-4">
        <button onClick={onMenuToggle} className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden">
          <HiOutlineMenu className="w-5 h-5" />
        </button>
        <div className="relative hidden sm:block">
          <HiOutlineSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search documents..." 
            className="pl-9 pr-4 py-1.5 bg-slate-100 dark:bg-slate-800 border-none rounded-full text-sm focus:ring-2 focus:ring-primary-500 w-64 transition-all focus:w-80 outline-none text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button onClick={toggleTheme} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          {isDark ? <HiSun className="w-5 h-5 text-amber-500" /> : <HiMoon className="w-5 h-5 text-indigo-500" />}
        </button>
        
        <NotificationBell />

        <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-white font-medium cursor-pointer shadow-sm border-2 border-white dark:border-slate-800">
          {user?.name?.charAt(0) || 'U'}
        </div>
      </div>
    </header>
  );
};

export default Header;
