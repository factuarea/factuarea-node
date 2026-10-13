import type * as T from "./types.js";

const definitionKeys = ["public_id", "state", "host_id", "resource_id", "schedule", "required_sources", "notice_version", "hold_minutes", "location"];
const businessUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const userUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[47][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
function fail(field: string): never { throw new TypeError(`Factuarea: incompatible Booking ${field}.`); }
function object(value: unknown, required: string[], optional: string[] = []): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)
    || required.some((key) => !Object.hasOwn(value, key))
    || Object.keys(value).some((key) => !required.includes(key) && !optional.includes(key))) fail("object fields");
  return value as Record<string, unknown>;
}
export function bookingId(value: unknown, user = false): asserts value is string {
  if (typeof value !== "string" || !(user ? userUuid : businessUuid).test(value)) fail("id");
}
function integer(value: unknown, min = 1, max = Number.MAX_SAFE_INTEGER): asserts value is number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < min || value > max) fail("exact integer");
}
function text(value: unknown, max: number, allowEmpty = false): asserts value is string {
  if (typeof value !== "string" || (!allowEmpty && value.trim() === "") || Buffer.byteLength(value, "utf8") > max
    || /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(value)) fail("text");
}
function member(value: unknown, values: string[]): void { if (typeof value !== "string" || !values.includes(value)) fail("enum"); }
function instant(value: unknown): asserts value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value)) fail("UTC instant");
  const time = new Date(value);
  if (!Number.isFinite(time.getTime()) || time.toISOString() !== value.replace("Z", ".000Z")) fail("UTC instant");
}
function date(value: unknown): void {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) fail("date");
  instant(value + "T00:00:00Z");
}
function window(value: unknown, weekly: boolean): T.CrmBookingWindow {
  const row = object(value, weekly ? ["weekday", "start_minute", "end_minute"] : ["start_minute", "end_minute"]);
  integer(row.start_minute, 0, 1439); integer(row.end_minute, 1, 1440);
  if (row.start_minute >= row.end_minute) fail("window");
  if (weekly) integer(row.weekday, 1, 7);
  return row as unknown as T.CrmBookingWindow;
}
function disjoint(windows: T.CrmBookingWindow[]): void {
  let end = -1;
  for (const item of [...windows].sort((a, b) => a.start_minute - b.start_minute)) {
    if (item.start_minute < end) fail("window overlap");
    end = item.end_minute;
  }
}
function schedule(value: unknown): void {
  const data = object(value, ["timezone", "duration_minutes", "buffer_before", "buffer_after", "capacity", "minimum_notice_minutes", "booking_horizon_days", "slot_step_minutes", "dst_policy", "windows", "exceptions"]);
  // The server's DateTimeZone::ALL_WITH_BC catalog remains authoritative; JS Intl has a different alias catalog.
  text(data.timezone, 200); member(data.dst_policy, ["reject_ambiguous", "both_offsets"]);
  const bounds: Record<string, [number, number]> = { duration_minutes: [1, 1440], buffer_before: [0, 1440], buffer_after: [0, 1440], capacity: [1, 10000],
    minimum_notice_minutes: [0, 525600], booking_horizon_days: [1, 366], slot_step_minutes: [1, 1440] };
  for (const [key, [min, max]] of Object.entries(bounds)) integer(data[key], min, max);
  if (!Array.isArray(data.windows) || !Array.isArray(data.exceptions)) fail("schedule lists");
  const days = new Map<number, T.CrmBookingWindow[]>();
  for (const item of data.windows) {
    const row = window(item, true); const day = (item as T.CrmBookingWeeklyWindow).weekday;
    const group = days.get(day) ?? []; group.push(row); days.set(day, group);
  }
  for (const group of days.values()) disjoint(group);
  const dates = new Set<string>();
  for (const item of data.exceptions) {
    const row = object(item, ["date", "windows"]); date(row.date);
    if (!Array.isArray(row.windows) || dates.has(row.date as string)) fail("exceptions");
    dates.add(row.date as string); disjoint(row.windows.map((item) => window(item, false)));
  }
}
function definition(value: unknown): void {
  const data = object(value, [], definitionKeys);
  for (const [key, field] of Object.entries(data)) {
    if (key === "schedule") schedule(field);
    else if (key === "host_id" || key === "resource_id") bookingId(field, key === "host_id");
    else if (key === "state") member(field, ["draft", "published", "paused"]);
    else if (key === "hold_minutes") integer(field, 1, 1440);
    else if (key === "location" && field === null) continue;
    else if (key === "required_sources") {
      if (!Array.isArray(field) || field.length === 0 || !field.includes("booking") || new Set(field).size !== field.length) fail("required_sources");
      field.forEach((source) => text(source, 200));
    } else text(field, key === "location" ? 1000 : 200);
  }
}
/** Reject ambiguous duplicate members, including escaped names, without reserializing the caller's wire. */
function uniqueKeys(wire: string): void {
  const objects: Array<Set<string> | null> = [];
  for (let index = 0; index < wire.length; index++) {
    const token = wire[index];
    if (token === "{" || token === "[") { objects.push(token === "{" ? new Set() : null); if (objects.length > 31) fail("JSON depth"); }
    else if (token === "}" || token === "]") objects.pop();
    else if (token === '"') {
      const start = index;
      for (index++; index < wire.length; index++) {
        if (wire[index] === "\\") index++;
        else if (wire[index] === '"') break;
      }
      let after = index + 1;
      while (/\s/.test(wire[after] ?? "")) after++;
      const keys = objects[objects.length - 1];
      if (wire[after] === ":" && keys) {
        const key: unknown = JSON.parse(wire.slice(start, index + 1));
        if (typeof key !== "string" || keys.has(key)) fail("duplicate JSON member");
        keys.add(key);
      }
    }
  }
}
export function decodeCrmBookingServiceIntent(targetId: null, originalKey: string, originalWire: string): T.CrmBookingServiceCreateIntent;
export function decodeCrmBookingServiceIntent(targetId: string, originalKey: string, originalWire: string): T.CrmBookingServiceSaveIntent;
export function decodeCrmBookingServiceIntent(targetId: string | null, originalKey: string, originalWire: string): T.CrmBookingServiceIntent;
export function decodeCrmBookingServiceIntent(targetId: string | null, originalKey: string, originalWire: string): T.CrmBookingServiceIntent {
  if (targetId !== null) bookingId(targetId);
  if (typeof originalKey !== "string" || originalKey === "" || Buffer.byteLength(originalKey, "utf8") > 200 || /[\x00-\x1f\x7f]/.test(originalKey)) fail("original Idempotency-Key");
  // Native opaque keys may be broader than Fetch header values. Fail before dispatch instead of silently trimming/replacing original bytes.
  try {
    if (new Headers({ "Idempotency-Key": originalKey }).get("Idempotency-Key") !== originalKey) fail("original key header representation");
  } catch { fail("original key header representation"); }
  if (typeof originalWire !== "string" || originalWire === "" || Buffer.byteLength(originalWire, "utf8") > 65536) fail("original wire");
  let parsed: unknown;
  try { parsed = JSON.parse(originalWire); } catch { fail("JSON"); }
  uniqueKeys(originalWire);
  const data = object(parsed, ["definition"], ["expected_version", "publication_confirmation_id"]);
  definition(data.definition);
  if (targetId === null) {
    if (Object.hasOwn(data, "expected_version") && data.expected_version !== null) fail("create CAS");
  } else integer(data.expected_version);
  if (Object.hasOwn(data, "publication_confirmation_id")) bookingId(data.publication_confirmation_id);
  return Object.freeze({ targetId, originalKey, originalWire });
}
export function validateCrmBookingServiceIntent(value: T.CrmBookingServiceIntent): T.CrmBookingServiceIntent {
  const data = object(value, ["targetId", "originalKey", "originalWire"]);
  return decodeCrmBookingServiceIntent(data.targetId as string | null, data.originalKey as string, data.originalWire as string);
}
function service(value: unknown, sources = false): void {
  const row = object(value, ["id", "version"], ["publication_version", ...definitionKeys, ...(sources ? ["source_statuses"] : [])]);
  bookingId(row.id); integer(row.version);
  if (Object.hasOwn(row, "publication_version")) integer(row.publication_version);
  definition(Object.fromEntries(Object.entries(row).filter(([key]) => definitionKeys.includes(key))));
  if (Object.hasOwn(row, "source_statuses")) {
    if (typeof row.source_statuses !== "object" || row.source_statuses === null || Array.isArray(row.source_statuses)) fail("source_statuses");
    for (const [name, item] of Object.entries(row.source_statuses)) {
      text(name, 200); const source = object(item, ["verified", "revision", "reason"]);
      if (typeof source.verified !== "boolean" || typeof source.revision !== "string" || !/^[0-9a-f]{64}$/.test(source.revision)) fail("source_status");
      if (source.reason !== null) text(source.reason, 200, true);
    }
  }
}
function booking(value: unknown): void {
  const row = object(value, ["id", "version"], ["service_id", "host_id", "resource_id", "status", "start_at", "end_at", "projection_status"]);
  bookingId(row.id); integer(row.version);
  for (const [key, field] of Object.entries(row)) {
    if (["service_id", "resource_id", "host_id"].includes(key)) bookingId(field, key === "host_id");
    else if (key === "status") member(field, ["held", "confirmed", "cancelled", "expired"]);
    else if (key === "start_at" || key === "end_at") instant(field);
    else if (key === "projection_status") text(field, 100);
  }
}
export function decodeCrmBookingService(value: unknown): T.CrmBookingEnvelope<T.CrmBookingService> {
  const envelope = object(value, ["data"]); service(envelope.data); return value as T.CrmBookingEnvelope<T.CrmBookingService>;
}
export function decodeCrmBookingServiceReceipt(value: unknown): T.CrmBookingEnvelope<T.CrmBookingServiceReceipt | null> {
  const envelope = object(value, ["data"]); if (envelope.data !== null) service(envelope.data);
  return value as T.CrmBookingEnvelope<T.CrmBookingServiceReceipt | null>;
}
export function decodeCrmBookingPage(value: unknown, kind: "services"): T.CrmBookingEnvelope<T.CrmBookingPageData<T.CrmBookingServiceListItem>>;
export function decodeCrmBookingPage(value: unknown, kind: "bookings"): T.CrmBookingEnvelope<T.CrmBookingPageData<T.CrmBookingListItem>>;
export function decodeCrmBookingPage(value: unknown, kind: "services" | "bookings"): T.CrmBookingEnvelope<T.CrmBookingPageData<T.CrmBookingServiceListItem | T.CrmBookingListItem>>;
export function decodeCrmBookingPage(value: unknown, kind: "services" | "bookings"): T.CrmBookingEnvelope<T.CrmBookingPageData<T.CrmBookingServiceListItem | T.CrmBookingListItem>> {
  const envelope = object(value, ["data"]); const data = object(envelope.data, ["items", "total", "next_cursor"]);
  integer(data.total, 0); if (data.next_cursor !== null) text(data.next_cursor, 4096);
  if (!Array.isArray(data.items)) fail("page items");
  data.items.forEach((item) => kind === "services" ? service(item, true) : booking(item));
  return value as T.CrmBookingEnvelope<T.CrmBookingPageData<T.CrmBookingServiceListItem | T.CrmBookingListItem>>;
}
export function bookingListQuery(parameters: T.CrmBookingListParameters | T.CrmBookingsListParameters, bookings: boolean): Record<string, unknown> {
  const data = object(parameters, [], bookings ? ["cursor", "limit", "service_id", "host_id", "status", "from", "through"] : ["cursor", "limit"]);
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    if (key === "limit") integer(value, 1, 100);
    else if (key === "cursor") text(value, 4096);
    else if (key === "service_id" || key === "host_id") bookingId(value, key === "host_id");
    else if (key === "status") member(value, ["held", "confirmed", "cancelled", "expired"]);
    else instant(value);
  }
  if (typeof data.from === "string" && typeof data.through === "string" && data.from >= data.through) fail("interval");
  return { ...data };
}
export function bookingPath(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/crm/booking/") || /[?#\s\\]/.test(value) || value.includes("..") || value.includes("://")) fail("required V1 path");
  return value;
}
export function validateCrmBookingPaths(value: T.CrmBookingV1Paths): void {
  const paths = object(value, ["listBookingServices", "listBookings", "createBookingService", "getBookingService", "saveBookingService", "recoverBookingServiceReceipt"]);
  for (const name of ["listBookingServices", "listBookings", "createBookingService"]) bookingPath(paths[name]);
  for (const name of ["getBookingService", "saveBookingService", "recoverBookingServiceReceipt"]) if (typeof paths[name] !== "function") fail("required route function");
}
