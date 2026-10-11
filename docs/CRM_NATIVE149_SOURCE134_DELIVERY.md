# Native149 Stage, Bulk and Document Restore Original

Private Source134 SDK consumers are generated from Root's actual Native149 attempt6 PASS artifact, SHA256 `3667e01b82dea255c23b2eecb80e6e600baa445b5b7a2beb5a65eb978a1fc073`, with 967 operations and 372 native carriers. The exact consumer manifest SHA is `653247d4492095fb40e06c36e20a61ec4e0ba32165d0f393378eeffe9872d901`; catalog SHA is `f033c9debb1e41c21bba79bb57de9ff3a23370befdc1aa13a4e7e48b653dbcd3`. Root's durable manifest records freeze151 and causal154/156 receipts. This native profile remains unpublished, unratified, delivery OFF and capabilities empty. No operation metadata or local acknowledgement grants native permission.

The repository baseline supplied by Root is `eaecc739682f339cbf9d7aff43f5c14d521e1eff`, branch `feature/dev2-node-entity-export110`, package `@factuarea/sdk`0.6.0, Node>=20, existing ESM/CJS configuration. New source lives in `src/NativeCrm134`; `client.crm.native134` uses the same canonical authenticated HttpClient as `client.crm.source`. Existing Source139/143 spec pins, types, classes, generator, runtime transport and prior four HTTP greens are preserved without replay. The Source132 unexported Restore draft remains historical and untouched.

## Actual methods and scopes

| SDK method                                   | Native operationId                        | Native scope / OAuth scope                          | Behavior                                                            |
| -------------------------------------------- | ----------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------- |
| `crm.native134.stages.list`                  | `listServiceStages`                       | `customer_service:read` / `customer_service.read`   | Current authorized numbered stage catalog                           |
| `crm.native134.stages.update`                | `updateServiceStage`                      | `customer_service:write` / `customer_service.write` | One human-acknowledged PATCH with stage/pipeline CAS                |
| `crm.native134.stages.getOriginal`           | `getServiceStageOriginal`                 | `customer_service:write` / `customer_service.write` | Immutable Original using literal key and normalized fingerprint     |
| `crm.native134.bulk.getOptions`              | `getServiceTicketBulkOptions`             | `customer_service:read` / `customer_service.read`   | Current active tag options and opaque authorization version         |
| `crm.native134.bulk.apply`                   | `applyServiceTicketBulkAction`            | `customer_service:write` / `customer_service.write` | One POST, native per-item confirmed/rejected/unknown results        |
| `crm.native134.bulk.getItemOriginal`         | `getOriginalServiceTicketBulkItem`        | `customer_service:write` / `customer_service.write` | Separate GET for the retained ticket, action, CAS and action fields |
| `crm.native134.documents.getRestoreOriginal` | `crmGetCommercialDocumentRestoreOriginal` | `crm_documents:read` / `crm_documents.read`         | Document/version/literal-key GET, confirmed or unknown              |

Stage administration additionally requires the current native Company scope, manageAll, literal `customer_service:manage_all` and C7. Restore Original requires current restore permission, documentary fields and retained private content in addition to its declared read scope. Bulk options require current tag field read access, and tag writes need independent current edit permission. The SDK never substitutes a catalog response, `authorization_version`, local body hash or helper state for that authority. Native 401/403/404/409/422/429 errors remain the existing typed SDK hierarchy, including field errors and Retry-After.

Generated DTOs preserve strict native action/state unions, UUID strings, omitted/null boundaries, native safe-integer checks and closed response shapes. Unknown or malformed success representations fail closed; a malformed write receipt raises `CrmUnconfirmedWriteError`. Schema validation is a transport codec only. Company, actor, credential, sandbox, C7, issuer, claims and native admission remain server decisions. The SDK cannot represent native integers beyond JavaScript's safe range and never rounds their values. The projected schemas preserve the original large integer tokens; Restore preparation also requires expected+1 to remain exact.

