import { HttpClient, type FactuareaConfig } from "./core/http-client.js";
import type { Environment } from "./core/auth.js";
import { Webhooks } from "./core/webhooks.js";
import { createResources } from "./resources/index.js";
import type {
  AccountResource,
  ClientsResource,
  DeliveryNotesResource,
  EventCatalogResource,
  EventsResource,
  InvoicesResource,
  ProductsResource,
  ProformasResource,
  PurchaseInvoicesResource,
  QuotesResource,
  RecurringInvoicesResource,
  SeriesResource,
  SuppliersResource,
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

  readonly account: AccountResource;
  readonly clients: ClientsResource;
  readonly deliveryNotes: DeliveryNotesResource;
  readonly eventCatalog: EventCatalogResource;
  readonly events: EventsResource;
  readonly invoices: InvoicesResource;
  readonly products: ProductsResource;
  readonly proformas: ProformasResource;
  readonly purchaseInvoices: PurchaseInvoicesResource;
  readonly quotes: QuotesResource;
  readonly recurringInvoices: RecurringInvoicesResource;
  readonly series: SeriesResource;
  readonly suppliers: SuppliersResource;
  readonly taxReports: TaxReportsResource;
  readonly taxes: TaxesResource;
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
    this.clients = resources.clients;
    this.deliveryNotes = resources.deliveryNotes;
    this.eventCatalog = resources.eventCatalog;
    this.events = resources.events;
    this.invoices = resources.invoices;
    this.products = resources.products;
    this.proformas = resources.proformas;
    this.purchaseInvoices = resources.purchaseInvoices;
    this.quotes = resources.quotes;
    this.recurringInvoices = resources.recurringInvoices;
    this.series = resources.series;
    this.suppliers = resources.suppliers;
    this.taxReports = resources.taxReports;
    this.taxes = resources.taxes;
    this.verifactu = resources.verifactu;
    this.webhookEndpoints = resources.webhookEndpoints;
  }
}
