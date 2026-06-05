// AUTO-GENERATED. Do not edit by hand. Regenerate with `npm run generate:resources`.

import type { HttpClient } from "../core/http-client.js";
import { AccountResource } from "./account.js";
import { ClientsResource } from "./clients.js";
import { DeliveryNotesResource } from "./deliveryNotes.js";
import { EventCatalogResource } from "./eventCatalog.js";
import { EventsResource } from "./events.js";
import { InvoicesResource } from "./invoices.js";
import { ProductsResource } from "./products.js";
import { ProformasResource } from "./proformas.js";
import { PurchaseInvoicesResource } from "./purchaseInvoices.js";
import { QuotesResource } from "./quotes.js";
import { RecurringInvoicesResource } from "./recurringInvoices.js";
import { SeriesResource } from "./series.js";
import { SuppliersResource } from "./suppliers.js";
import { TaxReportsResource } from "./taxReports.js";
import { TaxesResource } from "./taxes.js";
import { VerifactuResource } from "./verifactu.js";
import { WebhookEndpointsResource } from "./webhookEndpoints.js";

export { AccountResource } from "./account.js";
export { ClientsResource } from "./clients.js";
export { DeliveryNotesResource } from "./deliveryNotes.js";
export { EventCatalogResource } from "./eventCatalog.js";
export { EventsResource } from "./events.js";
export { InvoicesResource } from "./invoices.js";
export { ProductsResource } from "./products.js";
export { ProformasResource } from "./proformas.js";
export { PurchaseInvoicesResource } from "./purchaseInvoices.js";
export { QuotesResource } from "./quotes.js";
export { RecurringInvoicesResource } from "./recurringInvoices.js";
export { SeriesResource } from "./series.js";
export { SuppliersResource } from "./suppliers.js";
export { TaxReportsResource } from "./taxReports.js";
export { TaxesResource } from "./taxes.js";
export { VerifactuResource } from "./verifactu.js";
export { WebhookEndpointsResource } from "./webhookEndpoints.js";

export interface ResourceNamespaces {
  account: AccountResource;
  clients: ClientsResource;
  deliveryNotes: DeliveryNotesResource;
  eventCatalog: EventCatalogResource;
  events: EventsResource;
  invoices: InvoicesResource;
  products: ProductsResource;
  proformas: ProformasResource;
  purchaseInvoices: PurchaseInvoicesResource;
  quotes: QuotesResource;
  recurringInvoices: RecurringInvoicesResource;
  series: SeriesResource;
  suppliers: SuppliersResource;
  taxReports: TaxReportsResource;
  taxes: TaxesResource;
  verifactu: VerifactuResource;
  webhookEndpoints: WebhookEndpointsResource;
}

export function createResources(client: HttpClient): ResourceNamespaces {
  return {
    account: new AccountResource(client),
    clients: new ClientsResource(client),
    deliveryNotes: new DeliveryNotesResource(client),
    eventCatalog: new EventCatalogResource(client),
    events: new EventsResource(client),
    invoices: new InvoicesResource(client),
    products: new ProductsResource(client),
    proformas: new ProformasResource(client),
    purchaseInvoices: new PurchaseInvoicesResource(client),
    quotes: new QuotesResource(client),
    recurringInvoices: new RecurringInvoicesResource(client),
    series: new SeriesResource(client),
    suppliers: new SuppliersResource(client),
    taxReports: new TaxReportsResource(client),
    taxes: new TaxesResource(client),
    verifactu: new VerifactuResource(client),
    webhookEndpoints: new WebhookEndpointsResource(client),
  };
}
