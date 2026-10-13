import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { AuthenticationError, ConnectionError, CrmOriginalContractError, CrmOriginalIntent, Factuarea, ServerError, CRM_OAUTH_SCOPES } from "../src/index.js";
const uuid = "01900000-0000-7000-8000-000000000001";
const firstBody = ' \n{"amount":"999999999999999999.99","note":"Àngela 山","optional":null}\n';
const exactOriginal = ' { "data": { "id": "'+uuid+'", "amount": "999999999999999999.99", "optional": null } }\n';
const hash = createHash("sha256").update(firstBody).digest("hex");
function receipt(state = "confirmed", sha = hash): unknown { return { data: { state, original_body_sha256: sha, original_response: state === "confirmed" ? { status: 201, body: exactOriginal } : null }, meta: { authorization_version: "current-revision" } }; }
function sdk(fetch: typeof globalThis.fetch, oauthBearer: string | (() => string) = "native-access-token"): Factuarea { return new Factuarea({ oauthBearer, fetch, baseUrl: "https://sdk.invalid/v1", maxRetries: 9 }); }

describe("native OAuth CRM current context and original recovery", () => {
  it("uses actual bearer and the real credential-context scope/operation", async () => {
    let calls = 0;
    const client = sdk(async (url, init) => {
      calls++;
      expect(String(url)).toBe("https://sdk.invalid/v1/crm/credential-context");
      expect(init?.method).toBe("GET"); expect(init?.body).toBeUndefined(); expect(init?.redirect).toBe("error");
      expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer native-access-token");
      expect(new Headers(init?.headers).has("X-API-Key")).toBe(false);
      return Response.json({ data: { company_id: uuid, credential_id: uuid, client_id: uuid, environment: "test", scopes: ["crm_access_context:read", "contacts:delete", "invoices:send", "recurring_invoices:transition", "*"], authorization_version: "owner-current" } });
    });
    const context = (await client.crmOriginals.credentialContext()).data.data;
    expect(context.environment).toBe("test");
    expect(context.scopes).toEqual(["crm_access_context:read", "contacts:delete", "invoices:send", "recurring_invoices:transition", "*"]);
    expect(client.environment).toBe("unknown"); expect(calls).toBe(1);
    expect(CRM_OAUTH_SCOPES.credentialContext).toEqual({ operation: "crm_access_context.show", fine: "crm_access_context:read", oauth: "crm_access_context.read" });
  });
  for (const [op, path] of Object.entries({ leadCreate: "/crm/leads/create/original", opportunityCreate: "/crm/opportunity/create/original", opportunityStage: "/crm/opportunity/"+uuid+"/stage/original", activityCreate: "/crm/crmactivity/create/original" })) {
    it("retains exact first wire bytes and raw key for "+op, async () => {
      const intent = CrmOriginalIntent.capture(op as Parameters<typeof CrmOriginalIntent.capture>[0], "raw original key", firstBody, op === "opportunityStage" ? uuid.toUpperCase() : undefined);
      const client = sdk(async (url, init) => {
        const actual = new URL(String(url));
        expect(actual.pathname).toBe("/v1"+path);
        expect([...actual.searchParams]).toEqual([["original_body_sha256", hash]]);
        expect(init?.method).toBe("GET"); expect(init?.body).toBeUndefined(); expect(init?.redirect).toBe("error");
        expect(new Headers(init?.headers).get("Idempotency-Key")).toBe("raw original key");
        return Response.json(receipt());
      });
      const result = await client.crmOriginals.recover(intent);
      expect(intent.firstBody).toBe(firstBody); expect(intent.originalBodySha256).toBe(hash);
      expect(Object.isFrozen(intent)).toBe(true); expect(result.data.data.original_response?.body).toBe(exactOriginal);
    });
  }
  it("sends an OAuth mutation once and then recovers with a fresh token and the exact body", async () => {
    let token = "issued-parent", providerCalls = 0, mutations = 0, reads = 0;
    const intent = CrmOriginalIntent.capture("leadCreate", "first-key", firstBody);
    const client = sdk(async (_url, init) => {
      if (init?.method === "POST") {
        mutations++; expect(init.body).toBe(intent.firstBody); expect(init.redirect).toBe("error");
        expect(new Headers(init.headers).get("Authorization")).toBe("Bearer issued-parent");
        return Response.json({ error: { message: "unknown" } }, { status: 503 });
      }
      reads++; expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer authentic-descendant");
      return Response.json(receipt());
    }, () => { providerCalls++; return token; });
    await expect(client.http.request({ method: "POST", path: "/crm/leads", rawBody: intent.firstBody, idempotencyKey: intent.idempotencyKey, maxRetries: 9 })).rejects.toBeInstanceOf(ServerError);
    token = "authentic-descendant";
    expect((await client.crmOriginals.recover(intent)).data.data.state).toBe("confirmed");
    expect({ mutations, reads, providerCalls }).toEqual({ mutations: 1, reads: 1, providerCalls: 2 });
  });
  for (const state of ["pending", "in_progress", "unconfirmed", "missing"]) {
    it("returns "+state+" without a write or synthetic confirmation", async () => {
      let calls = 0;
      const client = sdk(async (_url, init) => { calls++; expect(init?.method).toBe("GET"); return Response.json(receipt(state)); });
      const result = await client.crmOriginals.recover(CrmOriginalIntent.capture("activityCreate", "key", firstBody));
      expect(result.data.data.state).toBe(state); expect(result.data.data.original_response).toBeNull(); expect(calls).toBe(1);
    });
  }
  it("does not retry, refresh or write after 401 or a network failure", async () => {
    for (const network of [false, true]) {
      let calls = 0;
      const client = sdk(async () => { calls++; if (network) throw new TypeError("connection lost"); return Response.json({ error: { message: "revoked" } }, { status: 401 }); });
      await expect(client.crmOriginals.recover(CrmOriginalIntent.capture("leadCreate", "key", firstBody))).rejects.toBeInstanceOf(network ? ConnectionError : AuthenticationError);
      expect(calls).toBe(1);
    }
  });
  it("rejects foreign hashes, malformed confirmation and unconfirmed bodies", async () => {
    for (const wire of [receipt("confirmed", "f".repeat(64)), { data: { state: "confirmed", original_body_sha256: hash, original_response: { status: 201, body: "not JSON" } }, meta: { authorization_version: "v" } }, { data: { state: "missing", original_body_sha256: hash, original_response: { status: 201, body: "{}" } }, meta: { authorization_version: "v" } }]) {
      await expect(sdk(async () => Response.json(wire)).crmOriginals.recover(CrmOriginalIntent.capture("leadCreate", "key", firstBody))).rejects.toBeInstanceOf(CrmOriginalContractError);
    }
  });
  it("keeps actual API-key recovery and prevents API keys masquerading as OAuth", async () => {
    const client = new Factuarea({ apiKey: "fact_test_actual_key", fetch: async (_url, init) => { expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer fact_test_actual_key"); return Response.json(receipt("missing")); } });
    expect((await client.crmOriginals.recover(CrmOriginalIntent.capture("leadCreate", "key", firstBody))).data.data.state).toBe("missing");
    await expect(client.crmOriginals.credentialContext()).rejects.toThrow("native OAuth");
    expect(() => new Factuarea({ oauthBearer: "fact_test_actual_key" })).toThrow("native OAuth");
    expect(() => new Factuarea({ apiKey: "fact_test_actual_key", oauthBearer: "token" })).toThrow("exactly one");
  });
  it("fails before dispatch when authentication/body sources or normalized keys would change", async () => {
    let calls = 0;
    const client = new Factuarea({ oauthBearer: "native-token", defaultHeaders: { authorization: "Bearer other" }, fetch: async () => { calls++; return Response.json({}); } });
    await expect(client.crmOriginals.credentialContext()).rejects.toThrow("cannot be overridden"); expect(calls).toBe(0);
    for (const key of [" key ", "\n", "x".repeat(256)]) expect(() => CrmOriginalIntent.capture("leadCreate", key, firstBody)).toThrow();
    expect(() => CrmOriginalIntent.capture("opportunityStage", "key", firstBody)).toThrow();
    expect(() => CrmOriginalIntent.capture("leadCreate", "key", firstBody, uuid)).toThrow();
  });
  it.each(["leadCreate", "opportunityCreate", "opportunityStage", "activityCreate"] as const)("named native original getter %s preserves exact wire SHA and key", async operation => {
    let calls=0;
    const client=sdk(async (url,init)=>{calls++;expect(init?.method).toBe("GET");expect(new URL(String(url)).searchParams.get("original_body_sha256")).toBe(hash);expect(new Headers(init?.headers).get("Idempotency-Key")).toBe("raw key");return Response.json(receipt());});
    const original=operation==="leadCreate"?await client.crmOriginals.getLeadCreateOriginal("raw key",firstBody):operation==="opportunityCreate"?await client.crmOriginals.getOpportunityCreateOriginal("raw key",firstBody):operation==="opportunityStage"?await client.crmOriginals.getOpportunityStageOriginal(uuid,"raw key",firstBody):await client.crmOriginals.getActivityCreateOriginal("raw key",firstBody);
    expect(original.data.data.state).toBe("confirmed");expect(calls).toBe(1);
  });
});
