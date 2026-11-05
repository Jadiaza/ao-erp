export type AiActionRisk = "low" | "moderate" | "high" | "prohibited";
export type AiToolDefinition = { id: string; description: string; readOnly: boolean; risk: AiActionRisk; requiresHumanApproval: boolean; allowedRoles: string[]; allowedDomains: string[] };
export type AiInvocationContext = { actorRoleIds: string[]; purpose: string; containsSensitiveData: boolean; humanApprovalId?: string };
export function authorizeAiTool(tool: AiToolDefinition, context: AiInvocationContext): { allowed: boolean; reason: string } {
  if (!tool.allowedRoles.some((role) => context.actorRoleIds.includes(role))) return { allowed: false, reason: "AI_TOOL_ROLE_NOT_ALLOWED" };
  if (!context.purpose.trim()) return { allowed: false, reason: "AI_TOOL_PURPOSE_REQUIRED" };
  if (tool.risk === "prohibited") return { allowed: false, reason: "AI_TOOL_ACTION_PROHIBITED" };
  if (context.containsSensitiveData && tool.allowedDomains.length === 0) return { allowed: false, reason: "AI_SENSITIVE_DATA_SCOPE_UNDEFINED" };
  if (tool.requiresHumanApproval && !context.humanApprovalId?.trim()) return { allowed: false, reason: "AI_HUMAN_APPROVAL_REQUIRED" };
  if (tool.risk === "high" && !tool.requiresHumanApproval) return { allowed: false, reason: "AI_HIGH_RISK_MUST_REQUIRE_APPROVAL" };
  return { allowed: true, reason: "AI_TOOL_ALLOWED" };
}
