import { ConnectionError, FactuareaError } from "../../core/errors.js";
import { RequestContextChangedError, type ApiResponse, type HttpClient } from "../../core/http-client.js";
import { CrmOriginalIntent } from "../oauth-originals/intent.js";
import type { CrmOriginalOperation } from "../oauth-originals/types.js";
import { CrmCommercialContractError, CrmCommercialWriteUnconfirmedError } from "./errors.js";
import * as c from "./codecs.js";
import type { CrmActivityCreate, CrmCallOptions, CrmLead, CrmLeadCreate, CrmLeadListParams, CrmOpportunityCreate, CrmOpportunityStage, CrmUuid } from "./types.js";
const owners = new WeakMap<CrmOriginalIntent, { client: HttpClient; frame: string }>();
const sent = new WeakSet<CrmOriginalIntent>();
const writePaths: Record<CrmOriginalOperation, string> = { leadCreate: "/crm/leads", opportunityCreate: "/crm/opportunity", opportunityStage: "/crm/opportunity/{opportunity}/stage", activityCreate: "/crm/crmactivity" };
function invalid(): never { throw new CrmCommercialContractError("Invalid native CRM commercial request."); }
function callOptions(options: CrmCallOptions): CrmCallOptions { const d = c.object(options); c.keys(d, ["signal", "timeout"]); if (d.timeout !== undefined) c.version(d.timeout); if (d.signal !== undefined && !(d.signal instanceof AbortSignal)) invalid(); return { ...options }; }
function optionalUuid(d: Record<string, unknown>, names: string[]): void { for (const k of names) if (Object.hasOwn(d, k)) c.uuid(d[k], true, k === "owner_id"); }
function leadPayload(input: CrmLeadCreate): void {
  const d = c.object(input); c.keys(d, ["id", "name", "email", "phone", "mobile", "company_name", "notes", "source", "owner_id", "team_id", "address", "metadata", "estimated_value", "typed_fields"]); c.json(d);
  for (const [k, max] of Object.entries({ name: 255, email: 191, phone: 30, mobile: 30, company_name: 255, notes: 5000 })) if (Object.hasOwn(d, k)) c.text(d[k], max, true);
  if (![d.name, d.email, d.phone, d.mobile].some(v => typeof v === "string" && v.trim() !== "")) invalid();
  if (Object.hasOwn(d, "id")) c.uuid(d.id); if (Object.hasOwn(d, "source")) c.oneOf(d.source, ["manual"]); optionalUuid(d, ["owner_id", "team_id"]);
  if (Object.hasOwn(d, "address") && d.address !== null) {
    const address = c.object(d.address), sizes = { line_1: 255, line_2: 255, number: 30, floor: 30, door: 30, staircase: 30, city: 100, province: 100, postal_code: 20, country_code: 2, locality_key: 700 };
    c.keys(address, [...Object.keys(sizes), "create_locality"]); for (const [k, max] of Object.entries(sizes)) if (Object.hasOwn(address, k)) c.text(address[k], max, true);
    if (Object.hasOwn(address, "create_locality")) c.oneOf(address.create_locality, [true, false]);
  }
  if (Object.hasOwn(d, "metadata")) { const m = c.object(d.metadata); if (Object.keys(m).length > 50) invalid(); for (const [k, v] of Object.entries(m)) { c.text(k, 100); if (v !== null && !["string", "number", "boolean"].includes(typeof v)) invalid(); } }
  if (Object.hasOwn(d, "estimated_value") && d.estimated_value !== null) { const m = c.object(d.estimated_value); c.keys(m, ["amount", "currency"], ["amount", "currency"]); c.crmEstimatedValueDecimal(m.amount as string); currency(m.currency); }
  if (Object.hasOwn(d, "typed_fields")) { const t = c.object(d.typed_fields); c.keys(t, ["expected_definition_version", "values"], ["expected_definition_version", "values"]); c.version(t.expected_definition_version, 0); const v = c.object(t.values); c.keys(v, ["value_version", "values"], ["value_version", "values"]); c.version(v.value_version, 0); if (!Array.isArray(v.values) || v.values.length > 100) invalid(); for (const raw of v.values) { const row = c.object(raw); c.keys(row, ["field_id", "field_version", "value"], ["field_id", "field_version", "value"]); c.uuid(row.field_id); c.version(row.field_version); if (!(row.value === null || typeof row.value === "boolean" || typeof row.value === "string" || Array.isArray(row.value) && row.value.every(x => typeof x === "string"))) invalid(); } }
}
function currency(v: unknown): void { if (typeof v !== "string" || !/^[A-Z]{3}$/.test(v)) invalid(); }
function opportunityPayload(input: CrmOpportunityCreate): void { const d = c.object(input); c.keys(d, ["title", "lead_id", "contact_id", "pipeline_id", "stage_id", "amount", "currency", "owner_id", "team_id"], ["title", "pipeline_id", "stage_id", "amount", "currency"]); c.json(d); c.text(d.title, 255); if (typeof d.title !== "string" || !d.title.trim() || d.lead_id == null && d.contact_id == null) invalid(); c.uuid(d.pipeline_id); c.uuid(d.stage_id); optionalUuid(d, ["lead_id", "contact_id", "owner_id", "team_id"]); c.crmDecimal(d.amount as string); currency(d.currency); }
function stagePayload(input: CrmOpportunityStage): void { const d = c.object(input); c.keys(d, ["expected_version", "target_pipeline_id", "target_stage_id", "expected_definition_version"], ["expected_version", "target_pipeline_id", "target_stage_id", "expected_definition_version"]); c.json(d); c.version(d.expected_version); c.version(d.expected_definition_version, 0); c.uuid(d.target_pipeline_id); c.uuid(d.target_stage_id); }
function activityPayload(input: CrmActivityCreate): void { const d = c.object(input); c.keys(d, ["type", "title", "body", "target", "owner_id", "due_at", "timezone"], ["type", "title", "target", "timezone"]); c.json(d); c.oneOf(d.type, ["task", "call", "meeting", "note"]); c.text(d.title, 255); if (typeof d.title !== "string" || !d.title.trim()) invalid(); if (Object.hasOwn(d, "body")) c.text(d.body, 65535, true); optionalUuid(d, ["owner_id"]); if (Object.hasOwn(d, "due_at")) c.timestamp(d.due_at, true); c.text(d.timezone, 100); try { new Intl.DateTimeFormat("en", { timeZone: d.timezone as string }); } catch { invalid(); } const target = c.object(d.target); c.keys(target, ["type", "id"], ["type", "id"]); c.oneOf(target.type, ["contact", "person", "lead", "opportunity", "booking"]); c.uuid(target.id); }
function query(input: CrmLeadListParams): Record<string, unknown> { const d = c.object(input); c.keys(d, ["cursor", "limit", "search", "sort", "filters"]); c.json(d); if (Object.hasOwn(d, "cursor")) { c.text(d.cursor, 4096); if (d.cursor === "") invalid(); } if (Object.hasOwn(d, "limit")) { c.version(d.limit); if (Number(d.limit) > 100) invalid(); } if (Object.hasOwn(d, "search")) c.text(d.search, 255); if (Object.hasOwn(d, "sort")) c.oneOf(d.sort, ["uuid", "-uuid", "created_at", "-created_at", "updated_at", "-updated_at", "score", "-score"]); const result = { ...d }; if (Object.hasOwn(d, "filters")) { c.object(d.filters); result.filters = JSON.stringify(d.filters); if (Buffer.byteLength(result.filters as string) > 65536) invalid(); } return c.freeze(result); }

