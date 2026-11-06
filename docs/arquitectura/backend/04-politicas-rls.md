# Políticas RLS

Estado: diseño; no ejecutado.

## Principio

Toda tabla expuesta debe tener RLS habilitado. Las políticas se basarán en una
función estable de membresía institucional, no en un `institution_id` enviado
por el cliente. La función debe evitar recursión RLS y no usar `SECURITY DEFINER`
salvo una necesidad revisada, en esquema no expuesto y con permisos explícitos.

Patrón conceptual:

```sql
using (
  exists (
    select 1 from app.institution_memberships m
    where m.institution_id = documents.institution_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
  )
)
```

En `INSERT` y `UPDATE` debe existir también `WITH CHECK`; en `UPDATE` se
requiere política de `SELECT`. El alcance parroquial añade una condición sobre
`parish_id` y la membresía. Los permisos finos de documentos restringidos se
resuelven en una tabla de capacidades o función de autorización revisada.

## Matriz de tablas

| Tabla | SELECT | INSERT/UPDATE | DELETE |
|---|---|---|---|
| institutions | membresía activa | administrador autorizado | nunca físico |
| memberships | propio o administrador del ámbito | administrador/invitación | suspensión lógica |
| parishes | alcance diocesano/institucional | rol institucional | política aprobada |
| documents/expedients | institución + parroquia + permiso | rol documental | eliminación lógica |
| finance/accounting | rol financiero y alcance | rol financiero | nunca físico ordinario |
| pastoral/sacramental | módulo + alcance específico | rol autorizado | nunca físico |
| audit_events | auditoría autorizada | solo servidor | nunca |

## Pruebas negativas obligatorias

- Cambiar `institution_id` en una lectura no devuelve filas.
- Cambiar `parish_id` a otra parroquia devuelve cero filas.
- Insertar con institución ajena falla por RLS/validación.
- Cambiar la institución de una fila falla por `WITH CHECK`.
- Un miembro diocesano no obtiene sacramentos privados sin permiso explícito.
- Un secreto de servicio no se incluye en ningún bundle público.

Las pruebas se ejecutarán contra una base aislada cuando exista proyecto aprobado.

Referencias: [RLS](https://supabase.com/features/row-level-security) y
[seguridad de datos](https://supabase.com/docs/guides/database/secure-data).
