/**
 * @factuarea/sdk — Official TypeScript SDK for the Factuarea API.
 *
 * Public surface (protected by SemVer). The generated layer (`./generated`)
 * is an implementation detail; only the symbols re-exported here are stable.
 */

export { Factuarea } from "./client.js";
export { ServiceLevelResource } from "./crm/service-level.js";
export { ServiceLevelUnconfirmedError } from "./crm/service-level-errors.js";
export type {
  ConfigureServiceSlaRequest,
  PauseServiceSlaRequest,
  ResumeServiceSlaRequest,
  ServiceCalendar,
  ServiceCalendarData,
  ServiceCalendarException,
  ServiceCalendarList,
  ServiceCalendarMinuteWindow,
  ServiceCalendarWindow,
  ServiceLevelPageQuery,
  ServiceLevelResponse,
  ServiceLevelWriteConfig,
  ServiceLevelWriteOperation,
  ServiceLevelWriteResult,
  ServiceSlaClockName,
  ServiceSlaClockState,
  ServiceSlaClockTarget,
  ServiceSlaConfiguration,
  ServiceSlaCycle,
  ServiceSlaHistory,
  ServiceSlaMessage,
  ServiceSlaPause,
  ServiceSlaProjectedClock,
  ServiceSlaStatus,
  ServiceSlaStoredClock,
  ServiceSlaTargets,
  UpdateServiceCalendarRequest,
} from "./crm/service-level-types.js";

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

// Tasks and projects: resources and request bodies.
export type {
  AddTaskCommentV1Request,
  AddTaskExternalLinkV1Request,
  AgendaItem,
  AgendaList,
  AssignTaskLabelV1Request,
  AssignTaskV1Request,
  BulkChangeTaskStatusV1Request,
  BulkDeleteTasksV1Request,
  BulkUpdateTasksV1Request,
  ChangeTaskStatusV1Request,
  CreateProjectColumnV1Request,
  CreateProjectV1Request,
  CreateTaskCustomFieldV1Request,
  CreateTaskLabelV1Request,
  CreateTaskRelationV1Request,
  CreateTaskUploadLinkV1Request,
  CreateTaskV1Request,
  DuplicateTaskV1Request,
  EditTaskCommentV1Request,
  FindProjectByKeyV1Request,
  FindTaskByKeyV1Request,
  ImportProjectTasksV1Request,
  InvoiceTaskTimeV1Request,
  LinkTaskToEntityV1Request,
  LinkedTask,
  LinkedTaskList,
  LogTaskTimeV1Request,
  MoveTaskOnBoardV1Request,
  MoveTaskToProjectV1Request,
  Notification,
  NotificationCounts,
  NotificationList,
  PreviewTaskTimeInvoiceV1Request,
  Project,
  ProjectColumn,
  ProjectColumnList,
  ProjectCustomField,
  ProjectCustomFieldList,
  ProjectList,
  ProjectTasksExport,
  ProjectTasksImport,
  ProjectTimeSummary,
  ReorderProjectColumnsV1Request,
  SetTaskCustomFieldValueV1Request,
  Task,
  TaskActivity,
  TaskActivityList,
  TaskAttachment,
  TaskAttachmentList,
  TaskBulkResult,
  TaskComment,
  TaskCommentList,
  TaskCustomFieldValue,
  TaskEntityLink,
  TaskEntityLinkList,
  TaskExternalLink,
  TaskExternalLinkList,
  TaskLabel,
  TaskLabelAssignment,
  TaskLabelList,
  TaskList,
  TaskRelation,
  TaskRelationList,
  TaskTimeEntry,
  TaskTimeEntryList,
  TaskTimeInvoice,
  TaskTimeInvoicePreview,
  TaskUploadLink,
  UpdateProjectColumnV1Request,
  UpdateProjectV1Request,
  UpdateTaskCustomFieldV1Request,
  UpdateTaskLabelV1Request,
  UpdateTaskTimeEntryV1Request,
  UpdateTaskV1Request,
  UploadTaskAttachmentV1Request,
  User,
  UserList,
} from "./generated/types.gen.js";