## Retain once and recover by GET

Use `prepareStageUpdate`, `prepareBulkAction` or `prepareDocumentRestore` on `crm.native134` with the actual reviewed body, exact retained native key and host Company/credential session AbortSignal. Body bytes and a local SHA stay in memory. Each intention allows exactly one `dispatch({ humanConfirmed: true })`, invoked after explicit human review. That flag is a local acknowledgement, never a native grant. All new native requests preserve the actual no-automatic-retry policy; writes use the existing no-redirect transport. No helper writes key/body/PII/receipt/secret to disk or logs.

After a response loss, global error or unknown result, call the intention's separate `readOriginal()`. Dispatch errors preserve the native typed error and leave the intention uncertain. A global Bulk403 or409 can follow partial work: it never proves that every selected ticket was rejected. Received means an HTTP representation arrived, not that all effects were confirmed. There is no redispatch method and no new intention or fresh CAS/key is created automatically.

Stage recovery uses SHA256 of the actual normalized seven-field `ConfirmedIdentityReplay::canonicalJson` object: stage_uuid, pipeline_uuid, both observed versions, unchanged name bytes, mapped_status and wip_limit. UUIDs normalize as the native owner does; keys sort by string, Unicode/slash encoding and line-separator escaping follow the owner. The local raw-body SHA is deliberately not used as this fingerprint. Native absent/ambiguous Original remains409. `stagePages()` walks the actual current catalog and reauthorizes every numbered GET; that catalog is never completion proof.

Bulk recovery preserves every selected ticket/CAS and exact action payload. `readOriginal()` queries the retained items individually; `getItemOriginal(index)` recovers one retained selection index. Assign null maps to the native textual query value `null`; empty tags map to the literal JSON list `[]`; tags preserve their list and native UUID normalization. Results retain the native `confirmed|unknown` state and `can_retry:false`. An absent Original remains unknown. No global batch receipt or Current mutation-result endpoint is invented; `getOptions` is only the real current tag catalog.

Document restoration reuses `crm.source.documents.restore`, with actual Native149 POST validation only: closed `{ expected_version, confirmed:true }`. No replacement POST wrapper is generated. The factory validates its native receipt and then binds recovery to `crm.native134.documents.getRestoreOriginal(document, { expected_version }, { idempotencyKey })`. Recovery sends no body, hash, effect, key query or administrative selector. Confirmed contains the original expected+1 receipt; unknown has a null original. Existing `crm.source.documents.getCurrent` remains a separate authorized document read, never recovery evidence.

Abort the host session on Company/profile/credential changes or teardown; the intention retires, aborts pending waits and discards retained bytes. Cancellation does not undo a dispatched native effect. The host must obtain a new current read and new explicit human review before any separate intention, after reconciling the old one. No persistent intention store, credential duplicate, native ledger, activation or external delivery is added.

## Reproduce generation from the actual Root artifact

The naming-only selection is pinned to the exact consumer manifest and artifact. The generator validates Root's actual PASS receipt, native profile/carrier membership, paths/methods/scopes and local reference closure. The seven methods and the additional Restore POST validation schema are copied from the actual export; no manual schema or design substitute is accepted.

```sh
node scripts/generate-native-crm134.mjs ACTUAL_CONSUMER_MANIFEST149 NAMING_SELECTION149
openapi-ts -f openapi-native-crm134.config.ts
```

The existing cached `@hey-api/openapi-ts`0.98.1 was used without installation. Root owns canonical OLD mounting and Git. This source handoff records generation and one changed-only syntax/format pass separately. No SDK tests, typecheck/build, app/runtime/browser/DB, clean installation, external API, publication or Git command was run. Native149 export PASS is producer evidence only; it does not rerun or extend the previous four SDK HTTP greens. Original release evidence3.1 remains partial pending Root integration/commit and actual compatibility/installation proof; verification/readiness tasks remain open.
