---
"@factuarea/sdk": minor
---

Regenerate the SDK from the published OpenAPI spec: **+183 operations, −4 operations** (413 operations over 345 paths, up from 234 over 192).

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
