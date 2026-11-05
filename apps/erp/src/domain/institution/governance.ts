export type InstitutionStatus = "draft" | "active" | "suspended" | "closed";
export type EcclesialUnitKind = "diocese" | "parish" | "chapel" | "mission" | "community" | "other";
export type EcclesialUnit = { id: string; name: string; kind: EcclesialUnitKind; parentId?: string; jurisdictionId: string; status: InstitutionStatus; validFrom: string; validTo?: string };
export type Delegation = { id: string; principalId: string; delegateId: string; scope: string[]; validFrom: string; validTo?: string; revokedAt?: string };

export function validateEcclesialHierarchy(units: readonly EcclesialUnit[]): string[] {
  const errors: string[] = [];
  const byId = new Map(units.map((unit) => [unit.id, unit]));
  if (byId.size !== units.length) errors.push("ECCLESIAL_UNIT_DUPLICATE_ID");
  for (const unit of units) {
    if (!unit.name.trim() || !unit.jurisdictionId.trim()) errors.push(`ECCLESIAL_UNIT_METADATA_REQUIRED:${unit.id}`);
    if (unit.validTo && unit.validTo < unit.validFrom) errors.push(`ECCLESIAL_UNIT_DATE_RANGE_INVALID:${unit.id}`);
    if (unit.parentId && !byId.has(unit.parentId)) errors.push(`ECCLESIAL_PARENT_NOT_FOUND:${unit.id}`);
    if (unit.parentId === unit.id) errors.push(`ECCLESIAL_SELF_PARENT:${unit.id}`);
    const seen = new Set([unit.id]);
    let cursor = unit.parentId;
    while (cursor) {
      if (seen.has(cursor)) { errors.push(`ECCLESIAL_HIERARCHY_CYCLE:${unit.id}`); break; }
      seen.add(cursor);
      cursor = byId.get(cursor)?.parentId;
    }
  }
  return [...new Set(errors)];
}
export function isDelegationActive(delegation: Delegation, at: string): boolean {
  return !delegation.revokedAt && delegation.validFrom <= at && (!delegation.validTo || delegation.validTo >= at);
}
export function delegationAllows(delegation: Delegation, actorId: string, scope: string, at: string): boolean {
  return delegation.delegateId === actorId && delegation.scope.includes(scope) && isDelegationActive(delegation, at);
}
