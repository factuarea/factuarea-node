# Changelog

All notable changes to `@factuarea/sdk` are documented here. This project
adheres to [Semantic Versioning](https://semver.org/) (with `0.x` allowing
breaking changes in minor releases until the API GA). From the next release on,
entries are managed by [Changesets](https://github.com/changesets/changesets).

## 0.1.0

Initial release.

### Added

- TypeScript SDK covering all **234** v1 operations across **17** resources
  (`account`, `clients`, `suppliers`, `products`, `invoices`, `quotes`,
  `proformas`, `deliveryNotes`, `purchaseInvoices`, `recurringInvoices`,
  `series`, `taxes`, `taxReports`, `verifactu`, `events`, `eventCatalog`,
  `webhookEndpoints`).
- Hand-written runtime core: `fetch`-based `HttpClient`, automatic retries
  (429/5xx, `Retry-After`, exponential backoff with full jitter), automatic
  `Idempotency-Key` on POST (reused across retries), cursor auto-pagination
  (`Page` async iterator), a typed error hierarchy mapped from the API error
  envelope, HMAC-SHA256 webhook verification with timestamp tolerance and
  rotation grace window, and binary/PDF downloads.
- Auth by API-key prefix (`fact_test_` / `fact_live_` → sandbox / production),
  with a pluggable internal auth strategy for future OAuth without a breaking
  change.
- Dual ESM + CommonJS build with full type declarations; zero runtime
  dependencies; runs on Node 20+, Deno, Bun and Cloudflare Workers.
- Pinned **`Factuarea-Version: 2026-06-04`** sent on every request (spec frozen
  in P0 at private commit `e822661bc`). See
  [`docs/VERSIONING.md`](./docs/VERSIONING.md).
- Informative `User-Agent` (`factuarea-node/<ver> node/<ver>`) with no telemetry
  and no API key.
