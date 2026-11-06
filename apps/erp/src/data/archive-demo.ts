export type ArchiveArea =
  | "recepcion"
  | "digitalizacion"
  | "repositorio"
  | "clasificacion"
  | "expedientes"
  | "instrumentos"
  | "transferencias"
  | "conservacion";

export type ArchiveDemoRecord = {
  id: string;
  title: string;
  type: string;
  responsible: string;
  status: "pending" | "active" | "approved" | "rejected" | "draft";
  notes: string;
  updatedAt: string;
  area: ArchiveArea;
  demoOnly?: boolean;
};

export const archiveAreaConfig: Record<
  ArchiveArea,
  {
    title: string;
    description: string;
    fields: string[];
    emptyTitle: string;
  }
> = {
  recepcion: {
    title: "Recepción documental",
    description: "Registra ingresos físicos y digitales y conserva su trazabilidad local.",
    fields: ["Remitente", "Procedencia", "Fecha de recepción"],
    emptyTitle: "No hay recepciones registradas",
  },
  digitalizacion: {
    title: "Digitalización y OCR",
    description: "Revisa la cola documental. El motor OCR no está conectado en este entorno.",
    fields: ["Tipo de archivo", "Estado OCR", "Observaciones de revisión"],
    emptyTitle: "No hay documentos en la cola",
  },
  repositorio: {
    title: "Repositorio documental",
    description:
      "Consulta metadatos, clasificación, versiones y relaciones del repositorio institucional.",
    fields: ["Clasificación", "Versión", "Nivel de acceso"],
    emptyTitle: "No hay documentos en este filtro",
  },
  clasificacion: {
    title: "Clasificación archivística",
    description: "Administra la estructura propia de A&O: fondos, secciones, series y subseries.",
    fields: ["Código", "Nivel archivístico", "Estado"],
    emptyTitle: "No hay elementos de clasificación",
  },
  expedientes: {
    title: "Expedientes, libros y folios",
    description:
      "Relaciona expedientes y unidades documentales sin duplicar asientos sacramentales.",
    fields: ["Expediente", "Libro o tomo", "Folio"],
    emptyTitle: "No hay expedientes registrados",
  },
  instrumentos: {
    title: "Instrumentos archivísticos",
    description: "Consulta y versiona CCD, TRD, TVD e inventarios documentales.",
    fields: ["Código", "Versión", "Fecha de aprobación"],
    emptyTitle: "No hay instrumentos registrados",
  },
  transferencias: {
    title: "Transferencias documentales",
    description:
      "Prepara inventarios y actas; no se completa una transferencia sin evidencia de entrega.",
    fields: ["Origen", "Destino", "Responsable de entrega"],
    emptyTitle: "No hay transferencias registradas",
  },
  conservacion: {
    title: "Conservación y preservación",
    description: "Registra revisiones e incidencias sin afirmar checksums no calculados.",
    fields: ["Formato", "Integridad", "Incidencia"],
    emptyTitle: "No hay revisiones registradas",
  },
};

export const archiveDemoRecords: ArchiveDemoRecord[] = [
  {
    id: "ARC-DEMO-001",
    title: "Plan pastoral parroquial 2026",
    type: "Unidad documental",
    responsible: "Coordinación pastoral",
    status: "approved",
    notes: "Referencia demo vinculada al repositorio institucional.",
    updatedAt: "28 oct. 2026",
    area: "repositorio",
    demoOnly: true,
  },
  {
    id: "ARC-DEMO-002",
    title: "Recepción de acta de consejo",
    type: "Acta",
    responsible: "Secretaría parroquial",
    status: "pending",
    notes: "Pendiente de clasificación inicial.",
    updatedAt: "Hoy · demo",
    area: "recepcion",
    demoOnly: true,
  },
  {
    id: "ARC-DEMO-003",
    title: "Cola OCR de referencia",
    type: "PDF",
    responsible: "Archivo institucional",
    status: "active",
    notes: "Motor OCR no conectado; revisión manual pendiente.",
    updatedAt: "Hoy · demo",
    area: "digitalizacion",
    demoOnly: true,
  },
  {
    id: "ARC-DEMO-004",
    title: "Fondo parroquial de muestra",
    type: "Fondo",
    responsible: "Custodia documental",
    status: "approved",
    notes: "Estructura archivística propia de A&O.",
    updatedAt: "15 oct. 2026",
    area: "clasificacion",
    demoOnly: true,
  },
  {
    id: "ARC-DEMO-005",
    title: "Expediente pastoral 2026",
    type: "Expediente",
    responsible: "Coordinación pastoral",
    status: "active",
    notes: "Sin duplicar registros sacramentales.",
    updatedAt: "12 oct. 2026",
    area: "expedientes",
    demoOnly: true,
  },
  {
    id: "ARC-DEMO-006",
    title: "CCD institucional",
    type: "CCD",
    responsible: "Custodia documental",
    status: "draft",
    notes: "Instrumento de referencia sin aprobación oficial.",
    updatedAt: "01 oct. 2026",
    area: "instrumentos",
    demoOnly: true,
  },
  {
    id: "ARC-DEMO-007",
    title: "Transferencia archivo de gestión",
    type: "Inventario",
    responsible: "Secretaría parroquial",
    status: "pending",
    notes: "No registra entrega efectiva.",
    updatedAt: "Hoy · demo",
    area: "transferencias",
    demoOnly: true,
  },
  {
    id: "ARC-DEMO-008",
    title: "Revisión de preservación",
    type: "Revisión",
    responsible: "Archivo institucional",
    status: "pending",
    notes: "Checksum no calculado en modo demostración.",
    updatedAt: "Hoy · demo",
    area: "conservacion",
    demoOnly: true,
  },
];
