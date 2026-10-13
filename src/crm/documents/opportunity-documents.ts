import type { HttpClient } from "../../core/http-client.js";
import type { RequestConfig } from "../../core/resource.js";
import { CrmDocumentTransport, decodeOpportunityReceipt, type DocumentReceipt } from "./transport.js";
import { libraryOperation, type CrmDocumentWriteIntent } from "./intent.js";
import type { CrmDocumentCasRequest, CrmDocumentId, CrmDocumentRecoveryConfig, CrmDocumentResponse, CrmDocumentWriteConfig, CreateOpportunityQuoteRequest, LinkOpportunityDocumentRequest, OpportunityDocumentCandidate, OpportunityDocumentCandidatePage, OpportunityDocumentCandidateQuery, OpportunityDocumentFinancialSummary, OpportunityDocumentLink, OpportunityDocumentListQuery, OpportunityDocumentPage, OpportunityDocumentUnlinkReceipt } from "./types.js";
import * as c from "./codecs.js";
import * as w from "./wire.js";

/** Six native v1 operations; fiscal documents stay under their original Quote/Invoice/Contract/Recurring owners. */
export class OpportunityDocumentsResource {
  private readonly transport: CrmDocumentTransport;
  constructor(client: HttpClient) { this.transport = new CrmDocumentTransport(client); }

  list(opportunityId: CrmDocumentId, query: OpportunityDocumentListQuery = {}, config?: RequestConfig): Promise<CrmDocumentResponse<OpportunityDocumentPage>> {
    const id = w.id(opportunityId).toLowerCase();
    const q = w.record(query, [], ["filters", "cursor", "limit"]);
    const filters = q.filters === undefined ? {} : w.record(q.filters, [], ["document_type", "status", "is_primary", "sort", "direction"]);
    const f: Record<string, unknown> = {};
    if (w.has(filters, "document_type")) f.document_type = w.documentType(filters.document_type);
    if (w.has(filters, "status")) f.status = w.oneOf(filters.status, ["pending", "linked", "conflict"] as const);
    if (w.has(filters, "is_primary")) f.is_primary = w.boolean(filters.is_primary);
    if (w.has(filters, "sort")) f.sort = w.oneOf(filters.sort, ["id", "version", "document_type", "document_id", "status", "is_primary"] as const);
    if (w.has(filters, "direction")) f.direction = w.oneOf(filters.direction, ["asc", "desc"] as const);
    const wire: Record<string, unknown> = { filters: JSON.stringify(f), limit: this.limit(q.limit) };
    if (w.has(q, "cursor")) wire.cursor = w.text(q.cursor, 8192);
    return this.transport.read(`/crm/opportunitydocuments/${id}/documents`, wire, value => {
      const result = c.opportunityPage(value);
      if (!w.sameId(result.opportunity_id, id)) throw new TypeError("Factuarea: document page belongs to another Opportunity.");
      return result;
    }, config);
  }

  async *iterate(opportunityId: CrmDocumentId, query: OpportunityDocumentListQuery = {}, config?: RequestConfig, maxPages = 1000): AsyncGenerator<OpportunityDocumentLink> {
    w.integer(maxPages);
    const original = JSON.parse(JSON.stringify(query)) as OpportunityDocumentListQuery;
    const seen = new Set<string>(original.cursor === undefined ? [] : [original.cursor]);
    let cursor = original.cursor;
    for (let page = 0; page < maxPages; page++) {
      const result = (await this.list(opportunityId, { ...original, cursor }, config)).data;
      yield* result.items;
      if (result.next_cursor === null) return;
      if (seen.has(result.next_cursor)) throw new TypeError("Factuarea: native document cursor did not advance.");
      seen.add(result.next_cursor);
      cursor = result.next_cursor;
    }
    throw new TypeError("Factuarea: document iteration reached its explicit maximum page count.");
  }

