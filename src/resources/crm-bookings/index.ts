import type { ApiResponse, HttpClient, RequestOptions } from "../../core/http-client.js";
import { ConnectionError, ServerError } from "../../core/errors.js";
import { CrmUnconfirmedWriteError } from "../../crm/errors.js";
import { CrmCursorPage } from "../../crm/pagination.js";
import type { CrmRequestConfig } from "../../crm/resource.js";
import { bookingId, bookingListQuery, bookingPath, decodeCrmBookingPage, decodeCrmBookingService, decodeCrmBookingServiceReceipt, validateCrmBookingPaths, validateCrmBookingServiceIntent } from "./codec.js";
import type * as T from "./types.js";

/** The configured native HttpClient supplies both methods; no secondary HTTP/auth composition. */
export interface CrmBookingNativeTransport extends Pick<HttpClient, "request"> {
  requestOriginalJson<V>(options: RequestOptions & { rawJsonBody: string }): Promise<ApiResponse<V>>;
}
export type CrmBookingReadConfig = Omit<CrmRequestConfig, "idempotencyKey">;
export type CrmBookingOriginalConfig = Omit<CrmRequestConfig, "idempotencyKey" | "maxRetries">;
export class CrmBookingUnconfirmedWriteError extends CrmUnconfirmedWriteError {
  constructor(readonly originalIntent: T.CrmBookingServiceIntent, cause: Error) {
    super("booking.save_service", originalIntent.originalKey, cause);
  }
}
export class CrmBookingPage<V> extends CrmCursorPage<V> {
  constructor(readonly payload: T.CrmBookingPageData<V>, requestId: string | null, next: (cursor: string) => Promise<CrmBookingPage<V>>) {
    super(payload.items, payload.next_cursor !== null, payload.next_cursor, requestId, next);
  }
  get total(): number { return this.payload.total; }
}
function headers(config?: CrmBookingReadConfig, json = false): Record<string, string> | undefined {
  const result = Object.fromEntries(Object.entries(config?.headers ?? {}).filter(([name]) => name.toLowerCase() !== "idempotency-key" && (!json || name.toLowerCase() !== "content-type")));
  if (json) result["Content-Type"] = "application/json";
  return Object.keys(result).length === 0 ? undefined : result;
}
function beforeDispatch(config?: CrmBookingReadConfig): void {
  if (config?.signal?.aborted) throw new ConnectionError({ message: "Factuarea: request was cancelled before dispatch.", code: "request_aborted", cause: config.signal.reason });
}
function unreadable(response: ApiResponse<unknown>, cause: unknown): ConnectionError {
  return new ConnectionError({ message: "Factuarea: the native Booking projection could not be read.", code: "crm_booking_projection_unreadable", requestId: response.requestId, rawResponse: response.data, cause });
}
function requireStatus(response: ApiResponse<unknown>, status: number): void {
  if (response.status !== status) throw new TypeError("Factuarea: incompatible native Booking response status.");
}

