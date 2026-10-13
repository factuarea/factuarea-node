// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


import type * as NativeApi from "../generated/types.gen.js";

export class BookingResource extends BaseResource {
  /** GET /crm/booking/services/{service} */
  async getBookingService(service: string, config?: RequestConfig): Promise<NativeApi.GetBookingServiceResponse> {
    const path = this.buildPath("/crm/booking/services/{service}", { "service": service });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.GetBookingServiceResponse>(path, undefined, config);
  }

  /** PUT /crm/booking/services/{service} */
  async saveBookingService(service: string, body: NativeApi.SaveBookingServiceData["body"], config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.SaveBookingServiceResponse> {
    const path = this.buildPath("/crm/booking/services/{service}", { "service": service });
    config = this._nativeConfig(config, true);
    return this._sendNative<NativeApi.SaveBookingServiceResponse>("PUT", path, body, config);
  }

  /** GET /crm/booking/services */
  async listBookingServices(params?: NativeApi.ListBookingServicesData["query"], config?: RequestConfig): Promise<NativeApi.ListBookingServicesResponse> {
    const path = "/crm/booking/services";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.ListBookingServicesResponse>(path, params, config);
  }

  /** POST /crm/booking/services */
  async createBookingService(body: NativeApi.CreateBookingServiceData["body"], config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.CreateBookingServiceResponse> {
    const path = "/crm/booking/services";
    config = this._nativeConfig(config, true);
    return this._sendNative<NativeApi.CreateBookingServiceResponse>("POST", path, body, config);
  }

  /** GET /crm/booking/bookings */
  async listBookings(params?: NativeApi.ListBookingsData["query"], config?: RequestConfig): Promise<NativeApi.ListBookingsResponse> {
    const path = "/crm/booking/bookings";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.ListBookingsResponse>(path, params, config);
  }

  /** POST /crm/booking/services/receipts/{service} */
  async recoverBookingServiceReceipt(service: string, body: NativeApi.RecoverBookingServiceReceiptData["body"], config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.RecoverBookingServiceReceiptResponse> {
    const path = this.buildPath("/crm/booking/services/receipts/{service}", { "service": service });
    config = this._nativeConfig(config, true);
    return this._sendNative<NativeApi.RecoverBookingServiceReceiptResponse>("POST", path, body, config);
  }
}
