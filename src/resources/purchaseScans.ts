// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class PurchaseScansResource extends BaseResource {
  /** Archive a purchase scan */
  async archive(purchaseScan: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/purchase_scans/{purchase_scan}", { "purchase_scan": purchaseScan });
    return this._send<unknown>("DELETE", path, body, config);
  }

  /** Retrieve a purchase scan */
  async show(purchaseScan: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/purchase_scans/{purchase_scan}", { "purchase_scan": purchaseScan });
    return this._get<unknown>(path, undefined, config);
  }

  /** Create the purchase invoice from a scan */
  async convert(purchaseScan: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/purchase_scans/{purchase_scan}/convert", { "purchase_scan": purchaseScan });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Download the original document */
  async source(purchaseScan: string, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/purchase_scans/{purchase_scan}/source", { "purchase_scan": purchaseScan });
    return this._binary(path, "GET", undefined, undefined, config);
  }

  /** Get purchase scanner stats */
  async stats(config?: RequestConfig): Promise<unknown> {
    const path = "/purchase_scans/stats";
    return this._get<unknown>(path, undefined, config);
  }

  /** Resolve a duplicate purchase scan */
  async duplicateResolution(purchaseScan: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/purchase_scans/{purchase_scan}/duplicate_resolution", { "purchase_scan": purchaseScan });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Restore an archived purchase scan */
  async restore(purchaseScan: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/purchase_scans/{purchase_scan}/restore", { "purchase_scan": purchaseScan });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Retry a failed purchase scan */
  async retry(purchaseScan: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/purchase_scans/{purchase_scan}/retry", { "purchase_scan": purchaseScan });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Save the review of a purchase scan */
  async review(purchaseScan: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/purchase_scans/{purchase_scan}/review", { "purchase_scan": purchaseScan });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** List purchase scans */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/purchase_scans", params, "starting_after", config);
  }

  /** Upload documents to the purchase scanner */
  async create(formData: FormData, config?: RequestConfig): Promise<unknown> {
    const path = "/purchase_scans";
    return this._sendForm<unknown>(path, formData, config);
  }
}
