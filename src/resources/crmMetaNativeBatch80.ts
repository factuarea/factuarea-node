import { ApiKeyAuth, BearerAuth, TokenProviderAuth, type AuthStrategy } from "../core/auth.js";

export const META_NATIVE_OPERATION = "crm_connections.configure";
export const META_NATIVE_FINE_SCOPE = "crm_connections:write";
export const META_NATIVE_OAUTH_SCOPE = "crm_connections.write";
export type MetaAction = "prepareOAuth" | "completeOAuth" | "options" | "mapping" | "inspect" | "publishMapping" | "publishConsent";
/** Native Source route names and Root-qualified OpenAPI operationIds. */
export const META_NATIVE_ROUTES = Object.freeze({
  prepareOAuth: { method: "POST", suffix: "/oauth/prepare", routeName: "public-api.v1.crm-meta-oauth.prepare", operationId: "prepareCrmMetaOAuth" },
  completeOAuth: { method: "POST", suffix: "/oauth/complete", routeName: "public-api.v1.crm-meta-oauth.complete", operationId: "completeCrmMetaOAuth" },
  options: { method: "GET", suffix: "/options", routeName: "public-api.v1.crm-meta-options.index", operationId: "listCrmMetaConnectionOptions" },
  mapping: { method: "GET", suffix: "/{connection}/mappings/{form}", routeName: "public-api.v1.crm-meta-mappings.show", operationId: "getCrmMetaMapping" },
  inspect: { method: "POST", suffix: "/{connection}/mappings/{form}/inspect", routeName: "public-api.v1.crm-meta-mappings.inspect", operationId: "inspectCrmMetaMapping" },
  publishMapping: { method: "PUT", suffix: "/{connection}/mappings/{form}", routeName: "public-api.v1.crm-meta-mappings.publish", operationId: "publishCrmMetaMapping" },
  publishConsent: { method: "POST", suffix: "/{connection}/consent", routeName: "public-api.v1.crm-meta-consent.publish", operationId: "publishCrmMetaConsent" },
} as const);
export interface MetaMapping {
  readonly remote_name: string; readonly target: string; readonly type: "text" | "number" | "date" | "boolean" | "select" | "multi";
  readonly field_version: number | null; readonly required: boolean; readonly options: Readonly<Record<string, string>>;
}
export interface MetaGrant { readonly stream: string; readonly actions: readonly ("read" | "ingest")[] }
export interface MetaPrepareInput { readonly page_id: string; readonly confirmed: true }
export interface MetaCompleteInput { readonly state: string; readonly code: string }
export interface MetaInspectInput { readonly credential_uuid: string; readonly remote_form_id: string }
export interface MetaMappingInput extends MetaInspectInput { readonly mapping: readonly MetaMapping[]; readonly expected_mapping_version: number | null; readonly expected_publication_version: number; readonly fields_snapshot_checksum: string; readonly confirmed: true }
export interface MetaConsentInput { readonly credential_uuid: string; readonly grants: readonly MetaGrant[]; readonly expected_consent_version: number | null; readonly confirmed: true }
export interface MetaOAuthPreparation { readonly authorization_url: string; readonly state: string }
export interface MetaOAuthInstallation { readonly status: "credentials_installed"; readonly connection_uuid: string; readonly credential_uuid: string; readonly page_id: string; readonly scopes: readonly string[] }
export interface MetaConnectionOption { readonly connection_uuid: string; readonly credential_uuid: string; readonly page_id: string; readonly page_name: string | null }
export interface MetaMappingPublication { readonly status: "mapping_published"; readonly connection_uuid: string; readonly credential_uuid: string; readonly form_uuid: string; readonly page_id: string; readonly remote_form_id: string; readonly mapping_version: number; readonly publication_version: number; readonly fields_snapshot_checksum: string; readonly mapping: readonly MetaMapping[] }
export interface MetaInspection {
  readonly status: "mapping_inspected"; readonly connection_uuid: string; readonly credential_uuid: string; readonly form_uuid: string;
  readonly page_id: string; readonly remote_form_id: string; readonly app_id: string; readonly responsible_uuid: string;
  readonly remote_field_names: readonly string[]; readonly publication_version: number; readonly authorization_version: number; readonly configuration_version: number;
  readonly fields_snapshot_checksum: string; readonly expected_mapping_version: number | null; readonly expected_consent_version: number | null;
  readonly destination: Readonly<{ basic_fields: readonly string[]; required_basic_fields: readonly string[]; allowed_field_ids: readonly string[]; required_field_ids: readonly string[]; fields_snapshot: Readonly<Record<string, unknown>> }>;
  readonly app_review: Readonly<{ available: false; reason: "app_review_evidence_unavailable" }>;
}
export interface MetaConsentPublication { readonly status: "consent_published"; readonly connection_uuid: string; readonly authorization_uuid: string; readonly consent_version: number; readonly revision: string; readonly grants: readonly MetaGrant[] }
export interface MetaNativeResponse<T> { readonly data: T; readonly rawBody: string; readonly status: number; readonly requestId: string | null }
export interface MetaNativeConfig { apiKey?: string; oauthBearer?: string | (() => string | Promise<string>); baseUrl?: string; factuareaVersion?: string; fetch?: typeof fetch; timeout?: number }
const v7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const credential = /^[0-9a-f]{8}-[0-9a-f]{4}-[47][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const external = /^[1-9][0-9]{0,31}$/;
const checksum = /^[a-f0-9]{64}$/;
const basic = new Set(["name", "email", "phone", "mobile", "company_name", "notes"]);
const reasons = new Set(["invalid_input", "invalid_data", "mapping_conflict", "signature_invalid", "permission_missing", "reauth_required", "rate_limited", "retryable", "unconfirmed", "receipt_missing", "unavailable", "revoked", "resync_required", "provider_not_released"]);
const metaPermissions = ["ads_management", "leads_retrieval", "pages_manage_ads", "pages_manage_metadata", "pages_read_engagement", "pages_show_list"];
const c7Codes = new Set(["crm_context_revoked", "crm_sandbox_blocked", "crm_access_denied", "crm_operation_unavailable", "insufficient_scope", "api_key_revoked"]);
function record(value: unknown): Record<string, unknown> { if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("Invalid native Meta object."); return value as Record<string, unknown>; }
function keys(value: Record<string, unknown>, expected: readonly string[]): void { if (Object.keys(value).length !== expected.length || expected.some(key => !Object.hasOwn(value, key))) throw new TypeError("Invalid native Meta fields."); }
function matches(value: unknown, pattern: RegExp): value is string { return typeof value === "string" && pattern.test(value); }
function text(value: unknown, maximum = 4000): value is string { return typeof value === "string" && [...value].length <= maximum && Buffer.from(value, "utf8").toString("utf8") === value && !/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value); }
function version(value: unknown, nullable = false): boolean { return (nullable && value === null) || (Number.isSafeInteger(value) && Number(value) > 0); }
function strings(value: unknown, ids = false): value is string[] { return Array.isArray(value) && value.every(item => typeof item === "string" && (!ids || v7.test(item))) && new Set(value).size === value.length; }
function mapping(value: unknown): void {
  if (!Array.isArray(value) || value.length < 1 || value.length > 100) throw new TypeError("Invalid native Meta mapping.");
  const remote = new Set<string>(), targets = new Set<string>();
  for (const item of value) {
    const m = record(item); keys(m, ["remote_name", "target", "type", "field_version", "required", "options"]); const opts = record(m.options);
    if (!text(m.remote_name, 100) || m.remote_name.trim() === "" || typeof m.target !== "string" || !["text", "number", "date", "boolean", "select", "multi"].includes(String(m.type)) || typeof m.required !== "boolean" || remote.has(m.remote_name) || targets.has(m.target)) throw new TypeError("Invalid native Meta mapping.");
    if (basic.has(m.target) ? m.type !== "text" || m.field_version !== null || Object.keys(opts).length !== 0 : !v7.test(m.target) || !version(m.field_version)) throw new TypeError("Invalid native Meta mapping destination.");
    if (!["select", "multi"].includes(String(m.type)) && Object.keys(opts).length !== 0) throw new TypeError("Invalid native Meta mapping options.");
    for (const [remoteValue, id] of Object.entries(opts)) if (!text(remoteValue) || remoteValue.trim() === "" || !matches(id, v7)) throw new TypeError("Invalid native Meta mapping option.");
    remote.add(m.remote_name); targets.add(m.target);
  }
}
function grants(value: unknown): void {
  if (!Array.isArray(value) || value.length < 1 || value.length > 100) throw new TypeError("Invalid native Meta grants."); const streams = new Set<string>();
  for (const item of value) { const g = record(item); keys(g, ["stream", "actions"]); if (!matches(g.stream, v7) || streams.has(g.stream) || !strings(g.actions) || g.actions.length < 1 || g.actions.length > 2 || !g.actions.every(a => a === "read" || a === "ingest")) throw new TypeError("Invalid native Meta grant."); streams.add(g.stream); }
}
function input(action: MetaAction, value: unknown): Record<string, unknown> | null {
  if (action === "options" || action === "mapping") { if (value !== undefined) throw new TypeError("This native Meta read has no body/query input."); return null; }
  const p = record(value);
  if (action === "prepareOAuth") { keys(p, ["page_id", "confirmed"]); if (!matches(p.page_id, external) || p.confirmed !== true) throw new TypeError("Choose the actual Page and explicitly confirm OAuth preparation."); }
  else if (action === "completeOAuth") { keys(p, ["state", "code"]); if (!matches(p.state, /^[0-9a-f-]{36}$/) || !text(p.code, 8192) || Buffer.byteLength(p.code,"utf8") > 8192 || !/^[^\x00-\x20\x7f]+$/.test(p.code)) throw new TypeError("Use the actual opaque state and code returned by the human OAuth flow."); }
  else if (action === "inspect") { keys(p, ["credential_uuid", "remote_form_id"]); if (!matches(p.credential_uuid, credential) || !matches(p.remote_form_id, external)) throw new TypeError("Actual credential and remote form are required."); }
  else if (action === "publishMapping") { keys(p, ["credential_uuid", "remote_form_id", "mapping", "expected_mapping_version", "expected_publication_version", "fields_snapshot_checksum", "confirmed"]); if (!matches(p.credential_uuid, credential) || !matches(p.remote_form_id, external) || !version(p.expected_mapping_version, true) || !version(p.expected_publication_version) || !matches(p.fields_snapshot_checksum, checksum) || p.confirmed !== true) throw new TypeError("Mapping publication requires actual CAS/checksum and independent human confirmation."); mapping(p.mapping); }
  else { keys(p, ["credential_uuid", "grants", "expected_consent_version", "confirmed"]); if (!matches(p.credential_uuid, credential) || !version(p.expected_consent_version, true) || p.confirmed !== true) throw new TypeError("Consent requires actual CAS and independent human confirmation."); grants(p.grants); }
  return p;
}
function deepFreeze<T>(value: T): T { if (value && typeof value === "object") { for (const item of Object.values(value)) deepFreeze(item); Object.freeze(value); } return value; }
function projection(action: MetaAction, wire: unknown, connection?: string, form?: string, request?: Record<string, unknown> | null): unknown {
  const root = record(wire); let p: Record<string, unknown>;
  if (action === "prepareOAuth" || action === "completeOAuth") p = root; else { keys(root, ["data"]); p = record(root.data); }
  if (action === "prepareOAuth") { keys(p, ["authorization_url", "state"]); if (typeof p.authorization_url !== "string" || !matches(p.state, /^[0-9a-f-]{36}$/)) throw new TypeError("Invalid native OAuth preparation."); let url: URL; try { url = new URL(p.authorization_url); } catch { throw new TypeError("Invalid native OAuth URL."); } if (url.protocol !== "https:" || url.username || url.password) throw new TypeError("Invalid native OAuth URL."); }
  else if (action === "completeOAuth") { keys(p, ["status", "connection_uuid", "credential_uuid", "page_id", "scopes"]); if (p.status !== "credentials_installed" || !matches(p.connection_uuid, v7) || !matches(p.credential_uuid, credential) || !matches(p.page_id, external) || !strings(p.scopes) || p.scopes.length > 100 || p.scopes.some(s => !/^[a-z][a-z0-9_]{0,99}$/.test(s)) || metaPermissions.some(s => !(p.scopes as string[]).includes(s))) throw new TypeError("Invalid native credential installation receipt."); }
  else if (action === "options") { keys(p, ["options"]); if (!Array.isArray(p.options)) throw new TypeError("Invalid native Meta options."); for (const option of p.options) { const o = record(option); keys(o, ["connection_uuid", "credential_uuid", "page_id", "page_name"]); if (!matches(o.connection_uuid, v7) || !matches(o.credential_uuid, credential) || !matches(o.page_id, external) || (o.page_name !== null && !text(o.page_name))) throw new TypeError("Invalid native Meta option."); } }
  else if (action === "mapping" || action === "publishMapping") {
    keys(p, ["status", "connection_uuid", "credential_uuid", "form_uuid", "page_id", "remote_form_id", "mapping_version", "publication_version", "fields_snapshot_checksum", "mapping"]);
    if (p.status !== "mapping_published" || !version(p.mapping_version) || !version(p.publication_version) || !matches(p.fields_snapshot_checksum, checksum)) throw new TypeError("Invalid native mapping projection."); mapping(p.mapping);
    if (request && (p.publication_version !== request.expected_publication_version || p.fields_snapshot_checksum !== request.fields_snapshot_checksum || JSON.stringify((p.mapping as MetaMapping[]).map(m => [m.remote_name,m.target,m.type,m.field_version,m.required,Object.entries(m.options)])) !== JSON.stringify((request.mapping as MetaMapping[]).map(m => [m.remote_name,m.target,m.type,m.field_version,m.required,Object.entries(m.options)])))) throw new TypeError("Native mapping projection changed the confirmed publication.");
  } else if (action === "inspect") {
    keys(p, ["status", "connection_uuid", "credential_uuid", "form_uuid", "page_id", "remote_form_id", "app_id", "responsible_uuid", "remote_field_names", "publication_version", "authorization_version", "configuration_version", "fields_snapshot_checksum", "expected_mapping_version", "expected_consent_version", "destination", "app_review"]);
    if (p.status !== "mapping_inspected" || !matches(p.app_id, external) || !matches(p.responsible_uuid, credential) || !strings(p.remote_field_names) || !version(p.publication_version) || !version(p.authorization_version) || !version(p.configuration_version) || !matches(p.fields_snapshot_checksum, checksum) || !version(p.expected_mapping_version, true) || !version(p.expected_consent_version, true)) throw new TypeError("Invalid native mapping inspection.");
    const d = record(p.destination); keys(d, ["basic_fields", "required_basic_fields", "allowed_field_ids", "required_field_ids", "fields_snapshot"]); if (!strings(d.basic_fields) || !strings(d.required_basic_fields) || !strings(d.allowed_field_ids, true) || !strings(d.required_field_ids, true)) throw new TypeError("Invalid native Fields destination."); record(d.fields_snapshot);
    const review = record(p.app_review); keys(review, ["available", "reason"]); if (review.available !== false || review.reason !== "app_review_evidence_unavailable") throw new TypeError("Metadata cannot issue external App Review approval.");
  } else {
    keys(p, ["status", "connection_uuid", "authorization_uuid", "consent_version", "revision", "grants"]); if (p.status !== "consent_published" || !matches(p.authorization_uuid, credential) || !version(p.consent_version) || !text(p.revision) || p.revision === "") throw new TypeError("Invalid native consent receipt."); grants(p.grants); if (request && JSON.stringify((p.grants as MetaGrant[]).map(g => [g.stream,g.actions])) !== JSON.stringify((request.grants as MetaGrant[]).map(g => [g.stream,g.actions]))) throw new TypeError("Native consent changed the confirmed grants.");
  }
  if (connection !== undefined && p.connection_uuid !== connection) throw new TypeError("Native connection identity changed.");
  if (form !== undefined && p.form_uuid !== form) throw new TypeError("Native form identity changed.");
  if (connection !== undefined && action !== "publishConsent" && (!matches(p.credential_uuid, credential) || !matches(p.page_id, external) || !matches(p.remote_form_id, external))) throw new TypeError("Invalid native binding.");
  if (request && Object.hasOwn(request, "credential_uuid") && action !== "publishConsent" && p.credential_uuid !== request.credential_uuid) throw new TypeError("Native credential identity changed.");
  if (request && Object.hasOwn(request, "remote_form_id") && p.remote_form_id !== request.remote_form_id) throw new TypeError("Native remote form identity changed.");
  return deepFreeze(wire);
}
export class MetaNativeError extends Error {
  constructor(readonly status: number | null, readonly reason: string, readonly requestId: string | null = null, readonly retryAfter: number | null = null, readonly unconfirmed = false) { super(`Native Meta request failed: ${reason}.`); this.name = "MetaNativeError"; }
}

