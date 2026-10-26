// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryOrJsonResponse, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1PdfArtifactsPrepareData, PublicApiV1PdfArtifactsPrepareResponses, PublicApiV1PdfArtifactsRenderData, PublicApiV1PdfArtifactsRenderResponses, PublicApiV1PdfArtifactsShowResponses } from "../generated/types.gen.js";


export class PdfArtifactsResource extends BaseResource {
  /**
   * Download the exact retained PDF
   * Pass the `ETag` you hold as `config.ifNoneMatch` to get a `not_modified` result when it is current.
   */
  async download(company: string, artifact: string, config?: RequestConfig): Promise<BinaryOrJsonResponse<unknown>> {
    const path = this.buildPath("/companies/{company}/pdf-artifacts/{artifact}/download", { "company": company, "artifact": artifact });
    return this._binaryOrJson<unknown>(path, "GET", undefined, undefined, config);
  }

  /** Read PDF artifact metadata */
  async show(company: string, artifact: string, config?: RequestConfig): Promise<PublicApiV1PdfArtifactsShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/pdf-artifacts/{artifact}", { "company": company, "artifact": artifact });
    return this._get<PublicApiV1PdfArtifactsShowResponses[200]>(path, undefined, config);
  }

  /** Prepare an exact presentation PDF */
  async prepare(company: string, body?: PublicApiV1PdfArtifactsPrepareData["body"], config?: RequestConfig): Promise<PublicApiV1PdfArtifactsPrepareResponses[200 | 202]> {
    const path = this.buildPath("/companies/{company}/pdf-artifacts", { "company": company });
    return this._send<PublicApiV1PdfArtifactsPrepareResponses[200 | 202]>("POST", path, body, config);
  }

  /** Render a prepared PDF artifact */
  async render(company: string, artifact: string, body?: PublicApiV1PdfArtifactsRenderData["body"], config?: RequestConfig): Promise<PublicApiV1PdfArtifactsRenderResponses[200 | 202]> {
    const path = this.buildPath("/companies/{company}/pdf-artifacts/{artifact}/render", { "company": company, "artifact": artifact });
    return this._send<PublicApiV1PdfArtifactsRenderResponses[200 | 202]>("POST", path, body, config);
  }
}
