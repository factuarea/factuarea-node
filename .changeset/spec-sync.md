---
"@factuarea/sdk": minor
---

Packs, promotions, products on the web and account seats. The pinned contract grows from 714 to 736 operations (+22, none removed); it is the same document the PHP SDK pins since `0.9.0`.

- New resources on the client: `packs` (`list`, `show`, `create`, `update`, `archive`, `restore`, `delete` and `priceBreakdown`, plus `packs.images` with `upload`, `update` and `delete`) and `promotions` (`list`, `show`, `create`, `update`, `cancel` and `delete`). `products.bulkChannels` publishes or withdraws products on the web in bulk, `additionalNifSeats` (`status`, `preview`, `update`) manages the additional tax ID seats of an account, and `employeeSeats.update` sets the contracted employee seats.

  ```ts
  await factuarea.packs.list(company);
  await factuarea.promotions.create(company, body);
  ```

- Products on the web: `Product` gains `slug`, `summary`, `seo`, `channels`, `availability`, `previous_slugs`, `promotion`, `sale_price` and `sale_price_from`; variants, presentations and configurations gain the active `promotion` and `sale_price`, and resolved prices the `promotion` and the `regular_unit_price` it discounts. `products.list` and `products.show` accept `date` (the day the promotion is resolved for) and `view` (`storefront` returns only what a web shop may show) in their params; `products.list` also filters by `channel`, `slug` and `updated[gte]`/`updated[lte]`, and `date` reaches search, variants, presentations, configurations and the price resolution. The contract also documents a conditional `304` on both, which these JSON methods do not handle yet: do not pass `ifNoneMatch` to them.
- Document lines of invoices, quotes, proformas and delivery notes carry `pack_group` (the pack a line belongs to, or `null`); recurring invoice lines accept it. Price lists filter by `updated[gte]`/`updated[lte]` and document a `409` on update, delete and item writes. The seat charge previews and the employee batch quote gain the seats to buy, the free seats used and the pending reduction they cancel; offer quotes gain `minimum_quantity` and `target_quantity`. `ConnectedAccount` gains `email_invoice_to_payer`. `companies.deactivate` and `companies.delete` no longer document a `409`. New event types: `pack.*`, `promotion.*`, `price_list.*` and `product.deleted`.
- Breaking: `employeeSeats.cancel` gains an optional `body` before the request options, so a call that passed the options second must pass `undefined` first.
- Type-level changes, so code that compiled against `0.12.0` may need a fix:
  - Request bodies: `quantity` is required on the lines of `invoices.update`, `quotes.update`, `proformas.update`, `deliveryNotes.update` and `recurringInvoices.update`; `quantity` and `tax_rate` on the lines of `purchaseInvoices.update`; `description`, `quantity` and `unit_price` on the lines of `invoices.corrective`; and `type` on the `declared_measure` of the shipments of `transportDocuments.create`, `update` and `modify`.
  - `Product` fields that the `storefront` view omits are optional: `price`, `stock`, `is_active`, `is_in_stock`, `is_low_stock`, `low_stock_threshold`, `manage_stock`, `supplier_offer_count`, `supplier_offers`, `preferred_supplier_offer_id`, `catalog_availability_mode`, `presentations`, `variants`, `option_groups`, `configurations`, `metadata` and `created_at`.
  - Some request fields stop being required (the `business_references` and `delivery_notes_references[].date` of invoice lines, the `publication_context` of the public link updates, the price resolution targets and the `package_quantity` of purchase measurements): code that sends them keeps compiling.
