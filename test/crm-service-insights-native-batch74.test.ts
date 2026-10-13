import { describe, expect, it } from "vitest";
import { ConnectionError, Factuarea, FactuareaError, decodeCrmServiceInsightDrill } from "../src/index.js";
import type { CrmServiceInsightDrill, CrmServiceInsightDrillParameters, CrmServiceInsightsConfig, CrmServiceInsightsV1Paths } from "../src/index.js";

const start = "2026-10-01T00:00:00.000001Z";
const end = "2026-10-02T00:00:00.000001Z";
const asOf = "2026-10-10T14:00:00.123456Z";
const hash = "a".repeat(64);
const agentId = "550e8400-e29b-41d4-a716-446655440000";
const teamId = "019a0000-0000-7000-8000-000000000001";
const id = (value: number) => `019a0000-0000-7000-8000-${String(value).padStart(12, "0")}`;
const paths: CrmServiceInsightsV1Paths = { getServiceInsights: "/crm/service-insights", getServiceMetrics: "/crm/service-insights/service-metrics", getServiceInsightDrillThrough: "/crm/service-insights/drill" };
const parameters: CrmServiceInsightDrillParameters = { start, end, clock_mode: "business", metric: "frt", as_of: asOf, predicate_hash: hash, agent_id: agentId, team_id: teamId };
const ticket = (value: number) => ({ id: id(value), version: 5, cycle: 2, label: null, status: null, sample_count: 1 });
const page = (number: number, total = 3, value = number): CrmServiceInsightDrill => ({ metric: "frt", as_of: asOf,
  authorization_version: `current-c7-page-${number}`, predicate_hash: hash, total, page: number, per_page: 1,
  items: number <= total ? [ticket(value)] : [] });
const response = (data: unknown, request = "native-page") => Response.json({ data }, { headers: { "X-Request-Id": request, "Cache-Control": "private, no-store" } });
function sdk(fetch: typeof globalThis.fetch): Factuarea {
  return new Factuarea({ apiKey: "fact_test_synthetic_service_insights74", baseUrl: "https://sdk-boundary.invalid/v1", maxRetries: 0, timeout: 1000, fetch });
}

