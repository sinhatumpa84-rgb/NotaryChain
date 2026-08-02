import React from 'react';
import { formatRelativeTime } from '../../utils/formatters';
import { motion } from 'framer-motion';
import LoadingSkeleton from './LoadingSkeleton';

const ActivityTimeline = ({ activities = [], loading = false, className = '' }) => {
  if (loading) {
    return <LoadingSkeleton type="text" count={6} className={className} />;
  }

  if (!activities.length) {
    return <p className="text-sm text-slate-500 italic">No activity recorded yet.</p>;
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'auth': return 'bg-blue-500';
      case 'document': return 'bg-indigo-500';
      case 'verification': return 'bg-violet-500';
      case 'admin': return 'bg-amber-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute top-0 bottom-0 left-4 w-px bg-slate-200 dark:bg-slate-700" />
      <div className="space-y-6 relative">
        {activities.map((activity, index) => (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            key={activity.id || index}
            className="flex gap-4"
          >
            <div className="relative mt-1">
              <div className={`w-2.5 h-2.5 rounded-full ring-4 ring-white dark:ring-slate-900 ${getTypeColor(activity.type)} relative z-10 mx-[11px]`} />
            </div>
            <div className="flex-1 pb-1">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {activity.user}
                </p>
                <p className="text-xs text-slate-500">
                  {formatRelativeTime(activity.timestamp)}
                </p>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {activity.description}
              </p>
              {activity.metadata && (
                <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-md text-xs text-slate-500 font-mono">
                  {JSON.stringify(activity.metadata)}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTimeline;
