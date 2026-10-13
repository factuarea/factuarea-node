import type * as T from "./types.js";

const fields = ["expected_version", "provider", "connection_id", "kind", "team_id", "allowed_user_ids"];
const businessUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const userUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const unpairedSurrogate = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u;
function fail(field: string): never { throw new TypeError(`Factuarea: incompatible Mailbox writer ${field}.`); }
function object(value: unknown, keys: string[]): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value) || Object.keys(value).length !== keys.length
    || keys.some((key) => !Object.hasOwn(value, key)) || Object.keys(value).some((key) => !keys.includes(key))) fail("closed fields");
  return value as Record<string, unknown>;
}
export function mailboxWriterId(value: unknown, user = false): asserts value is string {
  if (typeof value !== "string" || !(user ? userUuid : businessUuid).test(value)) fail("id");
}
function integer(value: unknown, min: number, max = Number.MAX_SAFE_INTEGER): asserts value is number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < min || value > max) fail("exact integer");
}
export function mailboxWriterKey(value: unknown): asserts value is string {
  if (typeof value !== "string" || value === "" || Buffer.byteLength(value, "utf8") > 512 || /[\x00-\x20\x7f]/.test(value)
    || unpairedSurrogate.test(value)) fail("original key");
  // Fetch header representation must preserve native opaque bytes exactly; no trimming/encoding fallback.
  try { if (new Headers({ "Idempotency-Key": value }).get("Idempotency-Key") !== value) fail("key header representation"); }
  catch { fail("key header representation"); }
}
/** Valid JSON is scanned at the root so duplicate escaped members and PHP-float CAS cannot collapse in JS. */
function rootMembers(wire: string): void {
  let depth = 0; let expectingKey = false; const keys = new Set<string>();
  for (let index = 0; index < wire.length; index++) {
    const char = wire[index];
    if (char === "{" || char === "[") { depth++; if (depth === 1) expectingKey = true; }
    else if (char === "}" || char === "]") depth--;
    else if (char === "," && depth === 1) expectingKey = true;
    else if (char === '"') {
      const start = index;
      for (++index; index < wire.length; index++) {
        if (wire[index] === "\\") index++;
        else if (wire[index] === '"') break;
      }
      if (depth === 1 && expectingKey) {
        const key: unknown = JSON.parse(wire.slice(start, index + 1));
        if (typeof key !== "string" || keys.has(key)) fail("duplicate JSON member");
        keys.add(key); expectingKey = false;
        if (key === "expected_version") {
          const colon = wire.indexOf(":", index + 1);
          const token = wire.slice(colon + 1).split(/[,}]/, 1)[0]!.trim();
          if (!/^-?(?:0|[1-9][0-9]*)$/.test(token)) fail("native integer CAS token");
        }
      }
    }
  }
}
export function decodeCrmMailboxWriteIntent(targetId: null, originalKey: string, originalWire: string): T.CrmMailboxCreateIntent;
export function decodeCrmMailboxWriteIntent(targetId: string, originalKey: string, originalWire: string): T.CrmMailboxUpdateIntent;
export function decodeCrmMailboxWriteIntent(targetId: string | null, originalKey: string, originalWire: string): T.CrmMailboxWriteIntent;
export function decodeCrmMailboxWriteIntent(targetId: string | null, originalKey: string, originalWire: string): T.CrmMailboxWriteIntent {
  if (targetId !== null) mailboxWriterId(targetId);
  mailboxWriterKey(originalKey);
  if (typeof originalWire !== "string" || originalWire === "" || Buffer.byteLength(originalWire, "utf8") > 65536
    || unpairedSurrogate.test(originalWire)) fail("original wire");
  let parsed: unknown;
  try { parsed = JSON.parse(originalWire); } catch { fail("JSON"); }
  const body = object(parsed, fields); rootMembers(originalWire);
  integer(body.expected_version, targetId === null ? 0 : 1, Number.MAX_SAFE_INTEGER - 1);
  if (targetId === null && body.expected_version !== 0) fail("create CAS");
  if (body.provider !== "gmail" && body.provider !== "microsoft_graph") fail("provider");
  if (body.kind !== "personal" && body.kind !== "shared") fail("kind");
  if (body.connection_id !== null) mailboxWriterId(body.connection_id);
  if (targetId !== null && body.connection_id === null) fail("update connection");
  if (body.team_id !== null) mailboxWriterId(body.team_id);
  if (body.kind === "personal" && body.team_id !== null) fail("personal team");
  if (!Array.isArray(body.allowed_user_ids) || body.allowed_user_ids.length > 1000) fail("allowed users");
  const users = new Set<string>();
  for (const user of body.allowed_user_ids) {
    mailboxWriterId(user, true);
    if (users.has(user.toLowerCase())) fail("duplicate allowed user");
    users.add(user.toLowerCase());
  }
  return Object.freeze({ targetId, originalKey, originalWire });
}
export function validateCrmMailboxWriteIntent(value: T.CrmMailboxWriteIntent): T.CrmMailboxWriteIntent {
  const data = object(value, ["targetId", "originalKey", "originalWire"]);
  return decodeCrmMailboxWriteIntent(data.targetId as string | null, data.originalKey as string, data.originalWire as string);
}
export function decodeCrmMailboxWriteReceipt(value: unknown): T.CrmMailboxWriteEnvelope {
  const envelope = object(value, ["data"]);
  const data = object(envelope.data, ["id", "effect_id", "connection_id", "version", "availability", "confirmed_at", "provider"]);
  for (const field of ["id", "effect_id", "connection_id"]) mailboxWriterId(data[field]);
  integer(data.version, 1);
  if (data.availability !== "disconnected" && data.availability !== "active") fail("recorded availability");
  if (data.provider !== "gmail" && data.provider !== "microsoft_graph") fail("receipt provider");
  if (typeof data.confirmed_at !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(data.confirmed_at)) fail("receipt timestamp");
  return value as T.CrmMailboxWriteEnvelope;
}
export function assertCrmMailboxOriginalReceipt(receipt: T.CrmMailboxWriteReceipt, intent: T.CrmMailboxWriteIntent): void {
  const body = JSON.parse(intent.originalWire) as T.CrmMailboxConfigurationBody;
  if ((intent.targetId !== null && receipt.id !== intent.targetId) || receipt.provider !== body.provider
    || (body.connection_id !== null && receipt.connection_id !== body.connection_id) || receipt.version !== body.expected_version + 1) fail("original receipt fence");
}
export function mailboxWriterPath(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/crm/conversation/") || /[?#\s\\%]/.test(value)
    || value.includes("..") || value.includes("://")) fail("required V1 path");
  return value;
}
export function validateCrmMailboxWriterPaths(value: T.CrmMailboxWriterV1Paths): void {
  const paths = object(value, ["createMailboxConfiguration", "updateMailboxConfiguration", "getMailboxWriteOriginal"]);
  mailboxWriterPath(paths.createMailboxConfiguration);
  for (const name of ["updateMailboxConfiguration", "getMailboxWriteOriginal"]) if (typeof paths[name] !== "function") fail("required route function");
}
