---
"@factuarea/sdk": minor
---

Add purchase scanner resources and extraction/review types from the backend contract. Support batch uploads, source downloads, versioned review and draft conversion, duplicate resolution, archive/restore, and inbound email history. Preserve structured batch failures and request options across pagination.

Fix the default request-version header to the supported stable version `2026-06-01`; the previous export-date pin was rejected by the backend.
