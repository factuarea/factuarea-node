// Runtime support for conditional requests, binary-or-JSON downloads, response
// metadata, per-request retry opt-out and null-versus-absent body fields.
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { COMPANY, COMPANY_URL, server, testClient, useMockServer } from "./helpers.js";
import type { ResponseMeta } from "../src/index.js";
import { ServerError } from "../src/index.js";
import { FaceSubmissionsResource } from "../src/resources/faceSubmissions.js";

useMockServer();

const PDF_BYTES = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);

describe("If-Match / If-None-Match", () => {
  it("sends If-Match verbatim from config.ifMatch", async () => {
    let seen: string | null = null;
    server.use(
      http.patch(`${COMPANY_URL}/series/s1`, ({ request }) => {
        seen = request.headers.get("If-Match");
        return HttpResponse.json({ data: { id: "s1" } });
      }),
    );
    await testClient().series.update(COMPANY, "s1", { name: "A" }, { ifMatch: '"bc184bf7"' });
    expect(seen).toBe('"bc184bf7"');
  });

  it("does not send either header unless asked", async () => {
    let headers: Headers | undefined;
    server.use(
      http.patch(`${COMPANY_URL}/series/s1`, ({ request }) => {
        headers = request.headers;
        return HttpResponse.json({ data: { id: "s1" } });
      }),
    );
    await testClient().series.update(COMPANY, "s1", { name: "A" });
    expect(headers?.has("If-Match")).toBe(false);
    expect(headers?.has("If-None-Match")).toBe(false);
  });

  it("is not mistaken for query parameters when it is the only option of a legacy call", async () => {
    let url = "";
    server.use(
      http.get(`${COMPANY_URL}/series/active`, ({ request }) => {
        url = request.url;
        return HttpResponse.json({ data: [] });
      }),
    );
    await testClient().series.active(COMPANY, { ifNoneMatch: '"x"' });
    expect(url).toBe(`${COMPANY_URL}/series/active`);
  });
});

describe("binary, JSON or not-modified downloads", () => {
  it("returns kind=binary for a 200 PDF, with its ETag", async () => {
    server.use(
      http.get(`${COMPANY_URL}/invoices/inv_1/pdf`, () =>
        HttpResponse.arrayBuffer(PDF_BYTES.buffer as ArrayBuffer, {
          headers: { "Content-Type": "application/pdf", ETag: '"v1"' },
        }),
      ),
    );
    const result = await testClient().invoices.pdf(COMPANY, "inv_1");
    expect(result.kind).toBe("binary");
    if (result.kind === "binary") {
      expect(result.etag).toBe('"v1"');
      expect(new Uint8Array(result.body)).toEqual(PDF_BYTES);
    }
  });

  it("returns kind=json for a 202 with the Retry-After in seconds", async () => {
    server.use(
      http.get(`${COMPANY_URL}/invoices/inv_1/pdf`, () =>
        HttpResponse.json(
          { data: { pdf_output_state: { state: "queued" } } },
          { status: 202, headers: { "Retry-After": "7" } },
        ),
      ),
    );
    const result = await testClient().invoices.pdf(COMPANY, "inv_1");
    expect(result.kind).toBe("json");
    if (result.kind === "json") {
      expect(result.status).toBe(202);
      expect(result.retryAfter).toBe(7);
      expect(result.data).toEqual({ data: { pdf_output_state: { state: "queued" } } });
    }
  });

  it("returns kind=not_modified for a 304 and sends If-None-Match", async () => {
    let ifNoneMatch: string | null = null;
    server.use(
      http.get(`${COMPANY_URL}/invoices/inv_1/pdf`, ({ request }) => {
        ifNoneMatch = request.headers.get("If-None-Match");
        return new HttpResponse(null, { status: 304, headers: { ETag: '"v1"', "X-Request-Id": "req_304" } });
      }),
    );
    const result = await testClient().invoices.pdf(COMPANY, "inv_1", undefined, { ifNoneMatch: '"v1"' });
    expect(ifNoneMatch).toBe('"v1"');
    expect(result).toMatchObject({ kind: "not_modified", status: 304, etag: '"v1"', requestId: "req_304" });
  });

  it("still maps an error status to a typed error", async () => {
    server.use(
      http.get(`${COMPANY_URL}/invoices/inv_1/pdf`, () =>
        HttpResponse.json({ error: { type: "api_error", code: "pdf_unavailable" } }, { status: 503, headers: { "Retry-After": "30" } }),
      ),
    );
    const error = (await testClient().invoices.pdf(COMPANY, "inv_1").catch((e) => e)) as ServerError;
    expect(error).toBeInstanceOf(ServerError);
    expect(error.retryAfter).toBe(30);
    expect(error.headers?.get("retry-after")).toBe("30");
  });
});

