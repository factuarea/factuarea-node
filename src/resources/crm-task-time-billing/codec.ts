import type * as T from "./types.js";
const v7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const historical = /^[0-9a-f]{8}-[0-9a-f]{4}-[47][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const baseKeys = ["ticket_id", "ticket_version", "authorization_version"];
const casKeys = ["task_id", "expected_ticket_version", "expected_task_version"];
function fail(field: string): never { throw new TypeError(`Factuarea: incompatible TaskTime ${field}.`); }
function object(value: unknown, required: string[], optional: string[] = []): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)
    || required.some((key) => !Object.hasOwn(value, key)) || Object.keys(value).some((key) => !required.includes(key) && !optional.includes(key))) fail("closed fields");
  return value as Record<string, unknown>;
}
export function taskTimeId(value: unknown, old = false): asserts value is string { if (typeof value !== "string" || !(old ? historical : v7).test(value)) fail("id"); }
function integer(value: unknown, minimum = 1, maximum = Number.MAX_SAFE_INTEGER): asserts value is number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < minimum || value > maximum) fail("exact integer");
}
function text(value: unknown): asserts value is string { if (typeof value !== "string") fail("string"); }
function nullableText(value: unknown): void { if (value !== null) text(value); }
function member(value: unknown, choices: string[]): void { if (typeof value !== "string" || !choices.includes(value)) fail("enum"); }
export function taskTimeKey(value: unknown): asserts value is string {
  if (typeof value !== "string" || !/^[\x20-\x7e]{1,255}$/.test(value) || value.trim() === "") fail("original Idempotency-Key");
  // Fetch and the public idempotency owner normalize edge whitespace. Never silently change an original key.
  if (new Headers({ "Idempotency-Key": value }).get("Idempotency-Key") !== value) fail("exact key header representation");
}
function cas(data: Record<string, unknown>): void { taskTimeId(data.task_id); integer(data.expected_ticket_version); integer(data.expected_task_version); }
function writeBody(value: unknown, action: T.CrmTaskTimeAction): void {
  const data = object(value, [...casKeys, "confirmed", ...(action === "unlink" ? ["binding_id", "expected_binding_version"] : [])], action === "link" ? ["binding_id", "expected_binding_version"] : []);
  cas(data); if (data.confirmed !== true) fail("confirmed");
  const binding = data.binding_id ?? null; const version = data.expected_binding_version ?? null;
  if ((binding === null) !== (version === null) || (action === "unlink" && binding === null)) fail("binding CAS");
  if (binding !== null) { taskTimeId(binding); integer(version); }
}
function uniqueKeys(wire: string): void {
  const stack: Array<Set<string> | null> = [];
  for (let index = 0; index < wire.length; index++) {
    const token = wire[index];
    if (token === "{" || token === "[") { stack.push(token === "{" ? new Set() : null); if (stack.length > 31) fail("JSON depth"); }
    else if (token === "}" || token === "]") stack.pop();
    else if (token === '"') {
      const start = index;
      for (index++; index < wire.length; index++) { if (wire[index] === "\\") index++; else if (wire[index] === '"') break; }
      let next = index + 1; while (/\s/.test(wire[next] ?? "")) next++;
      const keys = stack[stack.length - 1];
      if (wire[next] === ":" && keys) {
        const key: unknown = JSON.parse(wire.slice(start, index + 1));
        if (typeof key !== "string" || keys.has(key)) fail("duplicate JSON member");
        keys.add(key);
      }
    }
  }
}
export function decodeCrmTaskTimeIntent(action: "link", ticketId: string, originalKey: string, originalWire: string): T.CrmTaskTimeLinkIntent;
export function decodeCrmTaskTimeIntent(action: "unlink", ticketId: string, originalKey: string, originalWire: string): T.CrmTaskTimeUnlinkIntent;
export function decodeCrmTaskTimeIntent(action: T.CrmTaskTimeAction, ticketId: string, originalKey: string, originalWire: string): T.CrmTaskTimeIntent;
export function decodeCrmTaskTimeIntent(action: T.CrmTaskTimeAction, ticketId: string, originalKey: string, originalWire: string): T.CrmTaskTimeIntent {
  member(action, ["link", "unlink"]); taskTimeId(ticketId); taskTimeKey(originalKey);
  if (typeof originalWire !== "string" || originalWire === "" || Buffer.byteLength(originalWire, "utf8") > 262144) fail("original wire");
  let value: unknown; try { value = JSON.parse(originalWire); } catch { fail("JSON"); }
  uniqueKeys(originalWire); writeBody(value, action);
  return Object.freeze({ action, ticketId, originalKey, originalWire });
}
export function validateTaskTimeIntent(value: T.CrmTaskTimeIntent, action: T.CrmTaskTimeAction): T.CrmTaskTimeIntent {
  const data = object(value, ["action", "ticketId", "originalKey", "originalWire"]);
  if (data.action !== action) fail("original action");
  return decodeCrmTaskTimeIntent(action, data.ticketId as string, data.originalKey as string, data.originalWire as string);
}
export function taskTimePreviewBody(value: T.CrmTaskTimePreviewBody): Record<string, unknown> {
  const data = object(value, [...casKeys, "entries", "grouping"]); cas(data); member(data.grouping, ["per_task", "per_entry", "single_line"]);
  if (!Array.isArray(data.entries) || data.entries.length < 1 || data.entries.length > 500) fail("entries");
  const seen = new Set<string>();
  for (const item of data.entries) {
    const entry = object(item, ["id", "revision"]); taskTimeId(entry.id);
    if (seen.has(entry.id) || typeof entry.revision !== "string" || !/^[a-f0-9]{64}$/.test(entry.revision)) fail("entry selection");
    seen.add(entry.id);
  }
  return data;
}
export function taskTimeRecoveryBody(value: T.CrmTaskTimeLinkRecoveryBody | T.CrmTaskTimeUnlinkRecoveryBody, action: T.CrmTaskTimeAction): Record<string, unknown> {
  const data = object(value, [...casKeys, "binding_id", "effect_id", "action", ...(action === "unlink" ? ["expected_binding_version"] : [])], action === "link" ? ["expected_binding_version"] : []);
  cas(data); taskTimeId(data.binding_id); taskTimeId(data.effect_id);
  if (data.action !== action) fail("recovery action");
  if (Object.hasOwn(data, "expected_binding_version")) integer(data.expected_binding_version);
  return data;
}
export function taskTimeListQuery(value: T.CrmTaskTimeListParameters): Record<string, unknown> {
  const data = object(value, [], ["cursor", "limit"]);
  if (data.limit !== undefined) integer(data.limit, 1, 100);
  if (data.cursor !== undefined && data.cursor !== null && (typeof data.cursor !== "string" || !/^[a-f0-9]{64}:[a-f0-9-]{36}$/.test(data.cursor))) fail("cursor");
  return { ...data };
}
function base(data: Record<string, unknown>): void { taskTimeId(data.ticket_id); integer(data.ticket_version); text(data.authorization_version); }
function task(value: unknown): void {
  const data = object(value, ["id", "task_id"], ["version", "archived_at", "task_title", "task_version"]); taskTimeId(data.id); taskTimeId(data.task_id);
  if (Object.hasOwn(data, "version")) integer(data.version);
  if (Object.hasOwn(data, "task_version")) integer(data.task_version);
  if (Object.hasOwn(data, "task_title")) text(data.task_title);
  if (Object.hasOwn(data, "archived_at")) nullableText(data.archived_at);
}
function entry(value: unknown): void {
  const data = object(value, ["id", "task_id"], ["revision", "started_at", "ended_at", "duration_seconds", "description", "billable", "user_id", "invoice_id", "billing_batch_id"]);
  taskTimeId(data.id); taskTimeId(data.task_id);
  for (const [key, field] of Object.entries(data)) {
    if (["revision", "started_at"].includes(key)) text(field);
    else if (["ended_at", "description"].includes(key)) nullableText(field);
    else if (key === "duration_seconds" && field !== null) integer(field, Number.MIN_SAFE_INTEGER);
    else if (key === "billable" && typeof field !== "boolean") fail("billable");
    else if (key === "user_id" || ((key === "invoice_id" || key === "billing_batch_id") && field !== null)) taskTimeId(field, true);
  }
}
export function decodeCrmTaskTimeTasks(value: unknown): T.CrmTaskTimeEnvelope<T.CrmTaskTimeTasks> {
  const envelope = object(value, ["data"]); const data = object(envelope.data, [...baseKeys, "revision", "tasks"]); base(data); text(data.revision);
  if (!Array.isArray(data.tasks)) fail("tasks"); data.tasks.forEach(task);
  return value as T.CrmTaskTimeEnvelope<T.CrmTaskTimeTasks>;
}
export function decodeCrmTaskTimePage(value: unknown, kind: "timesheet"): T.CrmTaskTimeEnvelope<T.CrmTaskTimeTimesheet>;
export function decodeCrmTaskTimePage(value: unknown, kind: "billable"): T.CrmTaskTimeEnvelope<T.CrmTaskTimeBillable>;
export function decodeCrmTaskTimePage(value: unknown, kind: "timesheet" | "billable"): T.CrmTaskTimeEnvelope<T.CrmTaskTimeTimesheet | T.CrmTaskTimeBillable>;
export function decodeCrmTaskTimePage(value: unknown, kind: "timesheet" | "billable"): T.CrmTaskTimeEnvelope<T.CrmTaskTimeTimesheet | T.CrmTaskTimeBillable> {
  const envelope = object(value, ["data"]); const total = kind === "timesheet" ? "total_closed_seconds" : "total_billable_closed_seconds";
  const data = object(envelope.data, [...baseKeys, "revision", "entries", "next_cursor"], [total]); base(data); text(data.revision); nullableText(data.next_cursor);
  if (!Array.isArray(data.entries)) fail("entries"); data.entries.forEach(entry);
  if (Object.hasOwn(data, total)) integer(data[total], Number.MIN_SAFE_INTEGER);
  return value as T.CrmTaskTimeEnvelope<T.CrmTaskTimeTimesheet | T.CrmTaskTimeBillable>;
}
export function decodeCrmTaskTimePreview(value: unknown): T.CrmTaskTimeEnvelope<T.CrmTaskTimePreview> {
  const envelope = object(value, ["data"]); const data = object(envelope.data, [...baseKeys, "preview"]); base(data);
  const preview = object(data.preview, ["contact", "lines", "total_seconds", "total_hours", "time_entry_ids", "warnings"], ["totals"]);
  const contact = object(preview.contact, ["id", "name"]); taskTimeId(contact.id, true); text(contact.name);
  if (!Array.isArray(preview.lines) || !Array.isArray(preview.time_entry_ids) || !Array.isArray(preview.warnings)) fail("preview lists");
  integer(preview.total_seconds, Number.MIN_SAFE_INTEGER); text(preview.total_hours);
  for (const line of preview.lines) {
    const data = object(line, ["description", "quantity", "unit", "unit_price", "amount"]);
    Object.values(data).forEach(text);
  }
  preview.time_entry_ids.forEach((id) => taskTimeId(id)); preview.warnings.forEach(text);
  if (Object.hasOwn(preview, "totals") && preview.totals !== null) {
    const totals = object(preview.totals, ["subtotal", "vat", "surcharge", "retention", "total", "vat_rate", "surcharge_rate", "retention_rate"]);
    for (const [key, value] of Object.entries(totals)) {
      if (key.endsWith("_rate")) { if (value !== null && (typeof value !== "number" || !Number.isFinite(value))) fail("tax rate"); }
      else text(value);
    }
  }
  return value as T.CrmTaskTimeEnvelope<T.CrmTaskTimePreview>;
}
export function decodeCrmTaskTimeReceipt(value: unknown, action: T.CrmTaskTimeAction): T.CrmTaskTimeEnvelope<T.CrmTaskTimeReceipt> {
  const envelope = object(value, ["data"]); const data = object(envelope.data, [...baseKeys, "status", "effect_id", "operation", "confirmed_at", "result"]); base(data);
  if (data.status !== "confirmed" || data.operation !== "customer_service.task_time_" + action) fail("original receipt operation");
  taskTimeId(data.effect_id); nullableText(data.confirmed_at);
  const result = object(data.result, ["binding"], ["task_version"]); const binding = object(result.binding, ["id", "task_id", "version"], ["archived_at"]);
  taskTimeId(binding.id); taskTimeId(binding.task_id); integer(binding.version);
  if (Object.hasOwn(binding, "archived_at")) nullableText(binding.archived_at);
  if (Object.hasOwn(result, "task_version")) integer(result.task_version);
  return value as T.CrmTaskTimeEnvelope<T.CrmTaskTimeReceipt>;
}
export function taskTimePath(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/crm/service-tickets/") || /[?#\s\\]/.test(value) || value.includes("..") || value.includes("://")) fail("required V1 path");
  return value;
}
export function validateTaskTimePaths(value: T.CrmTaskTimeBillingV1Paths): void {
  const keys = ["linkServiceTicketTask", "unlinkServiceTicketTask", "listServiceTicketTasks", "getServiceBillableTime", "getServiceTimesheet", "previewServiceTimeInvoice", "getOriginalServiceTicketTaskLinkReceipt", "getOriginalServiceTicketTaskUnlinkReceipt"];
  const data = object(value, keys); for (const key of keys) if (typeof data[key] !== "function") fail("required route function");
}
