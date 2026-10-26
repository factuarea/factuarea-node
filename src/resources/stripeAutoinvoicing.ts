// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1StripeAutoinvoicingAccountsChargeRulesCreateData, PublicApiV1StripeAutoinvoicingAccountsChargeRulesCreateResponses, PublicApiV1StripeAutoinvoicingAccountsChargeRulesListResponses, PublicApiV1StripeAutoinvoicingAccountsChargeRulesReorderData, PublicApiV1StripeAutoinvoicingAccountsChargeRulesReorderResponses, PublicApiV1StripeAutoinvoicingAccountsChargeRulesUpdateData, PublicApiV1StripeAutoinvoicingAccountsChargeRulesUpdateResponses, PublicApiV1StripeAutoinvoicingAccountsListResponses, PublicApiV1StripeAutoinvoicingAccountsShowResponses, PublicApiV1StripeAutoinvoicingAccountsUpdateData, PublicApiV1StripeAutoinvoicingAccountsUpdateResponses, PublicApiV1StripeAutoinvoicingAuthorizationsCreateData, PublicApiV1StripeAutoinvoicingAuthorizationsCreateResponses, PublicApiV1StripeAutoinvoicingConfigShowResponses, PublicApiV1StripeAutoinvoicingConfigUpdateData, PublicApiV1StripeAutoinvoicingConfigUpdateResponses, PublicApiV1StripeAutoinvoicingPaymentsListResponses } from "../generated/types.gen.js";


export class StripeAutoinvoicingAccountsChargeRulesResource extends BaseResource {
  /** Create a charge treatment rule */
  async create(company: string, account: string, body?: PublicApiV1StripeAutoinvoicingAccountsChargeRulesCreateData["body"], config?: RequestConfig): Promise<PublicApiV1StripeAutoinvoicingAccountsChargeRulesCreateResponses[201]> {
    const path = this.buildPath("/companies/{company}/connected-accounts/{account}/charge-rules", { "company": company, "account": account });
    return this._send<PublicApiV1StripeAutoinvoicingAccountsChargeRulesCreateResponses[201]>("POST", path, body, config);
  }

  /** List charge treatment rules of a connected Stripe account */
  async list(company: string, account: string, config?: RequestConfig): Promise<PublicApiV1StripeAutoinvoicingAccountsChargeRulesListResponses[200]> {
    const path = this.buildPath("/companies/{company}/connected-accounts/{account}/charge-rules", { "company": company, "account": account });
    return this._get<PublicApiV1StripeAutoinvoicingAccountsChargeRulesListResponses[200]>(path, undefined, config);
  }

  /** Delete a charge treatment rule */
  async delete(company: string, account: string, rule: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/connected-accounts/{account}/charge-rules/{rule}", { "company": company, "account": account, "rule": rule });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Update a charge treatment rule */
  async update(company: string, account: string, rule: string, body?: PublicApiV1StripeAutoinvoicingAccountsChargeRulesUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1StripeAutoinvoicingAccountsChargeRulesUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/connected-accounts/{account}/charge-rules/{rule}", { "company": company, "account": account, "rule": rule });
    return this._send<PublicApiV1StripeAutoinvoicingAccountsChargeRulesUpdateResponses[200]>("PUT", path, body, config);
  }

  /** Reorder the charge treatment rules */
  async reorder(company: string, account: string, body?: PublicApiV1StripeAutoinvoicingAccountsChargeRulesReorderData["body"], config?: RequestConfig): Promise<PublicApiV1StripeAutoinvoicingAccountsChargeRulesReorderResponses[200]> {
    const path = this.buildPath("/companies/{company}/connected-accounts/{account}/charge-rules/order", { "company": company, "account": account });
    return this._send<PublicApiV1StripeAutoinvoicingAccountsChargeRulesReorderResponses[200]>("PUT", path, body, config);
  }
}

export class StripeAutoinvoicingAccountsNonInvoicedChargesResource extends BaseResource {
  /** List non-invoiced charges of a connected Stripe account */
  async list(company: string, account: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/connected-accounts/{account}/non-invoiced-charges", { "company": company, "account": account });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }
}

export class StripeAutoinvoicingAccountsResource extends BaseResource {
  readonly chargeRules: StripeAutoinvoicingAccountsChargeRulesResource;
  readonly nonInvoicedCharges: StripeAutoinvoicingAccountsNonInvoicedChargesResource;

