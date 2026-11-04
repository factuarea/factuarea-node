// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1PacksArchiveResponses, PublicApiV1PacksCreateData, PublicApiV1PacksCreateResponses, PublicApiV1PacksImagesUpdateData, PublicApiV1PacksImagesUpdateResponses, PublicApiV1PacksImagesUploadResponses, PublicApiV1PacksPriceBreakdownResponses, PublicApiV1PacksRestoreResponses, PublicApiV1PacksShowResponses, PublicApiV1PacksUpdateData, PublicApiV1PacksUpdateResponses } from "../generated/types.gen.js";


export class PacksImagesResource extends BaseResource {
  /** Remove a pack image */
  async delete(company: string, pack: string, image: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/packs/{pack}/images/{image}", { "company": company, "pack": pack, "image": image });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Update a pack image */
  async update(company: string, pack: string, image: string, body?: PublicApiV1PacksImagesUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1PacksImagesUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/packs/{pack}/images/{image}", { "company": company, "pack": pack, "image": image });
    return this._send<PublicApiV1PacksImagesUpdateResponses[200]>("PATCH", path, body, config);
  }

  /** Upload an image to a pack */
  async upload(company: string, pack: string, formData: FormData, config?: RequestConfig): Promise<PublicApiV1PacksImagesUploadResponses[201]> {
    const path = this.buildPath("/companies/{company}/packs/{pack}/images", { "company": company, "pack": pack });
    return this._sendForm<PublicApiV1PacksImagesUploadResponses[201]>(path, formData, config);
  }
}

export class PacksResource extends BaseResource {
  readonly images: PacksImagesResource;

  constructor(client: HttpClient) {
    super(client);
    this.images = new PacksImagesResource(client);
  }

  /** Archive a pack */
  async archive(company: string, pack: string, config?: RequestConfig): Promise<PublicApiV1PacksArchiveResponses[200]> {
    const path = this.buildPath("/companies/{company}/packs/{pack}/archive", { "company": company, "pack": pack });
    return this._send<PublicApiV1PacksArchiveResponses[200]>("POST", path, undefined, config);
  }

  /** Create a pack */
  async create(company: string, body?: PublicApiV1PacksCreateData["body"], config?: RequestConfig): Promise<PublicApiV1PacksCreateResponses[201]> {
    const path = this.buildPath("/companies/{company}/packs", { "company": company });
    return this._send<PublicApiV1PacksCreateResponses[201]>("POST", path, body, config);
  }

  /** List all packs */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/packs", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Delete a pack */
  async delete(company: string, pack: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/packs/{pack}", { "company": company, "pack": pack });
    return this._send<unknown>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Retrieve a pack */
  async show(company: string, pack: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1PacksShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/packs/{pack}", { "company": company, "pack": pack });
    return this._get<PublicApiV1PacksShowResponses[200]>(path, params, config);
  }

  /** Update a pack */
  async update(company: string, pack: string, body?: PublicApiV1PacksUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1PacksUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/packs/{pack}", { "company": company, "pack": pack });
    return this._send<PublicApiV1PacksUpdateResponses[200]>("PATCH", path, body, config);
  }

  /** Get the price breakdown of a pack */
  async priceBreakdown(company: string, pack: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1PacksPriceBreakdownResponses[200]> {
    const path = this.buildPath("/companies/{company}/packs/{pack}/price-breakdown", { "company": company, "pack": pack });
    return this._get<PublicApiV1PacksPriceBreakdownResponses[200]>(path, params, config);
  }

  /** Restore a pack */
  async restore(company: string, pack: string, config?: RequestConfig): Promise<PublicApiV1PacksRestoreResponses[200]> {
    const path = this.buildPath("/companies/{company}/packs/{pack}/restore", { "company": company, "pack": pack });
    return this._send<PublicApiV1PacksRestoreResponses[200]>("POST", path, undefined, config);
  }
}
