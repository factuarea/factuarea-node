import { CrmCommercialContractError } from "./errors.js";
import type { CrmActivity, CrmActivityDetail, CrmActivityWrite, CrmDecimal, CrmJson, CrmLead, CrmLeadIdentity, CrmLeadList, CrmOpportunity, CrmUuid } from "./types.js";
export function crmUuid(value: string): CrmUuid {
  if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(value)) fail();
  return value as CrmUuid;
}
export function crmDecimal(value: string): CrmDecimal {
  if (typeof value !== "string" || !/^(?:0|[1-9][0-9]{0,15})(?:\.[0-9]{1,4})?$/.test(value)) fail();
  return value as CrmDecimal;
}
/** User identities retain their native UUID version; entity identities require UUID v7. */
export function crmUserUuid(value: string): CrmUuid { uuid(value, false, true); return value as CrmUuid; }
/** Lead estimated value uses its own native unbounded non-negative decimal-string grid. */
export function crmEstimatedValueDecimal(value: string): CrmDecimal { if (typeof value !== "string" || !/^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(value)) fail(); return value as CrmDecimal; }
function fail(): never { throw new CrmCommercialContractError("Invalid native CRM commercial contract."); }
export function object(value: unknown): Record<string, unknown> { if (!value || typeof value !== "object" || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) fail(); return value as Record<string, unknown>; }
export function keys(value: Record<string, unknown>, allowed: readonly string[], required: readonly string[] = []): void { if (Object.keys(value).some(k => !allowed.includes(k)) || required.some(k => !Object.hasOwn(value, k))) fail(); }
export function version(v: unknown, min = 1): void { if (!Number.isSafeInteger(v) || Number(v) < min) fail(); }
export function text(v: unknown, max: number, nullable = false): void { if (nullable && v === null) return; if (typeof v !== "string" || [...v].length > max || /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(v) || Buffer.from(v, "utf8").toString("utf8") !== v) fail(); }
export function timestamp(v: unknown, nullable = false): void { if (nullable && v === null) return; if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(v) || !Number.isFinite(Date.parse(v)) || new Date(v).toISOString().replace(".000Z", "Z") !== v) fail(); }
export function uuid(v: unknown, nullable = false, user = false): void { if (nullable && v === null) return; if (typeof v !== "string") fail(); if (user) { if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)) fail(); } else crmUuid(v); }
export function oneOf(v: unknown, values: readonly unknown[]): void { if (!values.includes(v)) fail(); }
export function json(value: unknown, depth = 0): asserts value is CrmJson { if (depth > 64) fail(); if (value === null || typeof value === "boolean") return; if (typeof value === "string") { text(value, Number.MAX_SAFE_INTEGER); return; } if (typeof value === "number") { if (!Number.isFinite(value)) fail(); return; } if (Array.isArray(value)) { for (const x of value) json(x, depth + 1); } else { for (const x of Object.values(object(value))) json(x, depth + 1); } }
export function freeze<T>(v: T): T { if (v !== null && typeof v === "object") { for (const x of Object.values(v)) freeze(x); Object.freeze(v); } return v; }
function objects(v: unknown): void { if (!Array.isArray(v)) fail(); for (const x of v) object(x); }
function envelope(v: unknown): Record<string, unknown> { const e = object(v); json(e); return object(e.data); }
export function decodeLead(v: unknown): CrmLead {
  const d = object(v); json(d); uuid(d.id); version(d.version); oneOf(d.status, ["open", "disqualified", "converted", "deleted"]); oneOf(d.stage, ["inbox", "contacted", "qualified"]);
  for (const [k, max] of Object.entries({ name: 255, email: 191, phone: 30, mobile: 30 })) text(d[k], max, true);
  for (const k of ["owner_id", "team_id", "contact_id", "person_id", "source_term_id", "score_policy_id"]) uuid(d[k], true, k === "owner_id");
  for (const k of ["contact_data", "first_attribution", "last_attribution", "typed_fields"]) object(d[k]);
  for (const k of ["score_factors", "consent", "typed_conflicts"]) objects(d[k]);
  for (const k of ["typed_projection", "routing"]) if (d[k] !== null) object(d[k]);
  version(d.score, 0); if (Number(d.score) > 100) fail(); text(d.source, 64); text(d.rules_version, 255);
  if (d.score_policy_version !== null) version(d.score_policy_version); if ((d.score_policy_id === null) !== (d.score_policy_version === null)) fail();
  for (const k of ["created_at", "updated_at", "score_evaluated_at"]) timestamp(d[k]); timestamp(d.erased_at, true);
  const next = object(d.next_action); oneOf(next.status, ["unavailable", "none", "available", "error"]); uuid(next.activity_id, true); for (const k of ["type", "title", "reason"]) text(next[k], 500, true); timestamp(next.due_at, true);
  if (next.status === "available") { if (next.activity_id === null || next.type === null || next.title === null || next.reason !== null) fail(); } else if (next.activity_id !== null || next.type !== null || next.title !== null || next.due_at !== null || next.status === "none" && next.reason !== null) fail();
  return freeze(d) as unknown as CrmLead;
}
export function decodeLeadResult(v: unknown): CrmLead | CrmLeadIdentity { const d = envelope(v); if (Object.hasOwn(d, "confirmed")) { keys(d, ["id", "confirmed", "representation_available"], ["id", "confirmed", "representation_available"]); uuid(d.id); oneOf(d.confirmed, [true]); oneOf(d.representation_available, [false]); return freeze(d) as unknown as CrmLeadIdentity; } return decodeLead(d); }
export function decodeLeadDetail(v: unknown): CrmLead { return decodeLead(envelope(v)); }
export function decodeLeadList(v: unknown): CrmLeadList { const d = envelope(v); if (!Array.isArray(d.data) || typeof d.has_more !== "boolean" || !(d.next_cursor === null || typeof d.next_cursor === "string" && d.next_cursor.length > 0 && d.next_cursor.length <= 4096) || d.has_more !== (d.next_cursor !== null)) fail(); d.data.forEach(decodeLead); return freeze(d) as unknown as CrmLeadList; }
export function decodeOpportunity(v: unknown): CrmOpportunity {
  const d = envelope(v); uuid(d.id); version(d.version); oneOf(d.status, ["open", "won", "lost"]);
  for (const k of ["lead_id", "contact_id", "pipeline_id", "stage_id", "owner_id", "team_id", "loss_reason_id"]) uuid(d[k], true, k === "owner_id");
  for (const k of ["title", "currency", "override_reason", "next_step", "close_reason"]) text(d[k], 4000, true);
  for (const k of ["amount", "weighted_value"]) if (d[k] !== null && (typeof d[k] !== "string" || !/^(?:0|[1-9][0-9]{0,15})\.[0-9]{4}$/.test(d[k]))) fail();
  if (d.currency !== null && (typeof d.currency !== "string" || !/^[A-Z]{3}$/.test(d.currency))) fail();
  for (const k of ["probability", "probability_override"]) if (d[k] !== null && (typeof d[k] !== "string" || !/^(?:0|[1-9][0-9]?|100)\.[0-9]{2}$/.test(d[k]) || Number(d[k]) > 100)) fail();
  for (const k of ["closed_at", "stage_changed_at"]) timestamp(d[k], true);
  if (d.expected_close !== null && (typeof d.expected_close !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(d.expected_close) || !Number.isFinite(Date.parse(d.expected_close)) || new Date(d.expected_close).toISOString().slice(0, 10) !== d.expected_close)) fail();
  if (d.participants !== null) { objects(d.participants); for (const p of d.participants as unknown[]) { const row = object(p); uuid(row.person_id); text(row.role, 100); if (row.credit_percentage !== null && (typeof row.credit_percentage !== "string" || !/^(?:0|[1-9][0-9]?|100)\.[0-9]{2}$/.test(row.credit_percentage) || Number(row.credit_percentage) > 100)) fail(); } }
  for (const k of ["playbook_answers", "history"]) if (d[k] !== null) objects(d[k]);
  return freeze(d) as unknown as CrmOpportunity;
}
export function decodeOpportunityDetail(v: unknown): CrmOpportunity | null { const d = envelope(v); if (Object.hasOwn(d, "opportunity")) { keys(d, ["opportunity"], ["opportunity"]); if (d.opportunity !== null) fail(); return null; } return decodeOpportunity(v); }
function decodeActivity(v: unknown): CrmActivity { const d = object(v); uuid(d.id); version(d.version); oneOf(d.type, ["task", "call", "meeting", "note"]); oneOf(d.status, [null, "pending", "completed", "cancelled"]); for (const k of ["title", "body", "timezone"]) text(d[k], k === "body" ? 65535 : 255, true); for (const k of ["owner_id", "team_id", "task_id"]) uuid(d[k], true, k === "owner_id"); for (const k of ["due_at", "completed_at", "reminder_at"]) timestamp(d[k], true); if ((d.type === "task") !== (d.task_id !== null) || d.type === "task" && d.status !== null) fail(); objects(d.targets); for (const t of d.targets as unknown[]) { const target = object(t); oneOf(target.type, ["contact", "person", "lead", "opportunity", "booking"]); uuid(target.id); } return freeze(d) as unknown as CrmActivity; }
export function decodeActivityWrite(v: unknown): CrmActivityWrite { const d = envelope(v); keys(d, ["state", "effect_id", "activity_id", "activity"], ["state", "effect_id", "activity_id", "activity"]); oneOf(d.state, ["confirmed", "pending", "in_progress", "unconfirmed"]); uuid(d.effect_id); uuid(d.activity_id); if (d.effect_id === d.activity_id || d.state !== "confirmed") fail(); if (d.activity !== null) { const a = decodeActivity(d.activity); if (a.id !== d.activity_id) fail(); } return freeze(d) as unknown as CrmActivityWrite; }
export function decodeActivityDetail(v: unknown): CrmActivityDetail { const d = envelope(v); if (d.activity !== null) decodeActivity(d.activity); objects(d.comments); objects(d.attachments); return freeze(d) as unknown as CrmActivityDetail; }
