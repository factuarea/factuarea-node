import { describe, expect, it } from "vitest";
import {
  AuthenticationError, ConflictError, ConnectionError, Factuarea, RateLimitError, ServerError, ValidationError,
  CrmDocumentWriteUnconfirmedError, crmDocumentDate, crmDocumentDecimal, crmDocumentId, crmDocumentTimestamp,
  crmDocumentVersion, nativeDocumentId,
  type CreateOpportunityQuoteRequest, type CrmDocumentId, type CrmDocumentWriteConfig, type CrmDocumentWriteIntent,
  type LinkOpportunityDocumentRequest, type ReplaceCommercialDocumentVersionRequest, type UploadCommercialDocumentRequest,
} from "../src/index.js";

const BASE = "https://api.factuarea.test/v1";
const libraryId = crmDocumentId("019cf42b-5b00-7000-8000-000000000001");
const parent = crmDocumentId("019cf42b-5b00-7000-8000-000000000002");
const producer = crmDocumentId("019cf42b-5b00-7000-8000-000000000003");
const linkId = crmDocumentId("019cf42b-5b00-7000-8000-000000000004");
const shareId = crmDocumentId("019cf42b-5b00-7000-8000-000000000005");
const ownerId = nativeDocumentId("a44d9ed1-6ef6-48c1-9520-18da7801bd64");
const key = "documents-original-intent-001";
const upload: UploadCommercialDocumentRequest = { title: "Àngela, 山", producer_reference_id: producer, claimed_mime: "application/pdf" };
const replace: ReplaceCommercialDocumentVersionRequest = { expected_version: crmDocumentVersion(7), producer_reference_id: producer, claimed_mime: "application/pdf" };
const link: LinkOpportunityDocumentRequest = { document_type: "quote", document_id: ownerId, is_primary: false };
const quote: CreateOpportunityQuoteRequest = { contact_id: null, quote_draft: { date: crmDocumentDate("2026-10-09"), recipient: { kind: "unassigned", id: null }, notes: "Àngela, 山\nNext line", terms: null, expiry_date: null, expected_root_version: crmDocumentVersion(3), expected_line_version: crmDocumentVersion(4) } };

function sdk(fetch: typeof globalThis.fetch, overrides: Partial<ConstructorParameters<typeof Factuarea>[0]> = {}): Factuarea {
  return new Factuarea({
    apiKey: "fact_test_document_fixture", baseUrl: BASE, maxRetries: 9,
    defaultHeaders: { "X-Company-Id": "7" }, ...overrides, fetch
  });
}
function nativeDocument(type = "quote"): Record<string, unknown> {
  const fiscal = type === "quote" || type === "invoice";
  return {
    id: ownerId, type, version: 8, state: "future_native_state", number: null, currency: "EUR",
    quoted_amount: fiscal ? "999999999999999999.99" : null, invoiced_amount: fiscal ? "0.00" : null,
    paid_amount: fiscal ? "0.00" : null, financial_applicability: fiscal ? "applicable" : "not_applicable",
    valid_from: null, valid_until: null
  };
}
function linked(type = "quote"): Record<string, unknown> {
  return {
    id: linkId, version: 2, opportunity_id: parent, document_type: type, document_id: ownerId,
    is_primary: false, status: "linked", document: nativeDocument(type)
  };
}
function success(data: unknown, status = 200): Response { return Response.json({ data }, { status, headers: { "X-Request-Id": "document-request-7" } }); }
async function unconfirmed(call: Promise<unknown>): Promise<CrmDocumentWriteUnconfirmedError> {
  try { await call; throw new Error("Expected an unconfirmed result."); }
  catch (error) { expect(error).toBeInstanceOf(CrmDocumentWriteUnconfirmedError); return error as CrmDocumentWriteUnconfirmedError; }
}

