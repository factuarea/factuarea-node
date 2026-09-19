# Factuarea Node.js / TypeScript SDK

[![npm](https://img.shields.io/npm/v/@factuarea/sdk.svg)](https://www.npmjs.com/package/@factuarea/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Spec Sync](https://github.com/factuarea/factuarea-node/actions/workflows/spec-sync.yml/badge.svg)](https://github.com/factuarea/factuarea-node/actions/workflows/spec-sync.yml)

The official TypeScript SDK for the [Factuarea API](https://docs.factuarea.com) — Spanish e‑invoicing, VeriFactu, quotes, delivery notes and more.

It wraps the full v1 REST API (654 operations across 62 resources, measured 2026-09-18) with a premium runtime: automatic retries, automatic idempotency keys, transparent cursor auto‑pagination, a typed error hierarchy, typed webhook verification and binary (PDF) downloads. Ships as dual ESM + CommonJS with full type declarations.

> **Status:** `0.x` (pre‑GA). The public surface is stable and SemVer‑protected, but minor breaking changes may occur before `1.0.0` (which tracks the API's GA event).

## Installation

```bash
npm install @factuarea/sdk
```

Requires **Node 20 or newer**. The SDK is runtime‑agnostic (built on the Web `fetch` standard) and also runs on Deno, Bun and Cloudflare Workers.

## Quickstart

```ts
import { Factuarea } from "@factuarea/sdk";

const factuarea = new Factuarea({ apiKey: process.env.FACTUAREA_API_KEY! });

// Create an invoice. Single-resource calls (create/show/update) return the API
// envelope `{ data, ... }`; read `.data` to get the resource. Operation
// results are typed `unknown` in 0.x, so cast to the shape you expect.
const created = (await factuarea.invoices.create({
  client_id: "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a9b",
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
for await (const inv of await factuarea.invoices.list({ status: "paid" })) {
  console.log((inv as { id: string }).id);
}

// Download a PDF
const pdf = await factuarea.invoices.pdf(invoice.id);
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

Every operation is reachable as `factuarea.<resource>.<method>()`, following the [SDK method‑naming contract](https://docs.factuarea.com). The client exposes **every** namespace the resource layer builds — 62 of them, measured 2026-09-18:

`absenceBalances`, `absenceCalendar`, `absencePolicies`, `absenceRequests`, `absenceTypes`, `account`, `automations`, `carriers`, `clients`, `companies`, `contacts`, `deliveryNotes`, `developers`, `emails`, `employeeInvitations`, `employeeSeats`, `employees`, `eventCatalog`, `events`, `faceSubmissions`, `gestoria`, `goodsReceipts`, `holidays`, `integrations`, `invoices`, `monthlyTimeRecordCloses`, `paymentMethods`, `payouts`, `payrollExportFormats`, `presence`, `priceLists`, `products`, `proformas`, `purchaseInvoices`, `purchaseOrders`, `purchaseReorderSuggestions`, `quotes`, `recurringInvoices`, `returns`, `salesOrders`, `series`, `shopify`, `stockAvailability`, `stockReservations`, `stockTransfers`, `storefront`, `storefrontKeys`, `stores`, `stripeAutoinvoicing`, `suppliers`, `taxCatalog`, `taxReports`, `taxes`, `timeBalances`, `timeCorrections`, `timeEntries`, `timeTrackingSettings`, `verifactu`, `warehouses`, `webhookEndpoints`, `woocommerce`, `workSchedules`.

Nested groups too (e.g. `factuarea.products.gallery.upload(...)`, `factuarea.deliveryNotes.publicLink.update(...)`, `factuarea.salesOrders.lines.create(...)`).

## Pagination

List methods return a `Page`, which is itself an async iterable. Iterate everything, or walk page by page:

```ts
const page = await factuarea.clients.list({ limit: 50 });

// (a) iterate all items across all pages
for await (const client of page) {
  console.log(client.id);
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
await factuarea.invoices.create(body, { idempotencyKey: "order-4711" });
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
  await factuarea.invoices.create(body);
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
const pdf = await factuarea.invoices.pdf(invoiceId);
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

- [`create-invoice.ts`](./examples/create-invoice.ts)
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
