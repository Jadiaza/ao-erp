# Plan de Infraestructura Inicial — Ecosistema A&O

**Fecha:** 2026-11-14  
**Estado:** Propuesta operativa para aprobación del propietario (Nivel 2.1 -> preparación Nivel 2.2)  
**Fuentes de precios oficiales verificadas:** Supabase (`https://supabase.com/pricing`), Supabase Regions (`https://supabase.com/docs/guides/platform/regions`), Vercel (`https://vercel.com/pricing`).

---

## 1. Arquitectura de infraestructura inicial aprobada técnicamente

Conforme a la decisión **D-14** y las definiciones del propietario:

| Capa | Selección inicial | Mecanismo de portabilidad | Restricción |
|---|---|---|---|
| **Base de datos** | Supabase PostgreSQL administrado | SQL estándar, esquemas propios (`core`, `saas`, `erp`, `pastoral`, `sacramental`, `diocesan`, `audit`), `core.users` y RLS portable | Sin lógica cautiva ni FKs hacia `auth.users` |
| **Autenticación** | Supabase Auth | Encapsulado tras `AuthProviderPort` en servicios server-side | Prohibido usar `user_metadata` para permisos |
| **Almacenamiento** | Supabase Storage (buckets privados) | Encapsulado tras `DocumentStoragePort`; metadatos en `erp.document_file_metadata` | Prohibido URLs públicas o binarios en BD |
| **Realtime** | No implementar inicialmente | — | Se evaluará solo cuando exista caso de uso aprobado |
| **Edge Functions** | Prohibido para reglas de negocio | Toda regla vive en servicios server-side de A&O | Máxima portabilidad |
| **Web / SSR / Server Functions** | Vercel (runtime `nodejs24.x`, sujeto a Preview real) | Nitro `vercel` preset compatible con `node_server` Docker | Validar en Nivel 2.2 con `Preview Deployment` |

---

## 2. Separación de ambientes

| Ambiente | Base de datos y Auth | Almacenamiento | Web / Runtime | Datos permitidos |
|---|---|---|---|---|
| **1. Desarrollo** | **Local** (Docker + Supabase CLI) | Bucket local emulado por Supabase CLI | `bun run dev:*` local (`localhost`) | **Exclusivamente sintéticos** y seeds técnicos |
| **2. Pruebas / Staging** | Proyecto Supabase separado (`staging`) | Bucket privado independiente (`staging`) | Vercel Preview / ambiente `staging` | **Sintéticos** equivalentes a producción (prohibido datos reales) |
| **3. Producción** | Proyecto Supabase dedicado (`prod`) | Bucket privado dedicado (`prod`) + réplica/backup | Vercel Production (3 proyectos/dominios) | Datos reales institucionales |

**Regla de aislamiento:** nunca se comparten claves, cookies, buckets, URLs ni respaldos entre Desarrollo, Staging y Producción.

---

## 3. Análisis y comparativa de región (evidencia oficial Supabase)

Según la documentación oficial de regiones de Supabase (`https://supabase.com/docs/guides/platform/regions`), **no existe región en Colombia**; las opciones disponibles relevantes para operación desde Colombia son:

