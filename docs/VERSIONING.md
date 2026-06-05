# Versioning

`@factuarea/sdk` follows [Semantic Versioning](https://semver.org/) and is
aligned with the Factuarea API's date-based versioning. This document records
the policy (design decision **D6**) and the `Factuarea-Version` ↔ SDK-version
mapping.

## Two version axes

| Axis                  | Looks like   | Owned by                                   |
| --------------------- | ------------ | ------------------------------------------ |
| **SDK version**       | `0.1.0`      | This package (npm `@factuarea/sdk`)        |
| **`Factuarea-Version`** | `2026-06-04` | The API (sent as a header, Stripe-style) |

The API uses a flat `/v1` path plus an optional `Factuarea-Version: YYYY-MM-DD`
header (versioning by date). **Each SDK release pins one `Factuarea-Version`
and sends it on every request**, so the API's behaviour is frozen for you until
you upgrade the SDK — upgrading the SDK is how you adopt a newer API version.

The pinned value is `DEFAULT_FACTUAREA_VERSION` in
[`src/core/version.ts`](../src/core/version.ts). You can override it per client:

```ts
new Factuarea({ apiKey, factuareaVersion: "2026-06-04" });
```

## SemVer rules for the SDK

Given a version `MAJOR.MINOR.PATCH`:

- **MAJOR** — a breaking change to the SDK's public surface (renamed/removed
  method, changed signature, changed exported type) **or** a bump of the default
  `Factuarea-Version` that changes observable behaviour. Breaking changes are
  reserved for `1.0.0+`; while in `0.x` they may land in a **minor**.
- **MINOR** — new operations, new resources, or non-breaking features.
- **PATCH** — bug fixes and internal changes with no surface impact.

While the API is **pre-GA**, the SDK stays in `0.x`. `0.x` explicitly signals
that minor releases may carry breaking changes. The jump to **`1.0.0` is tied to
the API's GA event** (no fixed date).

## `Factuarea-Version` ↔ SDK-version mapping

| SDK version | `Factuarea-Version` | Notes                                    |
| ----------- | ------------------- | ---------------------------------------- |
| `0.1.0`     | `2026-06-04`        | Initial release. Spec frozen in P0.      |

Every release also records its pinned `Factuarea-Version` in the
[CHANGELOG](../CHANGELOG.md). When a release adopts a newer `Factuarea-Version`,
add a row here and call out any behavioural change in the changelog.

## How releases are cut

Versions are managed with [Changesets](https://github.com/changesets/changesets).
A contributor adds a changeset describing the bump; merging to `main` opens a
"Version Packages" PR; merging that PR publishes to npm. See
[RELEASING.md](./RELEASING.md). The SDK regenerates automatically when the
public spec changes (see [SPEC_SYNC.md](./SPEC_SYNC.md)).
