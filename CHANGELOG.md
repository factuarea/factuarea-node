# Changelog

## 0.2.0

### Minor Changes

- [#2](https://github.com/factuarea/factuarea-node/pull/2) [`1dfbdd0`](https://github.com/factuarea/factuarea-node/commit/1dfbdd03224523b24ae84a174e7f775312a746b5) Thanks [@github-actions](https://github.com/apps/github-actions)! - Regenerate the SDK from the published OpenAPI spec: **+183 operations, −4 operations** (413 operations over 345 paths, up from 234 over 192).

  ### Removed — breaking

  Four operations were renamed on the API and are gone from the SDK. Each has a direct replacement:

  - `clients.bulkDeleteLegacy()` (`DELETE /clients/bulk`) → `clients.bulkDelete()` (`POST /clients/bulk-delete`). Bulk creation is now its own operation, `clients.bulkCreate()` (`POST /clients/bulk-create`).
  - `suppliers.bulkDeleteLegacy()` (`DELETE /suppliers/bulk`) → `suppliers.bulkDelete()` (`POST /suppliers/bulk-delete`). Bulk activation/deactivation is now `suppliers.bulkStatus()` (`POST /suppliers/bulk-status`).
  - `deliveryNotes.changeStatus()` (`POST /delivery_notes/{delivery_note}/change_status`) → the REST sub-resources `deliveryNotes.markDelivered()`, `deliveryNotes.cancel()` and `deliveryNotes.sign()`.
  - `purchaseInvoices.bySupplier(supplier)` (`GET /purchase_invoices/by-supplier/{supplier}`) → `purchaseInvoices.list({ supplier_id: supplier })`, which also accepts `supplier_id[in]` for several suppliers at once.

  While the SDK is in `0.x`, a breaking change ships as a `minor`; `1.0.0` is reserved for the API GA.

  ### Added

  27 new resources: `absenceBalances`, `absenceCalendar`, `absencePolicies`, `absenceRequests`, `absenceTypes`, `companies`, `developers`, `emails`, `employeeInvitations`, `employeeSeats`, `employees`, `faceSubmissions`, `gestoria`, `holidays`, `integrations`, `monthlyTimeRecordCloses`, `paymentMethods`, `payouts`, `payrollExportFormats`, `presence`, `stripeAutoinvoicing`, `taxCatalog`, `timeBalances`, `timeCorrections`, `timeEntries`, `timeTrackingSettings`, `workSchedules`.

  New operations on 14 existing resources: `invoices`, `account`, `clients`, `deliveryNotes`, `proformas`, `quotes`, `purchaseInvoices`, `products`, `suppliers`, `recurringInvoices`, `series`, `taxReports`, `webhookEndpoints`, `verifactu`.

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
