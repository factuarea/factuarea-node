import type { ApiResponse, HttpClient } from "../../core/http-client.js";
import { ConnectionError, ServerError } from "../../core/errors.js";
import { CrmUnconfirmedWriteError } from "../../crm/errors.js";
import type { CrmRequestConfig } from "../../crm/resource.js";
import { decodeCrmVerticalPackCatalog, decodeCrmVerticalPackConflicts, decodeCrmVerticalPackPlan, decodeCrmVerticalPackReceipt, validateCrmVerticalPackIntent, validateCrmVerticalPacksPaths, verticalPackId, verticalPackListQuery, verticalPackPath, verticalPackPlanBody, verticalPackPreviewBody } from "./codec.js";
import type * as T from "./types.js";

export type CrmVerticalPacksNativeTransport = Pick<HttpClient, "request" | "requestOriginalJson">;
export type CrmVerticalPacksConfig = Omit<CrmRequestConfig, "idempotencyKey" | "maxRetries">;
export class CrmVerticalPackUnconfirmedWriteError extends CrmUnconfirmedWriteError {
  constructor(readonly originalIntent: T.CrmVerticalPackIntent, cause: Error) { super(originalIntent.operation === "apply" ? "crm_configuration.apply_pack" : "crm_configuration.undo_pack_installation", originalIntent.originalKey, cause); }
}
function headers(config?: CrmVerticalPacksConfig): Record<string, string> | undefined {
  const data = Object.fromEntries(Object.entries(config?.headers ?? {}).filter(([name]) => !["idempotency-key", "content-type"].includes(name.toLowerCase())));
  return Object.keys(data).length === 0 ? undefined : data;
}
function beforeDispatch(config?: CrmVerticalPacksConfig): void {
  if (config?.signal?.aborted) throw new ConnectionError({ message: "Factuarea: request was cancelled before dispatch.", code: "request_aborted", cause: config.signal.reason });
}
function unreadable(response: ApiResponse<unknown>, cause: unknown): ConnectionError {
  return new ConnectionError({ message: "Factuarea: the native VerticalPacks projection could not be read.", code: "crm_vertical_packs_projection_unreadable", requestId: response.requestId, rawResponse: response.data, cause });
}
function wire(value: unknown): string { const valueWire = JSON.stringify(value); if (typeof valueWire !== "string" || Buffer.byteLength(valueWire, "utf8") > 262144) throw new TypeError("Factuarea: incompatible VerticalPacks query body size."); return valueWire; }
/** Native seven-operation V1 consumer: no default paths, query claims, automatic mutation retry or 202 substitute. */
export class CrmVerticalPacksResource {
  constructor(private readonly client: CrmVerticalPacksNativeTransport, private readonly paths: T.CrmVerticalPacksV1Paths) {
    if (typeof client?.request !== "function" || typeof client?.requestOriginalJson !== "function") throw new TypeError("Factuarea: the same configured native VerticalPacks HTTP client is required.");
    validateCrmVerticalPacksPaths(paths);
  }
  async listCrmPacks(parameters: T.CrmVerticalPackListParameters = {}, config?: CrmVerticalPacksConfig): Promise<T.CrmVerticalPackEnvelope<T.CrmVerticalPackCatalog>> {
    const query = verticalPackListQuery(parameters); beforeDispatch(config);
    const response = await this.client.request<unknown>({ ...config, method: "GET", path: verticalPackPath(this.paths.listCrmPacks), query,
      body: undefined, rawJsonBody: undefined, formData: undefined, idempotencyKey: undefined, autoIdempotency: false, maxRetries: 0, headers: headers(config) });
    config?.onResponse?.(response); return this.project(response, () => decodeCrmVerticalPackCatalog(response.data));
  }
  async previewCrmPack(packId: string, body: T.CrmVerticalPackPreviewBody, config?: CrmVerticalPacksConfig): Promise<T.CrmVerticalPackEnvelope<T.CrmVerticalPackPlan>> {
    verticalPackId(packId); const input = verticalPackPreviewBody(body);
    const response = await this.queryPost(verticalPackPath(this.paths.previewCrmPack(packId)), input, config);
    return this.project(response, () => { const result = decodeCrmVerticalPackPlan(response.data);
      if (result.data.pack_id !== packId || result.data.pack_version !== input.pack_version || result.data.demo_selected !== input.demo_selected) throw new TypeError("Factuarea: incompatible VerticalPack preview selection."); return result; });
  }
  async getCrmPackPlan(planId: string, body: T.CrmVerticalPackPlanBody, config?: CrmVerticalPacksConfig): Promise<T.CrmVerticalPackEnvelope<T.CrmVerticalPackPlan>> {
    verticalPackId(planId); const input = verticalPackPlanBody(body);
    const response = await this.queryPost(verticalPackPath(this.paths.getCrmPackPlan(planId)), input, config);
    return this.project(response, () => { const result = decodeCrmVerticalPackPlan(response.data);
      if (result.data.id !== planId || result.data.plan_token !== input.plan_token) throw new TypeError("Factuarea: incompatible original VerticalPack selector."); return result; });
  }
  async getCrmPackConflicts(planId: string, body: T.CrmVerticalPackPlanBody, config?: CrmVerticalPacksConfig): Promise<T.CrmVerticalPackEnvelope<T.CrmVerticalPackConflicts>> {
    verticalPackId(planId); const input = verticalPackPlanBody(body);
    const response = await this.queryPost(verticalPackPath(this.paths.getCrmPackConflicts(planId)), input, config);
    return this.project(response, () => decodeCrmVerticalPackConflicts(response.data));
  }
  async applyCrmPack(intent: T.CrmVerticalPackApplyIntent, config?: CrmVerticalPacksConfig): Promise<T.CrmVerticalPackEnvelope<T.CrmVerticalPackReceipt>> {
    const original = validateCrmVerticalPackIntent(intent); if (original.operation !== "apply") throw new TypeError("Factuarea: apply requires the original apply intention.");
    return this.write(original, verticalPackPath(this.paths.applyCrmPack(original.targetId)), config);
  }
  async undoCrmPackInstallation(intent: T.CrmVerticalPackUndoIntent, config?: CrmVerticalPacksConfig): Promise<T.CrmVerticalPackEnvelope<T.CrmVerticalPackReceipt>> {
    const original = validateCrmVerticalPackIntent(intent); if (original.operation !== "undo") throw new TypeError("Factuarea: undo requires the original undo intention.");
    return this.write(original, verticalPackPath(this.paths.undoCrmPackInstallation(original.targetId)), config);
  }
  async getOriginalCrmPackReceipt(intent: T.CrmVerticalPackIntent, config?: CrmVerticalPacksConfig): Promise<T.CrmVerticalPackEnvelope<T.CrmVerticalPackReceipt | null>> {
    const original = validateCrmVerticalPackIntent(intent);
    const response = await this.queryPost(verticalPackPath(this.paths.getOriginalCrmPackReceipt), { operation: original.operation, target_id: original.targetId, original_key: original.originalKey, original_wire: original.originalWire }, config);
    return this.project(response, () => this.originalReceipt(response, original, true));
  }
  private async write(original: T.CrmVerticalPackIntent, path: string, config?: CrmVerticalPacksConfig): Promise<T.CrmVerticalPackEnvelope<T.CrmVerticalPackReceipt>> {
    beforeDispatch(config); let response: ApiResponse<unknown>;
    try { response = await this.client.requestOriginalJson<unknown>({ ...config, method: "POST", path, rawJsonBody: original.originalWire, query: undefined, body: undefined, formData: undefined,
      idempotencyKey: original.originalKey, autoIdempotency: undefined, maxRetries: 0, headers: headers(config) }); }
    catch (cause) { if (cause instanceof ConnectionError || cause instanceof ServerError || (cause instanceof Error && cause.name === "AbortError")) throw new CrmVerticalPackUnconfirmedWriteError(original, cause); throw cause; }
    config?.onResponse?.(response);
    try { return this.originalReceipt(response, original, false) as T.CrmVerticalPackEnvelope<T.CrmVerticalPackReceipt>; }
    catch (cause) { throw new CrmVerticalPackUnconfirmedWriteError(original, unreadable(response, cause)); }
  }
  private originalReceipt(response: ApiResponse<unknown>, original: T.CrmVerticalPackIntent, nullable: boolean): T.CrmVerticalPackEnvelope<T.CrmVerticalPackReceipt | null> {
    if (response.status !== 200) throw new TypeError("Factuarea: incompatible original VerticalPacks HTTP status.");
    const result = decodeCrmVerticalPackReceipt(response.data); const receipt = result.data;
    if (receipt === null) { if (!nullable) throw new TypeError("Factuarea: the original VerticalPack confirmation is missing."); }
    else if (receipt.operation !== original.operation || receipt.target_id !== original.targetId
      || (original.operation === "undo" && receipt.installation.id !== original.targetId)) throw new TypeError("Factuarea: incompatible original VerticalPack operation/target.");
    return result;
  }
  private async queryPost(path: string, body: Record<string, unknown>, config?: CrmVerticalPacksConfig): Promise<ApiResponse<unknown>> {
    const payload = wire(body); beforeDispatch(config);
    // Readonly wrappers have their own native 262144 bound, distinct from the core's mutation-only 65536 helper.
    const response = await this.client.request<unknown>({ ...config, method: "POST", path, rawJsonBody: payload, query: undefined, body: undefined, formData: undefined,
      idempotencyKey: undefined, autoIdempotency: false, maxRetries: 0, headers: headers(config) });
    config?.onResponse?.(response); return response;
  }
  private project<V>(response: ApiResponse<unknown>, decode: () => V): V { try { if (response.status !== 200) throw new TypeError("Factuarea: incompatible VerticalPacks query status."); return decode(); } catch (cause) { throw unreadable(response, cause); } }
}
export function createCrmVerticalPacksResource(client: CrmVerticalPacksNativeTransport, paths: T.CrmVerticalPacksV1Paths): CrmVerticalPacksResource { return new CrmVerticalPacksResource(client, paths); }
export { decodeCrmVerticalPackIntent, decodeCrmVerticalPackCatalog, decodeCrmVerticalPackPlan, decodeCrmVerticalPackConflicts, decodeCrmVerticalPackReceipt } from "./codec.js";
export type * from "./types.js";
