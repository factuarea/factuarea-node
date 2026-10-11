# Native CRM entity exports

`Factuarea.crm.entityExports` uses the existing authenticated `HttpClient`,
typed API errors and `BinaryResponse`. It wraps the mounted CRM158 native API;
the generated layer and its current OpenAPI pins are unchanged. This wrapper
does not claim that the pinned spec has been regenerated against Source110.

The six owners are `organization`, `person`, `lead`, `opportunity`, `activity`
and `service_ticket`. Activity can filter `type: "note"`; there is no seventh
standalone note owner. Types tie each selection's native filters and ordered
scalar columns to that owner. No page/cursor/limit or synthetic saved-view
selection is accepted. Published columns describe possible fields; the current
server's scopes, C7, record scope and field masks decide access at every step.

```ts
const exports = factuarea.crm.entityExports;
const intent = exports.prepare(
  {
    entity_type: "lead",
    filters: { status: ["open"], has_email: true },
    columns: ["uuid", "estimated_value_amount", "estimated_value_currency"],
  },
  { id: originalUuidV7, idempotencyKey: originalKey }
);

// Review this immutable selection with the human before setting this flag.
const accepted = await exports.request(intent, { humanConfirmed: true });
const original = await exports.getOriginal(intent);
if (original.data.status === "ready") {
  const csv = await exports.download(intent);
  await writeFile(original.data.filename, csv.toBuffer());
}
```

Prepare retains a deep frozen JSON snapshot, the lowercase UUIDv7, the exact
raw request and the original printable ASCII key. Changing caller-owned arrays
or objects cannot change the prepared request. It performs no HTTP call and
does not confirm the request: dispatch explicitly requires
`humanConfirmed: true` and sends native `confirmed: true`.

POST `/v1/crm/entity-exports` accepts exactly `id`, `entity_type`, `filters`,
`columns`, `confirmed`. Its `Idempotency-Key` is stable, and `maxRetries` is
always zero even if the client has a retry policy. Preserve the intent before
dispatch. A network failure, lost response, server failure or unreadable
acceptance raises the existing `CrmUnconfirmedWriteError`. Recover with
`getOriginal(intent)` or `getOriginal(intent.id)`, never a new POST. This
resource prevents a second dispatch of an already attempted id. A 404 Original
does not authorize automatic resending. A separate selection requires a new id,
new key and new explicit human acknowledgement.

`getOriginal` and `status` are the same GET
`/v1/crm/entity-exports/{id}`, without body, query or queue effect. They do not
automatically poll. POST processing is HTTP202; terminal/replayed POST states
and Original GET are HTTP200. Only ready has native filename and exact byte
size; acceptance never means the file exists. Original decoding verifies the
same id and, when an intent is supplied, the same entity type. It rejects
private/unpublished fields rather than exposing a selection, proof or URL.

`download` rereads current Original, requires ready, then GETs
`/v1/crm/entity-exports/{id}/download`. It returns the canonical `BinaryResponse`
for `text/csv; charset=utf-8`, preserving bytes and headers. The received size
must equal the current native ready metadata. The SDK performs no CSV encoding,
decimal parsing, money aggregation or currency conversion. Select the native
amount and currency columns together; opportunity's native weighted value also
remains in the binary. No delivery state is cached or stored by the resource.

Contact timestamps and Activity due timestamps use exact UTC seconds; Lead
accepts native UTC fractional seconds; Opportunity uses native calendar dates.
Those lower and upper bounds are inclusive. Service ticket `period` preserves
RFC3339 offset instants with inclusive `from`, exclusive `until`; explicit
null assignee/team filters differ from omission. Configuration typed plans are
preserved as supplied native JSON/string. The SDK does not fabricate their
current definition, operator catalog, normalization or field permissions;
native validation errors use the existing typed error hierarchy.

All three endpoints require native `crm_imports:export` (OAuth
`crm_imports.export`) and their distinct current native operations
`crm_imports.export`, `crm_imports.export_original`,
`crm_imports.export_download`. Keys, UUIDs, confirmation and old ready metadata
grant no authority. Discard intents and caller-held bytes when changing Company
or credentials; cancel outstanding requests via `signal`. Canonical auth is
resolved on each read/download and native authority is checked again.

`intent.rawRequest` contains the selection and may contain personal data.
Keep it only in the caller's active workflow and do not log or persist it.
The intent's ordinary JSON serialization exposes only its opaque id. Errors
introduced by this wrapper contain no raw selection, bytes or credentials.

Two causal HTTP-fake cases are prepared in
`test/crm-entity-exports-native110.test.ts`: immutable confirmed native currency
download, and lost-response Original recovery with current credential denial.
They have not been executed by this producer. Delivery remains OFF; these
wrappers do not ratify CRM, install capabilities or publish the SDK.
