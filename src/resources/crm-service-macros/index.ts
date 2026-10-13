import type { ApiResponse, HttpClient } from "../../core/http-client.js";
import { ConnectionError, FactuareaError, ServerError } from "../../core/errors.js";
import { CrmUnconfirmedWriteError } from "../../crm/errors.js";
import { CrmNumberPage } from "../../crm/pagination.js";
import type { CrmRequestConfig } from "../../crm/resource.js";
import { decodeCrmServiceMacroList, decodeCrmServiceMacroOriginal, decodeCrmServiceMacroRender, decodeCrmServiceMacroUsage,
  serviceMacroId, serviceMacroIntentBody, serviceMacroPageQuery, serviceMacroPath, serviceMacroRenderBody,
  validateCrmServiceMacroIntent, validateCrmServiceMacrosPaths } from "./codec.js";
import type * as T from "./types.js";

export type CrmServiceMacrosNativeTransport = Pick<HttpClient, "request">;
export type CrmServiceMacrosConfig = Omit<CrmRequestConfig, "idempotencyKey" | "maxRetries">;
export class CrmServiceMacroUnconfirmedWriteError extends CrmUnconfirmedWriteError {
  constructor(readonly originalIntent: T.CrmServiceMacroIntent, cause: Error) { super(`customer_service.${originalIntent.operation}_macro`, originalIntent.originalKey, cause); }
}
export class CrmServiceMacroPage extends CrmNumberPage<T.CrmServiceMacroView> {
  constructor(readonly payload: T.CrmServiceMacroList, requestId: string | null, next: (page: number) => Promise<CrmServiceMacroPage>) {
    super(payload.items, { total: payload.total, current_page: payload.page, per_page: payload.per_page }, requestId, next);
  }
}
export class CrmServiceMacroUsagePage extends CrmNumberPage<T.CrmServiceMacroUsageReceipt> {
  constructor(readonly payload: T.CrmServiceMacroUsage, requestId: string | null, next: (page: number) => Promise<CrmServiceMacroUsagePage>) {
    super(payload.receipts, { total: payload.count, current_page: payload.page, per_page: payload.per_page }, requestId, next);
  }
}
function headers(config?: CrmServiceMacrosConfig): Record<string, string> | undefined {
  const data = Object.fromEntries(Object.entries(config?.headers ?? {}).filter(([name]) => !["idempotency-key", "content-type"].includes(name.toLowerCase())));
  return Object.keys(data).length === 0 ? undefined : data;
}
function beforeDispatch(config?: CrmServiceMacrosConfig): void {
  if (config?.signal?.aborted) throw new ConnectionError({ message: "Factuarea: request was cancelled before dispatch.", code: "request_aborted", cause: config.signal.reason });
}
function unreadable(response: ApiResponse<unknown>, cause: unknown): ConnectionError {
  return new ConnectionError({ message: "Factuarea: the native ServiceMacro projection could not be read.", code: "crm_service_macro_projection_unreadable", requestId: response.requestId, rawResponse: response.data, cause });
}
function sameId(left: string | null, right: string | null): boolean { return left?.toLowerCase() === right?.toLowerCase(); }
/** Native ten-operation consumer; rendering and original GETs never dispatch writes or infer delivery. */
export class CrmServiceMacrosResource {
  constructor(private readonly client: CrmServiceMacrosNativeTransport, private readonly paths: T.CrmServiceMacrosV1Paths) {
    if (typeof client?.request !== "function") throw new TypeError("Factuarea: the configured native ServiceMacro HTTP client is required.");
    validateCrmServiceMacrosPaths(paths);
  }
  async listServiceMacros(parameters: T.CrmServiceMacroPageParameters = {}, config?: CrmServiceMacrosConfig): Promise<CrmServiceMacroPage> {
    const query = serviceMacroPageQuery(parameters); const response = await this.query(serviceMacroPath(this.paths.listServiceMacros), query, config);
    const result = this.project(response, () => { const result = decodeCrmServiceMacroList(response.data); this.pageBinding(result.data, query); return result; });
    return new CrmServiceMacroPage(result.data, response.requestId, (page) => this.listServiceMacros({ ...query, page, per_page: result.data.per_page }, config));
  }
  async getServiceMacroUsage(id: string, parameters: T.CrmServiceMacroPageParameters = {}, config?: CrmServiceMacrosConfig): Promise<CrmServiceMacroUsagePage> {
    serviceMacroId(id); const query = serviceMacroPageQuery(parameters); const response = await this.query(serviceMacroPath(this.paths.getServiceMacroUsage(id)), query, config);
    const result = this.project(response, () => { const result = decodeCrmServiceMacroUsage(response.data); this.pageBinding(result.data, query);
      if (!sameId(result.data.macro_id, id)) throw new TypeError("Factuarea: incompatible ServiceMacro usage target."); return result; });
    return new CrmServiceMacroUsagePage(result.data, response.requestId, (page) => this.getServiceMacroUsage(id, { ...query, page, per_page: result.data.per_page }, config));
  }
  async renderServiceMacro(id: string, body: T.CrmServiceMacroRenderBody, config?: CrmServiceMacrosConfig): Promise<T.CrmServiceMacroEnvelope<T.CrmServiceMacroRender>> {
    serviceMacroId(id); const input = serviceMacroRenderBody(body); beforeDispatch(config);
    const rawJsonBody = JSON.stringify(input); if (Buffer.byteLength(rawJsonBody) > 250000) throw new TypeError("Factuarea: incompatible ServiceMacro render body size.");
    const response = await this.client.request<unknown>({ ...config, method: "POST", path: serviceMacroPath(this.paths.renderServiceMacro(id)),
      rawJsonBody, body: undefined, query: undefined, formData: undefined, idempotencyKey: undefined, autoIdempotency: false, maxRetries: 0, headers: headers(config) });
    config?.onResponse?.(response);
    return this.project(response, () => { const result = decodeCrmServiceMacroRender(response.data); const data = result.data;
      if (!sameId(data.macro_id, id) || data.macro_version !== input.macro_version || !sameId(data.ticket_id, input.ticket_id)
        || data.ticket_version !== input.ticket_version || !sameId(data.recipient_id, input.recipient_id ?? null) || data.locale !== input.locale
        || (input.selected_actions !== undefined && input.selected_actions !== null && Object.keys(data.actions).some((key) => !input.selected_actions!.includes(key as T.CrmServiceMacroAction)))) throw new TypeError("Factuarea: incompatible ServiceMacro render selector.");
      return result; });
  }
  async saveServiceMacro(intent: T.CrmServiceMacroSaveIntent, config?: CrmServiceMacrosConfig): Promise<T.CrmServiceMacroEnvelope<T.CrmServiceMacroOriginal>> {
    const original = validateCrmServiceMacroIntent(intent); if (original.operation !== "save") throw new TypeError("Factuarea: save requires the original save intent.");
    return this.write(original, original.targetId === null ? serviceMacroPath(this.paths.createServiceMacro) : serviceMacroPath(this.paths.updateServiceMacro(original.targetId)), config);
  }
  async archiveServiceMacro(intent: T.CrmServiceMacroArchiveIntent, config?: CrmServiceMacrosConfig): Promise<T.CrmServiceMacroEnvelope<T.CrmServiceMacroOriginal>> {
    const original = validateCrmServiceMacroIntent(intent); if (original.operation !== "archive" || original.targetId === null) throw new TypeError("Factuarea: archive requires the original archive intent.");
    return this.write(original, serviceMacroPath(this.paths.archiveServiceMacro(original.targetId)), config);
  }
  async applyServiceMacro(intent: T.CrmServiceMacroApplyIntent, config?: CrmServiceMacrosConfig): Promise<T.CrmServiceMacroEnvelope<T.CrmServiceMacroOriginal>> {
    const original = validateCrmServiceMacroIntent(intent); if (original.operation !== "apply" || original.targetId === null) throw new TypeError("Factuarea: apply requires the original apply intent.");
    return this.write(original, serviceMacroPath(this.paths.applyServiceMacro(original.targetId)), config);
  }
  async getSaveServiceMacroOriginal(intent: T.CrmServiceMacroSaveIntent, config?: CrmServiceMacrosConfig): Promise<T.CrmServiceMacroEnvelope<T.CrmServiceMacroOriginal>> { return this.original(intent, "save", config); }
  async getArchiveServiceMacroOriginal(intent: T.CrmServiceMacroArchiveIntent, config?: CrmServiceMacrosConfig): Promise<T.CrmServiceMacroEnvelope<T.CrmServiceMacroOriginal>> { return this.original(intent, "archive", config); }
  async getApplyServiceMacroOriginal(intent: T.CrmServiceMacroApplyIntent, config?: CrmServiceMacrosConfig): Promise<T.CrmServiceMacroEnvelope<T.CrmServiceMacroOriginal>> { return this.original(intent, "apply", config); }
  private async original(intent: T.CrmServiceMacroIntent, operation: T.CrmServiceMacroOperation, config?: CrmServiceMacrosConfig): Promise<T.CrmServiceMacroEnvelope<T.CrmServiceMacroOriginal>> {
    const original = validateCrmServiceMacroIntent(intent); if (original.operation !== operation) throw new TypeError("Factuarea: original receipt requires the same native operation."); beforeDispatch(config);
    const path = operation === "save" ? this.paths.getSaveServiceMacroOriginal : operation === "archive" ? this.paths.getArchiveServiceMacroOriginal : this.paths.getApplyServiceMacroOriginal;
    const response = await this.query(serviceMacroPath(path), original.targetId === null ? {} : { macro_id: original.targetId }, config, original.originalKey);
    return this.project(response, () => this.receipt(response, original, 200));
  }
  private async write(original: T.CrmServiceMacroIntent, path: string, config?: CrmServiceMacrosConfig): Promise<T.CrmServiceMacroEnvelope<T.CrmServiceMacroOriginal>> {
    beforeDispatch(config); let response: ApiResponse<unknown>;
    // The native Macro body has a 250000-byte limit; reuse configured raw request transport without the unrelated mailbox-only 65536 helper.
    try { response = await this.client.request<unknown>({ ...config, method: original.operation === "save" && original.targetId !== null ? "PATCH" : "POST", path,
      rawJsonBody: original.originalWire, body: undefined, query: undefined, formData: undefined, idempotencyKey: original.originalKey,
      autoIdempotency: undefined, maxRetries: 0, headers: headers(config) }); }
    catch (cause) {
      if (cause instanceof ConnectionError || cause instanceof ServerError || (cause instanceof FactuareaError && cause.subcode === "service_macro_original_unconfirmed")
        || (cause instanceof Error && cause.name === "AbortError")) throw new CrmServiceMacroUnconfirmedWriteError(original, cause);
      throw cause;
    }
    config?.onResponse?.(response);
    try { return this.receipt(response, original, original.operation === "save" && original.targetId === null ? 201 : 200); }
    catch (cause) { throw new CrmServiceMacroUnconfirmedWriteError(original, unreadable(response, cause)); }
  }
  private receipt(response: ApiResponse<unknown>, original: T.CrmServiceMacroIntent, status: number): T.CrmServiceMacroEnvelope<T.CrmServiceMacroOriginal> {
    if (response.status !== status) throw new TypeError("Factuarea: incompatible original ServiceMacro response status.");
    const result = decodeCrmServiceMacroOriginal(response.data); const receipt = result.data.receipts[0]; const body = serviceMacroIntentBody(original);
    if ((original.targetId !== null && !sameId(result.data.macro_id, original.targetId))
      || receipt.version !== (body.expected_version as number) + (original.operation === "apply" ? 0 : 1)
      || (receipt.operation !== undefined && receipt.operation !== `customer_service.${original.operation}_macro`)
      || (original.operation === "apply" && receipt.ticket_id !== undefined && !sameId(receipt.ticket_id, body.ticket_id as string))) throw new TypeError("Factuarea: incompatible original ServiceMacro identity/version/operation.");
    return result;
  }
  private async query(path: string, query: Record<string, unknown>, config?: CrmServiceMacrosConfig, originalKey?: string): Promise<ApiResponse<unknown>> {
    beforeDispatch(config); const response = await this.client.request<unknown>({ ...config, method: "GET", path, query,
      body: undefined, rawJsonBody: undefined, formData: undefined, idempotencyKey: originalKey, autoIdempotency: originalKey === undefined ? false : undefined, maxRetries: 0, headers: headers(config) });
    config?.onResponse?.(response); return response;
  }
  private pageBinding(data: { page: number; per_page: number }, query: Record<string, number>): void {
    if (data.page !== (query.page ?? 1) || data.per_page !== (query.per_page ?? 25)) throw new TypeError("Factuarea: incompatible ServiceMacro page selection.");
  }
  private project<V>(response: ApiResponse<unknown>, decode: () => V): V { try { if (response.status !== 200) throw new TypeError("Factuarea: incompatible ServiceMacro query status."); return decode(); } catch (cause) { throw unreadable(response, cause); } }
}
export function createCrmServiceMacrosResource(client: CrmServiceMacrosNativeTransport, paths: T.CrmServiceMacrosV1Paths): CrmServiceMacrosResource { return new CrmServiceMacrosResource(client, paths); }
export { decodeCrmServiceMacroIntent, decodeCrmServiceMacroList, decodeCrmServiceMacroUsage, decodeCrmServiceMacroOriginal, decodeCrmServiceMacroRender } from "./codec.js";
export type * from "./types.js";
