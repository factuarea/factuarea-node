/** Native administrative V1 wire only. Current masks preserve omitted fields. */
export type CrmBookingServiceState = "draft" | "published" | "paused";
export type CrmBookingStatus = "held" | "confirmed" | "cancelled" | "expired";
export interface CrmBookingWindow { start_minute: number; end_minute: number }
export interface CrmBookingWeeklyWindow extends CrmBookingWindow { weekday: number }
export interface CrmBookingSchedule {
  timezone: string;
  duration_minutes: number;
  buffer_before: number;
  buffer_after: number;
  capacity: number;
  minimum_notice_minutes: number;
  booking_horizon_days: number;
  slot_step_minutes: number;
  dst_policy: "reject_ambiguous" | "both_offsets";
  windows: CrmBookingWeeklyWindow[];
  exceptions: Array<{ date: string; windows: CrmBookingWindow[] }>;
}
export interface CrmBookingServiceDefinition {
  public_id: string;
  state: CrmBookingServiceState;
  /** Canonical native User UUID v4/v7. */
  host_id: string;
  resource_id: string;
  schedule: CrmBookingSchedule;
  required_sources: string[];
  notice_version: string;
  hold_minutes: number;
  /** Only location may explicitly be cleared. Omission retains the locked native value. */
  location?: string | null;
}
export type CrmBookingServicePatch = Partial<CrmBookingServiceDefinition>;
export interface CrmBookingServiceCreateBody {
  definition: CrmBookingServiceDefinition;
  expected_version?: null;
  /** A reference to current factual Company proof; never a client grant. */
  publication_confirmation_id?: string;
}
export interface CrmBookingServiceSaveBody {
  definition: CrmBookingServicePatch;
  expected_version: number;
  publication_confirmation_id?: string;
}
export interface CrmBookingService extends CrmBookingServicePatch {
  id: string;
  version: number;
  publication_version?: number;
}
/** Immutable original values projected under current authority; no current-head inference. */
export type CrmBookingServiceReceipt = CrmBookingService;
export interface CrmBookingSourceStatus { verified: boolean; revision: string; reason: string | null }
export interface CrmBookingServiceListItem extends CrmBookingService { source_statuses?: Record<string, CrmBookingSourceStatus> }
export interface CrmBookingListItem {
  id: string;
  version: number;
  service_id?: string;
  host_id?: string;
  resource_id?: string;
  status?: CrmBookingStatus;
  start_at?: string;
  end_at?: string;
  projection_status?: string;
}
export interface CrmBookingPageData<T> { items: T[]; total: number; next_cursor: string | null }
export interface CrmBookingEnvelope<T> { data: T }
export interface CrmBookingListParameters { cursor?: string; limit?: number }
export interface CrmBookingsListParameters extends CrmBookingListParameters {
  service_id?: string;
  host_id?: string;
  status?: CrmBookingStatus;
  from?: string;
  through?: string;
}
/** Caller retains this exact original intent; this SDK generates no key or business identity. */
export interface CrmBookingServiceIntent { readonly targetId: string | null; readonly originalKey: string; readonly originalWire: string }
export type CrmBookingServiceCreateIntent = CrmBookingServiceIntent & { readonly targetId: null };
export type CrmBookingServiceSaveIntent = CrmBookingServiceIntent & { readonly targetId: string };
/** All paths are required, relative to the configured V1 base URL. Native routes do not activate gates. */
export interface CrmBookingV1Paths {
  readonly listBookingServices: string;
  readonly listBookings: string;
  readonly createBookingService: string;
  getBookingService(serviceId: string): string;
  saveBookingService(serviceId: string): string;
  recoverBookingServiceReceipt(originalTargetId: string | null): string;
}
