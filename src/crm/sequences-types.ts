/** Current native v1 wire. Masks preserve omitted fields; identifiers use id only. */
export type CrmSequenceState = "draft" | "active" | "paused" | "retired";
export type CrmSequenceEnrolmentState = "active" | "waiting" | "paused" | "completed" | "cancelled" | "blocked";
export type CrmSequenceSubjectType = "lead" | "opportunity" | "business_contact";
export type CrmSequenceStopReason = "human_reply" | "optout" | "closure" | "booking_confirmed" | "owner_disabled" | "revoked" | "suppressed" | "manual" | "privacy" | "unconfirmed";
export type CrmSequenceStopCondition = "booking_confirmed" | "hard_bounce" | "complaint" | "contactability_revoked";
export interface CrmSequenceWindow { weekday: number; start_minute: number; end_minute: number }
export type CrmSequenceStep =
  | { type: "wait"; wait_seconds: number; recipe_id: null }
  | { type: "create_activity" | "draft" | "send"; wait_seconds: null; recipe_id: string };
export interface CrmSequenceDefinition {
  timezone: string;
  ambiguous_offset: "earlier" | "later";
  allowed_windows: CrmSequenceWindow[];
  steps: CrmSequenceStep[];
  stop_on_closure: boolean;
  purpose: string;
  channel: "email" | "whatsapp";
  /** Absence remains absence; explicit [] remains an explicit authored list. */
  stop_conditions?: CrmSequenceStopCondition[];
}
export interface CrmSequenceSaveBody { expected_version: number; definition: CrmSequenceDefinition }
export interface CrmSequenceEnrolBody { subject_type: CrmSequenceSubjectType; subject_id: string; expected_definition_version: number }
export interface CrmSequencePauseBody { expected_version: number; reason: "manual" }
export interface CrmSequenceControlBody { expected_version: number }
export interface CrmSequencePreviewParameters { subject_type: CrmSequenceSubjectType; subject_id: string; start_at: string }
export type CrmSequenceFilters =
  | { resource: "schedules"; state?: CrmSequenceState; owner_id?: string; team_id?: string | null }
  | { resource: "enrolments"; state?: CrmSequenceEnrolmentState; owner_id?: string; team_id?: string | null; sequence_id?: string; definition_version?: number; stop_reason?: CrmSequenceStopReason | null };
export interface CrmSequenceListParameters { filters: CrmSequenceFilters; limit: number; cursor?: string }
export interface CrmSequenceFields {
  definition?: string | null;
  state?: CrmSequenceState | null;
  owner_id?: string | null;
  team_id?: string | null;
  next_due_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}
export interface CrmSequenceMetadata {
  id: string;
  version: number;
  authorization_version: string;
  sandbox: boolean;
  state: CrmSequenceState;
  owner_id: string;
  team_id: string | null;
  fields: CrmSequenceFields;
}
/** First stored original, projected under current masks; no effect/token/claim fields. */
export type CrmSequenceOriginal = Omit<CrmSequenceMetadata, "fields"> & { fields: Omit<CrmSequenceFields, "definition"> };
export interface CrmSequenceEnrolmentOriginal {
  id: string;
  version: number;
  authorization_version: string;
  sandbox: boolean;
  sequence_id: string;
  subject_type: CrmSequenceSubjectType;
  subject_id: string;
  generation: number;
  definition_version: number;
  state: CrmSequenceEnrolmentState;
  current_step: number;
  due_at: string | null;
  stop_reason: CrmSequenceStopReason | null;
  fields: { state?: CrmSequenceEnrolmentState | null; next_due_at?: string | null; created_at?: string | null };
}
/** List metadata excludes subject, payload, consent, original receipt and message body. */
export interface CrmSequenceEnrolmentMetadata {
  id: string;
  version: number;
  authorization_version: string;
  sandbox: boolean;
  sequence_id: string;
  owner_id: string;
  team_id: string | null;
  generation: number;
  definition_version: number;
  state: CrmSequenceEnrolmentState;
  current_step: number;
  next_due_at: string | null;
  stop_reason: CrmSequenceStopReason | null;
  created_at: string;
  updated_at: string;
}
export type CrmSequenceListData =
  | { resource: "schedules"; items: CrmSequenceMetadata[]; enrolments: []; next_cursor: string | null; visible_count: number }
  | { resource: "enrolments"; items: CrmSequenceMetadata[]; enrolments: CrmSequenceEnrolmentMetadata[]; next_cursor: string | null; visible_count: number };
export interface CrmSequencePreview {
  sequence_id: string;
  definition_version: number;
  subject_id: string;
  timezone: string;
  steps: Array<{ step_index: number; type: "wait" | "create_activity" | "draft" | "send"; due_at: string; recipe_id: string | null }>;
}
export interface CrmSequenceEnvelope<T> { data: T }
export interface CrmSequenceSaveIntent { readonly operation: "save"; readonly targetId: string | null; readonly originalKey: string; readonly originalWire: string }
export interface CrmSequenceEnrolIntent { readonly operation: "enrol"; readonly targetId: string; readonly originalKey: string; readonly originalWire: string }
export type CrmSequenceOriginalIntent = CrmSequenceSaveIntent | CrmSequenceEnrolIntent;
/** Required native route composition, relative to the configured v1 base URL. No published URI is assumed. */
export interface CrmSequenceV1Paths {
  readonly list: string;
  readonly originalSave: string;
  readonly originalEnrol: string;
  save(targetId: string | null): string;
  enrol(sequenceId: string): string;
  preview(sequenceId: string): string;
  control(enrolmentId: string, action: "pause" | "resume" | "cancel"): string;
}