/** Human-only native Meta client. No retries, callback generation, review approval or automatic follow-up command. */
export class CrmMetaNativeBatch80 {
  readonly #auth: AuthStrategy; readonly #base: string; readonly #fetch: typeof fetch; readonly #version?: string; readonly #timeout: number;
  constructor(config: MetaNativeConfig) {
    if (config.oauthBearer !== undefined) { if (config.apiKey !== undefined) throw new TypeError("Choose one actual native authentication source."); this.#auth = typeof config.oauthBearer === "string" ? new BearerAuth(config.oauthBearer) : new TokenProviderAuth(config.oauthBearer); }
    else { if (typeof config.apiKey !== "string" || !/^fact_(test|live)_[\x21-\x7e]+$/.test(config.apiKey)) throw new TypeError("An actual API key or native OAuth bearer is required."); this.#auth = new ApiKeyAuth(config.apiKey); }
    const base = new URL(config.baseUrl ?? "https://api.factuarea.com/v1"); if (!["https:", "http:"].includes(base.protocol) || base.username || base.password || base.search || base.hash) throw new TypeError("Invalid native API server.");
    this.#base = base.toString().replace(/\/+$/, ""); this.#fetch = config.fetch ?? globalThis.fetch; this.#version = config.factuareaVersion; this.#timeout = config.timeout ?? 60000;
    if (this.#version !== undefined && !/^\d{4}-\d\d-\d\d$/.test(this.#version)) throw new TypeError("Invalid API version.");
    if (!Number.isFinite(this.#timeout) || this.#timeout <= 0) throw new TypeError("Invalid native request timeout.");
  }
  prepareCrmMetaOAuth(body: MetaPrepareInput, signal?: AbortSignal): Promise<MetaNativeResponse<MetaOAuthPreparation>> { return this.#call("prepareOAuth", body, undefined, undefined, signal); }
  completeCrmMetaOAuth(body: MetaCompleteInput, signal?: AbortSignal): Promise<MetaNativeResponse<MetaOAuthInstallation>> { return this.#call("completeOAuth", body, undefined, undefined, signal); }
  listCrmMetaConnectionOptions(signal?: AbortSignal): Promise<MetaNativeResponse<{ data: { options: readonly MetaConnectionOption[] } }>> { return this.#call("options", undefined, undefined, undefined, signal); }
  getCrmMetaMapping(connection: string, form: string, signal?: AbortSignal): Promise<MetaNativeResponse<{ data: MetaMappingPublication }>> { return this.#call("mapping", undefined, connection, form, signal); }
  inspectCrmMetaMapping(connection: string, form: string, body: MetaInspectInput, signal?: AbortSignal): Promise<MetaNativeResponse<{ data: MetaInspection }>> { return this.#call("inspect", body, connection, form, signal); }
  publishCrmMetaMapping(connection: string, form: string, body: MetaMappingInput, signal?: AbortSignal): Promise<MetaNativeResponse<{ data: MetaMappingPublication }>> { return this.#call("publishMapping", body, connection, form, signal); }
  publishCrmMetaConsent(connection: string, body: MetaConsentInput, signal?: AbortSignal): Promise<MetaNativeResponse<{ data: MetaConsentPublication }>> { return this.#call("publishConsent", body, connection, undefined, signal); }
  async #call<T>(action: MetaAction, body: unknown, connection?: string, form?: string, signal?: AbortSignal): Promise<MetaNativeResponse<T>> {
    if ((connection !== undefined && !v7.test(connection)) || (form !== undefined && !v7.test(form))) throw new TypeError("Actual native lowercase connection/form UUIDv7 are required.");
    const validated = input(action, body); const raw = validated === null ? undefined : JSON.stringify(validated); if (raw !== undefined && Buffer.byteLength(raw, "utf8") > 1048576) throw new TypeError("Native Meta input is too large.");
    // Capture human choices before an asynchronous token provider can yield to the caller.
    const retained = raw === undefined ? null : record(JSON.parse(raw)); const route = META_NATIVE_ROUTES[action]; const mutating = action !== "options" && action !== "mapping" && action !== "inspect"; const path = "/crm/connections/meta-lead-ads" + route.suffix.replace("{connection}", connection ?? "").replace("{form}", form ?? "");
    input(action, retained === null ? undefined : retained);
    if (signal?.aborted) throw new MetaNativeError(null, "cancelled");
    let auth: Record<string,string>; try { auth = await this.#auth.headers(); } catch { throw new MetaNativeError(null,"credential_unavailable"); } if (signal?.aborted) throw new MetaNativeError(null,"cancelled"); const headers = new Headers({ Accept: "application/json", ...auth }); if (raw !== undefined) headers.set("Content-Type", "application/json"); if (this.#version) headers.set("Factuarea-Version", this.#version);
    const controller = new AbortController(); const abort = () => controller.abort(); signal?.addEventListener("abort", abort, { once: true }); const timer = setTimeout(abort, this.#timeout); let requestId: string | null = null;
    try {
      const response = await this.#fetch(this.#base + path, { method: route.method, headers, body: raw, signal: controller.signal, redirect: "error" }); requestId = response.headers.get("X-Request-Id"); const rawBody = await response.text();
      let wire: unknown; try { if (Buffer.byteLength(rawBody,"utf8") > 1048576) throw new TypeError(); wire = JSON.parse(rawBody); } catch { throw new MetaNativeError(response.status, "invalid_native_response", requestId, null, mutating); }
      if (response.status !== 200) {
        const e = wire && typeof wire === "object" && !Array.isArray(wire) ? record(wire) : {}; let reason = "native_rejection"; if (typeof e.error === "string") { const candidate = e.error.startsWith("meta_oauth_") ? e.error.slice(11) : e.error; if (reasons.has(candidate)) reason = candidate; }
        else if (e.error && typeof e.error === "object") { const code = record(e.error).code; if (typeof code === "string" && c7Codes.has(code)) reason = code; }
        const after = response.headers.get("Retry-After"); const retryAfter = after && /^\d+$/.test(after) ? Number(after) : null;
        throw new MetaNativeError(response.status, reason, requestId, retryAfter, reason === "unconfirmed" || (mutating && response.status >= 500 && reason === "native_rejection"));
      }
      if (!/^application\/json(?:\s*;|$)/i.test(response.headers.get("Content-Type") ?? "") || response.headers.has("Location")) throw new MetaNativeError(200, "invalid_native_response", requestId, null, mutating);
      try { projection(action, wire, connection, form, retained); } catch { throw new MetaNativeError(200, "invalid_native_response", requestId, null, mutating); }
      return { data: wire as T, rawBody, status: response.status, requestId };
    } catch (error) { if (error instanceof MetaNativeError) throw error; throw new MetaNativeError(null, mutating ? "unconfirmed" : "transport_failure", requestId, null, mutating); }
    finally { clearTimeout(timer); signal?.removeEventListener("abort", abort); }
  }
}
