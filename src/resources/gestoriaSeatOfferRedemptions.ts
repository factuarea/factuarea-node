// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1GestoriaSeatOfferRedemptionsCancelData, PublicApiV1GestoriaSeatOfferRedemptionsCancelResponses, PublicApiV1GestoriaSeatOfferRedemptionsConfirmData, PublicApiV1GestoriaSeatOfferRedemptionsConfirmResponses, PublicApiV1GestoriaSeatOfferRedemptionsPrepareData, PublicApiV1GestoriaSeatOfferRedemptionsPrepareResponses, PublicApiV1GestoriaSeatOfferRedemptionsRefreshQuoteData, PublicApiV1GestoriaSeatOfferRedemptionsRefreshQuoteResponses, PublicApiV1GestoriaSeatOfferRedemptionsShowResponses } from "../generated/types.gen.js";


export class GestoriaSeatOfferRedemptionsResource extends BaseResource {
  /** Cancel a managed-company-seat offer redemption */
  async cancel(company: string, id: string, body?: PublicApiV1GestoriaSeatOfferRedemptionsCancelData["body"], config?: RequestConfig): Promise<PublicApiV1GestoriaSeatOfferRedemptionsCancelResponses[200 | 202]> {
    const path = this.buildPath("/companies/{company}/gestoria-seat-offer-redemptions/{id}/cancel", { "company": company, "id": id });
    return this._send<PublicApiV1GestoriaSeatOfferRedemptionsCancelResponses[200 | 202]>("POST", path, body, config);
  }

  /** Confirm a managed-company-seat offer redemption */
  async confirm(company: string, id: string, body?: PublicApiV1GestoriaSeatOfferRedemptionsConfirmData["body"], config?: RequestConfig): Promise<PublicApiV1GestoriaSeatOfferRedemptionsConfirmResponses[200 | 202]> {
    const path = this.buildPath("/companies/{company}/gestoria-seat-offer-redemptions/{id}/confirm", { "company": company, "id": id });
    return this._send<PublicApiV1GestoriaSeatOfferRedemptionsConfirmResponses[200 | 202]>("POST", path, body, config);
  }

  /** List a managed-company-seat offer redemption */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/gestoria-seat-offer-redemptions", { "company": company });
    return this._paginate<unknown>(path, params, "cursor", config);
  }

  /** Prepare a managed-company-seat offer redemption */
  async prepare(company: string, body?: PublicApiV1GestoriaSeatOfferRedemptionsPrepareData["body"], config?: RequestConfig): Promise<PublicApiV1GestoriaSeatOfferRedemptionsPrepareResponses[201]> {
    const path = this.buildPath("/companies/{company}/gestoria-seat-offer-redemptions", { "company": company });
    return this._send<PublicApiV1GestoriaSeatOfferRedemptionsPrepareResponses[201]>("POST", path, body, config);
  }

  /** Refresh the quote for a managed-company-seat offer redemption */
  async refreshQuote(company: string, id: string, body?: PublicApiV1GestoriaSeatOfferRedemptionsRefreshQuoteData["body"], config?: RequestConfig): Promise<PublicApiV1GestoriaSeatOfferRedemptionsRefreshQuoteResponses[200]> {
    const path = this.buildPath("/companies/{company}/gestoria-seat-offer-redemptions/{id}/quote", { "company": company, "id": id });
    return this._send<PublicApiV1GestoriaSeatOfferRedemptionsRefreshQuoteResponses[200]>("POST", path, body, config);
  }

  /** Retrieve a managed-company-seat offer redemption */
  async show(company: string, id: string, config?: RequestConfig): Promise<PublicApiV1GestoriaSeatOfferRedemptionsShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/gestoria-seat-offer-redemptions/{id}", { "company": company, "id": id });
    return this._get<PublicApiV1GestoriaSeatOfferRedemptionsShowResponses[200]>(path, undefined, config);
  }
}
