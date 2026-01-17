/**
 * Button Component - Apple-style buttons with variants
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-semibold transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantStyles = {
    primary: `
      btn-primary
      focus:ring-accent/50
    `,
    secondary: `
      bg-gray-100 dark:bg-gray-800
      text-gray-900 dark:text-white
      hover:bg-gray-200 dark:hover:bg-gray-700
      rounded-2xl
      focus:ring-gray-500/50
    `,
    outline: `
      border-2 border-gray-200 dark:border-gray-700
      bg-transparent
      text-gray-900 dark:text-white
      hover:bg-gray-50 dark:hover:bg-gray-800
      rounded-2xl
      focus:ring-gray-500/50
    `,
    ghost: `
      bg-transparent
      text-gray-600 dark:text-gray-400
      hover:bg-gray-100 dark:hover:bg-gray-800
      hover:text-gray-900 dark:hover:text-white
      rounded-xl
      focus:ring-gray-500/50
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-red-600
      text-white
      hover:from-red-600 hover:to-red-700
      rounded-2xl
      focus:ring-red-500/50
      shadow-lg hover:shadow-xl
    `,
    success: `
      bg-gradient-to-r from-green-500 to-green-600
      text-white
      hover:from-green-600 hover:to-green-700
      rounded-2xl
      focus:ring-green-500/50
      shadow-lg hover:shadow-xl
    `,
    glass: `
      bg-white/20 backdrop-blur-sm
      text-white
      border border-white/30
      hover:bg-white/30
      rounded-2xl
      focus:ring-white/50
    `,
  };

  const sizeStyles = {
    xs: 'px-3 py-1.5 text-xs rounded-lg',
    sm: 'px-4 py-2 text-sm rounded-xl',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  };

  const iconSizes = {
    xs: 12,
    sm: 14,
    md: 18,
    lg: 20,
    xl: 24,
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${widthStyle}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={iconSizes[size]} className="animate-spin" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={iconSizes[size]} />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon size={iconSizes[size]} />}
        </>
      )}
    </button>
  );
};

// Icon-only button
export const IconButton = ({
  icon: Icon,
  size = 'md',
  variant = 'ghost',
  className = '',
  ...props
}) => {
  const sizeStyles = {
    xs: 'p-1.5',
    sm: 'p-2',
    md: 'p-2.5',
    lg: 'p-3',
    xl: 'p-4',
  };

  const iconSizes = {
    xs: 14,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
  };

  const variantStyles = {
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400',
    solid: 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400',
    primary: 'bg-accent hover:bg-accent-dark text-white',
    glass: 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm',
  };

  return (
    <button
      type="button"
      className={`
        inline-flex items-center justify-center
        rounded-xl transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-accent/50
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      <Icon size={iconSizes[size]} />
    </button>
  );
};

// Floating Action Button
export const FAB = ({
  icon: Icon,
  onClick,
  position = 'bottom-right',
  variant = 'primary',
  className = '',
  ...props
}) => {
  const positionStyles = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'bottom-center': 'fixed bottom-6 left-1/2 -translate-x-1/2',
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-accent to-accent-light text-white shadow-glow-accent',
    success: 'bg-gradient-to-r from-green-500 to-green-400 text-white shadow-glow-green',
    danger: 'bg-gradient-to-r from-red-500 to-red-400 text-white',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        ${positionStyles[position]}
        ${variantStyles[variant]}
        w-14 h-14 rounded-full
        flex items-center justify-center
        shadow-float
        transition-all duration-200
        hover:scale-110 active:scale-95
        z-40
        ${className}
      `}
      {...props}
    >
      <Icon size={24} />
    </button>
  );
};

export default Button;
