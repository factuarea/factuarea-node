# Factuarea Node.js / TypeScript SDK

[![npm](https://img.shields.io/npm/v/@factuarea/sdk.svg)](https://www.npmjs.com/package/@factuarea/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Spec Sync](https://github.com/factuarea/factuarea-node/actions/workflows/spec-sync.yml/badge.svg)](https://github.com/factuarea/factuarea-node/actions/workflows/spec-sync.yml)

The official TypeScript SDK for the [Factuarea API](https://docs.factuarea.com) — Spanish e‑invoicing, VeriFactu, quotes, delivery notes and more.

It wraps the v1 REST API, including canonical contacts, with automatic retries, automatic idempotency keys, transparent cursor auto‑pagination, a typed error hierarchy, typed webhook verification and binary (PDF) downloads. Ships as dual ESM + CommonJS with full type declarations.

> **Status:** `0.x` (pre‑GA). The public surface is stable and SemVer‑protected, but minor breaking changes may occur before `1.0.0` (which tracks the API's GA event).

## Installation

```bash
npm install @factuarea/sdk
```

Requires **Node 20 or newer**. The SDK is runtime‑agnostic (built on the Web `fetch` standard) and also runs on Deno, Bun and Cloudflare Workers.

## Quickstart

```ts
import { Factuarea, type BusinessContact } from "@factuarea/sdk";

const factuarea = new Factuarea({ apiKey: process.env.FACTUAREA_API_KEY! });

// Company axis: every company resource hangs off `/v1/companies/{company}/…`,
// so the company id is the FIRST argument of the call. It is the `id` that
// `factuarea.account.show()` returns in `data.scope[].id` — never the tax ID.
const company = process.env.FACTUAREA_COMPANY_ID!;

const { data: contact } = (await factuarea.contacts.create(company, {
  name: "Cliente Demo SL",
  kind: "company",
  tax_id: "B12345674",
  roles: ["customer"],
})) as { data: BusinessContact };

// Create an invoice. Single-resource calls (create/show/update) return the API
// envelope `{ data, ... }`; read `.data` to get the resource. Operation
// results are typed `unknown` in 0.x, so cast to the shape you expect.
const created = (await factuarea.invoices.create(company, {
  // client_id is the invoice field; its value is the canonical contact UUID.
  client_id: contact.id,
  series_id: "01931b3e-7c4a-7f2e-9a8b-000000000001",
  issued_on: "2026-06-05",
  due_on: "2026-07-05",
  lines: [
    // Pass `tax_rate` (a percentage) or `tax_rate_id` (a tax UUID).
    { description: "Consulting", quantity: 1, unit_price: 1000, tax_rate: 21 },
  ],
})) as { data: { id: string } };
const invoice = created.data;

// List with transparent auto-pagination (list yields the resources directly).
for await (const inv of await factuarea.invoices.list(company, { status: "paid" })) {
  console.log((inv as { id: string }).id);
}

// Download a PDF
const pdf = await factuarea.invoices.pdf(company, invoice.id);
await require("node:fs/promises").writeFile("invoice.pdf", pdf.toBuffer());
```

> **Server‑side only.** Your API key is a secret. Never ship it to a browser or a public client — use this SDK from your backend. For code that runs in a shopper's browser there is a separate entry point with a publishable credential: see [Browser SDK — the storefront](#browser-sdk--the-storefront-anonymous-shopper-lane).

## Authentication & environments

Pass your API key to the constructor. **The key prefix selects the environment** — there is no separate flag:

| Prefix        | Environment | Effects                                              |
| ------------- | ----------- | ---------------------------------------------------- |
| `fact_test_…` | Sandbox     | Isolated test company; no real VeriFactu/email/webhooks |
| `fact_live_…` | Production  | Real data and side effects                           |

```ts
const sandbox = new Factuarea({ apiKey: "fact_test_…" });
sandbox.environment; // "test"

const prod = new Factuarea({ apiKey: "fact_live_…" });
prod.environment;    // "live"
```

### Configuration

```ts
new Factuarea({
  apiKey: "fact_live_…",        // required
  baseUrl: "https://api.factuarea.com/v1", // override for self-hosted/staging
  timeout: 60_000,              // per-request timeout in ms (default 60s)
  maxRetries: 2,                // retry attempts after the first try (default 2)
  factuareaVersion: "2026-06-04", // pinned API version header (default: this release's)
  defaultHeaders: {},           // extra headers on every request
});
```

The SDK pins the [`Factuarea-Version`](https://docs.factuarea.com/guides/versioning) header to the API version this release was built against, so the API's behaviour stays stable until you upgrade the SDK.

## Resources

Use `factuarea.contacts` for customer, supplier and lead identities. A contact can hold multiple roles, so creating a supplier relationship does not require duplicating an existing customer's identity. Sales documents still name their reference `client_id`, and purchases use `supplier_id`; both accept the canonical contact UUID with the corresponding active role.

Every operation is reachable as `factuarea.<resource>.<method>()`, following the [SDK method-naming contract](https://docs.factuarea.com). The client exposes every namespace the resource layer builds (74 of them): `absenceBalances`, `absenceCalendar`, `absencePolicies`, `absenceRequests`, `absenceTypes`, `account`, `agenda`, `automations`, `carriers`, `companies`, `contacts`, `deliveryNotes`, `developers`, `emails`, `employeeBatches`, `employeeInvitations`, `employeeSeatOfferRedemptions`, `employeeSeats`, `employees`, `eventCatalog`, `events`, `faceSubmissions`, `gestoria`, `gestoriaSeatOfferRedemptions`, `goodsReceipts`, `holidays`, `integrations`, `invoices`, `managedAccounts`, `monthlyTimeRecordCloses`, `notifications`, `paymentMethods`, `payouts`, `payrollExportFormats`, `presence`, `priceLists`, `products`, `proformas`, `projects`, `purchaseInvoices`, `purchaseOrders`, `purchaseReorderSuggestions`, `purchaseScanEmails`, `purchaseScans`, `quotes`, `recurringInvoices`, `returns`, `salesOrders`, `series`, `shopify`, `stockAvailability`, `stockReservations`, `stockTransfers`, `storefront`, `storefrontKeys`, `stores`, `stripeAutoinvoicing`, `taskLabels`, `taskTimers`, `tasks`, `taxCatalog`, `taxReports`, `taxes`, `timeBalances`, `timeCorrections`, `timeEntries`, `timeTrackingSettings`, `transportDocuments`, `users`, `verifactu`, `warehouses`, `webhookEndpoints`, `woocommerce`, `workSchedules`.

Nested groups are available too, such as `factuarea.products.gallery.upload(...)`, `factuarea.salesOrders.lines.create(...)` or `factuarea.storefront.products.variants.list(...)`.

### Contacts

| Task | Method |
| --- | --- |
| Create, list, search, retrieve, update | `create`, `list`, `search`, `show`, `update` |
| Discover filter options | `options` |
| Assign/remove a role, change its status | `assignContactRole`, `removeContactRole`, `changeContactRoleStatus` |
| Customer/supplier preferences | `updateCustomerProfile`, `updateSupplierProfile` |
| Bank accounts | `updateBankAccounts` |
| Archive/restore the identity | `delete`, `restore` |
| Bulk archive/role status | `bulkArchive`, `bulkChangeContactRoleStatus` |
| Preview/import a CSV | `previewImport`, `import` |

```ts
// Reuse the same contact when it also becomes a supplier.
await factuarea.contacts.assignContactRole(contact.id, "supplier");
await factuarea.contacts.updateSupplierProfile(contact.id, { payment_terms_days: 30 });

// This only deactivates its customer role; its supplier role remains unchanged.
await factuarea.contacts.changeContactRoleStatus(contact.id, "customer", { status: "inactive" });

// delete archives the whole identity and preserves history. The API rejects
// archiving when blocking documents/contracts exist. Restore is reversible.
await factuarea.contacts.delete(contact.id);
await factuarea.contacts.restore(contact.id);
```

Filter `list` and `search` with `roles`, `tags`, `search` or `is_archived`. Arrays are serialized as `roles[]` / `tags[]` and kept across cursor pages. Use `roles: ["customer"]`, `roles: ["supplier"]`, `roles: ["lead"]` or `roles: ["none"]` for unassigned contacts. The public [Contact migration guide](https://docs.factuarea.com/guides/contact-migration) covers request fields, scopes and historical IDs.

`BusinessContact`, the contact list/import response types and contact request types are exported from `@factuarea/sdk`. The resource wrappers return `unknown` in 0.x, so use the exported types for request validation and response casts.

### Account model

Every credential belongs to one **account**, and the account owns its tax IDs (NIF). The account axis hangs off `/v1/accounts/{account}/…`, so the account `id` is the FIRST argument of the call, exactly like the company on the company axis. It is the `id` that `factuarea.account.show()` returns in `data.account.id`. The NIF portfolio, the managed accounts, the NIF transfer and the account webhooks all live on this axis.

```ts
const account = process.env.FACTUAREA_ACCOUNT_ID!;

// The account's NIF portfolio: list, add and read invoicing statistics per NIF.
const nifs = await factuarea.companies.list(account, { limit: 50 });
await factuarea.companies.create(account, { name: "Mi Empresa SL", tax_id: "B12345674" });
await factuarea.companies.stats(account);

// Managed accounts: provision one for a client, then read it back.
await factuarea.managedAccounts.create({
  external_ref: "client-0042",
  plan: "emprendedor",
  tax_id: "B12345674",
  legal_name: "Cliente Demo SL",
});
for await (const managed of await factuarea.managedAccounts.list()) {
  console.log((managed as { id: string }).id);
}
await factuarea.managedAccounts.show(managedAccountId);
```

**Bulk import.** Importing accounts takes `multipart/form-data`, so the methods receive a standard `FormData` and the SDK sends it as is (it never adds a JSON content type). `accounts_file` is required, `customers_file` is optional, and the options travel as `options[...]` form fields. Preview first, then apply:

```ts
import { readFile } from "node:fs/promises";

const form = new FormData();
form.append("accounts_file", new Blob([await readFile("accounts.csv")], { type: "text/csv" }), "accounts.csv");
form.append("customers_file", new Blob([await readFile("customers.csv")], { type: "text/csv" }), "customers.csv");
form.append("options[send_email]", "false");

await factuarea.managedAccounts.imports.template(); // the CSV template
await factuarea.managedAccounts.imports.preview(form); // writes nothing
await factuarea.managedAccounts.imports.create(form);  // applies it
```

**NIF transfer.** The issuing account creates the transfer for one NIF, the receiving account accepts it with the secret it was given, and the issuer can revoke it while it is pending:

```ts
await factuarea.account.nifTransfers.create(account, { company_id: companyId, recipient_account_id: recipientAccountId });
await factuarea.account.nifTransfers.list(account);
await factuarea.account.nifTransfers.accept(recipientAccount, { secret: transferSecret });
await factuarea.account.nifTransfers.revoke(account, transferId);
```

**Account webhooks and request logs.** An account endpoint receives events of your own NIFs (`own`), of the accounts you manage (`managed`) or both (`all`). It needs a live key (`fact_live_…`):

```ts
await factuarea.account.webhooks.create(account, {
  url: "https://example.com/webhooks/factuarea",
  enabled_events: ["account.nif_added", "invoice.paid"],
  account_relationship: "all",
});
const endpoints = await factuarea.account.webhooks.list(account);
await factuarea.account.webhooks.rotateSecret(account, webhookId);
await factuarea.account.webhooks.deliveries.list(account, webhookId);
await factuarea.account.requestLogs.list(account);
```

The envelope of an account event carries `account`, `account_relationship` (`own` or `managed`) and `company_id` (`null` for an event of the account itself). Verify it with the same `verify` call as any other webhook, with the endpoint's own secret; the signature scheme is identical (see [Webhooks](#webhooks)).

### Migrating from `clients` and `suppliers`

The legacy `/v1/clients` and `/v1/suppliers` routes were retired from the public API on 2026-09-16, so the `clients` and `suppliers` resources were removed from the SDK in 0.6.0. Every operation has a `contacts` equivalent: filter by `roles: ["customer"]` or `roles: ["supplier"]` where the legacy resource implied the role, and use `contacts.stats`, `contacts.activities`, `contacts.bulkCreate`, `contacts.bulkDelete`, `contacts.import`, `contacts.verifyCensus`, `contacts.findByTaxId` and `contacts.findByExternalId` for the role-specific helpers. Legacy client/supplier IDs are not contact UUIDs; resolve them through the [Contact migration guide](https://docs.factuarea.com/guides/contact-migration) instead of assuming equality.

## Purchase scans

`purchaseScans` supports `create` (multipart batch), `list`, `show`, `stats`, `review`, `convert`, `duplicateResolution`, `retry`, `archive`, `restore` and `source` (binary). `purchaseScanEmails.list` returns inbound messages and attachment outcomes. Read operations require `purchase_invoices:read`, mutations `purchase_invoices:write`, and archive `purchase_invoices:delete`; the company's scanner/OCR entitlement must also be active.

Uploads take one multipart part per file, every part named `files[]` (the API accepts PDF, JPEG or PNG originals), with limits of 20 files per batch, 20.0 MiB per file and 100.0 MiB per batch. `create`, `retry`, `duplicateResolution`, `convert`, `archive` and `restore` require `Idempotency-Key`; the SDK generates one automatically when you do not pass `idempotencyKey` yourself. `review` does not require it.

```ts
import { readFile, writeFile } from "node:fs/promises";
import type { PurchaseScanUploadBatch, PurchaseScan } from "@factuarea/sdk";

const form = new FormData();
form.append("files[]", new Blob([await readFile("invoice.pdf")], {
  type: "application/pdf",
}), "invoice.pdf");
const { data: batch } = await factuarea.purchaseScans.create(form, {
  idempotencyKey: "purchase-upload-batch-001",
}) as { data: PurchaseScanUploadBatch };
console.log(batch.accepted, batch.rejected);

// Processing is asynchronous. Read the current state before editing.
const id = batch.accepted[0].id;
const { data: scan } = await factuarea.purchaseScans.show(id) as { data: PurchaseScan };
console.log(scan.status, scan.available_actions, scan.extraction, scan.issues);
const original = await factuarea.purchaseScans.source(id);
await writeFile("original.pdf", original.toBuffer());
```

An upload accepts up to 20 PDF/JPEG/PNG originals (20 MiB each, 100 MiB total). A partial rejection still returns `202`; if all files are rejected, `ValidationError.data` retains the batch result. Preserve the same idempotency key and file order when retrying that batch.

Use `purchaseInvoices.expenseCategories()` to discover company category IDs for the review field `expense_category`; category names are not accepted as identifiers.

Only edit when `can_save_review` is true. `review(id, { expected_version, fields, lines })` accepts partial field patches (`{ value: "..." }`), explicit `null` to clear, and line operations `update`, `add` (without `line_id`) or `remove`. Omitted values remain unchanged. Use the new returned version for the next mutation; a stale version returns `409`. On conversion failure, `ValidationError.fields` exposes the review fields that need correction.

`convert(id, { expected_version }, { idempotencyKey })` creates a **draft expense**, including its original attachment; it does not issue an invoice or mark the expense paid. Follow `purchase_invoice_id` to the created expense. EUR and resolved fiscal data are required. `retry` also starts a received document when automatic scanning is disabled. Respect `available_actions`; duplicate override and supplier creation are reserved for an interactive administrator. The public duplicate resolutions are `link_existing` (with `purchase_invoice_id`) and `archive`.

## Tasks and projects

`projects` and `tasks` cover the task workspace: projects with their board columns and custom fields, tasks with comments, relations, labels, attachments, time entries and links to documents or contacts, plus bulk changes. `taskLabels` manages the shared label catalog, `taskTimers` reads and stops the running timer, `users` lists the members you can assign, `notifications` reads the API key owner's notifications and `agenda` returns a combined calendar of due tasks, document due dates, tax deadlines and absences. Keys need the `projects:*`, `tasks:*`, `users:read` and `notifications:*` scopes. Writes send an `Idempotency-Key` like the rest of the SDK, and every list is a `Page`.

```ts
import type { Project, Task, TaskTimeEntry } from "@factuarea/sdk";

// Create a project and a task in it. `entity_link` links the task to an invoice,
// quote, contact… in the same call; `custom_fields` maps a field id to its value.
const { data: project } = (await factuarea.projects.create({ name: "Website", key: "WEB" })) as { data: Project };
const { data: task } = (await factuarea.tasks.create(
  {
    project_id: project.id,
    title: "Chase the unpaid invoice",
    priority: "high",
    due_on: "2026-10-15",
    entity_link: { type: "invoice", id: invoice.id },
  },
  { idempotencyKey: "chase-invoice-4711" },
)) as { data: Task };

// Log time on it: a closed period, or a live timer that you stop later.
await factuarea.tasks.timeEntries.create(task.id, {
  started_at: "2026-10-01T09:00:00+02:00",
  ended_at: "2026-10-01T10:30:00+02:00",
  description: "Called the customer",
  billable: true,
});
await factuarea.tasks.timer.start(task.id);
const { data: entry } = (await factuarea.taskTimers.stop()) as { data: TaskTimeEntry };
console.log(entry.duration_seconds);
```

`tasks.search` filters by `q`, `project_id`, `status`, `column_id`, `priority`, `assignee_id` (a member id or `me`), `label_id`, `due_before`, `due_after`, `completed` and `sort`, and follows the cursor across pages. `taskTimers.current()` resolves to `{ data: null }` when no timer is running. Deleting a board column that still holds tasks needs a destination: `projects.columns.delete(project.id, column.id, { move_to_column_id })`, otherwise the API answers `409 column_has_tasks`. `agenda.list({ from, to, sources: "tasks,invoice_due" })` takes its layers as a comma-separated string.

## Transport control documents (DeCA)

`transportDocuments` covers the electronic control document of Spanish public road freight (DeCA): drafts, optionally pre-filled from delivery notes, issuing, modifying during the service, closing and reopening, cancelling or marking it as superseded by the carrier's own document, and the copy for the driver. It is not a delivery note, an invoice or a VeriFactu record. Like every company resource, each call takes the company id as its first argument. Keys need the `transport_documents:read`, `:write`, `:transition` and `:delete` scopes, and `pdfs:read` for the PDF. Issuing, modifying, cancelling, superseding and sending are irreversible: pin an `idempotencyKey` so a retry never repeats them. See the [guide](https://docs.factuarea.com/guides/transport-documents).

```ts
import type { TransportDocument } from "@factuarea/sdk";

// A draft with one shipment per delivery note, then issue it: the next number of
// the DC series, version 1 of the PDF and a permanent public URL behind the QR.
const { data: draft } = (await factuarea.transportDocuments.create(
  company,
  {
    company_role: "shipper",
    carrier: { contact_id: carrier.id },
    delivery_note_ids: [deliveryNote.id],
    vehicle: { tractor_plate: "1234BCD" },
  },
  { idempotencyKey: "deca-draft-2026-118" },
)) as { data: TransportDocument };
await factuarea.transportDocuments.issue(company, draft.id, { idempotencyKey: "deca-issue-2026-118" });

// The copy for the driver: the PDF of the current version and the QR image.
const pdf = await factuarea.transportDocuments.pdf(company, draft.id);
const qr = await factuarea.transportDocuments.qr(company, draft.id, { format: "png" });
```

`transportDocuments.index` filters by `status`, `transport_date[gte]`, `transport_date[lte]`, `company_role`, `carrier_tax_id`, `delivery_note_id`, `q` and `sort`, and follows the cursor across pages. `pdf(company, id, { version })` returns the stored PDF of any version byte for byte, and `qr` returns SVG unless you ask for `format: "png"`. An issue that lacks data answers `422 transport_document_not_issuable` with the missing items in `error.details.missing`.

## Pagination

List methods return a `Page`, which is itself an async iterable. Iterate everything, or walk page by page:

```ts
const page = await factuarea.contacts.list({ roles: ["customer"], limit: 50 });

// (a) iterate all items across all pages
for await (const contact of page) {
  console.log((contact as BusinessContact).id);
}

// (b) page-by-page
page.data;       // items on this page
page.hasMore;    // boolean
page.nextCursor; // opaque cursor or null
const next = await page.getNextPage(); // Page | null

// (c) collect everything into an array
const all = await page.toArray();
```

The SDK manages cursors for you using the API's `next_cursor` / `has_more`.

## Automatic retries

Transient failures — `429` (rate limit), `5xx` and network errors — are retried automatically with exponential backoff and full jitter, honouring the `Retry-After` header. Deterministic client errors (e.g. `422` validation) are **never** retried and surface immediately. Tune with `maxRetries` (globally or per request).

## Idempotency

Every `POST` automatically gets an `Idempotency-Key` (UUID), so a retried request never double‑creates a resource. The same key is reused across the retries of one logical call. Override per request:

```ts
await factuarea.invoices.create(company, body, { idempotencyKey: "order-4711" });
```

## Typed errors

Errors map the API's error envelope to a typed hierarchy. Every error exposes `.code`, `.type`, `.requestId` and `.status`.

```ts
import {
  FactuareaError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServerError,
  ConnectionError,
} from "@factuarea/sdk";

try {
  await factuarea.invoices.create(company, body);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(error.fields);     // { tax_id: ["NIF inválido"], … }
  } else if (error instanceof RateLimitError) {
    console.error(error.retryAfter); // seconds to wait
  } else if (error instanceof FactuareaError) {
    console.error(error.code, error.requestId);
  }
}
```

Your API key is **never** included in any error message, stack or property — only the `request_id` (safe to log and share with support).

## Webhooks

Verify the signature of an incoming webhook and get the typed event back. Pass the **raw request body** (a string), not a re‑serialized object:

```ts
import { Factuarea, WebhookSignatureError, SIGNATURE_HEADER } from "@factuarea/sdk";

const factuarea = new Factuarea({ apiKey: process.env.FACTUAREA_API_KEY! });

// Express, with express.raw({ type: "application/json" }) on the route:
app.post("/webhooks/factuarea", (req, res) => {
  try {
    const event = factuarea.webhooks.verify(
      req.body.toString("utf8"),
      req.headers[SIGNATURE_HEADER.toLowerCase()] as string,
      process.env.FACTUAREA_WEBHOOK_SECRET!,
    );
    // event is typed by its `type`
    if (event.type === "invoice.paid") { /* … */ }
    res.sendStatus(200);
  } catch (e) {
    if (e instanceof WebhookSignatureError) return res.sendStatus(400);
    throw e;
  }
});
```

Verification uses HMAC‑SHA256 with a constant‑time comparison and a configurable timestamp tolerance (default 5 minutes) to reject replays. It also accepts both signatures during a secret‑rotation grace window.

## Binary downloads

PDF and other binary endpoints return a `BinaryResponse` (not JSON):

```ts
const pdf = await factuarea.invoices.pdf(company, invoiceId);
pdf.contentType;     // "application/pdf"
pdf.toBuffer();      // Node Buffer
pdf.toBlob();        // Blob (type preserved)
pdf.body;            // raw ArrayBuffer
```

## Browser SDK — the storefront (anonymous shopper lane)

`@factuarea/sdk/storefront` is a **separate entry point** for the code that runs in
a shopper's browser: a custom shop front end that lists the catalogue, resolves
prices, checks availability, builds a cart, creates the order, gets the payment
link, confirms the charge and follows the shipment. It is bundled for the
browser, pulls no Node builtin and does not drag the server client in.

```ts
import { FactuareaStorefront } from "@factuarea/sdk/storefront";

const shop = new FactuareaStorefront({
  publishableKey: "sf_pk_…", // publishable: it ships inside your bundle
  company: "01931b3e-…",     // the shop's public company id
});

const page = await shop.products.list({ limit: 24, in_stock: true });
const price = await shop.prices.resolve({ product_id: page.data[0].id, quantity: 1 });
const availability = await shop.availability.show({ product_id: page.data[0].id });
```

The company is fixed when the client is built, not passed on every call. The
namespaces are `products` (with `images`, `options`, `presentations`,
`variants`), `categories`, `catalogSelections`, `prices`, `availability`,
`sessions` and `orders` (with `buyerIdentity`) — 23 methods, one per operation
of the shopper lane, and nothing else.

### The publishable credential is not a secret

| | Publishable storefront key | Integrator API key |
| --- | --- | --- |
| Prefix | `sf_pk_…` | `fact_live_…` / `fact_test_…` |
| Where it may live | in the JavaScript a shopper downloads | on your server, only |
| What it reaches | the shopper lane of one shop | the whole API of your company |
| What contains it | the origins the merchant declares | an IP allowlist, kept server-side |
| Rotation | immediate, **no grace window** | 24-hour dual-secret window |

A publishable key is *meant* to be public: anyone can read it in your bundle or
in the network tab, and that is fine. What contains it is not secrecy, it is
**scope**:

- It only reaches the shopper lane. It cannot read your invoices, your clients,
  your costs or your margins — the catalogue it serves is an *inclusion* list,
  so a new field of an article never leaks into a shop by omission.
- It only works from the **origins the merchant declares on it**. The browser
  sends the `Origin` header, the page cannot forge it, and a request without one
  is rejected too: the origin list is the whole access control of this lane, so
  it fails closed. Copying your key into somebody else's site does not work.
- It is **revocable** at any moment from the merchant's storefront keys screen
  (or through the `storefront_keys` operations of the server SDK), and revoking
  takes effect on the next request.

Requests are emitted with `credentials: "omit"`: no cookie and no browser
credential of the shopper ever travels to Factuarea.

### An integrator key never goes into a web page

An `fact_live_…` / `fact_test_…` key is a secret bound to your company, with
access to the whole API. Shipping one to a browser publishes it. The browser
client therefore **refuses to be constructed** with one:

```ts
new FactuareaStorefront({ publishableKey: "fact_live_…", company: "…" });
// StorefrontCredentialError: an integrator API key was passed to the browser
// client. A server credential must NEVER travel to a browser … (code:
// "integrator_credential_in_browser")
```

The rejection happens in the constructor, with **no request emitted**, so the
mistake shows up on the developer's screen instead of surfacing as a 401 on the
first shopper's first request — by which time the key is already on a CDN.

### If a publishable key is compromised

Compromised here means misused, not merely public: someone republished it on a
site you do not control, or it is being hammered. The rotation has **no grace
window by design** — the old secret stops working the moment you revoke it, and
a lane whose credential lives in every visitor's browser cannot afford a window
where a leaked key keeps working. So the order matters:

1. **Issue a second key** for the same shop, scoped to the same origins.
2. **Publish your site with the new key** and wait until the deploy is live
   everywhere (CDN included).
3. **Revoke the first key.** From that request on, the old one is rejected.

Doing it in the other order takes the shop down between the revocation and the
deploy. If you must cut access *now* and accept the downtime, revoke first and
publish after — but that is an explicit choice, not the default.

Narrowing the declared origins is the cheaper containment when the key is being
used from a site that is not yours: it does not touch the key your own site
carries.

### Errors, idempotency and retries

Errors map the public error envelope to a typed hierarchy (`StorefrontError` and
its subclasses). Branch on `.code`, never on `.message` — the message is human
text served in Spanish and free to change, while `.code` and `.subcode` are
stable across locales and API versions. Every error exposes `.code`, `.status`
and `.requestId`.

```ts
import { StorefrontError, StorefrontValidationError } from "@factuarea/sdk/storefront";

try {
  await shop.orders.confirmPayment(orderId, { payment_reference: "pi_…" });
} catch (error) {
  if (error instanceof StorefrontValidationError) {
    console.error(error.code, error.fields); // e.g. "storefront_session_expired"
  } else if (error instanceof StorefrontError) {
    console.error(error.code, error.requestId);
  }
}
```

Every mutating call carries an `Idempotency-Key`, minted with the browser's Web
Crypto API and **reused across the SDK's own retries**, so a flaky phone network
cannot create two orders or confirm a charge twice. Pass `config.idempotencyKey`
when your page has a natural key that must survive a reload. In an *insecure*
context (a shop served over plain `http`) `crypto.randomUUID()` is unavailable
and the SDK falls back to `crypto.getRandomValues()`; only in a runtime with no
Web Crypto at all does it fall back to a non-cryptographic source — an
idempotency key is not a secret and grants nothing, it only has to be unique.

`429` and `5xx` are retried with exponential backoff honouring `Retry-After`;
`422` and the other deterministic answers are not.

## Examples

Runnable examples live in [`examples/`](./examples):

- [`create-contact.ts`](./examples/create-contact.ts) — one identity with customer and supplier roles
- [`create-invoice.ts`](./examples/create-invoice.ts) — create a contact and use its UUID in a sales document
- [`create-task.ts`](./examples/create-task.ts) — create a project if it is missing and add a task to it
- [`list-invoices.ts`](./examples/list-invoices.ts)
- [`download-pdf.ts`](./examples/download-pdf.ts)
- [`verify-webhook.ts`](./examples/verify-webhook.ts)
- [`storefront-catalog.ts`](./examples/storefront-catalog.ts) — browser SDK: catalogue, price, availability
- [`storefront-checkout.ts`](./examples/storefront-checkout.ts) — browser SDK: cart → order → payment → tracking

## Supported runtimes & deprecation policy

| Runtime              | Status                         |
| -------------------- | ------------------------------ |
| Node 20              | ✅ supported (CI)              |
| Node 22 (LTS)        | ✅ supported (CI, recommended) |
| Node 24              | ✅ supported (CI)              |
| Deno / Bun / Workers | ✅ works (Web `fetch` based)   |

Minimum **Node 20**. The full support matrix, the Node-version policy and the
deprecation / breaking-change policy live in [`SUPPORT.md`](./SUPPORT.md).

## Versioning

This SDK follows SemVer and is aligned with the API's date-based
`Factuarea-Version`. Each release pins one `Factuarea-Version` and sends it on
every request, so the API's behaviour is stable until you upgrade the SDK —
upgrading is how you adopt a newer API version. The pinned value per release is
recorded in the [CHANGELOG](./CHANGELOG.md), and the full policy + version
mapping is in [`docs/VERSIONING.md`](./docs/VERSIONING.md). While in `0.x`, minor
versions may include breaking changes.

## Releases & spec sync

Releases are automated with [Changesets](https://github.com/changesets/changesets)
and published to npm via [Trusted Publishing (OIDC)](https://docs.npmjs.com/trusted-publishers)
with build provenance — see [`docs/RELEASING.md`](./docs/RELEASING.md). The
generated layer is kept in sync with the public OpenAPI spec automatically — see
[`docs/SPEC_SYNC.md`](./docs/SPEC_SYNC.md).

The **Spec Sync** badge above is when that check last ran, not when the repo was
last committed to: a check that finds nothing to sync leaves no commit. Click it
for the date of the latest run.

## Contributing & spec

The typed surface in [`src/generated/`](./src/generated) is generated from the OpenAPI spec; the hand‑written runtime lives in [`src/core/`](./src/core). The pinned spec is committed at [`spec/openapi.json`](./spec/openapi.json) (frozen against the private spec at commit `e822661bc`). Do not edit `src/generated/` by hand — run `npm run generate`.

## License

[MIT](./LICENSE) © Factuarea
