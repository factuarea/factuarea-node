import { describe, expect, it, vi } from "vitest";
import {
  AuthenticationError,
  ConflictError,
  CrmUnconfirmedWriteError,
  Factuarea,
  FactuareaError,
  NotFoundError,
  ValidationError,
} from "../src/index.js";
import type { KnowledgeArticle } from "../src/index.js";

const id = "019a0000-0000-7000-8000-000000000001";
const otherId = "019a0000-0000-7000-8000-000000000002";
const apiKey = "fact_test_synthetic_projection_safety";
const secretFields = ["access_token", "refresh_token", "client_secret", "credentials", "claim_token", "storage_key", "download_url"];
const contentFields = ["slug", "title", "body", "editorial_locale", "category_ids", "workflow_state", "revision_number", "review_state"];

function sdk(fetch: typeof globalThis.fetch): Factuarea {
  return new Factuarea({ apiKey, baseUrl: "https://crm-contract.invalid/v1", timeout: 1000, maxRetries: 4, fetch });
}

function expectMaskedArticle(article: KnowledgeArticle): void {
  for (const field of [...contentFields, ...secretFields, "company_id", "actor_id", "links"]) {
    expect(Object.hasOwn(article, field)).toBe(false);
  }
}

// These tests use the committed CRM surface. The producer supplies redaction;
// rawResponse and onResponse retain native bodies and do not sanitize leaked secrets.
describe("CRM projection safety through the configured client", () => {
  it("preserves native redacted values without exposing credentials in the URL, User-Agent or returned projection", async () => {
    const wire = { data: { id, version: 4, published_version: null, audience: null } };
    const fetch = vi.fn<typeof globalThis.fetch>(async (input, init) => {
      expect(init?.method).toBe("GET");
      expect(String(input)).not.toContain(apiKey);
      const headers = new Headers(init?.headers);
      expect(headers.get("Authorization")).toBe(`Bearer ${apiKey}`);
      expect(headers.get("User-Agent")).not.toContain(apiKey);
      return Response.json(wire, { headers: { "X-Request-Id": "masked-article", "Cache-Control": "no-store, private" } });
    });
    const client = sdk(fetch);
    const onResponse = vi.fn();
    const result = await client.crm.knowledgeArticles.show(id, { onResponse });

    expect(result).toEqual(wire);
    expectMaskedArticle(result.data);
    expect(Object.hasOwn(result.data, "published_version")).toBe(true);
    expect(result.data.published_version).toBeNull();
    expect(Object.hasOwn(result.data, "audience")).toBe(true);
    expect(result.data.audience).toBeNull();
    expect(onResponse).toHaveBeenCalledWith(expect.objectContaining({ data: wire, status: 200, requestId: "masked-article" }));
    expect(JSON.stringify({ client, result, observed: onResponse.mock.calls })).not.toContain(apiKey);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("preserves omitted content and publication facts across native search pages and iteration", async () => {
    const first: KnowledgeArticle = { id, version: 4 };
    const second: KnowledgeArticle = { id: otherId, version: 5, published_version: null, audience: null };
    const fetch = vi.fn<typeof globalThis.fetch>(async (input) => {
      const url = new URL(String(input));
      expect(url.pathname).toBe("/v1/crm/knowledge/articles");
      expect(url.searchParams.get("query")).toBe("Synthetic masked content");
      const page = Number(url.searchParams.get("page") ?? "1");
      return Response.json({ data: { items: [page === 1 ? first : second], total: 2, page, per_page: 1 } });
    });
    const page = await sdk(fetch).crm.knowledgeArticles.search({ query: "Synthetic masked content", per_page: 1 });
    const rows = await page.toArray();

    expect(page.data.items).toEqual([first]);
    expect(rows).toEqual([first, second]);
    for (const row of rows) expectMaskedArticle(row);
    expect(Object.hasOwn(rows[0]!, "published_version")).toBe(false);
    expect(Object.hasOwn(rows[0]!, "audience")).toBe(false);
    expect(Object.hasOwn(rows[1]!, "published_version")).toBe(true);
    expect(rows[1]!.published_version).toBeNull();
    expect(Object.hasOwn(rows[1]!, "audience")).toBe(true);
    expect(rows[1]!.audience).toBeNull();
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("retains the currently masked original receipt without reconstructing content or a claim", async () => {
    const wire = { data: { operation: "knowledge_articles.save", effect_id: otherId, expected_version: 3, article: { id, version: 4 }, confirmed: true } };
    const fetch = vi.fn<typeof globalThis.fetch>(async (input, init) => {
      const url = new URL(String(input));
      expect(url.pathname).toBe("/v1/crm/knowledge/receipts/knowledge_articles.save");
      expect(url.search).toBe("");
      expect(init?.method).toBe("GET");
      expect(init?.body).toBeUndefined();
      expect(new Headers(init?.headers).get("Idempotency-Key")).toBe("original-masked-receipt");
      return Response.json(wire);
    });
    const result = await sdk(fetch).crm.knowledgeArticles.receiptSave({ idempotencyKey: "original-masked-receipt" });

    expect(result).toEqual(wire);
    expectMaskedArticle(result.data.article);
    for (const field of secretFields) expect(result.data).not.toHaveProperty(field);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("preserves the confirmed minimal Lead receipt when its representation is unavailable", async () => {
    const wire = { data: { id, confirmed: true, representation_available: false } };
    const fetch = vi.fn<typeof globalThis.fetch>(async () => Response.json(wire));
    const result = await sdk(fetch).crm.leads.update(id, { expected_version: 3 }, { idempotencyKey: "original-masked-lead-write" });

    expect(result).toEqual(wire);
    for (const field of [...secretFields, "version", "name", "email", "phone", "contact_data", "owner_id", "team_id", "typed_fields"]) {
      expect(Object.hasOwn(result.data, field)).toBe(false);
    }
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it.each([
    [403, AuthenticationError, "permission_error", "permission_denied"],
    [404, NotFoundError, "not_found_error", "resource_not_found"],
    [409, ConflictError, "conflict_error", "crm_version_conflict"],
    [422, ValidationError, "invalid_request_error", "parameter_invalid"],
  ] as const)("preserves native %s on reads and writes without credentials, retry or replacement values", async (status, ErrorType, type, code) => {
    const wire = { error: { type, code, subcode: status === 409 ? "version_changed" : null, message: "Current request refused", param: "expected_version",
      ...(status === 404 ? {} : { request_id: `native-${status}` }),
      ...(status === 422 ? { errors: [{ param: "expected_version", code: "version_invalid", message: "Original version required" },
        { param: "notes", code: "notes_invalid", message: "Notes are invalid" }] } : {}) } };
    const fetch = vi.fn<typeof globalThis.fetch>(async (input, init) => {
      expect(String(input)).toBe(`https://crm-contract.invalid/v1/crm/leads/${id}`);
      expect(new Headers(init?.headers).get("Authorization")).toBe(`Bearer ${apiKey}`);
      return Response.json(wire, { status, headers: { "X-Request-Id": `header-${status}` } });
    });
    const onResponse = vi.fn();
    const client = sdk(fetch);
    for (const operation of [
      () => client.crm.leads.show(id, { onResponse }),
      () => client.crm.leads.update(id, { expected_version: 1, notes: null }, { idempotencyKey: "original-projection-write", maxRetries: 9, onResponse }),
    ]) {
      const error: unknown = await operation().catch((caught: unknown) => caught);
      expect(error).toBeInstanceOf(ErrorType);
      expect(error).not.toBeInstanceOf(CrmUnconfirmedWriteError);
      if (!(error instanceof FactuareaError)) throw error;
      expect(error).toMatchObject({ status, type, code, subcode: wire.error.subcode, param: "expected_version", requestId: status === 404 ? "header-404" : `native-${status}` });
      expect(error.rawResponse).toEqual(wire);
      expect(error.data).toBeUndefined();
      expect(JSON.stringify(error)).not.toContain(apiKey);
      expect(error.message).not.toContain(apiKey);
      if (error instanceof ValidationError) expect(error.fields).toEqual({ expected_version: ["Original version required"], notes: ["Notes are invalid"] });
    }
    expect(onResponse).not.toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
