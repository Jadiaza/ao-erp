export type PermissionAction = "create" | "read" | "update" | "delete" | "approve" | "post" | "certify" | "export";
export type AccessSubject = { userId: string; roleIds: string[]; organizationId: string; unitIds: string[]; attributes: Record<string, string | boolean> };
export type AccessPolicy = { id: string; resource: string; actions: PermissionAction[]; roleIds: string[]; organizationScoped: boolean; unitScoped: boolean; requiredAttributes?: Record<string, string | boolean> };

export function authorize(subject: AccessSubject, policy: AccessPolicy, action: PermissionAction, resourceOrganizationId: string, resourceUnitId?: string): boolean {
  if (!subject.userId || !policy.actions.includes(action)) return false;
  if (!policy.roleIds.some((role) => subject.roleIds.includes(role))) return false;
  if (policy.organizationScoped && subject.organizationId !== resourceOrganizationId) return false;
  if (policy.unitScoped && (!resourceUnitId || !subject.unitIds.includes(resourceUnitId))) return false;
  return Object.entries(policy.requiredAttributes ?? {}).every(([key, value]) => subject.attributes[key] === value);
}
export function assertAuthorized(...args: Parameters<typeof authorize>): void {
  if (!authorize(...args)) throw new Error("AO_ACCESS_DENIED");
}
export type UserAccountStatus = "invited" | "active" | "locked" | "disabled";
export function canAuthenticate(status: UserAccountStatus, mfaEnabled: boolean, requiresMfa: boolean): boolean {
  return status === "active" && (!requiresMfa || mfaEnabled);
}
