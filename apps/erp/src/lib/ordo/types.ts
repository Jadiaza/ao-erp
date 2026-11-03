export type OrdoEnvelope<T> = {
  message?: string;
  code?: number;
  success: boolean;
  data: T;
};

export type OrdoPrincipalFeast = {
  fecha: string;
  nombre_celebracion: string | null;
  DESCRIPCION: string | null;
};

export type OrdoLiturgicalTime = {
  id: number | string | null;
  cycleId: number | string | null;
  cycleName: string | null;
  year: number | null;
  introduction: string | null;
  milestones: Array<{ label: string; date: string | null }>;
  descriptions: Record<string, string | null>;
};

export type OrdoCalendarEntry = {
  id: number | string | null;
  fecha: string;
  tiempo_liturgico: string | null;
  titulo: string | null;
  encabezado: string | null;
  preludio: string | null;
  celebracion: string | null;
  nombre_celebracion: string | null;
  colores_dia: string | null;
  aplica_colombia: number | string | null;
  color_1: string | null;
  color_2: string | null;
  color_3: string | null;
  color_css: string | null;
  color_css_secundario: string | null;
  color_css_fuente: string | null;
  misa: string | null;
  oficio: string | null;
  notas: string | null;
  celebracion_obispo: string | null;
  celebracion_circunscripcion: string | null;
  celebracion_santo: string | null;
  primera_lectura: string | null;
  segunda_lectura: string | null;
  salmo: string | null;
  aclamacion: string | null;
  evangelio: string | null;
  reflexion: string | null;
  reflexion_audio: string | null;
};

export type OrdoCalendarData = {
  principalFeasts: OrdoPrincipalFeast[];
  liturgicalTimes: OrdoLiturgicalTime[];
  principalContent: OrdoCalendarEntry[];
  completeContent: OrdoCalendarEntry[];
  entries: OrdoCalendarEntry[];
  loadedAt: Date;
};

export type OrdoCalendarErrors = Partial<
  Record<"principalFeasts" | "liturgicalTimes" | "principalContent" | "completeContent", string>
>;
