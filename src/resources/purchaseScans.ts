// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1PurchaseScansArchiveData, PublicApiV1PurchaseScansArchiveResponses, PublicApiV1PurchaseScansConvertData, PublicApiV1PurchaseScansConvertResponses, PublicApiV1PurchaseScansCreateResponses, PublicApiV1PurchaseScansDuplicateResolutionData, PublicApiV1PurchaseScansDuplicateResolutionResponses, PublicApiV1PurchaseScansRestoreData, PublicApiV1PurchaseScansRestoreResponses, PublicApiV1PurchaseScansRetryData, PublicApiV1PurchaseScansRetryResponses, PublicApiV1PurchaseScansReviewData, PublicApiV1PurchaseScansReviewResponses, PublicApiV1PurchaseScansShowResponses, PublicApiV1PurchaseScansStatsResponses } from "../generated/types.gen.js";


export class PurchaseScansResource extends BaseResource {
  /** Archive a purchase scan */
  async archive(company: string, purchaseScan: string, body?: PublicApiV1PurchaseScansArchiveData["body"], config?: RequestConfig): Promise<PublicApiV1PurchaseScansArchiveResponses[200]> {
    const path = this.buildPath("/companies/{company}/purchase-scans/{purchase_scan}", { "company": company, "purchase_scan": purchaseScan });
    return this._send<PublicApiV1PurchaseScansArchiveResponses[200]>("DELETE", path, body, config, { idempotent: true });
  }

  /** Retrieve a purchase scan */
  async show(company: string, purchaseScan: string, config?: RequestConfig): Promise<PublicApiV1PurchaseScansShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/purchase-scans/{purchase_scan}", { "company": company, "purchase_scan": purchaseScan });
    return this._get<PublicApiV1PurchaseScansShowResponses[200]>(path, undefined, config);
  }

  /** Create the expense from a scan */
  async convert(company: string, purchaseScan: string, body?: PublicApiV1PurchaseScansConvertData["body"], config?: RequestConfig): Promise<PublicApiV1PurchaseScansConvertResponses[200]> {
    const path = this.buildPath("/companies/{company}/purchase-scans/{purchase_scan}/convert", { "company": company, "purchase_scan": purchaseScan });
    return this._send<PublicApiV1PurchaseScansConvertResponses[200]>("POST", path, body, config);
  }

  /**
   * Download the original document
   * Answers with JSON metadata by default; send `config.headers: { Accept: "image/png" }` (or another image type) to get the stored bytes.
   */
  async source(company: string, purchaseScan: string, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/purchase-scans/{purchase_scan}/source", { "company": company, "purchase_scan": purchaseScan });
    return this._binary(path, "GET", undefined, undefined, config);
  }

  /** Get purchase scanner stats */
  async stats(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1PurchaseScansStatsResponses[200]> {
    const path = this.buildPath("/companies/{company}/purchase-scans/stats", { "company": company });
    return this._get<PublicApiV1PurchaseScansStatsResponses[200]>(path, params, config);
  }

  /** Resolve a duplicate purchase scan */
  async duplicateResolution(company: string, purchaseScan: string, body?: PublicApiV1PurchaseScansDuplicateResolutionData["body"], config?: RequestConfig): Promise<PublicApiV1PurchaseScansDuplicateResolutionResponses[200]> {
    const path = this.buildPath("/companies/{company}/purchase-scans/{purchase_scan}/duplicate-resolution", { "company": company, "purchase_scan": purchaseScan });
    return this._send<PublicApiV1PurchaseScansDuplicateResolutionResponses[200]>("POST", path, body, config);
  }

  /** Restore an archived purchase scan */
  async restore(company: string, purchaseScan: string, body?: PublicApiV1PurchaseScansRestoreData["body"], config?: RequestConfig): Promise<PublicApiV1PurchaseScansRestoreResponses[200]> {
    const path = this.buildPath("/companies/{company}/purchase-scans/{purchase_scan}/restore", { "company": company, "purchase_scan": purchaseScan });
    return this._send<PublicApiV1PurchaseScansRestoreResponses[200]>("POST", path, body, config);
  }

  /** Retry a failed purchase scan */
  async retry(company: string, purchaseScan: string, body?: PublicApiV1PurchaseScansRetryData["body"], config?: RequestConfig): Promise<PublicApiV1PurchaseScansRetryResponses[202]> {
    const path = this.buildPath("/companies/{company}/purchase-scans/{purchase_scan}/retry", { "company": company, "purchase_scan": purchaseScan });
    return this._send<PublicApiV1PurchaseScansRetryResponses[202]>("POST", path, body, config);
  }

  /** Save the review of a purchase scan */
  async review(company: string, purchaseScan: string, body?: PublicApiV1PurchaseScansReviewData["body"], config?: RequestConfig): Promise<PublicApiV1PurchaseScansReviewResponses[200]> {
    const path = this.buildPath("/companies/{company}/purchase-scans/{purchase_scan}/review", { "company": company, "purchase_scan": purchaseScan });
    return this._send<PublicApiV1PurchaseScansReviewResponses[200]>("PATCH", path, body, config);
  }

  /** List purchase scans */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/purchase-scans", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Upload documents to the purchase scanner */
  async create(company: string, formData: FormData, config?: RequestConfig): Promise<PublicApiV1PurchaseScansCreateResponses[202]> {
    const path = this.buildPath("/companies/{company}/purchase-scans", { "company": company });
    return this._sendForm<PublicApiV1PurchaseScansCreateResponses[202]>(path, formData, config);
  }
}
