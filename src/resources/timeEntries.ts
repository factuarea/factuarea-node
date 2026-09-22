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
  async validate(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/time-entries/chain/validate", { "company": company });
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
  async clockIn(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/time-entries/clock-in", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Clock out an employee */
  async clockOut(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/time-entries/clock-out", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Retrieve an employee’s current workday state */
  async current(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/time-entries/current", { "company": company });
    return this._get<unknown>(path, params, config);
  }

  /** List all time entries */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/time-entries", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Start a pause */
  async pause(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/time-entries/pause", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Record a manual retroactive entry */
  async manual(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/time-entries/manual", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Resume from a pause */
  async resume(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/time-entries/resume", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Retrieve a time entry */
  async show(company: string, timeEntry: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/time-entries/{time_entry}", { "company": company, "time_entry": timeEntry });
    return this._get<unknown>(path, undefined, config);
  }
}
