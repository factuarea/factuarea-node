// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class ReturnsCorrectiveCandidatesResource extends BaseResource {
  /** List the corrective invoice candidates of a return */
  async list(company: string, returnParam: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/returns/{return}/corrective-candidates", { "company": company, "return": returnParam });
    return this._get<unknown>(path, undefined, config);
  }
}

export class ReturnsResource extends BaseResource {
  readonly correctiveCandidates: ReturnsCorrectiveCandidatesResource;

  constructor(client: HttpClient) {
    super(client);
    this.correctiveCandidates = new ReturnsCorrectiveCandidatesResource(client);
  }

  /** Approve a return */
  async approve(company: string, returnParam: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/returns/{return}/approve", { "company": company, "return": returnParam });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Request a return */
  async create(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/returns", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all returns */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/returns", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after");
  }

  /** Delete a return */
  async delete(company: string, returnParam: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/returns/{return}", { "company": company, "return": returnParam });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a return */
  async show(company: string, returnParam: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/returns/{return}", { "company": company, "return": returnParam });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a return */
  async update(company: string, returnParam: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/returns/{return}", { "company": company, "return": returnParam });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** List return statuses */
  async statuses(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/returns/statuses", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** List the returnable lines of a document */
  async returnableLines(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/returns/returnable-lines", { "company": company });
    return this._get<unknown>(path, params, config);
  }

  /** Receive a return */
  async receive(company: string, returnParam: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/returns/{return}/receive", { "company": company, "return": returnParam });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Refund a return */
  async refund(company: string, returnParam: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/returns/{return}/refund", { "company": company, "return": returnParam });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Reject a return */
  async reject(company: string, returnParam: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/returns/{return}/reject", { "company": company, "return": returnParam });
    return this._send<unknown>("POST", path, body, config);
  }
}
