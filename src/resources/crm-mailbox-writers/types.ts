/** Native mailbox configuration writes require current crm:write authority. */
export type CrmMailboxProvider = "gmail" | "microsoft_graph";
export type CrmMailboxKind = "personal" | "shared";
/** Every field is present; explicit null never becomes omission. No caller business/effect identity. */
export interface CrmMailboxConfigurationBody {
  expected_version: number;
  provider: CrmMailboxProvider;
  connection_id: string | null;
  kind: CrmMailboxKind;
  team_id: string | null;
  /** Canonical native User UUIDs; current membership remains server-owned. */
  allowed_user_ids: string[];
}
export interface CrmMailboxCreateBody extends CrmMailboxConfigurationBody { expected_version: 0 }
export interface CrmMailboxUpdateBody extends CrmMailboxConfigurationBody { connection_id: string }
/** Immutable original outcome. Availability is recorded state, never a provider/OAuth grant. */
export interface CrmMailboxWriteReceipt {
  id: string;
  effect_id: string;
  connection_id: string;
  version: number;
  availability: "disconnected" | "active";
  confirmed_at: string;
  provider: CrmMailboxProvider;
}
export interface CrmMailboxWriteEnvelope { data: CrmMailboxWriteReceipt }
/** Opaque original key and byte-exact JSON are retained by the caller; no client UUID allocation. */
export interface CrmMailboxWriteIntent { readonly targetId: string | null; readonly originalKey: string; readonly originalWire: string }
export type CrmMailboxCreateIntent = CrmMailboxWriteIntent & { readonly targetId: null };
export type CrmMailboxUpdateIntent = CrmMailboxWriteIntent & { readonly targetId: string };
/** Required relative V1 route bindings, supplied by the actual route composition. No defaults/activation. */
export interface CrmMailboxWriterV1Paths {
  readonly createMailboxConfiguration: string;
  updateMailboxConfiguration(mailboxId: string): string;
  getMailboxWriteOriginal(originalTargetId: string | null): string;
}
