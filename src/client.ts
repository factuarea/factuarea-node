import { HttpClient, type FactuareaConfig } from "./core/http-client.js";
import type { Environment } from "./core/auth.js";
import { Webhooks } from "./core/webhooks.js";
import { createResources } from "./resources/index.js";
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

  readonly account: AccountResource;
  /** The account's NIF portfolio (`/v1/accounts/{account}/companies`). */
  readonly companies: CompaniesResource;
  /** Combined agenda of due tasks, document due dates, tax deadlines, absences and holidays. */
  readonly agenda: AgendaResource;
  /** Canonical identities with cumulative customer, supplier and lead roles. */
  readonly contacts: ContactsResource;
  readonly deliveryNotes: DeliveryNotesResource;
  readonly eventCatalog: EventCatalogResource;
  readonly events: EventsResource;
  /** FACe attempts: read one and ask for its cancellation (never retried automatically). */
  readonly faceSubmissions: FaceSubmissionsResource;
  readonly invoices: InvoicesResource;
  /** Accounts the caller provisions and manages, with their bulk import. */
  readonly managedAccounts: ManagedAccountsResource;
  /** Notifications of the API key owner. */
  readonly notifications: NotificationsResource;
  /** Prepare, read and download exact presentation PDFs. */
  readonly pdfArtifacts: PdfArtifactsResource;
  /** Commercial identities (shared brand) of the PDF library: revisions, impact, archive and restore. */
  readonly pdfCommercialIdentities: PdfCommercialIdentitiesResource;
  /** Previews of PDF templates and identities, from an example, a draft or an unsaved form. */
  readonly pdfTemplatePreviews: PdfTemplatePreviewsResource;
  /** PDF template library: revisions, defaults, per-contact preferences and private images. */
  readonly pdfTemplates: PdfTemplatesResource;
  readonly products: ProductsResource;
  readonly proformas: ProformasResource;
  /** Projects with their board columns, custom fields, time summary and time invoices. */
  readonly projects: ProjectsResource;
  readonly purchaseInvoices: PurchaseInvoicesResource;
  readonly purchaseScans: PurchaseScansResource;
  readonly purchaseScanEmails: PurchaseScanEmailsResource;
  readonly quotes: QuotesResource;
  readonly recurringInvoices: RecurringInvoicesResource;
  readonly series: SeriesResource;
  /** Company-wide task labels. */
  readonly taskLabels: TaskLabelsResource;
  /** The running task timer of the API key owner. */
  readonly taskTimers: TaskTimersResource;
  /** Tasks and their comments, relations, labels, attachments, time entries and links. */
  readonly tasks: TasksResource;
  readonly taxReports: TaxReportsResource;
  readonly taxes: TaxesResource;
  /** Transport control documents (DeCA) of Spanish road freight. */
  readonly transportDocuments: TransportDocumentsResource;
  /** Members of the company that can be assigned to tasks. */
  readonly users: UsersResource;
  readonly verifactu: VerifactuResource;
  readonly webhookEndpoints: WebhookEndpointsResource;

  /** Webhook signature verification (stateless). */
  readonly webhooks: Webhooks;

  /** The underlying HTTP client (advanced / escape hatch). */
  readonly http: HttpClient;

  constructor(config: FactuareaConfig) {
    this.http = new HttpClient(config);
    this.environment = this.http.environment;
    this.webhooks = new Webhooks();

    const resources = createResources(this.http);
    this.account = resources.account;
    this.companies = resources.companies;
    this.agenda = resources.agenda;
    this.contacts = resources.contacts;
    this.deliveryNotes = resources.deliveryNotes;
    this.eventCatalog = resources.eventCatalog;
    this.events = resources.events;
    this.faceSubmissions = resources.faceSubmissions;
    this.invoices = resources.invoices;
    this.managedAccounts = resources.managedAccounts;
    this.notifications = resources.notifications;
    this.pdfArtifacts = resources.pdfArtifacts;
    this.pdfCommercialIdentities = resources.pdfCommercialIdentities;
    this.pdfTemplatePreviews = resources.pdfTemplatePreviews;
    this.pdfTemplates = resources.pdfTemplates;
    this.products = resources.products;
    this.proformas = resources.proformas;
    this.projects = resources.projects;
    this.purchaseInvoices = resources.purchaseInvoices;
    this.purchaseScans = resources.purchaseScans;
    this.purchaseScanEmails = resources.purchaseScanEmails;
    this.quotes = resources.quotes;
    this.recurringInvoices = resources.recurringInvoices;
    this.series = resources.series;
    this.taskLabels = resources.taskLabels;
    this.taskTimers = resources.taskTimers;
    this.tasks = resources.tasks;
    this.taxReports = resources.taxReports;
    this.taxes = resources.taxes;
    this.transportDocuments = resources.transportDocuments;
    this.users = resources.users;
    this.verifactu = resources.verifactu;
    this.webhookEndpoints = resources.webhookEndpoints;
  }
}
