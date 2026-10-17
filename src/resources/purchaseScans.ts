// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class PurchaseScansResource extends BaseResource {
  /** Archive a purchase scan */
  async archive(company: string, purchaseScan: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-scans/{purchase_scan}", { "company": company, "purchase_scan": purchaseScan });
    return this._send<unknown>("DELETE", path, body, config, { idempotent: true });
  }

  /** Retrieve a purchase scan */
  async show(company: string, purchaseScan: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-scans/{purchase_scan}", { "company": company, "purchase_scan": purchaseScan });
    return this._get<unknown>(path, undefined, config);
  }

  /** Create the expense from a scan */
  async convert(company: string, purchaseScan: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-scans/{purchase_scan}/convert", { "company": company, "purchase_scan": purchaseScan });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Download the original document */
  async source(company: string, purchaseScan: string, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/purchase-scans/{purchase_scan}/source", { "company": company, "purchase_scan": purchaseScan });
    return this._binary(path, "GET", undefined, undefined, config);
  }

  /** Get purchase scanner stats */
  async stats(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-scans/stats", { "company": company });
    return this._get<unknown>(path, params, config);
  }

  /** Resolve a duplicate purchase scan */
  async duplicateResolution(company: string, purchaseScan: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-scans/{purchase_scan}/duplicate-resolution", { "company": company, "purchase_scan": purchaseScan });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Restore an archived purchase scan */
  async restore(company: string, purchaseScan: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-scans/{purchase_scan}/restore", { "company": company, "purchase_scan": purchaseScan });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Retry a failed purchase scan */
  async retry(company: string, purchaseScan: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-scans/{purchase_scan}/retry", { "company": company, "purchase_scan": purchaseScan });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Save the review of a purchase scan */
  async review(company: string, purchaseScan: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-scans/{purchase_scan}/review", { "company": company, "purchase_scan": purchaseScan });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** List purchase scans */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/purchase-scans", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Upload documents to the purchase scanner */
  async create(company: string, formData: FormData, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-scans", { "company": company });
    return this._sendForm<unknown>(path, formData, config);
  }
}
