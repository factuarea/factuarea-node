import type { KnowledgeArticle, KnowledgeCategorySaveIntent, PublicHelpCenterPublishIntent } from "../src/index.js";
import { Factuarea } from "../src/index.js";

/** Compile-only contracts; this function never dispatches native operations. */
export function crmKnowledgeTypeContracts(client: Factuarea): void {
  const config = { idempotencyKey: "persisted-original-key", humanConfirmed: true as const };
  const article: KnowledgeArticle = { id: "uuid", version: 7 };
  const category: KnowledgeCategorySaveIntent = { taxonomy_id: "uuid", expected_taxonomy_version: 2, expected_version: null, name: "Test", slug: "test", parent_id: null, visibility: "internal", status: "active" };
  const center: PublicHelpCenterPublishIntent = { confirmed: true, expected_version: 0, slug: "test", display_name: "Test", locale: "es", article_slugs: [] };
  void article;
  client.crm.knowledgeArticles.categorySave(category, config);
  client.crm.publicHelpCenters.publish(center, config);
  client.crm.knowledgeArticles.receiptSave({ idempotencyKey: config.idempotencyKey });
  client.crm.knowledgeArticles.suggest("uuid", { ticket_version: 5, locale: null });
  // @ts-expect-error receipt recovery requires a persisted original key
  client.crm.knowledgeArticles.receiptSave();
  // @ts-expect-error Knowledge writes require review and the original key
  client.crm.knowledgeArticles.archive("uuid", { expected_version: 7 }, { idempotencyKey: config.idempotencyKey });
  // @ts-expect-error category creation cannot supply an entity id
  client.crm.knowledgeArticles.categorySave({ ...category, id: "uuid" }, config);
  // @ts-expect-error category editing requires an id with the existing CAS
  client.crm.knowledgeArticles.categorySave({ ...category, expected_version: 2 }, config);
  // @ts-expect-error null parent is an explicit native field, not omission
  client.crm.knowledgeArticles.categorySave({ taxonomy_id: "uuid", expected_taxonomy_version: 2, expected_version: null, name: "Test", slug: "test", visibility: "internal", status: "active" }, config);
  // @ts-expect-error public-center creation requires CAS zero
  client.crm.publicHelpCenters.publish({ ...center, expected_version: 2 }, config);
  // @ts-expect-error publication confirmation must be literal true
  client.crm.publicHelpCenters.unpublish("uuid", { confirmed: false, expected_version: 4 }, config);
  // @ts-expect-error Knowledge intent is closed; tenant authority never comes from JSON
  client.crm.knowledgeArticles.archive("uuid", { expected_version: 7, company_id: "uuid" }, config);
  // @ts-expect-error editorial body is required when saving a full new revision
  client.crm.knowledgeArticles.save("uuid", { expected_version: 7, title: "Test", editorial_locale: "es", category_ids: [] }, config);
  // @ts-expect-error exact editorial request does not accept a null title
  client.crm.knowledgeArticles.save("uuid", { expected_version: 7, title: null, body: "Test", editorial_locale: "es", category_ids: [] }, config);
  // @ts-expect-error suggestions require the original ticket version
  client.crm.knowledgeArticles.suggest("uuid", { audience: "public" });
  // @ts-expect-error the administrative group has no anonymous public content endpoint
  client.crm.publicHelpCenters.search({});
}
