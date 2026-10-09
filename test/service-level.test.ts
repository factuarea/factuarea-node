import { describe, expect, it } from "vitest";
import {
  ConflictError,
  Factuarea,
  ServerError,
  ServiceLevelUnconfirmedError,
  type ConfigureServiceSlaRequest,
  type PauseServiceSlaRequest,
  type ResumeServiceSlaRequest,
  type ServiceLevelWriteConfig,
  type ServiceSlaProjectedClock,
  type ServiceSlaStatus,
  type UpdateServiceCalendarRequest,
} from "../src/index.js";

const BASE_URL = "https://api.factuarea.test/v1";
const ticket = "0199152d-525d-7000-8000-000000000011";
const cycle = "0199152d-525d-7000-8000-000000000012";
const policy = "0199152d-525d-7000-8000-000000000013";
const key = "service-sla-original-001";
const receipt = { data: { id: cycle, version: 2 } };

const configure: ConfigureServiceSlaRequest = {
  cycle_id: null, expected_version: null, policy_id: null, policy_version: 1,
  first_response_minutes: 30, first_response_risk_minutes: null,
  next_response_minutes: 30, next_response_risk_minutes: 10,
  resolution_minutes: 120, resolution_risk_minutes: null,
  pause_first_response: false, pause_next_response: true, pause_resolution: true,
  calendar_id: null, calendar_version: null,
};
const pause: PauseServiceSlaRequest = {
  cycle_id: cycle, expected_version: 1, reason: "manual_review",
  first_response: false, next_response: true, resolution: true,
};
const resume: ResumeServiceSlaRequest = {
  cycle_id: cycle, expected_version: 1, reason: "manual_review",
};
const calendar: UpdateServiceCalendarRequest = {
  id: null, expected_version: null, name: "Support", timezone: "Europe/Madrid",
  mode: "business", windows: [{ weekday: 1, start_minute: 540, end_minute: 1020 }],
  holidays: ["2026-10-12"], exceptions: [{ date: "2026-10-13", windows: [] }],
};

function sdk(fetch: typeof globalThis.fetch): Factuarea {
  return new Factuarea({
    apiKey: "fact_test_sdk_fixture", baseUrl: BASE_URL, fetch, maxRetries: 9,
    defaultHeaders: { "X-Company-Id": "7" },
  });
}