/** Administrative V1 only. This adapter cannot approve Company policy or elevate a visitor/credential. */
export class CrmBookingsResource {
  constructor(private readonly client: CrmBookingNativeTransport, private readonly paths: T.CrmBookingV1Paths) {
    if (typeof client?.request !== "function" || typeof client.requestOriginalJson !== "function") throw new TypeError("Factuarea: the native original JSON transport is required for Booking.");
    validateCrmBookingPaths(paths);
  }
  async listBookingServices(parameters: T.CrmBookingListParameters = {}, config?: CrmBookingReadConfig): Promise<CrmBookingPage<T.CrmBookingServiceListItem>> {
    const query = bookingListQuery(parameters, false);
    const response = await this.client.request<unknown>({ ...config, method: "GET", path: bookingPath(this.paths.listBookingServices), query, autoIdempotency: false, idempotencyKey: undefined, headers: headers(config) });
    config?.onResponse?.(response);
    const result = this.project(response, () => { requireStatus(response, 200); return decodeCrmBookingPage(response.data, "services"); });
    return new CrmBookingPage(result.data, response.requestId, (cursor) => this.listBookingServices({ ...query, cursor }, config));
  }
  async listBookings(parameters: T.CrmBookingsListParameters = {}, config?: CrmBookingReadConfig): Promise<CrmBookingPage<T.CrmBookingListItem>> {
    const query = bookingListQuery(parameters, true);
    const response = await this.client.request<unknown>({ ...config, method: "GET", path: bookingPath(this.paths.listBookings), query, autoIdempotency: false, idempotencyKey: undefined, headers: headers(config) });
    config?.onResponse?.(response);
    const result = this.project(response, () => { requireStatus(response, 200); return decodeCrmBookingPage(response.data, "bookings"); });
    return new CrmBookingPage(result.data, response.requestId, (cursor) => this.listBookings({ ...query, cursor }, config));
  }
  async getBookingService(serviceId: string, config?: CrmBookingReadConfig): Promise<T.CrmBookingEnvelope<T.CrmBookingService>> {
    bookingId(serviceId);
    const response = await this.client.request<unknown>({ ...config, method: "GET", path: bookingPath(this.paths.getBookingService(serviceId)), autoIdempotency: false, idempotencyKey: undefined, headers: headers(config) });
    config?.onResponse?.(response);
    return this.project(response, () => {
      requireStatus(response, 200); const result = decodeCrmBookingService(response.data);
      if (result.data.id !== serviceId) throw new TypeError("Factuarea: incompatible native Booking service identity.");
      return result;
    });
  }
  async createBookingService(intent: T.CrmBookingServiceCreateIntent, config?: CrmBookingOriginalConfig): Promise<T.CrmBookingEnvelope<T.CrmBookingServiceReceipt>> {
    const original = validateCrmBookingServiceIntent(intent);
    if (original.targetId !== null) throw new TypeError("Factuarea: Booking creation requires an original server-allocated identity.");
    return this.write(original, "POST", bookingPath(this.paths.createBookingService), 201, config);
  }
  async saveBookingService(intent: T.CrmBookingServiceSaveIntent, config?: CrmBookingOriginalConfig): Promise<T.CrmBookingEnvelope<T.CrmBookingServiceReceipt>> {
    const original = validateCrmBookingServiceIntent(intent);
    if (original.targetId === null) throw new TypeError("Factuarea: Booking update requires the original service target.");
    return this.write(original, "PUT", bookingPath(this.paths.saveBookingService(original.targetId)), 200, config);
  }
  /** Native readonly POST. data:null proves no original effect; never replaces the intent with a current head. */
  async recoverBookingServiceReceipt(intent: T.CrmBookingServiceIntent, config?: CrmBookingOriginalConfig): Promise<T.CrmBookingEnvelope<T.CrmBookingServiceReceipt | null>> {
    const original = validateCrmBookingServiceIntent(intent); beforeDispatch(config);
    // This read wrapper encodes the original bytes as a string. It does not reencode the original mutation JSON.
    const response = await this.client.request<unknown>({ ...config, method: "POST", path: bookingPath(this.paths.recoverBookingServiceReceipt(original.targetId)),
      rawJsonBody: JSON.stringify({ original_wire_body: original.originalWire }), idempotencyKey: original.originalKey, autoIdempotency: undefined, maxRetries: 0, headers: headers(config, true) });
    config?.onResponse?.(response);
    return this.project(response, () => {
      requireStatus(response, 200); const result = decodeCrmBookingServiceReceipt(response.data);
      if (result.data !== null && original.targetId !== null && result.data.id !== original.targetId) throw new TypeError("Factuarea: incompatible original Booking target.");
      return result;
    });
  }
  private async write(intent: T.CrmBookingServiceIntent, method: "POST" | "PUT", url: string, status: number, config?: CrmBookingOriginalConfig): Promise<T.CrmBookingEnvelope<T.CrmBookingServiceReceipt>> {
    beforeDispatch(config);
    let response: ApiResponse<unknown>;
    try {
      response = await this.client.requestOriginalJson<unknown>({ ...config, method, path: url, rawJsonBody: intent.originalWire, idempotencyKey: intent.originalKey, autoIdempotency: undefined, maxRetries: 0, headers: headers(config, true) });
    } catch (cause) {
      if (cause instanceof ConnectionError || cause instanceof ServerError || (cause instanceof Error && cause.name === "AbortError")) throw new CrmBookingUnconfirmedWriteError(intent, cause);
      throw cause;
    }
    config?.onResponse?.(response);
    try {
      requireStatus(response, status); const result = decodeCrmBookingService(response.data);
      if (intent.targetId !== null && result.data.id !== intent.targetId) throw new TypeError("Factuarea: incompatible original Booking target.");
      return result;
    } catch (cause) { throw new CrmBookingUnconfirmedWriteError(intent, unreadable(response, cause)); }
  }
  private project<V>(response: ApiResponse<unknown>, decode: () => V): V {
    try { return decode(); } catch (cause) { throw unreadable(response, cause); }
  }
}
/** Shares the authenticated native client and requires explicit actual route bindings. */
export function createCrmBookingsResource(client: CrmBookingNativeTransport, paths: T.CrmBookingV1Paths): CrmBookingsResource { return new CrmBookingsResource(client, paths); }
export { decodeCrmBookingServiceIntent, decodeCrmBookingService, decodeCrmBookingServiceReceipt, decodeCrmBookingPage } from "./codec.js";
export type * from "./types.js";
