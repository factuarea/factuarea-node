import type { ApiResponse, HttpClient, RequestOptions } from "../core/http-client.js";
import { ConnectionError, ServerError } from "../core/errors.js";
import { CrmUnconfirmedWriteError } from "../crm/errors.js";
import { CrmCursorPage } from "../crm/pagination.js";
import type { CrmRequestConfig } from "../crm/resource.js";
import type * as T from "../crm/sequences-types.js";

/** Implemented by the native HttpClient composition; ordinary JSON.stringify transport cannot substitute. */
export interface CrmSequenceNativeTransport extends Pick<HttpClient, "request"> {
  requestOriginalJson<V>(options: RequestOptions & { rawJsonBody: string; autoIdempotency?: false }): Promise<ApiResponse<V>>;
}
export type CrmSequenceReadConfig = Omit<CrmRequestConfig, "idempotencyKey">;
export type CrmSequenceOriginalReadConfig = CrmSequenceReadConfig & { idempotencyKey: string };
export type CrmSequenceMutationConfig = Omit<CrmRequestConfig, "idempotencyKey" | "maxRetries">;

export class CrmSequenceUnconfirmedWriteError extends CrmUnconfirmedWriteError {
  constructor(readonly originalIntent: T.CrmSequenceOriginalIntent, cause: Error) {
    super(originalIntent.operation === "save" ? "automation.crm_sequence_save" : "automation.crm_sequence_enrol", originalIntent.originalKey, cause);
  }
}

/** A current-state read can inform the caller; it cannot prove this control's original outcome. */
export class CrmSequenceControlUnconfirmedError extends ConnectionError {
  readonly state = "unconfirmed" as const;
  constructor(readonly action: "pause" | "resume" | "cancel", readonly enrolmentId: string, readonly expectedVersion: number, cause: Error) {
    super({ message: "Factuarea: sequence control outcome is unknown; read the current state before a new decision.", code: "crm_sequence_control_unconfirmed", cause,
      requestId: cause instanceof ConnectionError || cause instanceof ServerError ? cause.requestId : undefined });
  }
}

