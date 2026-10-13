import { describe, expect, it } from "vitest";
import { ConnectionError, CrmServiceInsightsDrillPage, CrmServiceInsightsResource, Factuarea, FactuareaError, createCrmServiceInsightsResource,
  decodeCrmServiceCsatMetric, decodeCrmServiceInsightDrill, decodeCrmServiceInsightMetrics } from "../src/index.js";
import type { CrmServiceInsightsV1Paths, CrmServiceInsightMetricValues } from "../src/index.js";

const start = "2026-10-01T00:00:00.000001Z";
const end = "2026-10-02T00:00:00.000001Z";
const asOf = "2026-10-10T14:00:00.123456Z";
const hash = "a".repeat(64);
const agentId = "550e8400-e29b-41d4-a716-446655440000";
const teamId = "018f1111-2222-7333-8444-555555555555";
const ticketId = "018f1111-2222-7333-8444-666666666666";
const otherTicketId = "018f1111-2222-7333-8444-777777777777";
const cohort = { start, end };
const selection = { ...cohort, clock_mode: "business" as const, agent_id: agentId, team_id: teamId, status: "closed" as const };
const csat = { metric: "csat", metric_version: 1, cohort_start: start, cohort_end: end, cohort_basis: "original_closed_at", cycle_policy: "each_closure_participant",
  clock_mode: "not_applicable", invited: 8, answered: null, mean: null, median: null, masked_fields: ["answered_at", "rating"], authorization_version: "current-c7-csat", predicate_hash: hash };
const metric: CrmServiceInsightMetricValues = { eligible_count: 8, sample_count: 4, contributor_count: 3, mean_microseconds: "9007199254740993.123456", median_microseconds: "500000.000000",
  value_count: null, compliant_count: null, missing_count: 1, masked: false };
const masked: CrmServiceInsightMetricValues = { eligible_count: 8, sample_count: null, contributor_count: null, mean_microseconds: null, median_microseconds: null, value_count: null, compliant_count: null, missing_count: null, masked: true };
const analytics = { selection, cohort_basis: "ticket_created_at", cycle_basis: "current_cycle", as_of: asOf, authorization_version: "current-c7-analytics", predicate_hash: hash, cohort_count: 8,
  metrics: { frt: metric, nrt: { ...metric, sample_count: 7 }, mttr: masked, backlog: { ...metric, mean_microseconds: null, median_microseconds: null, value_count: 3 },
    sla_compliance: { ...metric, mean_microseconds: null, median_microseconds: null, compliant_count: 2 } } };
const ticket = { id: ticketId, version: 5, cycle: 2, label: null, status: null, sample_count: 1 };
const drill = { metric: "frt", as_of: asOf, authorization_version: "current-c7-drill", predicate_hash: hash, total: 1, page: 1, per_page: 25, items: [ticket] };
const parameters = { ...selection, metric: "frt" as const, as_of: asOf, predicate_hash: hash };
// Explicit test-only bindings; this SDK supplies no production URI or native activation.
const paths: CrmServiceInsightsV1Paths = { getServiceInsights: "/configured-insights/csat", getServiceMetrics: "/configured-insights/service-metrics", getServiceInsightDrillThrough: "/configured-insights/drill" };
function sdk(fetch: typeof globalThis.fetch, extra: Partial<ConstructorParameters<typeof Factuarea>[0]> = {}): Factuarea {
  return new Factuarea({ apiKey: "fact_test_synthetic_service_insights", baseUrl: "https://sdk-boundary.invalid/v1", maxRetries: 0, timeout: 1000, fetch, ...extra });
}
function response(data: unknown): Response { return Response.json({ data }, { headers: { "X-Request-Id": "native-service-predicate", "Cache-Control": "private, no-store" } }); }

