// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class StripeAutoinvoicingAccountsResource extends BaseResource {
  /** Disconnect a connected Stripe account */
  async disconnect(company: string, account: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/connected-accounts/{account}", { "company": company, "account": account });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a connected Stripe account */
  async show(company: string, account: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/connected-accounts/{account}", { "company": company, "account": account });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a connected Stripe account */
  async update(company: string, account: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/connected-accounts/{account}", { "company": company, "account": account });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** List connected Stripe accounts */
  async list(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/connected-accounts", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }
}

export class StripeAutoinvoicingConfigResource extends BaseResource {
  /** Retrieve Stripe autoinvoicing config */
  async show(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/stripe-autoinvoicing/config", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update Stripe autoinvoicing config */
  async update(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/stripe-autoinvoicing/config", { "company": company });
    return this._send<unknown>("PATCH", path, body, config);
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
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/stripe-autoinvoicing/payments", { "company": company });
    return this._get<unknown>(path, params, config);
  }
}

export class StripeAutoinvoicingResource extends BaseResource {
  readonly accounts: StripeAutoinvoicingAccountsResource;
  readonly config: StripeAutoinvoicingConfigResource;
  readonly correctives: StripeAutoinvoicingCorrectivesResource;
  readonly payments: StripeAutoinvoicingPaymentsResource;

  constructor(client: HttpClient) {
    super(client);
    this.accounts = new StripeAutoinvoicingAccountsResource(client);
    this.config = new StripeAutoinvoicingConfigResource(client);
    this.correctives = new StripeAutoinvoicingCorrectivesResource(client);
    this.payments = new StripeAutoinvoicingPaymentsResource(client);
  }
}
