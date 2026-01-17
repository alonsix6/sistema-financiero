/**
 * Card Component - Glass morphism card with variants
 */

import React from 'react';

const Card = ({
  children,
  className = '',
  variant = 'glass',
  hover = false,
  padding = 'md',
  onClick,
  ...props
}) => {
  const baseStyles = 'rounded-3xl transition-all duration-300';

  const variantStyles = {
    glass: 'glass-card',
    'glass-light': 'glass-card-light',
    solid: 'bg-white dark:bg-gray-800 shadow-card',
    gradient: '',
    outlined: 'border-2 border-gray-200 dark:border-gray-700 bg-transparent',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = hover
    ? 'cursor-pointer hover:shadow-card-hover hover:-translate-y-1'
    : '';

  return (
    <div
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${hoverStyles}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// Gradient card variant
export const GradientCard = ({
  children,
  gradient = 'green',
  className = '',
  padding = 'md',
  ...props
}) => {
  const gradientStyles = {
    green: 'card-gradient-green',
    blue: 'card-gradient-blue',
    purple: 'card-gradient-purple',
    orange: 'card-gradient-orange',
    pink: 'card-gradient-pink',
    teal: 'card-gradient-teal',
    accent: 'bg-gradient-to-br from-accent to-accent-light',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        rounded-3xl shadow-lg text-white
        ${gradientStyles[gradient]}
        ${paddingStyles[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

// Stat card for displaying metrics
export const StatCard = ({
  label,
  value,
  icon: Icon,
  trend,
  trendValue,
  gradient,
  className = '',
}) => {
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400';

  if (gradient) {
    return (
      <GradientCard gradient={gradient} className={className}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm opacity-80 mb-1">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
            {trendValue && (
              <p className={`text-sm mt-2 ${trendColor}`}>
                {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}{trendValue}
              </p>
            )}
          </div>
          {Icon && (
            <div className="bg-white/20 p-3 rounded-2xl">
              <Icon size={24} className="text-white" />
            </div>
          )}
        </div>
      </GradientCard>
    );
  }

  return (
    <Card className={`glass-card-hover ${className}`} hover>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trendValue && (
            <p className={`text-sm mt-2 ${trendColor}`}>
              {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}{trendValue}
            </p>
          )}
        </div>
        {Icon && (
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-2xl">
            <Icon size={24} className="text-gray-600 dark:text-gray-400" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default Card;
