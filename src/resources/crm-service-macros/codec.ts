import type * as T from "./types.js";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const userUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const actions = ["status", "priority", "assignees", "tags"];
const variables = ["customer_name", "customer_email", "case_id", "case_subject", "agent_name", "agent_email", "org_name"];
const saveFields = ["name", "visibility", "team_id", "body_template", "variables_schema", "actions", "enabled", "usage_metric"];
const viewFields = [...saveFields, "owner_id", "archived_at", "created_at", "updated_at"];
const receiptFields = ["actor_id", "operation", "ticket_id", "ticket_version", "metric", "counted", "confirmed_at", "selected_actions"];
const surrogate = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u;
function fail(field: string): never { throw new TypeError(`Factuarea: incompatible native ServiceMacro ${field}.`); }
function object(value: unknown, required: string[], optional: string[] = []): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value) || required.some((key) => !Object.hasOwn(value, key))
    || Object.keys(value).some((key) => !required.includes(key) && !optional.includes(key))) fail("closed fields");
  return value as Record<string, unknown>;
}
export function serviceMacroId(value: unknown): asserts value is string { if (typeof value !== "string" || !uuid.test(value)) fail("public UUID v7"); }
function userId(value: unknown): void { if (typeof value !== "string" || !userUuid.test(value)) fail("User UUID"); }
function integer(value: unknown, minimum = 1, maximum = Number.MAX_SAFE_INTEGER): asserts value is number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < minimum || value > maximum) fail("exact integer");
}
function text(value: unknown): asserts value is string { if (typeof value !== "string" || surrogate.test(value)) fail("UTF8 text"); }
function member(value: unknown, values: string[]): void { if (typeof value !== "string" || !values.includes(value)) fail("enum"); }
function uniqueList(value: unknown, validate: (item: unknown) => void, maximum = Number.MAX_SAFE_INTEGER, normalize = false): void {
  if (!Array.isArray(value) || value.length > maximum) fail("list"); const seen = new Set<unknown>();
  for (const item of value) { validate(item); const key = normalize && typeof item === "string" ? item.toLowerCase() : item; if (seen.has(key)) fail("duplicate list value"); seen.add(key); }
}
function actionPlan(value: unknown): void {
  const data = object(value, [], actions);
  for (const [key, item] of Object.entries(data)) {
    if (key === "status") member(item, ["new", "assigned", "pending", "closed", "rejected"]);
    else if (key === "priority") member(item, ["low", "normal", "high", "urgent"]);
    else uniqueList(item, key === "tags" ? serviceMacroId : userId, Number.MAX_SAFE_INTEGER, key === "tags");
  }
}
function selected(value: unknown): void { if (value !== null) uniqueList(value, (item) => member(item, actions), 4); }
function macroFields(value: unknown, input = false): void {
  const data = object(value, [], input ? saveFields : viewFields);
  for (const [key, item] of Object.entries(data)) {
    if (["team_id", "owner_id"].includes(key)) { if (item !== null) key === "owner_id" ? userId(item) : serviceMacroId(item); }
    else if (key === "enabled") { if (typeof item !== "boolean") fail("enabled"); }
    else if (key === "variables_schema") uniqueList(item, (token) => member(token, variables), variables.length);
    else if (key === "actions") actionPlan(item);
    else if (key === "visibility") member(item, ["personal", "shared"]);
    else if (key === "usage_metric") member(item, ["application", "render_confirmed"]);
    else if (key === "archived_at" && item === null) continue;
    else {
      text(item);
      if (input && key === "name" && (item.trim() === "" || Buffer.byteLength(item) > 255)) fail("name");
      if (input && key === "body_template" && (Buffer.byteLength(item) > 100000 || /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(item) || /<\/?[a-z!][^>]*>/i.test(item))) fail("body template");
    }
  }
}
/** Full JSON object scan rejects nested duplicate and escaped property names before JSON.parse loses them. */
function parseWire(wire: string): Record<string, unknown> {
  text(wire); if (wire === "" || Buffer.byteLength(wire) > 250000) fail("wire size");
  let result: unknown; try { result = JSON.parse(wire); } catch { fail("JSON"); }
  const frames: Array<{ object: boolean; keyNext: boolean; names: Set<string> }> = [];
  for (let index = 0; index < wire.length; index++) {
    const char = wire[index];
    if (char === '"') {
      const start = index;
      for (++index; index < wire.length; index++) { if (wire[index] === "\\") index++; else if (wire[index] === '"') break; }
      const frame = frames[frames.length - 1];
      if (frame?.object && frame.keyNext) {
        const name = JSON.parse(wire.slice(start, index + 1)) as string;
        if (frame.names.has(name)) fail("duplicate JSON member"); frame.names.add(name); frame.keyNext = false;
        if (frames.length === 1 && ["expected_version", "ticket_expected_version"].includes(name)) {
          const literal = wire.slice(wire.indexOf(":", index + 1) + 1).split(/[,}]/, 1)[0]!.trim();
          if (!/^-?(?:0|[1-9][0-9]*)$/.test(literal)) fail("integer wire token");
        }
      }
    } else if (char === "{" || char === "[") {
      frames.push({ object: char === "{", keyNext: char === "{", names: new Set() }); if (frames.length > 63) fail("JSON depth");
    } else if (char === "}" || char === "]") frames.pop();
    else if (char === ",") { const frame = frames[frames.length - 1]; if (frame?.object) frame.keyNext = true; }
  }
  if (typeof result !== "object" || result === null || Array.isArray(result)) fail("JSON object");
  return result as Record<string, unknown>;
}
export function serviceMacroIntentBody(intent: T.CrmServiceMacroIntent): Record<string, unknown> {
  const body = parseWire(intent.originalWire);
  object(body, ["expected_version", "confirmed"], intent.operation === "save" ? saveFields : intent.operation === "archive" ? []
    : ["ticket_id", "ticket_expected_version", "recipient_id", "locale", "mode", "selected_actions", "render_hash"]);
  integer(body.expected_version, intent.targetId === null ? 0 : 1, intent.operation === "apply" ? Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER - 1);
  if (body.confirmed !== true || (intent.targetId === null && (intent.operation !== "save" || body.expected_version !== 0))) fail("confirmation/CAS");
  if (intent.operation === "save") {
    const fields = Object.fromEntries(Object.entries(body).filter(([name]) => saveFields.includes(name))); macroFields(fields, true);
    if (intent.targetId === null ? saveFields.filter((key) => key !== "team_id").some((key) => !Object.hasOwn(fields, key)) : Object.keys(fields).length === 0) fail("save fields");
  } else if (intent.operation === "apply") {
    serviceMacroId(body.ticket_id); integer(body.ticket_expected_version); member(body.locale, ["es", "en", "ca"]); member(body.mode, ["application", "confirm_render"]);
    if (Object.hasOwn(body, "recipient_id") && body.recipient_id !== null) serviceMacroId(body.recipient_id);
    if (Object.hasOwn(body, "selected_actions")) selected(body.selected_actions);
    if (body.mode === "application" && Array.isArray(body.selected_actions) && body.selected_actions.length === 0) fail("selected actions");
    if (body.mode === "confirm_render" || Object.hasOwn(body, "render_hash")) { if (typeof body.render_hash !== "string" || !/^[a-f0-9]{64}$/.test(body.render_hash)) fail("render hash"); }
  }
  return body;
}
export function decodeCrmServiceMacroIntent(operation: "save", targetId: string | null, originalKey: string, originalWire: string): T.CrmServiceMacroSaveIntent;
export function decodeCrmServiceMacroIntent(operation: "archive", targetId: string, originalKey: string, originalWire: string): T.CrmServiceMacroArchiveIntent;
export function decodeCrmServiceMacroIntent(operation: "apply", targetId: string, originalKey: string, originalWire: string): T.CrmServiceMacroApplyIntent;
export function decodeCrmServiceMacroIntent(operation: T.CrmServiceMacroOperation, targetId: string | null, originalKey: string, originalWire: string): T.CrmServiceMacroIntent;
export function decodeCrmServiceMacroIntent(operation: T.CrmServiceMacroOperation, targetId: string | null, originalKey: string, originalWire: string): T.CrmServiceMacroIntent {
  member(operation, ["save", "archive", "apply"]); if (targetId !== null) serviceMacroId(targetId); else if (operation !== "save") fail("original target");
  if (typeof originalKey !== "string" || !/^[\x21-\x7e]{1,255}$/.test(originalKey)) fail("original key");
  const intent = { operation, targetId, originalKey, originalWire }; serviceMacroIntentBody(intent); return Object.freeze(intent);
}
export function validateCrmServiceMacroIntent(value: T.CrmServiceMacroIntent): T.CrmServiceMacroIntent {
  const data = object(value, ["operation", "targetId", "originalKey", "originalWire"]);
  return decodeCrmServiceMacroIntent(data.operation as T.CrmServiceMacroOperation, data.targetId as string | null, data.originalKey as string, data.originalWire as string);
}
export function serviceMacroPageQuery(value: T.CrmServiceMacroPageParameters): Record<string, number> {
  const data = object(value, [], ["page", "per_page"]);
  for (const key of Object.keys(data)) integer(data[key], 1, key === "page" ? 1000000 : 100);
  return { ...data } as Record<string, number>;
}
export function serviceMacroRenderBody(value: T.CrmServiceMacroRenderBody): T.CrmServiceMacroRenderBody {
  const body = object(value, ["macro_version", "ticket_id", "ticket_version", "locale"], ["recipient_id", "selected_actions"]);
  integer(body.macro_version); serviceMacroId(body.ticket_id); integer(body.ticket_version); member(body.locale, ["es", "en", "ca"]);
  if (Object.hasOwn(body, "recipient_id") && body.recipient_id !== null) serviceMacroId(body.recipient_id);
  if (Object.hasOwn(body, "selected_actions")) selected(body.selected_actions);
  return JSON.parse(JSON.stringify(body)) as T.CrmServiceMacroRenderBody;
}
function view(value: unknown): void { const row = object(value, ["id", "version", "fields"]); serviceMacroId(row.id); integer(row.version); macroFields(row.fields); }
function receiptExtras(value: Record<string, unknown>): void {
  for (const [key, item] of Object.entries(value)) {
    if (key === "actor_id") userId(item);
    else if (key === "operation") member(item, ["customer_service.save_macro", "customer_service.archive_macro", "customer_service.apply_macro"]);
    else if (key === "ticket_id" && item !== null) serviceMacroId(item);
    else if (key === "macro_version" || (key === "ticket_version" && item !== null)) integer(item);
    else if (key === "counted") { if (typeof item !== "boolean") fail("counted"); }
    else if (["metric", "confirmed_at"].includes(key)) text(item);
    else if (key === "selected_actions") actionPlan(item);
    else if (key === "macro_snapshot") { const row = object(item, ["id", "version"], viewFields); serviceMacroId(row.id); integer(row.version); macroFields(Object.fromEntries(Object.entries(row).filter(([key]) => !["id", "version"].includes(key)))); }
  }
}
function page(data: Record<string, unknown>, list: string, count: string): unknown[] {
  integer(data.page, 1, 1000000); integer(data.per_page, 1, 100); integer(data[count], 0);
  const items = data[list]; if (!Array.isArray(items) || items.length > data.per_page || items.length > (data[count] as number)) fail("page projection"); return items;
}
export function decodeCrmServiceMacroList(value: unknown): T.CrmServiceMacroEnvelope<T.CrmServiceMacroList> {
  const data = object(object(value, ["data"]).data, ["items", "total", "page", "per_page"]);
  const items = page(data, "items", "total"); const seen = new Set<string>();
  for (const item of items) { view(item); const id = (item as T.CrmServiceMacroView).id.toLowerCase(); if (seen.has(id)) fail("duplicate macro"); seen.add(id); }
  return value as T.CrmServiceMacroEnvelope<T.CrmServiceMacroList>;
}
export function decodeCrmServiceMacroUsage(value: unknown): T.CrmServiceMacroEnvelope<T.CrmServiceMacroUsage> {
  const data = object(object(value, ["data"]).data, ["macro_id", "count", "receipts", "page", "per_page"]); serviceMacroId(data.macro_id);
  for (const item of page(data, "receipts", "count")) receiptExtras(object(item, [], [...receiptFields, "macro_version", "macro_snapshot"]));
  return value as T.CrmServiceMacroEnvelope<T.CrmServiceMacroUsage>;
}
export function decodeCrmServiceMacroOriginal(value: unknown): T.CrmServiceMacroEnvelope<T.CrmServiceMacroOriginal> {
  const data = object(object(value, ["data"]).data, ["macro_id", "count", "receipts", "page", "per_page"]); serviceMacroId(data.macro_id);
  const items = page(data, "receipts", "count"); if (data.count !== 1 || data.page !== 1 || data.per_page !== 1 || items.length !== 1) fail("original confirmation");
  const row = object(items[0], ["id", "version", "fields"], receiptFields); view({ id: row.id, version: row.version, fields: row.fields }); receiptExtras(row);
  if ((row.id as string).toLowerCase() !== (data.macro_id as string).toLowerCase()) fail("original macro identity");
  return value as T.CrmServiceMacroEnvelope<T.CrmServiceMacroOriginal>;
}
export function decodeCrmServiceMacroRender(value: unknown): T.CrmServiceMacroEnvelope<T.CrmServiceMacroRender> {
  const data = object(object(value, ["data"]).data, ["macro_id", "macro_version", "ticket_id", "ticket_version", "recipient_id", "locale", "draft", "warnings", "actions", "render_hash", "requires_review"]);
  serviceMacroId(data.macro_id); serviceMacroId(data.ticket_id); integer(data.macro_version); integer(data.ticket_version);
  if (data.recipient_id !== null) serviceMacroId(data.recipient_id); member(data.locale, ["es", "en", "ca"]); text(data.draft); actionPlan(data.actions);
  if (!Array.isArray(data.warnings)) fail("warnings"); for (const warning of data.warnings) { const row = object(warning, ["token", "reason"]); text(row.token); text(row.reason); }
  if (typeof data.render_hash !== "string" || !/^[a-f0-9]{64}$/.test(data.render_hash) || typeof data.requires_review !== "boolean") fail("render projection");
  return value as T.CrmServiceMacroEnvelope<T.CrmServiceMacroRender>;
}
export function serviceMacroPath(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value === "/" || /[?#\s\\%]/.test(value) || value.includes("..") || value.includes("://")) fail("required relative V1 route"); return value;
}
export function validateCrmServiceMacrosPaths(value: T.CrmServiceMacrosV1Paths): void {
  const data = object(value, ["listServiceMacros", "createServiceMacro", "updateServiceMacro", "archiveServiceMacro", "applyServiceMacro", "renderServiceMacro", "getServiceMacroUsage", "getSaveServiceMacroOriginal", "getArchiveServiceMacroOriginal", "getApplyServiceMacroOriginal"]);
  for (const [key, path] of Object.entries(data)) { if (["updateServiceMacro", "archiveServiceMacro", "applyServiceMacro", "renderServiceMacro", "getServiceMacroUsage"].includes(key)) { if (typeof path !== "function") fail("required route function"); } else serviceMacroPath(path); }
}
