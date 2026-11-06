export type DemoStatus = "Activo" | "Pendiente" | "Suspendido" | "Borrador";

export type Organization = {
  id: string;
  name: string;
  type: string;
  contact: string;
  plan: string;
  status: DemoStatus;
  institutions: number;
  users: number;
};

export type SaaSRecord = {
  id: string;
  name: string;
  detail: string;
  status: DemoStatus;
  owner?: string;
  plan?: string;
  organization?: string;
  role?: string;
};

export const organizations: Organization[] = [
  {
    id: "ORG-001",
    name: "Diócesis de San Gabriel",
    type: "Diócesis",
    contact: "operacion@demo.example.test",
    plan: "Ecosistema",
    status: "Activo",
    institutions: 18,
    users: 46,
  },
  {
    id: "ORG-002",
    name: "Parroquia Santa María del Camino",
    type: "Parroquia",
    contact: "admin@parroquia.example.test",
    plan: "Parroquial",
    status: "Activo",
    institutions: 1,
    users: 8,
  },
  {
    id: "ORG-003",
    name: "Fundación Camino y Vida",
    type: "Fundación",
    contact: "gestion@fundacion.example.test",
    plan: "Institucional",
    status: "Pendiente",
    institutions: 2,
    users: 12,
  },
];

export const institutions: SaaSRecord[] = [
  {
    id: "INS-014",
    name: "Parroquia Santa María del Camino",
    detail: "Bogotá · Entidad parroquial",
    status: "Activo",
    organization: "Diócesis de San Gabriel",
    owner: "Pbro. Andrés Salazar",
  },
  {
    id: "INS-021",
    name: "Parroquia San José Obrero",
    detail: "Tunja · Entidad parroquial",
    status: "Activo",
    organization: "Diócesis de San Gabriel",
    owner: "Pbro. Mateo Ríos",
  },
  {
    id: "INS-032",
    name: "Casa de retiros La Esperanza",
    detail: "Chía · Obra institucional",
    status: "Pendiente",
    organization: "Fundación Camino y Vida",
    owner: "Laura Méndez",
  },
];

export const users: SaaSRecord[] = [
  {
    id: "USR-001",
    name: "José Alberto Díaz",
    detail: "jose.diaz@ao.example.test",
    status: "Activo",
    organization: "Diócesis de San Gabriel",
    role: "Administrador de plataforma",
  },
  {
    id: "USR-014",
    name: "María Fernanda Torres",
    detail: "maria.torres@ao.example.test",
    status: "Activo",
    organization: "Parroquia Santa María del Camino",
    role: "Administradora institucional",
  },
  {
    id: "USR-021",
    name: "Carlos Beltrán",
    detail: "carlos.beltran@ao.example.test",
    status: "Pendiente",
    organization: "Fundación Camino y Vida",
    role: "Usuario operativo",
  },
];

export const plans: SaaSRecord[] = [
  {
    id: "PLAN-01",
    name: "Parroquial",
    detail: "Operación de una institución parroquial",
    status: "Activo",
    plan: "12 módulos · 10 usuarios",
  },
  {
    id: "PLAN-02",
    name: "Institucional",
    detail: "Operación de varias sedes y áreas",
    status: "Activo",
    plan: "18 módulos · 30 usuarios",
  },
  {
    id: "PLAN-03",
    name: "Ecosistema",
    detail: "Administración diocesana y parroquial",
    status: "Activo",
    plan: "Catálogo completo · usuarios ilimitados",
  },
];

export const roles: SaaSRecord[] = [
  {
    id: "ROL-01",
    name: "Administrador de plataforma",
    detail: "Acceso operativo a la consola A&O SaaS",
    status: "Activo",
    role: "Global",
  },
  {
    id: "ROL-02",
    name: "Administrador institucional",
    detail: "Gestiona configuración y usuarios de su entidad",
    status: "Activo",
    role: "Por organización",
  },
  {
    id: "ROL-03",
    name: "Usuario operativo",
    detail: "Accede únicamente a módulos asignados",
    status: "Activo",
    role: "Por institución",
  },
];

export const catalog = [
  "Dashboard",
  "Organizaciones",
  "Instituciones",
  "Usuarios",
  "Roles y permisos",
  "Planes y licencias",
  "Feligreses y familias",
  "Gestión sacramental",
  "Finanzas y tesorería",
  "Gestión documental",
  "Comunicaciones",
  "Inteligencia artificial",
];
