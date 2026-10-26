// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1TimeEntriesChainValidateResponses, PublicApiV1TimeEntriesClockInData, PublicApiV1TimeEntriesClockInResponses, PublicApiV1TimeEntriesClockOutData, PublicApiV1TimeEntriesClockOutResponses, PublicApiV1TimeEntriesCurrentResponses, PublicApiV1TimeEntriesManualData, PublicApiV1TimeEntriesManualResponses, PublicApiV1TimeEntriesPauseData, PublicApiV1TimeEntriesPauseResponses, PublicApiV1TimeEntriesResumeData, PublicApiV1TimeEntriesResumeResponses, PublicApiV1TimeEntriesShowResponses } from "../generated/types.gen.js";


export class TimeEntriesChainResource extends BaseResource {
  /** Validate the time record hash chain */
  async validate(company: string, config?: RequestConfig): Promise<PublicApiV1TimeEntriesChainValidateResponses[200]> {
    const path = this.buildPath("/companies/{company}/time-entries/chain/validate", { "company": company });
    return this._get<PublicApiV1TimeEntriesChainValidateResponses[200]>(path, undefined, config);
  }
}

export class TimeEntriesResource extends BaseResource {
  readonly chain: TimeEntriesChainResource;

  constructor(client: HttpClient) {
    super(client);
    this.chain = new TimeEntriesChainResource(client);
  }

  /** Clock in an employee */
  async clockIn(company: string, body?: PublicApiV1TimeEntriesClockInData["body"], config?: RequestConfig): Promise<PublicApiV1TimeEntriesClockInResponses[201]> {
    const path = this.buildPath("/companies/{company}/time-entries/clock-in", { "company": company });
    return this._send<PublicApiV1TimeEntriesClockInResponses[201]>("POST", path, body, config);
  }

  /** Clock out an employee */
  async clockOut(company: string, body?: PublicApiV1TimeEntriesClockOutData["body"], config?: RequestConfig): Promise<PublicApiV1TimeEntriesClockOutResponses[201]> {
    const path = this.buildPath("/companies/{company}/time-entries/clock-out", { "company": company });
    return this._send<PublicApiV1TimeEntriesClockOutResponses[201]>("POST", path, body, config);
  }

  /** Retrieve an employee’s current workday state */
  async current(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1TimeEntriesCurrentResponses[200]> {
    const path = this.buildPath("/companies/{company}/time-entries/current", { "company": company });
    return this._get<PublicApiV1TimeEntriesCurrentResponses[200]>(path, params, config);
  }

  /** List all time entries */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/time-entries", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Start a pause */
  async pause(company: string, body?: PublicApiV1TimeEntriesPauseData["body"], config?: RequestConfig): Promise<PublicApiV1TimeEntriesPauseResponses[201]> {
    const path = this.buildPath("/companies/{company}/time-entries/pause", { "company": company });
    return this._send<PublicApiV1TimeEntriesPauseResponses[201]>("POST", path, body, config);
  }

  /** Record a manual retroactive entry */
  async manual(company: string, body?: PublicApiV1TimeEntriesManualData["body"], config?: RequestConfig): Promise<PublicApiV1TimeEntriesManualResponses[201]> {
    const path = this.buildPath("/companies/{company}/time-entries/manual", { "company": company });
    return this._send<PublicApiV1TimeEntriesManualResponses[201]>("POST", path, body, config);
  }

  /** Resume from a pause */
  async resume(company: string, body?: PublicApiV1TimeEntriesResumeData["body"], config?: RequestConfig): Promise<PublicApiV1TimeEntriesResumeResponses[201]> {
    const path = this.buildPath("/companies/{company}/time-entries/resume", { "company": company });
    return this._send<PublicApiV1TimeEntriesResumeResponses[201]>("POST", path, body, config);
  }

  /** Retrieve a time entry */
  async show(company: string, timeEntry: string, config?: RequestConfig): Promise<PublicApiV1TimeEntriesShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/time-entries/{time_entry}", { "company": company, "time_entry": timeEntry });
    return this._get<PublicApiV1TimeEntriesShowResponses[200]>(path, undefined, config);
  }
}
