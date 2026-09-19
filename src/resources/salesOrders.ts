// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class SalesOrdersLinesResource extends BaseResource {
  /** Add a line to a sales order */
  async create(company: string, salesOrder: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/sales-orders/{sales_order}/lines", { "company": company, "sales_order": salesOrder });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List the lines of a sales order */
  async list(company: string, salesOrder: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/sales-orders/{sales_order}/lines", { "company": company, "sales_order": salesOrder });
    return this._get<unknown>(path, undefined, config);
  }

  /** Delete a line of a sales order */
  async delete(company: string, salesOrder: string, line: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/sales-orders/{sales_order}/lines/{line}", { "company": company, "sales_order": salesOrder, "line": line });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Update a line of a sales order */
  async update(company: string, salesOrder: string, line: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/sales-orders/{sales_order}/lines/{line}", { "company": company, "sales_order": salesOrder, "line": line });
    return this._send<unknown>("PATCH", path, body, config);
  }
}

export class SalesOrdersBuyerResource extends BaseResource {
  /** Update the buyer of a sales order */
  async update(company: string, salesOrder: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/sales-orders/{sales_order}/buyer", { "company": company, "sales_order": salesOrder });
    return this._send<unknown>("PATCH", path, body, config);
  }
}

export class SalesOrdersShippingAddressResource extends BaseResource {
  /** Update the shipping address of a sales order */
  async update(company: string, salesOrder: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/sales-orders/{sales_order}/shipping-address", { "company": company, "sales_order": salesOrder });
    return this._send<unknown>("PATCH", path, body, config);
  }
}

export class SalesOrdersResource extends BaseResource {
  readonly lines: SalesOrdersLinesResource;
  readonly buyer: SalesOrdersBuyerResource;
  readonly shippingAddress: SalesOrdersShippingAddressResource;

  constructor(client: HttpClient) {
    super(client);
    this.lines = new SalesOrdersLinesResource(client);
    this.buyer = new SalesOrdersBuyerResource(client);
    this.shippingAddress = new SalesOrdersShippingAddressResource(client);
  }

  /** Bulk create sales orders */
  async bulkCreate(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/sales-orders/bulk-create", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Bulk delete sales orders */
  async bulkDelete(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/sales-orders/bulk-delete", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Bulk change sales order status */
  async bulkStatus(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/sales-orders/bulk-status", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Cancel a sales order */
  async cancel(company: string, salesOrder: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/sales-orders/{sales_order}/cancel", { "company": company, "sales_order": salesOrder });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Close a sales order */
  async close(company: string, salesOrder: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/sales-orders/{sales_order}/close", { "company": company, "sales_order": salesOrder });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Confirm a sales order */
  async confirm(company: string, salesOrder: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/sales-orders/{sales_order}/confirm", { "company": company, "sales_order": salesOrder });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Convert a sales order to a delivery note */
  async convertToDeliveryNote(company: string, salesOrder: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/sales-orders/{sales_order}/convert-to-delivery-note", { "company": company, "sales_order": salesOrder });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Convert a sales order to an invoice */
  async convertToInvoice(company: string, salesOrder: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/sales-orders/{sales_order}/convert-to-invoice", { "company": company, "sales_order": salesOrder });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Create a sales order */
  async create(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/sales-orders", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all sales orders */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/sales-orders", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after");
  }

  /** Delete a sales order */
  async delete(company: string, salesOrder: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/sales-orders/{sales_order}", { "company": company, "sales_order": salesOrder });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a sales order */
  async show(company: string, salesOrder: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/sales-orders/{sales_order}", { "company": company, "sales_order": salesOrder });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a sales order */
  async update(company: string, salesOrder: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/sales-orders/{sales_order}", { "company": company, "sales_order": salesOrder });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** Download sales order PDF */
  async pdf(company: string, salesOrder: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/sales-orders/{sales_order}/pdf", { "company": company, "sales_order": salesOrder });
    return this._binary(path, "GET", params, undefined, config);
  }

  /** Find a sales order by external id */
  async findByExternalId(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/sales-orders/find-by-external-id", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Retrieve sales order stats */
  async stats(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/sales-orders/stats", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** List sales order statuses */
  async statuses(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/sales-orders/statuses", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** Send a sales order */
  async send(company: string, salesOrder: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/sales-orders/{sales_order}/send", { "company": company, "sales_order": salesOrder });
    return this._send<unknown>("POST", path, body, config);
  }
}
