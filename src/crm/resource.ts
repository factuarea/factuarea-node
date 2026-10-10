import { randomUUID } from "node:crypto";
import { ConnectionError, ServerError } from "../core/errors.js";
import { BaseResource, flattenQuery, type RequestConfig } from "../core/resource.js";
import type { ApiResponse, HttpMethod } from "../core/http-client.js";
import { CrmCursorPage, CrmNumberPage, CrmKnowledgePage, type CrmNumberMeta, type CrmKnowledgePageData } from "./pagination.js";
import { CrmUnconfirmedWriteError } from "./errors.js";

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const isVersion = (value: unknown, minimum = 1): value is number => typeof value === "number" && Number.isSafeInteger(value) && value >= minimum;
const isUuid = (value: unknown): value is string => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export interface CrmRequestConfig extends RequestConfig {
  /** Observe the native status, headers, request id and untouched response body. */
  onResponse?: (response: ApiResponse<unknown>) => void;
}

/** Local human acknowledgement; no confirmation field or grant is added to the wire. */
export interface CrmConfirmedRequestConfig extends CrmRequestConfig {
  humanConfirmed: true;
}

/** Persist this original key before dispatch; receipt reads use the same key. */
export interface CrmOriginalKeyRequestConfig extends CrmRequestConfig {
  idempotencyKey: string;
}

/** Human review of a native closed intent that has no confirmation body field. */
export interface CrmConfirmedOriginalKeyRequestConfig extends CrmOriginalKeyRequestConfig {
  humanConfirmed: true;
}

export abstract class CrmBaseResource extends BaseResource {
  protected requireHumanConfirmation(config: CrmConfirmedRequestConfig): void {
    if (config?.humanConfirmed !== true) {
      throw new TypeError("Factuarea: this CRM operation requires human confirmation.");
    }
  }

  protected requireOriginalKey(config: CrmOriginalKeyRequestConfig): void {
    if (typeof config?.idempotencyKey !== "string" || !/^[ -~]{1,255}$/.test(config.idempotencyKey)) {
      throw new TypeError("Factuarea: this CRM operation requires the original Idempotency-Key (1–255 printable ASCII characters).");
    }
  }

  protected requireExactCas(intent: unknown): void {
    if (typeof intent !== "object" || intent === null) return;
    for (const [field, value] of Object.entries(intent)) {
      if (["expected_version", "expected_taxonomy_version", "published_version", "target_version", "ticket_version", "version", "taxonomy_version", "revision_number"].includes(field)
        && typeof value === "number" && !Number.isSafeInteger(value)) {
        throw new TypeError(`Factuarea: ${field} must be an exact JavaScript safe integer.`);
      }
      if (typeof value === "object" && value !== null) this.requireExactCas(value);
    }
  }

  protected requireOriginalReceipt(envelope: unknown, operation: string): void {
    const receipt = isRecord(envelope) ? envelope.data : undefined;
    if (!isRecord(receipt) || receipt.confirmed !== true || receipt.operation !== operation || !isUuid(receipt.effect_id)) {
      throw new TypeError("Factuarea: incompatible original CRM receipt.");
    }
    if (operation === "knowledge_articles.category_save") {
      const category = receipt.category;
      if ((receipt.expected_version !== null && !isVersion(receipt.expected_version)) || !isVersion(receipt.expected_taxonomy_version)
        || !isRecord(category) || !isUuid(category.id) || !isVersion(category.version) || !isUuid(category.taxonomy_id)
        || !isVersion(category.taxonomy_version) || (category.parent_id !== null && !isUuid(category.parent_id))) {
        throw new TypeError("Factuarea: incompatible original Knowledge category receipt.");
      }
    } else if (operation.startsWith("knowledge_articles.")) {
      const article = receipt.article;
      if (!isVersion(receipt.expected_version, operation === "knowledge_articles.create" ? 0 : 1)
        || (operation === "knowledge_articles.create" && receipt.expected_version !== 0)
        || !isRecord(article) || !isUuid(article.id) || !isVersion(article.version)) {
        throw new TypeError("Factuarea: incompatible original Knowledge article receipt.");
      }
    } else {
      const center = receipt.center;
      if (!isVersion(receipt.expected_version, operation === "public_help_centers.publish" ? 0 : 1)
        || !isRecord(center) || !isUuid(center.id) || !isVersion(center.version)
        || typeof center.slug !== "string" || typeof center.display_name !== "string"
        || !["es", "en", "ca"].includes(String(center.locale))
        || !Array.isArray(center.article_slugs) || !center.article_slugs.every((slug) => typeof slug === "string")
        || center.enabled !== (operation === "public_help_centers.publish")) {
        throw new TypeError("Factuarea: incompatible original HelpCenter receipt.");
      }
    }
  }

  protected async sendCrm<T>(
    method: HttpMethod,
    path: string,
    body: unknown,
    config: CrmRequestConfig | undefined,
    effect: boolean,
    operationId: string,
    receiptOperation?: string,
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
    if (receiptOperation) {
      try {
        this.requireExactCas(response.data);
      } catch (cause) {
        throw new CrmUnconfirmedWriteError(operationId, idempotencyKey,
          new ConnectionError({ message: "Factuarea: the original CRM receipt contains an unsafe numeric CAS.", code: "crm_receipt_unsafe_cas", requestId: response.requestId, rawResponse: response.data, cause }));
      }
      try {
        this.requireOriginalReceipt(response.data, receiptOperation);
      } catch (cause) {
        throw new CrmUnconfirmedWriteError(operationId, idempotencyKey,
          new ConnectionError({ message: "Factuarea: the original confirmed CRM receipt could not be read.", code: "crm_receipt_unreadable", requestId: response.requestId, rawResponse: response.data, cause }));
      }
    }
    return response.data;
  }

  protected async getCrm<T>(path: string, params?: Record<string, unknown>, config?: CrmRequestConfig, exactCas = false, receiptOperation?: string): Promise<T> {
    const response = await this.client.request<T>({ method: "GET", path, query: flattenQuery(params), ...config });
    config?.onResponse?.(response);
    if (exactCas) this.requireExactCas(response.data);
    if (receiptOperation) {
      try {
        this.requireOriginalReceipt(response.data, receiptOperation);
      } catch (cause) {
        throw new ConnectionError({ message: "Factuarea: the original confirmed CRM receipt could not be read.", code: "crm_receipt_unreadable", requestId: response.requestId, rawResponse: response.data, cause });
      }
    }
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

  protected async knowledgePage<T>(
    path: string,
    params: Record<string, unknown> | undefined,
    config?: CrmRequestConfig,
  ): Promise<CrmKnowledgePage<T>> {
    const response = await this.client.request<{ data: CrmKnowledgePageData<T> }>({ method: "GET", path, query: flattenQuery(params), ...config });
    config?.onResponse?.(response);
    const payload = response.data.data;
    if (!payload || !Array.isArray(payload.items) || !Number.isInteger(payload.total) || payload.total < 0
      || !Number.isInteger(payload.page) || payload.page < 1 || !Number.isInteger(payload.per_page) || payload.per_page < 1) {
      throw new TypeError("Factuarea: incompatible Knowledge article search response.");
    }
    this.requireExactCas(payload);
    return new CrmKnowledgePage<T>(payload, response.requestId,
      (page) => this.knowledgePage<T>(path, { ...params, page }, config));
  }
}
