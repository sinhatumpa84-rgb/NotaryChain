import React from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useTheme } from '../../hooks/useTheme';

export const ToastProvider = () => {
  const { isDark } = useTheme();

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          color: isDark ? '#fff' : '#0f172a',
          backdropFilter: 'blur(8px)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        success: {
          iconTheme: { primary: '#10b981', secondary: '#fff' },
        },
        error: {
          iconTheme: { primary: '#f43f5e', secondary: '#fff' },
        },
      }}
    />
  );
};

export const showSuccess = (msg) => toast.success(msg);
export const showError = (msg) => toast.error(msg);
export const showInfo = (msg) => toast(msg, { icon: 'ℹ️' });
export const showWarning = (msg) => toast(msg, { icon: '⚠️' });
