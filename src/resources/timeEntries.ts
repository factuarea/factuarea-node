// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class TimeEntriesChainResource extends BaseResource {
  /** Validate the time record hash chain */
  async validate(config?: RequestConfig): Promise<unknown> {
    const path = "/time-entries/chain/validate";
    return this._get<unknown>(path, undefined, config);
  }
}

export class TimeEntriesResource extends BaseResource {
  readonly chain: TimeEntriesChainResource;

  constructor(client: HttpClient) {
    super(client);
    this.chain = new TimeEntriesChainResource(client);
  }

  /** Clock in an employee */
  async clockIn(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/time-entries/clock-in";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Clock out an employee */
  async clockOut(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/time-entries/clock-out";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Retrieve an employee’s current workday state */
  async current(params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = "/time-entries/current";
    return this._get<unknown>(path, params, config);
  }

  /** List all time entries */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/time-entries", params, "starting_after");
  }

  /** Start a pause */
  async pause(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/time-entries/pause";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Record a manual retroactive entry */
  async manual(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/time-entries/manual";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Resume from a pause */
  async resume(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/time-entries/resume";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Retrieve a time entry */
  async show(timeEntry: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/time-entries/{time_entry}", { "time_entry": timeEntry });
    return this._get<unknown>(path, undefined, config);
  }
}
