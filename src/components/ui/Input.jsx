/**
 * Input Components - Form inputs with Apple-style design
 */

import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, Search, Calendar, ChevronDown } from 'lucide-react';

const Input = forwardRef(({
  label,
  error,
  helper,
  icon: Icon,
  iconPosition = 'left',
  type = 'text',
  size = 'md',
  fullWidth = true,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  };

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20,
  };

  const paddingWithIcon = {
    left: { sm: 'pl-9', md: 'pl-11', lg: 'pl-12' },
    right: { sm: 'pr-9', md: 'pr-11', lg: 'pr-12' },
  };

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon size={iconSizes[size]} />
          </div>
        )}
        <input
          ref={ref}
          type={isPassword && showPassword ? 'text' : type}
          className={`
            input-glass
            ${sizeStyles[size]}
            ${Icon && iconPosition === 'left' ? paddingWithIcon.left[size] : ''}
            ${(Icon && iconPosition === 'right') || isPassword ? paddingWithIcon.right[size] : ''}
            ${error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {Icon && iconPosition === 'right' && !isPassword && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon size={iconSizes[size]} />
          </div>
        )}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff size={iconSizes[size]} /> : <Eye size={iconSizes[size]} />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-500">{error}</p>
      )}
      {helper && !error && (
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{helper}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Search Input
export const SearchInput = forwardRef(({
  placeholder = 'Buscar...',
  className = '',
  ...props
}, ref) => (
  <Input
    ref={ref}
    type="search"
    icon={Search}
    iconPosition="left"
    placeholder={placeholder}
    className={className}
    {...props}
  />
));

SearchInput.displayName = 'SearchInput';

// Number Input with formatting
export const NumberInput = forwardRef(({
  label,
  prefix,
  suffix,
  error,
  className = '',
  ...props
}, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
    )}
    <div className="relative">
      {prefix && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
          {prefix}
        </span>
      )}
      <input
        ref={ref}
        type="number"
        className={`
          input-glass
          ${prefix ? 'pl-12' : ''}
          ${suffix ? 'pr-12' : ''}
          ${error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {suffix && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
          {suffix}
        </span>
      )}
    </div>
    {error && (
      <p className="mt-1.5 text-sm text-red-500">{error}</p>
    )}
  </div>
));

NumberInput.displayName = 'NumberInput';

// Select Input
export const Select = forwardRef(({
  label,
  options = [],
  placeholder = 'Seleccionar...',
  error,
  className = '',
  ...props
}, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
    )}
    <div className="relative">
      <select
        ref={ref}
        className={`
          input-glass pr-10
          ${error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : ''}
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <ChevronDown size={18} />
      </div>
    </div>
    {error && (
      <p className="mt-1.5 text-sm text-red-500">{error}</p>
    )}
  </div>
));

Select.displayName = 'Select';

// Date Input
export const DateInput = forwardRef(({
  label,
  error,
  className = '',
  ...props
}, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
    )}
    <div className="relative">
      <input
        ref={ref}
        type="date"
        className={`
          input-glass pr-10
          ${error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <Calendar size={18} />
      </div>
    </div>
    {error && (
      <p className="mt-1.5 text-sm text-red-500">{error}</p>
    )}
  </div>
));

DateInput.displayName = 'DateInput';

// Textarea
export const Textarea = forwardRef(({
  label,
  error,
  helper,
  rows = 4,
  className = '',
  ...props
}, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
    )}
    <textarea
      ref={ref}
      rows={rows}
      className={`
        input-glass resize-none
        ${error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : ''}
        ${className}
      `}
      {...props}
    />
    {error && (
      <p className="mt-1.5 text-sm text-red-500">{error}</p>
    )}
    {helper && !error && (
      <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{helper}</p>
    )}
  </div>
));

Textarea.displayName = 'Textarea';

// Toggle Switch
export const Toggle = ({
  label,
  checked,
  onChange,
  disabled = false,
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: { track: 'w-8 h-5', thumb: 'w-4 h-4', translate: 'translate-x-3' },
    md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' },
    lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 'translate-x-7' },
  };

  const styles = sizeStyles[size];

  return (
    <label className={`inline-flex items-center gap-3 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`
            ${styles.track}
            rounded-full transition-colors duration-200
            ${checked ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-600'}
          `}
        />
        <div
          className={`
            ${styles.thumb}
            absolute top-0.5 left-0.5
            bg-white rounded-full shadow-md
            transition-transform duration-200
            ${checked ? styles.translate : 'translate-x-0'}
          `}
        />
      </div>
      {label && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
      )}
    </label>
  );
};

export default Input;
