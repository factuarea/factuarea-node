import type { CustomerServiceWriteOperation, ServiceTicket, ServiceTicketAttachment, ServiceTicketComment, ServiceTicketPage, ServiceTicketReceipt, ServiceTicketTimeline, ServiceTicketTimelineEntry } from "./types.js";
import * as w from "./wire.js";

export function envelope(value: unknown): unknown { return w.record(value, ["data"]).data; }
export function attachment(value: unknown): ServiceTicketAttachment {
  const v = w.record(value, ["id", "document_id", "document_version"], ["mime", "size_bytes", "created_by", "created_at"]);
  const result: ServiceTicketAttachment = { id: w.id(v.id), document_id: w.id(v.document_id), document_version: w.version(v.document_version) };
  if (w.has(v, "mime")) result.mime = w.mime(v.mime);
  if (w.has(v, "size_bytes")) result.size_bytes = w.integer(v.size_bytes, true);
  if (w.has(v, "created_by")) result.created_by = w.actor(v.created_by);
  if (w.has(v, "created_at")) result.created_at = w.timestamp(v.created_at);
  return result;
}
export function comment(value: unknown): ServiceTicketComment {
  const v = w.record(value, ["id", "visibility"], ["author_type", "author_id", "body", "body_format", "delivery_state", "conversation_message_id", "created_at", "edited_at"]);
  const result: ServiceTicketComment = { id: w.id(v.id), visibility: w.enumText(v.visibility) };
  for (const field of ["author_type", "body_format", "delivery_state"] as const) if (w.has(v, field)) result[field] = w.enumText(v[field]);
  if (w.has(v, "author_id")) result.author_id = w.actor(v.author_id);
  if (w.has(v, "body")) result.body = w.text(v.body, 20000);
  if (w.has(v, "conversation_message_id")) result.conversation_message_id = w.nullable(v.conversation_message_id, w.id);
  if (w.has(v, "created_at")) result.created_at = w.timestamp(v.created_at);
  if (w.has(v, "edited_at")) result.edited_at = w.nullable(v.edited_at, w.timestamp);
  return result;
}
export function ticket(value: unknown): ServiceTicket {
  const v = w.record(value, ["id", "version"], ["title", "description", "status", "priority", "type", "creator_id", "pipeline_id", "stage_id", "counterparty_id", "person_id", "assignee_id", "created_at", "updated_at", "first_response_at", "resolved_at", "closed_at", "archived_at", "cycle", "waiting_reason", "comments", "attachments", "writable_fields", "authorization_version"]);
  const result: ServiceTicket = { id: w.id(v.id), version: w.version(v.version) };
  if (w.has(v, "title")) result.title = w.text(v.title, 255);
  if (w.has(v, "description")) result.description = w.text(v.description, 20000, true);
  for (const field of ["status", "priority", "type"] as const) if (w.has(v, field)) result[field] = w.enumText(v[field]);
  for (const field of ["pipeline_id", "stage_id", "counterparty_id", "person_id"] as const) if (w.has(v, field)) result[field] = w.nullable(v[field], w.id);
  if (w.has(v, "creator_id")) result.creator_id = w.actor(v.creator_id);
  if (w.has(v, "assignee_id")) result.assignee_id = w.nullable(v.assignee_id, w.actor);
  for (const field of ["created_at", "updated_at"] as const) if (w.has(v, field)) result[field] = w.timestamp(v[field]);
  for (const field of ["first_response_at", "resolved_at", "closed_at", "archived_at"] as const) if (w.has(v, field)) result[field] = w.nullable(v[field], w.timestamp);
  if (w.has(v, "cycle")) result.cycle = w.integer(v.cycle);
  if (w.has(v, "waiting_reason")) result.waiting_reason = w.nullable(v.waiting_reason, w.enumText);
  if (w.has(v, "comments")) result.comments = w.items(v.comments).map(comment);
  if (w.has(v, "attachments")) result.attachments = w.items(v.attachments).map(attachment);
  if (w.has(v, "writable_fields") !== w.has(v, "authorization_version")) throw new TypeError("Factuarea: ticket writable fields require their native authorization version.");
  if (w.has(v, "writable_fields")) {
    result.writable_fields = w.items(v.writable_fields).map(w.enumText);
    if (new Set(result.writable_fields).size !== result.writable_fields.length) throw new TypeError("Factuarea: ticket writable fields must be unique.");
    result.authorization_version = w.text(v.authorization_version, 4096);
  }
  return result;
}
function counts(v: Record<string, unknown>, size: number): { total: number; page: number; per_page: number; } {
  const total = w.integer(v.total, true), pagination = w.page(v.page, v.per_page);
  if (size > pagination.per_page || size > total) throw new TypeError("Factuarea: ticket pagination must retain native counts.");
  return { total, ...pagination };
}
export function ticketPage(value: unknown): ServiceTicketPage {
  const v = w.record(value, ["items", "total", "page", "per_page"]), items = w.items(v.items).map(ticket);
  return { items, ...counts(v, items.length) };
}
export function timeline(value: unknown): ServiceTicketTimeline {
  const v = w.record(value, ["id", "items", "total", "page", "per_page"]), id = w.id(v.id);
  const items = w.items(v.items).map(value => {
    const entry = w.record(value, ["version"], ["action", "actor_id", "occurred_at", "snapshot"]);
    const result: ServiceTicketTimelineEntry = { version: w.version(entry.version) };
    if (w.has(entry, "action")) result.action = w.enumText(entry.action);
    if (w.has(entry, "actor_id")) result.actor_id = w.actor(entry.actor_id);
    if (w.has(entry, "occurred_at")) result.occurred_at = w.timestamp(entry.occurred_at);
    if (w.has(entry, "snapshot")) {
      result.snapshot = ticket(entry.snapshot);
      if (!w.sameId(result.snapshot.id, id) || result.snapshot.version !== result.version) throw new TypeError("Factuarea: timeline snapshot differs from its historical parent/version.");
    }
    return result;
  });
  return { id, items, ...counts(v, items.length) };
}
export function receipt(value: unknown): ServiceTicketReceipt {
  const v = w.record(value, ["id", "version"]);
  return { id: w.id(v.id), version: w.version(v.version) };
}
export function writeBody(operation: CustomerServiceWriteOperation, value: unknown): Record<string, unknown> {
  if (operation === "moveToStage") {
    const v = w.record(value, ["expected_version", "pipeline_id", "stage_id"], ["waiting_reason", "customer_message_id"]);
    const result: Record<string, unknown> = { expected_version: w.expectedVersion(v.expected_version), pipeline_id: w.id(v.pipeline_id).toLowerCase(), stage_id: w.id(v.stage_id).toLowerCase() };
    if (w.has(v, "waiting_reason")) result.waiting_reason = w.nullable(v.waiting_reason, value => w.oneOf(value, ["waiting_customer"] as const));
    if (w.has(v, "customer_message_id")) {
      result.customer_message_id = w.nullable(v.customer_message_id, value => w.id(value).toLowerCase());
      if (result.customer_message_id !== null && result.waiting_reason !== null) throw new TypeError("Factuarea: the original customer message only confirms an explicit waiting release.");
    }
    return result;
  }
  if (operation === "attachDocument") {
    const v = w.record(value, ["expected_version", "document_id", "document_version"]);
    return { expected_version: w.expectedVersion(v.expected_version), document_id: w.id(v.document_id).toLowerCase(), document_version: w.version(v.document_version) };
  }
  if (operation === "detachDocument") {
    const v = w.record(value, ["expected_version", "attachment_id"]);
    return { expected_version: w.expectedVersion(v.expected_version), attachment_id: w.id(v.attachment_id).toLowerCase() };
  }
  throw new TypeError("Factuarea: unsupported ticket write operation.");
}
