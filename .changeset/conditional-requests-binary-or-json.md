---
"@factuarea/sdk": minor
---

Runtime support for conditional requests, asynchronous PDF output and non-retried operations.

- Request options `ifMatch` and `ifNoneMatch` (in `RequestConfig`) send `If-Match` / `If-None-Match` verbatim.
- New per-request `onResponse(meta)` callback exposes `status`, `headers`, `requestId`, `etag`, `retryAfter` and `idempotentReplayed` of the final response, successful or not. Errors now carry `headers` and `retryAfter` (also on 503).
- New `noRetry` request option, and operations that reach a third party (FACe submission and cancellation, or any operation the spec marks `x-no-retry`) are never retried automatically.
- Operations that answer with bytes, a JSON status document (`200`/`202`) or `304` (`invoices.pdf`, `quotes.pdf`, `proformas.pdf` and `deliveryNotes.pdf`) now return `BinaryOrJsonResponse`, a union to narrow on `kind` (`"binary"`, `"json"` or `"not_modified"`). Previously a `202` was returned as a `BinaryResponse` holding the JSON bytes.
- Request bodies are typed with the generated types instead of `unknown` (for example `series.update`). This is a type-level change: calls that passed a body the spec does not describe now need a cast.
