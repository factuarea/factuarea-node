/** Native Conversation GETs. Identity qualification and current authority stay with the owner. */
export type CrmConversationState = "active" | "archived";
export type CrmConversationTargetType = "contact" | "person" | "lead" | "opportunity" | "quote" | "invoice" | "proposal" | "activity";
export interface CrmConversationFilters {
  mailbox_uuid?: string;
  state?: CrmConversationState;
  search?: string;
  /** Both target members must be supplied together. Filter names remain owner names. */
  target_type?: CrmConversationTargetType;
  target_uuid?: string;
  sort?: "last_message_at:asc" | "last_message_at:desc" | "subject:asc" | "subject:desc";
}
export interface CrmConversationPageParameters { cursor?: string | null; limit?: number }
export interface CrmConversationListParameters extends CrmConversationPageParameters {
  /** Literal JSON object string, preserved exactly; encodeCrmConversationFilters supports typed construction. */
  filters?: string;
}
export interface CrmConversationV1Paths {
  readonly listConversations: string;
  readonly getConversation: string;
}
export interface CrmConversationReadMeta {
  authorization_version: string;
  /** Native field names, never aliases or grants for another operation. */
  readable_fields: string[];
  filterable_fields: string[];
  sortable_fields: string[];
}
export interface CrmConversationEnvelope<T> { data: T; meta: CrmConversationReadMeta }
export interface CrmConversationLink {
  type: CrmConversationTargetType;
  id: string;
  state: "automatic_suggestion" | "confirmed";
}
export interface CrmConversationHead {
  id: string;
  version: number;
  mailbox_id: string;
  subject: string | null;
  status: CrmConversationState;
  owner_id: string | null;
  team_id: string | null;
  last_message_at: string | null;
  links: CrmConversationLink[];
}
export interface CrmConversationParticipant { email: string; name: string | null }
export interface CrmConversationRecipient extends CrmConversationParticipant { kind: "to" | "cc" | "bcc" }
export interface CrmConversationMessage {
  id: string;
  conversation_id: string;
  version: number;
  direction: "inbound" | "outbound";
  sender: CrmConversationParticipant | null;
  recipients: CrmConversationRecipient[] | null;
  subject: string | null;
  body: string | null;
  body_format: "plain_text";
  composition_state: "draft" | "send_intent" | "received";
  /** Original Mail result; send_intent alone never confirms delivery. */
  delivery_status: "pending" | "confirmed" | "unconfirmed" | "failed" | null;
  submitted_at: string | null;
}
/** Metadata only. No download URL, bytes, storage key or client authority. */
export interface CrmConversationAttachment {
  id: string;
  conversation_id: string;
  message_id: string;
  version: number;
  filename: string;
  mime: string;
  size: number;
  status: "quarantine" | "ready" | "rejected";
}
export interface CrmConversationInboxData {
  items: CrmConversationHead[];
  next_cursor: string | null;
  total: number;
  active_count: number;
  archived_count: number;
  limit: number;
}
export interface CrmConversationThreadData {
  conversation: CrmConversationHead;
  messages: CrmConversationMessage[];
  attachments: CrmConversationAttachment[];
  next_cursor: string | null;
  limit: number;
}
