# CRM native Source delivery

The Node SDK baseline is `74021eb75404cf34436b6067874c82f3381d62d2`, package `@factuarea/sdk` `0.6.0`, Node >=20, TypeScript strict, ESM/CJS. No AGENTS.md or CLAUDE.md exists in this SDK checkout. Workspace and app routing instructions were read. This local change implements a Source delivery; native sandbox acceptance, coordinated release and publication remain pending. No capability or quota is enabled by this change.

The separate `spec/crm-native.json` is byte-identical to the full native Scramble export and contains the 49 real native v1 operations: 11 ContactPeople, 23 Lead and 15 Pipeline, including stage health. Its types and resource wrappers are generated with the existing @hey-api/typescript generator by `npm run generate:crm`. Existing non-CRM generated resources and the pinned public spec remain on their baseline. `CRM_OPERATIONS` records exact operation IDs, scopes, method paths and confirmation metadata. This static inventory describes the SDK; the API alone determines current availability, tenant, actor, environment and authority. There is no invented CRM discovery endpoint. Existing `account.show()` introspection and typed owner options remain available through their actual routes.

## API use

```ts
import { Factuarea, CrmUnconfirmedWriteError } from "@factuarea/sdk";
const client = new Factuarea({ apiKey: process.env.FACTUAREA_API_KEY! });
const page = await client.crm.leads.list({
  limit: 25,
  filters: JSON.stringify({ status: "open" }),
});
for await (const lead of page) console.log(lead.id, lead.version);
const originalStepKey = "persisted-host-operation-key";
try {
  const result = await client.crm.leads.create({ name: "Synthetic example" }, {
    idempotencyKey: originalStepKey,
    onResponse: (response) => {
      console.log(response.requestId, response.headers.get("Idempotent-Replayed"));
    },
  });
  // result preserves the native envelope and any minimal confirmed receipt.
} catch (error) {
  if (error instanceof CrmUnconfirmedWriteError) {
    // Reconcile the original key; retain error.idempotencyKey and operationId.
    // Do not create a new intention or assume timeout means no committed effect.
  }
  throw error;
}
```

The host persists its original key before dispatch. The SDK does not generate entity IDs or replace CAS versions/plan hashes. Native optional `id` in Lead/People create is preserved from the actual owner schema; callers can omit it for the server to assign UUIDv7. `id` and `*_id` remain strings; monetary amounts and Pipeline probabilities remain exact decimal strings. Fields omitted preserve current values and null is accepted only where the native schema permits it.

ContactPeople list uses numbered `meta` pages. Duplicates and options use the owner's fixed 25-item page size. Lead list/search/history/duplicates use nested `data.data` with opaque `cursor`; Pipeline list uses nested `data.items`. All iterator helpers preserve filters, context headers and AbortSignal across subsequent pages. Run lookup and remap previews retain their native bodies without applying an unrelated list envelope.

CRM mutations and POST previews make one transport attempt, including when the client or per-request config sets retries. Read retry policy remains with the canonical core. Failed transport/response-body reads and 5xx outcomes of an actual CommandHandler effect raise `CrmUnconfirmedWriteError` with the original key. Cancellation stops waiting and does not guarantee that the server did not execute. Native 403, 404, 409, 422 and 429 remain the existing typed errors, including all native `error.errors[]` field messages, request IDs, Retry-After and the original parsed body in `rawResponse`.

Pipeline archive and Lead conversion/deletion/scoring apply require the native caller-supplied confirmation fields; the SDK never fills them in. Consent withdrawal follows its native conditional confirmation. People archive/merge have native confirmation metadata but closed bodies without a confirmation field; they require local `humanConfirmed: true` request config after human review. This local acknowledgement is never sent as a body/header and is not an authority grant. Preview hashes, versions, IDs, catalogues and confirmed receipts do not grant current access. Credential revocation between steps and foreign record opacity remain server decisions.

## Source and BottleCRM mapping

`spec/crm-native.json` is the full native `public-api:export-spec` / Scramble output, selected through the unchanged native public resolver and all three owner manifest route names. All 49 operations, callbacks, contributors, transformers, common Error schema, request parameters and response headers are preserved without editing the OpenAPI. Its SHA256 is `9759f8e07cdbd4ba7b477e7f3f785c1b2d198f0657f64dc97c87bdea542bc837`. The independent producer recorded zero SQL attempts/executions and zero PDO calls, resolved local references, and an unchanged 1,189-file Source freeze. Configuration was process-private; persisted flags remain off and ratification false.

