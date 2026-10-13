/** Native fine scope requirements and the corresponding OAuth grants. */
export const CRM_OAUTH_SCOPES = Object.freeze({
  credentialContext: { operation: "crm_access_context.show", fine: "crm_access_context:read", oauth: "crm_access_context.read" },
  leadCreate: { operation: "crm_leads.create", fine: "crm_leads:write", oauth: "crm_leads.write" },
  opportunityCreate: { operation: "crm_opportunities.create", fine: "crm_opportunities:write", oauth: "crm_opportunities.write" },
  opportunityStage: { operation: "crm_opportunities.move_stage", fine: "crm_opportunities:write", oauth: "crm_opportunities.write" },
  activityCreate: { operation: "crm_activities.create", fine: "crm_activities:write", oauth: "crm_activities.write" },
} as const);
export type CrmOriginalOperation = "leadCreate" | "opportunityCreate" | "opportunityStage" | "activityCreate";
export interface CrmCredentialContext {
  company_id: string;
  credential_id: string;
  client_id: string;
  environment: "live" | "test";
  scopes: readonly string[];
  authorization_version: string;
}
export interface CrmOriginalReceipt {
  state: "confirmed" | "pending" | "in_progress" | "unconfirmed" | "missing";
  original_body_sha256: string;
  /** The exact original response body string. Decode a copy only when needed. */
  original_response: { status: number; body: string } | null;
}
export interface CrmOriginalEnvelope { data: CrmOriginalReceipt; meta: { authorization_version: string } }
export class CrmOriginalContractError extends TypeError {}
export function record(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new CrmOriginalContractError("Invalid native CRM response.");
  return value as Record<string, unknown>;
}
export function nativeUuid(value: unknown): string {
  if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) throw new CrmOriginalContractError("A native CRM UUID is required.");
  return value.toLowerCase();
}
export function decodeCredentialContext(value: unknown): CrmCredentialContext {
  const data = record(record(value).data);
  for (const field of ["company_id", "credential_id", "client_id"]) nativeUuid(data[field]);
  if (!["live", "test"].includes(String(data.environment)) || typeof data.authorization_version !== "string" || !data.authorization_version || !Array.isArray(data.scopes) || data.scopes.some(scope => typeof scope !== "string" || (scope !== "*" && !/^[a-z][a-z0-9_]*:[a-z][a-z0-9_]*$/.test(scope))) || new Set(data.scopes).size !== data.scopes.length) throw new CrmOriginalContractError("Invalid credential context.");
  return Object.freeze({ ...data, scopes: Object.freeze([...data.scopes]) }) as unknown as CrmCredentialContext;
}
export function decodeOriginal(value: unknown, sha256: string): CrmOriginalEnvelope {
  const envelope = record(value), data = record(envelope.data), meta = record(envelope.meta);
  if (!["confirmed", "pending", "in_progress", "unconfirmed", "missing"].includes(String(data.state)) || data.original_body_sha256 !== sha256 || typeof meta.authorization_version !== "string" || !meta.authorization_version) throw new CrmOriginalContractError("Original receipt does not match the first request.");
  if (data.state === "confirmed") {
    const original = record(data.original_response);
    if (!Number.isInteger(original.status) || Number(original.status) < 200 || Number(original.status) > 299 || typeof original.body !== "string") throw new CrmOriginalContractError("Original confirmation is invalid.");
    try { JSON.parse(original.body); } catch { throw new CrmOriginalContractError("Original confirmation requires its exact JSON body."); }
  } else if (data.original_response !== null) throw new CrmOriginalContractError("An unconfirmed original cannot contain a confirmation.");
  return envelope as unknown as CrmOriginalEnvelope;
}
