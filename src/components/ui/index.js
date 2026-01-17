/**
 * UI Components - Centralized exports
 */

// Icons
export * from './Icons';
export { default as Icon } from './Icons';

// Card
export { default as Card, GradientCard, StatCard } from './Card';

// Button
export { default as Button, IconButton, FAB } from './Button';

// Badge
export { default as Badge, StatusBadge, UrgencyBadge, CounterBadge } from './Badge';

// Modal
export { default as Modal, ConfirmModal, Toast } from './Modal';

// Input
export {
  default as Input,
  SearchInput,
  NumberInput,
  Select,
  DateInput,
  Textarea,
  Toggle
} from './Input';

// Loading Component
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeStyles = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`
          ${sizeStyles[size]}
          border-2 border-gray-200 dark:border-gray-700
          border-t-accent
          rounded-full
          animate-spin
        `}
      />
    </div>
  );
};

// Empty State Component
export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className = ''
}) => (
  <div className={`text-center py-12 ${className}`}>
    {Icon && (
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
        <Icon size={32} className="text-gray-400" />
      </div>
    )}
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
      {title}
    </h3>
    {description && (
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
        {description}
      </p>
    )}
    {action}
  </div>
);

// Progress Bar Component
export const ProgressBar = ({
  value,
  max = 100,
  color = 'accent',
  size = 'md',
  showLabel = false,
  className = ''
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const colorStyles = {
    accent: 'bg-accent',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
  };

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-500 dark:text-gray-400">Progreso</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${sizeStyles[size]}`}>
        <div
          className={`${colorStyles[color]} ${sizeStyles[size]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Progress Ring Component
export const ProgressRing = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = '#FF2D55',
  bgColor = '#E5E7EB',
  children,
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
};

// Divider Component
export const Divider = ({ className = '' }) => (
  <div className={`h-px bg-gray-200 dark:bg-gray-700 ${className}`} />
);

// Skeleton Loader
export const Skeleton = ({
  variant = 'text',
  width,
  height,
  className = ''
}) => {
  const variantStyles = {
    text: 'h-4 rounded',
    title: 'h-6 rounded',
    avatar: 'rounded-full',
    card: 'rounded-2xl',
    button: 'h-10 rounded-xl',
  };

  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${variantStyles[variant]} ${className}`}
      style={{ width, height }}
    />
  );
};
