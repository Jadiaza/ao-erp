import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleHelp,
  CreditCard,
  Database,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  Headset,
  Info,
  Landmark,
  Layers,
  LayoutDashboard,
  Lock,
  Menu,
  Monitor,
  Moon,
  Network,
  Package,
  Palette,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Server,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Terminal,
  Trash2,
  Users,
  X,
  type LucideProps,
} from "lucide-react";

export type SaasIconName =
  | "dashboard"
  | "settings"
  | "organizations"
  | "institutions"
  | "users"
  | "roles"
  | "plans"
  | "clients"
  | "products"
  | "subscriptions"
  | "billing"
  | "security"
  | "provisioning"
  | "support"
  | "infrastructure"
  | "audit"
  | "analytics"
  | "search"
  | "bell"
  | "help"
  | "menu"
  | "chevron-left"
  | "chevron-right"
  | "chevron-down"
  | "chevron-up"
  | "plus"
  | "close"
  | "check"
  | "alert"
  | "info"
  | "sun"
  | "moon"
  | "monitor"
  | "palette"
  | "filter"
  | "eye"
  | "edit"
  | "trash"
  | "arrow-left"
  | "arrow-right"
  | "sparkles"
  | "database"
  | "document"
  | "terminal"
  | "book"
  | "activity"
  | "building"
  | "briefcase"
  | "file-text"
  | "landmark"
  | "layers"
  | "shield"
  | "x";

const iconMap = {
  dashboard: LayoutDashboard,
  settings: Settings,
  organizations: Network,
  institutions: Landmark,
  users: Users,
  roles: ShieldCheck,
  plans: Layers,
  clients: Briefcase,
  products: Package,
  subscriptions: RefreshCw,
  billing: CreditCard,
  security: Lock,
  provisioning: SlidersHorizontal,
  support: Headset,
  infrastructure: Server,
  audit: FileCheck2,
  analytics: BarChart3,
  search: Search,
  bell: Bell,
  help: CircleHelp,
  menu: Menu,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "chevron-down": ChevronDown,
  "chevron-up": ChevronUp,
  plus: Plus,
  close: X,
  check: Check,
  alert: AlertCircle,
  info: Info,
  sun: Sun,
  moon: Moon,
  monitor: Monitor,
  palette: Palette,
  filter: Filter,
  eye: Eye,
  edit: Pencil,
  trash: Trash2,
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  sparkles: Sparkles,
  database: Database,
  document: FileText,
  terminal: Terminal,
  book: BookOpen,
  activity: Activity,
  building: Building2,
  briefcase: Briefcase,
  "file-text": FileText,
  landmark: Landmark,
  layers: Layers,
  shield: ShieldCheck,
  x: X,
} as const;

export interface SaasIconProps extends Omit<LucideProps, "name"> {
  name: SaasIconName;
}

export function SaasIcon({ name, size = 16, strokeWidth = 1.85, ...props }: SaasIconProps) {
  const IconComponent = iconMap[name] ?? LayoutDashboard;
  return <IconComponent size={size} strokeWidth={strokeWidth} aria-hidden="true" {...props} />;
}
