/** Canonical V1 administration fields. Task remains the only time-entry/timer/batch owner. */
export type CrmTaskTimeAction = "link" | "unlink";
export type CrmTaskTimeGrouping = "per_task" | "per_entry" | "single_line";
export interface CrmTaskTimeCasBody { task_id: string; expected_ticket_version: number; expected_task_version: number }
export type CrmTaskTimeLinkBody = CrmTaskTimeCasBody & { confirmed: true } & (
  | { binding_id?: null; expected_binding_version?: null }
  | { binding_id: string; expected_binding_version: number }
);
export interface CrmTaskTimeUnlinkBody extends CrmTaskTimeCasBody { confirmed: true; binding_id: string; expected_binding_version: number }
export interface CrmTaskTimePreviewBody extends CrmTaskTimeCasBody { entries: Array<{ id: string; revision: string }>; grouping: CrmTaskTimeGrouping }
export interface CrmTaskTimeLinkRecoveryBody extends CrmTaskTimeCasBody { action: "link"; binding_id: string; effect_id: string; expected_binding_version?: number }
export interface CrmTaskTimeUnlinkRecoveryBody extends CrmTaskTimeCasBody { action: "unlink"; binding_id: string; effect_id: string; expected_binding_version: number }
export interface CrmTaskTimeListParameters { cursor?: string | null; limit?: number }
export interface CrmTaskTimeBase { ticket_id: string; ticket_version: number; authorization_version: string }
export interface CrmTaskTimeTask { id: string; task_id: string; version?: number; archived_at?: string | null; task_title?: string; task_version?: number }
export interface CrmTaskTimeTasks extends CrmTaskTimeBase { revision: string; tasks: CrmTaskTimeTask[] }
export interface CrmTaskTimeEntry {
  id: string;
  task_id: string;
  revision?: string;
  started_at?: string;
  ended_at?: string | null;
  duration_seconds?: number | null;
  description?: string | null;
  billable?: boolean;
  user_id?: string;
  invoice_id?: string | null;
  billing_batch_id?: string | null;
}
export interface CrmTaskTimeTimesheet extends CrmTaskTimeBase { revision: string; entries: CrmTaskTimeEntry[]; next_cursor: string | null; total_closed_seconds?: number }
export interface CrmTaskTimeBillable extends CrmTaskTimeBase { revision: string; entries: CrmTaskTimeEntry[]; next_cursor: string | null; total_billable_closed_seconds?: number }
/** Monetary values and quantities remain native decimal strings; no client float/currency/tax inference. */
export interface CrmTaskTimeInvoiceLine { description: string; quantity: string; unit: string; unit_price: string; amount: string }
export interface CrmTaskTimeInvoiceTotals {
  subtotal: string; vat: string; surcharge: string; retention: string; total: string;
  vat_rate: number | null; surcharge_rate: number | null; retention_rate: number | null;
}
export interface CrmTaskTimeInvoicePreview {
  contact: { id: string; name: string };
  lines: CrmTaskTimeInvoiceLine[];
  total_seconds: number;
  total_hours: string;
  time_entry_ids: string[];
  warnings: string[];
  totals?: CrmTaskTimeInvoiceTotals | null;
}
export interface CrmTaskTimePreview extends CrmTaskTimeBase { preview: CrmTaskTimeInvoicePreview }
export interface CrmTaskTimeReceipt extends CrmTaskTimeBase {
  status: "confirmed";
  effect_id: string;
  operation: "customer_service.task_time_link" | "customer_service.task_time_unlink";
  confirmed_at: string | null;
  result: { binding: { id: string; task_id: string; version: number; archived_at?: string | null }; task_version?: number };
}
export interface CrmTaskTimeEnvelope<V> { data: V }
export interface CrmTaskTimeIntent {
  readonly action: CrmTaskTimeAction;
  readonly ticketId: string;
  readonly originalKey: string;
  readonly originalWire: string;
}
export type CrmTaskTimeLinkIntent = CrmTaskTimeIntent & { readonly action: "link" };
export type CrmTaskTimeUnlinkIntent = CrmTaskTimeIntent & { readonly action: "unlink" };
/** Required real route composition, relative to the configured V1 base URL. No default endpoints or activation. */
export interface CrmTaskTimeBillingV1Paths {
  linkServiceTicketTask(ticketId: string): string;
  unlinkServiceTicketTask(ticketId: string): string;
  listServiceTicketTasks(ticketId: string): string;
  getServiceBillableTime(ticketId: string): string;
  getServiceTimesheet(ticketId: string): string;
  previewServiceTimeInvoice(ticketId: string): string;
  getOriginalServiceTicketTaskLinkReceipt(ticketId: string): string;
  getOriginalServiceTicketTaskUnlinkReceipt(ticketId: string): string;
}
