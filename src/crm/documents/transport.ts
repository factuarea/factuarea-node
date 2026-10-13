import { FactuareaError, ConnectionError } from "../../core/errors.js";
import { RequestContextChangedError, type HttpClient, type ApiResponse, type BinaryResponse } from "../../core/http-client.js";
import type { RequestConfig } from "../../core/resource.js";
import { CrmDocumentWriteUnconfirmedError } from "./errors.js";
import { createIntent, libraryOperation, retainedIntent, type CrmDocumentWriteIntent } from "./intent.js";
import type { CommercialDocumentReceipt, CrmDocumentRecoveryConfig, CrmDocumentResponse, CrmDocumentWriteConfig, CrmDocumentWriteOperation, OpportunityDocumentLink, OpportunityDocumentUnlinkReceipt } from "./types.js";
import * as c from "./codecs.js";
import * as w from "./wire.js";

export type DocumentReceipt = CommercialDocumentReceipt | OpportunityDocumentLink | OpportunityDocumentUnlinkReceipt;

/** Uses the existing authentication, error decoder, timeouts and binary transport. Writes attempt once. */
export class CrmDocumentTransport {
  constructor(readonly client: HttpClient) { }

  async read<T>(path: string, query: Record<string, unknown>, decode: (wire: unknown) => T, config?: RequestConfig): Promise<CrmDocumentResponse<T>> {
    const response = await this.client.request<unknown>({ ...config, method: "GET", path, query });
    if (response.status !== 200) throw new TypeError("Factuarea: unexpected native document read status.");
    return { ...response, data: decode(c.envelope(response.data)) };
  }

  async download(path: string, query: Record<string, unknown>, config?: RequestConfig): Promise<BinaryResponse> {
    const response = await this.client.requestBinary({ ...config, method: "GET", path, query });
    if (response.status !== 200 || response.contentType === null) throw new TypeError("Factuarea: missing native document stream.");
    w.mime(response.contentType.split(";", 1)[0]);
    return response;
  }

  async write<T extends DocumentReceipt>(operation: CrmDocumentWriteOperation, body: unknown, config: CrmDocumentWriteConfig,
    decode: (intent: CrmDocumentWriteIntent, wire: unknown) => T, targetId?: string, opportunityId?: string): Promise<CrmDocumentResponse<T>> {
    const intent = await createIntent(this.client, operation, body, config, targetId, opportunityId);
    return this.execute(intent, decode);
  }

  async recover<T extends DocumentReceipt>(intent: CrmDocumentWriteIntent, decode: (intent: CrmDocumentWriteIntent, wire: unknown) => T,
    config?: CrmDocumentRecoveryConfig): Promise<CrmDocumentResponse<T>> {
    retainedIntent(intent, this.client, true);
    if (config !== undefined) {
      w.record(config, [], ["timeout", "signal"]);
      if (config.timeout !== undefined) w.integer(config.timeout);
      if (config.signal !== undefined && !(config.signal instanceof AbortSignal)) throw new TypeError("Factuarea: signal must be an AbortSignal.");
    }
    return this.execute(intent, decode, config);
  }

  private async execute<T extends DocumentReceipt>(intent: CrmDocumentWriteIntent, decode: (intent: CrmDocumentWriteIntent, wire: unknown) => T,
    recovery?: CrmDocumentRecoveryConfig): Promise<CrmDocumentResponse<T>> {
    const state = retainedIntent(intent, this.client);
    let response: ApiResponse<unknown> | undefined;
    try {
      state.sent = true;
      response = await this.client.request<unknown>({
        ...state.config, signal: recovery === undefined ? state.config.signal : recovery.signal,
        timeout: recovery?.timeout ?? state.config.timeout,
        method: intent.method, path: intent.path, body: JSON.parse(intent.bodyJson),
        contextFingerprint: state.fingerprint, idempotencyKey: intent.idempotencyKey, maxRetries: 0,
      });
      const status = intent.operation === "upload" || intent.operation === "createQuote" || intent.operation === "link" ? 201 : 200;
      if (response.status !== status) throw new TypeError("Factuarea: missing native confirmed document receipt status.");
      return { ...response, data: decode(intent, c.envelope(response.data)) };
    } catch (error) {
      if (error instanceof RequestContextChangedError) throw error;
      if (error instanceof FactuareaError && !(error instanceof ConnectionError)) {
        const ambiguous = (error.status ?? 0) >= 500 || [403, 404].includes(error.status ?? 0)
          || /unconfirmed|revoked/.test(error.subcode ?? "");
        if (!ambiguous) throw error;
      }
      throw new CrmDocumentWriteUnconfirmedError(intent, error, response);
    }
  }
}

/** A successful replay returns the original immutable receipt, never a guessed current head. */
export function decodeLibraryReceipt(intent: CrmDocumentWriteIntent, wire: unknown): CommercialDocumentReceipt {
  if (!libraryOperation(intent.operation)) throw new TypeError("Factuarea: intent belongs to Opportunity documents.");
  const result = c.libraryReceipt(wire);
  if ((intent.targetId !== undefined && !w.sameId(result.id, intent.targetId))
    || (intent.expectedVersion !== undefined && result.version !== intent.expectedVersion + 1)
    || (intent.operation === "upload" && result.version !== 1)) throw new TypeError("Factuarea: document receipt differs from its original identity/CAS.");
  return result;
}
export function decodeOpportunityReceipt(intent: CrmDocumentWriteIntent, wire: unknown): OpportunityDocumentLink | OpportunityDocumentUnlinkReceipt {
  if (libraryOperation(intent.operation)) throw new TypeError("Factuarea: intent belongs to the document library.");
  if (intent.operation === "unlink") {
    const result = c.unlinkReceipt(wire);
    if (!w.sameId(result.id, intent.targetId ?? "") || !w.sameId(result.opportunity_id, intent.opportunityId ?? "")
      || result.version !== (intent.expectedVersion ?? 0) + 1) throw new TypeError("Factuarea: unlink receipt differs from its original association/CAS.");
    return result;
  }
  const result = c.opportunityLink(wire);
  if (result.status !== "linked" || result.document === null || !w.sameId(result.opportunity_id, intent.opportunityId ?? "")
    || result.document_type !== intent.documentType || (intent.documentId !== undefined && !w.sameId(result.document_id, intent.documentId))
    || (intent.isPrimary === true && !result.is_primary)) throw new TypeError("Factuarea: linked receipt differs from its original native owner intent.");
  return result;
}
