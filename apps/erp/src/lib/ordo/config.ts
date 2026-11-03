export const ORDO_ENDPOINTS = {
  principalFeasts:
    "https://74j2tngwfd.execute-api.us-east-1.amazonaws.com/api-app/fiestas-principales",
  liturgicalTimes:
    "https://74j2tngwfd.execute-api.us-east-1.amazonaws.com/api-app/ediciones/listar-informacion-tiempo-liturgico",
  principalContent:
    "https://74j2tngwfd.execute-api.us-east-1.amazonaws.com/api-app/ediciones/obtener-contenido-principal",
  completeContent:
    "https://74j2tngwfd.execute-api.us-east-1.amazonaws.com/api-app/ediciones/obtener-contenido-completo",
} as const;

export const ORDO_CACHE_TTL_MS = 60 * 60 * 1000;
