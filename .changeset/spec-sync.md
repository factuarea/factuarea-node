---
"@factuarea/sdk": minor
---

Stripe charge rules carry the cause of exemption, and an invoice reports its rectification chain. The pinned contract keeps its 736 operations (none added, none removed); in `0.x` a contract that grows is a `minor`.

- Stripe charge rules: a rule that invoices at a 0 % VAT rate can carry the cause of exemption (`E1` to `E6`) or non-subjection (`N1`, `N2`) that the invoice lines it produces will show.
  - `ChargeRule` exposes `exemption_reason` (`'E1' | 'E2' | 'E3' | 'E4' | 'E5' | 'E6' | 'N1' | 'N2' | null`), always present in the responses of `stripeAutoinvoicing.accounts.chargeRules.list`, `create` and `update`.
  - `ChargeRuleRequest`, the body of `chargeRules.create` and `update`, accepts `exemption_reason` (`string | null`), optional: only with `outcome` `invoice` and `vat_rate` 0. With any other VAT rate, without `vat_rate`, with `do_not_invoice` or with a value outside the list, the API answers `422` `charge_rule_invalid` with `error.param` = `exemption_reason`, thrown as `ValidationError`. Omitted or `null` means no cause. Replacing a rule sends every field again, so omitting `exemption_reason` clears the stored cause.
- Invoices follow their rectification chain. `Invoice` gains three fields, always present:
  - `superseded_by` (`{ id: string; number: string } | null`, a new generated type `InvoiceSupersededBy`, reachable as `NonNullable<Invoice["superseded_by"]>`): the corrective invoice (corrective by substitution) that replaced this one for collection purposes. The original is not voided, but it no longer demands payment.
  - `credited_amount` (`string`, two decimals, `"0.00"` when none applies): what the credit notes of the chain deduct from what the invoice demands.
  - `inherited_paid_amount` (`string`, two decimals, `"0.00"` when none applies): payments registered on the original invoice that count towards a corrective invoice by substitution. It is included in `paid_amount`; the payments stay listed on the original.
- The meaning of `paid_amount` and `pending_amount` changes, not their type: they are now the amounts along the rectification chain. On a live invoice `pending_amount = total_to_pay - credited_amount - paid_amount`; an original replaced by a corrective invoice reports `0.00` for both. The old invariant `paid_amount + pending_amount === total` no longer holds when there are credit notes or a replacement. `payments.total` and `payments.pending` mirror them.
- New `422` answers, with no change to the signatures:
  - `invoices.paymentsCreate` answers `business_rule_violation` with subcode `invoice_not_payable` (a status that takes no payments, such as a draft) or `invoice_superseded_by_corrective` (register the payment on the corrective invoice). Both are thrown as `ValidationError`; the `subcode` property of the error tells them apart.
  - `invoices.reminderPreview` and `invoices.sendReminder` answer `reminder_not_applicable` when no reminder can be sent: the invoice was replaced by a corrective invoice (remind from the corrective) or nothing is outstanding after its corrective invoices.
- Type level: `Invoice` and `InvoiceWritable` now require `superseded_by`, `credited_amount` and `inherited_paid_amount`, and `ChargeRule` requires `exemption_reason`. Code that builds those objects by hand (test fixtures, mocks) has to add them; code that only reads API responses is unaffected.
