import type { ApiResponse, HttpClient } from "../../core/http-client.js";
import { ConnectionError, ServerError } from "../../core/errors.js";
import { CrmUnconfirmedWriteError } from "../../crm/errors.js";
import { CrmCursorPage } from "../../crm/pagination.js";
import type { CrmRequestConfig } from "../../crm/resource.js";
import { decodeCrmTaskTimePage, decodeCrmTaskTimePreview, decodeCrmTaskTimeReceipt, decodeCrmTaskTimeTasks, taskTimeId, taskTimeKey, taskTimeListQuery, taskTimePath, taskTimePreviewBody, taskTimeRecoveryBody, validateTaskTimeIntent, validateTaskTimePaths } from "./codec.js";
import type * as T from "./types.js";

/** The SAME configured native request method already supports exact raw JSON bodies. */
export type CrmTaskTimeBillingNativeTransport = Pick<HttpClient, "request">;
export type CrmTaskTimeReadConfig = Omit<CrmRequestConfig, "idempotencyKey">;
export type CrmTaskTimeWriteConfig = Omit<CrmRequestConfig, "idempotencyKey" | "maxRetries">;
/** Optional explicit HTTP policy key for readonly POST; it never identifies or grants a domain effect. */
export type CrmTaskTimeQueryPostConfig = Omit<CrmRequestConfig, "maxRetries">;
export class CrmTaskTimeUnconfirmedWriteError extends CrmUnconfirmedWriteError {
  constructor(readonly originalIntent: T.CrmTaskTimeIntent, cause: Error) {
    super("customer_service.task_time_" + originalIntent.action, originalIntent.originalKey, cause);
  }
}
export class CrmTaskTimePage<V extends T.CrmTaskTimeTimesheet | T.CrmTaskTimeBillable> extends CrmCursorPage<T.CrmTaskTimeEntry> {
  constructor(readonly payload: V, requestId: string | null, next: (cursor: string) => Promise<CrmTaskTimePage<V>>) {
    super(payload.entries, payload.next_cursor !== null, payload.next_cursor, requestId, next);
  }
}
function headers(config?: CrmRequestConfig): Record<string, string> | undefined {
  const result = Object.fromEntries(Object.entries(config?.headers ?? {}).filter(([name]) => !["idempotency-key", "content-type"].includes(name.toLowerCase())));
  return Object.keys(result).length === 0 ? undefined : result;
}
function beforeDispatch(config?: CrmRequestConfig): void {
  if (config?.signal?.aborted) throw new ConnectionError({ message: "Factuarea: request was cancelled before dispatch.", code: "request_aborted", cause: config.signal.reason });
}
function unreadable(response: ApiResponse<unknown>, cause: unknown): ConnectionError {
  return new ConnectionError({ message: "Factuarea: the native TaskTime projection could not be read.", code: "crm_task_time_projection_unreadable", requestId: response.requestId, rawResponse: response.data, cause });
}
function boundedWire(value: unknown): string {
  const wire = JSON.stringify(value);
  if (typeof wire !== "string" || Buffer.byteLength(wire, "utf8") > 262144) throw new TypeError("Factuarea: incompatible TaskTime body size.");
  return wire;
}
function checkTicket(response: ApiResponse<unknown>, data: T.CrmTaskTimeBase, ticketId: string): void {
  if (response.status !== 200 || data.ticket_id !== ticketId) throw new TypeError("Factuarea: incompatible TaskTime response status or ticket identity.");
}

