// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class DeliveryNotesSignatureAuditsResource extends BaseResource {
  /** Forget delivery note signature PII */
  async forget(company: string, auditId: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/delivery-notes/signature-audits/{auditId}/forget", { "company": company, "auditId": auditId });
    return this._send<unknown>("POST", path, undefined, config);
  }
}

export class DeliveryNotesPublicLinkResource extends BaseResource {
  /** Retrieve a delivery note public link */
  async get(company: string, deliveryNote: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/public-link", { "company": company, "delivery_note": deliveryNote });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a delivery note public link */
  async update(company: string, deliveryNote: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/public-link", { "company": company, "delivery_note": deliveryNote });
    return this._send<unknown>("PATCH", path, body, config);
  }
}

export class DeliveryNotesResource extends BaseResource {
  readonly signatureAudits: DeliveryNotesSignatureAuditsResource;
  readonly publicLink: DeliveryNotesPublicLinkResource;

  constructor(client: HttpClient) {
    super(client);
    this.signatureAudits = new DeliveryNotesSignatureAuditsResource(client);
    this.publicLink = new DeliveryNotesPublicLinkResource(client);
  }

  /** Bulk delete delivery notes */
  async bulkDelete(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/delivery-notes/bulk-delete", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Bulk download delivery note PDFs */
  async bulkPdf(company: string, body?: unknown, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/delivery-notes/bulk-pdf", { "company": company });
    return this._binary(path, "POST", undefined, body, config);
  }

  /** Bulk send delivery notes */
  async bulkSend(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/delivery-notes/bulk-send", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Bulk change delivery note status */
  async bulkStatus(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/delivery-notes/bulk-status", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Cancel a delivery note */
  async cancel(company: string, deliveryNote: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/cancel", { "company": company, "delivery_note": deliveryNote });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Convert delivery note to invoice */
  async convert(company: string, deliveryNote: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/convert", { "company": company, "delivery_note": deliveryNote });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Create a delivery note */
  async create(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/delivery-notes", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all delivery notes */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/delivery-notes", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Delete a delivery note */
  async delete(company: string, deliveryNote: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}", { "company": company, "delivery_note": deliveryNote });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a delivery note */
  async show(company: string, deliveryNote: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}", { "company": company, "delivery_note": deliveryNote });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a delivery note */
  async update(company: string, deliveryNote: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}", { "company": company, "delivery_note": deliveryNote });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** Download delivery note PDF */
  async pdf(company: string, deliveryNote: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/pdf", { "company": company, "delivery_note": deliveryNote });
    return this._binary(path, "GET", params, undefined, config);
  }

  /** Duplicate a delivery note */
  async duplicate(company: string, deliveryNote: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/duplicate", { "company": company, "delivery_note": deliveryNote });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Find a delivery note by external ID */
  async findByExternalId(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/delivery-notes/find-by-external-id", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Retrieve delivery note stats */
  async stats(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/delivery-notes/stats", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** List delivery note statuses */
  async statuses(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/delivery-notes/statuses", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** Mark delivery note as delivered */
  async markDelivered(company: string, deliveryNote: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/mark-delivered", { "company": company, "delivery_note": deliveryNote });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Send a delivery note */
  async send(company: string, deliveryNote: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/send", { "company": company, "delivery_note": deliveryNote });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Sign a delivery note */
  async sign(company: string, deliveryNote: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/sign", { "company": company, "delivery_note": deliveryNote });
    return this._send<unknown>("POST", path, body, config);
  }
}
