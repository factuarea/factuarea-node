// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


import type * as NativeApi from "../generated/types.gen.js";

export class CustomerServiceResource extends BaseResource {
  /** Tickets de clientes: add note */
  async addServiceNote(ticket: string, body: NativeApi.AddServiceNoteData["body"], config?: RequestConfig): Promise<NativeApi.AddServiceNoteResponse> {
    const path = this.buildPath("/crm/service-tickets/{ticket}/notes", { "ticket": ticket });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.AddServiceNoteResponse>("POST", path, body, config);
  }

  /** Tickets de clientes: add watcher */
  async addServiceWatcher(ticket: string, body: NativeApi.AddServiceWatcherData["body"], config?: RequestConfig): Promise<NativeApi.AddServiceWatcherResponse> {
    const path = this.buildPath("/crm/service-tickets/{ticket}/watchers", { "ticket": ticket });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.AddServiceWatcherResponse>("POST", path, body, config);
  }

  /** Tickets de clientes: archive */
  async archiveServiceTicket(ticket: string, body: NativeApi.ArchiveServiceTicketData["body"], config?: RequestConfig): Promise<NativeApi.ArchiveServiceTicketResponse> {
    const path = this.buildPath("/crm/service-tickets/{ticket}/archive", { "ticket": ticket });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.ArchiveServiceTicketResponse>("POST", path, body, config);
  }

  /** Tickets de clientes: assign */
  async assignServiceTicket(ticket: string, body: NativeApi.AssignServiceTicketData["body"], config?: RequestConfig): Promise<NativeApi.AssignServiceTicketResponse> {
    const path = this.buildPath("/crm/service-tickets/{ticket}/assign", { "ticket": ticket });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.AssignServiceTicketResponse>("POST", path, body, config);
  }

  /** Tickets de clientes: attach document */
  async attachServiceTicketDocument(ticket: string, body: NativeApi.AttachServiceTicketDocumentData["body"], config?: RequestConfig): Promise<NativeApi.AttachServiceTicketDocumentResponse> {
    const path = this.buildPath("/crm/service-tickets/{ticket}/attachments", { "ticket": ticket });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.AttachServiceTicketDocumentResponse>("POST", path, body, config);
  }

  /** Tickets de clientes: close */
  async closeServiceTicket(ticket: string, body: NativeApi.CloseServiceTicketData["body"], config?: RequestConfig): Promise<NativeApi.CloseServiceTicketResponse> {
    const path = this.buildPath("/crm/service-tickets/{ticket}/close", { "ticket": ticket });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CloseServiceTicketResponse>("POST", path, body, config);
  }

  /** Tickets de clientes: create */
  async createServiceTicket(body: NativeApi.CreateServiceTicketData["body"], config?: RequestConfig): Promise<NativeApi.CreateServiceTicketResponse> {
    const path = "/crm/service-tickets";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CreateServiceTicketResponse>("POST", path, body, config);
  }

  /** Tickets de clientes: list */
  async listServiceTickets(params?: NativeApi.ListServiceTicketsData["query"], config?: RequestConfig): Promise<NativeApi.ListServiceTicketsResponse> {
    const path = "/crm/service-tickets";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.ListServiceTicketsResponse>(path, params, config);
  }

  /** Tickets de clientes: detach document */
  async detachServiceTicketDocument(ticket: string, body: NativeApi.DetachServiceTicketDocumentData["body"], config?: RequestConfig): Promise<NativeApi.DetachServiceTicketDocumentResponse> {
    const path = this.buildPath("/crm/service-tickets/{ticket}/attachments/remove", { "ticket": ticket });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.DetachServiceTicketDocumentResponse>("POST", path, body, config);
  }

  /** Horas facturables del ticket */
  async getServiceBillableTime(ticket: string, params?: NativeApi.GetServiceBillableTimeData["query"], config?: RequestConfig): Promise<NativeApi.GetServiceBillableTimeResponse> {
    const path = this.buildPath("/crm/service-tickets/{ticket}/billable-time", { "ticket": ticket });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.GetServiceBillableTimeResponse>(path, params, config);
  }

  /** Consultar el recibo original link */
  async getOriginalServiceTicketTaskLinkReceipt(ticket: string, body: NativeApi.GetOriginalServiceTicketTaskLinkReceiptData["body"], config?: RequestConfig): Promise<NativeApi.GetOriginalServiceTicketTaskLinkReceiptResponse> {
    const path = this.buildPath("/crm/service-tickets/{ticket}/task-time/link/original-receipt", { "ticket": ticket });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.GetOriginalServiceTicketTaskLinkReceiptResponse>("POST", path, body, config);
  }

  /** Consultar el recibo original unlink */
  async getOriginalServiceTicketTaskUnlinkReceipt(ticket: string, body: NativeApi.GetOriginalServiceTicketTaskUnlinkReceiptData["body"], config?: RequestConfig): Promise<NativeApi.GetOriginalServiceTicketTaskUnlinkReceiptResponse> {
    const path = this.buildPath("/crm/service-tickets/{ticket}/task-time/unlink/original-receipt", { "ticket": ticket });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.GetOriginalServiceTicketTaskUnlinkReceiptResponse>("POST", path, body, config);
  }

