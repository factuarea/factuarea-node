import type { HttpClient, BinaryResponse, HttpMethod } from "./http-client.js";
import { type CursorParam, fetchPage, Page } from "./pagination.js";

/**
 * Options accepted by every resource method: per-request overrides that flow
 * down to the `HttpClient`.
 */
export interface RequestConfig {
  /** Override the auto-generated `Idempotency-Key` for this request. */
  idempotencyKey?: string;
  /** Per-request timeout (ms). */
  timeout?: number;
  /** Per-request max retries. */
  maxRetries?: number;
  /** Extra headers for this request. */
  headers?: Record<string, string>;
}

/**
 * Flattens nested query objects (`{ created: { gte: x } }`) into the bracketed
 * form the API expects (`created[gte]=x`). Top-level scalars and arrays pass
 * through. This lets resource methods accept ergonomic nested filter objects.
 */
export function flattenQuery(
  query: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!query) {
    return undefined;
  }
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) {
      continue;
    }
    if (Array.isArray(value)) {
      out[key] = value;
    } else if (typeof value === "object") {
      for (const [subKey, subValue] of Object.entries(value as Record<string, unknown>)) {
        if (subValue !== undefined && subValue !== null) {
          out[`${key}[${subKey}]`] = subValue;
        }
      }
    } else {
      out[key] = value;
    }
  }
  return out;
}

/** Base class shared by every resource namespace. */
export abstract class BaseResource {
  protected readonly client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  /** Interpolates `{name}` path params into a path template. */
  protected buildPath(template: string, params: Record<string, string | number>): string {
    return template.replace(/\{([^}]+)\}/g, (_match, key: string) => {
      const value = params[key];
      if (value === undefined || value === null || value === "") {
        throw new TypeError(`Factuarea: missing path parameter \`${key}\` for ${template}.`);
      }
      return encodeURIComponent(String(value));
    });
  }

  protected async _get<T>(
    path: string,
    query?: Record<string, unknown>,
    config?: RequestConfig,
  ): Promise<T> {
    const response = await this.client.request<T>({
      method: "GET",
      path,
      query: flattenQuery(query),
      ...config,
    });
    return response.data;
  }

  protected async _send<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    const response = await this.client.request<T>({ method, path, body, ...config });
    return response.data;
  }

  protected async _delete<T>(
    path: string,
    query?: Record<string, unknown>,
    config?: RequestConfig,
  ): Promise<T> {
    const response = await this.client.request<T>({
      method: "DELETE",
      path,
      query: flattenQuery(query),
      ...config,
    });
    return response.data;
  }

  protected async _sendForm<T>(
    path: string,
    formData: FormData,
    config?: RequestConfig,
  ): Promise<T> {
    const response = await this.client.request<T>({
      method: "POST",
      path,
      formData,
      ...config,
    });
    return response.data;
  }

  protected async _paginate<T>(
    path: string,
    query: Record<string, unknown> | undefined,
    cursorParam: CursorParam,
  ): Promise<Page<T>> {
    return fetchPage<T>(this.client, path, flattenQuery(query), cursorParam);
  }

  protected async _binary(
    path: string,
    method: HttpMethod = "GET",
    query?: Record<string, unknown>,
    body?: unknown,
    config?: RequestConfig,
  ): Promise<BinaryResponse> {
    return this.client.requestBinary({
      method,
      path,
      query: flattenQuery(query),
      body,
      ...config,
    });
  }
}
