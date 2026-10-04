# Changelog

## 0.9.0

### Minor Changes

- [#25](https://github.com/factuarea/factuarea-node/pull/25) [`8fab024`](https://github.com/factuarea/factuarea-node/commit/8fab0242d1628843a3de0ac1ccf04dc51a333475) Thanks [@Chelu97](https://github.com/Chelu97)! - Add `series.update(series, body?, config?)` (`PUT /v1/series/{series}`, scope `series:write`) and re-pin `spec/openapi.json` from the current public contract (571 operations: 1 added, none removed). `src/generated/` and `src/resources/` are regenerated.

  New in the client:

  - `series.update` edits a series with a partial body: `name`, `code`, `counter_reset` (`never`, `annual` or `monthly`), `number_format`, `initial_number`, `invoice_kind` and the deprecated `year_reset`. `document_type` is not editable. It answers the updated `Series`. The new type `UpdateSeriesRequest` is exported from `@factuarea/sdk`.
  - Each fiscal guard of the numbering arrives as `ValidationError` with `code` `business_rule_violation` and a `subcode`: `series_code_immutable_with_documents`, `series_format_immutable_with_documents`, `series_locked_by_verifactu`, `series_initial_number_creates_gap`, `series_invoice_kind_locked` and `series_default_kind_change`. Invalid values answer `parameter_invalid_value`.
  - Changing only `counter_reset` also emits the webhook `series.updated`. `PATCH` and `DELETE` on a series keep answering `405` `series_immutable`, now with `Allow: GET, PUT`; archive a series instead of deleting it.
  - `invoices.activities` publishes more `event_type` values with an exact `metadata` contract: the result of each AEAT submission (`verifactu.record_accepted`, `verifactu.record_rejected`, `verifactu.transmission_failed`, `verifactu.transmission_blocked`), `invoice.email_failed`, `invoice.public_link_viewed` and the payment events `payment.payment_created`, `payment.payment_reversed` and `payment.payment_updated`, whose `provider` is the gateway (`stripe`, `gocardless`, `monei`, `woocommerce` or `shopify`) or `null` for a manual payment.
  - `VeriFactuRecord` gains the required `aeat_warning_requires_subsanation` (`boolean | null`). Code that builds `VeriFactuRecord` objects by hand, such as test fixtures typed as `VeriFactuRecord`, must add it.

- [#25](https://github.com/factuarea/factuarea-node/pull/25) [`dab5844`](https://github.com/factuarea/factuarea-node/commit/dab5844f477fcaa82e0c5973140f67367a12a53f) Thanks [@Chelu97](https://github.com/Chelu97)! - Add unattended checkout (self-service kiosks and vending machines) and the VERI\*FACTU remission controls, and re-pin `spec/openapi.json` from the current public contract (570 operations: 6 added, none removed). `src/generated/` and `src/resources/` are regenerated.

  New in the client:

  - `invoices.create` issues a paid simplified invoice in one idempotent call. The request accepts `type` (`F1` or `F2`), `prices_include_tax`, `payment` (`method`, `paid_at`, `reference`), `operation_on` and the options `register_verifactu` and `wait_for_pdf`; `client_id` is optional, so an `F2` without it is an anonymous ticket. The response is the new `InvoiceWithCheckoutBlocks` type: the invoice plus `verifactu` (`status` `registered` or `failed`, `error_code`, `aeat_status`, `huella`, `qr_url`, `qr_png_base64`, `legend`, `csv`), `pdf` (`status`, signed `url`, `expires_at`) and `public_url`.
  - A late retry with the same `external_id` answers `200` with `Idempotent-Replayed: true` and the invoice already issued. `invoices.create` returns the same body for `201` and `200`; call `factuarea.http.request` when you need the status or the header. A different type or total answers `409` `idempotency_key_reused` with subcode `unattended_replay_mismatch`, and a request still in flight answers `409` `resource_locked`; both arrive as `ConflictError` with `code`, `subcode` and `param`.
  - `invoices.pdf` and `invoices.pdfLink` accept `format`: `a4` (default), `ticket_80` or `ticket_58`. `invoices.pdfLink(invoice, params?, config?)` keeps the previous `invoices.pdfLink(invoice, config?)` call working: a second argument made only of request-option keys (`headers`, `timeout`, `maxRetries`, `idempotencyKey`) is still read as the options, and any other object is the query.
  - `invoices.annul` accepts `revert_collections`, which reverts every live payment (reason `issued_in_error`) and annuls the invoice atomically. `invoices.canAnnul` also returns `requires_collection_reversal` and `active_collections_amount`.
  - `invoices.corrective` lines accept `unit`, `regime_key`, `exemption_reason` and `exemption_reason_text`; an omitted value is inherited from the original line. The conversion of a quote, a proforma or a delivery note can return `warnings` and `warning_codes` (`zero_rate_line_without_exemption`).
  - `Invoice` gains `operation_on`.
  - Series carry a purpose: `Series.invoice_kind` is `complete`, `simplified`, `corrective` or `simplified_corrective`, and `null` for a series that is not of invoices. `series.create` accepts `invoice_kind`. `series.list`, `series.default` and `series.active` accept an `invoice_kind` filter, and `series.active` also takes `document_type`; `series.active(params?, config?)` keeps the `series.active(config?)` call working with the same rule as `invoices.pdfLink`.
  - `series_id` is optional and nullable in `invoices.create`. `invoices.update` accepts `type` (`F1` or `F2`). `invoices.corrective` accepts `correction_nature` (`I` or `S`) and `series_id`. `invoices.duplicate` and `series.active` document a `422` response.
  - `contacts.imports.show` retrieves a contact import (`BusinessContactImport`), and `contacts.imports.errors` downloads its errors as CSV and returns a `BinaryResponse`. `BusinessContactImportPreview` gains `import_uuid`, `added_count`, `skipped_count`, `failed_count`, `unprocessed_count`, `status` and `failure_reason`, so code that builds that type by hand must add them; its rows gain an optional `result`.
  - The types `BusinessContactImport`, `CreateCorrectiveInvoiceRequest`, `CreateSeriesRequest` and `UpdateInvoiceRequest` are exported from `@factuarea/sdk`.
  - `verifactu.records.retryBlocked` reactivates every blocked record at once. `VeriFactuRecord` gains `aeat_error_code`, `is_blocked`, `block_reason` and `can_subsanar`, and `verifactu.records.subsanar` now returns the id of the new record. `VeriFactuStats` gains `pending_incident_count`, `blocked_incident_count` and `oldest_pending_at`.
  - `verifactu.representation` (`show`, `register`, `revoke`) manages the representation that enables remission by a third party. `VeriFactuConfig` gains `remission_mode` and the `active_representation_*` fields, and `verifactu.settings` accepts `remission_mode`.
  - `FactuareaError.lineIndex` carries `error.line_index`, the zero-based position of the document line a domain rule rejected, the `N` of `lines.N.tax_rate`. It is `null` for any other error.
  - The types `CreateInvoiceRequest`, `InvoiceWithCheckoutBlocks`, `AnnulInvoiceV1Request`, `CanAnnulInvoice`, `CompanyRepresentation`, `RegisterCompanyRepresentationV1Request`, `RemissionMode`, `RepresentationKind`, `VeriFactuConfig`, `VeriFactuRecord` and `VeriFactuStats` are exported from `@factuarea/sdk`.

  Breaking changes (the SDK is in `0.x`, so they land in a minor):

  - A sale line with no `tax_rate`, no referenced tax and no product with a tax no longer receives an implicit 21 %. It takes the company's default VAT for the document, or the request is rejected with 422 `missing_required_param`, `param` `lines.N.tax_rate` and `line_index` N.
  - Operations that issue an invoice (`invoices.create` when it issues, `issue`, `corrective`, `substituteSimplified`, and `send` and `markSent` when they issue) can answer 422 `verifactu_not_eligible` when a field does not fit the AEAT billing record: a customer name over 120 characters, a Spanish tax ID that is not 9 characters, an invoice number with characters the AEAT does not accept, or more than 12 tax breakdowns. `error.param` says which (`client_id`, `series_id`, `original_invoice_id`, `simplified_invoice_uuids`, `company_name`, `lines`, `total` or `type`). No number is consumed and the invoice stays as it was, so correct the data and repeat. In `bulkCreate` and `bulkStatus` the rejection appears per element in `failures`.
  - Issuing and annulling (`annul`, `void`) answer 422 `verifactu_not_eligible` with subcode `signing_certificate_unavailable` for a company that has enabled VeriFactu in NO VERI*FACTU mode and has no usable certificate, until one is uploaded. `error.param` is `certificate`, `representation` or `system_certificate`. Companies with VeriFactu disabled and companies in VERI*FACTU mode are not affected.
  - `verifactu.records.retry` no longer answers `max_retries_exceeded`: a record is retried without a cap while the incident lasts.
  - `Invoice` gains the required `operation_on` (`string | null`). Code that builds `Invoice` objects by hand, such as test fixtures typed as `Invoice`, must add it.
  - The payment reversal reason gains `issued_in_error` in `InvoicePaymentDetail.reversal_reason` and in the `payment.reversed` event, so an exhaustive `switch` over it needs a new case. It cannot be requested for a single payment with `paymentsRevert`.

## 0.8.0

### Minor Changes

- [#22](https://github.com/factuarea/factuarea-node/pull/22) [`cd19edd`](https://github.com/factuarea/factuarea-node/commit/cd19edd8bdca44394e9c39609a3efbed748f62c9) Thanks [@Chelu97](https://github.com/Chelu97)! - Add the tasks and projects resources and re-pin `spec/openapi.json` from the current public contract (457 paths / 564 operations: 81 added, none removed). `src/generated/` and `src/resources/` are regenerated.

  New resources on the client (80 operations). Every write sends an `Idempotency-Key`, lists return a `Page` with cursor auto-pagination, and errors use the typed hierarchy.

  - `factuarea.projects` (22): `list`, `create`, `show`, `update`, `delete`, `archive`, `unarchive`, `findByKey`; `columns` (`list`, `create`, `update`, `delete`, `reorder`); `customFields` (`list`, `create`, `update`, `delete`); `tasks` (`export`, `import`); `timeSummary.show`; `timeInvoices` (`preview`, `create`). `columns.delete` takes `move_to_column_id` in its query to relocate the column's tasks.
  - `factuarea.tasks` (45): `search`, `create`, `show`, `update`, `delete`, `duplicate`, `findByKey`, `linked`, `status`, `move`, `reposition`, `assign`, `unassign`, `bulkStatus`, `bulkUpdate`, `bulkDelete`; `comments` (`list`, `create`, `update`, `delete`); `relations` (`list`, `create`, `delete`); `labels` (`assign`, `unassign`); `customFields.set`; `externalLinks` (`list`, `create`, `delete`); `entityLinks` (`list`, `create`, `delete`); `attachments` (`list`, `show`, `create`, `download`, `delete`); `uploadLinks.create`; `timeEntries` (`list`, `show`, `create`, `update`, `delete`); `timer.start`; `activities.list`. `create` accepts `entity_link` to link the task to a document or contact in the same call, and `custom_fields` is a map from field id to a string, number, boolean, string array or `null`.
  - `factuarea.taskLabels` (5): `list`, `create`, `show`, `update`, `delete`.
  - `factuarea.taskTimers` (2): `current` (`{ data: null }` when nothing is running) and `stop`.
  - `factuarea.users` (2): `me`, `list`.
  - `factuarea.notifications` (3): `list`, `read`, `markAllRead`.
  - `factuarea.agenda` (1): `list`, a combined agenda of due tasks, document due dates, tax deadlines, absences and holidays.

  The request and response types of these resources (`Project`, `ProjectColumn`, `Task`, `TaskComment`, `TaskLabel`, `TaskTimeEntry`, `TaskAttachment`, `AgendaItem`, `CreateTaskV1Request`, `UpdateTaskV1Request`, `LogTaskTimeV1Request` and the rest) are exported from `@factuarea/sdk`.

  Also carried by the re-pin, measured against the previous pinned spec:

  - New `invoices.issue` (`POST /invoices/{invoice}/issue`).
  - `Invoice` gains `issued_at`, `sent_via` and `is_sent`, its `status` is now a typed union, and `invoices.list` accepts an `is_sent` filter.
  - Recurring invoices gain `generation_mode` (`draft`, `issue` or `issue_and_send`) on create, update and read.
  - 24 new webhook event types, accepted by `webhookEndpoints` subscriptions and test events: `invoice.issued`, `invoice.marked_sent`, `invoice.unsent` and 21 for tasks, comments, time entries and projects.
  - New enum values: `issued` in the bulk invoice status change, `issued` in place of `sent` in the invoice Excel export status filter, `issue` in place of `draft` as a scheduled invoice action, and the automation action types `create_task`, `change_task_status`, `assign_task` and `add_task_comment`.
  - API key scopes: `projects:read|write|delete`, `tasks:read|write|delete`, `users:read` and `notifications:read|write` are added; the retired `clients:*` and `suppliers:*` scopes leave the enum.

## 0.7.0

### Minor Changes

- [#12](https://github.com/factuarea/factuarea-node/pull/12) [`4c2ee4d`](https://github.com/factuarea/factuarea-node/commit/4c2ee4d1d70f971e41c822c66d57980deaf4f3d0) Thanks [@fernandoc00](https://github.com/fernandoc00)! - Add purchase scanner resources and extraction/review types from the backend contract. Support batch uploads, source downloads, versioned review and draft conversion, duplicate resolution, archive/restore, and inbound email history. Preserve structured batch failures and request options across pagination.

  Fix the default request-version header to the supported stable version `2026-06-01`; the previous export-date pin was rejected by the backend.

- [#12](https://github.com/factuarea/factuarea-node/pull/12) [`396bf15`](https://github.com/factuarea/factuarea-node/commit/396bf153ead834cffe3f9007caa28483c8224f61) Thanks [@fernandoc00](https://github.com/fernandoc00)! - Re-pin `spec/openapi.json` from the current backend contract (399 paths / 483 operations) and regenerate `src/generated/` and `src/resources/`.

  **BREAKING**: the backend retired the legacy `clients`/`suppliers` routes (replaced by `contacts`, which already covers the same identities and roles). `ClientsResource`, `SuppliersResource`, the `factuarea.clients`/`factuarea.suppliers` client properties and the `Supplier` type export are removed; the SDK stays in `0.x` (breaking changes may land in a minor while pre-GA, `docs/VERSIONING.md`), so this is a `minor`, not a `major`, release. Use `contacts` for every identity, role and profile operation.

  Harden `scripts/build-resources.mjs` (design D4): operations without `x-speakeasy-group` now fail the generator with a listing of `method path operationId` before any output is written, instead of being silently dropped. The script also accepts `--spec <path>`/`--out <dir>` for testing against fixture specs.

  Add spec-guided `Idempotency-Key` support (design D6): `_send`/`_delete` in `src/core/resource.ts` accept an optional fifth `{ idempotent?: boolean }` argument, and the generator sets it for non-`POST` mutations the spec marks as requiring the header. `src/core/http-client.ts`'s `METHODS_WITH_IDEMPOTENCY` already generates the header unconditionally for every `POST`/`PUT`/`PATCH`/`DELETE` (a broader policy than D6, already shipped on this branch before this change) — that blanket behavior is kept as-is per the repo owner's instruction, so this is additive, not a narrowing.

  Method names follow `backend/docs/api/sdk-method-naming.md @ 1.1.0` (up from the `1.0.0` cited by the generator before this change; the naming rule itself did not change).

## 0.6.0

### Minor Changes

- [#16](https://github.com/factuarea/factuarea-node/pull/16) [`90f936c`](https://github.com/factuarea/factuarea-node/commit/90f936cf1c244e99d665245ece222801d39e4c5f) Thanks [@Chelu97](https://github.com/Chelu97)! - Regenerate the SDK from the public OpenAPI spec that publishes contacts as the
  sole identity resource (+9 operations, -28 operations; 469 in total).

  Removed: the `clients` and `suppliers` resources, retired from the public API on
  2026-09-16 (`/v1/clients/*` and `/v1/suppliers/*`), plus the `Supplier` type.
  Replacements, all on `factuarea.contacts` (filter by `roles: ["customer"]` or
  `roles: ["supplier"]` where the legacy resource implied the role):

  - `clients.list|search|show|create|update|delete` and `suppliers.*` → `contacts.list|search|show|create|update|delete`
  - `clients.stats` / `suppliers.stats` → `contacts.stats`
  - `clients.activities` / `suppliers.activities` → `contacts.activities`
  - `clients.bulkCreate` → `contacts.bulkCreate`; `clients.bulkDelete` / `suppliers.bulkDelete` → `contacts.bulkDelete`
  - `clients.import` / `clients.importTemplate` → `contacts.import` / `contacts.importTemplate`
  - `clients.censusVerification` → `contacts.verifyCensus`
  - `clients.findByTaxId` / `suppliers.findByTaxId` → `contacts.findByTaxId`
  - `clients.findByExternalId` / `suppliers.findByExternalId` → `contacts.findByExternalId`
  - `suppliers.bulkStatus` → `contacts.bulkChangeContactRoleStatus`
  - `suppliers.toggleActive` → `contacts.changeContactRoleStatus`

  Added on `contacts`: `stats`, `activities`, `bulkCreate`, `bulkDelete`,
  `importTemplate`, `verifyCensus`, `findByTaxId`, `findByExternalId` and
  `archive`.

  While the SDK is in `0.x` a removed operation is a `minor`; `1.0.0` stays
  reserved for the API's GA (docs/VERSIONING.md).

## 0.5.0

### Minor Changes

- [#13](https://github.com/factuarea/factuarea-node/pull/13) [`ecf8c54`](https://github.com/factuarea/factuarea-node/commit/ecf8c544697dc9a34a38a2a0232e1bf792f98d7d) Thanks [@fernandoc00](https://github.com/fernandoc00)! - Export the canonical contact and request types, make contacts the default in examples and documentation, and mark legacy client/supplier projections as compatibility resources. Cover contact role, profile, import and archive/restore operations against the public contract.

  Preserve per-request headers (including the active company profile), timeouts and abort signals across paginated requests. Encode boolean query filters as 0/1 for Laravel validation and expose import mappings as named-column objects instead of arrays.

## 0.4.0

### Minor Changes

- [#10](https://github.com/factuarea/factuarea-node/pull/10) [`271b9f7`](https://github.com/factuarea/factuarea-node/commit/271b9f7ea45fa1147b831829aca3f9b808f17765) Thanks [@fernandoc00](https://github.com/fernandoc00)! - Add canonical contacts, contact roles and preferences, and preserve array filters in Laravel-compatible query parameters.

## 0.3.1

### Patch Changes

- [#7](https://github.com/factuarea/factuarea-node/pull/7) [`25619ea`](https://github.com/factuarea/factuarea-node/commit/25619ea6d931457711b701ef639e30161dac6878) Thanks [@Chelu97](https://github.com/Chelu97)! - `products.variants.update`: `stock` no longer declares `minimum: 0`. Send the current balance to leave it untouched (it may be negative when delivered documents ran ahead of the incoming stock); any other value is a manual set and must still be `>= 0` (422 otherwise). `products.variants.create` keeps `minimum: 0`.

## 0.3.0

### Minor Changes

- [#5](https://github.com/factuarea/factuarea-node/pull/5) [`53510b2`](https://github.com/factuarea/factuarea-node/commit/53510b2d32c56a76f7d2cae98bd81e3f5f9df488) Thanks [@Chelu97](https://github.com/Chelu97)! - Regenerate the SDK from the public OpenAPI spec published with Factuarea v1.15.26
  (+57 operations, -0 operations): the automation engine (`client.automations.*`,
  18 operations), ecommerce stores, product options and configurations, price-list
  resolution and stock-ledger audit.

  The resource generator now nests namespaces to any depth
  (`client.automations.rules.versions.list()`), which the three-level
  `automations.rules.versions` and `automations.runs.steps` groups require: with
  two levels their methods collided with `rules.list` / `runs.list`.

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
