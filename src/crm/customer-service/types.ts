import type { ApiResponse } from "../../core/http-client.js";
import type { RequestConfig } from "../../core/resource.js";
import type { CrmDocumentId, CrmDocumentTimestamp, CrmDocumentVersion, NativeDocumentId } from "../documents/types.js";

/** Compatible native brands permit attaching a document returned by commercialDocuments. */
export type ServiceTicketId = CrmDocumentId;
export type ServiceTicketVersion = CrmDocumentVersion;
export type ServiceTicketActorId = NativeDocumentId;
export type ServiceTicketTimestamp = CrmDocumentTimestamp;
export type CustomerServiceResponse<T> = ApiResponse<T>;
export type CustomerServiceWriteOperation = "moveToStage" | "attachDocument" | "detachDocument";
export interface CustomerServiceWriteConfig extends Omit<RequestConfig, "maxRetries" | "idempotencyKey"> {
  idempotencyKey: string;
}
export type CustomerServiceRecoveryConfig = Pick<RequestConfig, "timeout" | "signal">;

interface MoveServiceTicketStage {
  expected_version: ServiceTicketVersion;
  pipeline_id: ServiceTicketId;
  stage_id: ServiceTicketId;
}
/** Omission preserves waiting; null releases it. Only an explicit release can cite the original customer message. */
export type MoveServiceTicketToStageRequest = MoveServiceTicketStage & (
  { waiting_reason?: "waiting_customer" | null; customer_message_id?: null; }
  | { waiting_reason: null; customer_message_id: ServiceTicketId; }
);
export interface AttachServiceTicketDocumentRequest {
  expected_version: ServiceTicketVersion;
  document_id: ServiceTicketId;
  document_version: ServiceTicketVersion;
}
export interface DetachServiceTicketDocumentRequest {
  expected_version: ServiceTicketVersion;
  attachment_id: ServiceTicketId;
}
export interface ServiceTicketPageQuery { page?: number; per_page?: number; }
export interface ServiceTicketListQuery extends ServiceTicketPageQuery {
  status?: "new" | "assigned" | "pending" | "closed" | "rejected" | "duplicate";
  sort?: "id" | "version" | "title" | "status" | "priority" | "created_at" | "updated_at";
  direction?: "asc" | "desc";
}

/** Missing optional keys remain missing under the server's current field masks. */
export interface ServiceTicket {
  id: ServiceTicketId;
  version: ServiceTicketVersion;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  type?: string;
  creator_id?: ServiceTicketActorId;
  pipeline_id?: ServiceTicketId | null;
  stage_id?: ServiceTicketId | null;
  counterparty_id?: ServiceTicketId | null;
  person_id?: ServiceTicketId | null;
  assignee_id?: ServiceTicketActorId | null;
  created_at?: ServiceTicketTimestamp;
  updated_at?: ServiceTicketTimestamp;
  first_response_at?: ServiceTicketTimestamp | null;
  resolved_at?: ServiceTicketTimestamp | null;
  closed_at?: ServiceTicketTimestamp | null;
  archived_at?: ServiceTicketTimestamp | null;
  cycle?: number;
  waiting_reason?: string | null;
  comments?: ServiceTicketComment[];
  attachments?: ServiceTicketAttachment[];
  writable_fields?: string[];
  authorization_version?: string;
}
export interface ServiceTicketAttachment {
  id: ServiceTicketId;
  document_id: ServiceTicketId;
  document_version: ServiceTicketVersion;
  mime?: string;
  size_bytes?: number;
  created_by?: ServiceTicketActorId;
  created_at?: ServiceTicketTimestamp;
}
export interface ServiceTicketComment {
  id: ServiceTicketId;
  visibility: string;
  author_type?: string;
  author_id?: ServiceTicketActorId;
  body?: string;
  body_format?: string;
  delivery_state?: string;
  conversation_message_id?: ServiceTicketId | null;
  created_at?: ServiceTicketTimestamp;
  edited_at?: ServiceTicketTimestamp | null;
}
export interface ServiceTicketPage {
  items: ServiceTicket[];
  total: number;
  page: number;
  per_page: number;
}
export interface ServiceTicketTimelineEntry {
  version: ServiceTicketVersion;
  action?: string;
  actor_id?: ServiceTicketActorId;
  occurred_at?: ServiceTicketTimestamp;
  snapshot?: ServiceTicket;
}
export interface ServiceTicketTimeline {
  id: ServiceTicketId;
  items: ServiceTicketTimelineEntry[];
  total: number;
  page: number;
  per_page: number;
}
/** Original public receipt; attaching does not expose the server-owned attachment identity. */
export interface ServiceTicketReceipt { id: ServiceTicketId; version: ServiceTicketVersion; }
