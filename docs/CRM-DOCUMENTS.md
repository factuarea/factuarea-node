# Native CRM documents

The handwritten `commercialDocuments` and `opportunityDocuments` clients consume
the current backend v1 JSON routes. They live in `src/crm/documents`, outside
the regenerated resources. These additions do not change the pinned specification,
package version or the server's CRM release, plan or authorization gates.

Methods return `{ data, status, headers, requestId }`. `data` is the decoded native
resource inside the HTTP `{ data }` envelope. `commercialDocuments.download`
returns the existing `BinaryResponse`, including its original bytes and metadata.
No library read rebuilds a private storage handle, URL, token or visitor payload.
Masked fields stay absent; visible nullable fields stay `null`.

| Client method | v1 path suffix | Method / success | Scope |
| --- | --- | --- | --- |
| `commercialDocuments.list` | `/crm/documents` | GET 200 | `crm_documents:read` |
| `commercialDocuments.get` | `/crm/documents/{document}` | GET 200 | `crm_documents:read` |
| `commercialDocuments.upload` | `/crm/documents` | POST 201 | `crm_documents:write` |
| `commercialDocuments.replaceVersion` | `/crm/documents/{document}/versions` | POST 200 | `crm_documents:write` |
| `commercialDocuments.share` | `/crm/documents/{document}/shares` | POST 200 | `crm_documents:write` |
| `commercialDocuments.revokeShare` | `/crm/documents/{document}/shares/revoke` | POST 200 | `crm_documents:write` |
| `commercialDocuments.archive` | `/crm/documents/{document}/archive` | POST 200 | `crm_documents:write` |
| `commercialDocuments.download` | `/crm/documents/{document}/download` | GET 200 binary | `crm_documents:read` |
| `opportunityDocuments.list` | `/crm/opportunitydocuments/{opportunity}/documents` | GET 200 | `crm_opportunitydocuments:read` |
| `opportunityDocuments.candidates` | `/crm/opportunities/{opportunity}/documents/candidates` | GET 200 | `crm_opportunitydocuments:read` |
| `opportunityDocuments.financialSummary` | `/crm/opportunitydocuments/{opportunity}/financial-summary` | GET 200 | `crm_opportunitydocuments:read` |
| `opportunityDocuments.createQuote` | `/crm/opportunitydocuments/{opportunity}/quotes` | POST 201 | `crm_opportunitydocuments:write` |
| `opportunityDocuments.link` | `/crm/opportunitydocuments/{opportunity}/documents` | POST 201 | `crm_opportunitydocuments:write` |
| `opportunityDocuments.unlink` | `/crm/opportunitydocuments/{opportunity}/documents/{link}` | DELETE 200 | `crm_opportunitydocuments:write` |

The backend's current context remains authoritative for Company, environment,
actor, record visibility, plan and scopes. API keys stay on the server. Use the
existing `defaultHeaders` / request `headers` for supported Company/profile
selection; no Company or grant belongs in these closed JSON bodies.

## Types and native data

The exported `crmDocumentId`, `nativeDocumentId`, `crmDocumentVersion`,
`crmDocumentDate`, `crmDocumentTimestamp` and `crmDocumentDecimal` functions validate
the corresponding branded TypeScript primitives. New CRM entities require UUIDv7;
existing Quote, Invoice, Contract, Recurring and member identities can retain
their native older UUIDs. Counts and versions must be safe JS integers; a write
CAS must leave room for its safe successor. The SDK rejects values it cannot
represent exactly instead of rounding them.

Money remains a string, including eighteen-digit integer parts: document amounts
use two decimal places and forecast buckets use four. The SDK computes no fiscal
totals, conversion or currency aggregation. Non-fiscal Contract/Recurring amounts
stay `null`, with `financial_applicability: "not_applicable"`. Native state strings
remain intact, including future values; the current four native owner types are
validated explicitly.

Optional properties with `undefined` remain omitted. Explicit `null` is accepted
only for the native nullable fields, including share expiry, draft expiry,
recipient `id` when unassigned, series/client, notes/terms and optional contact.
`false`, zero counts, Unicode and multiline notes are retained. Candidate revisions
are read metadata; native linking has no `expected_owner_revision` input.

Upload and replacement use the current `producer_reference_id` and `claimed_mime`
JSON contract. They do not send bytes, multipart fields, public URLs or SPA aliases.
The server's accredited native producer must already have reserved the reference.

## Pagination and cancellation

Library pagination uses `page` / `per_page`; `iterate` follows all pages with the
same search/sort/archive filters. Opportunity lists serialize the closed filters
as one JSON `filters` query string; `false` is retained. `iterate` and
`iterateCandidates` follow their native opaque cursors, preserve filters and detect
repeated cursors. All iterators accept an explicit maximum page count (default
1000) and throw at that boundary instead of silently returning a partial result.
Unavailable candidate producers preserve the native reason and empty result.

The native `RequestConfig.signal` now carries an `AbortSignal` through fetch and
body consumption. Cancellation does not prove that an in-flight mutation did not
commit. Ordinary reads retain the configured read retry policy; every document
write and every explicit recovery performs exactly one transport attempt even if
the client or an unsafe JavaScript config requests retries.

## Original receipts and explicit recovery

Persist the original key and request before invoking a mutation. Every write
requires a caller-supplied ASCII `idempotencyKey` (1–255 characters). The SDK checks
the success status and original receipt: library UUID and CAS successor (upload
version 1), unlink association/parent/CAS successor, and linked native document
type/parent/identity. A queued state or malformed successful response never
manufactures confirmation. Recovery uses the immutable original receipt, without
loading or accepting a guessed current document head.

A timeout, cancellation after send, lost response, malformed success, server
failure or revoked/unconfirmed result throws `CrmDocumentWriteUnconfirmedError`.
It retains a sealed `intent`, the typed `originalError`, native status/subcode and
request id when present. Native determinate 409 CAS, 422 fields and 429 Retry-After
errors keep their original SDK classes. No error handler automatically recovers.

After an explicit caller decision, invoke the appropriate resource's
`recover(error.intent, { signal, timeout })`. This sends exactly the retained
operation, path, JSON bytes and original key. The intent belongs to the original
client instance; forged intents, another owner/client, or changes in effective
server/credential/Company/profile/version context are rejected before sending.
Context checks retain only a one-way fingerprint; private authentication headers
are not properties of the public intent. The server still revalidates current
authority and selects the original receipt; an unconfirmed reservation remains
unconfirmed. There is no separate public receipt, fiscal conversion or renewal
endpoint in this adapter.

See [`examples/crm-documents.ts`](../examples/crm-documents.ts) for a typed retained
link intent and a separate explicit recovery function. This document describes
the document subset of CRM-084 delivery. Full Lead→Opportunity→Activity, clean
installation, generated public spec adoption, sandbox A/B certification and
package release remain separate owner work.
