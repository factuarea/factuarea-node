# Support & compatibility

This document defines which runtimes `@factuarea/sdk` supports and how we handle
deprecations and breaking changes.

## Runtime support matrix

The SDK is built on the Web `fetch` standard and has **zero runtime
dependencies**, so it runs anywhere a modern `fetch` is available.

| Runtime              | Status                          | Notes                              |
| -------------------- | ------------------------------- | ---------------------------------- |
| Node 20              | ✅ Supported (tested in CI)     | Minimum supported version.         |
| Node 22 (LTS)        | ✅ Supported (tested in CI)     | **Recommended.**                   |
| Node 24              | ✅ Supported (tested in CI)     |                                    |
| Deno                 | ✅ Works (Web `fetch`)          | Not in the CI matrix.              |
| Bun                  | ✅ Works (Web `fetch`)          | Not in the CI matrix.              |
| Cloudflare Workers   | ✅ Works (Web `fetch`)          | Server-side only — keep keys secret. |
| Browser              | ⛔ Not supported                | A secret API key must never reach a browser. |

**Minimum:** Node **20**. Node 18 and earlier are EOL and unsupported. The
`engines.node` field in `package.json` enforces `>=20`.

### Node version policy

We support **all Active LTS and Current Node lines**, plus the most recent
Maintenance LTS while it remains widely deployed. When a Node major reaches EOL,
we may drop it in the **next minor** of the SDK (a Node-support drop is treated
as non-breaking to the SDK surface, but is always called out in the changelog).

## Deprecation policy

When an SDK feature (method, option, exported type) is going away:

1. It is marked `@deprecated` in JSDoc with the recommended replacement, and the
   deprecation is noted in the [CHANGELOG](./CHANGELOG.md).
2. While the SDK is in **`0.x`**, a deprecated feature may be removed in the next
   **minor** release (the `0.x` contract — see [VERSIONING.md](./docs/VERSIONING.md)).
3. From **`1.0.0`** onward, a deprecated feature is kept for at least one
   **minor** release before removal, and removal happens only in a **major**.

API-level deprecations (an endpoint or field the API itself deprecates) surface
through the pinned `Factuarea-Version` (see below): your pinned version keeps the
old behaviour; adopting the change means upgrading the SDK.

## Breaking-change policy

A breaking change is anything that can break a caller compiling against the
public surface: a removed/renamed export, a changed method signature, a changed
public type, or a default `Factuarea-Version` bump that alters behaviour.

- **`0.x`:** breaking changes may ship in a **minor**; each is documented in the
  changelog. `0.x` is an explicit "expect change" signal.
- **`1.0.0+`:** breaking changes ship only in a **major**.

The SDK pins one `Factuarea-Version` per release and sends it on every request,
so the **API's** behaviour stays stable for you regardless of server-side
changes until you upgrade the SDK. The mapping is documented in
[VERSIONING.md](./docs/VERSIONING.md).

## Getting help

- **Bugs / feature requests:** open an issue at
  <https://github.com/factuarea/factuarea-node/issues>.
- **API questions & docs:** <https://docs.factuarea.com>.
- **Security:** do not open a public issue — email **info@factuarea.com**.