| Criterio | Opción 1 (Sudamérica): **`sa-east-1` (São Paulo, Brasil)** | Opción 2 (EE. UU. Este): **`us-east-1` (Virginia del Norte)** | Opción 3 (EE. UU. Este): **`us-east-2` (Ohio)** |
|---|---|---|---|
| **Ubicación geográfica** | Sudamérica (única región Supabase en la región) | Costa Este de Estados Unidos | Medio Oeste / Este de Estados Unidos |
| **Latencia estimada desde Colombia** | **~90–145 ms** RTT típico (según enrutamiento del ISP; gran parte del tráfico colombiano hacia Brasil pasa primero por Miami/NAP de las Américas antes de bajar a São Paulo). | **~50–75 ms** RTT típico desde Bogotá/Medellín hacia Virginia (`us-east-1`), por conexión directa vía cables submarinos hacia Florida/Costa Este. | **~60–85 ms** RTT típico desde Colombia. |
| **Co-ubicación con Vercel (Server Functions)** | Vercel dispone del nodo `gru1` (São Paulo). **Obligatorio** fijar las funciones Vercel en `gru1` si Supabase está en `sa-east-1`, para evitar ida y vuelta EE. UU. <-> Brasil (~110 ms extra por query SQL). | Vercel usa `iad1` (Washington D.C. / Virginia) como región principal por defecto. Co-ubicación directa en la misma zona metropolitana AWS (< 2 ms entre Vercel `iad1` y Supabase `us-east-1`). | Ligero salto adicional desde `iad1` (~10–15 ms). |
| **Disponibilidad de funciones y réplicas** | Completa en AWS São Paulo; menor cantidad de zonas/servicios respecto a `us-east-1` ante ciertas integraciones auxiliares. | Máxima disponibilidad de servicios AWS, región principal recomendada por Supabase para las Américas (*General Region: Americas*) y soporte completo de réplicas. | Alta disponibilidad AWS. |
| **Costos base de plan** | Mismo precio base de planes Pro/Compute en Supabase. *(Nota: el egreso o servicios AWS externos en `sa-east-1` históricamente tienen mayor costo unitario fuera de cuotas planas).* | Tarifas estándar base de Supabase y Vercel sin sobrecostos regionales. | Tarifas estándar base. |
| **Tratamiento de datos (Ley 1581 de 2012 Colombia)** | Datos alojados en Brasil (Sudamérica). Requiere igualmente autorización de transferencia internacional de datos y DPA con el proveedor. | Datos alojados en EE. UU. Requiere igualmente autorización de transferencia internacional de datos y DPA con el proveedor. | Igual que `us-east-1`. |

### Recomendación técnica sobre la región (pendiente de decisión final del propietario)
1. **Si prima la política institucional de mantener datos en Sudamérica**, seleccionar **`sa-east-1` (São Paulo)** **emparejada obligatoriamente** con Vercel Functions fijadas en **`gru1` (São Paulo)** (con un *benchmark* real de latencia desde Bogotá/Medellín en Staging antes de producción).
2. **Si prima menor latencia real desde Colombia y máxima co-ubicación con Vercel (`iad1`)**, seleccionar **`us-east-1` (East US — North Virginia)**, que ofrece típicamente menor RTT desde Colombia (~50–75 ms) y < 2 ms entre Vercel y Supabase.

---

## 4. Presupuesto inicial separado por ambiente (Meta: USD 50–100/mes)

> **Advertencia de transparencia:** Las cifras base de suscripción corresponden a **tarifas oficiales vigentes** consultadas el 2026-11-14. El consumo variable (egress excedente, almacenamiento por encima de cuota incluida, MAU > 100k o cómputo adicional) se presenta como **estimación inicial** sujeta al uso real. La meta de **USD 50–100/mes** es un objetivo de arranque controlado, no una tarifa contractual fija.

### 4.1 Desglose mensual estimado por ambiente (Escenario A — Arranque controlado dentro de meta)