describe("native ServiceInsights typed projection codecs", () => {
  it("retains native decimal strings and masked nulls without totals, Float, money or masked zero defaults", () => {
    const result = decodeCrmServiceInsightMetrics({ data: analytics });
    expect(result.data.metrics.frt.mean_microseconds).toBe("9007199254740993.123456"); expect(result.data.metrics.mttr).toEqual(masked);
    expect(result.data.metrics.mttr.sample_count).toBeNull(); expect(result.data.metrics.mttr.mean_microseconds).toBeNull();
    expect(result.data).not.toHaveProperty("metric_version"); expect(result.data).not.toHaveProperty("currency");
    expect(decodeCrmServiceCsatMetric({ data: csat }).data).toEqual(csat);
    expect(decodeCrmServiceCsatMetric({ data: csat }).data).not.toHaveProperty("as_of");
    const empty = { ...csat, invited: 0, answered: 0, masked_fields: [] };
    expect(decodeCrmServiceCsatMetric({ data: empty }).data.answered).toBe(0);
    const scored = { ...csat, answered: 6, mean: "4.3333", median: "4.5000", masked_fields: [] };
    expect(decodeCrmServiceCsatMetric({ data: scored }).data.mean).toBe("4.3333");
  });
  it("rejects incompatible CSAT versions/enums/unknown fields and mask leakage", () => {
    const invalid = [{ ...csat, metric_version: 2 }, { ...csat, metric: "nps" }, { ...csat, as_of: asOf }, { ...csat, clock_mode: "business" },
      { ...csat, cohort_basis: "ticket_created_at" }, { ...csat, answered: 0 }, { ...csat, mean: "0.0000" },
      { ...csat, masked_fields: ["contact_email"] }, { ...csat, masked_fields: ["rating", "rating"] }, { ...csat, invited: Number.MAX_SAFE_INTEGER + 1 }];
    for (const data of invalid) expect(() => decodeCrmServiceCsatMetric({ data })).toThrow(TypeError);
    expect(() => decodeCrmServiceCsatMetric({ data: { ...csat, answered: 4, mean: 4.5, median: "4.5000", masked_fields: [] } })).toThrow(TypeError);
    expect(() => decodeCrmServiceCsatMetric({ data: null })).toThrow(TypeError);
  });
  it("requires exact metrics5/native9keys and safe counts, never mixes SPA aliases or fabricated metric versions", () => {
    const invalid: unknown[] = [{ ...analytics, metric_version: 1 }, { ...analytics, metrics: { ...analytics.metrics, revenue: metric } },
      { ...analytics, metrics: { ...analytics.metrics, frt: { ...metric, mean_microseconds: 12.25 } } },
      { ...analytics, metrics: { ...analytics.metrics, frt: { ...metric, mean_microseconds: "12.2500" } } },
      { ...analytics, metrics: { ...analytics.metrics, mttr: { ...masked, missing_count: 0 } } },
      { ...analytics, metrics: { ...analytics.metrics, frt: { ...metric, sample_count: Number.MAX_SAFE_INTEGER + 1 } } },
      { ...analytics, selection: { ...selection, agent_uuid: agentId } }, { ...analytics, metrics: { frt: metric } }];
    for (const data of invalid) expect(() => decodeCrmServiceInsightMetrics({ data })).toThrow(TypeError);
    expect(() => decodeCrmServiceInsightMetrics(analytics)).toThrow(TypeError);
  });
  it("decodes public contributor id/version/cycle and native nullable masks without ticket bodies/visitors", () => {
    expect(decodeCrmServiceInsightDrill({ data: drill }).data.items[0]).toEqual(ticket);
    const invalid = [{ ...drill, items: [{ ...ticket, uuid: ticketId }] }, { ...drill, items: [{ ...ticket, body: "hidden" }] },
      { ...drill, items: [{ ...ticket, label: undefined }] }, { ...drill, items: [{ ...ticket, status: "resolved" }] },
      { ...drill, items: [{ ...ticket, id: agentId }] }, { ...drill, items: [{ ...ticket, sample_count: 0 }] },
      { ...drill, items: [ticket, ticket] }, { ...drill, next_cursor: "fake-cursor" }, { ...drill, predicate_hash: "A".repeat(64) }];
    for (const data of invalid) expect(() => decodeCrmServiceInsightDrill({ data })).toThrow(TypeError);
  });
});

