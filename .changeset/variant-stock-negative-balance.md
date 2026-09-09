---
"@factuarea/sdk": patch
---

`products.variants.update`: `stock` no longer declares `minimum: 0`. Send the current balance to leave it untouched (it may be negative when delivered documents ran ahead of the incoming stock); any other value is a manual set and must still be `>= 0` (422 otherwise). `products.variants.create` keeps `minimum: 0`.
