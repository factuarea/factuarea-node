import type * as T from "./types.js";

const metrics: T.CrmServiceInsightMetric[] = ["frt", "nrt", "mttr", "backlog", "sla_compliance"];
const statuses = ["new", "assigned", "pending", "closed", "rejected", "duplicate"];
const businessUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const userUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function fail(field: string): never { throw new TypeError(`Factuarea: incompatible ServiceInsights ${field}.`); }
function object(value: unknown, required: string[], optional: string[] = []): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value) || required.some((key) => !Object.hasOwn(value, key))
    || Object.keys(value).some((key) => !required.includes(key) && !optional.includes(key))) fail("closed fields");
  return value as Record<string, unknown>;
}
function integer(value: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): asserts value is number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < min || value > max) fail("exact integer");
}
function text(value: unknown): asserts value is string {
  if (typeof value !== "string" || /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(value)) fail("text");
}
function member(value: unknown, values: string[]): void { if (typeof value !== "string" || !values.includes(value)) fail("enum"); }
function id(value: unknown, user = false): void { if (typeof value !== "string" || !(user ? userUuid : businessUuid).test(value)) fail("public id"); }
function hash(value: unknown): void { if (typeof value !== "string" || !/^[a-f0-9]{64}$/.test(value)) fail("predicate hash"); }
/** Validate the native UTC microsecond format without truncating the last three digits for comparisons. */
function instant(value: unknown): bigint {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/.test(value)) fail("UTC microsecond instant");
  const milli = value.slice(0, -4) + "Z"; const time = new Date(milli);
  if (!Number.isFinite(time.getTime()) || time.toISOString() !== milli) fail("UTC instant");
  return BigInt(time.getTime()) * 1000n + BigInt(value.slice(-4, -1));
}
function cohort(value: Record<string, unknown>): void {
  const start = instant(value.start); const end = instant(value.end);
  if (start >= end || end - start > 366n * 24n * 60n * 60n * 1000000n) fail("cohort range");
}
function selection(value: Record<string, unknown>, nullable = false): void {
  cohort(value); member(value.clock_mode, ["natural", "business"]);
  for (const field of ["agent_id", "team_id", "status"]) {
    if (!Object.hasOwn(value, field)) continue;
    if (nullable && value[field] === null) continue;
    if (field === "status") member(value[field], statuses); else id(value[field], field === "agent_id");
  }
}
export function serviceInsightsCohortQuery(value: T.CrmServiceInsightCohort): Record<string, unknown> {
  const data = object(value, ["start", "end"]); cohort(data); return { ...data };
}
export function serviceInsightsSelectionQuery(value: T.CrmServiceInsightSelection): Record<string, unknown> {
  const data = object(value, ["start", "end", "clock_mode"], ["agent_id", "team_id", "status"]); selection(data); return { ...data };
}
export function serviceInsightsDrillQuery(value: T.CrmServiceInsightDrillParameters): Record<string, unknown> {
  const data = object(value, ["start", "end", "clock_mode", "metric", "as_of", "predicate_hash"], ["agent_id", "team_id", "status", "page", "per_page"]);
  selection(data); member(data.metric, metrics); instant(data.as_of); hash(data.predicate_hash);
  if (Object.hasOwn(data, "page")) integer(data.page, 1, 9999999);
  if (Object.hasOwn(data, "per_page")) integer(data.per_page, 1, 100);
  return { ...data };
}
function proof(data: Record<string, unknown>): void {
  text(data.authorization_version); if (data.authorization_version === "") fail("authorization version"); hash(data.predicate_hash);
}
function decimal(value: unknown, places: number): void {
  if (value !== null && (typeof value !== "string" || !new RegExp("^[0-9]+\\.[0-9]{" + places + "}$").test(value))) fail("decimal string");
}
export function decodeCrmServiceCsatMetric(value: unknown): T.CrmServiceInsightEnvelope<T.CrmServiceCsatMetric> {
  const envelope = object(value, ["data"]); const data = object(envelope.data, ["metric", "metric_version", "cohort_start", "cohort_end", "cohort_basis", "cycle_policy", "clock_mode", "invited", "answered", "mean", "median", "masked_fields", "authorization_version", "predicate_hash"]);
  if (data.metric !== "csat" || data.metric_version !== 1 || data.cohort_basis !== "original_closed_at"
    || data.cycle_policy !== "each_closure_participant" || data.clock_mode !== "not_applicable") fail("CSAT definition");
  cohort({ start: data.cohort_start, end: data.cohort_end }); proof(data); integer(data.invited);
  if (data.answered !== null) integer(data.answered);
  decimal(data.mean, 4); decimal(data.median, 4);
  if (!Array.isArray(data.masked_fields) || new Set(data.masked_fields).size !== data.masked_fields.length) fail("CSAT masks");
  for (const field of data.masked_fields) member(field, ["answered_at", "rating"]);
  if (data.masked_fields.includes("answered_at") && data.answered !== null) fail("CSAT mask projection");
  if (data.masked_fields.length > 0 && (data.mean !== null || data.median !== null)) fail("CSAT score mask projection");
  return value as T.CrmServiceInsightEnvelope<T.CrmServiceCsatMetric>;
}
export function decodeCrmServiceInsightMetrics(value: unknown): T.CrmServiceInsightEnvelope<T.CrmServiceInsightMetrics> {
  const envelope = object(value, ["data"]); const data = object(envelope.data, ["selection", "cohort_basis", "cycle_basis", "as_of", "authorization_version", "predicate_hash", "cohort_count", "metrics"]);
  selection(object(data.selection, ["start", "end", "clock_mode", "agent_id", "team_id", "status"]), true);
  if (data.cohort_basis !== "ticket_created_at" || data.cycle_basis !== "current_cycle") fail("analytics basis");
  instant(data.as_of); proof(data); integer(data.cohort_count);
  const values = object(data.metrics, metrics);
  const privateKeys = ["sample_count", "contributor_count", "mean_microseconds", "median_microseconds", "value_count", "compliant_count", "missing_count"];
  for (const value of Object.values(values)) {
    const row = object(value, ["eligible_count", ...privateKeys, "masked"]); integer(row.eligible_count);
    if (typeof row.masked !== "boolean") fail("metric mask");
    for (const key of privateKeys) {
      if (key.endsWith("microseconds")) decimal(row[key], 6); else if (row[key] !== null) integer(row[key]);
    }
    if (row.masked && privateKeys.some((key) => row[key] !== null)) fail("masked metric projection");
  }
  return value as T.CrmServiceInsightEnvelope<T.CrmServiceInsightMetrics>;
}
export function decodeCrmServiceInsightDrill(value: unknown): T.CrmServiceInsightEnvelope<T.CrmServiceInsightDrill> {
  const envelope = object(value, ["data"]); const data = object(envelope.data, ["metric", "as_of", "authorization_version", "predicate_hash", "total", "page", "per_page", "items"]);
  member(data.metric, metrics); instant(data.as_of); proof(data); integer(data.total); integer(data.page, 1, 9999999); integer(data.per_page, 1, 100);
  if (!Array.isArray(data.items) || data.items.length > data.per_page) fail("drill items");
  // The native owner returns array_slice of the original unique contributors, including empty out-of-range pages.
  const expected = Math.min(data.per_page, Math.max(0, data.total - (data.page - 1) * data.per_page));
  if (data.items.length !== expected) fail("drill contributor cardinality");
  const seen = new Set<string>();
  for (const value of data.items) {
    const row = object(value, ["id", "version", "cycle", "label", "status", "sample_count"]); id(row.id); integer(row.version, 1); integer(row.cycle, 1); integer(row.sample_count, 1);
    if (row.label !== null) text(row.label); if (row.status !== null) member(row.status, statuses);
    if (seen.has(row.id as string)) fail("duplicate contributor"); seen.add(row.id as string);
  }
  return value as T.CrmServiceInsightEnvelope<T.CrmServiceInsightDrill>;
}
export function serviceInsightsPath(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value === "/" || /[?#\s\\%]/.test(value)
    || value.includes("..") || value.includes("://")) fail("required relative V1 path");
  return value;
}
export function validateCrmServiceInsightsPaths(value: T.CrmServiceInsightsV1Paths): void {
  const paths = object(value, ["getServiceInsights", "getServiceMetrics", "getServiceInsightDrillThrough"]);
  for (const path of Object.values(paths)) serviceInsightsPath(path);
}
