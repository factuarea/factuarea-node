---
"@factuarea/sdk": minor
---

Regenerate the SDK from the public OpenAPI spec published with Factuarea v1.15.26
(+57 operations, -0 operations): the automation engine (`client.automations.*`,
18 operations), ecommerce stores, product options and configurations, price-list
resolution and stock-ledger audit.

The resource generator now nests namespaces to any depth
(`client.automations.rules.versions.list()`), which the three-level
`automations.rules.versions` and `automations.runs.steps` groups require: with
two levels their methods collided with `rules.list` / `runs.list`.
