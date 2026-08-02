import React from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage, className = '' }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  // Logic to show limited pages
  let visiblePages = pages;
  if (totalPages > 5) {
    if (currentPage <= 3) {
      visiblePages = [...pages.slice(0, 4), '...', totalPages];
    } else if (currentPage >= totalPages - 2) {
      visiblePages = [1, '...', ...pages.slice(totalPages - 4)];
    } else {
      visiblePages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    }
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-3 ${className}`}>
      {totalItems && (
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Showing <span className="font-medium text-slate-900 dark:text-white">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> to{' '}
          <span className="font-medium text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
          <span className="font-medium text-slate-900 dark:text-white">{totalItems}</span> results
        </div>
      )}
      
      <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700 shadow-sm">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <HiChevronLeft className="w-5 h-5" />
        </button>
        
        {visiblePages.map((p, i) => (
          <button
            key={i}
            onClick={() => p !== '...' && onPageChange(p)}
            disabled={p === '...'}
            className={`min-w-[32px] h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
              p === currentPage
                ? 'bg-primary-500 text-white'
                : p === '...'
                ? 'text-slate-400 cursor-default'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {p}
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <HiChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
