import { describe, expect, it, vi } from "vitest";
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
  RateLimitError,
  ValidationError,
} from "../src/core/errors.js";
import {
  CrmCommercialContractError,
  CrmCommercialWriteUnconfirmedError,
} from "../src/crm/commercial/errors.js";
import type {
  CrmOpportunityStage,
  CrmUuid,
} from "../src/crm/commercial/types.js";
import {
  CRM_BOUNDARY_URL,
  boundaryClient,
  boundaryResponse,
  foreignId,
  leadId,
  leadRecord,
  maskedOpportunity,
  opportunityId,
  pipelineId,
  stageId,
} from "./fixtures/crm-client-boundaries.js";

// These are the existing native commercial GET/POST operations. Every request
// uses an injected local transport; no real tenant or credential is contacted.
describe("native CRM UUID and cursor boundaries", () => {
  it.each([
    "123",
    "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    "00000000-0000-0000-0000-000000000000",
    "019AAAAA-AAAA-7AAA-8AAA-AAAAAAAAAAAA",
    `${leadId}/foreign`,
  ])("rejects the invalid entity identity %s before HTTP", async (identity) => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    await expect(
      boundaryClient(fetch).getLead(identity as CrmUuid)
    ).rejects.toBeInstanceOf(CrmCommercialContractError);
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each(["lead", "opportunity"] as const)(
    "rejects a valid but different UUID returned by %s lookup",
    async (entity) => {
      const fetch = vi.fn<typeof globalThis.fetch>(async (url) => {
        expect(String(url)).toBe(
          entity === "lead"
            ? `${CRM_BOUNDARY_URL}/crm/leads/${leadId}`
            : `${CRM_BOUNDARY_URL}/crm/opportunity/${opportunityId}`
        );
        return boundaryResponse(
          entity === "lead"
            ? leadRecord({ id: foreignId })
            : maskedOpportunity({ id: foreignId })
        );
      });
      const client = boundaryClient(fetch);
      await expect(
        entity === "lead"
          ? client.getLead(leadId)
          : client.getOpportunity(opportunityId)
      ).rejects.toBeInstanceOf(CrmCommercialContractError);
      expect(fetch).toHaveBeenCalledTimes(1);
    }
  );

  it("continues an empty authorized page and retains the exact opaque cursor and filters", async () => {
    const urls: URL[] = [];
    const cursor = "signed+cursor/&=? tenant-bound";
    const fetch = vi.fn<typeof globalThis.fetch>(async (url) => {
      urls.push(new URL(String(url)));
      return boundaryResponse({
        data: urls.length === 1 ? [] : [leadRecord()],
        has_more: urls.length === 1,
        next_cursor: urls.length === 1 ? cursor : null,
      });
    });
    const iterator = boundaryClient(fetch).iterateLeads({
      limit: 1,
      search: "original query",
      sort: "-uuid",
      filters: { team_id: foreignId },
    });
    expect((await iterator.next()).value?.id).toBe(leadId);
    expect((await iterator.next()).done).toBe(true);
    expect(urls).toHaveLength(2);
    expect(urls[0]?.searchParams.has("cursor")).toBe(false);
    expect(urls[1]?.searchParams.get("cursor")).toBe(cursor);
    expect(urls[1]?.searchParams.get("search")).toBe("original query");
    expect(urls[1]?.searchParams.get("sort")).toBe("-uuid");
    expect(urls[1]?.searchParams.get("filters")).toBe(
      JSON.stringify({ team_id: foreignId })
    );
    expect(urls.every((url) => !url.searchParams.has("page"))).toBe(true);
  });

  it.each([
    { data: [], has_more: true, next_cursor: null },
    { data: [], has_more: false, next_cursor: "unexpected-continuation" },
    { data: [], has_more: true, next_cursor: "" },
    { data: [], has_more: true, next_cursor: "x".repeat(4097) },
    { data: {}, has_more: false, next_cursor: null },
  ])(
    "rejects a malformed page rather than exposing an empty success %#",
    async (page) => {
      const fetch = vi.fn<typeof globalThis.fetch>(async () =>
        boundaryResponse(page)
      );
      await expect(boundaryClient(fetch).listLeads()).rejects.toBeInstanceOf(
        CrmCommercialContractError
      );
      expect(fetch).toHaveBeenCalledTimes(1);
    }
  );

  it("enforces the explicit page bound before dispatching another continuation", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () =>
      boundaryResponse({
        data: [leadRecord()],
        has_more: true,
        next_cursor: "next-page",
      })
    );
    const iterator = boundaryClient(fetch).iterateLeads({}, {}, 1);
    expect((await iterator.next()).value?.id).toBe(leadId);
    await expect(iterator.next()).rejects.toThrow("explicit page limit");
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe("native CRM CAS and typed failures", () => {
  const stage: CrmOpportunityStage = {
    expected_version: 2,
    target_pipeline_id: pipelineId,
    target_stage_id: stageId,
    expected_definition_version: 0,
  };

  it.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])(
    "rejects unsafe CAS version %s without preparing a dispatch",
    (version) => {
      const fetch = vi.fn<typeof globalThis.fetch>();
      expect(() =>
        boundaryClient(fetch).prepareOpportunityStage(
          opportunityId,
          "cas-invalid",
          {
            ...stage,
            expected_version: version,
          }
        )
      ).toThrow(CrmCommercialContractError);
      expect(fetch).not.toHaveBeenCalled();
    }
  );

  it("keeps the retained CAS body on conflict and never resends the consumed intent", async () => {
    const input = { ...stage };
    const fetch = vi.fn<typeof globalThis.fetch>(async (url, init) => {
      expect(String(url)).toBe(
        `${CRM_BOUNDARY_URL}/crm/opportunity/${opportunityId}/stage`
      );
      expect(init?.method).toBe("POST");
      expect(init?.body).toBe(JSON.stringify(stage));
      expect(new Headers(init?.headers).get("Idempotency-Key")).toBe(
        "original-cas-key"
      );
      return Response.json(
        {
          error: {
            type: "conflict_error",
            code: "crm_opportunity_version_conflict",
            message: "The opportunity version changed.",
            param: "expected_version",
            request_id: "cas-rejected-request",
          },
        },
        { status: 409 }
      );
    });
    const client = boundaryClient(fetch);
    const intent = client.prepareOpportunityStage(
      opportunityId,
      "original-cas-key",
      input
    );
    input.expected_version = 9;
    const error: unknown = await client
      .moveOpportunityStage(intent)
      .catch((value: unknown) => value);
    expect(error).toBeInstanceOf(ConflictError);
    expect(error).toMatchObject({
      code: "crm_opportunity_version_conflict",
      param: "expected_version",
      requestId: "cas-rejected-request",
      status: 409,
    });
    await expect(client.moveOpportunityStage(intent)).rejects.toThrow(
      "original GET recovery only"
    );
    expect(intent.firstBody).toBe(JSON.stringify(stage));
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("retains every native field error and request identity on a rejected stage mutation", async () => {
    const fields = {
      target_stage_id: [
        "Stage is unavailable.",
        "Stage belongs to another pipeline.",
      ],
      expected_definition_version: ["Definition version changed."],
    };
    const fetch = vi.fn<typeof globalThis.fetch>(async () =>
      Response.json(
        {
          error: {
            type: "invalid_request_error",
            code: "parameter_invalid",
            message: "Review the stage selection.",
            param: "target_stage_id",
            details: { field_errors: fields },
          },
        },
        { status: 422, headers: { "X-Request-Id": "validation-request" } }
      )
    );
    const client = boundaryClient(fetch);
    const error: unknown = await client
      .moveOpportunityStage(
        client.prepareOpportunityStage(opportunityId, "validation-key", stage)
      )
      .catch((value: unknown) => value);
    expect(error).toBeInstanceOf(ValidationError);
    if (!(error instanceof ValidationError)) throw error;
    expect(error.fields).toEqual(fields);
    expect(error.requestId).toBe("validation-request");
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it.each([
    { status: 401, code: "api_key_revoked", ErrorClass: AuthenticationError },
    {
      status: 403,
      code: "insufficient_scope",
      ErrorClass: AuthenticationError,
    },
    { status: 404, code: "resource_not_found", ErrorClass: NotFoundError },
    { status: 429, code: "rate_limited", ErrorClass: RateLimitError },
  ])(
    "preserves $status on an authorized-context lookup without automatic retry",
    async (failure) => {
      const fetch = vi.fn<typeof globalThis.fetch>(async () =>
        Response.json(
          { error: { code: failure.code, message: "Lookup unavailable." } },
          {
            status: failure.status,
            headers: {
              "Retry-After": "17",
              "X-Request-Id": "lookup-rejection",
            },
          }
        )
      );
      const error: unknown = await boundaryClient(fetch)
        .getOpportunity(opportunityId)
        .catch((value: unknown) => value);
      expect(error).toBeInstanceOf(failure.ErrorClass);
      expect(error).toMatchObject({
        status: failure.status,
        code: failure.code,
        requestId: "lookup-rejection",
      });
      if (error instanceof RateLimitError) expect(error.retryAfter).toBe(17);
      expect(fetch).toHaveBeenCalledTimes(1);
    }
  );
});

describe("native CRM masks, secrets and tenant isolation", () => {
  it("keeps masked amounts, relationships and history null without filling a visible record", async () => {
    const wire = maskedOpportunity();
    const result = (
      await boundaryClient(async () => boundaryResponse(wire)).getOpportunity(
        opportunityId
      )
    ).data.data;
    expect(result).toEqual(wire);
    expect(result?.amount).toBeNull();
    expect(result?.weighted_value).toBeNull();
    expect(result?.contact_id).toBeNull();
    expect(result?.history).toBeNull();
    expect(Object.hasOwn(result ?? {}, "authorization_version")).toBe(false);
    expect(Object.isFrozen(result)).toBe(true);
  });

  it("accepts an identity-only confirmed receipt without looking up a hidden representation", async () => {
    const receipt = {
      id: leadId,
      confirmed: true,
      representation_available: false,
    };
    const fetch = vi.fn<typeof globalThis.fetch>(async () =>
      boundaryResponse(receipt, 201)
    );
    const client = boundaryClient(fetch);
    const result = await client.createLead(
      client.prepareLeadCreate("masked-create", { name: "Private lead" })
    );
    expect(result.data.data).toEqual(receipt);
    expect(Object.hasOwn(result.data.data, "name")).toBe(false);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("discards transport secrets in an uncertain write while retaining its recovery intent", async () => {
    const secret = "fact_test_private_transport_sentinel";
    const fetch = vi.fn<typeof globalThis.fetch>(async () => {
      throw new Error(
        `Disconnected proxy using Authorization: Bearer ${secret}`
      );
    });
    const client = boundaryClient(fetch, { apiKey: secret });
    const intent = client.prepareLeadCreate("uncertain-secret", {
      name: "Retained lead",
    });
    const error: unknown = await client
      .createLead(intent)
      .catch((value: unknown) => value);
    expect(error).toBeInstanceOf(CrmCommercialWriteUnconfirmedError);
    if (!(error instanceof CrmCommercialWriteUnconfirmedError)) throw error;
    expect(error.intent).toBe(intent);
    expect(error.cause).toBeUndefined();
    expect(
      JSON.stringify({ error, message: error.message, stack: error.stack })
    ).not.toContain(secret);
    expect(
      JSON.stringify({ error, message: error.message, stack: error.stack })
    ).not.toContain("Authorization");
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("does not reuse another client's representation, bearer or Company/profile headers", async () => {
    const seen: Array<[string | null, string | null, string | null]> = [];
    const fetch = vi.fn<typeof globalThis.fetch>(async (_url, init) => {
      const headers = new Headers(init?.headers);
      const context: [string | null, string | null, string | null] = [
        headers.get("Authorization"),
        headers.get("X-Company-Id"),
        headers.get("X-Active-Profile"),
      ];
      seen.push(context);
      return context[0] === "Bearer fact_test_boundary_tenant_a"
        ? boundaryResponse(maskedOpportunity())
        : Response.json(
            {
              error: {
                code: "resource_not_found",
                message: "Resource unavailable.",
              },
            },
            { status: 404 }
          );
    });
    const a = boundaryClient(fetch, {
      defaultHeaders: {
        "X-Company-Id": "tenant-a",
        "X-Active-Profile": "company",
      },
    });
    const b = boundaryClient(fetch, {
      apiKey: "fact_test_boundary_tenant_b",
      defaultHeaders: {
        "X-Company-Id": "tenant-b",
        "X-Active-Profile": "company",
      },
    });
    expect((await a.getOpportunity(opportunityId)).data.data?.id).toBe(
      opportunityId
    );
    await expect(b.getOpportunity(opportunityId)).rejects.toBeInstanceOf(
      NotFoundError
    );
    expect((await a.getOpportunity(opportunityId)).data.data?.id).toBe(
      opportunityId
    );
    expect(seen).toEqual([
      ["Bearer fact_test_boundary_tenant_a", "tenant-a", "company"],
      ["Bearer fact_test_boundary_tenant_b", "tenant-b", "company"],
      ["Bearer fact_test_boundary_tenant_a", "tenant-a", "company"],
    ]);
    expect(fetch).toHaveBeenCalledTimes(3);
  });
});
