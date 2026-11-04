// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1PromotionsCancelResponses, PublicApiV1PromotionsCreateData, PublicApiV1PromotionsCreateResponses, PublicApiV1PromotionsShowResponses, PublicApiV1PromotionsUpdateData, PublicApiV1PromotionsUpdateResponses } from "../generated/types.gen.js";


export class PromotionsResource extends BaseResource {
  /** Cancel a promotion */
  async cancel(company: string, promotion: string, config?: RequestConfig): Promise<PublicApiV1PromotionsCancelResponses[200]> {
    const path = this.buildPath("/companies/{company}/promotions/{promotion}/cancel", { "company": company, "promotion": promotion });
    return this._send<PublicApiV1PromotionsCancelResponses[200]>("POST", path, undefined, config);
  }

  /** Create a promotion */
  async create(company: string, body?: PublicApiV1PromotionsCreateData["body"], config?: RequestConfig): Promise<PublicApiV1PromotionsCreateResponses[201]> {
    const path = this.buildPath("/companies/{company}/promotions", { "company": company });
    return this._send<PublicApiV1PromotionsCreateResponses[201]>("POST", path, body, config);
  }

  /** List all promotions */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/promotions", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Delete a promotion */
  async delete(company: string, promotion: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/promotions/{promotion}", { "company": company, "promotion": promotion });
    return this._send<unknown>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Retrieve a promotion */
  async show(company: string, promotion: string, config?: RequestConfig): Promise<PublicApiV1PromotionsShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/promotions/{promotion}", { "company": company, "promotion": promotion });
    return this._get<PublicApiV1PromotionsShowResponses[200]>(path, undefined, config);
  }

  /** Update a promotion */
  async update(company: string, promotion: string, body?: PublicApiV1PromotionsUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1PromotionsUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/promotions/{promotion}", { "company": company, "promotion": promotion });
    return this._send<PublicApiV1PromotionsUpdateResponses[200]>("PATCH", path, body, config);
  }
}
