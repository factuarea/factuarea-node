// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class WarehousesLocationsResource extends BaseResource {
  /** Archive a location of a warehouse */
  async delete(company: string, warehouse: string, location: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/warehouses/{warehouse}/locations/{location}", { "company": company, "warehouse": warehouse, "location": location });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a location of a warehouse */
  async show(company: string, warehouse: string, location: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/warehouses/{warehouse}/locations/{location}", { "company": company, "warehouse": warehouse, "location": location });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a location of a warehouse */
  async update(company: string, warehouse: string, location: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/warehouses/{warehouse}/locations/{location}", { "company": company, "warehouse": warehouse, "location": location });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** Create a location in a warehouse */
  async create(company: string, warehouse: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/warehouses/{warehouse}/locations", { "company": company, "warehouse": warehouse });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List the locations of a warehouse */
  async list(company: string, warehouse: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/warehouses/{warehouse}/locations", { "company": company, "warehouse": warehouse });
    return this._paginate<unknown>(path, params, "starting_after");
  }
}

export class WarehousesResource extends BaseResource {
  readonly locations: WarehousesLocationsResource;

  constructor(client: HttpClient) {
    super(client);
    this.locations = new WarehousesLocationsResource(client);
  }

  /** Archive a warehouse */
  async delete(company: string, warehouse: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/warehouses/{warehouse}", { "company": company, "warehouse": warehouse });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a warehouse */
  async show(company: string, warehouse: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/warehouses/{warehouse}", { "company": company, "warehouse": warehouse });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a warehouse */
  async update(company: string, warehouse: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/warehouses/{warehouse}", { "company": company, "warehouse": warehouse });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** Create a warehouse */
  async create(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/warehouses", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all warehouses */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/warehouses", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after");
  }

  /** Find a warehouse by code */
  async findByCode(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/warehouses/find-by-code", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Retrieve the default warehouse */
  async default(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/warehouses/default", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** List warehouse statuses */
  async statuses(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/warehouses/statuses", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** Mark a warehouse as default */
  async markAsDefault(company: string, warehouse: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/warehouses/{warehouse}/mark-as-default", { "company": company, "warehouse": warehouse });
    return this._send<unknown>("POST", path, undefined, config);
  }
}
