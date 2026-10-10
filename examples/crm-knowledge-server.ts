import { Factuarea, CrmUnconfirmedWriteError, type KnowledgeArticleSaveRequest } from "../src/index.js";

/** Server-side host persists the reviewed intent and original key before dispatch. */
export async function saveReviewedKnowledgeRevision(
  client: Factuarea,
  originalBody: KnowledgeArticleSaveRequest,
  articleId: string,
  originalKey: string,
  persistOriginalIntent: (record: { articleId: string; body: KnowledgeArticleSaveRequest; idempotencyKey: string }) => Promise<void>,
) {
  await persistOriginalIntent({ articleId, body: originalBody, idempotencyKey: originalKey });
  try {
    return await client.crm.knowledgeArticles.save(articleId, originalBody, {
      idempotencyKey: originalKey,
      humanConfirmed: true,
    });
  } catch (error) {
    if (error instanceof CrmUnconfirmedWriteError) {
      // Host retains the pending intention. GET recovery checks fresh authority.
      // A failed/ambiguous recovery does not authorize another command or new key.
      return { state: error.state, operationId: error.operationId, idempotencyKey: error.idempotencyKey };
    }
    throw error;
  }
}

export async function recoverOriginalKnowledgeSave(client: Factuarea, persistedOriginalKey: string) {
  return client.crm.knowledgeArticles.receiptSave({ idempotencyKey: persistedOriginalKey });
}
