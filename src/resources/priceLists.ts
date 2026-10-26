// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1PriceListsCreateData, PublicApiV1PriceListsCreateResponses, PublicApiV1PriceListsItemsPurgeRetiredData, PublicApiV1PriceListsItemsReassignRetiredData, PublicApiV1PriceListsItemsReassignRetiredResponses, PublicApiV1PriceListsItemsUpsertData, PublicApiV1PriceListsItemsUpsertResponses, PublicApiV1PriceListsOptionsResponses, PublicApiV1PriceListsResolveData, PublicApiV1PriceListsResolveManyData, PublicApiV1PriceListsResolveManyResponses, PublicApiV1PriceListsResolveResponses, PublicApiV1PriceListsShowResponses, PublicApiV1PriceListsUpdateData, PublicApiV1PriceListsUpdateResponses } from "../generated/types.gen.js";


export class PriceListsItemsResource extends BaseResource {
  /** Delete a price list item */
  async delete(company: string, priceList: string, item: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/price-lists/{priceList}/items/{item}", { "company": company, "priceList": priceList, "item": item });
    return this._send<unknown>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** List price list items */
  async list(company: string, priceList: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/price-lists/{priceList}/items", { "company": company, "priceList": priceList });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Upsert a price list item */
  async upsert(company: string, priceList: string, body?: PublicApiV1PriceListsItemsUpsertData["body"], config?: RequestConfig): Promise<PublicApiV1PriceListsItemsUpsertResponses[200]> {
    const path = this.buildPath("/companies/{company}/price-lists/{priceList}/items", { "company": company, "priceList": priceList });
    return this._send<PublicApiV1PriceListsItemsUpsertResponses[200]>("POST", path, body, config);
  }

  /** Permanently delete a retired price list item */
  async purgeRetired(company: string, priceList: string, item: string, body?: PublicApiV1PriceListsItemsPurgeRetiredData["body"], config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/price-lists/{priceList}/items/{item}/purge", { "company": company, "priceList": priceList, "item": item });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Reassign a retired price list item */
  async reassignRetired(company: string, priceList: string, item: string, body?: PublicApiV1PriceListsItemsReassignRetiredData["body"], config?: RequestConfig): Promise<PublicApiV1PriceListsItemsReassignRetiredResponses[201]> {
    const path = this.buildPath("/companies/{company}/price-lists/{priceList}/items/{item}/reassign", { "company": company, "priceList": priceList, "item": item });
    return this._send<PublicApiV1PriceListsItemsReassignRetiredResponses[201]>("POST", path, body, config);
  }
}

export class PriceListsResource extends BaseResource {
  readonly items: PriceListsItemsResource;

  constructor(client: HttpClient) {
    super(client);
    this.items = new PriceListsItemsResource(client);
  }

  /** Create a price list */
  async create(company: string, body?: PublicApiV1PriceListsCreateData["body"], config?: RequestConfig): Promise<PublicApiV1PriceListsCreateResponses[201]> {
    const path = this.buildPath("/companies/{company}/price-lists", { "company": company });
    return this._send<PublicApiV1PriceListsCreateResponses[201]>("POST", path, body, config);
  }

  /** List price lists */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/price-lists", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Delete a price list */
  async delete(company: string, priceList: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/price-lists/{priceList}", { "company": company, "priceList": priceList });
    return this._send<unknown>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Retrieve a price list */
  async show(company: string, priceList: string, config?: RequestConfig): Promise<PublicApiV1PriceListsShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/price-lists/{priceList}", { "company": company, "priceList": priceList });
    return this._get<PublicApiV1PriceListsShowResponses[200]>(path, undefined, config);
  }

  /** Update a price list */
  async update(company: string, priceList: string, body?: PublicApiV1PriceListsUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1PriceListsUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/price-lists/{priceList}", { "company": company, "priceList": priceList });
    return this._send<PublicApiV1PriceListsUpdateResponses[200]>("PATCH", path, body, config);
  }

  /** List active price list options */
  async options(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1PriceListsOptionsResponses[200]> {
    const path = this.buildPath("/companies/{company}/price-lists/options", { "company": company });
    return this._get<PublicApiV1PriceListsOptionsResponses[200]>(path, params, config);
  }

  /** Resolve a catalog price */
  async resolve(company: string, body?: PublicApiV1PriceListsResolveData["body"], config?: RequestConfig): Promise<PublicApiV1PriceListsResolveResponses[200]> {
    const path = this.buildPath("/companies/{company}/price-lists/resolve", { "company": company });
    return this._send<PublicApiV1PriceListsResolveResponses[200]>("POST", path, body, config);
  }

  /** Resolve many catalog prices */
  async resolveMany(company: string, body?: PublicApiV1PriceListsResolveManyData["body"], config?: RequestConfig): Promise<PublicApiV1PriceListsResolveManyResponses[200]> {
    const path = this.buildPath("/companies/{company}/price-lists/resolve-many", { "company": company });
    return this._send<PublicApiV1PriceListsResolveManyResponses[200]>("POST", path, body, config);
  }
}
