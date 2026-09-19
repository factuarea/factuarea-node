// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class GoodsReceiptsLinesResource extends BaseResource {
  /** List the lines of a goods receipt */
  async list(company: string, goodsReceipt: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/goods-receipts/{goods_receipt}/lines", { "company": company, "goods_receipt": goodsReceipt });
    return this._get<unknown>(path, undefined, config);
  }
}

export class GoodsReceiptsResource extends BaseResource {
  readonly lines: GoodsReceiptsLinesResource;

  constructor(client: HttpClient) {
    super(client);
    this.lines = new GoodsReceiptsLinesResource(client);
  }

  /** Bulk change goods receipt status */
  async bulkStatus(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/goods-receipts/bulk-status", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Cancel a goods receipt */
  async cancel(company: string, goodsReceipt: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/goods-receipts/{goods_receipt}/cancel", { "company": company, "goods_receipt": goodsReceipt });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Retrieve goods receipt stats */
  async stats(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/goods-receipts/stats", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** List goods receipt statuses */
  async statuses(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/goods-receipts/statuses", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** List all goods receipts */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/goods-receipts", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after");
  }

  /** Register a goods receipt */
  async create(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/goods-receipts", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Post a goods receipt */
  async post(company: string, goodsReceipt: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/goods-receipts/{goods_receipt}/post", { "company": company, "goods_receipt": goodsReceipt });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Retrieve a goods receipt */
  async show(company: string, goodsReceipt: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/goods-receipts/{goods_receipt}", { "company": company, "goods_receipt": goodsReceipt });
    return this._get<unknown>(path, undefined, config);
  }
}
