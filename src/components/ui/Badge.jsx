/**
 * Badge Component - Status indicators and labels
 */

import React from 'react';

const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon: Icon,
  dot = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center gap-1.5 font-semibold rounded-full';

  const variantStyles = {
    neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    accent: 'bg-accent/10 text-accent',
  };

  const sizeStyles = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  const iconSizes = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
  };

  const dotSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <span
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span className={`${dotSizes[size]} rounded-full bg-current opacity-70`} />
      )}
      {Icon && <Icon size={iconSizes[size]} />}
      {children}
    </span>
  );
};

// Status badge with built-in icons
export const StatusBadge = ({ status, size = 'md', className = '' }) => {
  const statusConfig = {
    active: { variant: 'success', label: 'Activo', dot: true },
    inactive: { variant: 'neutral', label: 'Inactivo', dot: true },
    pending: { variant: 'warning', label: 'Pendiente', dot: true },
    completed: { variant: 'success', label: 'Completado', dot: true },
    overdue: { variant: 'danger', label: 'Vencido', dot: true },
    partial: { variant: 'warning', label: 'Parcial', dot: true },
    paid: { variant: 'success', label: 'Pagado', dot: true },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge variant={config.variant} size={size} dot={config.dot} className={className}>
      {config.label}
    </Badge>
  );
};

// Urgency badge
export const UrgencyBadge = ({ urgency, size = 'md', className = '' }) => {
  const urgencyConfig = {
    alta: { variant: 'danger', label: 'Urgente' },
    media: { variant: 'warning', label: 'Pronto' },
    baja: { variant: 'success', label: 'Tranquilo' },
  };

  const config = urgencyConfig[urgency] || urgencyConfig.baja;

  return (
    <Badge variant={config.variant} size={size} className={className}>
      {config.label}
    </Badge>
  );
};

// Counter badge (for notifications, etc.)
export const CounterBadge = ({ count, max = 99, variant = 'danger', className = '' }) => {
  const displayCount = count > max ? `${max}+` : count;

  if (count <= 0) return null;

  return (
    <span
      className={`
        inline-flex items-center justify-center
        min-w-[18px] h-[18px] px-1
        text-[10px] font-bold text-white
        rounded-full
        ${variant === 'danger' ? 'bg-red-500' : variant === 'accent' ? 'bg-accent' : 'bg-gray-500'}
        ${className}
      `}
    >
      {displayCount}
    </span>
  );
};

export default Badge;
