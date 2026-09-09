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
  async list(rule: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/automations/rules/{rule}/versions", { "rule": rule });
    return this._paginate<unknown>(path, params, "starting_after");
  }

  /** Retrieve a version of an automation rule */
  async show(rule: string, version: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/automations/rules/{rule}/versions/{version}", { "rule": rule, "version": version });
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
  async activate(rule: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/automations/rules/{rule}/activate", { "rule": rule });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Create an automation rule */
  async create(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/automations/rules";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List your automation rules */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/automations/rules", params, "starting_after");
  }

  /** Delete an automation rule */
  async delete(rule: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/automations/rules/{rule}", { "rule": rule });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve an automation rule */
  async show(rule: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/automations/rules/{rule}", { "rule": rule });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update an automation rule */
  async update(rule: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/automations/rules/{rule}", { "rule": rule });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** Dry-run an automation rule */
  async dryRun(rule: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/automations/rules/{rule}/dry_run", { "rule": rule });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Pause an automation rule */
  async pause(rule: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/automations/rules/{rule}/pause", { "rule": rule });
    return this._send<unknown>("POST", path, undefined, config);
  }
}

export class AutomationsCatalogResource extends BaseResource {
  /** Retrieve the automation catalog */
  async show(config?: RequestConfig): Promise<unknown> {
    const path = "/automations/catalog";
    return this._get<unknown>(path, undefined, config);
  }

  /** Retrieve the evaluable fields of a trigger */
  async triggerFields(trigger: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/automations/catalog/triggers/{trigger}/fields", { "trigger": trigger });
    return this._get<unknown>(path, undefined, config);
  }
}

export class AutomationsUsageResource extends BaseResource {
  /** Retrieve automation usage */
  async show(config?: RequestConfig): Promise<unknown> {
    const path = "/automations/usage";
    return this._get<unknown>(path, undefined, config);
  }
}

export class AutomationsRunsStepsResource extends BaseResource {
  /** List the steps of an automation run */
  async list(run: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/automations/runs/{run}/steps", { "run": run });
    return this._paginate<unknown>(path, params, "starting_after");
  }

  /** Replay one step of an automation run */
  async replay(run: string, stepIndex: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/automations/runs/{run}/steps/{step_index}/replay", { "run": run, "step_index": stepIndex });
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
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/automations/runs", params, "starting_after");
  }

  /** Replay the parked steps of an automation run */
  async replay(run: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/automations/runs/{run}/replay", { "run": run });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Retrieve an automation run */
  async show(run: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/automations/runs/{run}", { "run": run });
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
