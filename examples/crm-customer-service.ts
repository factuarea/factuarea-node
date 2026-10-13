import { CustomerServiceWriteUnconfirmedError, Factuarea, serviceTicketId, type ServiceTicketId } from "../src/index.js";

/** Compose with an already configured SDK. The caller supplies durable original keys and chooses whether to recover. */
export async function attachTicketDocument(sdk: Factuarea, ticketId: ServiceTicketId, documentId: ServiceTicketId,
  originalKey: string): Promise<void> {
  const ticket = (await sdk.customerService.get(ticketId)).data;
  const document = (await sdk.commercialDocuments.get(documentId)).data;
  await sdk.customerService.attachDocument(ticketId, {
    expected_version: ticket.version, document_id: document.id, document_version: document.version,
  }, { idempotencyKey: originalKey });
}

/** The server-owned attachment id comes from an authorized read. Missing children do not mean an empty list. */
export async function detachTicketDocument(sdk: Factuarea, ticketId: ServiceTicketId, attachmentId: ServiceTicketId,
  originalKey: string): Promise<void> {
  const current = (await sdk.customerService.get(ticketId)).data;
  const association = current.attachments?.find(item => item.id.toLowerCase() === attachmentId.toLowerCase());
  if (association === undefined) throw new Error("The authorized ticket projection does not expose this attachment.");
  await sdk.customerService.detachDocument(ticketId, {
    expected_version: current.version, attachment_id: association.id,
  }, { idempotencyKey: originalKey });
}

/** Use the original customer comment already recorded by the owner; the owner validates its cycle and occurrence time. */
export async function releaseCustomerWaiting(sdk: Factuarea, ticketId: ServiceTicketId, pipelineId: ServiceTicketId,
  stageId: ServiceTicketId, customerMessageId: ServiceTicketId, originalKey: string, signal?: AbortSignal): Promise<void> {
  const current = (await sdk.customerService.get(ticketId, { signal })).data;
  await sdk.customerService.moveToStage(ticketId, {
    expected_version: current.version, pipeline_id: pipelineId, stage_id: stageId,
    waiting_reason: null, customer_message_id: customerMessageId,
  }, { idempotencyKey: originalKey, signal });
}

/** Invoke only after an explicit caller decision; no catch handler replays automatically. */
export async function recoverOriginalTicketIntent(sdk: Factuarea, error: unknown, signal?: AbortSignal): Promise<void> {
  if (!(error instanceof CustomerServiceWriteUnconfirmedError)) throw error;
  const receipt = await sdk.customerService.recover(error.intent, { signal });
  console.log(receipt.data.id, receipt.data.version, receipt.requestId);
}

// UUID validation is local. No request runs merely by importing this example.
export const exampleTicketId = serviceTicketId("019cf42b-5b00-7000-8000-000000000001");