  constructor(client: HttpClient) {
    super(client);
    this.chargeRules = new StripeAutoinvoicingAccountsChargeRulesResource(client);
    this.nonInvoicedCharges = new StripeAutoinvoicingAccountsNonInvoicedChargesResource(client);
  }

  /** Disconnect a connected Stripe account */
  async disconnect(company: string, account: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/connected-accounts/{account}", { "company": company, "account": account });
    return this._send<unknown>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Retrieve a connected Stripe account */
  async show(company: string, account: string, config?: RequestConfig): Promise<PublicApiV1StripeAutoinvoicingAccountsShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/connected-accounts/{account}", { "company": company, "account": account });
    return this._get<PublicApiV1StripeAutoinvoicingAccountsShowResponses[200]>(path, undefined, config);
  }

  /** Update a connected Stripe account */
  async update(company: string, account: string, body?: PublicApiV1StripeAutoinvoicingAccountsUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1StripeAutoinvoicingAccountsUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/connected-accounts/{account}", { "company": company, "account": account });
    return this._send<PublicApiV1StripeAutoinvoicingAccountsUpdateResponses[200]>("PATCH", path, body, config, { idempotent: true });
  }

  /** List connected Stripe accounts */
  async list(company: string, config?: RequestConfig): Promise<PublicApiV1StripeAutoinvoicingAccountsListResponses[200]> {
    const path = this.buildPath("/companies/{company}/connected-accounts", { "company": company });
    return this._get<PublicApiV1StripeAutoinvoicingAccountsListResponses[200]>(path, undefined, config);
  }
}

export class StripeAutoinvoicingConfigResource extends BaseResource {
  /** Retrieve Stripe autoinvoicing config */
  async show(company: string, config?: RequestConfig): Promise<PublicApiV1StripeAutoinvoicingConfigShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/stripe-autoinvoicing/config", { "company": company });
    return this._get<PublicApiV1StripeAutoinvoicingConfigShowResponses[200]>(path, undefined, config);
  }

  /** Update Stripe autoinvoicing config */
  async update(company: string, body?: PublicApiV1StripeAutoinvoicingConfigUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1StripeAutoinvoicingConfigUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/stripe-autoinvoicing/config", { "company": company });
    return this._send<PublicApiV1StripeAutoinvoicingConfigUpdateResponses[200]>("PATCH", path, body, config, { idempotent: true });
  }
}

export class StripeAutoinvoicingCorrectivesResource extends BaseResource {
  /** List Stripe autoinvoiced correctives */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/stripe-autoinvoicing/correctives", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }
}

export class StripeAutoinvoicingPaymentsResource extends BaseResource {
  /** List Stripe autoinvoiced charges */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1StripeAutoinvoicingPaymentsListResponses[200]> {
    const path = this.buildPath("/companies/{company}/stripe-autoinvoicing/payments", { "company": company });
    return this._get<PublicApiV1StripeAutoinvoicingPaymentsListResponses[200]>(path, params, config);
  }
}

export class StripeAutoinvoicingAuthorizationsResource extends BaseResource {
  /** Start a Stripe Connect authorization */
  async create(company: string, body?: PublicApiV1StripeAutoinvoicingAuthorizationsCreateData["body"], config?: RequestConfig): Promise<PublicApiV1StripeAutoinvoicingAuthorizationsCreateResponses[201]> {
    const path = this.buildPath("/companies/{company}/connected-accounts/authorizations", { "company": company });
    return this._send<PublicApiV1StripeAutoinvoicingAuthorizationsCreateResponses[201]>("POST", path, body, config);
  }
}

export class StripeAutoinvoicingResource extends BaseResource {
  readonly accounts: StripeAutoinvoicingAccountsResource;
  readonly config: StripeAutoinvoicingConfigResource;
  readonly correctives: StripeAutoinvoicingCorrectivesResource;
  readonly payments: StripeAutoinvoicingPaymentsResource;
  readonly authorizations: StripeAutoinvoicingAuthorizationsResource;

  constructor(client: HttpClient) {
    super(client);
    this.accounts = new StripeAutoinvoicingAccountsResource(client);
    this.config = new StripeAutoinvoicingConfigResource(client);
    this.correctives = new StripeAutoinvoicingCorrectivesResource(client);
    this.payments = new StripeAutoinvoicingPaymentsResource(client);
    this.authorizations = new StripeAutoinvoicingAuthorizationsResource(client);
  }
}
