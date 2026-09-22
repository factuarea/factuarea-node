// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class AccountClaimTokensResource extends BaseResource {
  /** Accept a claim token */
  async accept(account: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/claim-tokens/accept", { "account": account });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Issue a claim token for a tax ID */
  async create(account: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/claim-tokens", { "account": account });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List issued claim tokens */
  async list(account: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/claim-tokens", { "account": account });
    return this._get<unknown>(path, params, config);
  }
}

export class AccountMembersModuleAccessResource extends BaseResource {
  /** Retrieve a member module access level */
  async show(account: string, member: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/members/{member}/module-access", { "account": account, "member": member });
    return this._get<unknown>(path, undefined, config);
  }

  /** Set a member module access level */
  async update(account: string, member: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/members/{member}/module-access", { "account": account, "member": member });
    return this._send<unknown>("PATCH", path, body, config);
  }
}

export class AccountMembersResource extends BaseResource {
  readonly moduleAccess: AccountMembersModuleAccessResource;

  constructor(client: HttpClient) {
    super(client);
    this.moduleAccess = new AccountMembersModuleAccessResource(client);
  }

  /** Add a member to an account NIF */
  async create(account: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/members", { "account": account });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List account members */
  async list(account: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/members", { "account": account });
    return this._get<unknown>(path, undefined, config);
  }

  /** Change an account member role */
  async update(account: string, member: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/members/{member}", { "account": account, "member": member });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** Remove a member from an account NIF */
  async delete(account: string, member: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/members/{member}", { "account": account, "member": member });
    return this._send<unknown>("DELETE", path, undefined, config);
  }
}

export class AccountInvitationsResource extends BaseResource {
  /** Cancel an account member invitation */
  async cancel(account: string, invitation: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/invitations/{invitation}", { "account": account, "invitation": invitation });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Send an account member invitation */
  async create(account: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/invitations", { "account": account });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List account invitations */
  async list(account: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/invitations", { "account": account });
    return this._get<unknown>(path, params, config);
  }

  /** Resend an account member invitation */
  async resend(account: string, invitation: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/invitations/{invitation}/resend", { "account": account, "invitation": invitation });
    return this._send<unknown>("POST", path, undefined, config);
  }
}

export class AccountApiKeysResource extends BaseResource {
  /** Create an API key */
  async create(account: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/api-keys", { "account": account });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List your API keys */
  async list(account: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/api-keys", { "account": account });
    return this._get<unknown>(path, undefined, config);
  }

  /** Revoke an API key */
  async revoke(account: string, apiKey: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/api-keys/{api_key}/revoke", { "account": account, "api_key": apiKey });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Rotate an API key secret */
  async rotateSecret(account: string, apiKey: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/api-keys/{api_key}/rotate-secret", { "account": account, "api_key": apiKey });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Retrieve an API key */
  async show(account: string, apiKey: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/api-keys/{api_key}", { "account": account, "api_key": apiKey });
    return this._get<unknown>(path, undefined, config);
  }
}

export class AccountPersonalizationResource extends BaseResource {
  /** List available personalization templates */
  async templates(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/personalization/templates", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update account personalization */
  async update(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/personalization", { "company": company });
    return this._send<unknown>("PATCH", path, body, config);
  }
}

export class AccountOwnerResource extends BaseResource {
  /** Transfer account ownership */
  async transfer(account: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/owner", { "account": account });
    return this._send<unknown>("PATCH", path, body, config);
  }
}

export class AccountResource extends BaseResource {
  readonly claimTokens: AccountClaimTokensResource;
  readonly members: AccountMembersResource;
  readonly invitations: AccountInvitationsResource;
  readonly apiKeys: AccountApiKeysResource;
  readonly personalization: AccountPersonalizationResource;
  readonly owner: AccountOwnerResource;

  constructor(client: HttpClient) {
    super(client);
    this.claimTokens = new AccountClaimTokensResource(client);
    this.members = new AccountMembersResource(client);
    this.invitations = new AccountInvitationsResource(client);
    this.apiKeys = new AccountApiKeysResource(client);
    this.personalization = new AccountPersonalizationResource(client);
    this.owner = new AccountOwnerResource(client);
  }

  /** Retrieve account billing details */
  async billing(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/billing", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** Retrieve account usage for the current period */
  async usage(account: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/usage", { "account": account });
    return this._get<unknown>(path, undefined, config);
  }

  /** Retrieve the calling credential */
  async show(config?: RequestConfig): Promise<unknown> {
    const path = "/me";
    return this._get<unknown>(path, undefined, config);
  }

  /** Verify account against the AEAT census */
  async verifyCensus(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/census-verification", { "company": company });
    return this._send<unknown>("POST", path, undefined, config);
  }
}
