import React, { useEffect, useState } from 'react';
import Card from './Card';
import { HiTrendingUp, HiTrendingDown } from 'react-icons/hi';
import LoadingSkeleton from './LoadingSkeleton';

const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection = 'up',
  color = 'primary',
  loading = false,
  className = '',
  subtitle
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (loading || isNaN(value)) return;
    const end = parseFloat(value);
    const duration = 1000;
    const stepTime = 20;
    const steps = duration / stepTime;
    const inc = end / steps;
    
    let current = 0;
    const timer = setInterval(() => {
      current += inc;
      if (current >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, loading]);

  const colorMap = {
    primary: 'text-primary-500 bg-primary-50 dark:bg-primary-900/20 border-primary-500',
    success: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500',
    warning: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-500',
    danger: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20 border-rose-500',
  };

  if (loading) return <LoadingSkeleton type="stats" count={1} className={className} />;

  const [textCol, bgCol, borderCol] = colorMap[color].split(' ');

  return (
    <Card hover className={`overflow-hidden border-l-4 ${borderCol} ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</h4>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            {typeof value === 'number' ? (Number.isInteger(value) ? Math.floor(displayValue) : displayValue.toFixed(1)) : value}
          </div>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${bgCol} ${textCol}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      
      {trend && (
        <div className="flex items-center gap-1.5 mt-2">
          <div className={`flex items-center text-xs font-medium ${trendDirection === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trendDirection === 'up' ? <HiTrendingUp /> : <HiTrendingDown />}
            <span className="ml-1">{trend}%</span>
          </div>
          <span className="text-xs text-slate-400">vs last month</span>
        </div>
      )}
    </Card>
  );
};

export default StatsCard;
