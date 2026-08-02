import React from 'react';
import { HiChevronUp, HiChevronDown } from 'react-icons/hi';
import LoadingSkeleton from './LoadingSkeleton';

const Table = ({
  columns,
  data,
  loading,
  onSort,
  sortBy,
  sortOrder,
  onRowClick,
  emptyMessage = 'No data available',
  className = ''
}) => {
  if (loading) {
    return <LoadingSkeleton type="table" count={5} className={className} />;
  }

  return (
    <div className={`overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            {columns.map((col, i) => (
              <th
                key={i}
                onClick={() => col.sortable && onSort && onSort(col.key)}
                className={`px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider ${col.sortable ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 select-none' : ''}`}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortBy === col.key && (
                    <span className="text-primary-500">
                      {sortOrder === 'asc' ? <HiChevronUp /> : <HiChevronDown />}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-transparent divide-y divide-slate-200 dark:divide-slate-700/50">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={`group ${onRowClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors' : ''} dark:bg-transparent`}
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
