---
"@factuarea/sdk": minor
---

Regenerate the SDK from the **account model** contract and expose it from the
client. This adds to the pending `company-axis` changeset: both ship together in
the next `minor`. Nothing here is published by this change.

**Breaking, in the same single window** ([axis-and-payload-breaking-window](https://docs.factuarea.com/docs/changelog/axis-and-payload-breaking-window)).
The account-model announcement will be at [account-model](https://docs.factuarea.com/docs/changelog/account-model).

**The claim voucher becomes the NIF transfer.** Each of the three retired voucher
methods is listed next to the transfer method that replaces it:

| Retired | Replaced by |
| --- | --- |
| `account.claimTokens.create` | `account.nifTransfers.create` |
| `account.claimTokens.list` | `account.nifTransfers.list` |
| `account.claimTokens.accept` | `account.nifTransfers.accept` |

`account.nifTransfers.revoke` is NEW: the voucher had no revoke method to replace.

The only voucher left is `managedAccounts.claimTokens.create`, which reissues the
voucher of a managed account (an addition of the contract, not a leftover).

**New client resources.** `factuarea.companies` (the account's NIF portfolio, with
`stats`) and `factuarea.managedAccounts` (`list`, `create`, `show`, `imports`,
`accessLevel`, `plan`, `management` and `claimTokens`) are now properties of the
client, next to `account`. `account` gains `nifTransfers`, `webhooks` (with
`deliveries`), `requestLogs` and `provisioningUsage()`. The bulk import
(`managedAccounts.imports.create` and `.preview`) takes a `FormData` and is sent as
`multipart/form-data`; the SDK adds no JSON content type.

**The account argument is positional.** Account-scoped methods take the account
`id` as their first argument, before any other id and before the body. TypeScript
callers get a compile error, but plain JavaScript callers would shift every
argument by one place WITHOUT an error: review each call to `account.*`,
`companies.*` and `managedAccounts.*` when upgrading.

Webhook verification is unchanged: `factuarea.webhooks.verify` accepts an account
envelope and returns it with `account`, `account_relationship` and `company_id`
intact.

**Six `taxes` methods are removed, with no replacement** (breaking): the contract
no longer declares them. `TaxesResource` keeps only `list` and `show`; calling any
of `taxes.create`, `taxes.update`, `taxes.delete`, `taxes.setDefault`,
`taxes.setDefaultForDocument` or `taxes.toggle` is now a compile error in
TypeScript and a `TypeError` in plain JavaScript.

**Two verbs change with the document** (breaking, same signatures):
`contacts.restore` goes from `PATCH` to `POST` (no other `contacts` method
changes), and `recurringInvoices.update` goes from `PUT` to `PATCH`.

**Also new on the account axis**, besides what is listed above:
`account.members.show`; `account.members.grants.{list,show,update,delete}`;
`account.invitations.show`; `account.apiKeys.updateNifScope` (the API-key method
for the NIF scope); and `companies.stats`.

While the SDK is in `0.x` a breaking change stays a `minor`; `1.0.0` remains
reserved for the API's GA (docs/VERSIONING.md).
