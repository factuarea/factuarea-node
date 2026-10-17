---
"@factuarea/sdk": minor
---

Regenerate the SDK from the current v1 contract, which adds the ERP omnichannel surface to the company and account axes, and add a browser entry point.

**The ERP surface.** The pinned `spec/openapi.json` declares 830 operations over 666 paths (166 operations added, none removed), and `src/resources/` builds 74 resource namespaces. The new families cover sales and purchase orders, goods receipts, warehouses and their locations, stock transfers, reservations and availability, carriers, packages and picking on delivery notes, returns, purchase reorder suggestions, the storefront and its credentials. Company resources keep the company as the first argument of the call, for example `factuarea.salesOrders.list(company, ...)`. A minor rather than a patch because the repo's policy is that operation churn is a minor while the SDK is in `0.x`, with `1.0.0` reserved for the GA of the API (`docs/VERSIONING.md`, `scripts/spec-sync.mjs`).

**Every namespace is reachable from the client.** `Factuarea` extends the registry's own namespace interface and assigns what `createResources()` builds, so a regenerated resource appears on the client in types and at runtime without a hand-written field.

**`@factuarea/sdk/storefront`, a browser entry point of its own.** A second export with its own `fetch`-based transport, with no Node built-ins and nothing from `src/core/`, for the buyer lane: `FactuareaStorefront({ publishableKey, company, baseUrl?, timeout?, maxRetries?, defaultHeaders?, fetch? })`, with methods over `products` (images, options, presentations and variants), `categories`, `catalogSelections`, `prices`, `availability`, `sessions` and `orders` (buyer identity). It takes a publishable `sf_pk_` credential and refuses an integrator credential at construction time, throwing `StorefrontCredentialError` with code `integrator_credential_in_browser` before it can emit a request.