const scheduleStates = ["draft", "active", "paused", "retired"];
const enrolmentStates = ["active", "waiting", "paused", "completed", "cancelled", "blocked"];
const subjects = ["lead", "opportunity", "business_contact"];
const stepTypes = ["wait", "create_activity", "draft", "send"];
const stopReasons = ["human_reply", "optout", "closure", "booking_confirmed", "owner_disabled", "revoked", "suppressed", "manual", "privacy", "unconfirmed"];
const stopConditions = ["booking_confirmed", "hard_bounce", "complaint", "contactability_revoked"];
const businessUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const userUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const record = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
function fail(field: string): never { throw new TypeError(`Factuarea: incompatible sequence ${field}.`); }
function object(value: unknown, required: string[], optional: string[] = []): Record<string, unknown> {
  if (!record(value) || required.some((key) => !Object.hasOwn(value, key)) || Object.keys(value).some((key) => !required.includes(key) && !optional.includes(key))) fail("object fields");
  return value;
}
function integer(value: unknown, minimum = 1): asserts value is number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < minimum) fail("exact integer");
}
function uuid(value: unknown, user = false): asserts value is string {
  if (typeof value !== "string" || !(user ? userUuid : businessUuid).test(value)) fail("id");
}
function text(value: unknown): asserts value is string { if (typeof value !== "string") fail("text"); }
function member(value: unknown, choices: string[]): void { if (typeof value !== "string" || !choices.includes(value)) fail("enum"); }
function nullableText(value: unknown): void { if (value !== null) text(value); }
function originalKey(value: unknown): asserts value is string {
  // Header transport accepts only ASCII visible bytes; native keys are opaque, never entity UUIDs.
  if (typeof value !== "string" || !/^[!-~]{1,512}$/.test(value)) fail("original Idempotency-Key");
}
function uniqueKeys(wire: string): void {
  const objects: Array<Set<string> | null> = [];
  for (let index = 0; index < wire.length; index++) {
    const token = wire[index];
    if (token === "{" || token === "[") objects.push(token === "{" ? new Set() : null);
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
function definition(value: unknown): void {
  const data = object(value, ["timezone", "ambiguous_offset", "allowed_windows", "steps", "stop_on_closure", "purpose", "channel"], ["stop_conditions"]);
  text(data.timezone); member(data.ambiguous_offset, ["earlier", "later"]); member(data.channel, ["email", "whatsapp"]);
  if (typeof data.stop_on_closure !== "boolean" || typeof data.purpose !== "string" || !/^[a-z][a-z0-9_]{0,63}$/.test(data.purpose)
    || !Array.isArray(data.allowed_windows) || data.allowed_windows.length === 0 || !Array.isArray(data.steps) || data.steps.length === 0) fail("definition");
  for (const item of data.allowed_windows) {
    const window = object(item, ["weekday", "start_minute", "end_minute"]);
    integer(window.weekday); integer(window.start_minute, 0); integer(window.end_minute);
    if (window.weekday > 7 || window.end_minute > 1440 || window.start_minute >= window.end_minute) fail("allowed_windows");
  }
  for (const item of data.steps) {
    const step = object(item, ["type", "wait_seconds", "recipe_id"]);
    member(step.type, stepTypes);
    if (step.type === "wait") { integer(step.wait_seconds); if (step.recipe_id !== null) fail("recipe_id"); }
    else { if (step.wait_seconds !== null) fail("wait_seconds"); uuid(step.recipe_id); }
  }
  if (Object.hasOwn(data, "stop_conditions")) {
    if (!Array.isArray(data.stop_conditions) || new Set(data.stop_conditions).size !== data.stop_conditions.length) fail("stop_conditions");
    data.stop_conditions.forEach((item) => member(item, stopConditions));
  }
}

export function decodeCrmSequenceOriginalWire(operation: "save", targetId: string | null, key: string, wire: string): T.CrmSequenceSaveIntent;
export function decodeCrmSequenceOriginalWire(operation: "enrol", targetId: string, key: string, wire: string): T.CrmSequenceEnrolIntent;
export function decodeCrmSequenceOriginalWire(operation: "save" | "enrol", targetId: string | null, key: string, wire: string): T.CrmSequenceOriginalIntent {
  originalKey(key);
  if (targetId !== null) uuid(targetId);
  if (typeof wire !== "string" || wire.length === 0 || Buffer.byteLength(wire, "utf8") > 65536) fail("original wire");
  let value: unknown;
  try { value = JSON.parse(wire); } catch { fail("JSON"); }
  uniqueKeys(wire);
  if (operation === "save") {
    const body = object(value, ["expected_version", "definition"]);
    integer(body.expected_version, targetId === null ? 0 : 1);
    if (targetId === null && body.expected_version !== 0) fail("creation CAS");
    definition(body.definition);
    return Object.freeze({ operation, targetId, originalKey: key, originalWire: wire });
  }
  if (operation !== "enrol" || targetId === null) fail("operation target");
  const body = object(value, ["subject_type", "subject_id", "expected_definition_version"]);
  member(body.subject_type, subjects); uuid(body.subject_id); integer(body.expected_definition_version);
  return Object.freeze({ operation, targetId, originalKey: key, originalWire: wire });
}

function common(data: Record<string, unknown>): void {
  uuid(data.id); integer(data.version); text(data.authorization_version);
  if (data.authorization_version.length === 0 || typeof data.sandbox !== "boolean") fail("current context");
}
function fields(value: unknown, kind: "schedule" | "enrolment", original = false): void {
  const allowed = kind === "schedule" ? ["definition", "state", "owner_id", "team_id", "next_due_at", "created_at", "updated_at"] : ["state", "next_due_at", "created_at"];
  const data = object(value, [], original ? allowed.filter((key) => key !== "definition") : allowed);
  for (const [key, item] of Object.entries(data)) {
    if (item === null) continue;
    if (key === "state") member(item, kind === "schedule" ? scheduleStates : enrolmentStates);
    else if (key === "owner_id" || key === "team_id") uuid(item, key === "owner_id");
    else text(item);
  }
}
function schedule(value: unknown, original = false): void {
  const data = object(value, ["id", "version", "authorization_version", "sandbox", "state", "owner_id", "team_id", "fields"]);
  common(data); member(data.state, scheduleStates); uuid(data.owner_id, true); if (data.team_id !== null) uuid(data.team_id); fields(data.fields, "schedule", original);
}
function enrolment(value: unknown, original: boolean): void {
  const commonKeys = ["id", "version", "authorization_version", "sandbox", "sequence_id", "generation", "definition_version", "state", "current_step", "stop_reason"];
  const data = object(value, commonKeys.concat(original ? ["subject_type", "subject_id", "due_at", "fields"] : ["owner_id", "team_id", "next_due_at", "created_at", "updated_at"]));
  common(data); uuid(data.sequence_id); integer(data.generation); integer(data.definition_version); integer(data.current_step, 0); member(data.state, enrolmentStates);
  if (data.stop_reason !== null) member(data.stop_reason, stopReasons);
  if (original) { member(data.subject_type, subjects); uuid(data.subject_id); nullableText(data.due_at); fields(data.fields, "enrolment"); }
  else { uuid(data.owner_id, true); if (data.team_id !== null) uuid(data.team_id); nullableText(data.next_due_at); text(data.created_at); text(data.updated_at); }
}
export function decodeCrmSequenceOriginal(value: unknown, operation: "save"): T.CrmSequenceEnvelope<T.CrmSequenceOriginal>;
export function decodeCrmSequenceOriginal(value: unknown, operation: "enrol"): T.CrmSequenceEnvelope<T.CrmSequenceEnrolmentOriginal>;
export function decodeCrmSequenceOriginal(value: unknown, operation: "save" | "enrol"): T.CrmSequenceEnvelope<T.CrmSequenceOriginal | T.CrmSequenceEnrolmentOriginal> {
  const envelope = object(value, ["data"]);
  if (operation === "save") schedule(envelope.data, true); else enrolment(envelope.data, true);
  return value as T.CrmSequenceEnvelope<T.CrmSequenceOriginal | T.CrmSequenceEnrolmentOriginal>;
}
export function decodeCrmSequenceList(value: unknown, resource: T.CrmSequenceFilters["resource"]): T.CrmSequenceEnvelope<T.CrmSequenceListData> {
  const envelope = object(value, ["data"]);
  const data = object(envelope.data, ["items", "enrolments", "resource", "next_cursor", "visible_count"]);
  if (data.resource !== resource || !Array.isArray(data.items) || !Array.isArray(data.enrolments)) fail("list resource");
  integer(data.visible_count, 0); nullableText(data.next_cursor);
  if (data.next_cursor === "" || (resource === "schedules" && data.enrolments.length !== 0)) fail("list metadata");
  data.items.forEach((item) => schedule(item)); data.enrolments.forEach((item) => enrolment(item, false));
  return value as T.CrmSequenceEnvelope<T.CrmSequenceListData>;
}
function previewResponse(value: unknown): T.CrmSequenceEnvelope<T.CrmSequencePreview> {
  const envelope = object(value, ["data"]);
  const data = object(envelope.data, ["sequence_id", "definition_version", "subject_id", "timezone", "steps"]);
  uuid(data.sequence_id); integer(data.definition_version); uuid(data.subject_id); text(data.timezone);
  if (!Array.isArray(data.steps)) fail("preview steps");
  for (const item of data.steps) {
    const step = object(item, ["step_index", "type", "due_at", "recipe_id"]);
    integer(step.step_index, 0); member(step.type, stepTypes); text(step.due_at); if (step.recipe_id !== null) uuid(step.recipe_id);
  }
  return value as T.CrmSequenceEnvelope<T.CrmSequencePreview>;
}
function filters(parameters: T.CrmSequenceListParameters): string {
  const params = object(parameters, ["filters", "limit"], ["cursor"]);
  integer(params.limit); if (params.limit > 100) fail("limit");
  if (params.cursor !== undefined && (typeof params.cursor !== "string" || !/^[A-Za-z0-9+/=_-]{1,8192}$/.test(params.cursor))) fail("cursor");
  if (!record(params.filters)) fail("filters");
  member(params.filters.resource, ["schedules", "enrolments"]);
  const resource = params.filters.resource;
  const data = object(params.filters, ["resource"], resource === "schedules" ? ["state", "owner_id", "team_id"] : ["state", "owner_id", "team_id", "sequence_id", "definition_version", "stop_reason"]);
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    if (key === "state") member(value, resource === "schedules" ? scheduleStates : enrolmentStates);
    else if (key === "owner_id") uuid(value, true);
    else if (key === "team_id" && value !== null) uuid(value);
    else if (key === "sequence_id") uuid(value);
    else if (key === "definition_version") integer(value);
    else if (key === "stop_reason" && value !== null) member(value, stopReasons);
  }
  return JSON.stringify(data);
}
function readHeaders(config?: CrmSequenceReadConfig, key?: string): Record<string, string> | undefined {
  const headers = Object.fromEntries(Object.entries(config?.headers ?? {}).filter(([name]) => name.toLowerCase() !== "idempotency-key"));
  if (key !== undefined) headers["Idempotency-Key"] = key;
  return Object.keys(headers).length > 0 ? headers : undefined;
}
function path(value: string): string {
  if (typeof value !== "string" || !value.startsWith("/crm/") || /[?#\s\\]/.test(value) || value.includes("..") || value.includes("://")) fail("required v1 path");
  return value;
}

export class CrmSequencePage extends CrmCursorPage<T.CrmSequenceMetadata | T.CrmSequenceEnrolmentMetadata> {
  constructor(readonly payload: T.CrmSequenceListData, requestId: string | null, next: (cursor: string) => Promise<CrmSequencePage>) {
    super(payload.resource === "schedules" ? payload.items : payload.enrolments, payload.next_cursor !== null, payload.next_cursor, requestId, next);
  }
}

/** Native v1 adapter. Route mounting, public exports and deployment remain separate Root composition. */
export class CrmSequencesResource {
  constructor(private readonly client: CrmSequenceNativeTransport, private readonly paths: T.CrmSequenceV1Paths) {
    if (typeof client.requestOriginalJson !== "function") throw new TypeError("Factuarea: the native original JSON transport is required for sequences.");
    const bindings = object(paths, ["list", "originalSave", "originalEnrol", "save", "enrol", "preview", "control"]);
    path(bindings.list as string); path(bindings.originalSave as string); path(bindings.originalEnrol as string);
    for (const operation of ["save", "enrol", "preview", "control"]) {
      if (typeof bindings[operation] !== "function") fail("required route function");
    }
  }
  async list(parameters: T.CrmSequenceListParameters, config?: CrmSequenceReadConfig): Promise<CrmSequencePage> {
    const filterWire = filters(parameters);
    const response = await this.client.request<unknown>({ ...config, method: "GET", autoIdempotency: false, idempotencyKey: undefined, path: path(this.paths.list), headers: readHeaders(config),
      query: { filters: filterWire, cursor: parameters.cursor, limit: parameters.limit } });
    config?.onResponse?.(response);
    const result = decodeCrmSequenceList(response.data, parameters.filters.resource);
    return new CrmSequencePage(result.data, response.requestId, (cursor) => this.list({ ...parameters, cursor }, config));
  }
  async preview(sequenceId: string, parameters: T.CrmSequencePreviewParameters, config?: CrmSequenceReadConfig): Promise<T.CrmSequenceEnvelope<T.CrmSequencePreview>> {
    uuid(sequenceId); const params = object(parameters, ["subject_type", "subject_id", "start_at"]);
    member(params.subject_type, subjects); uuid(params.subject_id); text(params.start_at);
    const response = await this.client.request<unknown>({ ...config, method: "GET", autoIdempotency: false, idempotencyKey: undefined, path: path(this.paths.preview(sequenceId)), query: params, headers: readHeaders(config) });
    config?.onResponse?.(response);
    const result = previewResponse(response.data);
    if (result.data.sequence_id !== sequenceId || result.data.subject_id !== parameters.subject_id) fail("preview identity");
    return result;
  }
  async save(intent: T.CrmSequenceSaveIntent, config?: CrmSequenceMutationConfig): Promise<T.CrmSequenceEnvelope<T.CrmSequenceOriginal>> {
    object(intent, ["operation", "targetId", "originalKey", "originalWire"]); if (intent.operation !== "save") fail("operation");
    const validated = decodeCrmSequenceOriginalWire("save", intent.targetId, intent.originalKey, intent.originalWire);
    return this.originalWrite(validated, path(this.paths.save(validated.targetId)), config) as Promise<T.CrmSequenceEnvelope<T.CrmSequenceOriginal>>;
  }
  async enrol(intent: T.CrmSequenceEnrolIntent, config?: CrmSequenceMutationConfig): Promise<T.CrmSequenceEnvelope<T.CrmSequenceEnrolmentOriginal>> {
    object(intent, ["operation", "targetId", "originalKey", "originalWire"]); if (intent.operation !== "enrol") fail("operation");
    const validated = decodeCrmSequenceOriginalWire("enrol", intent.targetId, intent.originalKey, intent.originalWire);
    return this.originalWrite(validated, path(this.paths.enrol(validated.targetId)), config) as Promise<T.CrmSequenceEnvelope<T.CrmSequenceEnrolmentOriginal>>;
  }
  async originalSave(config: CrmSequenceOriginalReadConfig): Promise<T.CrmSequenceEnvelope<T.CrmSequenceOriginal>> {
    return this.originalRead("save", path(this.paths.originalSave), config) as Promise<T.CrmSequenceEnvelope<T.CrmSequenceOriginal>>;
  }
  async originalEnrol(config: CrmSequenceOriginalReadConfig): Promise<T.CrmSequenceEnvelope<T.CrmSequenceEnrolmentOriginal>> {
    return this.originalRead("enrol", path(this.paths.originalEnrol), config) as Promise<T.CrmSequenceEnvelope<T.CrmSequenceEnrolmentOriginal>>;
  }
  async pause(enrolmentId: string, body: T.CrmSequencePauseBody, config?: CrmSequenceMutationConfig): Promise<void> { await this.control("pause", enrolmentId, body, config); }
  async resume(enrolmentId: string, body: T.CrmSequenceControlBody, config?: CrmSequenceMutationConfig): Promise<void> { await this.control("resume", enrolmentId, body, config); }
  async cancel(enrolmentId: string, body: T.CrmSequenceControlBody, config?: CrmSequenceMutationConfig): Promise<void> { await this.control("cancel", enrolmentId, body, config); }
  private async originalWrite(intent: T.CrmSequenceOriginalIntent, url: string, config?: CrmSequenceMutationConfig): Promise<T.CrmSequenceEnvelope<T.CrmSequenceOriginal | T.CrmSequenceEnrolmentOriginal>> {
    this.beforeDispatch(config);
    let response: ApiResponse<unknown>;
    try {
      response = await this.client.requestOriginalJson<unknown>({ ...config, method: "POST", path: url, rawJsonBody: intent.originalWire,
        headers: readHeaders(config), idempotencyKey: intent.originalKey, maxRetries: 0 });
    } catch (cause) {
      if (this.ambiguous(cause)) throw new CrmSequenceUnconfirmedWriteError(intent, cause);
      throw cause;
    }
    config?.onResponse?.(response);
    try {
      const result = intent.operation === "save" ? decodeCrmSequenceOriginal(response.data, "save") : decodeCrmSequenceOriginal(response.data, "enrol");
      if (intent.operation === "save" && intent.targetId !== null && result.data.id !== intent.targetId) fail("original identity");
      if (intent.operation === "enrol") {
        const sent = JSON.parse(intent.originalWire) as T.CrmSequenceEnrolBody;
        const original = result.data as T.CrmSequenceEnrolmentOriginal;
        if (original.sequence_id !== intent.targetId || original.subject_type !== sent.subject_type || original.subject_id !== sent.subject_id
          || original.definition_version !== sent.expected_definition_version) fail("original subject identity");
      }
      return result;
    } catch (cause) {
      throw new CrmSequenceUnconfirmedWriteError(intent, new ConnectionError({ message: "Factuarea: the original sequence projection could not be read.", code: "crm_receipt_unreadable", requestId: response.requestId, rawResponse: response.data, cause }));
    }
  }
  private async originalRead(operation: "save" | "enrol", url: string, config: CrmSequenceOriginalReadConfig): Promise<T.CrmSequenceEnvelope<T.CrmSequenceOriginal | T.CrmSequenceEnrolmentOriginal>> {
    originalKey(config?.idempotencyKey);
    const response = await this.client.request<unknown>({ ...config, method: "GET", path: url, headers: readHeaders(config, config.idempotencyKey) });
    config.onResponse?.(response);
    try { return operation === "save" ? decodeCrmSequenceOriginal(response.data, "save") : decodeCrmSequenceOriginal(response.data, "enrol"); }
    catch (cause) { throw new ConnectionError({ message: "Factuarea: the original sequence projection could not be read.", code: "crm_receipt_unreadable", requestId: response.requestId, rawResponse: response.data, cause }); }
  }
  private async control(action: "pause" | "resume" | "cancel", enrolmentId: string, body: T.CrmSequencePauseBody | T.CrmSequenceControlBody, config?: CrmSequenceMutationConfig): Promise<void> {
    uuid(enrolmentId); const values = object(body, action === "pause" ? ["expected_version", "reason"] : ["expected_version"]);
    integer(values.expected_version); if (action === "pause" && values.reason !== "manual") fail("reason");
    this.beforeDispatch(config);
    let response: ApiResponse<unknown>;
    try {
      response = await this.client.requestOriginalJson<unknown>({ ...config, method: "PATCH", path: path(this.paths.control(enrolmentId, action)), rawJsonBody: JSON.stringify(values),
        autoIdempotency: false, idempotencyKey: undefined, headers: readHeaders(config), maxRetries: 0 });
    } catch (cause) {
      if (this.ambiguous(cause)) throw new CrmSequenceControlUnconfirmedError(action, enrolmentId, values.expected_version, cause);
      throw cause;
    }
    config?.onResponse?.(response);
    if (response.status !== 204 || response.data !== undefined) throw new CrmSequenceControlUnconfirmedError(action, enrolmentId, values.expected_version,
      new ConnectionError({ message: "Factuarea: incompatible sequence control completion.", code: "crm_sequence_control_unreadable", requestId: response.requestId, rawResponse: response.data }));
  }
  private beforeDispatch(config?: CrmSequenceMutationConfig): void {
    if (config?.signal?.aborted) throw new ConnectionError({ message: "Factuarea: request was cancelled before dispatch.", code: "request_aborted", cause: config.signal.reason });
  }
  private ambiguous(cause: unknown): cause is Error {
    return cause instanceof ConnectionError || cause instanceof ServerError || (cause instanceof Error && cause.name === "AbortError");
  }
}

/** Public factory uses the same configured native client; paths remain explicitly required. */
export function createCrmSequencesResource(client: CrmSequenceNativeTransport, paths: T.CrmSequenceV1Paths): CrmSequencesResource {
  return new CrmSequencesResource(client, paths);
}
