// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class DeliveryNotesPackagesResource extends BaseResource {
  /** Add a package to a delivery note */
  async create(company: string, deliveryNote: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/packages", { "company": company, "delivery_note": deliveryNote });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List the packages of a delivery note */
  async list(company: string, deliveryNote: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/packages", { "company": company, "delivery_note": deliveryNote });
    return this._get<unknown>(path, undefined, config);
  }

  /** Delete a package of a delivery note */
  async delete(company: string, deliveryNote: string, packageParam: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/packages/{package}", { "company": company, "delivery_note": deliveryNote, "package": packageParam });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Update a package of a delivery note */
  async update(company: string, deliveryNote: string, packageParam: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/packages/{package}", { "company": company, "delivery_note": deliveryNote, "package": packageParam });
    return this._send<unknown>("PATCH", path, body, config);
  }
}

export class DeliveryNotesPickingListResource extends BaseResource {
  /** Download the picking list PDF */
  async pdf(company: string, deliveryNote: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/picking-list/pdf", { "company": company, "delivery_note": deliveryNote });
    return this._binary(path, "GET", params, undefined, config);
  }

  /** Open the picking list of a delivery note */
  async open(company: string, deliveryNote: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/picking-list", { "company": company, "delivery_note": deliveryNote });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Retrieve the picking list of a delivery note */
  async show(company: string, deliveryNote: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/picking-list", { "company": company, "delivery_note": deliveryNote });
    return this._get<unknown>(path, undefined, config);
  }
}

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

export class DeliveryNotesPickingQueueResource extends BaseResource {
  /** List the delivery note picking queue */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/delivery-notes/picking-queue", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after");
  }
}

export class DeliveryNotesPickingLinesResource extends BaseResource {
  /** Mark a picking line */
  async pick(company: string, deliveryNote: string, pickingLine: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/picking-lines/{picking_line}/pick", { "company": company, "delivery_note": deliveryNote, "picking_line": pickingLine });
    return this._send<unknown>("POST", path, body, config);
  }
}

export class DeliveryNotesShipmentResource extends BaseResource {
  /** Retrieve the shipment of a delivery note */
  async show(company: string, deliveryNote: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/shipment", { "company": company, "delivery_note": deliveryNote });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update the shipment of a delivery note */
  async update(company: string, deliveryNote: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/shipment", { "company": company, "delivery_note": deliveryNote });
    return this._send<unknown>("PATCH", path, body, config);
  }
}

export class DeliveryNotesFulfilmentStatusResource extends BaseResource {
  /** Transition the fulfilment status of a delivery note */
  async transition(company: string, deliveryNote: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/fulfilment-status", { "company": company, "delivery_note": deliveryNote });
    return this._send<unknown>("POST", path, body, config);
  }
}

export class DeliveryNotesResource extends BaseResource {
  readonly packages: DeliveryNotesPackagesResource;
  readonly pickingList: DeliveryNotesPickingListResource;
  readonly signatureAudits: DeliveryNotesSignatureAuditsResource;
  readonly publicLink: DeliveryNotesPublicLinkResource;
  readonly pickingQueue: DeliveryNotesPickingQueueResource;
  readonly pickingLines: DeliveryNotesPickingLinesResource;
  readonly shipment: DeliveryNotesShipmentResource;
  readonly fulfilmentStatus: DeliveryNotesFulfilmentStatusResource;

  constructor(client: HttpClient) {
    super(client);
    this.packages = new DeliveryNotesPackagesResource(client);
    this.pickingList = new DeliveryNotesPickingListResource(client);
    this.signatureAudits = new DeliveryNotesSignatureAuditsResource(client);
    this.publicLink = new DeliveryNotesPublicLinkResource(client);
    this.pickingQueue = new DeliveryNotesPickingQueueResource(client);
    this.pickingLines = new DeliveryNotesPickingLinesResource(client);
    this.shipment = new DeliveryNotesShipmentResource(client);
    this.fulfilmentStatus = new DeliveryNotesFulfilmentStatusResource(client);
  }

  /** Bulk delete delivery notes */
  async bulkDelete(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/delivery_notes/bulk-delete";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Bulk download delivery note PDFs */
  async bulkPdf(body?: unknown, config?: RequestConfig): Promise<BinaryResponse> {
    const path = "/delivery_notes/bulk-pdf";
    return this._binary(path, "POST", undefined, body, config);
  }

  /** Bulk send delivery notes */
  async bulkSend(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/delivery_notes/bulk-send";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Bulk change delivery note status */
  async bulkStatus(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/delivery_notes/bulk-status";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Cancel a delivery note */
  async cancel(deliveryNote: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/delivery_notes/{delivery_note}/cancel", { "delivery_note": deliveryNote });
    return this._send<unknown>("POST", path, undefined, config);
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

  /** Download the packing list PDF */
  async packingList(company: string, deliveryNote: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/packing-list", { "company": company, "delivery_note": deliveryNote });
    return this._binary(path, "GET", params, undefined, config);
  }

  /** Download the shipping label PDF */
  async shippingLabel(company: string, deliveryNote: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/shipping-label", { "company": company, "delivery_note": deliveryNote });
    return this._binary(path, "GET", params, undefined, config);
  }

  /** Duplicate a delivery note */
  async duplicate(deliveryNote: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/delivery_notes/{delivery_note}/duplicate", { "delivery_note": deliveryNote });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Find a delivery note by external ID */
  async findByExternalId(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/delivery_notes/find-by-external-id";
    return this._send<unknown>("POST", path, body, config);
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

  /** List delivery note fulfilment statuses */
  async fulfilmentStatuses(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/delivery-notes/fulfilment-statuses", { "company": company });
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
