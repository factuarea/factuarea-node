import type * as T from "./types.js";

const targets: T.CrmConversationTargetType[] = ["contact", "person", "lead", "opportunity", "quote", "invoice", "proposal", "activity"];
const businessUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const userUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function fail(field: string): never { throw new TypeError(`Factuarea: incompatible native Conversation ${field}.`); }
function object(value: unknown, required: string[], optional: string[] = []): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value) || required.some((key) => !Object.hasOwn(value, key))
    || Object.keys(value).some((key) => !required.includes(key) && !optional.includes(key))) fail("closed fields");
  return value as Record<string, unknown>;
}
function integer(value: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): asserts value is number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < min || value > max) fail("integer");
}
function text(value: unknown, max = Infinity, empty = true): asserts value is string {
  if (typeof value !== "string" || /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(value)
    || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u.test(value) || [...value].length > max || (!empty && value.trim() === "")) fail("text");
}
function member(value: unknown, values: readonly string[]): void { if (typeof value !== "string" || !values.includes(value)) fail("enum"); }
export function conversationId(value: unknown, user = false): asserts value is string {
  if (typeof value !== "string" || !(user ? userUuid : businessUuid).test(value)) fail("public id");
}
function nullable(value: unknown, validate: (value: unknown) => void): void { if (value !== null) validate(value); }
function instant(value: unknown): void {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value)) fail("UTC instant");
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()) || date.toISOString() !== value.slice(0, -1) + ".000Z") fail("UTC instant");
}
function cursor(value: unknown): void { nullable(value, (value) => text(value, 8192, false)); }
function fields(value: unknown): string[] {
  if (!Array.isArray(value) || value.some((field) => typeof field !== "string" || !/^[a-z][a-z0-9_]*$/.test(field))
    || new Set(value).size !== value.length) fail("field names");
  return value as string[];
}
function meta(value: unknown): T.CrmConversationReadMeta {
  const data = object(value, ["authorization_version", "readable_fields", "filterable_fields", "sortable_fields"]);
  text(data.authorization_version, Infinity, false);
  const readable = fields(data.readable_fields);
  for (const field of [...fields(data.filterable_fields), ...fields(data.sortable_fields)]) if (!readable.includes(field)) fail("field eligibility");
  for (const required of ["mailbox_uuid", "status"]) if (!readable.includes(required)) fail("required field admission");
  return value as T.CrmConversationReadMeta;
}
function mask(data: Record<string, unknown>, access: T.CrmConversationReadMeta, aliases: Record<string, string>): void {
  for (const [wire, owner] of Object.entries(aliases)) if (!access.readable_fields.includes(owner) && data[wire] !== null) fail("private field mask");
}
function head(value: unknown, access: T.CrmConversationReadMeta): void {
  const data = object(value, ["id", "version", "mailbox_id", "subject", "status", "owner_id", "team_id", "last_message_at", "links"]);
  conversationId(data.id); integer(data.version, 1); conversationId(data.mailbox_id);
  nullable(data.subject, (v) => text(v, 998)); member(data.status, ["active", "archived"]);
  nullable(data.owner_id, (v) => conversationId(v, true)); nullable(data.team_id, conversationId); nullable(data.last_message_at, instant);
  mask(data, access, { subject: "subject", owner_id: "owner_uuid", team_id: "team_uuid", last_message_at: "last_message_at" });
  if (!Array.isArray(data.links) || data.links.length > 100 || (!access.readable_fields.includes("links") && data.links.length > 0)) fail("link mask");
  const seen = new Set<string>();
  for (const value of data.links) {
    const link = object(value, ["type", "id", "state"]); member(link.type, targets); conversationId(link.id); member(link.state, ["automatic_suggestion", "confirmed"]);
    const key = `${String(link.type)}:${link.id.toLowerCase()}`;
    if (seen.has(key)) fail("duplicate link"); seen.add(key);
  }
}
function participant(value: unknown, recipient = false): void {
  const data = object(value, ["email", "name", ...(recipient ? ["kind"] : [])]); text(data.email, 254, false);
  if (!/^[^\s@]+@[^\s@]+$/.test(data.email)) fail("participant email");
  nullable(data.name, (v) => text(v, 255)); if (recipient) member(data.kind, ["to", "cc", "bcc"]);
}
function message(value: unknown, access: T.CrmConversationReadMeta, conversation: string): string {
  const data = object(value, ["id", "conversation_id", "version", "direction", "sender", "recipients", "subject", "body", "body_format", "composition_state", "delivery_status", "submitted_at"]);
  conversationId(data.id); conversationId(data.conversation_id); integer(data.version, 1);
  if (data.conversation_id.toLowerCase() !== conversation.toLowerCase()) fail("message correspondence");
  member(data.direction, ["inbound", "outbound"]); member(data.composition_state, ["draft", "send_intent", "received"]);
  if ((data.direction === "inbound") !== (data.composition_state === "received") || data.body_format !== "plain_text") fail("message origin");
  nullable(data.sender, participant);
  if (data.recipients !== null) {
    if (!Array.isArray(data.recipients) || data.recipients.length === 0 || data.recipients.length > 100) fail("recipients");
    const seen = new Set<string>(); let to = false;
    for (const value of data.recipients) {
      participant(value, true); const recipient = value as T.CrmConversationRecipient; const email = recipient.email.toLowerCase();
      if (seen.has(email)) fail("duplicate recipient"); seen.add(email); to ||= recipient.kind === "to";
    }
    if (!to) fail("to recipient");
  }
  nullable(data.subject, (v) => text(v, 998)); nullable(data.body, (v) => text(v, 1048576));
  nullable(data.delivery_status, (v) => member(v, ["pending", "confirmed", "unconfirmed", "failed"])); nullable(data.submitted_at, instant);
  if ((data.composition_state !== "send_intent" && (data.delivery_status !== null || data.submitted_at !== null))
    || (data.delivery_status === "confirmed" && data.submitted_at === null)
    || ([null, "pending", "failed"].includes(data.delivery_status as null | string) && data.submitted_at !== null)) fail("original delivery receipt");
  mask(data, access, { sender: "sender", recipients: "recipients", subject: "subject", body: "body", delivery_status: "delivery_status", submitted_at: "delivery_status" });
  return data.id.toLowerCase();
}
function attachment(value: unknown, conversation: string, messages: Set<string>): string {
  const data = object(value, ["id", "conversation_id", "message_id", "version", "filename", "mime", "size", "status"]);
  conversationId(data.id); conversationId(data.conversation_id); conversationId(data.message_id); integer(data.version, 1); integer(data.size, 1);
  if (data.conversation_id.toLowerCase() !== conversation.toLowerCase() || !messages.has(data.message_id.toLowerCase())) fail("attachment correspondence");
  text(data.filename, 255, false); text(data.mime);
  if (/[\/\\]/.test(data.filename) || !/^[a-z0-9.+-]+\/[a-z0-9.+-]+$/.test(data.mime)) fail("attachment metadata");
  member(data.status, ["quarantine", "ready", "rejected"]); return data.id.toLowerCase();
}
function filters(value: unknown): Record<string, unknown> {
  const data = object(value, [], ["mailbox_uuid", "state", "search", "target_type", "target_uuid", "sort"]);
  for (const [key, value] of Object.entries(data)) {
    if (key === "mailbox_uuid" || key === "target_uuid") conversationId(value);
    else if (key === "search") text(value, 255, false);
    else if (key === "state") member(value, ["active", "archived"]);
    else if (key === "target_type") member(value, targets);
    else member(value, ["last_message_at:asc", "last_message_at:desc", "subject:asc", "subject:desc"]);
  }
  if (Object.hasOwn(data, "target_type") !== Object.hasOwn(data, "target_uuid")) fail("target pair");
  return data;
}
/** Typed construction uses the native names; an existing literal is never parsed and re-encoded for transport. */
export function encodeCrmConversationFilters(value: T.CrmConversationFilters): string { return JSON.stringify(filters(value)); }
export function conversationQuery(value: T.CrmConversationListParameters | T.CrmConversationPageParameters, list: boolean): Record<string, unknown> {
  const data = object(value, [], ["cursor", "limit", ...(list ? ["filters"] : [])]);
  if (Object.hasOwn(data, "cursor")) cursor(data.cursor);
  if (Object.hasOwn(data, "limit")) integer(data.limit, 1, 100);
  if (Object.hasOwn(data, "filters")) {
    if (typeof data.filters !== "string" || new TextEncoder().encode(data.filters).length > 1048576) fail("literal filters JSON");
    let parsed: unknown;
    try { parsed = JSON.parse(data.filters); } catch { fail("literal filters JSON"); }
    filters(parsed);
  }
  return { ...data };
}
export function conversationPaths(value: T.CrmConversationV1Paths): T.CrmConversationV1Paths {
  const data = object(value, ["listConversations", "getConversation"]);
  if (data.listConversations !== "/crm/conversation" || data.getConversation !== "/crm/conversation/{conversation}") fail("native V1 routes");
  return { ...value };
}
export function decodeCrmConversationInbox(value: unknown): T.CrmConversationEnvelope<T.CrmConversationInboxData> {
  const envelope = object(value, ["data", "meta"]); const access = meta(envelope.meta);
  const data = object(envelope.data, ["items", "next_cursor", "total", "active_count", "archived_count", "limit"]);
  cursor(data.next_cursor); integer(data.limit, 1, 100); integer(data.total); integer(data.active_count); integer(data.archived_count);
  if (!Array.isArray(data.items) || data.items.length > data.limit || data.items.length > data.total
    || data.active_count > data.total || data.archived_count !== data.total - data.active_count
    || (data.next_cursor !== null && (data.items.length === 0 || data.total <= data.items.length))) fail("inbox counts");
  const seen = new Set<string>();
  for (const value of data.items) { head(value, access); const id = (value as T.CrmConversationHead).id.toLowerCase(); if (seen.has(id)) fail("duplicate conversation"); seen.add(id); }
  return value as T.CrmConversationEnvelope<T.CrmConversationInboxData>;
}
export function decodeCrmConversationThread(value: unknown): T.CrmConversationEnvelope<T.CrmConversationThreadData> {
  const envelope = object(value, ["data", "meta"]); const access = meta(envelope.meta);
  const data = object(envelope.data, ["conversation", "messages", "attachments", "next_cursor", "limit"]);
  head(data.conversation, access); const conversation = (data.conversation as T.CrmConversationHead).id;
  cursor(data.next_cursor); integer(data.limit, 1, 100);
  if (!Array.isArray(data.messages) || !Array.isArray(data.attachments) || data.messages.length > data.limit
    || (data.next_cursor !== null && data.messages.length === 0)) fail("thread page");
  if (!access.readable_fields.includes("messages") && (data.messages.length > 0 || data.attachments.length > 0 || data.next_cursor !== null)) fail("message mask");
  if (!access.readable_fields.includes("attachments") && data.attachments.length > 0) fail("attachment mask");
  const messages = new Set<string>(); const attachments = new Set<string>();
  for (const value of data.messages) { const id = message(value, access, conversation); if (messages.has(id)) fail("duplicate message"); messages.add(id); }
  for (const value of data.attachments) { const id = attachment(value, conversation, messages); if (attachments.has(id)) fail("duplicate attachment"); attachments.add(id); }
  return value as T.CrmConversationEnvelope<T.CrmConversationThreadData>;
}
