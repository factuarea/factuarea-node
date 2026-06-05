// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class ClientsResource extends BaseResource {
  /** Delete multiple clients in bulk */
  async bulkDelete(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/clients/bulk-delete";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Delete multiple clients in bulk (deprecated alias) */
  async bulkDeleteLegacy(params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = "/clients/bulk";
    return this._delete<unknown>(path, params, config);
  }

  /** Create a client */
  async create(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/clients";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all clients */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/clients", params, "starting_after");
  }

  /** Delete a client */
  async delete(client: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/clients/{client}", { "client": client });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a client */
  async show(client: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/clients/{client}", { "client": client });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a client */
  async update(client: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/clients/{client}", { "client": client });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** Find a client by tax ID */
  async findByTaxId(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/clients/find-by-tax-id";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List client activity timeline */
  async activities(client: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/clients/{client}/activities", { "client": client });
    return this._get<unknown>(path, undefined, config);
  }

  /** Get client stats */
  async stats(config?: RequestConfig): Promise<unknown> {
    const path = "/clients/stats";
    return this._get<unknown>(path, undefined, config);
  }

  /** Search clients */
  async search(params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = "/clients/search";
    return this._get<unknown>(path, params, config);
  }
}
