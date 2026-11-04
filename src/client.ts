import { HttpClient, type FactuareaConfig } from "./core/http-client.js";
import type { Environment } from "./core/auth.js";
import { Webhooks } from "./core/webhooks.js";
import { createResources, type ResourceNamespaces } from "./resources/index.js";
import type {
  AccountResource,
  CompaniesResource,
  AgendaResource,
  ContactsResource,
  DeliveryNotesResource,
  EventCatalogResource,
  EventsResource,
  FaceSubmissionsResource,
  InvoicesResource,
  ManagedAccountsResource,
  NotificationsResource,
  PdfArtifactsResource,
  PdfCommercialIdentitiesResource,
  PdfTemplatePreviewsResource,
  PdfTemplatesResource,
  ProductsResource,
  ProformasResource,
  ProjectsResource,
  PurchaseInvoicesResource,
  PurchaseScansResource,
  PurchaseScanEmailsResource,
  QuotesResource,
  RecurringInvoicesResource,
  SeriesResource,
  TaskLabelsResource,
  TaskTimersResource,
  TasksResource,
  TaxReportsResource,
  TaxesResource,
  TransportDocumentsResource,
  UsersResource,
  VerifactuResource,
  WebhookEndpointsResource,
} from "./resources/index.js";

/**
 * Every generated resource namespace is a property of the client, so an
 * operation the spec adds is reachable as soon as `npm run generate` emits it.
 */
export interface Factuarea extends Readonly<ResourceNamespaces> {}

/**
 * The Factuarea API client.
 *
 * ```ts
 * import { Factuarea } from "@factuarea/sdk";
 *
 * const factuarea = new Factuarea({ apiKey: process.env.FACTUAREA_API_KEY! });
 * const invoice = await factuarea.invoices.create({ ... });
 * ```
 *
 * The environment (sandbox vs production) is selected by the key prefix
 * (`fact_test_` / `fact_live_`); no environment flag is needed.
 */
export class Factuarea {
  /** The environment derived from the API key prefix. */
  readonly environment: Environment;

  declare readonly account: AccountResource;
  /** The account's NIF portfolio (`/v1/accounts/{account}/companies`). */
  declare readonly companies: CompaniesResource;
  /** Combined agenda of due tasks, document due dates, tax deadlines, absences and holidays. */
  declare readonly agenda: AgendaResource;
  /** Canonical identities with cumulative customer, supplier and lead roles. */
  declare readonly contacts: ContactsResource;
  declare readonly deliveryNotes: DeliveryNotesResource;
  declare readonly eventCatalog: EventCatalogResource;
  declare readonly events: EventsResource;
  /** FACe attempts: read one and ask for its cancellation (never retried automatically). */
  declare readonly faceSubmissions: FaceSubmissionsResource;
  declare readonly invoices: InvoicesResource;
  /** Accounts the caller provisions and manages, with their bulk import. */
  declare readonly managedAccounts: ManagedAccountsResource;
  /** Notifications of the API key owner. */
  declare readonly notifications: NotificationsResource;
  /** Prepare, read and download exact presentation PDFs. */
  declare readonly pdfArtifacts: PdfArtifactsResource;
  /** Commercial identities (shared brand) of the PDF library: revisions, impact, archive and restore. */
  declare readonly pdfCommercialIdentities: PdfCommercialIdentitiesResource;
  /** Previews of PDF templates and identities, from an example, a draft or an unsaved form. */
  declare readonly pdfTemplatePreviews: PdfTemplatePreviewsResource;
  /** PDF template library: revisions, defaults, per-contact preferences and private images. */
  declare readonly pdfTemplates: PdfTemplatesResource;
  declare readonly products: ProductsResource;
  declare readonly proformas: ProformasResource;
  /** Projects with their board columns, custom fields, time summary and time invoices. */
  declare readonly projects: ProjectsResource;
  declare readonly purchaseInvoices: PurchaseInvoicesResource;
  declare readonly purchaseScans: PurchaseScansResource;
  declare readonly purchaseScanEmails: PurchaseScanEmailsResource;
  declare readonly quotes: QuotesResource;
  declare readonly recurringInvoices: RecurringInvoicesResource;
  declare readonly series: SeriesResource;
  /** Company-wide task labels. */
  declare readonly taskLabels: TaskLabelsResource;
  /** The running task timer of the API key owner. */
  declare readonly taskTimers: TaskTimersResource;
  /** Tasks and their comments, relations, labels, attachments, time entries and links. */
  declare readonly tasks: TasksResource;
  declare readonly taxReports: TaxReportsResource;
  declare readonly taxes: TaxesResource;
  /** Transport control documents (DeCA) of Spanish road freight. */
  declare readonly transportDocuments: TransportDocumentsResource;
  /** Members of the company that can be assigned to tasks. */
  declare readonly users: UsersResource;
  declare readonly verifactu: VerifactuResource;
  declare readonly webhookEndpoints: WebhookEndpointsResource;

  /** Webhook signature verification (stateless). */
  readonly webhooks: Webhooks;

  /** The underlying HTTP client (advanced / escape hatch). */
  readonly http: HttpClient;

  constructor(config: FactuareaConfig) {
    this.http = new HttpClient(config);
    this.environment = this.http.environment;
    this.webhooks = new Webhooks();

    Object.assign(this, createResources(this.http));
  }
}
