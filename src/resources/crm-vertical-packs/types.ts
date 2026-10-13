export type CrmVerticalPackSector = "real_estate" | "professional_services" | "admissions" | "events";
export type CrmVerticalPackKind = "field" | "pipeline" | "label" | "demo";
export type CrmVerticalPackDecision = "add" | "reuse" | "conflict";
export type CrmVerticalPackResolution = "keep" | "replace";
export type CrmVerticalPackOperation = "apply" | "undo";
export interface CrmVerticalPackText { es: string; en: string; ca: string }
export interface CrmVerticalPackEnvelope<T> { data: T }
export interface CrmVerticalPackInstallation { id: string; version: number; receipt_id: string; pack_id: string; pack_version: number }
export interface CrmVerticalPackCatalogItem {
  id: string; version: number; sector: CrmVerticalPackSector; title: CrmVerticalPackText; description: CrmVerticalPackText;
  /** Immutable template fact; this does not authorize demo data or sandbox access. */
  supports_demo: boolean;
  /** Current native owner facts; null is actual absence, not a synthesized empty installation. */
  installation: CrmVerticalPackInstallation | null;
}
export interface CrmVerticalPackCatalog { items: CrmVerticalPackCatalogItem[]; next_cursor: null }
export interface CrmVerticalPackListParameters { sector?: CrmVerticalPackSector | null; cursor?: string | null }
export interface CrmVerticalPackPreviewBody { pack_version: number; demo_selected: boolean }
export interface CrmVerticalPackPlanBody { plan_token: string }
/** Native machine identifiers/current values are preserved; translated legends do not replace configuration. */
export interface CrmVerticalPackPlanItem {
  id: string;
  kind: CrmVerticalPackKind;
  machine_key: string;
  label: CrmVerticalPackText;
  decision: CrmVerticalPackDecision;
  current_version: number | null;
  allowed_resolutions: CrmVerticalPackResolution[];
  current_display: CrmVerticalPackText | null;
  proposed_display: CrmVerticalPackText;
}
export interface CrmVerticalPackPlan {
  id: string;
  version: number;
  pack_id: string;
  pack_version: number;
  preview_hash: string;
  /** Exact encrypted original, request/body only; no refresh or grant from this string. */
  plan_token: string;
  authorization_version: string;
  sandbox: boolean;
  demo_selected: boolean;
  items: CrmVerticalPackPlanItem[];
  blocking_codes: string[];
}
export interface CrmVerticalPackConflicts { items: CrmVerticalPackPlanItem[]; preview_hash: string }
export interface CrmVerticalPackApplyBody {
  expected_plan_version: number;
  preview_hash: string;
  plan_token: string;
  resolutions: Array<{ item_id: string; resolution: CrmVerticalPackResolution }>;
  demo_selected: boolean;
  confirmed: true;
}
export interface CrmVerticalPackUndoBody { expected_installation_version: number; original_receipt_id: string; confirmed: true }
/** Server IDs and original confirmation; never current head, pending/202, or inferred local grants. */
export interface CrmVerticalPackReceipt {
  id: string;
  operation: CrmVerticalPackOperation;
  target_id: string;
  confirmed: true;
  installation: CrmVerticalPackInstallation;
  items: Array<{ item_id: string; outcome: "added" | "reused" | "kept" | "replaced" | "undone"; target_id: string | null; version: number | null }>;
}
/** Caller retains original bytes/key. This SDK allocates no business UUID/key and does not retry a mutation. */
export interface CrmVerticalPackIntent { readonly operation: CrmVerticalPackOperation; readonly targetId: string; readonly originalKey: string; readonly originalWire: string }
export type CrmVerticalPackApplyIntent = CrmVerticalPackIntent & { readonly operation: "apply" };
export type CrmVerticalPackUndoIntent = CrmVerticalPackIntent & { readonly operation: "undo" };
/** All native V1 bindings are required. Source route composition/availability remains server-owned. */
export interface CrmVerticalPacksV1Paths {
  readonly listCrmPacks: string;
  previewCrmPack(packId: string): string;
  getCrmPackPlan(planId: string): string;
  getCrmPackConflicts(planId: string): string;
  applyCrmPack(planId: string): string;
  undoCrmPackInstallation(installationId: string): string;
  readonly getOriginalCrmPackReceipt: string;
}
