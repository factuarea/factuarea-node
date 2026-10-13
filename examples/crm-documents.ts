import {
  Factuarea, CrmDocumentWriteUnconfirmedError,
  type CrmDocumentId, type CrmDocumentResponse, type CrmDocumentWriteIntent,
  type LinkOpportunityDocumentRequest, type NativeDocumentId,
  type OpportunityDocumentLink, type OpportunityDocumentUnlinkReceipt,
} from "../src/index.js";

interface RetainedLinkRequest {
  operation: "link";
  opportunityId: CrmDocumentId;
  body: LinkOpportunityDocumentRequest;
  idempotencyKey: string;
}

/** The caller selects a real candidate and persists the original request/key before calling the native owner. */
export async function linkReviewedQuote(client: Factuarea, opportunityId: CrmDocumentId, documentId: NativeDocumentId,
  originalKey: string, persist: (request: RetainedLinkRequest) => Promise<void>): Promise<CrmDocumentResponse<OpportunityDocumentLink>> {
  const body: LinkOpportunityDocumentRequest = { document_type: "quote", document_id: documentId, is_primary: false };
  await persist({ operation: "link", opportunityId, body, idempotencyKey: originalKey });
  return client.opportunityDocuments.link(opportunityId, body, { idempotencyKey: originalKey });
}

/** Invoke only after the caller explicitly decides to reconcile the retained original intention. */
export async function recoverReviewedLink(client: Factuarea, intent: CrmDocumentWriteIntent): Promise<CrmDocumentResponse<OpportunityDocumentLink | OpportunityDocumentUnlinkReceipt>> {
  return client.opportunityDocuments.recover(intent);
}

/** An unconfirmed send is exposed to the caller, never automatically replayed. */
export async function retainedLinkResult(client: Factuarea, request: RetainedLinkRequest): Promise<
  { state: "confirmed"; result: CrmDocumentResponse<OpportunityDocumentLink> }
  | { state: "unconfirmed"; intent: CrmDocumentWriteIntent; requestId: string | null }
> {
  try {
    return {
      state: "confirmed", result: await client.opportunityDocuments.link(request.opportunityId, request.body,
        { idempotencyKey: request.idempotencyKey })
    };
  } catch (error) {
    if (!(error instanceof CrmDocumentWriteUnconfirmedError)) throw error;
    return { state: "unconfirmed", intent: error.intent, requestId: error.requestId ?? null };
  }
}