/** Native commercial operations, composed into the existing Factuarea client. Current C7 authority remains server-owned. */
export class CrmCommercialResource {
  constructor(private readonly http: HttpClient) {}
  private prepare(operation: CrmOriginalOperation, key: string, input: unknown, validate: (value: never) => void, opportunity?: CrmUuid): CrmOriginalIntent { c.json(input); const wire = JSON.stringify(input); if (Buffer.byteLength(wire) > 65536) invalid(); validate(JSON.parse(wire) as never); const intent = CrmOriginalIntent.capture(operation, key, wire, opportunity); owners.set(intent, { client: this.http, frame: this.http.requestFrameFingerprint() }); return intent; }
  prepareLeadCreate(key: string, input: CrmLeadCreate): CrmOriginalIntent { return this.prepare("leadCreate", key, input, leadPayload); }
  prepareOpportunityCreate(key: string, input: CrmOpportunityCreate): CrmOriginalIntent { return this.prepare("opportunityCreate", key, input, opportunityPayload); }
  prepareOpportunityStage(opportunity: CrmUuid, key: string, input: CrmOpportunityStage): CrmOriginalIntent { c.uuid(opportunity); return this.prepare("opportunityStage", key, input, stagePayload, opportunity); }
  prepareActivityCreate(key: string, input: CrmActivityCreate): CrmOriginalIntent { return this.prepare("activityCreate", key, input, activityPayload); }
  createLead(intent: CrmOriginalIntent, options: CrmCallOptions = {}) { return this.write("leadCreate", intent, c.decodeLeadResult, options); }
  createOpportunity(intent: CrmOriginalIntent, options: CrmCallOptions = {}) { return this.write("opportunityCreate", intent, c.decodeOpportunity, options); }
  moveOpportunityStage(intent: CrmOriginalIntent, options: CrmCallOptions = {}) { return this.write("opportunityStage", intent, c.decodeOpportunity, options); }
  createActivity(intent: CrmOriginalIntent, options: CrmCallOptions = {}) { return this.write("activityCreate", intent, c.decodeActivityWrite, options); }
  private async write<T>(operation: CrmOriginalOperation, intent: CrmOriginalIntent, decode: (v: unknown) => T, options: CrmCallOptions): Promise<ApiResponse<{ data: T }>> {
    options = callOptions(options);
    const owner = owners.get(intent);
    if (!(intent instanceof CrmOriginalIntent) || intent.operation !== operation || owner?.client !== this.http || sent.has(intent)) throw new TypeError("Use an unsent intent prepared by this client; a dispatched intent permits original GET recovery only.");
    if (owner.frame !== this.http.requestFrameFingerprint()) throw new RequestContextChangedError("Factuarea: retained CRM intent requires its original request context.");
    if (options.signal?.aborted) throw new ConnectionError({ message: "CRM request cancelled before dispatch." });
    sent.add(intent);
    const path = operation === "opportunityStage" ? intent.path.replace(/\/original$/, "") : writePaths[operation];
    let response: ApiResponse<unknown> | undefined;
    try { response = await this.http.request<unknown>({ method: "POST", path, rawBody: intent.firstBody, idempotencyKey: intent.idempotencyKey, frameFingerprint: owner.frame, ...options, maxRetries: 0, noRedirects: true }); return { ...response, data: { data: decode(response.data) } }; }
    catch (error) { if (error instanceof RequestContextChangedError || error instanceof FactuareaError && !(error instanceof ConnectionError) && (error.status ?? 500) < 500 && error.code !== "crm_original_unconfirmed" && !error.code?.endsWith("_unconfirmed")) throw error; throw new CrmCommercialWriteUnconfirmedError(intent, error instanceof FactuareaError ? error.status : response?.status, error instanceof FactuareaError ? error.requestId : response?.requestId); }
  }
  async getLead(id: CrmUuid, options: CrmCallOptions = {}) { c.uuid(id); const response = await this.read(`/crm/leads/${id}`, {}, c.decodeLeadDetail, options); if (response.data.data.id !== id) invalid(); return response; }
  async getOpportunity(id: CrmUuid, options: CrmCallOptions = {}) { c.uuid(id); const response = await this.read(`/crm/opportunity/${id}`, {}, c.decodeOpportunityDetail, options); if (response.data.data !== null && response.data.data.id !== id) invalid(); return response; }
  async getActivity(id: CrmUuid, options: CrmCallOptions = {}) { c.uuid(id); const response = await this.read(`/crm/crmactivity/${id}`, {}, c.decodeActivityDetail, options); if (response.data.data.activity !== null && response.data.data.activity.id !== id) invalid(); return response; }
  listLeads(params: CrmLeadListParams = {}, options: CrmCallOptions = {}) { return this.read("/crm/leads", query(params), c.decodeLeadList, options); }
  /** Query and current client are captured when this iterator is created. Every page rechecks current auth. */
  iterateLeads(params: CrmLeadListParams = {}, options: CrmCallOptions = {}, maxPages = 1000): AsyncGenerator<CrmLead> {
    const initial = query(params), retainedOptions = callOptions(options); c.version(maxPages); const read = this.read.bind(this);
    return (async function* () { let wire = { ...initial }; const cursors = new Set<unknown>(wire.cursor === undefined ? [] : [wire.cursor]); for (let i = 0; i < maxPages; i++) { const page = (await read("/crm/leads", wire, c.decodeLeadList, retainedOptions)).data.data; yield* page.data; if (!page.has_more) return; if (cursors.has(page.next_cursor)) throw new CrmCommercialContractError("CRM cursor pagination repeated a cursor."); cursors.add(page.next_cursor); wire = { ...initial, cursor: page.next_cursor }; } throw new CrmCommercialContractError("CRM cursor pagination reached its explicit page limit."); })();
  }
  private async read<T>(path: string, query: Record<string, unknown>, decode: (v: unknown) => T, options: CrmCallOptions): Promise<ApiResponse<{ data: T }>> { const response = await this.http.request<unknown>({ method: "GET", path, query, ...callOptions(options), maxRetries: 0, noRedirects: true }); return { ...response, data: { data: decode(response.data) } }; }
}
