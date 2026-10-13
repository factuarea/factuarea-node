Native WhatsApp conversation preparation and original recovery

The current native catalog admits these conversation operations through an actual API key. It does not emit OAuth conversation grants. These clients do not turn OAuth tokens into API keys or infer conversations.read/write. Current OAuth credential context and the four CRM originals remain available through their existing native OAuth API.

| Method | Native v1 path | operationId | Native operation | Fine scope |
| --- | --- | --- | --- | --- |
| GET | /v1/crm/conversation/{conversation}/messages/{message}/whatsapp-cloud/preparation | prepareCrmWhatsAppMessage | conversations.send | conversations:write |
| POST | /v1/crm/conversation/{conversation}/messages/{message}/whatsapp-cloud/send | sendCrmWhatsAppMessage | conversations.send | conversations:write |
| GET | /v1/crm/conversation/{conversation}/messages/{message}/whatsapp-cloud/original | getCrmWhatsAppMessageOriginal | conversations.get | conversations:read |

Conversation, message and effect identifiers are real native UUIDv7. Preparation sends purpose contact_request or marketing and an optional explicit template selection: id, name, language, category and parameters. The server validates the live approved template, consent, inbound window, current company/actor/credential/environment/C7 and record permissions. A preparation token contains a server seal; it is not a client permission or family claim.

SEND retains exactly seven JSON keys: conversation_id, effect_id, expected_version, message_version, purpose, template (explicit null or the full selection), preparation_token. Message text and phone numbers remain server-owned. The first UTF-8 JSON wire is captured once, including whitespace, key order and Unicode. No HTTP Idempotency-Key is generated: the sealed native effect identity is the ledger key. SEND disables automatic retries and redirects. A timeout, transport failure, 5xx or malformed success is unconfirmed; preserve the intent and use GET original. A second SEND of that retained effect is rejected locally even after a failed or unconfirmed outcome.

GET original sends only original_wire, URL-encoded from the exact first public POST bytes, with an empty body and no key header. The returned conversation_id/message_id/effect_id, original_wire_hash and preparation_digest must match the intent. Its factual state is not_found, confirmed, unconfirmed or failed. not_found has a null receipt; the other states retain a matching receipt with status, provider_message_id, submitted_at and reason_code. Confirmed means provider transport acceptance; it does not establish delivery or reading.

The original owner requires the exact current credential UUID and C7 binding. It does not grant visibility to a different OAuth refresh successor UUID or another API key through a family adapter. Revalidation is an explicit GET with the same preparation token, effect, purpose and template; it cannot create a replacement effect or enable replay. No client automatically refreshes, revalidates, re-prepares or resends after an uncertain result.

Generated files and frozen OpenAPI generator snapshots are unchanged. These handwritten models and route methods follow the native Source descriptors and closed schemas; this delta does not claim a package release or full CRM inventory certification.

Node usage

```ts
const sdk = new Factuarea({ apiKey: process.env.FACTUAREA_API_KEY! });
const preparation = (await sdk.whatsapp.prepareCrmWhatsAppMessage(conversationId, messageId, "contact_request", { signal })).data.data;
const intent = sdk.whatsapp.prepareSend(preparation);
// Persist sdk.whatsapp.exportIntent(intent) privately before one explicit SEND.
// Catch WhatsAppSendUnconfirmedError and retain its intent/requestId.
const receipt = await sdk.whatsapp.sendCrmWhatsAppMessage(intent, signal);
const original = await sdk.whatsapp.getCrmWhatsAppMessageOriginal(intent, signal);
// Optional explicit revalidation: same issued preparation; does not enable another SEND.
await sdk.whatsapp.prepareCrmWhatsAppMessage(conversationId, messageId, "contact_request", { previous: preparation, signal });
```

Preparation and intent objects are frozen and bound to this resource instance and its current HTTP authority fingerprint. Persist exportIntent(intent) in an application-owned private durable store. After restart, restoreOriginal(checkpoint) validates the retained preparation/first wire/hash and the exact current credential/server/version fingerprint; it permits GET recovery and explicit revalidation only. Restoring a checkpoint always blocks SEND, even when its saved dispatched flag predates the original request. The four existing CRM reads also have named getters: getLeadCreateOriginal, getOpportunityCreateOriginal, getOpportunityStageOriginal and getActivityCreateOriginal.
