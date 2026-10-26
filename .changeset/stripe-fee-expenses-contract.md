---
"@factuarea/sdk": minor
---

Re-pin the generated types to API contract changes that are already live in production, unrelated to document templates. They had not reached the SDK because `0.11.0` was generated before them.

- `ConnectedAccount` (connected Stripe accounts) gains `fee_expenses_enabled` (`boolean`), `fee_expenses_tax_treatment` (`"reverse_charge_eu" | "exempt" | null`) and `fee_expenses_since` (`YYYY-MM` or `null`), which record the Stripe fees of the account as a monthly purchase expense. The three fields are always present in the response, so they are required in the type. `connection_method` gains `"platform"`.
- `UpdateConnectedAccountRequest` accepts the same three fields. Turning `subscription_autoinvoicing_enabled` on for the `platform` account answers `422` `parameter_invalid_value` with subcode `platform_account_subscriptions_owned_by_billing`.
- `StripePayout.composition` gains `refunds_total`, `standalone_fee_total` and `other_total` (optional decimal strings), also in the `payout.reconciled` event payload. The `PurchaseInvoice` descriptions of `total` and `taxes_total` now cover self-assessed VAT.
- Type impact: the connected-account and payout resources are not properties of the client, so only code that types against their generated response types notices. Such code must add the three `fee_expenses_*` fields when it builds a `ConnectedAccount` by hand (a test fixture, for example), and an exhaustive `switch` over `connection_method` needs a `"platform"` case. Reading the fields, or ignoring them, needs no change.
