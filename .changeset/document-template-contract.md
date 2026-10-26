---
"@factuarea/sdk": minor
---

Document templates, per-document presentation and exact PDFs, on the company axis. The pinned contract grows from 664 to 714 operations (+50, none removed), and every new method takes the company `id` first, like the rest of the company resources since `0.11.0`.

- New resources on the client: `pdfTemplates` (library, revisions, impact, defaults, per-contact preferences and private images, with a bytes-or-JSON `assetGet`), `pdfCommercialIdentities` (shared brand), `pdfTemplatePreviews` and `pdfArtifacts` (`prepare`, `render`, `show` and a `download` that returns `BinaryOrJsonResponse`). `faceSubmissions` (`show`, `cancel`) is now a property of the client too.
- Shared brand for dark backgrounds and brand size: a `PdfCommercialIdentityRevision` carries `logo_dark_asset_id`, `brand_image_dark_asset_id` (`string | null`), `dark_background_fallback` (`"silhouette" | "plate"`) and `brand_size` (`"small" | "medium" | "large"`). The four fields are always present in responses and optional in `pdfCommercialIdentities.create`, `pdfCommercialIdentities.publishRevision` and the unsaved identity of `pdfTemplatePreviews.create`. In a template configuration, `branding.size` also accepts `"inherit"` (the default for new templates), which takes the `brand_size` of the commercial identity, or `medium` without one.
- `invoices`, `quotes`, `proformas` and `deliveryNotes` gain `getPresentation`, `listPresentations`, `assignPresentation` (conditional: pass the `ETag` as `ifMatch`) and `revisePresentation`. `series` gains `getPdfTemplate` and `assignPdfTemplate`, and `invoices.administrativeRevisions` gains `index` and `store` for the administrative centres.

  ```ts
  await factuarea.pdfTemplates.list(company);
  await factuarea.invoices.getPresentation(company, invoiceId);
  ```

- Layout options in the template `configuration` (schema_version 2): `typography.zone_scale` (`body`, `lines`, `legal`: `"s" | "m" | "l"`), `typography.highlight` (`"brand" | "ink"`), `surface`, `page.density` (`"standard" | "compact"`), `branding.size` also accepts `"xl"`, the `total_with_tax` column, `sections.privacy_text` and `sections.general_terms` per language, and the legal-notice placement: `legal_footer.notices_placement` (`"after_content" | "page_bottom"`, default `after_content`) and `sections.show_generic_privacy_notice` (`boolean`, `false` for a new template and `true` for an imported one; it is not printed when the template has its own `privacy_text`).
- Preview form: `PdfPreviewForm` accepts the invoice header `exemption_reason`, and its line `unit_price` also accepts a decimal string with up to 4 decimals. The writes that set the legacy `pdf_template` or `accent_color` on a company that already works with the template library document a `409` `pdf_main_template_required` (choose a main template in the library and repeat).
- Resource methods return the generated success type (`Promise<…Responses[200 | 201]>`) instead of `unknown`, and binary and multipart operations type their request body. This is a type-level change: code that cast the result keeps compiling, code that assigned it to an incompatible type needs a fix.
- Breaking: seven existing methods gain an optional argument before the request options, so a call that passed the options in third place must pass `undefined` first.

  | Method | New argument |
  | --- | --- |
  | `invoices.duplicate`, `quotes.duplicate`, `proformas.duplicate`, `deliveryNotes.duplicate` | `body` (`pdf_template_id` of the copy; invoices also take the version checks of the presentation) |
  | `invoices.issue` | `body` (version checks of the presentation that is issued) |
  | `invoices.faceSubmissions.submit` | `body` (`submission_id`) |
  | `invoices.facturae` | `params` (`submission_id`) |

- `invoices.facturae` returns a `BinaryResponse` with the XML bytes and its mime type; it used to try to parse the XML as JSON.
- The create, update and duplicate bodies of invoices, quotes, proformas and delivery notes, the corrective invoice, the simplified-invoice substitution and series accept `pdf_template_id`. `SeriesPdfTemplate.document_type` includes `transport_document`.
- `quotes.accept` and `proformas.accept` take the reviewed presentation in their body: `presentation_precondition` for the first acceptance of a document that was never captured, and the optional `expected_presentation_uuid` to cite the retained capture you reviewed (a `409` if it is no longer the current one, with nothing written). Once a document has a retained capture, accepting it without either follows that capture.
- New error statuses on existing operations, mapped like any other: `428` when a write precondition is missing (for example `expected_payment_terms_version` on `invoices.update`, or the reviewed presentation on the first acceptance of a quote or proforma), `409` (`ConflictError`) on the writes and PDF reads whose presentation, legal source or version changed since it was checked, and `410` when a retained PDF was erased for privacy.
- An invoice with a payment schedule falls due on its last instalment. Issuing it (`invoices.issue`, or `invoices.create` when it issues) or scheduling it (`invoices.schedule`, `invoices.reschedule`) with a `due_on` that is missing or is not the date of the last entry of `payment_terms` answers `422` `invoice_due_date_not_last_instalment` (`ValidationError`), and nothing changes. A draft can still store a different `due_on`. `invoices.update` that replaces `payment_terms` without `due_on` moves `due_on` to the last instalment, and `invoices.duplicate` issues the copy today, moves every instalment by the days between both issue dates (amounts unchanged) and sets `due_on` to the last one.
- PDF downloads (`invoices.pdf`, `quotes.pdf`, `proformas.pdf`, `deliveryNotes.pdf`): a render that failed and can be retried is claimed again and answers another `202`. A terminal failure of a PDF download, render or preview is a `500` (`ServerError`) with its `code`, including the new `pdf_original_layout_unavailable` (the original is intact but its layout is no longer served).
- Request option `signal` (`AbortSignal`): no further attempt is made and a `ConnectionError` is thrown.
- Errors keep `error.errors[]` and `error.details` (`.errors`, `.details`, and every failed field in `ValidationError.fields`).
- Public types for the presentation, artifact, preview and library contracts are exported (`DocumentPresentationState`, `PdfTemplateRevision`, `PdfTemplateDefaults`, `PdfCommercialIdentity`, `PdfArtifact`, `PdfPreviewForm`, `InvoiceAdministrativeRevision` and their request types, among others).
- Already in `0.11.0`, missing from its notes: `invoices.paymentReceipt` and `purchaseInvoices.paymentReceipt` accept the optional `payment_id` query (`paymentReceipt(company, id, { payment_id }, config?)`) to download the receipt of one payment, and both document a `422` when there is no active payment or the requested one was reversed.

While the SDK is in `0.x` a breaking change stays a `minor`; `1.0.0` remains reserved for the API's GA (docs/VERSIONING.md).
