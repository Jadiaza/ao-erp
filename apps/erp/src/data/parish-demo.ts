/** Contexto ficticio común para las pantallas demostrativas de A&O ERP. */
export const parishDemo = {
  id: "PAR-DEMO-014",
  officialName: "Parroquia Santa María del Camino",
  shortName: "Parroquia Santa María",
  jurisdictionId: "JUR-DEMO-01",
  jurisdictionName: "Diócesis de San Gabriel · referencia ficticia",
  jurisdictionRelation: "Vínculo jurisdiccional ilustrativo; no concede acceso a datos.",
  country: "Colombia · país de muestra",
  region: "Sector Centro · ubicación ficticia",
  address: "Plaza ficticia de la Comunidad 12, Sector Centro",
  contactEmail: "secretaria@parroquia-demo.example.test",
  contactPhone: "+57 601 555 0140 · número de muestra",
  website: "parroquia-demo.example.test",
  period: "Año institucional 2026 · demostración",
  accountingEntityId: "ENT-DEMO-PAR-014",
  demoLabel: "Datos ficticios de demostración",
} as const;

export const parishDemoSites = {
  temple: { id: "SITE-DEMO-01", name: "Templo Santa María", kind: "Templo", location: "Sede principal · Sector Centro", address: parishDemo.address },
  chapel: { id: "SITE-DEMO-02", name: "Capilla La Esperanza", kind: "Capilla", location: "Sector La Esperanza", address: "Dirección ficticia · Sector La Esperanza" },
  hall: { id: "SITE-DEMO-03", name: "Salón parroquial La Esperanza", kind: "Salón parroquial", location: "Sede principal · planta baja", address: parishDemo.address },
  pastoralCenter: { id: "SITE-DEMO-04", name: "Centro pastoral La Esperanza", kind: "Centro pastoral", location: "Sector La Esperanza", address: "Dirección ficticia · Sector La Esperanza" },
  parishOffice: { id: "SITE-DEMO-05", name: "Oficina parroquial", kind: "Oficina", location: "Sede principal · segundo piso", address: parishDemo.address },
  rectory: { id: "SITE-DEMO-06", name: "Casa cural", kind: "Casa cural", location: "Sede principal · ala norte", address: parishDemo.address },
  workshop: { id: "SITE-DEMO-07", name: "Taller de mantenimiento", kind: "Taller", location: "Sector Centro", address: "Ubicación ficticia · Sector Centro" },
  archive: { id: "SITE-DEMO-08", name: "Archivo patrimonial", kind: "Archivo", location: "Sede principal", address: parishDemo.address },
  parking: { id: "SITE-DEMO-09", name: "Parqueadero institucional", kind: "Parqueadero", location: "Sede principal · acceso de servicio", address: parishDemo.address },
  storage: { id: "SITE-DEMO-10", name: "Bodega institucional", kind: "Bodega", location: "Sede principal · nivel de servicio", address: parishDemo.address },
} as const;

export const parishDemoPeople = {
  administrator: { id: "USR-DEMO-ADMIN-014", name: "José Alberto Díaz", role: "Administrador institucional", email: "jose.diaz@parroquia-demo.example.test", scope: parishDemo.id },
  pastor: { id: "PER-DEMO-PASTOR-014", name: "Párroco de muestra A", role: "Párroco administrador", email: "pastor@parroquia-demo.example.test" },
  secretary: { id: "PER-DEMO-SECRETARY-014", name: "Secretaría de muestra A", role: "Secretaría parroquial", email: parishDemo.contactEmail },
  administratorContact: { id: "PER-DEMO-ADMIN-014", name: "Administración de muestra A", role: "Responsable administrativa", email: "administracion@parroquia-demo.example.test" },
  treasurer: { id: "PER-DEMO-TREASURY-014", name: "Tesorería de muestra A", role: "Responsable de tesorería", email: "tesoreria@parroquia-demo.example.test" },
  pastoral: { id: "PER-DEMO-PASTORAL-014", name: "Coordinación pastoral de muestra A", role: "Coordinación pastoral", email: "pastoral@parroquia-demo.example.test" },
  inventoryCustodian: { id: "PER-DEMO-INVENTORY-014", name: "Responsable de inventario de muestra A", role: "Custodia de inventario", email: "inventario@parroquia-demo.example.test" },
  heritageCustodian: { id: "PER-DEMO-HERITAGE-014", name: "Custodia patrimonial de muestra", role: "Custodia patrimonial", email: "patrimonio@parroquia-demo.example.test" },
  celebrantA: { id: "PER-DEMO-CELEBRANT-01", name: "Celebrante de muestra A", role: "Celebrante · referencia ficticia" },
  celebrantB: { id: "PER-DEMO-CELEBRANT-02", name: "Celebrante de muestra B", role: "Celebrante · referencia ficticia" },
  celebrantC: { id: "PER-DEMO-CELEBRANT-03", name: "Celebrante de muestra C", role: "Celebrante · referencia ficticia" },
  celebrantD: { id: "PER-DEMO-CELEBRANT-04", name: "Celebrante de muestra D", role: "Celebrante · referencia ficticia" },
  ministerB: { id: "PER-DEMO-MINISTER-02", name: "Ministro de muestra B", role: "Ministro · referencia ficticia" },
} as const;

export const parishDemoAccountingEntity = {
  id: parishDemo.accountingEntityId,
  name: `${parishDemo.officialName} · entidad contable de muestra`,
  country: parishDemo.country,
  framework: "Catálogo local configurable · cifras ficticias",
} as const;
