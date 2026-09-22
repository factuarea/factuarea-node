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
  async list(company: string, webhookEndpoint: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/webhook-endpoints/{webhook_endpoint}/deliveries", { "company": company, "webhook_endpoint": webhookEndpoint });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Replay webhook delivery */
  async replay(company: string, webhookEndpoint: string, delivery: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/webhook-endpoints/{webhook_endpoint}/deliveries/{delivery}/replay", { "company": company, "webhook_endpoint": webhookEndpoint, "delivery": delivery });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Retrieve webhook delivery */
  async show(company: string, webhookEndpoint: string, delivery: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/webhook-endpoints/{webhook_endpoint}/deliveries/{delivery}", { "company": company, "webhook_endpoint": webhookEndpoint, "delivery": delivery });
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
  async create(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/webhook-endpoints", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all webhook endpoints */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/webhook-endpoints", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Delete a webhook endpoint */
  async delete(company: string, webhookEndpoint: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/webhook-endpoints/{webhook_endpoint}", { "company": company, "webhook_endpoint": webhookEndpoint });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a webhook endpoint */
  async show(company: string, webhookEndpoint: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/webhook-endpoints/{webhook_endpoint}", { "company": company, "webhook_endpoint": webhookEndpoint });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a webhook endpoint */
  async update(company: string, webhookEndpoint: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/webhook-endpoints/{webhook_endpoint}", { "company": company, "webhook_endpoint": webhookEndpoint });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** Ping webhook endpoint */
  async ping(company: string, webhookEndpoint: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/webhook-endpoints/{webhook_endpoint}/ping", { "company": company, "webhook_endpoint": webhookEndpoint });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Rotate webhook secret */
  async rotateSecret(company: string, webhookEndpoint: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/webhook-endpoints/{webhook_endpoint}/rotate-secret", { "company": company, "webhook_endpoint": webhookEndpoint });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Send a test event */
  async testEvent(company: string, webhookEndpoint: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/webhook-endpoints/{webhook_endpoint}/test-event", { "company": company, "webhook_endpoint": webhookEndpoint });
    return this._send<unknown>("POST", path, body, config);
  }
}
