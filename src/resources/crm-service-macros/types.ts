/** Native CustomerService public-api-macros.php; masked fields remain omitted. */
export type CrmServiceMacroOperation = "save" | "archive" | "apply";
export type CrmServiceMacroAction = "status" | "priority" | "assignees" | "tags";
export type CrmServiceMacroVariable = "customer_name" | "customer_email" | "case_id" | "case_subject" | "agent_name" | "agent_email" | "org_name";
export type CrmServiceMacroLocale = "es" | "en" | "ca";
export interface CrmServiceMacroActions {
  status?: "new" | "assigned" | "pending" | "closed" | "rejected";
  priority?: "low" | "normal" | "high" | "urgent";
  assignees?: string[];
  tags?: string[];
}
export interface CrmServiceMacroFields {
  name?: string;
  visibility?: "personal" | "shared";
  owner_id?: string | null;
  team_id?: string | null;
  body_template?: string;
  variables_schema?: CrmServiceMacroVariable[];
  actions?: CrmServiceMacroActions;
  enabled?: boolean;
  usage_metric?: "application" | "render_confirmed";
  archived_at?: string | null;
  created_at?: string;
  updated_at?: string;
}
export interface CrmServiceMacroView { id: string; version: number; fields: CrmServiceMacroFields }
export interface CrmServiceMacroPageParameters { page?: number; per_page?: number }
export interface CrmServiceMacroList { items: CrmServiceMacroView[]; total: number; page: number; per_page: number }
export interface CrmServiceMacroReceiptFields {
  actor_id?: string;
  operation?: "customer_service.save_macro" | "customer_service.archive_macro" | "customer_service.apply_macro";
  ticket_id?: string | null;
  ticket_version?: number | null;
  metric?: string;
  counted?: boolean;
  confirmed_at?: string;
  selected_actions?: CrmServiceMacroActions;
}
export interface CrmServiceMacroUsageReceipt extends CrmServiceMacroReceiptFields {
  macro_version?: number;
  macro_snapshot?: Omit<CrmServiceMacroView, "fields"> & CrmServiceMacroFields;
}
export interface CrmServiceMacroOriginalReceipt extends CrmServiceMacroView, CrmServiceMacroReceiptFields {}
export interface CrmServiceMacroUsage { macro_id: string; count: number; receipts: CrmServiceMacroUsageReceipt[]; page: number; per_page: number }
export interface CrmServiceMacroOriginal { macro_id: string; count: 1; receipts: [CrmServiceMacroOriginalReceipt]; page: 1; per_page: 1 }
export interface CrmServiceMacroEnvelope<T> { data: T }
export interface CrmServiceMacroRenderBody {
  macro_version: number;
  ticket_id: string;
  ticket_version: number;
  recipient_id?: string | null;
  locale: CrmServiceMacroLocale;
  selected_actions?: CrmServiceMacroAction[] | null;
}
export interface CrmServiceMacroRender {
  macro_id: string;
  macro_version: number;
  ticket_id: string;
  ticket_version: number;
  recipient_id: string | null;
  locale: CrmServiceMacroLocale;
  draft: string;
  warnings: Array<{ token: string; reason: string }>;
  actions: CrmServiceMacroActions;
  render_hash: string;
  requires_review: boolean;
}
export interface CrmServiceMacroSaveBody {
  expected_version: number;
  confirmed: true;
  name?: string;
  visibility?: "personal" | "shared";
  team_id?: string | null;
  body_template?: string;
  variables_schema?: CrmServiceMacroVariable[];
  actions?: CrmServiceMacroActions;
  enabled?: boolean;
  usage_metric?: "application" | "render_confirmed";
}
export type CrmServiceMacroCreateBody = CrmServiceMacroSaveBody & Required<Pick<CrmServiceMacroSaveBody, "name" | "visibility" | "body_template" | "variables_schema" | "actions" | "enabled" | "usage_metric">> & { expected_version: 0 };
export interface CrmServiceMacroArchiveBody { expected_version: number; confirmed: true }
export interface CrmServiceMacroApplyBody extends CrmServiceMacroArchiveBody {
  ticket_id: string;
  ticket_expected_version: number;
  recipient_id?: string | null;
  locale: CrmServiceMacroLocale;
  mode: "application" | "confirm_render";
  selected_actions?: CrmServiceMacroAction[] | null;
  render_hash?: string;
}
/** Retain before dispatch. No effect, business identity or authority is allocated by the SDK. */
export interface CrmServiceMacroIntent { readonly operation: CrmServiceMacroOperation; readonly targetId: string | null; readonly originalKey: string; readonly originalWire: string }
export type CrmServiceMacroSaveIntent = CrmServiceMacroIntent & { readonly operation: "save" };
export type CrmServiceMacroArchiveIntent = CrmServiceMacroIntent & { readonly operation: "archive"; readonly targetId: string };
export type CrmServiceMacroApplyIntent = CrmServiceMacroIntent & { readonly operation: "apply"; readonly targetId: string };
/** All native bindings are required; declaring a binding never enables the server capability. */
export interface CrmServiceMacrosV1Paths {
  listServiceMacros: string;
  createServiceMacro: string;
  updateServiceMacro: (id: string) => string;
  archiveServiceMacro: (id: string) => string;
  applyServiceMacro: (id: string) => string;
  renderServiceMacro: (id: string) => string;
  getServiceMacroUsage: (id: string) => string;
  getSaveServiceMacroOriginal: string;
  getArchiveServiceMacroOriginal: string;
  getApplyServiceMacroOriginal: string;
}
