# Native sandbox journey and unknown outcomes

`examples/crm-native-journey140.ts` builds on SDK139 commit `66d4ae782e9330469e847f0fccd35e4ba18d9459`. Its private Source139 Opportunity/Activity writers and readers are generated from the actual native OpenAPI SHA `438b12b53be7ae7535cd6c85ba7dea06c76d84a33024db0e0232ac8ba279be63`; typed Lead writers remain the existing SDK native77 surface. No producer140 descriptive ABI replaces that exported input. The example imports the same SDK client and never performs I/O merely by being imported.

Supply `FACTUAREA_API_KEY` from a server secret store, or explicitly call `readSandboxKeyFromStdin()` for one piped key and pass the result to `openSandboxJourney(secret)`. Keys must use the SDK's `fact_test_` sandbox prefix. Set `FACTUAREA_BASE_URL` to the explicit native v1 base URL and `FACTUAREA_SANDBOX_COMPANY_ID` to a currently authorized UUIDv7 profile. The client pins `X-Active-Profile` for every read and write. That header requests the Company's context; native credential ownership, scope, membership, field masks and current C7 remain server decisions. A Company identifier or a sandbox prefix grants no access. Do not put credentials in arguments, URLs, example payloads, browser bundles or logs.

The host supplies typed Lead inputs, retained per-step keys and a `ConfirmHumanReview` callback backed by its real human review UI. The callback receives the frozen body, Company, key, SHA-256 and CAS. The example neither implements the host's approval UI nor claims to verify a human from a boolean. Store the original key and exact body in the host's existing private intent mechanism before dispatch; the example's ephemeral dispatch latch creates no durable ledger or native effect reservation. It never manufactures an entity UUID, schema, grant or receipt.

```ts
const journey = openSandboxJourney();
const result = await journey.runJourney(
  {
    lead: authorizedLeadInput,
    opportunity: authorizedOpportunityInput, // actual pipeline/stage UUIDs and string amount/currency
    activity: authorizedActivityInput, // actual type, timezone and optional native UTC due_at
    keys: retainedStepKeys, // distinct keys saved by the host before each dispatch
  },
  humanReview
);
if (result.state === "confirmed") {
  const changed = await journey.updateOpportunityOnce(
    result.opportunity.id,
    authorizedOpportunityChanges,
    retainedUpdateKey,
    humanReview
  );
  // Handle the returned union explicitly in the host; UNKNOWN stops progression.
}
// Host identity listeners call this immediately, then drop retained bodies and this instance.
journey.retire("company_changed");
```

`runJourney` dispatches Lead creation, then native Opportunity creation with that confirmed Lead identity, then native Activity creation targeting that confirmed Opportunity. Each step freezes its typed native body and awaits human review. Server-reserved Opportunity/Activity identities come from actual receipts. Unknown outcomes stop before the next step. Money remains a decimal string with its native currency; timezone and UTC due dates use the generated native Activity contract without local conversion or fabricated choices. Lead conversion to a fiscal Contact is not used as an Opportunity alias.

Each creation dispatches once. A lost response invokes its actual `source.leads`, `source.opportunities` or `source.activities` `getCreateOriginal` GET with the same key and SHA-256 of the SDK's exact JSON body bytes. `pending`, `in_progress`, `unconfirmed`, `missing`, unknown future values, unreadable receipts and absent Original bytes stop as `unknown`. A confirmed Original supplies immutable first-response bytes; only its native identity is inspected (Activity uses the native confirmed `activity_id` receipt). Money and decimal text are not converted, and current C7 is not parsed or treated as a reusable permission. Further recovery calls remain GET-only; no success is inferred from a current lookup, and a missing receipt never authorizes another POST.

`updateLeadOnce`, `updateOpportunityOnce` and `updateActivityOnce` read their actual current version, freeze that `expected_version`, obtain human review, and reread immediately before PATCH. The native Activity detail's nullable `activity` must be available before review or write. A changed head returns `needs_human_review` with the original draft/CAS intact. A native 409 also refreshes the current representation for the human and returns that state. No helper substitutes a newer CAS and retries. A lost PATCH response stops `unknown`: this mounted selection has no Original for those generic updates. A creation receipt or the Opportunity stage receipt cannot establish a different update. All native validation, permission, rate-limit and transport errors otherwise propagate through the existing typed error hierarchy, with request IDs and field issues intact; avoid logging raw error/response objects or user data.

`readCreationOriginal` and `recoverCreation` also accept a retained intention from the native host, for the same bound Company, and perform only the real Original GET. Generated Opportunity/Activity writers use the literal singular routes `/crm/opportunity` and `/crm/crmactivity`, `redirect: "error"` and `maxRetries: 0` on the canonical transport. A redirect is not a confirmed receipt and cannot carry the request body or credentials to a different endpoint. Generic updates without Original remain the stated recovery limit; Import Apply/Current and Document Restore still need the next actual native export. There is no raw-HTTP or manual-schema workaround.

Company or credential changes and host teardown retire the instance and abort active requests. Retired instances reject subsequent work and reject a response received after retirement; aborting a request does not prove a dispatched effect was undone. Use a fresh isolated instance for the new identity, discard the previous in-memory intentions, and let the native API decide whether any separately authorized Original read is admissible. The recipe never switches a live client to another Company.

Source is prepared only. No example, external API, build, suite, install, sandbox seed, database action or publication was run for this delivery. Root owns native execution, compatibility and release evidence; this example does not close that pending evidence.
