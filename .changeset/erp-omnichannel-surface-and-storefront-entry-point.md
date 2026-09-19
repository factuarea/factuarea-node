---
"@factuarea/sdk": minor
---

Regenerate the SDK against the frozen v1 contract of the ERP omnichannel wave and add a browser entry point.

**The ERP surface.** The pinned `spec/openapi.json` goes from 470 operations over 386 paths to **654 over 532** (+184 added, 0 removed), and `src/resources/` grows from 50 to 63 files. The thirteen new resource families are `contacts`, `warehouses`, `stockAvailability`, `stockReservations`, `stockTransfers`, `salesOrders`, `purchaseOrders`, `goodsReceipts`, `returns`, `carriers`, `purchaseReorderSuggestions`, `storefront` and `storefrontCredentials`. A minor rather than a patch because the repo's policy is that operation churn is a minor while the SDK is in `0.x`, with `1.0.0` reserved for the GA of the API (`docs/VERSIONING.md`, `scripts/spec-sync.mjs`).

**Forty-five namespaces that existed and could not be reached.** `createResources()` has always built one namespace per resource, but `Factuarea` enumerated its own fields by hand and had stopped at 17 of them. The client now spreads the built namespaces and declares them in its type, so all **62 of 62** are reachable — the thirteen ERP families included. This is a widening of the public surface: calls such as `factuarea.salesOrders.list(...)` are new, and so are the forty-five namespaces that were previously unreachable through the published client even though their code shipped.

**`@factuarea/sdk/storefront`, a browser entry point of its own.** A second export with its own `fetch`-based transport — no Node built-ins and nothing from `src/core/` — for the buyer lane: `FactuareaStorefront({ publishableKey, company, baseUrl?, timeout?, maxRetries?, defaultHeaders?, fetch? })`, with 23 methods over 7 namespaces (`products` with its images, options, presentations and variants; `categories`; `catalogSelections`; `prices`; `availability`; `sessions`; and `orders` with its buyer identity). It takes a publishable `sf_pk_` credential and **refuses an integrator credential at construction time**, throwing `StorefrontCredentialError` with code `integrator_credential_in_browser` before it can emit a single request: a `fact_live_`/`fact_test_` key in a browser bundle is a key that has been published.

A regenerated SDK is not a deployed API. Until the ERP surface is live, the operations this release adds answer from the contract, not from production.
