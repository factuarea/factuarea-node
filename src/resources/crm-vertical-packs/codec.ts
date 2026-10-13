import type * as T from "./types.js";

const sectors = ["real_estate", "professional_services", "admissions", "events"];
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const hex64 = /^[0-9a-f]{64}$/;
const surrogate = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u;
function fail(field: string): never { throw new TypeError(`Factuarea: incompatible VerticalPacks ${field}.`); }
function object(value: unknown, required: string[], optional: string[] = []): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value) || required.some((key) => !Object.hasOwn(value, key))
    || Object.keys(value).some((key) => !required.includes(key) && !optional.includes(key))) fail("closed fields");
  return value as Record<string, unknown>;
}
export function verticalPackId(value: unknown): asserts value is string { if (typeof value !== "string" || !uuid.test(value)) fail("native public id"); }
function hash(value: unknown): void { if (typeof value !== "string" || !hex64.test(value)) fail("hash/key"); }
function integer(value: unknown, min = 1): asserts value is number { if (typeof value !== "number" || !Number.isSafeInteger(value) || value < min) fail("exact integer"); }
function member(value: unknown, values: string[]): void { if (typeof value !== "string" || !values.includes(value)) fail("enum"); }
function token(value: unknown): void { if (typeof value !== "string" || value.trim() === "" || Buffer.byteLength(value, "utf8") > 32768 || surrogate.test(value)) fail("original plan token"); }
function translated(value: unknown): void {
  const data = object(value, ["es", "en", "ca"]);
  for (const text of Object.values(data)) if (typeof text !== "string" || text.trim() === "" || [...text].length > 2000 || surrogate.test(text) || /[\x00-\x1f\x7f]/.test(text)) fail("translated native text");
}
function items(value: unknown, conflictsOnly = false): void {
  if (!Array.isArray(value) || value.length > 200) fail("plan items"); const seen = new Set<string>();
  for (const item of value) {
    const row = object(item, ["id", "kind", "machine_key", "label", "decision", "current_version", "allowed_resolutions", "current_display", "proposed_display"]);
    verticalPackId(row.id); member(row.kind, ["field", "pipeline", "label", "demo"]); member(row.decision, ["add", "reuse", "conflict"]);
    if (typeof row.machine_key !== "string" || !/^[a-z][a-z0-9_.]{0,149}$/.test(row.machine_key)) fail("machine key");
    translated(row.label); translated(row.proposed_display); if (row.current_display !== null) translated(row.current_display);
    if (row.current_version !== null) integer(row.current_version);
    if ((row.decision === "add") !== (row.current_version === null) || (row.decision === "add") !== (row.current_display === null)) fail("native current facts");
    if (!Array.isArray(row.allowed_resolutions) || new Set(row.allowed_resolutions).size !== row.allowed_resolutions.length) fail("allowed resolutions");
    for (const resolution of row.allowed_resolutions) member(resolution, ["keep", "replace"]);
    if (row.decision === "conflict" ? !row.allowed_resolutions.includes("keep") : row.allowed_resolutions.length !== 0) fail("decision resolutions");
    if (conflictsOnly && row.decision !== "conflict") fail("conflicts projection");
    if (seen.has(row.id)) fail("duplicate item"); seen.add(row.id);
  }
}
export function verticalPackListQuery(value: T.CrmVerticalPackListParameters): Record<string, unknown> {
  const data = object(value, [], ["sector", "cursor"]);
  if (Object.hasOwn(data, "sector") && data.sector !== null) member(data.sector, sectors);
  if (Object.hasOwn(data, "cursor") && data.cursor !== null && (typeof data.cursor !== "string" || [...data.cursor].length > 2048 || surrogate.test(data.cursor))) fail("catalog cursor");
  return { ...data };
}
export function verticalPackPreviewBody(value: T.CrmVerticalPackPreviewBody): Record<string, unknown> {
  const data = object(value, ["pack_version", "demo_selected"]); integer(data.pack_version); if (typeof data.demo_selected !== "boolean") fail("explicit demo selection"); return { ...data };
}
export function verticalPackPlanBody(value: T.CrmVerticalPackPlanBody): Record<string, unknown> { const data = object(value, ["plan_token"]); token(data.plan_token); return { ...data }; }
/** Parse without reencoding the original. Native JSON integer syntax must survive JS numeric decoding. */
function originalBody(operation: T.CrmVerticalPackOperation, wire: string): void {
  if (typeof wire !== "string" || wire === "" || Buffer.byteLength(wire, "utf8") > 65536 || surrogate.test(wire)) fail("original wire");
  let value: unknown; try { value = JSON.parse(wire); } catch { fail("JSON"); }
  const expected = operation === "apply" ? "expected_plan_version" : "expected_installation_version";
  const row = object(value, operation === "apply" ? [expected, "preview_hash", "plan_token", "resolutions", "demo_selected", "confirmed"] : [expected, "original_receipt_id", "confirmed"]);
  integer(row[expected]); if (row.confirmed !== true) fail("explicit confirmation");
  // Root object members can be escaped; retain every original byte while checking the native integer token.
  let depth = 0; let expectKey = false;
  for (let index = 0; index < wire.length; index++) {
    const char = wire[index];
    if (char === "{" || char === "[") { depth++; if (depth === 1) expectKey = true; }
    else if (char === "}" || char === "]") depth--;
    else if (char === "," && depth === 1) expectKey = true;
    else if (char === '"') {
      const start = index;
      for (++index; index < wire.length; index++) { if (wire[index] === "\\") index++; else if (wire[index] === '"') break; }
      if (depth === 1 && expectKey) {
        const name = JSON.parse(wire.slice(start, index + 1)) as string; expectKey = false;
        if (name === expected) {
          const colon = wire.indexOf(":", index + 1); const literal = wire.slice(colon + 1).split(/[,}]/, 1)[0]!.trim();
          if (!/^-?(?:0|[1-9][0-9]*)$/.test(literal)) fail("native integer CAS token");
        }
      }
    }
  }
  if (operation === "apply") {
    hash(row.preview_hash); token(row.plan_token); if (typeof row.demo_selected !== "boolean") fail("explicit demo selection");
    if (!Array.isArray(row.resolutions) || row.resolutions.length > 200) fail("resolutions"); const seen = new Set<string>();
    for (const value of row.resolutions) {
      const resolution = object(value, ["item_id", "resolution"]); verticalPackId(resolution.item_id); member(resolution.resolution, ["keep", "replace"]);
      if (seen.has(resolution.item_id)) fail("duplicate resolution"); seen.add(resolution.item_id);
    }
  } else verticalPackId(row.original_receipt_id);
}
export function decodeCrmVerticalPackIntent(operation: "apply", targetId: string, originalKey: string, originalWire: string): T.CrmVerticalPackApplyIntent;
export function decodeCrmVerticalPackIntent(operation: "undo", targetId: string, originalKey: string, originalWire: string): T.CrmVerticalPackUndoIntent;
export function decodeCrmVerticalPackIntent(operation: T.CrmVerticalPackOperation, targetId: string, originalKey: string, originalWire: string): T.CrmVerticalPackIntent;
export function decodeCrmVerticalPackIntent(operation: T.CrmVerticalPackOperation, targetId: string, originalKey: string, originalWire: string): T.CrmVerticalPackIntent {
  member(operation, ["apply", "undo"]); verticalPackId(targetId); hash(originalKey); originalBody(operation, originalWire);
  return Object.freeze({ operation, targetId, originalKey, originalWire });
}
export function validateCrmVerticalPackIntent(value: T.CrmVerticalPackIntent): T.CrmVerticalPackIntent {
  const data = object(value, ["operation", "targetId", "originalKey", "originalWire"]);
  return decodeCrmVerticalPackIntent(data.operation as T.CrmVerticalPackOperation, data.targetId as string, data.originalKey as string, data.originalWire as string);
}
export function decodeCrmVerticalPackCatalog(value: unknown): T.CrmVerticalPackEnvelope<T.CrmVerticalPackCatalog> {
  const envelope = object(value, ["data"]); const data = object(envelope.data, ["items", "next_cursor"]);
  if (!Array.isArray(data.items) || data.next_cursor !== null) fail("current native catalog page"); const seen = new Set<string>();
  for (const item of data.items) {
    const row = object(item, ["id", "version", "sector", "title", "description", "supports_demo", "installation"]); verticalPackId(row.id); integer(row.version); member(row.sector, sectors); translated(row.title); translated(row.description);
    if (typeof row.supports_demo !== "boolean") fail("native template demo fact");
    if (row.installation !== null) {
      const install = object(row.installation, ["id", "version", "receipt_id", "pack_id", "pack_version"]);
      for (const key of ["id", "receipt_id", "pack_id"]) verticalPackId(install[key]); integer(install.version); integer(install.pack_version);
      if (install.pack_id !== row.id) fail("current installation pack binding");
    }
    if (seen.has(row.id)) fail("duplicate pack"); seen.add(row.id);
  }
  return value as T.CrmVerticalPackEnvelope<T.CrmVerticalPackCatalog>;
}
export function decodeCrmVerticalPackPlan(value: unknown): T.CrmVerticalPackEnvelope<T.CrmVerticalPackPlan> {
  const envelope = object(value, ["data"]); const data = object(envelope.data, ["id", "version", "pack_id", "pack_version", "preview_hash", "plan_token", "authorization_version", "sandbox", "demo_selected", "items", "blocking_codes"]);
  verticalPackId(data.id); verticalPackId(data.pack_id); integer(data.version); integer(data.pack_version); hash(data.preview_hash); token(data.plan_token);
  if (typeof data.authorization_version !== "string" || data.authorization_version.trim() === "" || typeof data.sandbox !== "boolean"
    || typeof data.demo_selected !== "boolean" || (data.demo_selected && !data.sandbox)) fail("native plan binding");
  items(data.items);
  if (!Array.isArray(data.blocking_codes) || data.blocking_codes.some((code) => typeof code !== "string" || code === "" || surrogate.test(code))) fail("blocking codes");
  return value as T.CrmVerticalPackEnvelope<T.CrmVerticalPackPlan>;
}
export function decodeCrmVerticalPackConflicts(value: unknown): T.CrmVerticalPackEnvelope<T.CrmVerticalPackConflicts> {
  const envelope = object(value, ["data"]); const data = object(envelope.data, ["items", "preview_hash"]); hash(data.preview_hash); items(data.items, true);
  return value as T.CrmVerticalPackEnvelope<T.CrmVerticalPackConflicts>;
}
export function decodeCrmVerticalPackReceipt(value: unknown): T.CrmVerticalPackEnvelope<T.CrmVerticalPackReceipt | null> {
  const envelope = object(value, ["data"]); if (envelope.data === null) return value as T.CrmVerticalPackEnvelope<null>;
  const data = object(envelope.data, ["id", "operation", "target_id", "confirmed", "installation", "items"]);
  verticalPackId(data.id); verticalPackId(data.target_id); member(data.operation, ["apply", "undo"]); if (data.confirmed !== true) fail("native confirmed original");
  const install = object(data.installation, ["id", "version", "receipt_id", "pack_id", "pack_version"]); for (const key of ["id", "receipt_id", "pack_id"]) verticalPackId(install[key]); integer(install.version); integer(install.pack_version);
  if (!Array.isArray(data.items) || data.items.length > 200) fail("receipt items"); const seen = new Set<string>();
  for (const item of data.items) {
    const row = object(item, ["item_id", "outcome", "target_id", "version"]); verticalPackId(row.item_id); member(row.outcome, ["added", "reused", "kept", "replaced", "undone"]);
    if ((row.target_id === null) !== (row.version === null)) fail("paired receipt facts");
    if (row.target_id !== null) { verticalPackId(row.target_id); integer(row.version); }
    if (seen.has(row.item_id)) fail("duplicate receipt item"); seen.add(row.item_id);
  }
  return value as T.CrmVerticalPackEnvelope<T.CrmVerticalPackReceipt>;
}
export function verticalPackPath(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value === "/" || /[?#\s\\%]/.test(value)
    || value.includes("..") || value.includes("://")) fail("required relative V1 path");
  return value;
}
export function validateCrmVerticalPacksPaths(value: T.CrmVerticalPacksV1Paths): void {
  const paths = object(value, ["listCrmPacks", "previewCrmPack", "getCrmPackPlan", "getCrmPackConflicts", "applyCrmPack", "undoCrmPackInstallation", "getOriginalCrmPackReceipt"]);
  for (const key of ["listCrmPacks", "getOriginalCrmPackReceipt"]) verticalPackPath(paths[key]);
  for (const key of ["previewCrmPack", "getCrmPackPlan", "getCrmPackConflicts", "applyCrmPack", "undoCrmPackInstallation"]) if (typeof paths[key] !== "function") fail("required route function");
}
