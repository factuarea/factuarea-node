// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class PurchaseOrdersLinesResource extends BaseResource {
  /** Add a line to a purchase order */
  async create(company: string, purchaseOrder: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-orders/{purchase_order}/lines", { "company": company, "purchase_order": purchaseOrder });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List the lines of a purchase order */
  async list(company: string, purchaseOrder: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-orders/{purchase_order}/lines", { "company": company, "purchase_order": purchaseOrder });
    return this._get<unknown>(path, undefined, config);
  }

  /** Delete a line of a purchase order */
  async delete(company: string, purchaseOrder: string, line: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-orders/{purchase_order}/lines/{line}", { "company": company, "purchase_order": purchaseOrder, "line": line });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Update a line of a purchase order */
  async update(company: string, purchaseOrder: string, line: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-orders/{purchase_order}/lines/{line}", { "company": company, "purchase_order": purchaseOrder, "line": line });
    return this._send<unknown>("PATCH", path, body, config);
  }
}

export class PurchaseOrdersReceiptsResource extends BaseResource {
  /** List the goods receipts of a purchase order */
  async list(company: string, purchaseOrder: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/purchase-orders/{purchase_order}/receipts", { "company": company, "purchase_order": purchaseOrder });
    return this._paginate<unknown>(path, params, "starting_after");
  }

  /** Register a goods receipt for a purchase order */
  async create(company: string, purchaseOrder: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-orders/{purchase_order}/receipts", { "company": company, "purchase_order": purchaseOrder });
    return this._send<unknown>("POST", path, body, config);
  }
}

export class PurchaseOrdersResource extends BaseResource {
  readonly lines: PurchaseOrdersLinesResource;
  readonly receipts: PurchaseOrdersReceiptsResource;

  constructor(client: HttpClient) {
    super(client);
    this.lines = new PurchaseOrdersLinesResource(client);
    this.receipts = new PurchaseOrdersReceiptsResource(client);
  }

  /** Bulk create purchase orders */
  async bulkCreate(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-orders/bulk-create", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Bulk delete purchase orders */
  async bulkDelete(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-orders/bulk-delete", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Bulk change purchase order status */
  async bulkStatus(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-orders/bulk-status", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Cancel a purchase order */
  async cancel(company: string, purchaseOrder: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-orders/{purchase_order}/cancel", { "company": company, "purchase_order": purchaseOrder });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Close a purchase order */
  async close(company: string, purchaseOrder: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-orders/{purchase_order}/close", { "company": company, "purchase_order": purchaseOrder });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Confirm a purchase order */
  async confirm(company: string, purchaseOrder: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-orders/{purchase_order}/confirm", { "company": company, "purchase_order": purchaseOrder });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Create a purchase order */
  async create(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-orders", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all purchase orders */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/purchase-orders", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after");
  }

  /** Delete a purchase order */
  async delete(company: string, purchaseOrder: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-orders/{purchase_order}", { "company": company, "purchase_order": purchaseOrder });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a purchase order */
  async show(company: string, purchaseOrder: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-orders/{purchase_order}", { "company": company, "purchase_order": purchaseOrder });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a purchase order */
  async update(company: string, purchaseOrder: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-orders/{purchase_order}", { "company": company, "purchase_order": purchaseOrder });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** Download purchase order PDF */
  async pdf(company: string, purchaseOrder: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/purchase-orders/{purchase_order}/pdf", { "company": company, "purchase_order": purchaseOrder });
    return this._binary(path, "GET", params, undefined, config);
  }

  /** Find a purchase order by supplier reference */
  async findBySupplierReference(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-orders/find-by-supplier-reference", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Retrieve the three-way match of a purchase order */
  async match(company: string, purchaseOrder: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-orders/{purchase_order}/match", { "company": company, "purchase_order": purchaseOrder });
    return this._get<unknown>(path, undefined, config);
  }

  /** Retrieve purchase order stats */
  async stats(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-orders/stats", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** List purchase order statuses */
  async statuses(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-orders/statuses", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** Mark a purchase order as sent */
  async markAsSent(company: string, purchaseOrder: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-orders/{purchase_order}/mark-as-sent", { "company": company, "purchase_order": purchaseOrder });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Send a purchase order to its supplier */
  async send(company: string, purchaseOrder: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-orders/{purchase_order}/send", { "company": company, "purchase_order": purchaseOrder });
    return this._send<unknown>("POST", path, body, config);
  }
}
