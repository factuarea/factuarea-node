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
  async disconnect(account: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/connected-accounts/{account}", { "account": account });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a connected Stripe account */
  async show(account: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/connected-accounts/{account}", { "account": account });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a connected Stripe account */
  async update(account: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/connected-accounts/{account}", { "account": account });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** List connected Stripe accounts */
  async list(config?: RequestConfig): Promise<unknown> {
    const path = "/connected-accounts";
    return this._get<unknown>(path, undefined, config);
  }
}

export class StripeAutoinvoicingConfigResource extends BaseResource {
  /** Retrieve Stripe autoinvoicing config */
  async show(config?: RequestConfig): Promise<unknown> {
    const path = "/stripe-autoinvoicing/config";
    return this._get<unknown>(path, undefined, config);
  }

  /** Update Stripe autoinvoicing config */
  async update(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/stripe-autoinvoicing/config";
    return this._send<unknown>("PUT", path, body, config);
  }
}

export class StripeAutoinvoicingCorrectivesResource extends BaseResource {
  /** List Stripe autoinvoiced correctives */
  async list(config?: RequestConfig): Promise<unknown> {
    const path = "/stripe-autoinvoicing/correctives";
    return this._get<unknown>(path, undefined, config);
  }
}

export class StripeAutoinvoicingPaymentsResource extends BaseResource {
  /** List Stripe autoinvoiced charges */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = "/stripe-autoinvoicing/payments";
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
