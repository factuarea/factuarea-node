export type CrmJson = null | boolean | number | string | readonly CrmJson[] | { readonly [key: string]: CrmJson };
export type CrmJsonObject = { readonly [key: string]: CrmJson };
declare const uuidBrand: unique symbol;
declare const decimalBrand: unique symbol;
export type CrmUuid = string & { readonly [uuidBrand]: true };
export type CrmDecimal = string & { readonly [decimalBrand]: true };
export interface CrmLeadCreate {
  id?: CrmUuid; name?: string | null; email?: string | null; phone?: string | null; mobile?: string | null;
  company_name?: string | null; notes?: string | null; source?: "manual";
  owner_id?: CrmUuid | null; team_id?: CrmUuid | null;
  address?: { line_1?: string | null; line_2?: string | null; number?: string | null; floor?: string | null; door?: string | null; staircase?: string | null; city?: string | null; province?: string | null; postal_code?: string | null; country_code?: string | null; locality_key?: string | null; create_locality?: boolean } | null;
  metadata?: { readonly [key: string]: string | number | boolean | null };
  estimated_value?: { amount: CrmDecimal; currency: string } | null;
  typed_fields?: { expected_definition_version: number; values: { value_version: number; values: readonly { field_id: CrmUuid; field_version: number; value: string | boolean | readonly string[] | null }[] } };
}
export interface CrmOpportunityCreate {
  title: string; lead_id?: CrmUuid | null; contact_id?: CrmUuid | null;
  pipeline_id: CrmUuid; stage_id: CrmUuid; amount: CrmDecimal; currency: string;
  owner_id?: CrmUuid | null; team_id?: CrmUuid | null;
}
export interface CrmOpportunityStage {
  expected_version: number; target_pipeline_id: CrmUuid; target_stage_id: CrmUuid; expected_definition_version: number;
}
export interface CrmActivityCreate {
  type: "task" | "call" | "meeting" | "note"; title: string; body?: string | null;
  target: { type: "contact" | "person" | "lead" | "opportunity" | "booking"; id: CrmUuid };
  owner_id?: CrmUuid | null; due_at?: string | null; timezone: string;
}
export interface CrmLead {
  id: CrmUuid; version: number; status: "open" | "disqualified" | "converted" | "deleted"; stage: "inbox" | "contacted" | "qualified";
  name: string | null; email: string | null; phone: string | null; mobile: string | null;
  contact_data: CrmJsonObject; owner_id: CrmUuid | null; team_id: CrmUuid | null; contact_id: CrmUuid | null; person_id: CrmUuid | null;
  first_attribution: CrmJsonObject; last_attribution: CrmJsonObject; source: string; source_term_id: CrmUuid | null;
  score: number; rules_version: string; score_factors: readonly CrmJsonObject[]; score_policy_id: CrmUuid | null;
  score_policy_version: number | null; score_evaluated_at: string; consent: readonly CrmJsonObject[];
  typed_fields: CrmJsonObject; typed_conflicts: readonly CrmJsonObject[]; typed_projection: CrmJsonObject | null;
  next_action: { status: "unavailable" | "none" | "available" | "error"; activity_id: CrmUuid | null; type: string | null; title: string | null; due_at: string | null; reason: string | null };
  created_at: string; updated_at: string; erased_at: string | null; routing: CrmJsonObject | null;
}
export interface CrmLeadIdentity { id: CrmUuid; confirmed: true; representation_available: false }
export interface CrmLeadList { data: readonly CrmLead[]; next_cursor: string | null; has_more: boolean }
export interface CrmLeadListParams { cursor?: string; limit?: number; search?: string; sort?: "uuid" | "-uuid" | "created_at" | "-created_at" | "updated_at" | "-updated_at" | "score" | "-score"; filters?: CrmJsonObject }
export interface CrmOpportunity {
  id: CrmUuid; version: number; status: "open" | "won" | "lost"; title: string | null;
  lead_id: CrmUuid | null; contact_id: CrmUuid | null; pipeline_id: CrmUuid | null; stage_id: CrmUuid | null; owner_id: CrmUuid | null; team_id: CrmUuid | null;
  amount: CrmDecimal | null; currency: string | null; probability: string | null; probability_override: string | null; override_reason: string | null; weighted_value: string | null;
  expected_close: string | null; next_step: string | null; closed_at: string | null; loss_reason_id: CrmUuid | null; close_reason: string | null; stage_changed_at: string | null;
  participants: readonly { person_id: CrmUuid; role: string; credit_percentage: string | null }[] | null;
  playbook_answers: readonly CrmJsonObject[] | null; history: readonly CrmJsonObject[] | null;
}
export interface CrmActivity {
  id: CrmUuid; version: number; type: "task" | "call" | "meeting" | "note"; title: string | null; body: string | null;
  owner_id: CrmUuid | null; team_id: CrmUuid | null; status: "pending" | "completed" | "cancelled" | null;
  due_at: string | null; timezone: string | null; completed_at: string | null; reminder_at: string | null; task_id: CrmUuid | null;
  targets: readonly CrmActivityCreate["target"][];
}
export interface CrmActivityWrite { state: "confirmed"; effect_id: CrmUuid; activity_id: CrmUuid; activity: CrmActivity | null }
export interface CrmActivityDetail { activity: CrmActivity | null; comments: readonly CrmJsonObject[]; attachments: readonly CrmJsonObject[] }
export interface CrmCallOptions { signal?: AbortSignal; timeout?: number }