describe("ServiceInsights74 factual native pagination", () => {
  it("uses the actual three GET routes through the existing client factory and configured credential", async () => {
    const calls: string[] = [];
    const row = { eligible_count: 0, sample_count: 0, contributor_count: 0, mean_microseconds: null, median_microseconds: null, value_count: null, compliant_count: null, missing_count: 0, masked: false };
    const resource = sdk(async (input, init) => {
      const url = new URL(String(input)); calls.push(url.pathname);
      expect(init?.method).toBe("GET"); expect(init?.body).toBeUndefined();
      expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer fact_test_synthetic_service_insights74");
      expect(new Headers(init?.headers).has("Idempotency-Key")).toBe(false);
      if (url.pathname.endsWith("/drill")) return response(page(1, 0));
      if (url.pathname.endsWith("/service-metrics")) return response({ selection: { start, end, clock_mode: "natural", agent_id: null, team_id: null, status: null },
        cohort_basis: "ticket_created_at", cycle_basis: "current_cycle", as_of: asOf, authorization_version: "current-c7", predicate_hash: hash, cohort_count: 0,
        metrics: { frt: row, nrt: row, mttr: row, backlog: row, sla_compliance: row } });
      return response({ metric: "csat", metric_version: 1, cohort_start: start, cohort_end: end, cohort_basis: "original_closed_at", cycle_policy: "each_closure_participant",
        clock_mode: "not_applicable", invited: 0, answered: 0, mean: null, median: null, masked_fields: [], authorization_version: "current-c7", predicate_hash: hash });
    }).crmServiceInsights(paths);
    await resource.getServiceInsights({ start, end });
    await resource.getServiceMetrics({ start, end, clock_mode: "natural" });
    const empty = await resource.getServiceInsightDrillThrough({ ...parameters, per_page: 1 });
    expect(await empty.toArray()).toEqual([]);
    expect(calls).toEqual(["/v1/crm/service-insights", "/v1/crm/service-insights/service-metrics", "/v1/crm/service-insights/drill"]);
  });

  it("snapshots route bindings at composition instead of redirecting later reads through a mutated paths object", async () => {
    const mutable = { ...paths };
    const resource = sdk(async (input) => { expect(new URL(String(input)).pathname).toBe("/v1/crm/service-insights/drill"); return response(page(1, 1)); }).crmServiceInsights(mutable);
    mutable.getServiceInsightDrillThrough = "/unrelated-read";
    await resource.getServiceInsightDrillThrough({ ...parameters, per_page: 1 });
  });

  it.each([
    { ...page(1), items: [] }, { ...page(1), total: 0 },
    { ...page(3), per_page: 2, items: [ticket(3)] }, { ...page(4), items: [ticket(4)] },
    { ...page(1), total: 2, per_page: 2, items: [ticket(1)] },
  ])("rejects a page whose contributor count differs from the native slice ($page/$total)", (data) => {
    expect(() => decodeCrmServiceInsightDrill({ data })).toThrow(TypeError);
  });

  it("accepts the actual partial final slice and an empty out-of-range native page", () => {
    const final = { ...page(2, 3), per_page: 2, items: [ticket(3)] };
    expect(decodeCrmServiceInsightDrill({ data: final }).data.items).toEqual([ticket(3)]);
    expect(decodeCrmServiceInsightDrill({ data: page(4) }).data.items).toEqual([]);
  });

  it.each([2, 4])("rejects a changed contributor total %s while the original predicate is unchanged", async (total) => {
    let calls = 0;
    const resource = sdk(async () => response(++calls === 1 ? page(1) : page(2, total), `request-${calls}`)).crmServiceInsights(paths);
    const original = await resource.getServiceInsightDrillThrough({ ...parameters, page: 1, per_page: 1 });
    await expect(original.getNextPage()).rejects.toMatchObject({ code: "crm_service_insights_projection_unreadable", requestId: "request-2" });
    expect(calls).toBe(2);
  });

  it("rejects a repeated native ticket on adjacent pages before yielding it twice", async () => {
    let calls = 0;
    const resource = sdk(async () => response(page(++calls, 2, 1), `request-${calls}`)).crmServiceInsights(paths);
    const original = await resource.getServiceInsightDrillThrough({ ...parameters, page: 1, per_page: 1 });
    const seen: string[] = [];
    await expect((async () => { for await (const row of original) seen.push(row.id); })()).rejects.toBeInstanceOf(ConnectionError);
    expect(seen).toEqual([id(1)]); expect(calls).toBe(2);
  });

  it("retains the traversal identities across three manual next-page calls without a global dedupe store", async () => {
    let calls = 0;
    const resource = sdk(async () => response(page(++calls, 3, calls === 3 ? 1 : calls), `request-${calls}`)).crmServiceInsights(paths);
    const first = await resource.getServiceInsightDrillThrough({ ...parameters, page: 1, per_page: 1 });
    const second = await first.getNextPage();
    expect(second?.payload.page).toBe(2); expect(second?.payload.authorization_version).toBe("current-c7-page-2");
    await expect(second!.getNextPage()).rejects.toMatchObject({ code: "crm_service_insights_projection_unreadable", requestId: "request-3" });
    expect(calls).toBe(3);
  });

  it("preserves original filters, headers, size, offsets and rows when public view objects are edited", async () => {
    let calls = 0;
    const originalAbort = new AbortController();
    const config: CrmServiceInsightsConfig = { signal: originalAbort.signal, headers: { "X-Active-Profile": agentId }, maxRetries: 0 };
    const resource = sdk(async (input, init) => {
      calls++; const query = new URL(String(input)).searchParams;
      expect(query.get("page")).toBe(String(calls)); expect(query.get("per_page")).toBe("1");
      expect(query.get("as_of")).toBe(asOf); expect(query.get("predicate_hash")).toBe(hash);
      expect(query.get("agent_id")).toBe(agentId); expect(query.get("team_id")).toBe(teamId);
      expect(new Headers(init?.headers).get("X-Active-Profile")).toBe(agentId);
      return response(page(calls, 2));
    }).crmServiceInsights(paths);
    const original = await resource.getServiceInsightDrillThrough({ ...parameters, page: 1, per_page: 1 }, config);
    original.payload.total = 0; original.payload.page = 88; original.payload.per_page = 100; original.payload.items[0]!.id = id(99);
    original.meta.current_page = 99; original.meta.per_page = 77; original.meta.total = 0;
    config.headers!["X-Active-Profile"] = id(88); config.maxRetries = 8;
    const unrelated = new AbortController(); unrelated.abort(); config.signal = unrelated.signal;
    expect((await original.toArray()).map((row) => row.id)).toEqual([id(1), id(2)]);
    expect(calls).toBe(2);
  });

  it("permits independent traversals while preserving fresh native authority and masked row nulls", async () => {
    let calls = 0;
    const resource = sdk(async (input) => { calls++; return response(page(Number(new URL(String(input)).searchParams.get("page")), 2)); }).crmServiceInsights(paths);
    const first = await resource.getServiceInsightDrillThrough({ ...parameters, page: 1, per_page: 1 });
    const second = await first.getNextPage();
    expect(second?.payload.authorization_version).toBe("current-c7-page-2");
    expect(second?.payload.items[0]).toMatchObject({ label: null, status: null });
    expect(await second?.getNextPage()).toBeNull();
    expect((await first.toArray()).map((row) => row.id)).toEqual([id(1), id(2)]);
    expect((await first.toArray()).map((row) => row.id)).toEqual([id(1), id(2)]);
    expect(calls).toBe(4);
  });

  it.each([403, 409, 429, 503])("stops iteration with the current native %s error without returning a partial success", async (status) => {
    let calls = 0;
    const native = { error: { code: "native_service_read", subcode: "selection_changed", message: "Native refusal" } };
    const resource = sdk(async () => ++calls === 1 ? response(page(1, 2))
      : Response.json(native, { status, headers: { "X-Request-Id": "current-denial", "Retry-After": "30" } })).crmServiceInsights(paths);
    const original = await resource.getServiceInsightDrillThrough({ ...parameters, page: 1, per_page: 1 });
    const error = await original.toArray().catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(FactuareaError); expect(error).toMatchObject({ status, code: "native_service_read", requestId: "current-denial", rawResponse: native });
    expect(calls).toBe(2);
  });

  it("keeps the original abort signal effective for subsequent native reads", async () => {
    let calls = 0; const abort = new AbortController();
    const resource = sdk(async () => { calls++; return response(page(1, 2)); }).crmServiceInsights(paths);
    const original = await resource.getServiceInsightDrillThrough({ ...parameters, page: 1, per_page: 1 }, { signal: abort.signal });
    abort.abort("stop iteration");
    await expect(original.getNextPage()).rejects.toBeInstanceOf(ConnectionError);
    expect(calls).toBe(1);
  });
});
