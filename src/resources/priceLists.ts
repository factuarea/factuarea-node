// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class PriceListsItemsResource extends BaseResource {
  /** Delete a price list item */
  async delete(priceList: string, item: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/price-lists/{priceList}/items/{item}", { "priceList": priceList, "item": item });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** List price list items */
  async list(priceList: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/price-lists/{priceList}/items", { "priceList": priceList });
    return this._paginate<unknown>(path, params, "starting_after");
  }

  /** Upsert a price list item */
  async upsert(priceList: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/price-lists/{priceList}/items", { "priceList": priceList });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Permanently delete a retired price list item */
  async purgeRetired(priceList: string, item: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/price-lists/{priceList}/items/{item}/purge", { "priceList": priceList, "item": item });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Reassign a retired price list item */
  async reassignRetired(priceList: string, item: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/price-lists/{priceList}/items/{item}/reassign", { "priceList": priceList, "item": item });
    return this._send<unknown>("POST", path, body, config);
  }
}

export class PriceListsResource extends BaseResource {
  readonly items: PriceListsItemsResource;

  constructor(client: HttpClient) {
    super(client);
    this.items = new PriceListsItemsResource(client);
  }

  /** Create a price list */
  async create(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/price-lists";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List price lists */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/price-lists", params, "starting_after");
  }

  /** Delete a price list */
  async delete(priceList: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/price-lists/{priceList}", { "priceList": priceList });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a price list */
  async show(priceList: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/price-lists/{priceList}", { "priceList": priceList });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a price list */
  async update(priceList: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/price-lists/{priceList}", { "priceList": priceList });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** List active price list options */
  async options(params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = "/price-lists/options";
    return this._get<unknown>(path, params, config);
  }

  /** Resolve a catalog price */
  async resolve(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/price-lists/resolve";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Resolve many catalog prices */
  async resolveMany(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/price-lists/resolve-many";
    return this._send<unknown>("POST", path, body, config);
  }
}
