# Native KnowledgeBase and administrative HelpCenter SDK delivery

This Source extension adds exactly 28 real operations: KnowledgeBase 23 and PublicHelpCenter 5. `client.crm.knowledgeArticles` and `client.crm.publicHelpCenters` expose the actual native paths, operation IDs, closed bodies and response envelopes. `CRM_OPERATIONS` now describes all 77 operations, including every required scope from the native arrays. The public help-center group is the authenticated administrative surface; its five methods require both `customer_service:write` and `public_help_centers:write`.

`spec/crm-native77.json` is byte-identical to the frozen native contract: SHA256 `4a2cb151faef526aa8c8fd26c29a1d3f6acd019335e13b058b86671f40eb609f`, 77 operations, 66 paths and 106 schemas. Generation verifies this hash and confirms that every Source49 operation and schema is unchanged. `spec/crm-native.json`, `spec/crm-native-source.json` and the historical Source49 validation record remain intact. `spec/crm-native77-source.json` records the new handler mappings and native read-only proof. The producer recorded zero SQL/PDO and no endpoint/business/test execution; persisted activation remains false and its 3,559-file input freeze is unchanged. This package remains version 0.6.0 with the established `Factuarea-Version: 2026-06-01` default.

All 11 new writes and their 11 GET receipt methods require a caller-supplied `idempotencyKey`. Persist the reviewed body, entity IDs, original CAS and key before dispatch. KnowledgeBase's nine closed write schemas have confirmation metadata but no `confirmed` field, so their configuration also requires local `humanConfirmed: true`; this acknowledgement never becomes a wire field or authority grant. PublicHelpCenter's two bodies require native `confirmed: true`. No wrapper assigns entity IDs, replaces versions, adds actor/Company values or generates a replacement key for these operations.

```ts
const originalKey = persistedIntent.idempotencyKey;
try {
  const saved = await client.crm.knowledgeArticles.save(
    persistedIntent.articleId,
    persistedIntent.body,
    { idempotencyKey: originalKey, humanConfirmed: true },
  );
  host.recordOriginalReceipt(saved);
} catch (error) {
  if (!(error instanceof CrmUnconfirmedWriteError)) throw error;
  // GET only: a failed recovery leaves the original intention pending.
  const receipt = await client.crm.knowledgeArticles.receiptSave({
    idempotencyKey: error.idempotencyKey,
    onResponse: ({ requestId, headers }) => {
      host.recordReceiptContext(requestId, headers.get("Idempotent-Replayed"));
    },
  });
  host.recordOriginalReceipt(receipt);
}
```

The complete server-side persistence/recovery recipe is in `examples/crm-knowledge-server.ts`. A native 403/404/409 during recovery remains a typed server error; an absent or ambiguous receipt never means that retrying the command is authorized. Recovery applies current credential, tenant/realm, scope and masks, and preserves the original receipt rather than replacing it with the current entity head. The SDK's static catalogue grants no runtime access.

Every new CommandHandler write makes one attempt, including explicit client/per-call retry overrides. Lost transport/body reads, cancellation after dispatch, 5xx and unreadable/mismatched successful receipt envelopes raise `CrmUnconfirmedWriteError` with the original operation ID/key. Before-dispatch cancellation remains `ConnectionError`. Native multi-field 422 messages, 403/404/409, request IDs, Retry-After and current metadata remain available through the existing core errors and `rawResponse`.

Article/revision/suggestion/category snapshots preserve fields omitted by current masks and native nullable fields. Category creation omits `id` and uses `expected_version: null`; editing requires the existing ID and original category/taxonomy versions. Public-center creation omits/nulls `id` with CAS zero; editing supplies its original ID/CAS. The explicit `KnowledgeCategorySaveIntent` and `PublicHelpCenterPublishIntent` unions preserve native conditional schema branches that the TypeScript generator cannot fully express. JavaScript numeric CAS must fit `Number.isSafeInteger`; the new wrappers reject unsafe intent/response versions instead of forwarding or returning a rounded value. Wider native integer CAS values require a transport with exact large-integer support.

Knowledge search returns `CrmKnowledgePage`, retaining native `data.items`, `total`, `page` and `per_page`, with `getNextPage()`, iteration and `toArray()`. Subsequent pages preserve query, locale, headers, cancellation and response callbacks. Versions, categories and suggestions retain their native bodies without an unrelated pagination envelope.

Validation for this group is recorded separately in `docs/CRM_NATIVE77_VALIDATION.json`: only the new directed runtime file and compile-only contracts are executed, followed by ESM/CJS build and a private clean installed-consumer check. The previous 125 tests are retained and are not replayed. Mocks establish SDK behavior; native two-tenant HTTP journeys, ratification, activation, package publication and coordinated release remain pending. No app/DB/Docker/native export is executed by this SDK delivery. Root owns commit/push and existing PR 28.
