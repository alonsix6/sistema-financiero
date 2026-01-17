/**
 * Constantes y configuración del sistema financiero
 * Updated with Lucide icon names instead of emojis
 */

export const MASTER_PIN = '764958';

// Expense categories with Lucide icon names
export const CATEGORIAS = [
  { valor: 'Alimentacion', iconName: 'Utensils', color: '#F59E0B' },
  { valor: 'Transporte', iconName: 'Car', color: '#3B82F6' },
  { valor: 'Entretenimiento', iconName: 'Film', color: '#8B5CF6' },
  { valor: 'Hormiga', iconName: 'Coffee', color: '#EF4444' },
  { valor: 'Gimnasio', iconName: 'HeartPulse', color: '#10B981' },
  { valor: 'Suscripciones', iconName: 'RefreshCcw', color: '#6366F1' },
  { valor: 'Inversiones', iconName: 'TrendingUp', color: '#14B8A6' },
  { valor: 'Servicios', iconName: 'Zap', color: '#F97316' },
  { valor: 'Salud', iconName: 'HeartPulse', color: '#EC4899' },
  { valor: 'Educacion', iconName: 'GraduationCap', color: '#8B5CF6' },
  { valor: 'Hogar', iconName: 'Home', color: '#059669' },
  { valor: 'Ropa', iconName: 'Shirt', color: '#DB2777' },
  { valor: 'Tecnologia', iconName: 'Smartphone', color: '#0EA5E9' },
  { valor: 'Otros', iconName: 'MoreHorizontal', color: '#6B7280' }
];

// Income types with Lucide icon names
export const TIPOS_INGRESO = [
  { valor: 'Salario', iconName: 'Briefcase', color: '#10B981' },
  { valor: 'Freelance', iconName: 'Laptop', color: '#6366F1' },
  { valor: 'Inversiones', iconName: 'LineChart', color: '#14B8A6' },
  { valor: 'Regalo', iconName: 'Gift', color: '#F59E0B' },
  { valor: 'Otros', iconName: 'Coins', color: '#6B7280' }
];

// Banks with gradient colors
export const BANCOS = [
  { nombre: 'BCP', color: 'from-blue-600 to-blue-700', iconName: 'Landmark' },
  { nombre: 'BBVA', color: 'from-blue-500 to-cyan-500', iconName: 'Landmark' },
  { nombre: 'Interbank', color: 'from-teal-500 to-green-500', iconName: 'Landmark' },
  { nombre: 'Scotiabank', color: 'from-red-600 to-red-700', iconName: 'Landmark' },
  { nombre: 'iO', color: 'from-purple-600 to-pink-500', iconName: 'CreditCard' },
  { nombre: 'Otro', color: 'from-gray-600 to-gray-700', iconName: 'CreditCard' }
];

// Goal categories with Lucide icon names
export const CATEGORIAS_METAS = [
  { valor: 'Emergencias', iconName: 'Shield', color: 'from-red-500 to-red-600' },
  { valor: 'Vacaciones', iconName: 'Plane', color: 'from-blue-500 to-cyan-500' },
  { valor: 'Compra Grande', iconName: 'ShoppingCart', color: 'from-purple-500 to-pink-500' },
  { valor: 'Auto', iconName: 'Car', color: 'from-slate-600 to-slate-700' },
  { valor: 'Casa', iconName: 'Building', color: 'from-green-500 to-emerald-500' },
  { valor: 'Educacion', iconName: 'GraduationCap', color: 'from-indigo-500 to-purple-500' },
  { valor: 'Retiro', iconName: 'PiggyBank', color: 'from-amber-500 to-orange-500' },
  { valor: 'Inversion', iconName: 'TrendingUp', color: 'from-teal-500 to-cyan-500' },
  { valor: 'Tecnologia', iconName: 'Smartphone', color: 'from-sky-500 to-blue-500' },
  { valor: 'Otros', iconName: 'Target', color: 'from-orange-500 to-red-500' }
];

// Navigation tabs with Lucide icon names
export const TABS = [
  { id: 'inicio', label: 'Inicio', iconName: 'Home' },
  { id: 'tarjetas', label: 'Tarjetas', iconName: 'CreditCard' },
  { id: 'transacciones', label: 'Movimientos', iconName: 'Receipt' },
  { id: 'cuotas', label: 'Cuotas', iconName: 'Calendar' },
  { id: 'inversiones', label: 'Inversiones', iconName: 'TrendingUp' },
  { id: 'metas', label: 'Metas', iconName: 'Target' },
  { id: 'proyeccion', label: 'Proyeccion', iconName: 'Activity' },
  { id: 'recurrencias', label: 'Recurrencias', iconName: 'RefreshCcw' }
];

// Transaction types
export const TRANSACTION_TYPES = {
  INCOME: 'Ingreso',
  EXPENSE: 'Gasto',
  CARD_PAYMENT: 'PagoTarjeta'
};

// Payment methods
export const PAYMENT_METHODS = {
  CASH: 'Efectivo'
};

// Installment options
export const INSTALLMENT_OPTIONS = [2, 3, 6, 12, 18, 24, 36];

// Currency
export const CURRENCY = {
  symbol: 'S/',
  code: 'PEN',
  locale: 'es-PE'
};

// Date formats
export const DATE_FORMAT = {
  short: { day: 'numeric', month: 'short' },
  medium: { day: 'numeric', month: 'short', year: 'numeric' },
  long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
};

// Urgency levels
export const URGENCY_LEVELS = {
  HIGH: { key: 'alta', days: 3, color: 'danger' },
  MEDIUM: { key: 'media', days: 7, color: 'warning' },
  LOW: { key: 'baja', days: Infinity, color: 'success' }
};

// Status colors for badges
export const STATUS_COLORS = {
  pendiente: 'warning',
  pagada: 'success',
  vencida: 'danger',
  parcial: 'warning',
  activo: 'success',
  inactivo: 'neutral'
};

// Limits
export const LIMITS = {
  MAX_TRANSACTIONS: 10000,
  TRANSACTIONS_PER_PAGE: 50
};

// Helper function to get icon component by name
export const getIconByName = (iconName, icons) => {
  return icons[iconName] || icons['MoreHorizontal'];
};

// Helper to format currency
export const formatCurrency = (amount, showSymbol = true) => {
  const formatted = amount.toLocaleString(CURRENCY.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return showSymbol ? `${CURRENCY.symbol} ${formatted}` : formatted;
};

// Helper to format date
export const formatDate = (dateString, format = 'medium') => {
  const date = new Date(dateString + 'T12:00:00');
  return date.toLocaleDateString(CURRENCY.locale, DATE_FORMAT[format]);
};
