import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineHome, HiOutlineDocumentText, HiOutlineBadgeCheck, HiOutlineUser, HiOutlineCog, HiOutlineUsers, HiOutlineChartPie, HiOutlineClipboardList, HiOutlineCreditCard } from 'react-icons/hi';
import { HiOutlineCpuChip } from 'react-icons/hi2';

import { useAuth } from '../../hooks/useAuth';
import { SIDEBAR_MENUS, ROLES } from '../../utils/constants';

const iconMap = {
  FiHome:       HiOutlineHome,
  FiCreditCard: HiOutlineCreditCard,
  FiFileText:   HiOutlineDocumentText,
  FiCheckCircle:HiOutlineBadgeCheck,
  FiUser:       HiOutlineUser,
  FiSettings:   HiOutlineCog,
  FiUsers:      HiOutlineUsers,
  FiPieChart:   HiOutlineChartPie,
  FiActivity:   HiOutlineClipboardList,
  FiHexagon:    HiOutlineCpuChip,
};


const Sidebar = ({ collapsed, onToggle }) => {
  const { user } = useAuth();
  const menuItems = user?.role === ROLES.ADMIN ? SIDEBAR_MENUS[ROLES.ADMIN] : SIDEBAR_MENUS.DEFAULT;

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      className="h-screen sticky top-0 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 z-40"
    >
      <div className="h-16 flex items-center justify-center border-b border-slate-200 dark:border-slate-800 shrink-0 px-4">
        {collapsed ? (
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center font-bold text-white">N</div>
        ) : (
          <div className="flex items-center gap-2 w-full">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center font-bold text-white shrink-0">N</div>
            <span className="font-display font-bold text-lg text-slate-900 dark:text-white tracking-wide truncate">NotaryChain</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
        {menuItems.map((item) => {
          const Icon = iconMap[item.icon] || HiOutlineHome;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                ${isActive ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold' : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white text-slate-500 dark:text-slate-400'}
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              {({ isActive }) => (
                <>
                  {isActive && <motion.div layoutId="activeNav" className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-r-full" />}
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white'}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} bg-slate-100 dark:bg-slate-800/50 rounded-xl p-2`}>
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 text-sm font-semibold text-slate-700 dark:text-slate-300">
            {user?.name?.charAt(0) || 'U'}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.role || 'Company'}</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
