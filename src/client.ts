import { HttpClient, type FactuareaConfig } from "./core/http-client.js";
import type { Environment } from "./core/auth.js";
import { Webhooks } from "./core/webhooks.js";
import { ServiceLevelResource } from "./crm/service-level.js";
import { createResources } from "./resources/index.js";
import type {
  AccountResource,
  AgendaResource,
  ContactsResource,
  DeliveryNotesResource,
  EventCatalogResource,
  EventsResource,
  InvoicesResource,
  NotificationsResource,
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
  /** Combined agenda of due tasks, document due dates, tax deadlines, absences and holidays. */
  readonly agenda: AgendaResource;
  /** Canonical identities with cumulative customer, supplier and lead roles. */
  readonly contacts: ContactsResource;
  readonly deliveryNotes: DeliveryNotesResource;
  readonly eventCatalog: EventCatalogResource;
  readonly events: EventsResource;
  readonly invoices: InvoicesResource;
  /** Notifications of the API key owner. */
  readonly notifications: NotificationsResource;
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
  /** Native service calendars and ticket SLA status, history and writes. */
  readonly serviceLevel: ServiceLevelResource;
  /** Company-wide task labels. */
  readonly taskLabels: TaskLabelsResource;
  /** The running task timer of the API key owner. */
  readonly taskTimers: TaskTimersResource;
  /** Tasks and their comments, relations, labels, attachments, time entries and links. */
  readonly tasks: TasksResource;
  readonly taxReports: TaxReportsResource;
  readonly taxes: TaxesResource;
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
    this.serviceLevel = new ServiceLevelResource(this.http);

    const resources = createResources(this.http);
    this.account = resources.account;
    this.agenda = resources.agenda;
    this.contacts = resources.contacts;
    this.deliveryNotes = resources.deliveryNotes;
    this.eventCatalog = resources.eventCatalog;
    this.events = resources.events;
    this.invoices = resources.invoices;
    this.notifications = resources.notifications;
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
    this.users = resources.users;
    this.verifactu = resources.verifactu;
    this.webhookEndpoints = resources.webhookEndpoints;
  }
}
