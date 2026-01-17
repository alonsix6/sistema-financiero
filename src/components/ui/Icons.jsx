/**
 * Centralized Icon System using Lucide React
 * Replaces all emojis with consistent vector icons
 */

import {
  // Navigation & Actions
  Home,
  CreditCard,
  Receipt,
  Calendar,
  Target,
  TrendingUp,
  RefreshCcw,
  Settings,
  LogOut,
  Plus,
  Minus,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  MoreVertical,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Download,
  Upload,
  Share,
  ExternalLink,

  // Finance & Money
  Wallet,
  Banknote,
  Coins,
  PiggyBank,
  DollarSign,
  CircleDollarSign,
  BadgeDollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowLeftRight,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Activity,

  // Categories
  ShoppingCart,
  ShoppingBag,
  Utensils,
  Car,
  Home as HomeIcon,
  Plane,
  GraduationCap,
  HeartPulse,
  Gamepad2,
  Shirt,
  Smartphone,
  Wifi,
  Zap,
  Droplets,
  Film,
  Music,
  Gift,
  Coffee,
  Beer,
  Briefcase,
  Building,
  Store,
  Landmark,

  // Status & Alerts
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  CalendarClock,
  CalendarCheck,
  CalendarX,
  Bell,
  BellOff,
  BellRing,

  // UI Elements
  Sun,
  Moon,
  Star,
  Heart,
  Bookmark,
  Flag,
  Lock,
  Unlock,
  Key,
  Shield,
  ShieldCheck,
  User,
  Users,

  // Misc
  Sparkles,
  Flame,
  Loader2,
  RotateCcw,
  Save,
  FileText,
  Image,
  Paperclip,
  Send,
  MessageCircle,
  HelpCircle,
  Percent,
  Hash,
  Tag,
  Tags,
  Layers,
  Grid,
  List,
  LayoutGrid,
  Maximize2,
  Minimize2,
} from 'lucide-react';

// Icon size variants
export const iconSizes = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
};

// Default icon props
const defaultProps = {
  strokeWidth: 2,
  size: iconSizes.md,
};

// Category icons mapping (replaces emoji categories)
export const CategoryIcons = {
  // Expense categories
  'Alimentacion': Utensils,
  'Transporte': Car,
  'Entretenimiento': Film,
  'Salud': HeartPulse,
  'Educacion': GraduationCap,
  'Ropa': Shirt,
  'Tecnologia': Smartphone,
  'Hogar': HomeIcon,
  'Servicios': Zap,
  'Suscripciones': RefreshCcw,
  'Otros': MoreHorizontal,
  'Inversiones': TrendingUp,

  // Income categories
  'Salario': Briefcase,
  'Freelance': Laptop,
  'Inversiones': LineChart,
  'Regalo': Gift,
  'Otros Ingresos': Coins,

  // Goal categories
  'Emergencias': Shield,
  'Vacaciones': Plane,
  'Auto': Car,
  'Casa': Building,
  'Educacion': GraduationCap,
  'Retiro': PiggyBank,
  'Tecnologia': Smartphone,
  'Otro': Target,
};

// Missing Laptop import - add it
import { Laptop } from 'lucide-react';

// Bank icons (gradient backgrounds defined in CSS)
export const BankIcons = {
  'BCP': Landmark,
  'BBVA': Landmark,
  'Interbank': Landmark,
  'Scotiabank': Landmark,
  'iO': CreditCard,
};

// Navigation tab icons
export const TabIcons = {
  'inicio': Home,
  'tarjetas': CreditCard,
  'transacciones': Receipt,
  'cuotas': Calendar,
  'inversiones': TrendingUp,
  'metas': Target,
  'proyeccion': Activity,
  'recurrencias': RefreshCcw,
};

// Status icons
export const StatusIcons = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
  pending: Clock,
};

// Urgency indicators
export const UrgencyIcons = {
  alta: AlertCircle,
  media: AlertTriangle,
  baja: CheckCircle,
};

