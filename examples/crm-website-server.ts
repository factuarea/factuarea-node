import { Factuarea, CrmOriginalIntent, CrmCommercialWriteUnconfirmedError, ValidationError, AuthenticationError, ConflictError, RateLimitError, decodeLeadResult, type CrmLeadCreate } from "../src/index.js";
export interface WebsiteLeadCheckpoint { readonly idempotencyKey: string; readonly firstBody: string }
/** Implement reserve atomically in the application's private durable store. Never send these private bodies to the browser. */
export interface WebsiteLeadIntentStore {
  reserve(submission: string, proposed: WebsiteLeadCheckpoint): Promise<{ readonly fresh: boolean; readonly checkpoint: WebsiteLeadCheckpoint }>;
}
export function createWebsiteLeadHandler(store: WebsiteLeadIntentStore, env: NodeJS.ProcessEnv = process.env, client?: Factuarea): (request: Request) => Promise<Response> {
  if (typeof window !== "undefined") throw new TypeError("This example must run on the server.");
  if (client === undefined && env.FACTUAREA_OAUTH_BEARER && env.FACTUAREA_API_KEY) throw new TypeError("Choose one native server credential source.");
  const sdk = client ?? new Factuarea(env.FACTUAREA_OAUTH_BEARER ? { oauthBearer: env.FACTUAREA_OAUTH_BEARER } : { apiKey: env.FACTUAREA_API_KEY });
  return async request => {
    if (request.method !== "POST") return Response.json({ error: "method_not_allowed" }, { status: 405 });
    const submission = request.headers.get("Idempotency-Key");
    if (!submission) return Response.json({ error: "submission_key_required" }, { status: 422 });
    let input: unknown;
    try { input = await request.json(); } catch { return Response.json({ error: "invalid_json" }, { status: 422 }); }
    if (!input || typeof input !== "object" || Array.isArray(input) || Object.keys(input).some(k => !["name", "email", "phone", "mobile"].includes(k))) return Response.json({ error: "invalid_fields" }, { status: 422 });
    let intent: CrmOriginalIntent;
    try { intent = sdk.crm.prepareLeadCreate(submission, input as CrmLeadCreate); } catch { return Response.json({ error: "invalid_fields" }, { status: 422 }); }
    const reserved = await store.reserve(submission, { idempotencyKey: intent.idempotencyKey, firstBody: intent.firstBody });
    if (reserved.checkpoint.idempotencyKey !== intent.idempotencyKey || reserved.checkpoint.firstBody !== intent.firstBody) return Response.json({ error: "submission_content_changed" }, { status: 409 });
    try {
      if (!reserved.fresh) {
        const original = await sdk.crmOriginals.recover(CrmOriginalIntent.capture("leadCreate", reserved.checkpoint.idempotencyKey, reserved.checkpoint.firstBody), request.signal);
        if (original.data.data.state !== "confirmed" || original.data.data.original_response === null) return Response.json({ state: "unconfirmed", submission }, { status: 202 });
        const result = decodeLeadResult(JSON.parse(original.data.data.original_response.body) as unknown);
        return Response.json({ state: "confirmed", lead_id: result.id }, { status: 200 });
      }
      const result = await sdk.crm.createLead(intent, { signal: request.signal });
      return Response.json({ state: "confirmed", lead_id: result.data.data.id }, { status: 201 });
    } catch (error) {
      if (error instanceof CrmCommercialWriteUnconfirmedError) return Response.json({ state: "unconfirmed", submission }, { status: 202 });
      if (error instanceof ValidationError) return Response.json({ error: "validation_failed", fields: error.fields }, { status: 422 });
      if (error instanceof AuthenticationError) return Response.json({ error: "authorization_required" }, { status: error.status === 401 ? 401 : 403 });
      if (error instanceof ConflictError) return Response.json({ error: "version_conflict" }, { status: 409 });
      if (error instanceof RateLimitError) return Response.json({ error: "rate_limited" }, { status: 429, headers: error.retryAfter === undefined ? {} : { "Retry-After": String(error.retryAfter) } });
      // A failed original read never permits a second POST. The durable reservation is retained.
      return Response.json({ state: "unconfirmed", submission }, { status: 202 });
    }
  };
}
