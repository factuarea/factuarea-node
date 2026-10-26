// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1EmployeeSeatOfferRedemptionsCancelData, PublicApiV1EmployeeSeatOfferRedemptionsCancelResponses, PublicApiV1EmployeeSeatOfferRedemptionsConfirmData, PublicApiV1EmployeeSeatOfferRedemptionsConfirmResponses, PublicApiV1EmployeeSeatOfferRedemptionsPrepareData, PublicApiV1EmployeeSeatOfferRedemptionsPrepareResponses, PublicApiV1EmployeeSeatOfferRedemptionsRefreshQuoteData, PublicApiV1EmployeeSeatOfferRedemptionsRefreshQuoteResponses, PublicApiV1EmployeeSeatOfferRedemptionsShowResponses } from "../generated/types.gen.js";


export class EmployeeSeatOfferRedemptionsResource extends BaseResource {
  /** Cancel an employee-seat offer redemption */
  async cancel(company: string, id: string, body?: PublicApiV1EmployeeSeatOfferRedemptionsCancelData["body"], config?: RequestConfig): Promise<PublicApiV1EmployeeSeatOfferRedemptionsCancelResponses[200 | 202]> {
    const path = this.buildPath("/companies/{company}/employee-seat-offer-redemptions/{id}/cancel", { "company": company, "id": id });
    return this._send<PublicApiV1EmployeeSeatOfferRedemptionsCancelResponses[200 | 202]>("POST", path, body, config);
  }

  /** Confirm an employee-seat offer redemption */
  async confirm(company: string, id: string, body?: PublicApiV1EmployeeSeatOfferRedemptionsConfirmData["body"], config?: RequestConfig): Promise<PublicApiV1EmployeeSeatOfferRedemptionsConfirmResponses[200 | 202]> {
    const path = this.buildPath("/companies/{company}/employee-seat-offer-redemptions/{id}/confirm", { "company": company, "id": id });
    return this._send<PublicApiV1EmployeeSeatOfferRedemptionsConfirmResponses[200 | 202]>("POST", path, body, config);
  }

  /** List an employee-seat offer redemption */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/employee-seat-offer-redemptions", { "company": company });
    return this._paginate<unknown>(path, params, "cursor", config);
  }

  /** Prepare an employee-seat offer redemption */
  async prepare(company: string, body?: PublicApiV1EmployeeSeatOfferRedemptionsPrepareData["body"], config?: RequestConfig): Promise<PublicApiV1EmployeeSeatOfferRedemptionsPrepareResponses[201]> {
    const path = this.buildPath("/companies/{company}/employee-seat-offer-redemptions", { "company": company });
    return this._send<PublicApiV1EmployeeSeatOfferRedemptionsPrepareResponses[201]>("POST", path, body, config);
  }

  /** Refresh the quote for an employee-seat offer redemption */
  async refreshQuote(company: string, id: string, body?: PublicApiV1EmployeeSeatOfferRedemptionsRefreshQuoteData["body"], config?: RequestConfig): Promise<PublicApiV1EmployeeSeatOfferRedemptionsRefreshQuoteResponses[200]> {
    const path = this.buildPath("/companies/{company}/employee-seat-offer-redemptions/{id}/quote", { "company": company, "id": id });
    return this._send<PublicApiV1EmployeeSeatOfferRedemptionsRefreshQuoteResponses[200]>("POST", path, body, config);
  }

  /** Retrieve an employee-seat offer redemption */
  async show(company: string, id: string, config?: RequestConfig): Promise<PublicApiV1EmployeeSeatOfferRedemptionsShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/employee-seat-offer-redemptions/{id}", { "company": company, "id": id });
    return this._get<PublicApiV1EmployeeSeatOfferRedemptionsShowResponses[200]>(path, undefined, config);
  }
}
