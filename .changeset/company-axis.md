---
"@factuarea/sdk": minor
---

Regenerate the SDK from the **company-axis** contract: every company resource now
hangs off `/v1/companies/{company}/…` and the account surface off
`/v1/accounts/{account}/…`. 481 operations in 396 paths, up from 469 in 387
(+17 / −5).

**Breaking — every company-scoped method takes the company first.** The company
stops being inferred in silence from the credential and travels in the URL, where
it is visible, logged and auditable:

```ts
// Before
await factuarea.invoices.list({ status: "paid" });

// Now
await factuarea.invoices.list(company, { status: "paid" });
```

`company` is the company **`id`** — the one `factuarea.account.show()` returns in
`data.scope[].id` — never its tax ID or its name.

Also breaking, in the same single window:

- `factuarea.account.show()` keeps its name and now answers on `/v1/me`,
  returning the credential's scope (`data.scope[]`) alongside its API key.
- The `X-Active-Profile` header is retired: the contract no longer declares it,
  and the axis segment replaces it.
- Updates use `PATCH` (`contacts.restore`, `contacts.updateCustomerProfile`,
  `contacts.updateSupplierProfile`, `contacts.updateBankAccounts`…), and amounts
  travel as decimal strings.
- The five API-key operations move from the company to the account axis:
  `companies.apiKeys.*` → `account.apiKeys.*` on `/v1/accounts/{account}/api-keys`.

Added: the account axis (members and their module access, invitations, claim
tokens, owner transfer, usage), `companies.issuingReadiness` and
`recurringInvoices.bulkStatus`.

While the SDK is in `0.x` a breaking change stays a `minor`; `1.0.0` remains
reserved for the API's GA (docs/VERSIONING.md).