describe("handwritten CRM document v1 clients", () => {
  it("uses the four read routes with exact native filters, masks, decimals and request metadata", async () => {
    const paths: URL[] = [];
    const client = sdk(async (input, init) => {
      const url = new URL(String(input)); paths.push(url);
      expect(init?.method).toBe("GET"); expect(init?.body).toBeUndefined();
      expect(new Headers(init?.headers).get("X-Company-Id")).toBe("7");
      if (url.pathname === "/v1/crm/documents") return success({ items: [{ id: libraryId, version: 7, archived_at: null }], total: 1, page: 2, per_page: 10 });
      if (url.pathname.endsWith("/financial-summary")) return success({
        opportunity_id: parent, version: 4,
        currencies: [{ currency: "EUR", forecast: "999999999999999999.9999", quoted: "999999999999999999.99", invoiced: "0.00", paid: "0.00" }]
      });
      if (url.pathname.endsWith("/candidates")) return success({ opportunity_id: parent, document_type: "quote", items: [], next_cursor: null, available: false, unavailable_reason: "producer_unavailable" });
      return success({ opportunity_id: parent, items: [linked()], next_cursor: null, total: 1, pending_count: 0 });
    });
    const page = await client.commercialDocuments.list({ page: 2, per_page: 10, archived: false, search: "Àngela, 山", sort: "id" });
    expect(page.data.items[0]).toEqual({ id: libraryId, version: 7, archived_at: null });
    expect(page.data.items[0]).not.toHaveProperty("title"); expect(page.requestId).toBe("document-request-7");
    expect((await client.opportunityDocuments.list(parent, { filters: { is_primary: false, status: "linked" }, limit: 10 })).data.items[0]?.document?.quoted_amount).toBe("999999999999999999.99");
    expect((await client.opportunityDocuments.candidates(parent, { document_type: "quote" })).data).toMatchObject({ available: false, items: [], unavailable_reason: "producer_unavailable" });
    expect((await client.opportunityDocuments.financialSummary(parent)).data.currencies[0]?.forecast).toBe("999999999999999999.9999");
    expect(paths.map(p => p.pathname)).toEqual(["/v1/crm/documents", `/v1/crm/opportunitydocuments/${parent}/documents`, `/v1/crm/opportunities/${parent}/documents/candidates`, `/v1/crm/opportunitydocuments/${parent}/financial-summary`]);
    expect(paths[0]?.searchParams.get("archived")).toBe("false");
    expect(paths[1]?.searchParams.get("filters")).toBe('{"status":"linked","is_primary":false}');
    expect(paths[2]?.searchParams.get("search")).toBe("");
  });

  it("gets and downloads the private library identity/version through native binary transport", async () => {
    const paths: string[] = [];
    const bytes = new Uint8Array([0, 255, 44, 10]);
    const client = sdk(async (input, init) => {
      const url = new URL(String(input)); paths.push(url.pathname + url.search);
      expect(init?.method).toBe("GET");
      if (url.pathname.endsWith("/download")) return new Response(bytes, { headers: { "Content-Type": "application/octet-stream", "X-Request-Id": "binary-original" } });
      return success({ id: libraryId, version: 7, title: "Àngela, 山", shares: [] });
    });
    expect((await client.commercialDocuments.get(libraryId)).data.title).toBe("Àngela, 山");
    const file = await client.commercialDocuments.download(libraryId, crmDocumentVersion(3));
    expect(file.toBuffer()).toEqual(Buffer.from(bytes)); expect(file.requestId).toBe("binary-original");
    expect(paths).toEqual([`/v1/crm/documents/${libraryId}`, `/v1/crm/documents/${libraryId}/download?document_version=3`]);
  });

  it("sends all eight writes as closed JSON, preserves false/null/omission, and accepts real 201/200 receipts", async () => {
    const requests: { path: string; method: string | undefined; body: unknown }[] = [];
    const client = sdk(async (input, init) => {
      const path = new URL(String(input)).pathname;
      const body: unknown = JSON.parse(String(init?.body)); requests.push({ path, method: init?.method, body });
      expect(new Headers(init?.headers).get("Content-Type")).toBe("application/json");
      expect(new Headers(init?.headers).get("Idempotency-Key")).toBe(key);
      expect(init?.body).not.toBeInstanceOf(FormData);
      if (path.includes("opportunitydocuments")) return init?.method === "DELETE"
        ? success({ id: linkId, version: 8, opportunity_id: parent, document_type: "quote", document_id: ownerId }) : success(linked(), 201);
      return success({ id: libraryId, version: path === "/v1/crm/documents" ? 1 : 8 }, path === "/v1/crm/documents" ? 201 : 200);
    });
    const config = { idempotencyKey: key };
    expect((await client.commercialDocuments.upload(upload, config)).data.version).toBe(1);
    await client.commercialDocuments.replaceVersion(libraryId, replace, config);
    await client.commercialDocuments.share(libraryId, { expected_version: crmDocumentVersion(7), grant_type: "user", grantee_id: ownerId, expires_at: null }, config);
    await client.commercialDocuments.revokeShare(libraryId, { expected_version: crmDocumentVersion(7), share_id: shareId }, config);
    await client.commercialDocuments.archive(libraryId, { expected_version: crmDocumentVersion(7) }, config);
    await client.opportunityDocuments.createQuote(parent, quote, config);
    await client.opportunityDocuments.link(parent, link, config);
    await client.opportunityDocuments.unlink(parent, linkId, { expected_version: crmDocumentVersion(7) }, config);
    expect(requests.map(r => [r.method, r.path])).toEqual([
      ["POST", "/v1/crm/documents"], ["POST", `/v1/crm/documents/${libraryId}/versions`], ["POST", `/v1/crm/documents/${libraryId}/shares`],
      ["POST", `/v1/crm/documents/${libraryId}/shares/revoke`], ["POST", `/v1/crm/documents/${libraryId}/archive`],
      ["POST", `/v1/crm/opportunitydocuments/${parent}/quotes`], ["POST", `/v1/crm/opportunitydocuments/${parent}/documents`],
      ["DELETE", `/v1/crm/opportunitydocuments/${parent}/documents/${linkId}`],
    ]);
    expect(requests[0]?.body).toEqual(upload); expect(requests[5]?.body).toEqual(quote); expect(requests[6]?.body).toEqual(link);
  });

  it("iterates both library pages with the same native filters", async () => {
    const queries: URLSearchParams[] = [];
    const client = sdk(async input => {
      const q = new URL(String(input)).searchParams; queries.push(q);
      return success({ items: [{ id: q.get("page") === "1" ? libraryId : shareId, version: 1 }], total: 2, page: Number(q.get("page")), per_page: 1 });
    });
    const ids: string[] = [];
    for await (const document of client.commercialDocuments.iterate({ per_page: 1, archived: false, search: "Àngela" })) ids.push(document.id);
    expect(ids).toEqual([libraryId, shareId]);
    expect(queries.map(q => [q.get("page"), q.get("search"), q.get("archived")])).toEqual([["1", "Àngela", "false"], ["2", "Àngela", "false"]]);
  });

  it("iterates Opportunity and candidates using opaque cursors without dropping filters or revisions", async () => {
    const requests: URL[] = [];
    const client = sdk(async input => {
      const url = new URL(String(input)); requests.push(url);
      const next = url.searchParams.has("cursor") ? null : "opaque+/next=token";
      if (url.pathname.endsWith("candidates")) return success({ opportunity_id: parent, document_type: "quote", items: [{ id: ownerId, type: "quote", revision: 8, state: "draft", label: "Àngela", currency: "EUR", valid_from: null, valid_until: null, financial_applicability: "applicable" }], next_cursor: next, available: true, unavailable_reason: null });
      return success({ opportunity_id: parent, items: [linked()], next_cursor: next, total: 2, pending_count: 0 });
    });
    const links = []; for await (const value of client.opportunityDocuments.iterate(parent, { filters: { is_primary: false }, limit: 1 })) links.push(value);
    const candidates = []; for await (const value of client.opportunityDocuments.iterateCandidates(parent, { document_type: "quote", search: "Àngela", limit: 1 })) candidates.push(value);
    expect(links).toHaveLength(2); expect(candidates).toHaveLength(2); expect(candidates[1]?.revision).toBe(8);
    expect(requests[1]?.searchParams.get("cursor")).toBe("opaque+/next=token");
    expect(requests[1]?.searchParams.get("filters")).toBe('{"is_primary":false}');
    expect(requests[3]?.searchParams.get("search")).toBe("Àngela");
  });

  it.each(["no-progress", "max-pages"])("does not silently truncate invalid library pagination: %s", async reason => {
    const client = sdk(async () => success({ items: reason === "no-progress" ? [] : [{ id: libraryId, version: 1 }], total: 5, page: 1, per_page: 1 }));
    const consume = async (): Promise<void> => { for await (const _value of client.commercialDocuments.iterate({ per_page: 1 }, undefined, 1)) { /* consume bounded pages */ } };
    await expect(consume()).rejects.toBeInstanceOf(TypeError);
  });

  it("rejects a repeated native cursor", async () => {
    const client = sdk(async () => success({ opportunity_id: parent, items: [], next_cursor: "repeated", total: 0, pending_count: 0 }));
    const consume = async (): Promise<void> => { for await (const _value of client.opportunityDocuments.iterate(parent)) { /* consume */ } };
    await expect(consume()).rejects.toThrow("cursor did not advance");
  });

  it("retains immutable original bytes/key/CAS and recovers explicitly without querying a current head", async () => {
    const requests: { path: string; method: string | undefined; body: string; key: string | null; trace: string | null }[] = [];
    const originalBody = { ...replace };
    const headers = { "X-Client-Trace": "original" };
    const client = sdk(async (input, init) => {
      requests.push({ path: String(input), method: init?.method, body: String(init?.body), key: new Headers(init?.headers).get("Idempotency-Key"), trace: new Headers(init?.headers).get("X-Client-Trace") });
      if (requests.length === 1) throw new TypeError("lost response after send");
      return success({ id: libraryId, version: 8 });
    });
    const config = { idempotencyKey: key, headers, maxRetries: 50 } as unknown as CrmDocumentWriteConfig;
    const error = await unconfirmed(client.commercialDocuments.replaceVersion(libraryId, originalBody, config));
    expect(requests).toHaveLength(1); expect(Object.isFrozen(error.intent)).toBe(true);
    originalBody.expected_version = crmDocumentVersion(100); headers["X-Client-Trace"] = "changed";
    expect((await client.commercialDocuments.recover(error.intent)).data.version).toBe(8);
    expect(requests[1]).toEqual(requests[0]);
    expect(error.intent.bodyJson).toBe(JSON.stringify(replace));
    expect(JSON.stringify(error.intent)).not.toContain("fact_test_document_fixture");
  });

  it("preserves optional omission independently of explicit null", async () => {
    const bodies: Record<string, unknown>[] = [];
    const client = sdk(async (_input, init) => { bodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>); return success({ id: libraryId, version: 8 }); });
    await client.commercialDocuments.share(libraryId, { expected_version: crmDocumentVersion(7), grant_type: "user", grantee_id: ownerId }, { idempotencyKey: "share-omitted" });
    await client.commercialDocuments.share(libraryId, { expected_version: crmDocumentVersion(7), grant_type: "user", grantee_id: ownerId, expires_at: null }, { idempotencyKey: "share-null" });
    expect(bodies[0]).not.toHaveProperty("expires_at"); expect(bodies[1]).toHaveProperty("expires_at", null);
  });

  it("does not automatically retry a timeout, and AbortSignal cancels an in-flight mutation as unconfirmed", async () => {
    const controller = new AbortController(); let attempts = 0;
    const client = sdk(async (_input, init) => {
      attempts++;
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new DOMException("cancelled", "AbortError")), { once: true });
        queueMicrotask(() => controller.abort());
      });
    });
    const error = await unconfirmed(client.commercialDocuments.upload(upload, { idempotencyKey: key, signal: controller.signal }));
    expect(attempts).toBe(1); expect(error.intent.idempotencyKey).toBe(key); expect(error.intent.bodyJson).toBe(JSON.stringify(upload));
    const timeoutClient = sdk(async () => { throw new DOMException("timeout", "AbortError"); });
    expect((await unconfirmed(timeoutClient.commercialDocuments.upload(upload, { idempotencyKey: key }))).originalError).toBeInstanceOf(ConnectionError);
  });

  it("cancels a pre-aborted read before any request and keeps cancellation attached while reading binary bytes", async () => {
    let attempts = 0; const before = new AbortController(); before.abort();
    const client = sdk(async () => { attempts++; return success({ id: libraryId, version: 1 }); });
    await expect(client.commercialDocuments.get(libraryId, { signal: before.signal })).rejects.toBeInstanceOf(ConnectionError); expect(attempts).toBe(0);
    const controller = new AbortController();
    const binary = sdk(async (_input, init) => new Response(new ReadableStream<Uint8Array>({
      start(stream) {
        init?.signal?.addEventListener("abort", () => stream.error(new DOMException("cancelled", "AbortError")), { once: true });
        setTimeout(() => controller.abort(), 0);
      }
    }), { headers: { "Content-Type": "application/pdf" } }));
    await expect(binary.commercialDocuments.download(libraryId, undefined, { signal: controller.signal })).rejects.toThrow("cancelled");
  });

  it("rejects cross-client/owner/forged recovery before network I/O", async () => {
    let attempts = 0;
    const fetcher: typeof fetch = async () => { attempts++; throw new TypeError("lost response"); };
    const first = sdk(fetcher), other = sdk(fetcher, { apiKey: "fact_test_other" });
    const error = await unconfirmed(first.commercialDocuments.upload(upload, { idempotencyKey: key }));
    await expect(other.commercialDocuments.recover(error.intent)).rejects.toThrow("original sent intent and client");
    expect(() => first.opportunityDocuments.recover(error.intent)).toThrow("document library");
    await expect(first.commercialDocuments.recover({ ...error.intent } as CrmDocumentWriteIntent)).rejects.toThrow("original sent intent");
    expect(attempts).toBe(1);
  });

  it.each(["company", "credential", "profile", "version"])("checks actual effective %s context before explicit recovery", async changed => {
    let attempts = 0; let credential = "Bearer original-token";
    const defaults = { "X-Company-Id": "7", "X-Active-Profile": producer, "Factuarea-Version": "2026-06-04" };
    const client = sdk(async () => { attempts++; throw new TypeError("lost response"); }, { defaultHeaders: defaults, authStrategy: { headers: async () => ({ Authorization: credential }) } });
    const error = await unconfirmed(client.commercialDocuments.upload(upload, { idempotencyKey: key }));
    if (changed === "company") defaults["X-Company-Id"] = "8";
    if (changed === "profile") defaults["X-Active-Profile"] = shareId;
    if (changed === "version") defaults["Factuarea-Version"] = "2026-10-09";
    if (changed === "credential") credential = "Bearer changed-token";
    await expect(client.commercialDocuments.recover(error.intent)).rejects.toThrow("original request context");
    expect(attempts).toBe(1); expect(JSON.stringify(error.intent)).not.toContain("original-token");
  });

  it.each([
    { status: 409, subcode: "document_version_conflict", type: ConflictError },
    { status: 422, subcode: "invalid_document", type: ValidationError },
    { status: 429, subcode: "technical_rate_limit", type: RateLimitError },
  ])("keeps native determinate HTTP $status errors and request id without retries", async ({ status, subcode, type }) => {
    let attempts = 0;
    const client = sdk(async () => { attempts++; return Response.json({ error: { code: "native_error", subcode, message: "Native rejected intent", request_id: "native-original", fields: { title: ["invalid"] } } }, { status, headers: { "Retry-After": "17" } }); });
    try { await client.commercialDocuments.upload(upload, { idempotencyKey: key }); throw new Error("Expected native error"); }
    catch (error) {
      expect(error).toBeInstanceOf(type); expect(error).not.toBeInstanceOf(CrmDocumentWriteUnconfirmedError);
      expect(error).toMatchObject({ subcode, requestId: "native-original" });
      if (error instanceof ValidationError) expect(error.fields.title).toEqual(["invalid"]);
      if (error instanceof RateLimitError) expect(error.retryAfter).toBe(17);
    }
    expect(attempts).toBe(1);
  });

  it.each([
    { status: 403, subcode: "authority_revoked", type: AuthenticationError },
    { status: 500, subcode: "producer_unavailable", type: ServerError },
    { status: 409, subcode: "opportunity_document_result_unconfirmed", type: ConflictError },
  ])("retains original intent and typed cause for ambiguous/revoked HTTP $status", async ({ status, subcode, type }) => {
    let attempts = 0;
    const client = sdk(async () => { attempts++; return Response.json({ error: { code: "native_result", subcode, message: "Not confirmed", request_id: "native-original" } }, { status }); });
    const error = await unconfirmed(client.opportunityDocuments.link(parent, link, { idempotencyKey: key }));
    expect(error.originalError).toBeInstanceOf(type); expect(error).toMatchObject({ status, subcode, requestId: "native-original" });
    expect(error.intent.path).toBe(`/crm/opportunitydocuments/${parent}/documents`); expect(attempts).toBe(1);
  });

  it.each([
    { status: 202, data: { status: "queued" } },
    { status: 200, data: { id: libraryId, version: 1 } },
    { status: 201, data: { id: 7, version: 1 } },
    { status: 201, data: { id: libraryId, version: 2 } },
    { status: 201, data: { id: libraryId, version: 1, authority: {} } },
  ])("never fabricates confirmation from malformed library success %#", async ({ status, data }) => {
    let attempts = 0;
    const client = sdk(async () => { attempts++; return success(data, status); });
    const error = await unconfirmed(client.commercialDocuments.upload(upload, { idempotencyKey: key }));
    expect(error.requestId).toBe("document-request-7"); expect(error.intent.idempotencyKey).toBe(key); expect(attempts).toBe(1);
  });

  it.each([
    { id: shareId, version: 8 }, { id: libraryId, version: 9 }, { id: libraryId, version: 7 },
  ])("checks library recovery against the original CAS/identity rather than current state %#", async data => {
    const client = sdk(async () => success(data));
    expect((await unconfirmed(client.commercialDocuments.replaceVersion(libraryId, replace, { idempotencyKey: key }))).intent.expectedVersion).toBe(7);
  });

  it.each([
    { opportunity_id: shareId }, { document_id: libraryId }, { document_type: "invoice" },
    { status: "pending" }, { document: null }, { document: { ...nativeDocument(), quoted_amount: 12.1 } },
  ])("checks linked receipts against native parent/owner/document and exact amounts %#", async patch => {
    const client = sdk(async () => success({ ...linked(), ...patch }, 201));
    expect((await unconfirmed(client.opportunityDocuments.link(parent, link, { idempotencyKey: key }))).intent.documentId).toBe(ownerId);
  });

  it("retains non-fiscal null amounts and preserves unknown native states", async () => {
    const client = sdk(async () => success({ opportunity_id: parent, items: [linked("contract")], next_cursor: null, total: 1, pending_count: 0 }));
    const document = (await client.opportunityDocuments.list(parent)).data.items[0]?.document;
    expect(document).toMatchObject({ state: "future_native_state", financial_applicability: "not_applicable", quoted_amount: null, invoiced_amount: null, paid_amount: null });
  });

  it.each([12.1, "12.1", "-1.00", "1000000000000000000.00"])("rejects coerced or out-of-contract native money %s", async amount => {
    const client = sdk(async () => success({ opportunity_id: parent, version: 1, currencies: [{ currency: "EUR", forecast: "0.0000", quoted: amount, invoiced: "0.00", paid: "0.00" }] }));
    await expect(client.opportunityDocuments.financialSummary(parent)).rejects.toBeInstanceOf(TypeError);
  });

  it("rejects unknown private data, foreign read identities, repeated currencies and fabricated unavailable candidates", async () => {
    const foreign = sdk(async () => success({ id: shareId, version: 1 }));
    await expect(foreign.commercialDocuments.get(libraryId)).rejects.toThrow("another identity");
    const privateData = sdk(async () => success({ id: libraryId, version: 1, storage_handle: "private" }));
    await expect(privateData.commercialDocuments.get(libraryId)).rejects.toThrow("unsupported fields");
    const bucket = { currency: "EUR", forecast: "0.0000", quoted: "0.00", invoiced: "0.00", paid: "0.00" };
    const repeated = sdk(async () => success({ opportunity_id: parent, version: 1, currencies: [bucket, bucket] }));
    await expect(repeated.opportunityDocuments.financialSummary(parent)).rejects.toThrow("cannot be repeated");
    const unavailable = sdk(async () => success({ opportunity_id: parent, document_type: "quote", items: [], next_cursor: "invented", available: false, unavailable_reason: "producer_unavailable" }));
    await expect(unavailable.opportunityDocuments.candidates(parent, { document_type: "quote" })).rejects.toThrow("cannot fabricate");
  });

  it.each([
    { ...upload, producer_reference_id: "https://public.example/file.pdf" },
    { ...upload, company_id: 99 }, { ...upload, file: new Blob(["file bytes"]) },
    { ...upload, title: "" }, { ...upload, claimed_mime: "file://callback" },
  ])("rejects invalid or SPA/authority-injected library input before I/O %#", async body => {
    let attempts = 0; const client = sdk(async () => { attempts++; return success({ id: libraryId, version: 1 }, 201); });
    await expect(client.commercialDocuments.upload(body as UploadCommercialDocumentRequest, { idempotencyKey: key })).rejects.toBeInstanceOf(TypeError);
    expect(attempts).toBe(0);
  });

  it("checks UUID/CAS/decimal/date primitives and rejects missing keys and invented owner CAS before I/O", async () => {
    expect(() => crmDocumentId(ownerId)).toThrow(); expect(() => crmDocumentVersion(1.2)).toThrow();
    expect(() => crmDocumentVersion(Number.MAX_SAFE_INTEGER + 1)).toThrow();
    expect(() => crmDocumentDate("2026-02-30")).toThrow(); expect(() => crmDocumentTimestamp("2026-10-09T10:00:00")).toThrow();
    expect(crmDocumentDecimal("999999999999999999.99")).toBe("999999999999999999.99");
    let attempts = 0; const client = sdk(async () => { attempts++; return success(linked(), 201); });
    await expect(client.opportunityDocuments.link(parent, link, { idempotencyKey: "" })).rejects.toBeInstanceOf(TypeError);
    await expect(client.opportunityDocuments.link(parent, { ...link, expected_owner_revision: 8 } as LinkOpportunityDocumentRequest, { idempotencyKey: key })).rejects.toBeInstanceOf(TypeError);
    await expect(client.commercialDocuments.replaceVersion(libraryId, { ...replace, expected_version: Number.MAX_SAFE_INTEGER } as ReplaceCommercialDocumentVersionRequest, { idempotencyKey: key })).rejects.toBeInstanceOf(TypeError);
    expect(attempts).toBe(0);
  });
});

// Compile-only assertions exercise the public handwritten contract, not generated types.
function publicTypeContract(): void {
  // @ts-expect-error Arbitrary strings cannot silently become CRM entity UUIDs.
  const invalidId: CrmDocumentId = "42";
  // @ts-expect-error Decimal/CAS numbers must pass the native safe-integer boundary.
  const invalidCas: ReplaceCommercialDocumentVersionRequest = { ...replace, expected_version: 1.5 };
  // @ts-expect-error Native linking has no invented document-owner CAS input.
  const invalidOwnerCas: LinkOpportunityDocumentRequest = { ...link, expected_owner_revision: 8 };
  // @ts-expect-error A native recipient id is required for an assigned recipient.
  const invalidRecipient: CreateOpportunityQuoteRequest = { quote_draft: { date: crmDocumentDate("2026-10-09"), recipient: { kind: "business_contact" } } };
  void [invalidId, invalidCas, invalidOwnerCas, invalidRecipient];
}
void publicTypeContract;
