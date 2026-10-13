Native OAuth CRM and original recovery

Choose the actual native OAuth bearer credential. API keys continue to use their existing factory/configuration. Never put an API key into the OAuth token option or synthesize a token-family identifier.

| Read | Native operation | Fine scope | OAuth grant |
| --- | --- | --- | --- |
| GET /v1/crm/credential-context | crm_access_context.show | crm_access_context:read | crm_access_context.read |
| GET /v1/crm/leads/create/original | crm_leads.create | crm_leads:write | crm_leads.write |
| GET /v1/crm/opportunity/create/original | crm_opportunities.create | crm_opportunities:write | crm_opportunities.write |
| GET /v1/crm/opportunity/{opportunity}/stage/original | crm_opportunities.move_stage | crm_opportunities:write | crm_opportunities.write |
| GET /v1/crm/crmactivity/create/original | crm_activities.create | crm_activities:write | crm_activities.write |

Credential context requires actual OAuth. It returns native company, credential and client UUIDs, issuer environment, fine scopes and authorization_version. It contains no API-key account projection or client-generated family/permission claims.

Each original GET sends only the original Idempotency-Key and original_body_sha256 query. Retain the exact first UTF-8 JSON object body: whitespace, key order, decimal strings, omitted fields and explicit nulls all contribute to SHA256. Never recompute it from parsed JSON. An opportunity-stage lookup also retains its native opportunity UUID.

The original receipt state is confirmed, pending, in_progress, unconfirmed or missing. Confirmed retains the original 2xx status and exact JSON response body as a string. Every other state retains a null original_response. Receipt validation rejects a different body hash, unknown state or fabricated confirmation. A lookup never generates a new key or emits a mutation, including after 401, 429, timeout, cancellation, lost response or OAuth refresh.

Refresh remains an explicit caller/issuer action. Supply the current access token for the next GET; the server proves completed native refresh ancestry and current authority. A distinct API key remains a real singleton credential and receives no invented OAuth family.

HTTP transports normalize whitespace at the edges of header values. These clients reject such Idempotency-Key inputs before dispatch rather than silently trimming them. Printable ASCII keys of 1–255 bytes with internal spaces are preserved.

Source delta only: generated SDK/CLI files and pinned OpenAPI snapshots are unchanged. The frozen input snapshots predate these routes, so the handwritten route table above is the native Source contract for this delta. Package regeneration, publication and deployment remain separate work.
\nNode usage\n\n\x60\x60\x60ts\nconst sdk = new Factuarea({ oauthBearer: () => currentAccessToken });\nconst context = await sdk.crmOriginals.credentialContext(signal);\nconst wire = '{"name":"First request","optional":null}';\nconst intent = CrmOriginalIntent.capture("leadCreate", "first original key", wire);\n// The first POST uses intent.firstBody as rawBody, the same key, and dispatches once.\ntry {
await sdk.http.request({ method: "POST", path: "/crm/leads", rawBody: intent.firstBody, idempotencyKey: intent.idempotencyKey, signal });\n// Retain intent even if the write fails or its response is lost. A later explicit GET may use a refreshed token.\nconst original = await sdk.crmOriginals.recover(intent, signal);\nconst exactResponseBody = original.data.data.original_response?.body;\n\x60\x60\x60\n\nUse capture operations leadCreate, opportunityCreate, opportunityStage and activityCreate. Only opportunityStage accepts a fourth UUID argument. Every OAuth mutation through the HTTP client disables automatic retries and redirects; maxRetries cannot enable them. API-key retry defaults remain unchanged.\n

Repository recognition (original delivery task1.1)

Actual checkout: /home/nando/Proyectos/factuarea-app-worktrees/dev-2-crm/development/factuarea-node-servicelevel-native. Own branch: feature/dev-2-servicelevel-node-native. Baseline: 78bebb082357f06b777ba90f97286d02904b6a1c.

Loaded workspace AGENTS.md/REMOTE-SETUP.md, app AGENTS.md and applicable backend/contract rules before editing. The three SDK/CLI checkouts contain no local AGENTS.md/CLAUDE.md; inherited workspace instructions apply. PHP also follows docs/REGENERATION.md and confines handwritten code to src/Custom. Tooling: Node >=20; ESM/CJS package; TypeScript ^5.7.3; @hey-api/openapi-ts 0.98.1; build-resources.mjs; Vitest2.1.9.

Frozen generator input: spec/openapi.json; SHA256 4d55aa42a744b7a8fecd890565a5fd31a61aacb4aa16f3fc5bfe256040a30729. Existing generated operations and package versions remain compatible. The native handwritten extension adds current OAuth identity and read-only original recovery without repurposing API-key resolution. No generation, installed package release or publication is claimed by this slice. The five added reads are documented by exact native paths and scopes above.