/** Native eight administrative operations; Task/Invoice/current aggregate authority remains server-owned. */
export class CrmTaskTimeBillingResource {
  constructor(private readonly client: CrmTaskTimeBillingNativeTransport, private readonly paths: T.CrmTaskTimeBillingV1Paths) {
    if (typeof client?.request !== "function") throw new TypeError("Factuarea: the configured native TaskTime HTTP client is required.");
    validateTaskTimePaths(paths);
  }
  async linkServiceTicketTask(intent: T.CrmTaskTimeLinkIntent, config?: CrmTaskTimeWriteConfig): Promise<T.CrmTaskTimeEnvelope<T.CrmTaskTimeReceipt>> {
    const original = validateTaskTimeIntent(intent, "link");
    return this.write(original, taskTimePath(this.paths.linkServiceTicketTask(original.ticketId)), config);
  }
  async unlinkServiceTicketTask(intent: T.CrmTaskTimeUnlinkIntent, config?: CrmTaskTimeWriteConfig): Promise<T.CrmTaskTimeEnvelope<T.CrmTaskTimeReceipt>> {
    const original = validateTaskTimeIntent(intent, "unlink");
    return this.write(original, taskTimePath(this.paths.unlinkServiceTicketTask(original.ticketId)), config);
  }
  async listServiceTicketTasks(ticketId: string, config?: CrmTaskTimeReadConfig): Promise<T.CrmTaskTimeEnvelope<T.CrmTaskTimeTasks>> {
    taskTimeId(ticketId);
    const response = await this.get(taskTimePath(this.paths.listServiceTicketTasks(ticketId)), undefined, config);
    return this.project(response, () => { const result = decodeCrmTaskTimeTasks(response.data); checkTicket(response, result.data, ticketId); return result; });
  }
  async getServiceBillableTime(ticketId: string, parameters: T.CrmTaskTimeListParameters = {}, config?: CrmTaskTimeReadConfig): Promise<CrmTaskTimePage<T.CrmTaskTimeBillable>> {
    taskTimeId(ticketId); const query = taskTimeListQuery(parameters);
    const response = await this.get(taskTimePath(this.paths.getServiceBillableTime(ticketId)), query, config);
    const result = this.project(response, () => { const result = decodeCrmTaskTimePage(response.data, "billable"); checkTicket(response, result.data, ticketId); return result; });
    return new CrmTaskTimePage(result.data, response.requestId, (cursor) => this.getServiceBillableTime(ticketId, { ...query, cursor }, config));
  }
  async getServiceTimesheet(ticketId: string, parameters: T.CrmTaskTimeListParameters = {}, config?: CrmTaskTimeReadConfig): Promise<CrmTaskTimePage<T.CrmTaskTimeTimesheet>> {
    taskTimeId(ticketId); const query = taskTimeListQuery(parameters);
    const response = await this.get(taskTimePath(this.paths.getServiceTimesheet(ticketId)), query, config);
    const result = this.project(response, () => { const result = decodeCrmTaskTimePage(response.data, "timesheet"); checkTicket(response, result.data, ticketId); return result; });
    return new CrmTaskTimePage(result.data, response.requestId, (cursor) => this.getServiceTimesheet(ticketId, { ...query, cursor }, config));
  }
  async previewServiceTimeInvoice(ticketId: string, body: T.CrmTaskTimePreviewBody, config?: CrmTaskTimeQueryPostConfig): Promise<T.CrmTaskTimeEnvelope<T.CrmTaskTimePreview>> {
    taskTimeId(ticketId); const payload = taskTimePreviewBody(JSON.parse(boundedWire(body)) as T.CrmTaskTimePreviewBody);
    const selected = new Set((payload.entries as T.CrmTaskTimePreviewBody["entries"]).map((entry) => entry.id));
    const response = await this.queryPost(taskTimePath(this.paths.previewServiceTimeInvoice(ticketId)), payload, config);
    return this.project(response, () => {
      const result = decodeCrmTaskTimePreview(response.data); checkTicket(response, result.data, ticketId);
      if (result.data.preview.time_entry_ids.some((id) => !selected.has(id))) throw new TypeError("Factuarea: incompatible TaskTime preview selection.");
      return result;
    });
  }
  async getOriginalServiceTicketTaskLinkReceipt(ticketId: string, body: T.CrmTaskTimeLinkRecoveryBody, config?: CrmTaskTimeQueryPostConfig): Promise<T.CrmTaskTimeEnvelope<T.CrmTaskTimeReceipt>> {
    return this.recovery(ticketId, "link", body, taskTimePath(this.paths.getOriginalServiceTicketTaskLinkReceipt(ticketId)), config);
  }
  async getOriginalServiceTicketTaskUnlinkReceipt(ticketId: string, body: T.CrmTaskTimeUnlinkRecoveryBody, config?: CrmTaskTimeQueryPostConfig): Promise<T.CrmTaskTimeEnvelope<T.CrmTaskTimeReceipt>> {
    return this.recovery(ticketId, "unlink", body, taskTimePath(this.paths.getOriginalServiceTicketTaskUnlinkReceipt(ticketId)), config);
  }
  private async write(intent: T.CrmTaskTimeIntent, path: string, config?: CrmTaskTimeWriteConfig): Promise<T.CrmTaskTimeEnvelope<T.CrmTaskTimeReceipt>> {
    beforeDispatch(config);
    let response: ApiResponse<unknown>;
    try {
      // Owner's 262144-byte bound was checked by the codec. The core mutation helper has a different 65536-byte bound.
      response = await this.client.request<unknown>({ ...config, method: "POST", path, rawJsonBody: intent.originalWire, body: undefined, formData: undefined,
        query: undefined, idempotencyKey: intent.originalKey, autoIdempotency: undefined, maxRetries: 0, headers: headers(config) });
    } catch (cause) {
      if (cause instanceof ConnectionError || cause instanceof ServerError || (cause instanceof Error && cause.name === "AbortError")) throw new CrmTaskTimeUnconfirmedWriteError(intent, cause);
      throw cause;
    }
    config?.onResponse?.(response);
    try {
      const result = decodeCrmTaskTimeReceipt(response.data, intent.action); checkTicket(response, result.data, intent.ticketId);
      const sent = JSON.parse(intent.originalWire) as T.CrmTaskTimeLinkBody | T.CrmTaskTimeUnlinkBody;
      if (result.data.result.binding.task_id !== sent.task_id || (sent.binding_id != null && result.data.result.binding.id !== sent.binding_id)) throw new TypeError("Factuarea: incompatible TaskTime original binding identity.");
      return result;
    } catch (cause) { throw new CrmTaskTimeUnconfirmedWriteError(intent, unreadable(response, cause)); }
  }
  private async recovery(ticketId: string, action: T.CrmTaskTimeAction, body: T.CrmTaskTimeLinkRecoveryBody | T.CrmTaskTimeUnlinkRecoveryBody, path: string, config?: CrmTaskTimeQueryPostConfig): Promise<T.CrmTaskTimeEnvelope<T.CrmTaskTimeReceipt>> {
    taskTimeId(ticketId); const payload = taskTimeRecoveryBody(JSON.parse(boundedWire(body)) as T.CrmTaskTimeLinkRecoveryBody | T.CrmTaskTimeUnlinkRecoveryBody, action);
    const response = await this.queryPost(path, payload, config);
    return this.project(response, () => {
      const result = decodeCrmTaskTimeReceipt(response.data, action); checkTicket(response, result.data, ticketId);
      if (result.data.effect_id !== payload.effect_id || result.data.result.binding.id !== payload.binding_id || result.data.result.binding.task_id !== payload.task_id) throw new TypeError("Factuarea: incompatible original TaskTime recovery tuple.");
      return result;
    });
  }
  private async get(path: string, query: Record<string, unknown> | undefined, config?: CrmTaskTimeReadConfig): Promise<ApiResponse<unknown>> {
    const response = await this.client.request<unknown>({ ...config, method: "GET", path, query, body: undefined, rawJsonBody: undefined, formData: undefined,
      idempotencyKey: undefined, autoIdempotency: false, headers: headers(config) });
    config?.onResponse?.(response); return response;
  }
  private async queryPost(path: string, body: Record<string, unknown>, config?: CrmTaskTimeQueryPostConfig): Promise<ApiResponse<unknown>> {
    const key = config?.idempotencyKey; if (key !== undefined) taskTimeKey(key);
    const wire = boundedWire(body); beforeDispatch(config);
    const response = await this.client.request<unknown>({ ...config, method: "POST", path, rawJsonBody: wire, body: undefined, formData: undefined, query: undefined,
      idempotencyKey: key, autoIdempotency: key === undefined ? false : undefined, maxRetries: 0, headers: headers(config) });
    config?.onResponse?.(response); return response;
  }
  private project<V>(response: ApiResponse<unknown>, decode: () => V): V { try { return decode(); } catch (cause) { throw unreadable(response, cause); } }
}
export function createCrmTaskTimeBillingResource(client: CrmTaskTimeBillingNativeTransport, paths: T.CrmTaskTimeBillingV1Paths): CrmTaskTimeBillingResource { return new CrmTaskTimeBillingResource(client, paths); }
export { decodeCrmTaskTimeIntent, decodeCrmTaskTimeTasks, decodeCrmTaskTimePage, decodeCrmTaskTimePreview, decodeCrmTaskTimeReceipt } from "./codec.js";
export type * from "./types.js";
