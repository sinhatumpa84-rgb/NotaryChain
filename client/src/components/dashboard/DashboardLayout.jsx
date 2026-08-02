import React from 'react';

const DashboardLayout = ({ title, subtitle, actions, children }) => {
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
      {(title || subtitle || actions) && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            {title && <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{title}</h1>}
            {subtitle && <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{subtitle}</p>}
          </div>
          {actions && (
            <div className="flex gap-3">
              {actions}
            </div>
          )}
        </div>
      )}
      <div>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