// Action icons
export const ActionIcons = {
  add: Plus,
  remove: Minus,
  edit: Edit,
  delete: Trash2,
  view: Eye,
  close: X,
  confirm: Check,
  back: ChevronLeft,
  forward: ChevronRight,
  search: Search,
  filter: Filter,
  download: Download,
  upload: Upload,
  share: Share,
  copy: Copy,
  save: Save,
  refresh: RotateCcw,
};

// Finance action icons
export const FinanceIcons = {
  income: ArrowUpCircle,
  expense: ArrowDownCircle,
  transfer: ArrowLeftRight,
  payment: Banknote,
  card: CreditCard,
  cash: Wallet,
  investment: TrendingUp,
  goal: Target,
  recurring: RefreshCcw,
  projection: Activity,
};

// Wrapper component with consistent styling
export const Icon = ({
  icon: IconComponent,
  size = 'md',
  className = '',
  color,
  ...props
}) => {
  const sizeValue = typeof size === 'number' ? size : iconSizes[size] || iconSizes.md;

  return (
    <IconComponent
      size={sizeValue}
      className={`flex-shrink-0 ${className}`}
      color={color}
      {...defaultProps}
      {...props}
    />
  );
};

// Icon with circular background
export const IconCircle = ({
  icon: IconComponent,
  size = 'md',
  bgColor = 'bg-gray-100 dark:bg-gray-800',
  iconColor = 'text-gray-600 dark:text-gray-400',
  className = '',
  ...props
}) => {
  const sizeValue = typeof size === 'number' ? size : iconSizes[size] || iconSizes.md;
  const containerSize = sizeValue * 2;

  return (
    <div
      className={`flex items-center justify-center rounded-full ${bgColor} ${className}`}
      style={{ width: containerSize, height: containerSize }}
    >
      <IconComponent
        size={sizeValue}
        className={`flex-shrink-0 ${iconColor}`}
        {...defaultProps}
        {...props}
      />
    </div>
  );
};

// Animated loader icon
export const LoaderIcon = ({ size = 'md', className = '' }) => (
  <Loader2
    size={typeof size === 'number' ? size : iconSizes[size]}
    className={`animate-spin ${className}`}
    {...defaultProps}
  />
);

// Export all Lucide icons for direct use
export {
  // Navigation & Actions
  Home,
  CreditCard,
  Receipt,
  Calendar,
  Target,
  TrendingUp,
  RefreshCcw,
  Settings,
  LogOut,
  Plus,
  Minus,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  MoreVertical,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Download,
  Upload,
  Share,
  ExternalLink,

  // Finance & Money
  Wallet,
  Banknote,
  Coins,
  PiggyBank,
  DollarSign,
  CircleDollarSign,
  BadgeDollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowLeftRight,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Activity,

  // Categories
  ShoppingCart,
  ShoppingBag,
  Utensils,
  Car,
  Plane,
  GraduationCap,
  HeartPulse,
  Gamepad2,
  Shirt,
  Smartphone,
  Wifi,
  Zap,
  Droplets,
  Film,
  Music,
  Gift,
  Coffee,
  Beer,
  Briefcase,
  Building,
  Store,
  Landmark,
  Laptop,

  // Status & Alerts
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  CalendarClock,
  CalendarCheck,
  CalendarX,
  Bell,
  BellOff,
  BellRing,

  // UI Elements
  Sun,
  Moon,
  Star,
  Heart,
  Bookmark,
  Flag,
  Lock,
  Unlock,
  Key,
  Shield,
  ShieldCheck,
  User,
  Users,

  // Misc
  Sparkles,
  Flame,
  Loader2,
  RotateCcw,
  Save,
  FileText,
  Image,
  Paperclip,
  Send,
  MessageCircle,
  HelpCircle,
  Percent,
  Hash,
  Tag,
  Tags,
  Layers,
  Grid,
  List,
  LayoutGrid,
  Maximize2,
  Minimize2,
};

export default Icon;
