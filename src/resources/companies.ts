// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1CompaniesActivateBatchData, PublicApiV1CompaniesActivateBatchResponses, PublicApiV1CompaniesActivateResponses, PublicApiV1CompaniesCreateData, PublicApiV1CompaniesCreateResponses, PublicApiV1CompaniesCreationStatusResponses, PublicApiV1CompaniesDeactivateResponses, PublicApiV1CompaniesIssuingReadinessResponses, PublicApiV1CompaniesSeatChargePreviewResponses, PublicApiV1CompaniesShowResponses, PublicApiV1CompaniesStatsResponses, PublicApiV1CompaniesUpdateData, PublicApiV1CompaniesUpdateResponses, PublicApiV1CompaniesVerifyCreationResponses } from "../generated/types.gen.js";


export class CompaniesResource extends BaseResource {
  /** Activate several tax IDs of the account */
  async activateBatch(account: string, body?: PublicApiV1CompaniesActivateBatchData["body"], config?: RequestConfig): Promise<PublicApiV1CompaniesActivateBatchResponses[200]> {
    const path = this.buildPath("/accounts/{account}/companies/activate", { "account": account });
    return this._send<PublicApiV1CompaniesActivateBatchResponses[200]>("POST", path, body, config);
  }

  /** Activate a tax ID of the account */
  async activate(account: string, company: string, config?: RequestConfig): Promise<PublicApiV1CompaniesActivateResponses[200]> {
    const path = this.buildPath("/accounts/{account}/companies/{company}/activate", { "account": account, "company": company });
    return this._send<PublicApiV1CompaniesActivateResponses[200]>("POST", path, undefined, config);
  }

  /** Deactivate a tax ID of the account */
  async deactivate(account: string, company: string, config?: RequestConfig): Promise<PublicApiV1CompaniesDeactivateResponses[200]> {
    const path = this.buildPath("/accounts/{account}/companies/{company}/deactivate", { "account": account, "company": company });
    return this._send<PublicApiV1CompaniesDeactivateResponses[200]>("POST", path, undefined, config);
  }

  /** Archive a tax ID of the account */
  async delete(account: string, company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/companies/{company}", { "account": account, "company": company });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a tax ID of the account */
  async show(account: string, company: string, config?: RequestConfig): Promise<PublicApiV1CompaniesShowResponses[200]> {
    const path = this.buildPath("/accounts/{account}/companies/{company}", { "account": account, "company": company });
    return this._get<PublicApiV1CompaniesShowResponses[200]>(path, undefined, config);
  }

  /** Update a tax ID of the account */
  async update(account: string, company: string, body?: PublicApiV1CompaniesUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1CompaniesUpdateResponses[200]> {
    const path = this.buildPath("/accounts/{account}/companies/{company}", { "account": account, "company": company });
    return this._send<PublicApiV1CompaniesUpdateResponses[200]>("PATCH", path, body, config);
  }

  /** Retrieve invoicing statistics per company */
  async stats(account: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1CompaniesStatsResponses[200]> {
    const path = this.buildPath("/accounts/{account}/companies/stats", { "account": account });
    return this._get<PublicApiV1CompaniesStatsResponses[200]>(path, params, config);
  }

  /** Retrieve the creation status of a tax ID */
  async creationStatus(account: string, company: string, config?: RequestConfig): Promise<PublicApiV1CompaniesCreationStatusResponses[200]> {
    const path = this.buildPath("/accounts/{account}/companies/{company}/creation-status", { "account": account, "company": company });
    return this._get<PublicApiV1CompaniesCreationStatusResponses[200]>(path, undefined, config);
  }

  /** Check whether a portfolio NIF can issue */
  async issuingReadiness(account: string, company: string, config?: RequestConfig): Promise<PublicApiV1CompaniesIssuingReadinessResponses[200]> {
    const path = this.buildPath("/accounts/{account}/companies/{company}/issuing-readiness", { "account": account, "company": company });
    return this._get<PublicApiV1CompaniesIssuingReadinessResponses[200]>(path, undefined, config);
  }

  /** Preview the seat charge of adding a company */
  async seatChargePreview(account: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1CompaniesSeatChargePreviewResponses[200]> {
    const path = this.buildPath("/accounts/{account}/companies/seat-charge-preview", { "account": account });
    return this._get<PublicApiV1CompaniesSeatChargePreviewResponses[200]>(path, params, config);
  }

  /** List the tax IDs of your account */
  async list(account: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/accounts/{account}/companies", { "account": account });
    return this._paginate<unknown>(path, params, "cursor", config);
  }

  /** Register a tax ID in the account */
  async create(account: string, body?: PublicApiV1CompaniesCreateData["body"], config?: RequestConfig): Promise<PublicApiV1CompaniesCreateResponses[201]> {
    const path = this.buildPath("/accounts/{account}/companies", { "account": account });
    return this._send<PublicApiV1CompaniesCreateResponses[201]>("POST", path, body, config);
  }

  /** Verify the creation of a tax ID */
  async verifyCreation(account: string, company: string, config?: RequestConfig): Promise<PublicApiV1CompaniesVerifyCreationResponses[200]> {
    const path = this.buildPath("/accounts/{account}/companies/{company}/verify-creation", { "account": account, "company": company });
    return this._send<PublicApiV1CompaniesVerifyCreationResponses[200]>("POST", path, undefined, config);
  }
}
