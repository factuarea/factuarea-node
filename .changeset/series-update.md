---
"@factuarea/sdk": minor
---

Add `series.update(series, body?, config?)` (`PUT /v1/series/{series}`, scope `series:write`) and re-pin `spec/openapi.json` from the current public contract (571 operations: 1 added, none removed). `src/generated/` and `src/resources/` are regenerated.

New in the client:

- `series.update` edits a series with a partial body: `name`, `code`, `counter_reset` (`never`, `annual` or `monthly`), `number_format`, `initial_number`, `invoice_kind` and the deprecated `year_reset`. `document_type` is not editable. It answers the updated `Series`. The new type `UpdateSeriesRequest` is exported from `@factuarea/sdk`.
- Each fiscal guard of the numbering arrives as `ValidationError` with `code` `business_rule_violation` and a `subcode`: `series_code_immutable_with_documents`, `series_format_immutable_with_documents`, `series_locked_by_verifactu`, `series_initial_number_creates_gap`, `series_invoice_kind_locked` and `series_default_kind_change`. Invalid values answer `parameter_invalid_value`.
- Changing only `counter_reset` also emits the webhook `series.updated`. `PATCH` and `DELETE` on a series keep answering `405` `series_immutable`, now with `Allow: GET, PUT`; archive a series instead of deleting it.
- `invoices.activities` publishes more `event_type` values with an exact `metadata` contract: the result of each AEAT submission (`verifactu.record_accepted`, `verifactu.record_rejected`, `verifactu.transmission_failed`, `verifactu.transmission_blocked`), `invoice.email_failed`, `invoice.public_link_viewed` and the payment events `payment.payment_created`, `payment.payment_reversed` and `payment.payment_updated`, whose `provider` is the gateway (`stripe`, `gocardless`, `monei`, `woocommerce` or `shopify`) or `null` for a manual payment.
- `VeriFactuRecord` gains the required `aeat_warning_requires_subsanation` (`boolean | null`). Code that builds `VeriFactuRecord` objects by hand, such as test fixtures typed as `VeriFactuRecord`, must add it.
