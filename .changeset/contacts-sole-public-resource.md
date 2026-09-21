---
"@factuarea/sdk": minor
---

Regenerate the SDK from the public OpenAPI spec that publishes contacts as the
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