| Ambiente | Concepto | Tarifa oficial / Estimación | Subtotal mensual |
|---|---|---|---|
| **Desarrollo** | PostgreSQL + Auth + Storage local (Docker + Supabase CLI) + ejecución web local (`bun run dev`) | **$0/mes** (tarifa oficial local/open-source) | **$0** |
| **Staging / Pruebas** | Proyecto Supabase `Micro` adicional dentro de la org Pro (1 GB RAM, 8 GB disco, 200 pooler, sin pausa) | **+$10/mes** (cómputo `Micro` adicional confirmado) | **$10** |
| **Staging / Pruebas** | Despliegue Vercel Preview (incluido en plan Vercel de la cuenta) | **$0 adicional** dentro de cuota | **$0** |
| **Producción** | Suscripción organización **Supabase Pro** (incluye $10 crédito cómputo = 1 `Micro`, 100k MAU Auth, 8 GB BD, 100 GB Storage, 250 GB egress, backups diarios 7 días) | **$25/mes** (tarifa oficial confirmada) | **$25** |
| **Producción** | Ajuste de cómputo BD Producción: pasar de `Micro` (1 GB RAM) a **`Small`** (2 GB RAM, 400 pooler) | **+$5/mes netos** ($15 instancia - $10 crédito incluido) | **$5** |
| **Producción** | Hosting Web/SSR **Vercel Pro** (requerido para proyectos comerciales/equipo, 1 TB transferencia, 10M requests CDN, Skew Protection) | **$20/mes** (tarifa oficial confirmada; incluye $20 crédito de uso) | **$20** |
| **Servicios auxiliares** | Respaldo independiente de archivos Storage + prueba mensual de restauración `pg_restore` (p. ej. bucket secundario R2/B2/S3 frío, est. < 20 GB inicial) | **~$1–$5/mes** *(estimación variable por GB)* | **~$3** |
| **Servicios auxiliares** | Correo transaccional SMTP personalizado para Auth (invitaciones/recuperación clave, ej. proveedor SMTP tier inicial) | **$0–$15/mes** *(estimación según volumen de envíos)* | **~$0–$15** |
| **TOTAL ESCENARIO A** | **Arranque con Producción en `Small` (2 GB RAM) + Staging `Micro` + Vercel Pro** | — | **~$63 – $78 / mes** *(dentro de la meta USD 50–100)* |

### 4.2 Escenarios de ajuste (cuando crezca la carga o se exija PITR)

| Concepto opcional / crecimiento | Costo oficial adicional | Impacto frente a meta USD 50–100 |
|---|---|---|
| Subir BD Producción de `Small` (2 GB RAM) a **`Medium`** (4 GB RAM, 600 pooler) | **+$45/mes** adicionales sobre escenario A | Sube total a **~$108–$123/mes** |
| Activar **PITR (Point-in-Time Recovery, 7 días)** en Supabase Producción | **+$100/mes** por proyecto (tarifa oficial add-on) | Sube total a **~$163–$178/mes** *(supera la meta inicial; evaluar cuando existan transacciones contables críticas activas en múltiples parroquias)* |
| **Paperless-NGX** (gateway OCR/documental futuro en VPS propio cuando se habilite Fase 6+) | **~€5.49–€36.99/mes** (referencia VPS Hetzner + almacenamiento) | Fuera del arranque inicial (Fase posterior) |
| Excedentes de cuota (tras agotar incluidos) | BD: $0.125/GB · Storage: $0.0213/GB · Egress Supabase: $0.09/GB · MAU: $0.00325/MAU · Vercel transfer: $0.15/GB | Controlables mediante **Spend Cap** activado en Supabase y presupuesto límite en Vercel |

---

## 5. Respaldos y pruebas de recuperación (independientes del proveedor)

1. **Backups automáticos del proveedor:** Supabase Pro incluye respaldo diario automático con retención de 7 días (sin PITR salvo activar add-on de $100/mes).
2. **Respaldo lógico portable (propiedad de A&O):** exportación programada mediante `pg_dump --format=custom --no-owner --no-acl` de los esquemas de aplicación (`core`, `saas`, `erp`, `pastoral`, `sacramental`, `diocesan`, `audit`, `app_internal`) hacia un almacenamiento cifrado externo independiente de Supabase.
3. **Respaldo independiente de documentos binarios:** sincronización cifrada del bucket privado hacia un repositorio S3/compatible externo, validada contra `checksum_sha256` en `erp.document_file_metadata`.
4. **Prueba de restauración en PostgreSQL independiente:** ejecución obligatoria antes de salir a producción y periódica en una instancia PostgreSQL estándar (Docker local/CI) mediante `pg_restore`, verificando integridad contable y pruebas negativas RLS.
