import type { HttpClient, BinaryResponse } from "../../core/http-client.js";
import type { RequestConfig } from "../../core/resource.js";
import { CrmDocumentTransport, decodeLibraryReceipt } from "./transport.js";
import { libraryOperation, type CrmDocumentWriteIntent } from "./intent.js";
import type { CommercialDocument, CommercialDocumentListQuery, CommercialDocumentPage, CommercialDocumentReceipt, CrmDocumentCasRequest, CrmDocumentId, CrmDocumentRecoveryConfig, CrmDocumentResponse, CrmDocumentVersion, CrmDocumentWriteConfig, ReplaceCommercialDocumentVersionRequest, RevokeCommercialDocumentShareRequest, ShareCommercialDocumentRequest, UploadCommercialDocumentRequest } from "./types.js";
import * as c from "./codecs.js";
import * as w from "./wire.js";

/** Eight real v1 library operations. Uploads reference an accredited producer; this is not SPA multipart. */
export class CommercialDocumentsResource {
  private readonly transport: CrmDocumentTransport;
  constructor(client: HttpClient) { this.transport = new CrmDocumentTransport(client); }

  list(query: CommercialDocumentListQuery = {}, config?: RequestConfig): Promise<CrmDocumentResponse<CommercialDocumentPage>> {
    const q = w.record(query, [], ["page", "per_page", "search", "sort", "archived"]);
    const page = w.integer(q.page ?? 1), perPage = w.integer(q.per_page ?? 25);
    if (perPage > 100) throw new TypeError("Factuarea: document page size cannot exceed 100.");
    const wire: Record<string, unknown> = { page, per_page: perPage };
    if (w.has(q, "search") && q.search !== null) wire.search = w.cleanText(q.search, 255, true);
    if (w.has(q, "sort")) wire.sort = w.oneOf(q.sort, ["id", "title", "version"] as const);
    if (w.has(q, "archived")) wire.archived = w.boolean(q.archived) ? "true" : "false";
    return this.transport.read("/crm/documents", wire, value => {
      const result = c.libraryPage(value);
      if (result.page !== page || result.per_page !== perPage) throw new TypeError("Factuarea: document response belongs to another page.");
      return result;
    }, config);
  }

  async *iterate(query: Omit<CommercialDocumentListQuery, "page"> = {}, config?: RequestConfig, maxPages = 1000): AsyncGenerator<CommercialDocument> {
    w.integer(maxPages);
    const original = JSON.parse(JSON.stringify(query)) as CommercialDocumentListQuery;
    for (let page = 1; page <= maxPages; page++) {
      const result = (await this.list({ ...original, page }, config)).data;
      yield* result.items;
      if (page * result.per_page >= result.total) return;
      if (result.items.length === 0) throw new TypeError("Factuarea: library pagination made no progress despite its total.");
    }
    throw new TypeError("Factuarea: document iteration reached its explicit maximum page count.");
  }

  get(documentId: CrmDocumentId, config?: RequestConfig): Promise<CrmDocumentResponse<CommercialDocument>> {
    const id = w.id(documentId).toLowerCase();
    return this.transport.read(`/crm/documents/${id}`, {}, value => {
      const result = c.libraryDocument(value);
      if (!w.sameId(result.id, id)) throw new TypeError("Factuarea: document response belongs to another identity.");
      return result;
    }, config);
  }

  upload(body: UploadCommercialDocumentRequest, config: CrmDocumentWriteConfig): Promise<CrmDocumentResponse<CommercialDocumentReceipt>> {
    return this.transport.write("upload", body, config, decodeLibraryReceipt);
  }
  replaceVersion(documentId: CrmDocumentId, body: ReplaceCommercialDocumentVersionRequest, config: CrmDocumentWriteConfig): Promise<CrmDocumentResponse<CommercialDocumentReceipt>> {
    return this.transport.write("replaceVersion", body, config, decodeLibraryReceipt, documentId);
  }
  share(documentId: CrmDocumentId, body: ShareCommercialDocumentRequest, config: CrmDocumentWriteConfig): Promise<CrmDocumentResponse<CommercialDocumentReceipt>> {
    return this.transport.write("share", body, config, decodeLibraryReceipt, documentId);
  }
  revokeShare(documentId: CrmDocumentId, body: RevokeCommercialDocumentShareRequest, config: CrmDocumentWriteConfig): Promise<CrmDocumentResponse<CommercialDocumentReceipt>> {
    return this.transport.write("revokeShare", body, config, decodeLibraryReceipt, documentId);
  }
  archive(documentId: CrmDocumentId, body: CrmDocumentCasRequest, config: CrmDocumentWriteConfig): Promise<CrmDocumentResponse<CommercialDocumentReceipt>> {
    return this.transport.write("archive", body, config, decodeLibraryReceipt, documentId);
  }
  download(documentId: CrmDocumentId, documentVersion?: CrmDocumentVersion, config?: RequestConfig): Promise<BinaryResponse> {
    return this.transport.download(`/crm/documents/${w.id(documentId).toLowerCase()}/download`,
      documentVersion === undefined ? {} : { document_version: w.version(documentVersion) }, config);
  }
  recover(intent: CrmDocumentWriteIntent, config?: CrmDocumentRecoveryConfig): Promise<CrmDocumentResponse<CommercialDocumentReceipt>> {
    if (!libraryOperation(intent.operation)) throw new TypeError("Factuarea: intent belongs to Opportunity documents.");
    return this.transport.recover(intent, decodeLibraryReceipt, config);
  }
}
