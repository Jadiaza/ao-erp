import {
  Archive,
  BookOpen,
  Building2,
  CalendarDays,
  CheckSquare,
  Church,
  ClipboardList,
  Coins,
  FileClock,
  FileText,
  FolderOpen,
  GraduationCap,
  HeartHandshake,
  LayoutDashboard,
  Landmark,
  Mail,
  Package,
  PieChart,
  ScrollText,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Users,
  UsersRound,
  Wallet,
  Wine,
  type LucideIcon,
} from "lucide-react";

export type AppModule = {
  id: string;
  label: string;
  path: string;
  group: string;
  icon: LucideIcon;
};

export const appModules: AppModule[] = [
  { id: "inicio", label: "Dashboard", path: "/", group: "General", icon: LayoutDashboard },
  { id: "institucion", label: "Institución", path: "/app/institucion", group: "Gobierno e institución", icon: Landmark },
  { id: "estructura-eclesiastica", label: "Estructura eclesiástica", path: "/app/estructura-eclesiastica", group: "Gobierno e institución", icon: Church },
  { id: "administracion-institucional", label: "Administración institucional", path: "/app/administracion-institucional", group: "Gobierno e institución", icon: Building2 },
  { id: "gobierno-normativa", label: "Gobierno y normativa", path: "/app/gobierno-normativa", group: "Gobierno e institución", icon: ScrollText },
  { id: "usuarios-permisos", label: "Usuarios y permisos", path: "/app/usuarios-permisos", group: "Gobierno e institución", icon: ShieldCheck },
  { id: "feligreses-familias", label: "Feligreses y familias", path: "/app/feligreses-familias", group: "Comunidad y pastoral", icon: Users },
  { id: "gestion-sacramental", label: "Gestión sacramental", path: "/app/gestion-sacramental", group: "Comunidad y pastoral", icon: Wine },
  { id: "libros-sacramentales", label: "Libros sacramentales", path: "/app/libros-sacramentales", group: "Comunidad y pastoral", icon: BookOpen },
  { id: "documentos-certificados", label: "Documentos y certificados", path: "/app/documentos-certificados", group: "Comunidad y pastoral", icon: FileText },
  { id: "catequesis-formacion", label: "Catequesis y formación", path: "/app/catequesis-formacion", group: "Comunidad y pastoral", icon: GraduationCap },
  { id: "grupos-ministerios", label: "Grupos, movimientos y ministerios", path: "/app/grupos-ministerios", group: "Comunidad y pastoral", icon: UsersRound },
  { id: "accion-pastoral-social", label: "Acción pastoral y social", path: "/app/accion-pastoral-social", group: "Comunidad y pastoral", icon: HeartHandshake },
  { id: "liturgia-celebraciones", label: "Liturgia y celebraciones", path: "/app/liturgia-celebraciones", group: "Comunidad y pastoral", icon: Church },
  { id: "planificacion-pastoral", label: "Planificación pastoral", path: "/app/planificacion-pastoral", group: "Comunidad y pastoral", icon: ClipboardList },
  { id: "finanzas-tesoreria", label: "Finanzas y tesorería", path: "/app/finanzas-tesoreria", group: "Finanzas y recursos", icon: Coins },
  { id: "contabilidad", label: "Contabilidad", path: "/app/contabilidad", group: "Finanzas y recursos", icon: Wallet },
  { id: "presupuestos", label: "Presupuestos", path: "/app/presupuestos", group: "Finanzas y recursos", icon: PieChart },
  { id: "inventarios-patrimonio", label: "Inventarios y patrimonio", path: "/app/inventarios-patrimonio", group: "Finanzas y recursos", icon: Package },
  { id: "compras-obligaciones", label: "Compras y obligaciones", path: "/app/compras-obligaciones", group: "Finanzas y recursos", icon: ShoppingCart },
  { id: "informe-anual-parroquial", label: "Informe anual parroquial", path: "/app/informe-anual-parroquial", group: "Gestión y control", icon: FileText },
  { id: "agenda-infraestructura", label: "Agenda e infraestructura", path: "/app/agenda-infraestructura", group: "Gestión y control", icon: CalendarDays },
  { id: "portal-feligres", label: "Portal del feligrés", path: "/app/portal-feligres", group: "Servicios", icon: Users },
  { id: "comunicaciones", label: "Comunicaciones", path: "/app/comunicaciones", group: "Servicios", icon: Mail },
  { id: "inteligencia-artificial", label: "Inteligencia artificial", path: "/app/inteligencia-artificial", group: "Servicios", icon: Sparkles },
  { id: "gestion-documental", label: "Gestión documental", path: "/app/gestion-documental", group: "Gestión y control", icon: FolderOpen },
  { id: "auditoria-trazabilidad", label: "Auditoría y trazabilidad", path: "/app/auditoria-trazabilidad", group: "Gestión y control", icon: FileClock },
];

export const moduleGroups = [...new Set(appModules.map((module) => module.group))].filter((group) => group !== "General");

export const moduleGroupIcons: Record<string, LucideIcon> = {
  General: LayoutDashboard,
  "Gobierno e institución": Landmark,
  "Comunidad y pastoral": UsersRound,
  "Finanzas y recursos": Wallet,
  "Gestión y control": ShieldCheck,
  Servicios: Sparkles,
  Sistema: Settings,
};
