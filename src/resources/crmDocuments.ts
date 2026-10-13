// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


import type * as NativeApi from "../generated/types.gen.js";

export class CrmDocumentsResource extends BaseResource {
  /** Biblioteca privada: archive */
  async crmArchiveCommercialDocument(document: string, body: NativeApi.CrmArchiveCommercialDocumentData["body"], config?: RequestConfig): Promise<NativeApi.CrmArchiveCommercialDocumentResponse> {
    const path = this.buildPath("/crm/documents/{document}/archive", { "document": document });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmArchiveCommercialDocumentResponse>("POST", path, body, config);
  }

  /** Biblioteca privada: download */
  async crmDownloadCommercialDocument(document: string, params?: NativeApi.CrmDownloadCommercialDocumentData["query"], config?: RequestConfig): Promise<NativeApi.CrmDownloadCommercialDocumentResponse> {
    const path = this.buildPath("/crm/documents/{document}/download", { "document": document });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmDownloadCommercialDocumentResponse>(path, params, config);
  }

  /** Biblioteca privada: get */
  async crmGetCommercialDocument(document: string, config?: RequestConfig): Promise<NativeApi.CrmGetCommercialDocumentResponse> {
    const path = this.buildPath("/crm/documents/{document}", { "document": document });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmGetCommercialDocumentResponse>(path, undefined, config);
  }

  /** Biblioteca privada: list */
  async crmListCommercialDocuments(params?: NativeApi.CrmListCommercialDocumentsData["query"], config?: RequestConfig): Promise<NativeApi.CrmListCommercialDocumentsResponse> {
    const path = "/crm/documents";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmListCommercialDocumentsResponse>(path, params, config);
  }

  /** Biblioteca privada: upload */
  async crmUploadCommercialDocument(body: NativeApi.CrmUploadCommercialDocumentData["body"], config?: RequestConfig): Promise<NativeApi.CrmUploadCommercialDocumentResponse> {
    const path = "/crm/documents";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmUploadCommercialDocumentResponse>("POST", path, body, config);
  }

  /** Biblioteca privada: replace_version */
  async crmReplaceCommercialDocumentVersion(document: string, body: NativeApi.CrmReplaceCommercialDocumentVersionData["body"], config?: RequestConfig): Promise<NativeApi.CrmReplaceCommercialDocumentVersionResponse> {
    const path = this.buildPath("/crm/documents/{document}/versions", { "document": document });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmReplaceCommercialDocumentVersionResponse>("POST", path, body, config);
  }

  /** Biblioteca privada: revoke_share */
  async crmRevokeCommercialDocumentShare(document: string, body: NativeApi.CrmRevokeCommercialDocumentShareData["body"], config?: RequestConfig): Promise<NativeApi.CrmRevokeCommercialDocumentShareResponse> {
    const path = this.buildPath("/crm/documents/{document}/shares/revoke", { "document": document });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmRevokeCommercialDocumentShareResponse>("POST", path, body, config);
  }

  /** Biblioteca privada: share */
  async crmShareCommercialDocument(document: string, body: NativeApi.CrmShareCommercialDocumentData["body"], config?: RequestConfig): Promise<NativeApi.CrmShareCommercialDocumentResponse> {
    const path = this.buildPath("/crm/documents/{document}/shares", { "document": document });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmShareCommercialDocumentResponse>("POST", path, body, config);
  }
}
