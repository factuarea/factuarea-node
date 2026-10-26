// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1PdfCommercialIdentitiesArchiveData, PublicApiV1PdfCommercialIdentitiesArchiveResponses, PublicApiV1PdfCommercialIdentitiesCreateData, PublicApiV1PdfCommercialIdentitiesCreateResponses, PublicApiV1PdfCommercialIdentitiesFindResponses, PublicApiV1PdfCommercialIdentitiesImpactResponses, PublicApiV1PdfCommercialIdentitiesListResponses, PublicApiV1PdfCommercialIdentitiesPublishRevisionData, PublicApiV1PdfCommercialIdentitiesPublishRevisionResponses, PublicApiV1PdfCommercialIdentitiesRestoreData, PublicApiV1PdfCommercialIdentitiesRestoreResponses, PublicApiV1PdfCommercialIdentitiesRevisionResponses, PublicApiV1PdfCommercialIdentitiesUpdateData, PublicApiV1PdfCommercialIdentitiesUpdateResponses } from "../generated/types.gen.js";


export class PdfCommercialIdentitiesResource extends BaseResource {
  /** Archive a PDF commercial identity */
  async archive(company: string, identity: string, body?: PublicApiV1PdfCommercialIdentitiesArchiveData["body"], config?: RequestConfig): Promise<PublicApiV1PdfCommercialIdentitiesArchiveResponses[200]> {
    const path = this.buildPath("/companies/{company}/pdf-commercial-identities/{identity}/archive", { "company": company, "identity": identity });
    return this._send<PublicApiV1PdfCommercialIdentitiesArchiveResponses[200]>("POST", path, body, config);
  }

  /** Create a PDF commercial identity */
  async create(company: string, body?: PublicApiV1PdfCommercialIdentitiesCreateData["body"], config?: RequestConfig): Promise<PublicApiV1PdfCommercialIdentitiesCreateResponses[201]> {
    const path = this.buildPath("/companies/{company}/pdf-commercial-identities", { "company": company });
    return this._send<PublicApiV1PdfCommercialIdentitiesCreateResponses[201]>("POST", path, body, config);
  }

  /** List PDF commercial identities */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1PdfCommercialIdentitiesListResponses[200]> {
    const path = this.buildPath("/companies/{company}/pdf-commercial-identities", { "company": company });
    return this._get<PublicApiV1PdfCommercialIdentitiesListResponses[200]>(path, params, config);
  }

  /** Retrieve a PDF commercial identity */
  async find(company: string, identity: string, config?: RequestConfig): Promise<PublicApiV1PdfCommercialIdentitiesFindResponses[200]> {
    const path = this.buildPath("/companies/{company}/pdf-commercial-identities/{identity}", { "company": company, "identity": identity });
    return this._get<PublicApiV1PdfCommercialIdentitiesFindResponses[200]>(path, undefined, config);
  }

  /**
   * Update PDF commercial identity metadata
   * Conditional: pass the `ETag` of the last read as `config.ifMatch`.
   */
  async update(company: string, identity: string, body?: PublicApiV1PdfCommercialIdentitiesUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1PdfCommercialIdentitiesUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/pdf-commercial-identities/{identity}", { "company": company, "identity": identity });
    return this._send<PublicApiV1PdfCommercialIdentitiesUpdateResponses[200]>("PATCH", path, body, config);
  }

  /** Inspect the impact of a PDF commercial identity change */
  async impact(company: string, identity: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1PdfCommercialIdentitiesImpactResponses[200]> {
    const path = this.buildPath("/companies/{company}/pdf-commercial-identities/{identity}/impact", { "company": company, "identity": identity });
    return this._get<PublicApiV1PdfCommercialIdentitiesImpactResponses[200]>(path, params, config);
  }

  /** Retrieve a PDF commercial identity revision */
  async revision(company: string, identity: string, revision: string, config?: RequestConfig): Promise<PublicApiV1PdfCommercialIdentitiesRevisionResponses[200]> {
    const path = this.buildPath("/companies/{company}/pdf-commercial-identities/{identity}/revisions/{revision}", { "company": company, "identity": identity, "revision": revision });
    return this._get<PublicApiV1PdfCommercialIdentitiesRevisionResponses[200]>(path, undefined, config);
  }

  /** Publish a PDF commercial identity revision */
  async publishRevision(company: string, identity: string, body?: PublicApiV1PdfCommercialIdentitiesPublishRevisionData["body"], config?: RequestConfig): Promise<PublicApiV1PdfCommercialIdentitiesPublishRevisionResponses[201]> {
    const path = this.buildPath("/companies/{company}/pdf-commercial-identities/{identity}/revisions", { "company": company, "identity": identity });
    return this._send<PublicApiV1PdfCommercialIdentitiesPublishRevisionResponses[201]>("POST", path, body, config);
  }

  /** Restore a PDF commercial identity */
  async restore(company: string, identity: string, body?: PublicApiV1PdfCommercialIdentitiesRestoreData["body"], config?: RequestConfig): Promise<PublicApiV1PdfCommercialIdentitiesRestoreResponses[200]> {
    const path = this.buildPath("/companies/{company}/pdf-commercial-identities/{identity}/restore", { "company": company, "identity": identity });
    return this._send<PublicApiV1PdfCommercialIdentitiesRestoreResponses[200]>("POST", path, body, config);
  }
}
