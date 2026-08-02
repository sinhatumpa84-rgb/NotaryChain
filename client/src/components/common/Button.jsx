import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseStyles = 'relative inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg outline-none';
  
  const variants = {
    primary: 'text-white gradient-primary hover:shadow-lg hover:shadow-primary-500/25 border border-transparent',
    secondary: 'text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 dark:text-white dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700',
    danger: 'text-white bg-rose-500 hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-500/25 border border-transparent',
    ghost: 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 border border-transparent',
    outline: 'text-primary-600 border border-primary-500 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-500/10'
  };

  const sizes = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3'
  };

  return (
    <motion.button
      type={type}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${disabled || isLoading ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : Icon ? (
        <Icon className="mr-2 h-5 w-5" />
      ) : null}
      {children}
    </motion.button>
  );
};

export default Button;
