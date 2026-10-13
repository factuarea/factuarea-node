import { HttpClient, type FactuareaConfig } from "./core/http-client.js";
import { CrmResource } from "./crm/resources.js";
import type { Environment } from "./core/auth.js";
import { Webhooks } from "./core/webhooks.js";
import { createResources } from "./resources/index.js";
import { createCrmSequencesResource, type CrmSequencesResource } from "./resources/crm-sequences.js";
import type { CrmSequenceV1Paths } from "./crm/sequences-types.js";
import { createCrmBookingsResource, type CrmBookingsResource, type CrmBookingV1Paths } from "./resources/crm-bookings/index.js";
import { createCrmTaskTimeBillingResource, type CrmTaskTimeBillingResource, type CrmTaskTimeBillingV1Paths } from "./resources/crm-task-time-billing/index.js";
import { createCrmMailboxWritersResource, type CrmMailboxWritersResource, type CrmMailboxWriterV1Paths } from "./resources/crm-mailbox-writers/index.js";
import { createCrmServiceInsightsResource, type CrmServiceInsightsResource, type CrmServiceInsightsV1Paths } from "./resources/crm-service-insights/index.js";
import { createCrmVerticalPacksResource, type CrmVerticalPacksResource, type CrmVerticalPacksV1Paths } from "./resources/crm-vertical-packs/index.js";
import { createCrmServiceMacrosResource, type CrmServiceMacrosResource, type CrmServiceMacrosV1Paths } from "./resources/crm-service-macros/index.js";
import { createCrmConversationsResource, type CrmConversationsResource, type CrmConversationV1Paths } from "./resources/crm-conversations/index.js";
import type {
  AccountResource,
  ContactsResource,
  DeliveryNotesResource,
  EventCatalogResource,
  EventsResource,
  InvoicesResource,
  ProductsResource,
  ProformasResource,
  PurchaseInvoicesResource,
  PurchaseScansResource,
  PurchaseScanEmailsResource,
  QuotesResource,
  RecurringInvoicesResource,
  SeriesResource,
  TaxReportsResource,
  TaxesResource,
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

  /** Source CRM operations; the API checks current availability and authority. */
  readonly crm: CrmResource;

  readonly account: AccountResource;
  /** Canonical identities with cumulative customer, supplier and lead roles. */
  readonly contacts: ContactsResource;
  readonly deliveryNotes: DeliveryNotesResource;
  readonly eventCatalog: EventCatalogResource;
  readonly events: EventsResource;
  readonly invoices: InvoicesResource;
  readonly products: ProductsResource;
  readonly proformas: ProformasResource;
  readonly purchaseInvoices: PurchaseInvoicesResource;
  readonly purchaseScans: PurchaseScansResource;
  readonly purchaseScanEmails: PurchaseScanEmailsResource;
  readonly quotes: QuotesResource;
  readonly recurringInvoices: RecurringInvoicesResource;
  readonly series: SeriesResource;
  readonly taxReports: TaxReportsResource;
  readonly taxes: TaxesResource;
  readonly verifactu: VerifactuResource;
  readonly webhookEndpoints: WebhookEndpointsResource;

  /** Webhook signature verification (stateless). */
  readonly webhooks: Webhooks;

  /** The underlying HTTP client (advanced / escape hatch). */
  readonly http: HttpClient;

  /** Compose Sequence with explicit native v1 route bindings and this client's auth/transport. */
  crmSequences(paths: CrmSequenceV1Paths): CrmSequencesResource {
    return createCrmSequencesResource(this.http, paths);
  }

  /** Compose Booking administration with explicit native V1 routes and this client's auth/transport. */
  crmBookings(paths: CrmBookingV1Paths): CrmBookingsResource {
    return createCrmBookingsResource(this.http, paths);
  }

  /** Compose native Task time billing with explicit V1 routes and this client's configured transport. */
  crmTaskTimeBilling(paths: CrmTaskTimeBillingV1Paths): CrmTaskTimeBillingResource {
    return createCrmTaskTimeBillingResource(this.http, paths);
  }

  /** Compose Mailbox writers with required native V1 routes and this configured HTTP client. */
  crmMailboxWriters(paths: CrmMailboxWriterV1Paths): CrmMailboxWritersResource {
    return createCrmMailboxWritersResource(this.http, paths);
  }

  /** Compose readonly ServiceInsights with required native V1 paths and configured auth/transport. */
  crmServiceInsights(paths: CrmServiceInsightsV1Paths): CrmServiceInsightsResource {
    return createCrmServiceInsightsResource(this.http, paths);
  }

  /** Compose native Conversation list/get with explicit V1 routes and this configured transport. */
  crmConversations(paths: CrmConversationV1Paths): CrmConversationsResource {
    return createCrmConversationsResource(this.http, paths);
  }

  /** Compose native VerticalPacks with explicit V1 routes and this configured HTTP client. */
  crmVerticalPacks(paths: CrmVerticalPacksV1Paths): CrmVerticalPacksResource {
    return createCrmVerticalPacksResource(this.http, paths);
  }

  /** Compose ServiceMacro with explicit native V1 bindings and this client's auth/transport. */
  crmServiceMacros(paths: CrmServiceMacrosV1Paths): CrmServiceMacrosResource {
    return createCrmServiceMacrosResource(this.http, paths);
  }

  constructor(config: FactuareaConfig) {
    this.http = new HttpClient(config);
    this.environment = this.http.environment;
    this.webhooks = new Webhooks();
    this.crm = new CrmResource(this.http);

    const resources = createResources(this.http);
    this.account = resources.account;
    this.contacts = resources.contacts;
    this.deliveryNotes = resources.deliveryNotes;
    this.eventCatalog = resources.eventCatalog;
    this.events = resources.events;
    this.invoices = resources.invoices;
    this.products = resources.products;
    this.proformas = resources.proformas;
    this.purchaseInvoices = resources.purchaseInvoices;
    this.purchaseScans = resources.purchaseScans;
    this.purchaseScanEmails = resources.purchaseScanEmails;
    this.quotes = resources.quotes;
    this.recurringInvoices = resources.recurringInvoices;
    this.series = resources.series;
    this.taxReports = resources.taxReports;
    this.taxes = resources.taxes;
    this.verifactu = resources.verifactu;
    this.webhookEndpoints = resources.webhookEndpoints;
  }
}
