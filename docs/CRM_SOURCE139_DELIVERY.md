# Private native Source139 SDK

This worktree consumes the real private native export identified by `/tmp/dev2-development139-native-openapi-input.json`: SHA256 `438b12b53be7ae7535cd6c85ba7dea06c76d84a33024db0e0232ac8ba279be63`, 958 operations and 363 native selected carriers. The native profile is unreleased, unpublished, unratified and delivery disabled. Its catalogue hash and exact selector metadata remain unchanged. No capability, credential or runtime permission is granted by SDK metadata.

`scripts/generate-crm-source.mjs` requires that native handoff and verifies its exact bytes and private profile. It selects 22 existing GET carriers, copies their operations and local reference closure without rewriting their schemas, and generates wrappers/metadata. Unrelated webhooks are excluded from this GET slice. The existing `@hey-api/openapi-ts` 0.98.1 generator creates the strict TypeScript models from that machine projection. Published `spec/openapi.json`, legacy CRM49/77 inputs/generated files, package version 0.6.0 and the established API version header remain unchanged. The Source mode writes only its separate files; it cannot promote its private input to a published API spec.

Generation from a Root-produced native input:

```sh
npm run generate:crm-source -- /tmp/dev2-development139-native-openapi-input.json
node_modules/.bin/openapi-ts -f openapi-crm-source.config.ts
```

The mounted entry is `client.crm.source`, composed with the same `HttpClient`, authentication, error hierarchy and cancellation as the existing SDK. It adds Original GET readers for Activity creation, Lead creation, Opportunity creation/stage, Import apply, Sequences save/enrol, Report definition save, Capture form/submission, Helpdesk reply and WhatsApp message. Documents expose current list/get and native binary download. Booking exposes current services/bookings and sequence stop decisions. Sequences retain separate current get/list/preview methods. These methods never dispatch writes, reserve effects, create keys, substitute Current for Original or reconcile automatically.

Each reader uses its exact native query and header schema. SHA-256 of original raw body bytes differs from Reply's native `request_fingerprint`; no helper treats them as interchangeable. Sequence keys preserve the native 512-byte opaque contract, while other owners retain their own 255-character key contract. Capture form Original uses `X-Crm-Save-Attempt` rather than a fabricated idempotency header. JSON query strings and immutable `original_response.body` remain verbatim. Decimal/Money text inside the retained original response is never parsed or rounded; current C7 remains opaque. Native integer fields and input CAS must be safe JavaScript integers; an unsafe native response raises a typed transport error with its request ID.

Original Import `state=confirmed` returns the immutable initial HTTP202 response bytes. That is acceptance of the original apply request, not a claim that processing finished. Missing/in-progress/unconfirmed states remain factual. A 403/404/409/422/429 stays the existing native typed error, including request IDs, subcodes, field errors and Retry-After. Each GET reauthenticates through the canonical transport and has no response/authority cache.

Booking iterators preserve filters, profile headers, cancellation and opaque cursors between current reads. Sequence `pages()` keeps the schedules/enrolments envelope and its distinct parent/subject projections. Documents iterate the native numbered pages using exact integer counts. Consumers must cancel active reads and discard their in-memory intentions when credentials, Company/profile or realm change; a cancellation never proves that an earlier write was undone.

The input139 does not publish Import apply POST/Current, document restore, or a dedicated agenda carrier. Those methods are absent rather than invented. Booking reads are their own available carrier. The ImportOpenApi140 producer's early ABI is not a replacement for an actual native export; those additions require the next Root-produced spec.

Two HTTP fake causal cases and compile-only negative contracts are prepared, unexecuted. They exercise one lost legacy write followed exclusively by Original GET, exact original response/decimal text, current C7 and revocation; and separate Original/current versions, opaque Sequence keys, masked fields/null, Booking cursor continuity, binary bytes, unsafe CAS and cancellation. They prove no native issuer/tenant permission or installed-package/runtime behavior. No suite, build, install, backend/database access, real API, publication or push is performed by this producer. Root owns integrated execution, installation and release accounting.
