/**
 * @factuarea/sdk — Official TypeScript SDK for the Factuarea API.
 *
 * Public surface (protected by SemVer). The generated layer (`./generated`)
 * is an implementation detail; only the symbols re-exported here are stable.
 */

export { Factuarea } from "./client.js";

export type { FactuareaConfig } from "./core/http-client.js";
export type {
  ApiResponse,
  BinaryResponse,
  HttpMethod,
  RequestOptions,
} from "./core/http-client.js";

export type { RequestConfig } from "./core/resource.js";

export { Page } from "./core/pagination.js";
export type { PaginatedList, CursorParam } from "./core/pagination.js";

export type { Environment } from "./core/auth.js";

export { SDK_VERSION, DEFAULT_FACTUAREA_VERSION } from "./core/version.js";

// Error hierarchy
export {
  FactuareaError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServerError,
  ConnectionError,
  WebhookSignatureError,
} from "./core/errors.js";
export type { FactuareaErrorType, ErrorEnvelope } from "./core/errors.js";

// Webhooks
export { verifyWebhook, Webhooks, SIGNATURE_HEADER, DEFAULT_TOLERANCE_SECONDS } from "./core/webhooks.js";
export type { VerifyOptions } from "./core/webhooks.js";

// Resource classes (for typing references / advanced composition)
export type { ResourceNamespaces } from "./resources/index.js";

// Generated domain types. The full surface (1400+ types) lives in
// `./generated/types.gen`; re-export the namespace so consumers can pull any
// request/response shape they need:  `import type { Invoice } from "@factuarea/sdk"`.
export type {
  Account,
  BusinessContact,
  BusinessContactImportPreview,
  BusinessContactList,
  BusinessContactOptionsResource,
  BulkArchiveBusinessContactsV1Request,
  BulkChangeContactRoleStatusV1Request,
  ChangeContactRoleStatusV1Request,
  Client,
  ContactRoleV1Request,
  CreateBusinessContactV1Request,
  Event,
  EventData,
  Invoice,
  ImportBusinessContactsV1Request,
  PaginatedList as PaginatedListSchema,
  Product,
  PurchaseScan,
  PurchaseScanListItem,
  PurchaseScanExtractedField,
  PurchaseScanEmail,
  PurchaseScanStats,
  PurchaseScanUploadBatch,
  SavePurchaseScanReviewV1Request,
  PreviewBusinessContactImportV1Request,
  Proforma,
  Quote,
  Series,
  Tax,
  UpdateBusinessContactBankAccountsV1Request,
  UpdateBusinessContactV1Request,
  UpdateCustomerProfileV1Request,
  UpdateSupplierProfileV1Request,
  WebhookDelivery,
} from "./generated/types.gen.js";

// CRM Source surface. Availability and authority remain native API decisions.
export { CrmResource, CrmContactPeopleResource, CrmLeadsResource, CrmPipelinesResource, CrmKnowledgeArticlesResource, CrmPublicHelpCentersResource } from "./crm/resources.js";
export { CRM_OPERATIONS } from "./crm/operations.js";
export { CrmCursorPage, CrmNumberPage, CrmKnowledgePage } from "./crm/pagination.js";
export type { CrmNumberMeta, CrmKnowledgePageData } from "./crm/pagination.js";
export type { CrmRequestConfig, CrmConfirmedRequestConfig, CrmOriginalKeyRequestConfig, CrmConfirmedOriginalKeyRequestConfig } from "./crm/resource.js";
export type { KnowledgeCategorySaveIntent, PublicHelpCenterPublishIntent } from "./crm/intents.js";
export { CrmUnconfirmedWriteError } from "./crm/errors.js";
export type * from "./crm/generated/types.gen.js";

// Sequence v1 consumes explicit native routes and the configured SDK transport.
export { CrmSequencesResource, CrmSequencePage, CrmSequenceUnconfirmedWriteError, CrmSequenceControlUnconfirmedError, createCrmSequencesResource, decodeCrmSequenceOriginalWire } from "./resources/crm-sequences.js";
export type { CrmSequenceNativeTransport, CrmSequenceReadConfig, CrmSequenceOriginalReadConfig, CrmSequenceMutationConfig } from "./resources/crm-sequences.js";
export type * from "./crm/sequences-types.js";

