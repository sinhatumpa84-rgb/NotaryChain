import React from 'react';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon,
  disabled = false,
  required = false,
  className = '',
  id,
  name,
  ...props
}) => {
  const inputId = id || name;

  // Handle both: icon={HiOutlineEnvelope} (component ref) and icon={<HiOutlineEnvelope />} (JSX element)
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      // JSX element passed directly — clone it with the correct class
      return React.cloneElement(icon, { className: 'h-5 w-5 text-slate-400' });
    }
    // Component reference passed — render it
    const Icon = icon;
    return <Icon className="h-5 w-5 text-slate-400" />;
  };

  const hasIcon = !!icon;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        {hasIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {renderIcon()}
          </div>
        )}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            block w-full rounded-lg sm:text-sm transition-colors duration-200
            ${hasIcon ? 'pl-10' : 'pl-3'} pr-3 py-2.5
            bg-white dark:bg-slate-900 
            border ${error ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-300 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500'}
            text-slate-900 dark:text-white
            placeholder-slate-400 dark:placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-opacity-50
            disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200
            dark:disabled:bg-slate-800 dark:disabled:text-slate-400 dark:disabled:border-slate-700
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-rose-500">{error}</p>
      )}
    </div>
  );
};

export default Input;
