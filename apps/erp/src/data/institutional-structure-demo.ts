import { parishDemo, parishDemoPeople, parishDemoSites } from "@/data/parish-demo";

export type InstitutionalSite = {
  id: string;
  name: string;
  address: string;
  status: "active" | "inactive";
};
export type InstitutionalResponsible = {
  id: string;
  name: string;
  role: string;
  email: string;
  status: "active" | "inactive";
};
export type InstitutionalDepartment = {
  id: string;
  name: string;
  siteId: string;
  responsibleId: string;
  status: "active" | "inactive";
};

export const institutionalSites: InstitutionalSite[] = [
  {
    id: "SED-DEMO-01",
    name: parishDemoSites.temple.name,
    address: parishDemoSites.temple.location,
    status: "active",
  },
  {
    id: "SED-DEMO-02",
    name: parishDemoSites.pastoralCenter.name,
    address: parishDemoSites.pastoralCenter.location,
    status: "active",
  },
];

export const institutionalResponsibles: InstitutionalResponsible[] = [
  {
    id: "RES-DEMO-01",
    name: parishDemoPeople.secretary.name,
    role: parishDemoPeople.secretary.role,
    email: "secretaria@example.test",
    status: "active",
  },
  {
    id: "RES-DEMO-02",
    name: parishDemoPeople.administrator.name,
    role: parishDemoPeople.administrator.role,
    email: "administracion@example.test",
    status: "active",
  },
  {
    id: "RES-DEMO-03",
    name: parishDemoPeople.pastoral.name,
    role: parishDemoPeople.pastoral.role,
    email: "pastoral@example.test",
    status: "active",
  },
];

export const institutionalDepartments: InstitutionalDepartment[] = [
  {
    id: "DEP-DEMO-01",
    name: "Secretaría parroquial",
    siteId: institutionalSites[0]!.id,
    responsibleId: institutionalResponsibles[0]!.id,
    status: "active",
  },
  {
    id: "DEP-DEMO-02",
    name: "Administración",
    siteId: institutionalSites[1]!.id,
    responsibleId: institutionalResponsibles[1]!.id,
    status: "active",
  },
  {
    id: "DEP-DEMO-03",
    name: "Pastoral y formación",
    siteId: institutionalSites[1]!.id,
    responsibleId: institutionalResponsibles[2]!.id,
    status: "active",
  },
];
