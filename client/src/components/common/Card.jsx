import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  hover = false,
  gradient = false,
  padding = 'p-6',
  onClick
}) => {
  const Component = onClick || hover ? motion.div : 'div';
  
  const hoverProps = (onClick || hover) ? {
    whileHover: { y: -4, transition: { duration: 0.2 } },
    className: 'cursor-pointer hover:shadow-xl dark:hover:shadow-primary-900/20'
  } : {};

  return (
    <Component
      onClick={onClick}
      {...hoverProps}
      className={`
        relative overflow-hidden rounded-2xl
        glass-dark dark:glass-dark bg-white/70 dark:bg-slate-800/70
        border border-slate-200 dark:border-white/10
        shadow-sm backdrop-blur-xl
        ${padding}
        ${hoverProps.className || ''}
        ${className}
      `}
    >
      {gradient && (
        <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />
      )}
      {children}
    </Component>
  );
};

export default Card;
