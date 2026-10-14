// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class TransportDocumentsResource extends BaseResource {
  /** Cancel a transport document */
  async cancel(transportDocument: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/transport_documents/{transport_document}/cancel", { "transport_document": transportDocument });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Close a transport document */
  async close(transportDocument: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/transport_documents/{transport_document}/close", { "transport_document": transportDocument });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Create a transport document */
  async create(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/transport_documents";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all transport documents */
  async index(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/transport_documents", params, "starting_after", config);
  }

  /** Delete a draft transport document */
  async delete(transportDocument: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/transport_documents/{transport_document}", { "transport_document": transportDocument });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a transport document */
  async show(transportDocument: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/transport_documents/{transport_document}", { "transport_document": transportDocument });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a draft transport document */
  async update(transportDocument: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/transport_documents/{transport_document}", { "transport_document": transportDocument });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** Download transport document issuance proof */
  async issuanceProof(transportDocument: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/transport_documents/{transport_document}/issuance_proof", { "transport_document": transportDocument });
    return this._binary(path, "GET", params, undefined, config);
  }

  /** Download transport document PDF */
  async pdf(transportDocument: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/transport_documents/{transport_document}/pdf", { "transport_document": transportDocument });
    return this._binary(path, "GET", params, undefined, config);
  }

  /** List transport document issuance evidence */
  async evidence(transportDocument: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/transport_documents/{transport_document}/evidence", { "transport_document": transportDocument });
    return this._get<unknown>(path, undefined, config);
  }

  /** Download transport document QR code */
  async qr(transportDocument: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/transport_documents/{transport_document}/qr", { "transport_document": transportDocument });
    return this._binary(path, "GET", params, undefined, config);
  }

  /** List transport document statuses */
  async statuses(config?: RequestConfig): Promise<unknown> {
    const path = "/transport_documents/statuses";
    return this._get<unknown>(path, undefined, config);
  }

  /** Issue a transport document */
  async issue(transportDocument: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/transport_documents/{transport_document}/issue", { "transport_document": transportDocument });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Modify an issued transport document */
  async modify(transportDocument: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/transport_documents/{transport_document}/modify", { "transport_document": transportDocument });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Reopen a transport document */
  async reopen(transportDocument: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/transport_documents/{transport_document}/reopen", { "transport_document": transportDocument });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Send a transport document by email */
  async send(transportDocument: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/transport_documents/{transport_document}/send", { "transport_document": transportDocument });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Mark a transport document as superseded */
  async supersede(transportDocument: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/transport_documents/{transport_document}/supersede", { "transport_document": transportDocument });
    return this._send<unknown>("POST", path, body, config);
  }
}