describe("native ServiceLevel adapter", () => {
  it("uses all three read routes and preserves native page filters, envelopes and Company headers", async () => {
    const clock: ServiceSlaProjectedClock = {
      started_at: null, stopped_at: null, satisfied: false, paused: false,
      elapsed_microseconds: 0, target_minutes: 30, at_risk_minutes: null,
      policy_id: policy, policy_version: 1, elapsed_calendar_version: null,
      deadline: null, deadline_is_provisional: false, state: "not_started",
    };
    const status: ServiceSlaStatus = {
      id: cycle, subject_id: ticket, version: 1, cycle_number: 1, policy_id: policy,
      policy_version: 1, calendar_id: null, calendar_version: null,
      as_of: "2026-10-09T10:00:00.000000Z", terminal: false, state: "on_track",
      public_customer_messages: 0, public_agent_responses: 0,
      next_response_history: [], clocks: { first_response: clock, next_response: clock, resolution: clock },
    };
    const history = { data: { subject_id: ticket, items: [], total: 0, page: 2, per_page: 10 } };
    const calendars = { data: { items: [], total: 0, page: 3, per_page: 5 } };
    const paths: string[] = [];
    const client = sdk(async (input, init) => {
      const url = new URL(String(input));
      paths.push(url.pathname + url.search);
      expect(init?.method).toBe("GET");
      expect(init?.body).toBeUndefined();
      expect(new Headers(init?.headers).get("X-Company-Id")).toBe("7");
      return Response.json(url.pathname.endsWith("history") ? history
        : url.pathname.endsWith("service-calendars") ? calendars : { data: status });
    });
    expect(await client.serviceLevel.status(ticket)).toEqual({ data: status });
    expect(await client.serviceLevel.history(ticket, { page: 2, per_page: 10 })).toEqual(history);
    expect(await client.serviceLevel.calendars({ page: 3, per_page: 5 })).toEqual(calendars);
    expect(paths).toEqual([
      `/v1/crm/service-tickets/${ticket}/sla`,
      `/v1/crm/service-tickets/${ticket}/sla/history?page=2&per_page=10`,
      "/v1/crm/service-calendars?page=3&per_page=5",
    ]);
  });

  it("sends all four native writes unchanged, with nullable server identities, CAS and the original key", async () => {
    const requests: { path: string; method: string | undefined; body: unknown }[] = [];
    const client = sdk(async (input, init) => {
      const headers = new Headers(init?.headers);
      expect(headers.get("Idempotency-Key")).toBe(key);
      expect(headers.get("X-Company-Id")).toBe("7");
      requests.push({ path: new URL(String(input)).pathname, method: init?.method, body: JSON.parse(String(init?.body)) });
      return Response.json(receipt);
    });
    const config = { idempotencyKey: key };
    expect(await client.serviceLevel.configure(ticket, configure, config)).toEqual(receipt);
    expect(await client.serviceLevel.pause(ticket, pause, config)).toEqual(receipt);
    expect(await client.serviceLevel.resume(ticket, resume, config)).toEqual(receipt);
    expect(await client.serviceLevel.updateCalendar(calendar, config)).toEqual(receipt);
    expect(requests).toEqual([
      { path: `/v1/crm/service-tickets/${ticket}/sla`, method: "PUT", body: configure },
      { path: `/v1/crm/service-tickets/${ticket}/sla/pause`, method: "POST", body: pause },
      { path: `/v1/crm/service-tickets/${ticket}/sla/resume`, method: "POST", body: resume },
      { path: "/v1/crm/service-calendars", method: "PUT", body: calendar },
    ]);
  });

  it("does not retry a lost response, and permits explicit recovery with the identical original key and payload", async () => {
    const requests: { body: unknown; key: string | null }[] = [];
    const client = sdk(async (_input, init) => {
      requests.push({ body: JSON.parse(String(init?.body)), key: new Headers(init?.headers).get("Idempotency-Key") });
      if (requests.length === 1) throw new TypeError("connection lost after send");
      return Response.json(receipt);
    });
    const config = { idempotencyKey: key, maxRetries: 12 } as unknown as ServiceLevelWriteConfig;
    await expect(client.serviceLevel.configure(ticket, configure, config)).rejects.toMatchObject({
      name: "ServiceLevelUnconfirmedError", operation: "configure", idempotencyKey: key,
    });
    expect(requests).toHaveLength(1);
    expect(await client.serviceLevel.configure(ticket, configure, config)).toEqual(receipt);
    expect(requests).toEqual([{ body: configure, key }, { body: configure, key }]);
  });

  it.each([
    [202, { data: { status: "queued" } }],
    [200, { data: { status: "queued" } }],
    [200, { data: { id: cycle, version: 0 } }],
    [200, { data: { id: 7, version: 1 } }],
    [200, { data: { id: cycle, version: 1.5 } }],
    [204, null],
  ] as const)("does not confirm a missing or invalid native receipt (%s)", async (status, body) => {
    let calls = 0;
    const client = sdk(async () => {
      calls++;
      return status === 204 ? new Response(null, { status }) : Response.json(body, { status });
    });
    await expect(client.serviceLevel.updateCalendar(calendar, { idempotencyKey: key })).rejects.toBeInstanceOf(ServiceLevelUnconfirmedError);
    expect(calls).toBe(1);
  });

  it.each([
    [409, "crm_version_conflict", "service_level_version_conflict", ConflictError],
    [409, "crm_version_conflict", "service_level_result_unconfirmed", ConflictError],
    [500, "internal_error", "producer_unavailable", ServerError],
  ] as const)("retains the native error class, status and subcode without retrying (%s, %s, %s)", async (status, code, subcode, ErrorClass) => {
    let calls = 0;
    const client = sdk(async () => {
      calls++;
      return Response.json({ error: { type: "api_error", code, subcode, message: "No disponible" } }, { status });
    });
    const error = await client.serviceLevel.resume(ticket, resume, { idempotencyKey: key }).catch((error: unknown) => error);
    expect(error).toBeInstanceOf(ErrorClass);
    expect(error).toMatchObject({ status, code, subcode });
    expect(calls).toBe(1);
  });

  it("does not confirm a receipt that changes an existing cycle identity", async () => {
    const client = sdk(async () => Response.json({ data: { id: policy, version: 2 } }));
    await expect(client.serviceLevel.pause(ticket, pause, { idempotencyKey: key })).rejects.toBeInstanceOf(ServiceLevelUnconfirmedError);
  });

  it.each(["", "invalid\nkey", "key\n", "key\r", "á", "a".repeat(256)])("rejects an unusable original idempotency key before sending", async (idempotencyKey) => {
    let calls = 0;
    const client = sdk(async () => { calls++; return Response.json(receipt); });
    await expect(client.serviceLevel.pause(ticket, pause, { idempotencyKey })).rejects.toBeInstanceOf(TypeError);
    expect(calls).toBe(0);
  });
});

// Compile-only checks run with the repository's strict typecheck; no effects.
function compileOnlyContract(client: Factuarea): void {
  // @ts-expect-error the original key is required for every SLA write
  void client.serviceLevel.configure(ticket, configure);
  // @ts-expect-error caller retry overrides cannot make SLA writes auto-retry
  const unsafeConfig: ServiceLevelWriteConfig = { idempotencyKey: key, maxRetries: 2 };
  // @ts-expect-error CAS versions keep the native numeric type
  const invalidResume: ResumeServiceSlaRequest = { ...resume, expected_version: "1" };
  // @ts-expect-error Company authority is not accepted in the public body
  const foreignAuthority: ConfigureServiceSlaRequest = { ...configure, company_id: 8 };
  void [unsafeConfig, invalidResume, foreignAuthority];
}
void compileOnlyContract;
