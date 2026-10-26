// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1PdfTemplatePreviewsCreateData, PublicApiV1PdfTemplatePreviewsCreateResponses } from "../generated/types.gen.js";


export class PdfTemplatePreviewsResource extends BaseResource {
  /** Create a PDF template preview */
  async create(company: string, body?: PublicApiV1PdfTemplatePreviewsCreateData["body"], config?: RequestConfig): Promise<PublicApiV1PdfTemplatePreviewsCreateResponses[200 | 202]> {
    const path = this.buildPath("/companies/{company}/pdf-template-previews", { "company": company });
    return this._send<PublicApiV1PdfTemplatePreviewsCreateResponses[200 | 202]>("POST", path, body, config);
  }
}
