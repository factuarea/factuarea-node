// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class WebhookEndpointsDeliveriesResource extends BaseResource {
  /** List webhook deliveries */
  async list(webhookEndpoint: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/webhook_endpoints/{webhook_endpoint}/deliveries", { "webhook_endpoint": webhookEndpoint });
    return this._paginate<unknown>(path, params, "starting_after");
  }

  /** Replay webhook delivery */
  async replay(webhookEndpoint: string, delivery: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/webhook_endpoints/{webhook_endpoint}/deliveries/{delivery}/replay", { "webhook_endpoint": webhookEndpoint, "delivery": delivery });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Retrieve webhook delivery */
  async show(webhookEndpoint: string, delivery: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/webhook_endpoints/{webhook_endpoint}/deliveries/{delivery}", { "webhook_endpoint": webhookEndpoint, "delivery": delivery });
    return this._get<unknown>(path, undefined, config);
  }
}

export class WebhookEndpointsResource extends BaseResource {
  readonly deliveries: WebhookEndpointsDeliveriesResource;

  constructor(client: HttpClient) {
    super(client);
    this.deliveries = new WebhookEndpointsDeliveriesResource(client);
  }

  /** Create a webhook endpoint */
  async create(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/webhook_endpoints";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all webhook endpoints */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/webhook_endpoints", params, "starting_after");
  }

  /** Delete a webhook endpoint */
  async delete(webhookEndpoint: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/webhook_endpoints/{webhook_endpoint}", { "webhook_endpoint": webhookEndpoint });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a webhook endpoint */
  async show(webhookEndpoint: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/webhook_endpoints/{webhook_endpoint}", { "webhook_endpoint": webhookEndpoint });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a webhook endpoint */
  async update(webhookEndpoint: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/webhook_endpoints/{webhook_endpoint}", { "webhook_endpoint": webhookEndpoint });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** Ping webhook endpoint */
  async ping(webhookEndpoint: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/webhook_endpoints/{webhook_endpoint}/ping", { "webhook_endpoint": webhookEndpoint });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Rotate webhook secret */
  async rotateSecret(webhookEndpoint: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/webhook_endpoints/{webhook_endpoint}/rotate_secret", { "webhook_endpoint": webhookEndpoint });
    return this._send<unknown>("POST", path, undefined, config);
  }
}
