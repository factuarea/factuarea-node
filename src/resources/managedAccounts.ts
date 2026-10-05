// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class ManagedAccountsImportsResource extends BaseResource {
  /** Apply a bulk import of managed accounts */
  async create(formData: FormData, config?: RequestConfig): Promise<unknown> {
    const path = "/accounts/imports";
    return this._sendForm<unknown>(path, formData, config);
  }

  /** Download the bulk import template */
  async template(config?: RequestConfig): Promise<unknown> {
    const path = "/accounts/imports/template";
    return this._get<unknown>(path, undefined, config);
  }

  /** Preview a bulk import of managed accounts */
  async preview(formData: FormData, config?: RequestConfig): Promise<unknown> {
    const path = "/accounts/imports/preview";
    return this._sendForm<unknown>(path, formData, config);
  }
}

export class ManagedAccountsAccessLevelResource extends BaseResource {
  /** Change the access level on a managed account */
  async update(account: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/access-level", { "account": account });
    return this._send<unknown>("PATCH", path, body, config);
  }
}

export class ManagedAccountsPlanResource extends BaseResource {
  /** Change the plan of a managed account */
  async update(account: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/plan", { "account": account });
    return this._send<unknown>("PATCH", path, body, config, { idempotent: true });
  }

  /** Preview a managed account plan change */
  async preview(account: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/plan/preview", { "account": account });
    return this._get<unknown>(path, params, config);
  }
}

export class ManagedAccountsManagementResource extends BaseResource {
  /** End the management of an account */
  async end(account: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/management", { "account": account });
    return this._send<unknown>("DELETE", path, undefined, config, { idempotent: true });
  }
}

export class ManagedAccountsClaimTokensResource extends BaseResource {
  /** Reissue the claim voucher of a managed account */
  async create(account: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/claim-tokens", { "account": account });
    return this._send<unknown>("POST", path, body, config);
  }
}

export class ManagedAccountsResource extends BaseResource {
  readonly imports: ManagedAccountsImportsResource;
  readonly accessLevel: ManagedAccountsAccessLevelResource;
  readonly plan: ManagedAccountsPlanResource;
  readonly management: ManagedAccountsManagementResource;
  readonly claimTokens: ManagedAccountsClaimTokensResource;

  constructor(client: HttpClient) {
    super(client);
    this.imports = new ManagedAccountsImportsResource(client);
    this.accessLevel = new ManagedAccountsAccessLevelResource(client);
    this.plan = new ManagedAccountsPlanResource(client);
    this.management = new ManagedAccountsManagementResource(client);
    this.claimTokens = new ManagedAccountsClaimTokensResource(client);
  }

  /** List managed accounts */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/accounts", params, "starting_after", config);
  }

  /** Provision a managed account */
  async create(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/accounts";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Retrieve a managed account */
  async show(account: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}", { "account": account });
    return this._get<unknown>(path, undefined, config);
  }
}
