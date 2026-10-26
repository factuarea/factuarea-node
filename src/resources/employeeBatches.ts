// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1EmployeeBatchesCancelData, PublicApiV1EmployeeBatchesCancelResponses, PublicApiV1EmployeeBatchesConfirmData, PublicApiV1EmployeeBatchesConfirmResponses, PublicApiV1EmployeeBatchesPrepareData, PublicApiV1EmployeeBatchesPrepareResponses, PublicApiV1EmployeeBatchesRefreshQuoteData, PublicApiV1EmployeeBatchesRefreshQuoteResponses, PublicApiV1EmployeeBatchesShowResponses } from "../generated/types.gen.js";


export class EmployeeBatchesResource extends BaseResource {
  /** Cancel an employee batch */
  async cancel(company: string, id: string, body?: PublicApiV1EmployeeBatchesCancelData["body"], config?: RequestConfig): Promise<PublicApiV1EmployeeBatchesCancelResponses[200 | 202]> {
    const path = this.buildPath("/companies/{company}/employee-batches/{id}/cancel", { "company": company, "id": id });
    return this._send<PublicApiV1EmployeeBatchesCancelResponses[200 | 202]>("POST", path, body, config);
  }

  /** Confirm an employee batch */
  async confirm(company: string, id: string, body?: PublicApiV1EmployeeBatchesConfirmData["body"], config?: RequestConfig): Promise<PublicApiV1EmployeeBatchesConfirmResponses[200 | 202]> {
    const path = this.buildPath("/companies/{company}/employee-batches/{id}/confirm", { "company": company, "id": id });
    return this._send<PublicApiV1EmployeeBatchesConfirmResponses[200 | 202]>("POST", path, body, config);
  }

  /** List an employee batch */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/employee-batches", { "company": company });
    return this._paginate<unknown>(path, params, "cursor", config);
  }

  /** Prepare an employee batch */
  async prepare(company: string, body?: PublicApiV1EmployeeBatchesPrepareData["body"], config?: RequestConfig): Promise<PublicApiV1EmployeeBatchesPrepareResponses[201]> {
    const path = this.buildPath("/companies/{company}/employee-batches", { "company": company });
    return this._send<PublicApiV1EmployeeBatchesPrepareResponses[201]>("POST", path, body, config);
  }

  /** Refresh the quote for an employee batch */
  async refreshQuote(company: string, id: string, body?: PublicApiV1EmployeeBatchesRefreshQuoteData["body"], config?: RequestConfig): Promise<PublicApiV1EmployeeBatchesRefreshQuoteResponses[200]> {
    const path = this.buildPath("/companies/{company}/employee-batches/{id}/quote", { "company": company, "id": id });
    return this._send<PublicApiV1EmployeeBatchesRefreshQuoteResponses[200]>("POST", path, body, config);
  }

  /** Retrieve an employee batch */
  async show(company: string, id: string, config?: RequestConfig): Promise<PublicApiV1EmployeeBatchesShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/employee-batches/{id}", { "company": company, "id": id });
    return this._get<PublicApiV1EmployeeBatchesShowResponses[200]>(path, undefined, config);
  }
}
