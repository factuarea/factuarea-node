
Native human Meta contract (Source batch80)
==========================================

This extension implements the seven carriers in NativeMetaHumanSurfaceCatalog::v1 and the Root-qualified OpenAPI registry. Every carrier uses operation crm_connections.configure, fine scope crm_connections:write and OAuth consent scope crm_connections.write. Client support describes the Source contract; Root's OAuth emission/current entitlement qualification remains separate, with release gates OFF and the global matrix unratified. No live Meta grant, external App Review or activated ingestion is claimed.

Paths below are relative to /v1/crm/connections/meta-lead-ads:

| Native operationId | Method/path | Carrier |
| --- | --- | --- |
| prepareCrmMetaOAuth | POST /oauth/prepare | Command |
| completeCrmMetaOAuth | POST /oauth/complete | Command |
| listCrmMetaConnectionOptions | GET /options | Query |
| getCrmMetaMapping | GET /{connectionUuid}/mappings/{formUuid} | Query |
| inspectCrmMetaMapping | POST /{connectionUuid}/mappings/{formUuid}/inspect | Query |
| publishCrmMetaMapping | PUT /{connectionUuid}/mappings/{formUuid} | Command |
| publishCrmMetaConsent | POST /{connectionUuid}/consent | Command |

Connection/form are actual lowercase UUIDv7; credential is the original UUIDv4 or UUIDv7. External Page/form/app IDs remain decimal strings of 1–32 digits. No company, billing actor, environment, scope, credential family, Review approval or C7 authorization belongs in input JSON. Authentication derives the current server context.

OAuth prepare requires exactly {page_id,confirmed:true}; OAuth complete requires exactly {state,code} from the actual human browser callback. Code is nonempty, at most 8192 UTF-8 bytes, with no ASCII control/space or DEL. The returned state and authorization URL are opaque original values: no generated callback, verifier/challenge, client ID, code, refresh family or claimed Meta PKCE support. OAuth responses are direct objects. Installation status credentials_installed only means the original encrypted credential committed; mapping and consent are independent actions. Returned Meta scopes preserve their actual order and include the native six-permission union (ads_management, leads_retrieval, pages_manage_ads, pages_manage_metadata, pages_read_engagement, pages_show_list), allowing further actual native scope strings without expansion. These external permissions are distinct from Factuarea scopes.

Options and get mapping have no body or query. Inspect requires exactly {credential_uuid,remote_form_id}; its data projection retains actual Fields object/property/list order, checksum and CAS. expected_mapping_version:null and expected_consent_version:null are explicit native absence values, never client defaults. Inspect app_review remains {available:false,reason:"app_review_evidence_unavailable"}; metadata grants no capability.

Mapping publication requires exactly {credential_uuid,remote_form_id,mapping,expected_mapping_version,expected_publication_version,fields_snapshot_checksum,confirmed:true}. Mapping entries have exactly remote_name,target,type,field_version,required,options. Empty options are {}, never []. Basic name/email/phone/mobile/company_name/notes targets require type text, null field_version and {}. Actual published custom Fields use their UUIDv7, positive version, native type and real option UUIDs; select/multi permit actual option mappings. No schema or mapping choice is guessed. The server verifies full required-field/domain coverage and stored CAS, and a changed mapping invalidates prior consent/configuration.

Consent requires exactly {credential_uuid,grants:[{stream:actualFormUuid,actions:["read"|"ingest"]}],expected_consent_version,confirmed:true}, with nonempty unique streams/actions. No grant is added implicitly. The current external Review reader is unavailable and the native request returns a closed rejection; the client neither autoapproves nor switches to a synthetic success. The Source future consent_published projection is decoded only if an actual canonical native issuer returns it; this is no present activation claim.

Other responses retain their original {data:projection} envelope in rawBody/RawBody. Native identity in inspect/mapping must match the requested connection/form/credential/remote form. Source unknown keys, invalid types, invented Review and changed bindings fail closed.

Each method performs one explicit operation. No automatic refresh, retry after 401/409/429/503/timeout, redirect, OAuth completion, mapping publication, consent publication, capture activation or recovery request follows it. No generic Idempotency-Key is generated. Unknown command outcomes remain unconfirmed; inspect POST remains a failed query. Errors retain only closed status/reason/request ID/Retry-After/unconfirmed facts, with no raw provider response, answers, code/state or credentials. A caller must retain the original human input and decide the next native observation explicitly.

Validation here is isolated offline SDK/CLI delta coverage only. The PHP application, SQL, global gates, installed/published package and live external account have not been exercised. Historical CRM-OAUTH-ORIGINALS.md and prior WhatsApp/original Source are frozen independently.

Node Source use
---------------

The new standalone resource is src/resources/crmMetaNativeBatch80.ts; its seven public methods have the exact operationId names above and accept AbortSignal. Construct with one actual apiKey or oauthBearer string/provider. A provider supplies only the current native bearer per dispatch, with no refresh/replay policy. Human request JSON is captured before asynchronous provider resolution and validated again after serialization. Response data is deeply frozen, and rawBody retains the entire exact native JSON response including Fields order.

CAS versions use positive safe integers up to Number.MAX_SAFE_INTEGER. Larger native integers fail closed because JavaScript's JSON number cannot preserve them; no decimal-string coercion or rounded CAS is sent. External IDs always remain strings. This handwritten server-side resource uses Node UTF-8 byte checks.

Public entrypoint Source example (no installed/published package claim):

    import { CrmMetaNativeBatch80 } from "../src/index.js";
    const meta = new CrmMetaNativeBatch80({
      oauthBearer: () => {
        const token = process.env.FACTUAREA_OAUTH_BEARER;
        if (!token) throw new Error("Current native OAuth bearer is required.");
        return token;
      },
    });
    const current = await meta.listCrmMetaConnectionOptions();

Root-authorized registration exports the resource and all closed DTOs/constants from src/index.ts. The new test imports that actual public Source entrypoint. No src/client.ts convenience property or package build/install/publication is claimed.

Directed proof: vitest run test/crm-meta-native-batch80.test.ts and tsc --noEmit with strict NodeNext flags for only the resource, its new test and imported native auth boundary.

