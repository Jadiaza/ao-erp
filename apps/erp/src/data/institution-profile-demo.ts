import { parishDemo, parishDemoPeople, parishDemoSites } from "@/data/parish-demo";

export const institutionProfileDemo = {
  officialName: parishDemo.officialName,
  shortName: parishDemo.shortName,
  entityType: "Parroquia · entidad de muestra",
  ecclesiasticalNature: "Entidad eclesiástica de ámbito parroquial · referencia ficticia",
  country: parishDemo.country,
  address: parishDemo.address,
  contact: `${parishDemo.contactPhone} · ${parishDemo.contactEmail}`,
  website: parishDemo.website,
  jurisdictionType: "Parroquia territorial · configuración ilustrativa",
  jurisdiction: parishDemo.jurisdictionName,
  authority: "Autoridad eclesiástica de referencia · no constituye adscripción ni acceso real",
  erectionDecree: "Documento de constitución DEMO-PAR-014 · sin valor oficial",
  erectionDate: "Fecha ilustrativa · no corresponde a documento oficial",
  history: "Perfil ficticio para demostrar la organización de la identidad institucional.",
  legalName: "Razón social de muestra · pendiente de configuración local",
  legalNature: "Naturaleza jurídica civil no determinada en este conjunto demostrativo",
  taxId: "Identificación tributaria ficticia · no utilizable",
  legalRepresentative: `${parishDemoPeople.pastor.name} · referencia de muestra`,
  civilRecognition: "Documento civil de muestra · sin valor oficial",
  civilRegistration: "Registro civil/tributario no configurado · dato demostrativo",
  period: parishDemo.period,
  status: "Activa · demostración",
  documentIdentity: `${parishDemo.officialName} · ${parishDemo.id}`,
};

export const institutionAuthoritiesDemo = [
  { role: parishDemoPeople.pastor.role, person: parishDemoPeople.pastor.name, scope: "Referencia institucional ficticia; autoridad y representación no verificadas" },
  { role: parishDemoPeople.secretary.role, person: parishDemoPeople.secretary.name, scope: "Referencia administrativa de muestra" },
  { role: "Administración institucional", person: parishDemoPeople.administrator.name, scope: "Perfil demostrativo; no representa autenticación ni permisos" },
  { role: parishDemoPeople.pastoral.role, person: parishDemoPeople.pastoral.name, scope: "Referencia pastoral de muestra" },
];

export const institutionDependenciesDemo = [
  { name: parishDemoPeople.secretary.role, kind: "Dependencia", lead: parishDemoPeople.secretary.name, location: parishDemoSites.parishOffice.location },
  { name: "Administración", kind: "Dependencia", lead: parishDemoPeople.administratorContact.name, location: "Oficina de muestra · sede principal" },
  { name: parishDemoPeople.pastoral.role, kind: "Dependencia", lead: parishDemoPeople.pastoral.name, location: parishDemoSites.pastoralCenter.name },
  { name: parishDemoSites.temple.name, kind: "Sede", lead: "Responsable de sede de muestra", location: parishDemoSites.temple.location },
  { name: parishDemoSites.pastoralCenter.name, kind: "Sede", lead: parishDemoPeople.pastoral.name, location: parishDemoSites.pastoralCenter.location },
];