  candidates(opportunityId: CrmDocumentId, query: OpportunityDocumentCandidateQuery, config?: RequestConfig): Promise<CrmDocumentResponse<OpportunityDocumentCandidatePage>> {
    const id = w.id(opportunityId).toLowerCase();
    const q = w.record(query, ["document_type"], ["search", "cursor", "limit"]);
    const type = w.documentType(q.document_type);
    const wire: Record<string, unknown> = { document_type: type, search: w.text(q.search ?? "", 100, true), limit: this.limit(q.limit) };
    if (w.has(q, "cursor")) wire.cursor = w.text(q.cursor, 32768);
    return this.transport.read(`/crm/opportunities/${id}/documents/candidates`, wire, value => {
      const result = c.candidatePage(value);
      if (!w.sameId(result.opportunity_id, id) || result.document_type !== type) throw new TypeError("Factuarea: candidate page belongs to another parent/owner.");
      return result;
    }, config);
  }

  async *iterateCandidates(opportunityId: CrmDocumentId, query: OpportunityDocumentCandidateQuery, config?: RequestConfig, maxPages = 1000): AsyncGenerator<OpportunityDocumentCandidate> {
    w.integer(maxPages);
    const original = JSON.parse(JSON.stringify(query)) as OpportunityDocumentCandidateQuery;
    const seen = new Set<string>(original.cursor === undefined ? [] : [original.cursor]);
    let cursor = original.cursor;
    for (let page = 0; page < maxPages; page++) {
      const result = (await this.candidates(opportunityId, { ...original, cursor }, config)).data;
      yield* result.items;
      if (result.next_cursor === null) return;
      if (seen.has(result.next_cursor)) throw new TypeError("Factuarea: native candidate cursor did not advance.");
      seen.add(result.next_cursor);
      cursor = result.next_cursor;
    }
    throw new TypeError("Factuarea: candidate iteration reached its explicit maximum page count.");
  }

  financialSummary(opportunityId: CrmDocumentId, config?: RequestConfig): Promise<CrmDocumentResponse<OpportunityDocumentFinancialSummary>> {
    const id = w.id(opportunityId).toLowerCase();
    return this.transport.read(`/crm/opportunitydocuments/${id}/financial-summary`, {}, value => {
      const result = c.financialSummary(value);
      if (!w.sameId(result.opportunity_id, id)) throw new TypeError("Factuarea: financial summary belongs to another Opportunity.");
      return result;
    }, config);
  }

  async createQuote(opportunityId: CrmDocumentId, body: CreateOpportunityQuoteRequest, config: CrmDocumentWriteConfig): Promise<CrmDocumentResponse<OpportunityDocumentLink>> {
    return this.linked(await this.transport.write("createQuote", body, config, decodeOpportunityReceipt, undefined, opportunityId));
  }
  async link(opportunityId: CrmDocumentId, body: LinkOpportunityDocumentRequest, config: CrmDocumentWriteConfig): Promise<CrmDocumentResponse<OpportunityDocumentLink>> {
    return this.linked(await this.transport.write("link", body, config, decodeOpportunityReceipt, undefined, opportunityId));
  }
  async unlink(opportunityId: CrmDocumentId, linkId: CrmDocumentId, body: CrmDocumentCasRequest, config: CrmDocumentWriteConfig): Promise<CrmDocumentResponse<OpportunityDocumentUnlinkReceipt>> {
    const response = await this.transport.write("unlink", body, config, decodeOpportunityReceipt, linkId, opportunityId);
    if ("is_primary" in response.data) throw new TypeError("Factuarea: expected the native unlink receipt.");
    return { ...response, data: response.data };
  }
  recover(intent: CrmDocumentWriteIntent, config?: CrmDocumentRecoveryConfig): Promise<CrmDocumentResponse<OpportunityDocumentLink | OpportunityDocumentUnlinkReceipt>> {
    if (libraryOperation(intent.operation)) throw new TypeError("Factuarea: intent belongs to the document library.");
    return this.transport.recover(intent, decodeOpportunityReceipt, config);
  }
  private linked(response: CrmDocumentResponse<DocumentReceipt>): CrmDocumentResponse<OpportunityDocumentLink> {
    if (!("is_primary" in response.data)) throw new TypeError("Factuarea: expected the native linked document receipt.");
    return { ...response, data: response.data };
  }
  private limit(value: unknown): number {
    const limit = w.integer(value === undefined ? 25 : value);
    if (limit > 100) throw new TypeError("Factuarea: document limit cannot exceed 100.");
    return limit;
  }
}
