import React, { useState, useEffect } from 'react';
import { HiOutlineSearch, HiOutlineFilter, HiX } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

const SearchFilter = ({ onSearch, onFilter, filters = [], searchPlaceholder = "Search...", className = '' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  useEffect(() => {
    const delay = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);
    return () => clearTimeout(delay);
  }, [searchTerm, onSearch]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...activeFilters, [key]: value };
    if (!value) delete newFilters[key];
    setActiveFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    setActiveFilters({});
    onFilter({});
  };

  return (
    <div className={`w-full space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white transition-shadow"
          />
        </div>
        {filters.length > 0 && (
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`px-4 py-2 flex items-center gap-2 border rounded-lg text-sm font-medium transition-colors ${
              isFilterOpen || Object.keys(activeFilters).length > 0
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 border-primary-200 dark:border-primary-800'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <HiOutlineFilter className="w-5 h-5" />
            <span className="hidden sm:inline">Filters</span>
            {Object.keys(activeFilters).length > 0 && (
              <span className="flex items-center justify-center w-5 h-5 text-xs bg-primary-500 text-white rounded-full">
                {Object.keys(activeFilters).length}
              </span>
            )}
          </button>
        )}
      </div>

      <AnimatePresence>
        {isFilterOpen && filters.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filters.map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">{f.label}</label>
                  <select
                    value={activeFilters[f.key] || ''}
                    onChange={(e) => handleFilterChange(f.key, e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:border-primary-500"
                  >
                    <option value="">All</option>
                    {f.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              ))}
              <div className="flex items-end sm:col-span-2 md:col-span-3 lg:col-span-1">
                <button
                  onClick={clearFilters}
                  disabled={Object.keys(activeFilters).length === 0}
                  className="px-4 py-2 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 w-full justify-center"
                >
                  <HiX className="w-4 h-4" /> Clear All
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchFilter;
