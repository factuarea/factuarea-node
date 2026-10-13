// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


import type * as NativeApi from "../generated/types.gen.js";

export class ServiceLevelResource extends BaseResource {
  /** SLA de servicio: configure */
  async configureServiceSla(ticket: string, body: NativeApi.ConfigureServiceSlaData["body"], config?: RequestConfig): Promise<NativeApi.ConfigureServiceSlaResponse> {
    const path = this.buildPath("/crm/service-tickets/{ticket}/sla", { "ticket": ticket });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.ConfigureServiceSlaResponse>("PUT", path, body, config);
  }

  /** SLA de servicio: status */
  async getServiceSlaStatus(ticket: string, config?: RequestConfig): Promise<NativeApi.GetServiceSlaStatusResponse> {
    const path = this.buildPath("/crm/service-tickets/{ticket}/sla", { "ticket": ticket });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.GetServiceSlaStatusResponse>(path, undefined, config);
  }

  /** SLA de servicio: history */
  async getServiceSlaHistory(ticket: string, params?: NativeApi.GetServiceSlaHistoryData["query"], config?: RequestConfig): Promise<NativeApi.GetServiceSlaHistoryResponse> {
    const path = this.buildPath("/crm/service-tickets/{ticket}/sla/history", { "ticket": ticket });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.GetServiceSlaHistoryResponse>(path, params, config);
  }

  /** SLA de servicio: calendars */
  async listServiceCalendars(params?: NativeApi.ListServiceCalendarsData["query"], config?: RequestConfig): Promise<NativeApi.ListServiceCalendarsResponse> {
    const path = "/crm/service-calendars";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.ListServiceCalendarsResponse>(path, params, config);
  }

  /** SLA de servicio: update_calendar */
  async updateServiceCalendar(body: NativeApi.UpdateServiceCalendarData["body"], config?: RequestConfig): Promise<NativeApi.UpdateServiceCalendarResponse> {
    const path = "/crm/service-calendars";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.UpdateServiceCalendarResponse>("PUT", path, body, config);
  }

  /** SLA de servicio: pause */
  async pauseServiceSla(ticket: string, body: NativeApi.PauseServiceSlaData["body"], config?: RequestConfig): Promise<NativeApi.PauseServiceSlaResponse> {
    const path = this.buildPath("/crm/service-tickets/{ticket}/sla/pause", { "ticket": ticket });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.PauseServiceSlaResponse>("POST", path, body, config);
  }

  /** SLA de servicio: resume */
  async resumeServiceSla(ticket: string, body: NativeApi.ResumeServiceSlaData["body"], config?: RequestConfig): Promise<NativeApi.ResumeServiceSlaResponse> {
    const path = this.buildPath("/crm/service-tickets/{ticket}/sla/resume", { "ticket": ticket });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.ResumeServiceSlaResponse>("POST", path, body, config);
  }
}