describe("response metadata", () => {
  it("hands ETag, Retry-After, Idempotent-Replayed and request id to onResponse", async () => {
    server.use(
      http.get(`${COMPANY_URL}/series/s1`, () =>
        HttpResponse.json(
          { data: { id: "s1" } },
          { headers: { ETag: '"abc"', "Retry-After": "3", "Idempotent-Replayed": "true", "X-Request-Id": "req_1" } },
        ),
      ),
    );
    let meta: ResponseMeta | undefined;
    const data = await testClient().series.show(COMPANY, "s1", { onResponse: (m) => (meta = m) });
    expect(data).toEqual({ data: { id: "s1" } });
    expect(meta).toMatchObject({
      status: 200,
      etag: '"abc"',
      retryAfter: 3,
      idempotentReplayed: true,
      requestId: "req_1",
    });
  });

  it("also reports the metadata of a failed response before throwing", async () => {
    server.use(
      http.patch(`${COMPANY_URL}/series/s1`, () =>
        HttpResponse.json({ error: { type: "invalid_request_error", code: "precondition_failed" } }, { status: 412, headers: { ETag: '"now"' } }),
      ),
    );
    let meta: ResponseMeta | undefined;
    await expect(
      testClient().series.update(COMPANY, "s1", {}, { ifMatch: '"old"', onResponse: (m) => (meta = m) }),
    ).rejects.toThrow();
    expect(meta).toMatchObject({ status: 412, etag: '"now"', idempotentReplayed: false });
  });
});

describe("operations that are never retried", () => {
  it("makes a single call to submit an invoice to FACe even with retries enabled and a 503", async () => {
    let calls = 0;
    server.use(
      http.post(`${COMPANY_URL}/invoices/inv_1/face-submissions`, () => {
        calls++;
        return HttpResponse.json({ error: { type: "api_error", code: "face_down" } }, { status: 503 });
      }),
    );
    await expect(testClient({ maxRetries: 3 }).invoices.faceSubmissions.submit(COMPANY, "inv_1")).rejects.toBeInstanceOf(ServerError);
    expect(calls).toBe(1);
  });

  it("makes a single call to cancel a FACe submission after a network failure", async () => {
    let calls = 0;
    server.use(
      http.post(`${COMPANY_URL}/face-submissions/f1/cancel`, () => {
        calls++;
        return HttpResponse.error();
      }),
    );
    // `faceSubmissions` is not a namespace of the client yet, so the resource is built on its HttpClient.
    const faceSubmissions = new FaceSubmissionsResource(testClient({ maxRetries: 3 }).http);
    await expect(faceSubmissions.cancel(COMPANY, "f1")).rejects.toThrow();
    expect(calls).toBe(1);
  });

  it("lets a caller opt any request out of retries without touching the shared client", async () => {
    let calls = 0;
    server.use(
      http.get(`${COMPANY_URL}/series/s1`, () => {
        calls++;
        return calls === 1
          ? HttpResponse.json({ error: { type: "api_error" } }, { status: 500 })
          : HttpResponse.json({ data: { id: "s1" } });
      }),
    );
    const client = testClient({ maxRetries: 2 });
    await expect(client.series.show(COMPANY, "s1", { noRetry: true })).rejects.toBeInstanceOf(ServerError);
    expect(calls).toBe(1);
    // The shared client still retries.
    expect(await client.series.show(COMPANY, "s1")).toEqual({ data: { id: "s1" } });
    expect(calls).toBe(2);
  });
});

describe("absent versus null in a body", () => {
  async function sentBody(body: Parameters<ReturnType<typeof testClient>["series"]["update"]>[2]): Promise<string> {
    let raw = "";
    server.use(
      http.patch(`${COMPANY_URL}/series/s1`, async ({ request }) => {
        raw = await request.text();
        return HttpResponse.json({ data: { id: "s1" } });
      }),
    );
    await testClient().series.update(COMPANY, "s1", body);
    return raw;
  }

  it("omits a field the caller leaves out", async () => {
    expect(await sentBody({ name: "A" })).toBe('{"name":"A"}');
  });

  it("sends an explicit null as null", async () => {
    expect(await sentBody({ name: "A", code: null } as never)).toBe('{"name":"A","code":null}');
  });

  it("keeps null nested in the body", async () => {
    expect(await sentBody({ name: null, extra: { a: null, b: 0, c: "" } } as never)).toBe(
      '{"name":null,"extra":{"a":null,"b":0,"c":""}}',
    );
  });

  it("omits undefined properties, like absent ones", async () => {
    expect(await sentBody({ name: "A", code: undefined })).toBe('{"name":"A"}');
  });

  it("types the body of series.update from the generated types", () => {
    const series = testClient().series;
    // @ts-expect-error `nonexistent_field` is not part of UpdateSeriesRequest.
    void (() => series.update(COMPANY, "s1", { nonexistent_field: 1 }));
    // @ts-expect-error `name` is a string.
    void (() => series.update(COMPANY, "s1", { name: 42 }));
    void (() => series.update(COMPANY, "s1", { name: "ok" }));
  });
});
