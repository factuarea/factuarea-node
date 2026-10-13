// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


import type * as NativeApi from "../generated/types.gen.js";

export class KnowledgeArticlesResource extends BaseResource {
  /** Versions knowledge articles */
  async crmGetKnowledgeArticleVersions(article: string, config?: RequestConfig): Promise<NativeApi.CrmGetKnowledgeArticleVersionsResponse> {
    const path = this.buildPath("/crm/knowledge/articles/{article}/versions", { "article": article });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmGetKnowledgeArticleVersionsResponse>(path, undefined, config);
  }

  /** List knowledge categories */
  async listKnowledgeCategories(config?: RequestConfig): Promise<NativeApi.ListKnowledgeCategoriesResponse> {
    const path = "/crm/knowledge/categories";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.ListKnowledgeCategoriesResponse>(path, undefined, config);
  }

  /** Recover the original create receipt */
  async crmRecoverKnowledgeArticleCreateReceipt(config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.CrmRecoverKnowledgeArticleCreateReceiptResponse> {
    const path = "/crm/knowledge/receipts/knowledge_articles.create";
    config = this._nativeConfig(config, true);
    return this._get<NativeApi.CrmRecoverKnowledgeArticleCreateReceiptResponse>(path, undefined, config);
  }

  /** Recover the original save receipt */
  async crmRecoverKnowledgeArticleSaveReceipt(config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.CrmRecoverKnowledgeArticleSaveReceiptResponse> {
    const path = "/crm/knowledge/receipts/knowledge_articles.save";
    config = this._nativeConfig(config, true);
    return this._get<NativeApi.CrmRecoverKnowledgeArticleSaveReceiptResponse>(path, undefined, config);
  }

  /** Recover the original submit receipt */
  async crmRecoverKnowledgeArticleSubmitReceipt(config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.CrmRecoverKnowledgeArticleSubmitReceiptResponse> {
    const path = "/crm/knowledge/receipts/knowledge_articles.submit";
    config = this._nativeConfig(config, true);
    return this._get<NativeApi.CrmRecoverKnowledgeArticleSubmitReceiptResponse>(path, undefined, config);
  }

  /** Recover the original approve receipt */
  async crmRecoverKnowledgeArticleApproveReceipt(config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.CrmRecoverKnowledgeArticleApproveReceiptResponse> {
    const path = "/crm/knowledge/receipts/knowledge_articles.approve";
    config = this._nativeConfig(config, true);
    return this._get<NativeApi.CrmRecoverKnowledgeArticleApproveReceiptResponse>(path, undefined, config);
  }

  /** Recover the original publish receipt */
  async crmRecoverKnowledgeArticlePublishReceipt(config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.CrmRecoverKnowledgeArticlePublishReceiptResponse> {
    const path = "/crm/knowledge/receipts/knowledge_articles.publish";
    config = this._nativeConfig(config, true);
    return this._get<NativeApi.CrmRecoverKnowledgeArticlePublishReceiptResponse>(path, undefined, config);
  }

  /** Recover the original unpublish receipt */
  async crmRecoverKnowledgeArticleUnpublishReceipt(config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.CrmRecoverKnowledgeArticleUnpublishReceiptResponse> {
    const path = "/crm/knowledge/receipts/knowledge_articles.unpublish";
    config = this._nativeConfig(config, true);
    return this._get<NativeApi.CrmRecoverKnowledgeArticleUnpublishReceiptResponse>(path, undefined, config);
  }

  /** Recover the original archive receipt */
  async crmRecoverKnowledgeArticleArchiveReceipt(config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.CrmRecoverKnowledgeArticleArchiveReceiptResponse> {
    const path = "/crm/knowledge/receipts/knowledge_articles.archive";
    config = this._nativeConfig(config, true);
    return this._get<NativeApi.CrmRecoverKnowledgeArticleArchiveReceiptResponse>(path, undefined, config);
  }

  /** Recover the original link receipt */
  async crmRecoverKnowledgeArticleLinkReceipt(config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.CrmRecoverKnowledgeArticleLinkReceiptResponse> {
    const path = "/crm/knowledge/receipts/knowledge_articles.link";
    config = this._nativeConfig(config, true);
    return this._get<NativeApi.CrmRecoverKnowledgeArticleLinkReceiptResponse>(path, undefined, config);
  }

  /** Recover the original category receipt */
  async recoverKnowledgeCategoryReceipt(config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.RecoverKnowledgeCategoryReceiptResponse> {
    const path = "/crm/knowledge/categories/receipts/category-save";
    config = this._nativeConfig(config, true);
    return this._get<NativeApi.RecoverKnowledgeCategoryReceiptResponse>(path, undefined, config);
  }

  /** Save a knowledge category */
  async saveKnowledgeCategory(body: NativeApi.SaveKnowledgeCategoryData["body"], config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.SaveKnowledgeCategoryResponse> {
    const path = "/crm/knowledge/categories/save";
    config = this._nativeConfig(config, true);
    return this._sendNative<NativeApi.SaveKnowledgeCategoryResponse>("POST", path, body, config);
  }

  /** Search knowledge articles */
  async crmSearchKnowledgeArticles(params?: NativeApi.CrmSearchKnowledgeArticlesData["query"], config?: RequestConfig): Promise<NativeApi.CrmSearchKnowledgeArticlesResponse> {
    const path = "/crm/knowledge/articles";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmSearchKnowledgeArticlesResponse>(path, params, config);
  }

  /** Create knowledge articles */
  async crmCreateKnowledgeArticle(body: NativeApi.CrmCreateKnowledgeArticleData["body"], config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.CrmCreateKnowledgeArticleResponse> {
    const path = "/crm/knowledge/articles";
    config = this._nativeConfig(config, true);
    return this._sendNative<NativeApi.CrmCreateKnowledgeArticleResponse>("POST", path, body, config);
  }

  /** Show knowledge articles */
  async crmGetKnowledgeArticle(article: string, config?: RequestConfig): Promise<NativeApi.CrmGetKnowledgeArticleResponse> {
    const path = this.buildPath("/crm/knowledge/articles/{article}", { "article": article });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmGetKnowledgeArticleResponse>(path, undefined, config);
  }

  /** Save knowledge articles */
  async crmSaveKnowledgeArticle(article: string, body: NativeApi.CrmSaveKnowledgeArticleData["body"], config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.CrmSaveKnowledgeArticleResponse> {
    const path = this.buildPath("/crm/knowledge/articles/{article}", { "article": article });
    config = this._nativeConfig(config, true);
    return this._sendNative<NativeApi.CrmSaveKnowledgeArticleResponse>("PUT", path, body, config);
  }

  /** Suggest knowledge articles */
  async suggestServiceArticles(ticket: string, params: NativeApi.SuggestServiceArticlesData["query"], config?: RequestConfig): Promise<NativeApi.SuggestServiceArticlesResponse> {
    const path = this.buildPath("/crm/knowledge/tickets/{ticket}/suggestions", { "ticket": ticket });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.SuggestServiceArticlesResponse>(path, params, config);
  }

  /** Submit knowledge articles */
  async crmSubmitKnowledgeArticle(article: string, body: NativeApi.CrmSubmitKnowledgeArticleData["body"], config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.CrmSubmitKnowledgeArticleResponse> {
    const path = this.buildPath("/crm/knowledge/articles/{article}/submit", { "article": article });
    config = this._nativeConfig(config, true);
    return this._sendNative<NativeApi.CrmSubmitKnowledgeArticleResponse>("POST", path, body, config);
  }

  /** Approve knowledge articles */
  async crmApproveKnowledgeArticle(article: string, body: NativeApi.CrmApproveKnowledgeArticleData["body"], config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.CrmApproveKnowledgeArticleResponse> {
    const path = this.buildPath("/crm/knowledge/articles/{article}/approve", { "article": article });
    config = this._nativeConfig(config, true);
    return this._sendNative<NativeApi.CrmApproveKnowledgeArticleResponse>("POST", path, body, config);
  }

  /** Publish knowledge articles */
  async crmPublishKnowledgeArticle(article: string, body: NativeApi.CrmPublishKnowledgeArticleData["body"], config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.CrmPublishKnowledgeArticleResponse> {
    const path = this.buildPath("/crm/knowledge/articles/{article}/publish", { "article": article });
    config = this._nativeConfig(config, true);
    return this._sendNative<NativeApi.CrmPublishKnowledgeArticleResponse>("POST", path, body, config);
  }

  /** Unpublish knowledge articles */
  async crmUnpublishKnowledgeArticle(article: string, body: NativeApi.CrmUnpublishKnowledgeArticleData["body"], config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.CrmUnpublishKnowledgeArticleResponse> {
    const path = this.buildPath("/crm/knowledge/articles/{article}/unpublish", { "article": article });
    config = this._nativeConfig(config, true);
    return this._sendNative<NativeApi.CrmUnpublishKnowledgeArticleResponse>("POST", path, body, config);
  }

  /** Archive knowledge articles */
  async crmArchiveKnowledgeArticle(article: string, body: NativeApi.CrmArchiveKnowledgeArticleData["body"], config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.CrmArchiveKnowledgeArticleResponse> {
    const path = this.buildPath("/crm/knowledge/articles/{article}/archive", { "article": article });
    config = this._nativeConfig(config, true);
    return this._sendNative<NativeApi.CrmArchiveKnowledgeArticleResponse>("POST", path, body, config);
  }

  /** Link knowledge articles */
  async crmLinkKnowledgeArticle(article: string, body: NativeApi.CrmLinkKnowledgeArticleData["body"], config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.CrmLinkKnowledgeArticleResponse> {
    const path = this.buildPath("/crm/knowledge/articles/{article}/link", { "article": article });
    config = this._nativeConfig(config, true);
    return this._sendNative<NativeApi.CrmLinkKnowledgeArticleResponse>("POST", path, body, config);
  }
}
