import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiCheck } from 'react-icons/hi';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationItem from './NotificationItem';
import LoadingSkeleton from '../common/LoadingSkeleton';

const NotificationPanel = ({ isOpen, onClose }) => {
  const { notifications, loading, markAllAsRead, fetchNotifications } = useNotifications();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Notifications</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1"
                >
                  <HiCheck /> Mark all read
                </button>
                <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <HiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading && !notifications.length ? (
                <LoadingSkeleton type="card" count={4} />
              ) : notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
                    <HiCheck className="w-8 h-8 text-slate-400" />
                  </div>
                  <p>You're all caught up!</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <NotificationItem key={notif.id} notification={notif} onClose={onClose} />
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
