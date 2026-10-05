// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class AccountNifTransfersResource extends BaseResource {
  /** Accept a tax ID transfer */
  async accept(account: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/nif-transfers/accept", { "account": account });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Issue a tax ID transfer */
  async create(account: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/nif-transfers", { "account": account });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List issued tax ID transfers */
  async list(account: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/nif-transfers", { "account": account });
    return this._get<unknown>(path, params, config);
  }

  /** Revoke a tax ID transfer */
  async revoke(account: string, nifTransfer: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/nif-transfers/{nif_transfer}/revoke", { "account": account, "nif_transfer": nifTransfer });
    return this._send<unknown>("POST", path, body, config);
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

export class AccountMembersGrantsResource extends BaseResource {
  /** List the grants of an account member */
  async list(account: string, member: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/members/{member}/grants", { "account": account, "member": member });
    return this._get<unknown>(path, undefined, config);
  }

  /** Revoke an account member grant */
  async delete(account: string, member: string, company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/members/{member}/grants/{company}", { "account": account, "member": member, "company": company });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Set an account member grant */
  async update(account: string, member: string, company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/members/{member}/grants/{company}", { "account": account, "member": member, "company": company });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** Retrieve an account member grant */
  async show(account: string, member: string, company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/members/{member}/grants/{company}", { "account": account, "member": member, "company": company });
    return this._get<unknown>(path, undefined, config);
  }
}

export class AccountMembersResource extends BaseResource {
  readonly moduleAccess: AccountMembersModuleAccessResource;
  readonly grants: AccountMembersGrantsResource;

  constructor(client: HttpClient) {
    super(client);
    this.moduleAccess = new AccountMembersModuleAccessResource(client);
    this.grants = new AccountMembersGrantsResource(client);
  }

  /** Add a member to the account */
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

  /** Remove a member from the account */
  async delete(account: string, member: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/members/{member}", { "account": account, "member": member });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve an account member */
  async show(account: string, member: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/members/{member}", { "account": account, "member": member });
    return this._get<unknown>(path, undefined, config);
  }
}

export class AccountInvitationsResource extends BaseResource {
  /** Revoke an account invitation */
  async cancel(account: string, invitation: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/invitations/{invitation}", { "account": account, "invitation": invitation });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve an account invitation */
  async show(account: string, invitation: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/invitations/{invitation}", { "account": account, "invitation": invitation });
    return this._get<unknown>(path, undefined, config);
  }

  /** Send an account invitation */
  async create(account: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/invitations", { "account": account });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List account invitations */
  async list(account: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/invitations", { "account": account });
    return this._get<unknown>(path, params, config);
  }

  /** Resend an account invitation */
  async resend(account: string, invitation: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/invitations/{invitation}/resend", { "account": account, "invitation": invitation });
    return this._send<unknown>("POST", path, undefined, config);
  }
}

export class AccountWebhooksDeliveriesResource extends BaseResource {
  /** List account webhook deliveries */
  async list(account: string, webhook: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/accounts/{account}/webhooks/{webhook}/deliveries", { "account": account, "webhook": webhook });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Retry an account webhook delivery */
  async retry(account: string, webhook: string, delivery: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/webhooks/{webhook}/deliveries/{delivery}/retry", { "account": account, "webhook": webhook, "delivery": delivery });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Retrieve an account webhook delivery */
  async show(account: string, webhook: string, delivery: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/webhooks/{webhook}/deliveries/{delivery}", { "account": account, "webhook": webhook, "delivery": delivery });
    return this._get<unknown>(path, undefined, config);
  }
}

export class AccountWebhooksResource extends BaseResource {
  readonly deliveries: AccountWebhooksDeliveriesResource;

  constructor(client: HttpClient) {
    super(client);
    this.deliveries = new AccountWebhooksDeliveriesResource(client);
  }

  /** Create an account webhook endpoint */
  async create(account: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/webhooks", { "account": account });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List account webhook endpoints */
  async list(account: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/accounts/{account}/webhooks", { "account": account });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Delete an account webhook endpoint */
  async delete(account: string, webhook: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/webhooks/{webhook}", { "account": account, "webhook": webhook });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve an account webhook endpoint */
  async show(account: string, webhook: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/webhooks/{webhook}", { "account": account, "webhook": webhook });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update an account webhook endpoint */
  async update(account: string, webhook: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/webhooks/{webhook}", { "account": account, "webhook": webhook });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** Rotate an account webhook secret */
  async rotateSecret(account: string, webhook: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/webhooks/{webhook}/secret", { "account": account, "webhook": webhook });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Send a test event to an account webhook endpoint */
  async test(account: string, webhook: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/webhooks/{webhook}/test", { "account": account, "webhook": webhook });
    return this._send<unknown>("POST", path, body, config);
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

  /** Change the tax IDs an API key reaches */
  async updateNifScope(account: string, apiKey: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/api-keys/{api_key}/nif-scope", { "account": account, "api_key": apiKey });
    return this._send<unknown>("PATCH", path, body, config);
  }
}

export class AccountRequestLogsResource extends BaseResource {
  /** List your account API request logs */
  async list(account: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/accounts/{account}/request-logs", { "account": account });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Retrieve an account API request log */
  async show(account: string, requestId: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/request-logs/{request_id}", { "account": account, "request_id": requestId });
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
  readonly nifTransfers: AccountNifTransfersResource;
  readonly members: AccountMembersResource;
  readonly invitations: AccountInvitationsResource;
  readonly webhooks: AccountWebhooksResource;
  readonly apiKeys: AccountApiKeysResource;
  readonly requestLogs: AccountRequestLogsResource;
  readonly personalization: AccountPersonalizationResource;
  readonly owner: AccountOwnerResource;

  constructor(client: HttpClient) {
    super(client);
    this.nifTransfers = new AccountNifTransfersResource(client);
    this.members = new AccountMembersResource(client);
    this.invitations = new AccountInvitationsResource(client);
    this.webhooks = new AccountWebhooksResource(client);
    this.apiKeys = new AccountApiKeysResource(client);
    this.requestLogs = new AccountRequestLogsResource(client);
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

  /** Retrieve provisioning usage */
  async provisioningUsage(account: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/provisioning-usage", { "account": account });
    return this._get<unknown>(path, undefined, config);
  }

  /** Verify account against the AEAT census */
  async verifyCensus(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/census-verification", { "company": company });
    return this._send<unknown>("POST", path, undefined, config);
  }
}
