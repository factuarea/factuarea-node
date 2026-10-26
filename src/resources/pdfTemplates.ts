// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryOrJsonResponse, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1PdfTemplatesArchiveData, PublicApiV1PdfTemplatesArchiveResponses, PublicApiV1PdfTemplatesAssetGetResponses, PublicApiV1PdfTemplatesAssetUploadResponses, PublicApiV1PdfTemplatesContactDefaultGetResponses, PublicApiV1PdfTemplatesContactDefaultSetData, PublicApiV1PdfTemplatesContactDefaultSetResponses, PublicApiV1PdfTemplatesCreateData, PublicApiV1PdfTemplatesCreateResponses, PublicApiV1PdfTemplatesDefaultsGetResponses, PublicApiV1PdfTemplatesDefaultsSetData, PublicApiV1PdfTemplatesDefaultsSetResponses, PublicApiV1PdfTemplatesDuplicateData, PublicApiV1PdfTemplatesDuplicateResponses, PublicApiV1PdfTemplatesFindResponses, PublicApiV1PdfTemplatesImpactResponses, PublicApiV1PdfTemplatesListResponses, PublicApiV1PdfTemplatesPublishRevisionData, PublicApiV1PdfTemplatesPublishRevisionResponses, PublicApiV1PdfTemplatesRestoreData, PublicApiV1PdfTemplatesRestoreResponses, PublicApiV1PdfTemplatesRevisionResponses, PublicApiV1PdfTemplatesUpdateData, PublicApiV1PdfTemplatesUpdateResponses } from "../generated/types.gen.js";


export class PdfTemplatesResource extends BaseResource {
  /** Archive a PDF template */
  async archive(company: string, template: string, body?: PublicApiV1PdfTemplatesArchiveData["body"], config?: RequestConfig): Promise<PublicApiV1PdfTemplatesArchiveResponses[200]> {
    const path = this.buildPath("/companies/{company}/pdf-templates/{template}/archive", { "company": company, "template": template });
    return this._send<PublicApiV1PdfTemplatesArchiveResponses[200]>("POST", path, body, config);
  }

  /** Create a PDF template */
  async create(company: string, body?: PublicApiV1PdfTemplatesCreateData["body"], config?: RequestConfig): Promise<PublicApiV1PdfTemplatesCreateResponses[201]> {
    const path = this.buildPath("/companies/{company}/pdf-templates", { "company": company });
    return this._send<PublicApiV1PdfTemplatesCreateResponses[201]>("POST", path, body, config);
  }

  /** List PDF templates */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1PdfTemplatesListResponses[200]> {
    const path = this.buildPath("/companies/{company}/pdf-templates", { "company": company });
    return this._get<PublicApiV1PdfTemplatesListResponses[200]>(path, params, config);
  }

  /** Duplicate a PDF template */
  async duplicate(company: string, template: string, body?: PublicApiV1PdfTemplatesDuplicateData["body"], config?: RequestConfig): Promise<PublicApiV1PdfTemplatesDuplicateResponses[201]> {
    const path = this.buildPath("/companies/{company}/pdf-templates/{template}/duplicate", { "company": company, "template": template });
    return this._send<PublicApiV1PdfTemplatesDuplicateResponses[201]>("POST", path, body, config);
  }

  /** Retrieve a PDF template */
  async find(company: string, template: string, config?: RequestConfig): Promise<PublicApiV1PdfTemplatesFindResponses[200]> {
    const path = this.buildPath("/companies/{company}/pdf-templates/{template}", { "company": company, "template": template });
    return this._get<PublicApiV1PdfTemplatesFindResponses[200]>(path, undefined, config);
  }

  /**
   * Update PDF template metadata
   * Conditional: pass the `ETag` of the last read as `config.ifMatch`.
   */
  async update(company: string, template: string, body?: PublicApiV1PdfTemplatesUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1PdfTemplatesUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/pdf-templates/{template}", { "company": company, "template": template });
    return this._send<PublicApiV1PdfTemplatesUpdateResponses[200]>("PATCH", path, body, config);
  }

  /** Retrieve a contact PDF template preference */
  async contactDefaultGet(company: string, contact: string, documentType: string, purpose: string, config?: RequestConfig): Promise<PublicApiV1PdfTemplatesContactDefaultGetResponses[200]> {
    const path = this.buildPath("/companies/{company}/pdf-templates/contact-defaults/{contact}/{document_type}/{purpose}", { "company": company, "contact": contact, "document_type": documentType, "purpose": purpose });
    return this._get<PublicApiV1PdfTemplatesContactDefaultGetResponses[200]>(path, undefined, config);
  }

