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
  async forget(auditId: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/delivery_notes/signature-audits/{auditId}/forget", { "auditId": auditId });
    return this._send<unknown>("POST", path, undefined, config);
  }
}

export class DeliveryNotesPublicLinkResource extends BaseResource {
  /** Retrieve a delivery note public link */
  async get(deliveryNote: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/delivery_notes/{delivery_note}/public-link", { "delivery_note": deliveryNote });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a delivery note public link */
  async update(deliveryNote: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/delivery_notes/{delivery_note}/public-link", { "delivery_note": deliveryNote });
    return this._send<unknown>("PUT", path, body, config);
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
  async bulkDelete(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/delivery_notes/bulk-delete";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Cancel a delivery note */
  async cancel(deliveryNote: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/delivery_notes/{delivery_note}/cancel", { "delivery_note": deliveryNote });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Change delivery note status (deprecated) */
  async changeStatus(deliveryNote: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/delivery_notes/{delivery_note}/change_status", { "delivery_note": deliveryNote });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Convert delivery note to invoice */
  async convert(deliveryNote: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/delivery_notes/{delivery_note}/convert", { "delivery_note": deliveryNote });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Create a delivery note */
  async create(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/delivery_notes";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all delivery notes */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/delivery_notes", params, "starting_after");
  }

  /** Delete a delivery note */
  async delete(deliveryNote: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/delivery_notes/{delivery_note}", { "delivery_note": deliveryNote });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a delivery note */
  async show(deliveryNote: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/delivery_notes/{delivery_note}", { "delivery_note": deliveryNote });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a delivery note */
  async update(deliveryNote: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/delivery_notes/{delivery_note}", { "delivery_note": deliveryNote });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** Download delivery note PDF */
  async pdf(deliveryNote: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/delivery_notes/{delivery_note}/pdf", { "delivery_note": deliveryNote });
    return this._binary(path, "GET", params, undefined, config);
  }

  /** Duplicate a delivery note */
  async duplicate(deliveryNote: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/delivery_notes/{delivery_note}/duplicate", { "delivery_note": deliveryNote });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Retrieve delivery note stats */
  async stats(config?: RequestConfig): Promise<unknown> {
    const path = "/delivery_notes/stats";
    return this._get<unknown>(path, undefined, config);
  }

  /** List delivery note statuses */
  async statuses(config?: RequestConfig): Promise<unknown> {
    const path = "/delivery_notes/statuses";
    return this._get<unknown>(path, undefined, config);
  }

  /** Mark delivery note as delivered */
  async markDelivered(deliveryNote: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/delivery_notes/{delivery_note}/mark-delivered", { "delivery_note": deliveryNote });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Send a delivery note */
  async send(deliveryNote: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/delivery_notes/{delivery_note}/send", { "delivery_note": deliveryNote });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Sign a delivery note */
  async sign(deliveryNote: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/delivery_notes/{delivery_note}/sign", { "delivery_note": deliveryNote });
    return this._send<unknown>("POST", path, body, config);
  }
}
