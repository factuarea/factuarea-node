# Changelog

All notable changes to `@factuarea/sdk` are documented here. This project
adheres to [Semantic Versioning](https://semver.org/) (with `0.x` allowing
breaking changes in minor releases until the API GA).

## [Unreleased]

### Added

- Initial TypeScript SDK covering all 234 v1 operations across 17 resources.
- Hand-written runtime core: `fetch`-based `HttpClient`, automatic retries
  (429/5xx, `Retry-After`), automatic `Idempotency-Key` on POST, cursor
  auto-pagination (`Page` async iterator), typed error hierarchy, HMAC-SHA256
  webhook verification, and binary/PDF downloads.
- Dual ESM + CommonJS build with type declarations.
- Pinned `Factuarea-Version: 2026-06-04` (spec frozen at private commit
  `e822661bc`).
