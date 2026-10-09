import { randomUUID } from "node:crypto";
import { ConnectionError, ServerError } from "../core/errors.js";
import { BaseResource, flattenQuery, type RequestConfig } from "../core/resource.js";
import type { ApiResponse, HttpMethod } from "../core/http-client.js";
import { CrmCursorPage, CrmNumberPage, type CrmNumberMeta } from "./pagination.js";
import { CrmUnconfirmedWriteError } from "./errors.js";

export interface CrmRequestConfig extends RequestConfig {
  /** Observe the native status, headers, request id and untouched response body. */
  onResponse?: (response: ApiResponse<unknown>) => void;
}

/** Local human acknowledgement; no confirmation field or grant is added to the wire. */
export interface CrmConfirmedRequestConfig extends CrmRequestConfig {
  humanConfirmed: true;
}

export abstract class CrmBaseResource extends BaseResource {
  protected requireHumanConfirmation(config: CrmConfirmedRequestConfig): void {
    if (config?.humanConfirmed !== true) {
      throw new TypeError("Factuarea: this CRM operation requires human confirmation.");
    }
  }

  protected async sendCrm<T>(
    method: HttpMethod,
    path: string,
    body: unknown,
    config: CrmRequestConfig | undefined,
    effect: boolean,
    operationId: string,
  ): Promise<T> {
    if (config?.signal?.aborted) {
      throw new ConnectionError({ message: "Factuarea: request was cancelled before dispatch.", code: "request_aborted", cause: config.signal.reason });
    }
    const headerKey = Object.entries(config?.headers ?? {}).find(([name]) => name.toLowerCase() === "idempotency-key")?.[1];
    const idempotencyKey = config?.idempotencyKey ?? headerKey ?? randomUUID();
    const headers = config?.headers && Object.fromEntries(Object.entries(config.headers).filter(([name]) => name.toLowerCase() !== "idempotency-key"));
    let response: ApiResponse<T>;
    try {
      // A timeout or 5xx can hide a committed effect; the caller reconciles the original key.
      response = await this.client.request<T>({ method, path, body, ...config, headers, idempotencyKey, maxRetries: 0 });
    } catch (cause) {
      if (effect && (cause instanceof ConnectionError || cause instanceof ServerError
        || (cause instanceof Error && cause.name === "AbortError"))) {
        throw new CrmUnconfirmedWriteError(operationId, idempotencyKey, cause);
      }
      throw cause;
    }
    config?.onResponse?.(response);
    return response.data;
  }

  protected async getCrm<T>(path: string, params?: Record<string, unknown>, config?: CrmRequestConfig): Promise<T> {
    const response = await this.client.request<T>({ method: "GET", path, query: flattenQuery(params), ...config });
    config?.onResponse?.(response);
    return response.data;
  }

  protected async cursorPage<T>(
    path: string,
    params: Record<string, unknown> | undefined,
    itemKey: "data" | "items",
    config?: CrmRequestConfig,
  ): Promise<CrmCursorPage<T>> {
    const query = flattenQuery(params);
    const response = await this.client.request<{ data: { data?: T[]; items?: T[]; has_more: boolean; next_cursor: string | null } }>({ method: "GET", path, query, ...config });
    config?.onResponse?.(response);
    const payload = response.data.data;
    if (!payload || !Array.isArray(payload[itemKey]) || typeof payload.has_more !== "boolean"
      || (payload.next_cursor !== null && typeof payload.next_cursor !== "string")
      || (payload.has_more && !payload.next_cursor)) {
      throw new TypeError("Factuarea: incompatible CRM cursor response.");
    }
    return new CrmCursorPage<T>(payload[itemKey]!, payload.has_more, payload.next_cursor, response.requestId,
      (cursor) => this.cursorPage<T>(path, { ...params, cursor }, itemKey, config));
  }

  protected async numberPage<T>(
    path: string,
    params: Record<string, unknown> | undefined,
    config?: CrmRequestConfig,
  ): Promise<CrmNumberPage<T>> {
    const query = flattenQuery(params);
    const response = await this.client.request<{ data: T[]; meta: CrmNumberMeta }>({ method: "GET", path, query, ...config });
    config?.onResponse?.(response);
    const payload = response.data;
    if (!Array.isArray(payload.data) || !payload.meta || !Number.isInteger(payload.meta.current_page)
      || payload.meta.current_page < 1 || !Number.isInteger(payload.meta.total) || payload.meta.total < 0) {
      throw new TypeError("Factuarea: incompatible CRM numbered response.");
    }
    return new CrmNumberPage<T>(payload.data, payload.meta, response.requestId,
      (page) => this.numberPage<T>(path, { ...params, page }, config));
  }
}