`spec/crm-native-source.json` records SDK generation evidence separately: the 136 directly audited native source hashes and all 49 native handler class/interface mappings. Effect handling derives from the 29 CommandHandler interfaces and 20 QueryHandler interfaces; it does not infer business effects from HTTP verb or scope. The local `export-crm-contract.php` is a contributor-only audit helper: it loads the existing backend vendor autoloader and in-memory router without Laravel boot or database/configuration writes. Its provisional output is not the canonical SDK input or a release certificate.

BottleCRM source: Django-CRM commit `656aaa6c3362658b82a3a6043c9e97a88bb8b215`, `docs/integrations/javascript-sample.md`, SHA256 `82f024290ff4e7ff47d1b30a83d06479312af356b6019e6b9c423de7619f55f5`. The checked local hash matches the approved change. Decision: reference only/native design; no code is substantially copied or translated. Its server environment credential/list/create/lookup example maps to `examples/crm-server.ts`, `examples/crm-review.ts` and CRM contract tests. Deliberate differences: Factuarea uses canonical API-key auth, exact UUIDv7 identities, tenant bound to credential, native permission checks, stable idempotency/CAS, owner-specific full pagination and typed errors. BottleCRM open/closed lead envelopes, PAT auth and browser-executable secret calls are not inherited. No upstream runtime execution is claimed, and no MIT notice is required for reference-only use.

## Pending evidence

Native two-tenant sandbox HTTP journeys and revocation against an enabled, ratified test capability are pending. Lead → Opportunity → Activity and public-form recipes belong to later real delivered operation groups; those endpoints are absent from this SDK slice. Publication, package version bump, external commit/push, package release and capability activation are not performed here. Root owns commit/push and app/OpenSpec task evidence; this SDK does not mark an OpenSpec change Applied.

## Executed validation — 2026-10-09

The 125 directed tests, ESM/CJS build and clean private package validation below were run before the final native metadata-schema correction. The final official export removes exactly two empty `metadata.properties` arrays from Lead create/update; all other contracts are unchanged. Generation and typechecking are checked separately after this correction; earlier tests are retained rather than replayed. The private tarball contains the earlier contract SHA256 `78b338eb939cf3855a0bf8545fde95a95770e6198c502caced09f0cb0d71d786`; it does not certify the new spec bytes. The code/hash delta and current Source freeze are recorded in `docs/CRM_VALIDATION.json`.

- `npm run typecheck`: passed, including compile-only negative CRM contracts and server examples.
- `npm test -- test/crm.test.ts test/http.test.ts test/retry.test.ts test/pagination.test.ts test/binary.test.ts test/errors.test.ts`: 125 passed in six directed files; 85 CRM cases include all 49 actual methods, native pagination, error envelopes, header replay, current-scope rejection, cross-client opacity and cancellation/uncertain-effect recovery. These are synthetic HTTP mocks, not native two-tenant acceptance.
- `npm run build`: passed for ESM, CJS and strict declaration bundles.
- Private `npm pack --ignore-scripts` then clean `npm install --ignore-scripts`: passed; ESM original receipt/replay-header recipe, CJS Pipeline pagination and a strict TypeScript installed consumer passed. Node v22.23.3, TypeScript 5.9.3, @types/node 20.19.41. Package version remains 0.6.0. The final private tarball hash, install location and complete file hashes are recorded separately in `docs/CRM_VALIDATION.json`.
- `git diff --check`: passed. All 136 captured native source file hashes matched the current app after generation. Source contract SHA256: `9759f8e07cdbd4ba7b477e7f3f785c1b2d198f0657f64dc97c87bdea542bc837`. SDK default request `Factuarea-Version` remains the supported baseline `2026-06-01`; source export date is independent.

Logs and install artifacts are private; the final install path is recorded in `docs/CRM_VALIDATION.json`, alongside `/tmp/node-sdk-native-typecheck-final.jz3jaym3`, `/tmp/node-sdk-native-tests-final.erifckbr`, the private build log listed there. No backend Unit/SQL/full suite or `make pr` was executed. Full native Scramble export passed after its owner resolved the bootstrap hold; its handoff is recorded in `docs/CRM_VALIDATION.json`. Native HTTP acceptance, coordinated versioning and publication remain pending.