  /**
   * Set a contact PDF template preference
   * Conditional: pass the `ETag` of the last read as `config.ifMatch`.
   */
  async contactDefaultSet(company: string, contact: string, documentType: string, purpose: string, body?: PublicApiV1PdfTemplatesContactDefaultSetData["body"], config?: RequestConfig): Promise<PublicApiV1PdfTemplatesContactDefaultSetResponses[200]> {
    const path = this.buildPath("/companies/{company}/pdf-templates/contact-defaults/{contact}/{document_type}/{purpose}", { "company": company, "contact": contact, "document_type": documentType, "purpose": purpose });
    return this._send<PublicApiV1PdfTemplatesContactDefaultSetResponses[200]>("PATCH", path, body, config);
  }

  /** Retrieve the PDF template defaults */
  async defaultsGet(company: string, config?: RequestConfig): Promise<PublicApiV1PdfTemplatesDefaultsGetResponses[200]> {
    const path = this.buildPath("/companies/{company}/pdf-templates/defaults", { "company": company });
    return this._get<PublicApiV1PdfTemplatesDefaultsGetResponses[200]>(path, undefined, config);
  }

  /**
   * Update the PDF template defaults
   * Conditional: pass the `ETag` of the last read as `config.ifMatch`.
   */
  async defaultsSet(company: string, body?: PublicApiV1PdfTemplatesDefaultsSetData["body"], config?: RequestConfig): Promise<PublicApiV1PdfTemplatesDefaultsSetResponses[200]> {
    const path = this.buildPath("/companies/{company}/pdf-templates/defaults", { "company": company });
    return this._send<PublicApiV1PdfTemplatesDefaultsSetResponses[200]>("PATCH", path, body, config);
  }

  /** Inspect the impact of a PDF template change */
  async impact(company: string, template: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1PdfTemplatesImpactResponses[200]> {
    const path = this.buildPath("/companies/{company}/pdf-templates/{template}/impact", { "company": company, "template": template });
    return this._get<PublicApiV1PdfTemplatesImpactResponses[200]>(path, params, config);
  }

  /**
   * Retrieve a PDF template image
   * Answers with JSON metadata by default; send `config.headers: { Accept: "image/png" }` (or another image type) to get the stored bytes.
   */
  async assetGet(company: string, asset: string, config?: RequestConfig): Promise<BinaryOrJsonResponse<PublicApiV1PdfTemplatesAssetGetResponses[200]>> {
    const path = this.buildPath("/companies/{company}/pdf-templates/assets/{asset}", { "company": company, "asset": asset });
    return this._binaryOrJson<PublicApiV1PdfTemplatesAssetGetResponses[200]>(path, "GET", undefined, undefined, config);
  }

  /** Retrieve a PDF template revision */
  async revision(company: string, template: string, revision: string, config?: RequestConfig): Promise<PublicApiV1PdfTemplatesRevisionResponses[200]> {
    const path = this.buildPath("/companies/{company}/pdf-templates/{template}/revisions/{revision}", { "company": company, "template": template, "revision": revision });
    return this._get<PublicApiV1PdfTemplatesRevisionResponses[200]>(path, undefined, config);
  }

  /** Publish a PDF template revision */
  async publishRevision(company: string, template: string, body?: PublicApiV1PdfTemplatesPublishRevisionData["body"], config?: RequestConfig): Promise<PublicApiV1PdfTemplatesPublishRevisionResponses[201]> {
    const path = this.buildPath("/companies/{company}/pdf-templates/{template}/revisions", { "company": company, "template": template });
    return this._send<PublicApiV1PdfTemplatesPublishRevisionResponses[201]>("POST", path, body, config);
  }

  /** Restore a PDF template */
  async restore(company: string, template: string, body?: PublicApiV1PdfTemplatesRestoreData["body"], config?: RequestConfig): Promise<PublicApiV1PdfTemplatesRestoreResponses[200]> {
    const path = this.buildPath("/companies/{company}/pdf-templates/{template}/restore", { "company": company, "template": template });
    return this._send<PublicApiV1PdfTemplatesRestoreResponses[200]>("POST", path, body, config);
  }

  /** Upload a PDF template image */
  async assetUpload(company: string, formData: FormData, config?: RequestConfig): Promise<PublicApiV1PdfTemplatesAssetUploadResponses[201]> {
    const path = this.buildPath("/companies/{company}/pdf-templates/assets", { "company": company });
    return this._sendForm<PublicApiV1PdfTemplatesAssetUploadResponses[201]>(path, formData, config);
  }
}
