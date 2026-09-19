// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class StockTransfersLinesResource extends BaseResource {
  /** Add a line to a stock transfer */
  async create(company: string, stockTransfer: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/stock-transfers/{stock_transfer}/lines", { "company": company, "stock_transfer": stockTransfer });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List the lines of a stock transfer */
  async list(company: string, stockTransfer: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/stock-transfers/{stock_transfer}/lines", { "company": company, "stock_transfer": stockTransfer });
    return this._get<unknown>(path, undefined, config);
  }

  /** Remove a line from a stock transfer */
  async delete(company: string, stockTransfer: string, line: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/stock-transfers/{stock_transfer}/lines/{line}", { "company": company, "stock_transfer": stockTransfer, "line": line });
    return this._send<unknown>("DELETE", path, undefined, config);
  }
}

export class StockTransfersResource extends BaseResource {
  readonly lines: StockTransfersLinesResource;

  constructor(client: HttpClient) {
    super(client);
    this.lines = new StockTransfersLinesResource(client);
  }

  /** Cancel a stock transfer */
  async cancel(company: string, stockTransfer: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/stock-transfers/{stock_transfer}/cancel", { "company": company, "stock_transfer": stockTransfer });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Create a stock transfer */
  async create(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/stock-transfers", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all stock transfers */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/stock-transfers", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after");
  }

  /** Dispatch a stock transfer */
  async dispatch(company: string, stockTransfer: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/stock-transfers/{stock_transfer}/dispatch", { "company": company, "stock_transfer": stockTransfer });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Download stock transfer note PDF */
  async pdf(company: string, stockTransfer: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/stock-transfers/{stock_transfer}/pdf", { "company": company, "stock_transfer": stockTransfer });
    return this._binary(path, "GET", params, undefined, config);
  }

  /** List stock transfer statuses */
  async statuses(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/stock-transfers/statuses", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** Receive a stock transfer */
  async receive(company: string, stockTransfer: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/stock-transfers/{stock_transfer}/receive", { "company": company, "stock_transfer": stockTransfer });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Send a stock transfer note */
  async send(company: string, stockTransfer: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/stock-transfers/{stock_transfer}/send", { "company": company, "stock_transfer": stockTransfer });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Retrieve a stock transfer */
  async show(company: string, stockTransfer: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/stock-transfers/{stock_transfer}", { "company": company, "stock_transfer": stockTransfer });
    return this._get<unknown>(path, undefined, config);
  }
}
