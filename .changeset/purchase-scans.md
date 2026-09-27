---
"@factuarea/sdk": minor
---

Re-pin `spec/openapi.json` from the current backend contract (399 paths / 483 operations) and regenerate `src/generated/` and `src/resources/`.

**BREAKING**: the backend retired the legacy `clients`/`suppliers` routes (replaced by `contacts`, which already covers the same identities and roles). `ClientsResource`, `SuppliersResource`, the `factuarea.clients`/`factuarea.suppliers` client properties and the `Supplier` type export are removed; the SDK stays in `0.x` (breaking changes may land in a minor while pre-GA, `docs/VERSIONING.md`), so this is a `minor`, not a `major`, release. Use `contacts` for every identity, role and profile operation.

Harden `scripts/build-resources.mjs` (design D4): operations without `x-speakeasy-group` now fail the generator with a listing of `method path operationId` before any output is written, instead of being silently dropped. The script also accepts `--spec <path>`/`--out <dir>` for testing against fixture specs.

Add spec-guided `Idempotency-Key` support (design D6): `_send`/`_delete` in `src/core/resource.ts` accept an optional fifth `{ idempotent?: boolean }` argument, and the generator sets it for non-`POST` mutations the spec marks as requiring the header. `src/core/http-client.ts`'s `METHODS_WITH_IDEMPOTENCY` already generates the header unconditionally for every `POST`/`PUT`/`PATCH`/`DELETE` (a broader policy than D6, already shipped on this branch before this change) — that blanket behavior is kept as-is per the repo owner's instruction, so this is additive, not a narrowing.

Method names follow `backend/docs/api/sdk-method-naming.md @ 1.1.0` (up from the `1.0.0` cited by the generator before this change; the naming rule itself did not change).
