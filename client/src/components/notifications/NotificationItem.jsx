import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineDocument, HiOutlineBadgeCheck, HiOutlineExclamationCircle, HiOutlineInformationCircle } from 'react-icons/hi';
import { formatRelativeTime } from '../../utils/formatters';
import { useNotifications } from '../../hooks/useNotifications';

const iconMap = {
  document: { icon: HiOutlineDocument, bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' },
  approval: { icon: HiOutlineBadgeCheck, bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' },
  fraud: { icon: HiOutlineExclamationCircle, bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-600 dark:text-rose-400' },
  info: { icon: HiOutlineInformationCircle, bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' }
};

const NotificationItem = ({ notification, onClose }) => {
  const { markAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleClick = () => {
    if (!notification.isRead) markAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      onClose();
    }
  };

  const style = iconMap[notification.type] || iconMap.info;
  const Icon = style.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={handleClick}
      className={`relative p-3 rounded-xl border transition-all cursor-pointer ${
        notification.isRead
          ? 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800/50 opacity-75'
          : 'bg-primary-50/50 dark:bg-primary-900/10 border-primary-100 dark:border-primary-900/50 shadow-sm'
      }`}
    >
      {!notification.isRead && (
        <span className="absolute top-4 right-3 w-2 h-2 rounded-full bg-primary-500" />
      )}
      <div className="flex gap-3">
        <div className={`p-2 rounded-lg shrink-0 h-10 w-10 flex items-center justify-center ${style.bg} ${style.text}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 pr-4">
          <h4 className={`text-sm ${notification.isRead ? 'font-medium text-slate-700 dark:text-slate-300' : 'font-semibold text-slate-900 dark:text-white'}`}>
            {notification.title}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
            {notification.message}
          </p>
          <span className="text-[10px] text-slate-400 mt-2 block">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationItem;
