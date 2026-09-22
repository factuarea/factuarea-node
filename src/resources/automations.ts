// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class AutomationsRulesVersionsResource extends BaseResource {
  /** List the versions of an automation rule */
  async list(company: string, rule: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/automations/rules/{rule}/versions", { "company": company, "rule": rule });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Retrieve a version of an automation rule */
  async show(company: string, rule: string, version: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/automations/rules/{rule}/versions/{version}", { "company": company, "rule": rule, "version": version });
    return this._get<unknown>(path, undefined, config);
  }
}

export class AutomationsRulesResource extends BaseResource {
  readonly versions: AutomationsRulesVersionsResource;

  constructor(client: HttpClient) {
    super(client);
    this.versions = new AutomationsRulesVersionsResource(client);
  }

  /** Activate an automation rule */
  async activate(company: string, rule: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/automations/rules/{rule}/activate", { "company": company, "rule": rule });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Create an automation rule */
  async create(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/automations/rules", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List your automation rules */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/automations/rules", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Delete an automation rule */
  async delete(company: string, rule: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/automations/rules/{rule}", { "company": company, "rule": rule });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve an automation rule */
  async show(company: string, rule: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/automations/rules/{rule}", { "company": company, "rule": rule });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update an automation rule */
  async update(company: string, rule: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/automations/rules/{rule}", { "company": company, "rule": rule });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** Dry-run an automation rule */
  async dryRun(company: string, rule: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/automations/rules/{rule}/dry-run", { "company": company, "rule": rule });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Pause an automation rule */
  async pause(company: string, rule: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/automations/rules/{rule}/pause", { "company": company, "rule": rule });
    return this._send<unknown>("POST", path, undefined, config);
  }
}

export class AutomationsCatalogResource extends BaseResource {
  /** Retrieve the automation catalog */
  async show(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/automations/catalog", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** Retrieve the evaluable fields of a trigger */
  async triggerFields(company: string, trigger: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/automations/catalog/triggers/{trigger}/fields", { "company": company, "trigger": trigger });
    return this._get<unknown>(path, undefined, config);
  }
}

export class AutomationsUsageResource extends BaseResource {
  /** Retrieve automation usage */
  async show(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/automations/usage", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }
}

export class AutomationsRunsStepsResource extends BaseResource {
  /** List the steps of an automation run */
  async list(company: string, run: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/automations/runs/{run}/steps", { "company": company, "run": run });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Replay one step of an automation run */
  async replay(company: string, run: string, stepIndex: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/automations/runs/{run}/steps/{step_index}/replay", { "company": company, "run": run, "step_index": stepIndex });
    return this._send<unknown>("POST", path, undefined, config);
  }
}

export class AutomationsRunsResource extends BaseResource {
  readonly steps: AutomationsRunsStepsResource;

  constructor(client: HttpClient) {
    super(client);
    this.steps = new AutomationsRunsStepsResource(client);
  }

  /** List automation runs */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/automations/runs", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Replay the parked steps of an automation run */
  async replay(company: string, run: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/automations/runs/{run}/replay", { "company": company, "run": run });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Retrieve an automation run */
  async show(company: string, run: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/automations/runs/{run}", { "company": company, "run": run });
    return this._get<unknown>(path, undefined, config);
  }
}

export class AutomationsResource extends BaseResource {
  readonly rules: AutomationsRulesResource;
  readonly catalog: AutomationsCatalogResource;
  readonly usage: AutomationsUsageResource;
  readonly runs: AutomationsRunsResource;

  constructor(client: HttpClient) {
    super(client);
    this.rules = new AutomationsRulesResource(client);
    this.catalog = new AutomationsCatalogResource(client);
    this.usage = new AutomationsUsageResource(client);
    this.runs = new AutomationsRunsResource(client);
  }
}