describe("configured ServiceInsights SDK, offline V1 boundary only", () => {
  it("exports a required-path public factory on SAME client with no export/survey/staff fallback", () => {
    const client = sdk(async () => { throw new Error("No dispatch"); });
    expect(client.crmServiceInsights(paths)).toBeInstanceOf(CrmServiceInsightsResource); expect(createCrmServiceInsightsResource(client.http, paths)).toBeInstanceOf(CrmServiceInsightsResource);
    expect(() => client.crmServiceInsights(undefined as never)).toThrow(TypeError);
    expect(() => client.crmServiceInsights({ ...paths, getServiceMetrics: "https://foreign.invalid/insights" })).toThrow(TypeError);
    expect(() => client.crmServiceInsights({ ...paths, issueSurvey: "/service-surveys" } as never)).toThrow(TypeError);
    expect(client.crmServiceInsights(paths)).not.toHaveProperty("export"); expect(client.crmServiceInsights(paths)).not.toHaveProperty("issueSurvey");
    expect(typeof client.crmMailboxWriters).toBe("function"); expect(typeof client.crmBookings).toBe("function");
  });
  it("sends only native GET queries with same bearer/profile/version/hooks and removes unrelated original keys", async () => {
    const calls: string[] = []; const observed: string[] = [];
    const resource = sdk(async (input, init) => {
      const url = new URL(String(input)); const h = new Headers(init?.headers); calls.push(url.pathname);
      expect(init?.method).toBe("GET"); expect(init?.body).toBeUndefined(); expect(h.get("Authorization")).toBe("Bearer fact_test_synthetic_service_insights");
      expect(h.get("Factuarea-Version")).toBe("2026-06-01"); expect(h.get("X-Active-Profile")).toBe(agentId); expect(h.get("Idempotency-Key")).toBeNull();
      expect(h.get("Cookie")).toBeNull(); expect(url.searchParams.get("start")).toBe(start); expect(url.searchParams.get("end")).toBe(end);
      if (url.pathname.endsWith("/drill")) { expect(url.searchParams.get("as_of")).toBe(asOf); expect(url.searchParams.get("predicate_hash")).toBe(hash);
        expect(url.searchParams.has("page")).toBe(false); expect(url.searchParams.has("per_page")).toBe(false); return response(drill); }
      if (url.pathname.endsWith("/service-metrics")) { expect(url.searchParams.get("agent_id")).toBe(agentId); expect(url.searchParams.has("agent_uuid")).toBe(false); return response(analytics); }
      expect([...url.searchParams.keys()]).toEqual(["start", "end"]); return response(csat);
    }, { defaultHeaders: { "IDEMPOTENCY-KEY": "discard-unrelated-key" } }).crmServiceInsights(paths);
    const config = { headers: { "Idempotency-Key": "discard-request-key", "X-Active-Profile": agentId }, onResponse: (r: { requestId: string | null }) => observed.push(r.requestId!) };
    expect((await resource.getServiceInsights(cohort, config)).data.metric_version).toBe(1);
    expect((await resource.getServiceMetrics(selection, config)).data.metrics.frt.mean_microseconds).toBe(metric.mean_microseconds);
    expect(await resource.getServiceInsightDrillThrough(parameters, config)).toBeInstanceOf(CrmServiceInsightsDrillPage);
    expect(calls).toEqual(["/v1/configured-insights/csat", "/v1/configured-insights/service-metrics", "/v1/configured-insights/drill"]);
    expect(observed).toEqual(Array(3).fill("native-service-predicate"));
  });
  it("preserves omitted agent/team/status query filters and actual response nulls without injecting defaults", async () => {
    const resource = sdk(async (input) => {
      const url = new URL(String(input)); expect([...url.searchParams.keys()]).toEqual(["start", "end", "clock_mode"]);
      return response({ ...analytics, selection: { ...cohort, clock_mode: "natural", agent_id: null, team_id: null, status: null } });
    }).crmServiceInsights(paths);
    expect((await resource.getServiceMetrics({ ...cohort, clock_mode: "natural" })).data.selection.agent_id).toBeNull();
  });
  it("uses number-page iteration with exact original as_of/hash and fresh native authority; never cursor or recomputed aggregate", async () => {
    let calls = 0; const seen: string[] = [];
    const resource = sdk(async (input) => {
      calls++; const query = new URL(String(input)).searchParams; const page = Number(query.get("page")); seen.push(query.get("predicate_hash")!);
      expect(query.get("as_of")).toBe(asOf); expect(query.get("per_page")).toBe("1"); expect(query.has("cursor")).toBe(false);
      return response({ ...drill, total: 2, page, per_page: 1, authorization_version: "fresh-page-c7-" + page,
        items: [{ ...ticket, id: page === 1 ? ticketId : otherTicketId }] });
    }).crmServiceInsights(paths);
    const page = await resource.getServiceInsightDrillThrough({ ...parameters, page: 1, per_page: 1 });
    expect(page.payload.authorization_version).toBe("fresh-page-c7-1"); expect(page.requestId).toBe("native-service-predicate");
    expect(page.hasMore).toBe(true); expect((await page.toArray()).map((row) => row.id)).toEqual([ticketId, otherTicketId]);
    expect(seen).toEqual([hash, hash]); expect(calls).toBe(2); expect(page.payload.total).toBe(2);
  });
  it("snapshots caller filters/page and microsecond tuple before async dispatch and next-page retrieval", async () => {
    const mutable = { ...parameters, page: 1, per_page: 1 }; let enter!: () => void; let release!: () => void;
    const entered = new Promise<void>((resolve) => { enter = resolve; }); const pending = new Promise<void>((resolve) => { release = resolve; }); let calls = 0;
    const resource = sdk(async (input) => {
      calls++; const query = new URL(String(input)).searchParams;
      if (calls === 1) { enter(); await pending; } expect(query.get("predicate_hash")).toBe(hash); expect(query.get("agent_id")).toBe(agentId);
      return response({ ...drill, total: 2, page: Number(query.get("page")), per_page: 1, items: [{ ...ticket, id: calls === 1 ? ticketId : otherTicketId }] });
    }).crmServiceInsights(paths);
    const reading = resource.getServiceInsightDrillThrough(mutable); await entered; mutable.predicate_hash = "b".repeat(64); mutable.agent_id = otherTicketId; mutable.page = 3; release();
    const page = await reading; expect((await page.toArray()).map((row) => row.id)).toEqual([ticketId, otherTicketId]); expect(calls).toBe(2);
  });
  it("preserves a one-microsecond cohort and original snapshot, rejecting overflow/range/calendar/truncated precision before send", async () => {
    let calls = 0; const small = { start: "2026-10-01T00:00:00.123456Z", end: "2026-10-01T00:00:00.123457Z" };
    const resource = sdk(async (input) => { calls++; const query = new URL(String(input)).searchParams; expect(query.get("start")).toBe(small.start); return response({ ...csat, cohort_start: small.start, cohort_end: small.end }); }).crmServiceInsights(paths);
    await resource.getServiceInsights(small); expect(calls).toBe(1);
    const invalid = [{ ...cohort, end: start }, { ...cohort, start: "2026-02-30T00:00:00.000000Z" }, { ...cohort, start: start.replace(".000001", "") },
      { ...cohort, end: "2027-10-03T00:00:00.000001Z" }, { ...cohort, start: "2026-10-01T00:00:00.000001+00:00" }];
    for (const query of invalid) await expect(resource.getServiceInsights(query)).rejects.toThrow(TypeError); expect(calls).toBe(1);
  });
  it("rejects null filters, client context, SPA aliases, cursor, unknown metric and invalid pagination before transport", async () => {
    let calls = 0; const resource = sdk(async () => { calls++; throw new Error("No dispatch"); }).crmServiceInsights(paths);
    for (const query of [{ ...selection, agent_id: null }, { ...selection, team_id: null }, { ...selection, status: null }, { ...selection, company_id: 1 }, { ...selection, agent_uuid: agentId }, { ...selection, clock_mode: "calendar" }]) {
      await expect(resource.getServiceMetrics(query as never)).rejects.toThrow(TypeError);
    }
    for (const query of [{ ...parameters, cursor: "fake" }, { ...parameters, metric_version: 1 }, { ...parameters, metric: "money" }, { ...parameters, page: 0 }, { ...parameters, page: 10000000 }, { ...parameters, per_page: 101 }, { ...parameters, page: 1.5 }]) {
      await expect(resource.getServiceInsightDrillThrough(query as never)).rejects.toThrow(TypeError);
    }
    expect(calls).toBe(0);
  });
  it.each([403, 409, 422, 503])("preserves native %s current-field/predicate/privacy failure instead of masking it as available or empty", async (status) => {
    let calls = 0; const native = { error: { code: "native_service_scope", subcode: "selection_changed", param: "predicate_hash", message: "Native refusal" } };
    const resource = sdk(async () => { calls++; return Response.json(native, { status, headers: { "X-Request-Id": "native-refusal" } }); }).crmServiceInsights(paths);
    const error = await resource.getServiceInsightDrillThrough(parameters).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(FactuareaError); expect(error).toMatchObject({ status, code: "native_service_scope", subcode: "selection_changed", param: "predicate_hash", rawResponse: native, requestId: "native-refusal" });
    expect(calls).toBe(1);
  });
  it("rejects different original hash/as_of/metric/page and repeated page responses without silently restarting the cohort", async () => {
    const data = [{ ...drill, predicate_hash: "b".repeat(64) }, { ...drill, as_of: asOf.replace("123456", "123457") }, { ...drill, metric: "nrt" }, { ...drill, page: 2 }, { ...drill, per_page: 26 }];
    let calls = 0; const resource = sdk(async () => response(data[calls++])).crmServiceInsights(paths);
    for (const _ of data) await expect(resource.getServiceInsightDrillThrough(parameters)).rejects.toMatchObject({ code: "crm_service_insights_projection_unreadable" });
    expect(calls).toBe(5);
    let pages = 0; const repeated = sdk(async () => { pages++; return response({ ...drill, total: 2, per_page: 1 }); }).crmServiceInsights(paths);
    const page = await repeated.getServiceInsightDrillThrough({ ...parameters, page: 1, per_page: 1 });
    await expect(page.toArray()).rejects.toMatchObject({ code: "crm_service_insights_projection_unreadable" }); expect(pages).toBe(2);
  });
  it("rejects unrelated cohort/selection and wrong response envelope/status without fallback to SPA/mappers", async () => {
    let calls = 0; const resource = sdk(async () => { calls++; return calls === 1 ? response({ ...csat, cohort_start: start.replace("000001", "000000") })
      : calls === 2 ? response({ ...analytics, selection: { ...selection, agent_id: otherTicketId } }) : Response.json(analytics); }).crmServiceInsights(paths);
    await expect(resource.getServiceInsights(cohort)).rejects.toMatchObject({ code: "crm_service_insights_projection_unreadable" });
    await expect(resource.getServiceMetrics(selection)).rejects.toMatchObject({ code: "crm_service_insights_projection_unreadable" });
    await expect(resource.getServiceMetrics(selection)).rejects.toMatchObject({ code: "crm_service_insights_projection_unreadable" }); expect(calls).toBe(3);
    const wrong = sdk(async () => Response.json({ data: csat }, { status: 202 })).crmServiceInsights(paths);
    await expect(wrong.getServiceInsights(cohort)).rejects.toMatchObject({ code: "crm_service_insights_projection_unreadable" });
  });
  it("pre-aborted query uses native cancellation and never dispatches or produces a dummy analysis", async () => {
    let calls = 0; const abort = new AbortController(); abort.abort("before query"); const resource = sdk(async () => { calls++; throw new Error("No dispatch"); }).crmServiceInsights(paths);
    const error = await resource.getServiceMetrics(selection, { signal: abort.signal }).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(ConnectionError); expect(calls).toBe(0);
  });
});
