import type { HttpClient } from "../../core/http-client.js";
import type { RequestConfig } from "../../core/resource.js";
import { CustomerServiceTransport } from "./transport.js";
import type { CustomerServiceWriteIntent } from "./intent.js";
import type { AttachServiceTicketDocumentRequest, CustomerServiceRecoveryConfig, CustomerServiceResponse, CustomerServiceWriteConfig, DetachServiceTicketDocumentRequest, MoveServiceTicketToStageRequest, ServiceTicket, ServiceTicketId, ServiceTicketListQuery, ServiceTicketPage, ServiceTicketPageQuery, ServiceTicketReceipt, ServiceTicketTimeline } from "./types.js";
import * as c from "./codecs.js";
import * as w from "./wire.js";

/** Six current native v1 operations. The owner remains responsible for stage policy, waiting facts and document admission. */
export class CustomerServiceResource {
  private readonly transport: CustomerServiceTransport;
  constructor(client: HttpClient) { this.transport = new CustomerServiceTransport(client); }

  async get(ticketId: ServiceTicketId, config?: RequestConfig): Promise<CustomerServiceResponse<ServiceTicket>> {
    const id = w.id(ticketId).toLowerCase();
    return this.transport.read(`/crm/service-tickets/${id}`, {}, value => {
      const result = c.ticket(value);
      if (!w.sameId(result.id, id)) throw new TypeError("Factuarea: ticket read belongs to another identity.");
      return result;
    }, config);
  }

  async list(query: ServiceTicketListQuery = {}, config?: RequestConfig): Promise<CustomerServiceResponse<ServiceTicketPage>> {
    const v = w.record(query, [], ["page", "per_page", "status", "sort", "direction"]);
    const pagination = w.page(v.page === undefined ? 1 : v.page, v.per_page === undefined ? 50 : v.per_page), wire: Record<string, unknown> = { ...pagination };
    if (w.has(v, "status")) wire.status = w.oneOf(v.status, ["new", "assigned", "pending", "closed", "rejected", "duplicate"] as const);
    if (w.has(v, "sort")) wire.sort = w.oneOf(v.sort, ["id", "version", "title", "status", "priority", "created_at", "updated_at"] as const);
    if (w.has(v, "direction")) wire.direction = w.oneOf(v.direction, ["asc", "desc"] as const);
    return this.transport.read("/crm/service-tickets", wire, value => {
      const result = c.ticketPage(value);
      if (result.page !== pagination.page || result.per_page !== pagination.per_page) throw new TypeError("Factuarea: ticket response belongs to another page.");
      return result;
    }, config);
  }

  /** Offset pages recheck current ACL; they do not constitute a cross-page snapshot. */
  async *iterate(query: ServiceTicketListQuery = {}, config?: RequestConfig, maxPages = 1000): AsyncGenerator<ServiceTicket> {
    w.integer(maxPages);
    w.record(query, [], ["page", "per_page", "status", "sort", "direction"]);
    const original = { ...query }, first = w.page(original.page === undefined ? 1 : original.page, original.per_page === undefined ? 50 : original.per_page).page;
    for (let offset = 0; offset < maxPages; offset++) {
      const page = first + offset, result = (await this.list({ ...original, page }, config)).data;
      yield* result.items;
      if (page * result.per_page >= result.total) return;
      if (result.items.length === 0) throw new TypeError("Factuarea: ticket pagination made no progress despite its total.");
    }
    throw new TypeError("Factuarea: ticket iteration reached its explicit maximum page count.");
  }

  async timeline(ticketId: ServiceTicketId, query: ServiceTicketPageQuery = {}, config?: RequestConfig): Promise<CustomerServiceResponse<ServiceTicketTimeline>> {
    const id = w.id(ticketId).toLowerCase(), v = w.record(query, [], ["page", "per_page"]);
    const pagination = w.page(v.page === undefined ? 1 : v.page, v.per_page === undefined ? 50 : v.per_page);
    return this.transport.read(`/crm/service-tickets/${id}/timeline`, pagination, value => {
      const result = c.timeline(value);
      if (!w.sameId(result.id, id) || result.page !== pagination.page || result.per_page !== pagination.per_page) throw new TypeError("Factuarea: timeline differs from its original parent/query.");
      return result;
    }, config);
  }

  moveToStage(ticketId: ServiceTicketId, body: MoveServiceTicketToStageRequest, config: CustomerServiceWriteConfig): Promise<CustomerServiceResponse<ServiceTicketReceipt>> {
    return this.transport.write("moveToStage", ticketId, body, config);
  }
  attachDocument(ticketId: ServiceTicketId, body: AttachServiceTicketDocumentRequest, config: CustomerServiceWriteConfig): Promise<CustomerServiceResponse<ServiceTicketReceipt>> {
    return this.transport.write("attachDocument", ticketId, body, config);
  }
  /** Use the attachment id from an authorized get/timeline result and the current ticket CAS. */
  detachDocument(ticketId: ServiceTicketId, body: DetachServiceTicketDocumentRequest, config: CustomerServiceWriteConfig): Promise<CustomerServiceResponse<ServiceTicketReceipt>> {
    return this.transport.write("detachDocument", ticketId, body, config);
  }
  recover(intent: CustomerServiceWriteIntent, config?: CustomerServiceRecoveryConfig): Promise<CustomerServiceResponse<ServiceTicketReceipt>> {
    return this.transport.recover(intent, config);
  }
}