  /** Tickets de clientes: timeline */
  async getServiceTicketTimeline(ticket: string, params?: NativeApi.GetServiceTicketTimelineData["query"], config?: RequestConfig): Promise<NativeApi.GetServiceTicketTimelineResponse> {
    const path = this.buildPath("/crm/service-tickets/{ticket}/timeline", { "ticket": ticket });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.GetServiceTicketTimelineResponse>(path, params, config);
  }

  /** Tickets de clientes: get */
  async getServiceTicket(ticket: string, config?: RequestConfig): Promise<NativeApi.GetServiceTicketResponse> {
    const path = this.buildPath("/crm/service-tickets/{ticket}", { "ticket": ticket });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.GetServiceTicketResponse>(path, undefined, config);
  }

  /** Tickets de clientes: update */
  async updateServiceTicket(ticket: string, body: NativeApi.UpdateServiceTicketData["body"], config?: RequestConfig): Promise<NativeApi.UpdateServiceTicketResponse> {
    const path = this.buildPath("/crm/service-tickets/{ticket}", { "ticket": ticket });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.UpdateServiceTicketResponse>("PATCH", path, body, config);
  }

  /** Parte de horas del ticket */
  async getServiceTimesheet(ticket: string, params?: NativeApi.GetServiceTimesheetData["query"], config?: RequestConfig): Promise<NativeApi.GetServiceTimesheetResponse> {
    const path = this.buildPath("/crm/service-tickets/{ticket}/timesheet", { "ticket": ticket });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.GetServiceTimesheetResponse>(path, params, config);
  }

  /** Vincular una Task al ticket */
  async linkServiceTicketTask(ticket: string, body: NativeApi.LinkServiceTicketTaskData["body"], config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.LinkServiceTicketTaskResponse> {
    const path = this.buildPath("/crm/service-tickets/{ticket}/tasks/link", { "ticket": ticket });
    config = this._nativeConfig(config, true);
    return this._sendNative<NativeApi.LinkServiceTicketTaskResponse>("POST", path, body, config);
  }

  /** Tasks vinculadas al ticket */
  async listServiceTicketTasks(ticket: string, config?: RequestConfig): Promise<NativeApi.ListServiceTicketTasksResponse> {
    const path = this.buildPath("/crm/service-tickets/{ticket}/tasks", { "ticket": ticket });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.ListServiceTicketTasksResponse>(path, undefined, config);
  }

  /** Tickets de clientes: move to stage */
  async moveServiceTicketToStage(ticket: string, body: NativeApi.MoveServiceTicketToStageData["body"], config?: RequestConfig): Promise<NativeApi.MoveServiceTicketToStageResponse> {
    const path = this.buildPath("/crm/service-tickets/{ticket}/move-to-stage", { "ticket": ticket });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.MoveServiceTicketToStageResponse>("POST", path, body, config);
  }

  /** Previsualizar el borrador de horas */
  async previewServiceTimeInvoice(ticket: string, body: NativeApi.PreviewServiceTimeInvoiceData["body"], config?: RequestConfig): Promise<NativeApi.PreviewServiceTimeInvoiceResponse> {
    const path = this.buildPath("/crm/service-tickets/{ticket}/time-invoice-preview", { "ticket": ticket });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.PreviewServiceTimeInvoiceResponse>("POST", path, body, config);
  }

  /** Tickets de clientes: remove watcher */
  async removeServiceWatcher(ticket: string, body: NativeApi.RemoveServiceWatcherData["body"], config?: RequestConfig): Promise<NativeApi.RemoveServiceWatcherResponse> {
    const path = this.buildPath("/crm/service-tickets/{ticket}/watchers/remove", { "ticket": ticket });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.RemoveServiceWatcherResponse>("POST", path, body, config);
  }

  /** Tickets de clientes: reopen */
  async reopenServiceTicket(ticket: string, body: NativeApi.ReopenServiceTicketData["body"], config?: RequestConfig): Promise<NativeApi.ReopenServiceTicketResponse> {
    const path = this.buildPath("/crm/service-tickets/{ticket}/reopen", { "ticket": ticket });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.ReopenServiceTicketResponse>("POST", path, body, config);
  }

  /** Tickets de clientes: resolve */
  async resolveServiceTicket(ticket: string, body: NativeApi.ResolveServiceTicketData["body"], config?: RequestConfig): Promise<NativeApi.ResolveServiceTicketResponse> {
    const path = this.buildPath("/crm/service-tickets/{ticket}/resolve", { "ticket": ticket });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.ResolveServiceTicketResponse>("POST", path, body, config);
  }

  /** Tickets de clientes: send reply */
  async sendServiceReply(ticket: string, body: NativeApi.SendServiceReplyData["body"], config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.SendServiceReplyResponse> {
    const path = this.buildPath("/crm/service-tickets/{ticket}/replies", { "ticket": ticket });
    config = this._nativeConfig(config, true);
    return this._sendNative<NativeApi.SendServiceReplyResponse>("POST", path, body, config);
  }

  /** Desvincular una Task del ticket */
  async unlinkServiceTicketTask(ticket: string, body: NativeApi.UnlinkServiceTicketTaskData["body"], config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.UnlinkServiceTicketTaskResponse> {
    const path = this.buildPath("/crm/service-tickets/{ticket}/tasks/unlink", { "ticket": ticket });
    config = this._nativeConfig(config, true);
    return this._sendNative<NativeApi.UnlinkServiceTicketTaskResponse>("POST", path, body, config);
  }
}
