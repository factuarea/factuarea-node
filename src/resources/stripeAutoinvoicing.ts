// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class StripeAutoinvoicingAccountsChargeRulesResource extends BaseResource {
  /** Create a charge treatment rule */
  async create(account: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/connected-accounts/{account}/charge-rules", { "account": account });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List charge treatment rules of a connected Stripe account */
  async list(account: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/connected-accounts/{account}/charge-rules", { "account": account });
    return this._get<unknown>(path, undefined, config);
  }

  /** Delete a charge treatment rule */
  async delete(account: string, rule: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/connected-accounts/{account}/charge-rules/{rule}", { "account": account, "rule": rule });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Update a charge treatment rule */
  async update(account: string, rule: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/connected-accounts/{account}/charge-rules/{rule}", { "account": account, "rule": rule });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** Reorder the charge treatment rules */
  async reorder(account: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/connected-accounts/{account}/charge-rules/order", { "account": account });
    return this._send<unknown>("PUT", path, body, config);
  }
}

export class StripeAutoinvoicingAccountsNonInvoicedChargesResource extends BaseResource {
  /** List non-invoiced charges of a connected Stripe account */
  async list(account: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/connected-accounts/{account}/non-invoiced-charges", { "account": account });
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
  async disconnect(account: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/connected-accounts/{account}", { "account": account });
    return this._send<unknown>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Retrieve a connected Stripe account */
  async show(account: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/connected-accounts/{account}", { "account": account });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a connected Stripe account */
  async update(account: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/connected-accounts/{account}", { "account": account });
    return this._send<unknown>("PUT", path, body, config, { idempotent: true });
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
    return this._send<unknown>("PUT", path, body, config, { idempotent: true });
  }
}

export class StripeAutoinvoicingCorrectivesResource extends BaseResource {
  /** List Stripe autoinvoiced correctives */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/stripe-autoinvoicing/correctives", params, "starting_after", config);
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
