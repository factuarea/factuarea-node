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
const { data: contact } = (await factuarea.contacts.create({
  name: "Cliente Demo SL",
  kind: "company",
  tax_id: "B12345674",
  roles: ["customer"],
})) as { data: BusinessContact };

// Create an invoice. Single-resource calls (create/show/update) return the API
// envelope `{ data, ... }`; read `.data` to get the resource. Operation
// results are typed `unknown` in 0.x, so cast to the shape you expect.
const created = (await factuarea.invoices.create({
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
for await (const inv of await factuarea.invoices.list({ status: "paid" })) {
  console.log((inv as { id: string }).id);
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

Use `factuarea.contacts` for customer, supplier and lead identities. A contact can hold multiple roles, so creating a supplier relationship does not require duplicating an existing customer's identity. Sales documents still name their reference `client_id`, and purchases use `supplier_id`; both accept the canonical contact UUID with the corresponding active role.

Operations follow the [SDK method-naming contract](https://docs.factuarea.com). Other resources include `account`, `products`, `invoices`, `quotes`, `proformas`, `deliveryNotes`, `purchaseInvoices`, `recurringInvoices`, `series`, `taxes`, `taxReports`, `verifactu`, `events`, `eventCatalog` and `webhookEndpoints`. Nested groups are available too, such as `factuarea.products.gallery.upload(...)`.

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

### Compatibility resources

`clients` and `suppliers` remain available for integrations using the published legacy routes and their role-specific analytics. They are deprecated for identity management: use `contacts` for new CRUD, searches and examples. Compatibility IDs may differ from the canonical contact UUID; do not join the two namespaces by assuming UUID equality.

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

- [`create-contact.ts`](./examples/create-contact.ts) — one identity with customer and supplier roles
- [`create-invoice.ts`](./examples/create-invoice.ts) — create a contact and use its UUID in a sales document
- [`list-invoices.ts`](./examples/list-invoices.ts)
- [`download-pdf.ts`](./examples/download-pdf.ts)
- [`verify-webhook.ts`](./examples/verify-webhook.ts)

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
