import type { RequestConfig } from "../core/resource.js";

/** Public v1 shapes from ServiceLevelRequestContext and ServiceLevelOpenApiSchemas. */
export interface ServiceLevelResponse<T> {
  data: T;
}

export type ServiceLevelWriteOperation = "configure" | "pause" | "resume" | "updateCalendar";

export interface ServiceLevelWriteConfig extends Omit<RequestConfig, "idempotencyKey" | "maxRetries"> {
  /** Keep this original key and the original payload for explicit receipt recovery. */
  idempotencyKey: string;
  /** Writes never retry automatically, including when the outcome is ambiguous. */
  maxRetries?: never;
}

export interface ServiceLevelPageQuery {
  page?: number;
  per_page?: number;
}

export interface ServiceLevelWriteResult {
  id: string;
  version: number;
}

export interface ConfigureServiceSlaRequest {
  /** null lets the server reserve the new cycle identity. */
  cycle_id: string | null;
  expected_version: number | null;
  /** null lets the server reserve a new policy; policy_version must then be 1. */
  policy_id: string | null;
  policy_version: number;
  first_response_minutes: number;
  first_response_risk_minutes: number | null;
  next_response_minutes: number;
  next_response_risk_minutes: number | null;
  resolution_minutes: number;
  resolution_risk_minutes: number | null;
  pause_first_response: boolean;
  pause_next_response: boolean;
  pause_resolution: boolean;
  /** calendar_id and calendar_version must both be null, or both present. */
  calendar_id: string | null;
  calendar_version: number | null;
}

export interface PauseServiceSlaRequest {
  cycle_id: string;
  expected_version: number;
  /** Manual reason; waiting_customer is reserved for canonical customer facts. */
  reason: string;
  first_response: boolean;
  next_response: boolean;
  resolution: boolean;
}

export interface ResumeServiceSlaRequest {
  cycle_id: string;
  expected_version: number;
  reason: string;
}

export interface ServiceCalendarMinuteWindow {
  start_minute: number;
  end_minute: number;
}

export interface ServiceCalendarWindow extends ServiceCalendarMinuteWindow {
  weekday: number;
}

export interface ServiceCalendarException {
  date: string;
  windows: ServiceCalendarMinuteWindow[];
}

export interface ServiceCalendarData {
  name: string;
  timezone: string;
  mode: "business" | "always_open";
  windows: ServiceCalendarWindow[];
  holidays: string[];
  exceptions: ServiceCalendarException[];
}

export interface UpdateServiceCalendarRequest extends ServiceCalendarData {
  /** New calendars require null; existing calendars keep their server identity. */
  id: string | null;
  /** null for creation; the current positive version for CAS updates. */
  expected_version: number | null;
}

export interface ServiceCalendar extends ServiceCalendarData {
  id: string;
  version: number;
}

export type ServiceSlaClockName = "first_response" | "next_response" | "resolution";
export type ServiceSlaClockState = "not_started" | "on_track" | "at_risk" | "breached";

export interface ServiceSlaClockTarget {
  minutes: number;
  at_risk_minutes: number | null;
}

export interface ServiceSlaTargets {
  policy_id: string;
  version: number;
  clocks: Record<ServiceSlaClockName, ServiceSlaClockTarget>;
  pause_on_waiting_customer: ServiceSlaClockName[];
}

export interface ServiceSlaConfiguration {
  effective_at: string;
  targets: ServiceSlaTargets;
  calendar: ServiceCalendar | null;
}

export interface ServiceSlaStoredClock {
  started_at: string | null;
  stopped_at: string | null;
  satisfied: boolean;
  message_id: string | null;
  configuration: ServiceSlaConfiguration | null;
}

export interface ServiceSlaProjectedClock {
  started_at: string | null;
  stopped_at: string | null;
  satisfied: boolean;
  paused: boolean;
  elapsed_microseconds: number;
  target_minutes: number;
  at_risk_minutes: number | null;
  policy_id: string;
  policy_version: number;
  elapsed_calendar_version: number | null;
  deadline: string | null;
  deadline_is_provisional: boolean;
  state: ServiceSlaClockState;
}

export interface ServiceSlaStatus {
  id: string;
  subject_id: string;
  version: number;
  cycle_number: number;
  policy_id: string;
  policy_version: number;
  calendar_id: string | null;
  calendar_version: number | null;
  as_of: string;
  terminal: boolean;
  state: Exclude<ServiceSlaClockState, "not_started">;
  public_customer_messages: number;
  public_agent_responses: number;
  next_response_history: ServiceSlaProjectedClock[];
  clocks: Record<ServiceSlaClockName, ServiceSlaProjectedClock>;
}

export interface ServiceSlaPause {
  reason: string;
  clocks: ServiceSlaClockName[];
  started_at: string;
  ended_at: string | null;
}

export interface ServiceSlaMessage {
  id: string;
  kind: "customer_public" | "agent_public" | "internal_note" | "autoresponse";
  occurred_at: string;
}

export interface ServiceSlaCycle {
  id: string;
  subject_id: string;
  version: number;
  cycle_number: number;
  previous_cycle_id: string | null;
  opened_at: string;
  observed_at: string;
  terminal_at: string | null;
  clocks: Record<ServiceSlaClockName, ServiceSlaStoredClock>;
  response_history: { clock: ServiceSlaStoredClock; configuration: ServiceSlaConfiguration }[];
  configurations: ServiceSlaConfiguration[];
  pauses: ServiceSlaPause[];
  messages: ServiceSlaMessage[];
}

export interface ServiceCalendarList {
  items: ServiceCalendar[];
  total: number;
  page: number;
  per_page: number;
}

export interface ServiceSlaHistory {
  subject_id: string;
  items: ServiceSlaCycle[];
  total: number;
  page: number;
  per_page: number;
}
