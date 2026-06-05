# Factuarea Node.js / TypeScript SDK

[![npm](https://img.shields.io/npm/v/@factuarea/sdk.svg)](https://www.npmjs.com/package/@factuarea/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

The official TypeScript SDK for the [Factuarea API](https://docs.factuarea.com) — Spanish e‑invoicing, VeriFactu, quotes, delivery notes and more.

It wraps the full v1 REST API (234 operations across 17 resources) with a premium runtime: automatic retries, automatic idempotency keys, transparent cursor auto‑pagination, a typed error hierarchy, typed webhook verification and binary (PDF) downloads. Ships as dual ESM + CommonJS with full type declarations.

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

// Create an invoice
const invoice = await factuarea.invoices.create({
  client_id: "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a9b",
  series_id: "01931b3e-7c4a-7f2e-9a8b-000000000001",
  issue_date: "2026-06-05",
  lines: [
    { description: "Consulting", quantity: 1, unit_price: 1000, taxes_id: "..." },
  ],
});

// List with transparent auto-pagination
for await (const inv of await factuarea.invoices.list({ status: "paid" })) {
  console.log(inv.id);
}

// Download a PDF
const pdf = await factuarea.invoices.pdf(invoice.id);
await require("node:fs/promises").writeFile("invoice.pdf", pdf.toBuffer());
```

> **Server‑side only.** Your API key is a secret. Never ship it to a browser or a public client — use this SDK from your backend.

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

Every operation is reachable as `factuarea.<resource>.<method>()`, following the [SDK method‑naming contract](https://docs.factuarea.com). Resources: `account`, `clients`, `suppliers`, `products`, `invoices`, `quotes`, `proformas`, `deliveryNotes`, `purchaseInvoices`, `recurringInvoices`, `series`, `taxes`, `taxReports`, `verifactu`, `events`, `eventCatalog`, `webhookEndpoints`. Nested groups too (e.g. `factuarea.products.gallery.upload(...)`, `factuarea.deliveryNotes.publicLink.update(...)`).

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

## Examples

Runnable examples live in [`examples/`](./examples):

- [`create-invoice.ts`](./examples/create-invoice.ts)
- [`list-invoices.ts`](./examples/list-invoices.ts)
- [`download-pdf.ts`](./examples/download-pdf.ts)
- [`verify-webhook.ts`](./examples/verify-webhook.ts)

## Supported runtimes

| Runtime              | Status                         |
| -------------------- | ------------------------------ |
| Node 20              | ✅ supported (CI)              |
| Node 22 (LTS)        | ✅ supported (CI, recommended) |
| Node 24              | ✅ supported (CI)              |
| Deno / Bun / Workers | ✅ works (Web `fetch` based)   |

## Versioning

This SDK follows SemVer. The pinned `Factuarea-Version` it sends is documented in the [CHANGELOG](./CHANGELOG.md); upgrading the SDK is how you adopt a newer API version. While in `0.x`, minor versions may include breaking changes.

## Contributing & spec

The typed surface in [`src/generated/`](./src/generated) is generated from the OpenAPI spec; the hand‑written runtime lives in [`src/core/`](./src/core). The pinned spec is committed at [`spec/openapi.json`](./spec/openapi.json) (frozen against the private spec at commit `e822661bc`). Do not edit `src/generated/` by hand — run `npm run generate`.

## License

[MIT](./LICENSE) © Factuarea
