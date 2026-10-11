# Private native Source143 Import and Restore

The Root-produced input `/tmp/dev2-development143-native-openapi-input.json` identifies the actual native OpenAPI artifact SHA256 `59b6cd2664aa8524e96a7600565b70b5eae5f6beaa7527913d703adf653a2fca`, 959 operations and 364 native carriers. Its native catalogue is `814cc0ad9a994af2acfdb25e1633557469cfacc869d49792a478d3a869b8699e`. The SDK's existing private slice filenames remain `spec/crm-source139.json` and `spec/crm-source139-input.json` for compatibility; their contents now identify Source143, its exact manifest and SHA. The private native profile remains unreleased, unpublished, unratified and delivery OFF with no capability grant. Published SDK inputs/defaults, native77 models and SDK110 entity export remain unchanged.

Generate only from that real input:

```sh
npm run generate:crm-source -- /tmp/dev2-development143-native-openapi-input.json
node_modules/.bin/openapi-ts -f openapi-crm-source.config.ts
```

The generator accepts the real Root manifest's `sha256`/`carrier_count` names as well as the earlier manifest's names. It checks exact artifact bytes/SHA, declared byte count, the strict native private profile and selected carrier membership. The catalogue is copied from the actual native profile, and compared to a manifest catalogue if one is present. No descriptive ABI, example, repaired manual spec or published input replaces that source.

`client.crm.source.imports.apply(run, body, config)` calls the real `POST /crm/imports/{run}/apply`. Its native closed JSON fields are `expected_version`, `preview_hash`, `effect_uuid`, `mode`, `confirmed: true` and optional `corrected_source_blob_id`. The wrapper's conditional type is generated from the native schema's `allOf`: corrected source is allowed only for `retry_failed`. The owner still validates all references, masks, permissions and mode semantics. Preserve uppercase UUID bytes where that native pattern permits them; no rewrite is applied to the original body or key.

Apply success is only HTTP202 with its native run DTO. `state` remains the native string, and `progress.pending` remains factual. Acceptance does not mean rows finished or external delivery occurred. The SDK requires an explicitly retained key and local human acknowledgement, sends through the same canonical transport with `maxRetries: 0` and `redirect: "error"`, and exposes native status/headers/request ID through `onResponse`. Native integer and CAS fields, including every integer value in `counts`, must fit JavaScript safe integers. Decimal and currency text is not converted.

```ts
type ApplyBody = Parameters<Factuarea["crm"]["source"]["imports"]["apply"]>[1];
const body: ApplyBody = Object.freeze({
  expected_version: reviewedNativePreview.version,
  preview_hash: reviewedNativePreview.preview_hash,
  effect_uuid: retainedNativeEffectUuid,
  mode: "import",
  confirmed: true,
});
const rawBody = JSON.stringify(body); // retain these exact bytes and the original key before dispatch
const originalBodySha256 = createHash("sha256")
  .update(rawBody, "utf8")
  .digest("hex");
try {
  await client.crm.source.imports.apply(runUuid, body, {
    idempotencyKey: retainedKey,
    humanConfirmed: true,
    signal: companySessionSignal,
  });
} catch (error) {
  if (!(error instanceof CrmUnconfirmedWriteError)) throw error;
  const original = await client.crm.source.imports.getApplyOriginal(
    runUuid,
    {
      original_body_sha256: originalBodySha256,
    },
    { idempotencyKey: retainedKey, signal: companySessionSignal }
  );
  // Handle missing/in_progress/unconfirmed explicitly. Never dispatch another POST here.
  // Confirmed Original contains the immutable initial202 JSON bytes, not Current.
}
```

`imports.getApplyOriginal` remains the separate native GET on the original run/key/body hash. It returns the immutable first successful202 bytes under current native authority. Its opaque `authorization_version` is not parsed or reused as permission. `imports.getCurrent(run, { cursor, limit })` calls the normal JSON mode of `GET /crm/imports/{run}` and returns the typed current run plus errors: native version, physical `source_row`, nullable field, code list and opaque version-bound cursor. A changed cursor/head remains the native 409 and requires a fresh human decision. Current cannot prove that a retained Apply completed and cannot reconstruct its Original.

`imports.downloadErrorsCsv(run, { report_format: "csv", expected_version })` uses that same native Current GET in its published CSV mode. It requires both selector and CAS, excludes cursor/limit, verifies the native CSV media type and returns canonical `BinaryResponse` bytes with their headers and request ID. It does not parse, reassemble, normalize line endings, remove a BOM, invent error columns or infer Apply success. JSON and CSV errors retain the existing typed error hierarchy. No extra route, grant or owner is created.

`client.crm.source.documents.restore(document, { expected_version, confirmed: true }, config)` calls the real `POST /crm/documents/{document}/restore` and reads only its native HTTP200 `{ data: { id, version } }` receipt. Obtain the actual current version and a new human review before a new restoration intention; a 409 preserves the reviewed draft and requires explicit refresh. Retain the original key/body, and never substitute a fresh CAS and replay after a lost response. The actual Source143 catalogue publishes no Document Restore Original GET. A timeout therefore raises `CrmUnconfirmedWriteError` and the host stops UNKNOWN. An ordinary document Current GET or a new POST is not restoration recovery.

Use the same server-only sandbox key/profile binding and retirement rules as `private-source139-journey.md`: native Company, credential, field masks and C7 stay authoritative. Cancel outstanding requests and discard the prior session's intentions on Company/credential changes or teardown. An aborted wait does not undo a dispatched effect. The SDK writes no body, PII, secret, cursor or receipt to disk and provides no alternative ledger or issuer.

Two HTTP fake causal cases and compile-only conditional/mode boundaries are prepared, unexecuted. They cover lost Apply → exact Original202 while Current differs, physical error paging, exact CSV bytes, a stale cursor conflict, unsafe counter rejection, and lost Restore without GET/POST recovery. They do not certify native permissions, sandbox installation, database state or live delivery. No tests, build, install, real API, database action, publication or push was performed by this producer.