// Booking administrative V1 uses its own original receipt protocol and required native routes.
export { CrmBookingsResource, CrmBookingPage, CrmBookingUnconfirmedWriteError, createCrmBookingsResource, decodeCrmBookingServiceIntent, decodeCrmBookingService, decodeCrmBookingServiceReceipt, decodeCrmBookingPage } from "./resources/crm-bookings/index.js";
export type { CrmBookingNativeTransport, CrmBookingReadConfig, CrmBookingOriginalConfig } from "./resources/crm-bookings/index.js";
export type * from "./resources/crm-bookings/types.js";

// Task time billing preserves native original receipts, Task ownership and monetary strings.
export { CrmTaskTimeBillingResource, CrmTaskTimePage, CrmTaskTimeUnconfirmedWriteError, createCrmTaskTimeBillingResource, decodeCrmTaskTimeIntent, decodeCrmTaskTimeTasks, decodeCrmTaskTimePage, decodeCrmTaskTimePreview, decodeCrmTaskTimeReceipt } from "./resources/crm-task-time-billing/index.js";
export type { CrmTaskTimeBillingNativeTransport, CrmTaskTimeReadConfig, CrmTaskTimeWriteConfig, CrmTaskTimeQueryPostConfig } from "./resources/crm-task-time-billing/index.js";
export type * from "./resources/crm-task-time-billing/types.js";

// Mailbox configuration writer recovery uses native crm:write, separate from public original reads.
export { CrmMailboxWritersResource, CrmMailboxUnconfirmedWriteError, createCrmMailboxWritersResource, decodeCrmMailboxWriteIntent, decodeCrmMailboxWriteReceipt } from "./resources/crm-mailbox-writers/index.js";
export type { CrmMailboxWriterNativeTransport, CrmMailboxWriterConfig } from "./resources/crm-mailbox-writers/index.js";
export type * from "./resources/crm-mailbox-writers/types.js";

// ServiceInsights readonly V1 preserves native predicate, decimal strings and current masks.
export { CrmServiceInsightsResource, CrmServiceInsightsDrillPage, createCrmServiceInsightsResource, decodeCrmServiceCsatMetric, decodeCrmServiceInsightMetrics, decodeCrmServiceInsightDrill } from "./resources/crm-service-insights/index.js";
export type { CrmServiceInsightsNativeTransport, CrmServiceInsightsConfig } from "./resources/crm-service-insights/index.js";
export type * from "./resources/crm-service-insights/types.js";

// VerticalPacks V1 keeps pure POST queries separate from exact original apply/undo confirmations.
export { CrmVerticalPacksResource, CrmVerticalPackUnconfirmedWriteError, createCrmVerticalPacksResource, decodeCrmVerticalPackIntent, decodeCrmVerticalPackCatalog, decodeCrmVerticalPackPlan, decodeCrmVerticalPackConflicts, decodeCrmVerticalPackReceipt } from "./resources/crm-vertical-packs/index.js";
export type { CrmVerticalPacksNativeTransport, CrmVerticalPacksConfig } from "./resources/crm-vertical-packs/index.js";
export type * from "./resources/crm-vertical-packs/types.js";

// ServiceMacro V1 keeps masked projections, original confirmation and readonly recovery distinct.
export { CrmServiceMacrosResource, CrmServiceMacroPage, CrmServiceMacroUsagePage, CrmServiceMacroUnconfirmedWriteError, createCrmServiceMacrosResource, decodeCrmServiceMacroIntent, decodeCrmServiceMacroList, decodeCrmServiceMacroUsage, decodeCrmServiceMacroOriginal, decodeCrmServiceMacroRender } from "./resources/crm-service-macros/index.js";
export type { CrmServiceMacrosNativeTransport, CrmServiceMacrosConfig } from "./resources/crm-service-macros/index.js";
export type * from "./resources/crm-service-macros/types.js";

// Conversation readonly V1 preserves original identity, cursor, delivery result and current masks.
export { CrmConversationsResource, CrmConversationInboxPage, CrmConversationThreadPage, createCrmConversationsResource, decodeCrmConversationInbox, decodeCrmConversationThread, encodeCrmConversationFilters } from "./resources/crm-conversations/index.js";
export type { CrmConversationsNativeTransport, CrmConversationsReadConfig } from "./resources/crm-conversations/index.js";
export type * from "./resources/crm-conversations/types.js";
