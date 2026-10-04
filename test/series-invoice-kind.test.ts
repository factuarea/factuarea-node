import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import type { CreateCorrectiveInvoiceRequest, CreateInvoiceRequest, CreateSeriesRequest, Series, UpdateInvoiceRequest } from "../src/index.js";
import { BASE_URL, server, testClient, useMockServer } from "./helpers.js";

useMockServer();
const seriesId = "019e5584-7a72-7038-a8f6-561ed180b699";
const invoiceId = "019e5b7a-3c1d-7a52-b4e1-6f2d9c8a1e37";

function captureGet(path: string, body: Record<string, unknown> = { data: [] }): URL[] {
  const urls: URL[] = [];
  server.use(http.get(`${BASE_URL}${path}`, ({ request }) => {
    urls.push(new URL(request.url));
    return HttpResponse.json(body);
  }));
  return urls;
}

describe("series by invoice kind", () => {
  it("reads invoice_kind on a series and creates one with it", async () => {
    let body: unknown;
    const created: { data: Pick<Series, "id" | "invoice_kind"> } = { data: { id: seriesId, invoice_kind: "simplified" } };
    server.use(http.post(`${BASE_URL}/series`, async ({ request }) => {
      body = await request.json();
      return HttpResponse.json(created, { status: 201 });
    }));
    const request: CreateSeriesRequest = { code: "TK", name: "Tickets", prefix: "TK", document_type: "invoice", invoice_kind: "simplified" };

    const result = (await testClient().series.create(request)) as typeof created;

    expect(body).toEqual(request);
    expect(result.data.invoice_kind).toBe("simplified");
  });

  it("filters the list by invoice_kind", async () => {
    const urls = captureGet("/series", { data: [], has_more: false, next_cursor: null });

    await (await testClient().series.list({ invoice_kind: "corrective" })).toArray();

    expect(urls[0]?.searchParams.get("invoice_kind")).toBe("corrective");
  });

  it("filters the default series by document type and invoice_kind", async () => {
    const urls = captureGet("/series/default", { data: { id: seriesId } });

    await testClient().series.default({ document_type: "invoice", invoice_kind: "simplified" });

    expect(urls[0]?.searchParams.get("document_type")).toBe("invoice");
    expect(urls[0]?.searchParams.get("invoice_kind")).toBe("simplified");
  });

  it("filters the active series by invoice_kind", async () => {
    const urls = captureGet("/series/active");

    await testClient().series.active({ document_type: "invoice", invoice_kind: "simplified_corrective" });

    expect(urls[0]?.searchParams.get("invoice_kind")).toBe("simplified_corrective");
  });

  it("keeps series.active(config) working: the options are not sent as a query", async () => {
    const profiles: Array<string | null> = [];
    const urls: URL[] = [];
    server.use(http.get(`${BASE_URL}/series/active`, ({ request }) => {
      urls.push(new URL(request.url));
      profiles.push(request.headers.get("X-Active-Profile"));
      return HttpResponse.json({ data: [] });
    }));

    await testClient().series.active({ headers: { "X-Active-Profile": "managed-company" } });
    await testClient().series.active();

    expect(profiles).toEqual(["managed-company", null]);
    expect(urls.map((u) => u.search)).toEqual(["", ""]);
  });
});

describe("invoices with the optional series and the new fields", () => {
  it("creates an invoice without series_id or with it null", async () => {
    const bodies: unknown[] = [];
    server.use(http.post(`${BASE_URL}/invoices`, async ({ request }) => {
      bodies.push(await request.json());
      return HttpResponse.json({ data: { id: invoiceId } }, { status: 201 });
    }));
    const lines = [{ description: "Ticket", quantity: 1, unit_price: 5, tax_rate: 21 }];
    const withoutSeries: CreateInvoiceRequest = { issued_on: "2026-06-01", due_on: "2026-06-01", type: "F2", lines };
    const nullSeries: CreateInvoiceRequest = { issued_on: "2026-06-01", due_on: "2026-06-01", type: "F2", series_id: null, lines };

    await testClient().invoices.create(withoutSeries);
    await testClient().invoices.create(nullSeries);

    expect(bodies[0]).not.toHaveProperty("series_id");
    expect(bodies[1]).toMatchObject({ series_id: null });
  });

  it("updates the type of an invoice", async () => {
    let body: unknown;
    server.use(http.put(`${BASE_URL}/invoices/${invoiceId}`, async ({ request }) => {
      body = await request.json();
      return HttpResponse.json({ data: { id: invoiceId, type: "F2" } });
    }));
    const request: UpdateInvoiceRequest = { type: "F2" };

    await testClient().invoices.update(invoiceId, request);

    expect(body).toEqual({ type: "F2" });
  });

  it("creates a corrective invoice with correction_nature and series_id", async () => {
    let body: unknown;
    server.use(http.post(`${BASE_URL}/invoices/${invoiceId}/corrective`, async ({ request }) => {
      body = await request.json();
      return HttpResponse.json({ data: { id: "corrective-1" } }, { status: 201 });
    }));
    const request: CreateCorrectiveInvoiceRequest = {
      correction_reason: "error_fundado",
      correction_type: "full",
      correction_nature: "S",
      series_id: seriesId,
    };

    await testClient().invoices.corrective(invoiceId, request);

    expect(body).toMatchObject({ correction_nature: "S", series_id: seriesId });
  });
});

describe("contacts.imports", () => {
  const importId = "019e5b7a-0000-7a52-b4e1-6f2d9c8a1e01";

  it("retrieves an import", async () => {
    server.use(http.get(`${BASE_URL}/contacts/imports/${importId}`, () => HttpResponse.json({ data: { id: importId, status: "completed" } })));

    expect(await testClient().contacts.imports.show(importId)).toEqual({ data: { id: importId, status: "completed" } });
  });

  it("downloads the errors CSV as a binary response", async () => {
    const csv = "row,error\n3,invalid tax id\n";
    let accept: string | null = null;
    server.use(http.get(`${BASE_URL}/contacts/imports/${importId}/errors.csv`, ({ request }) => {
      accept = request.headers.get("Accept");
      return new HttpResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8" } });
    }));

    const result = await testClient().contacts.imports.errors(importId);

    expect(result.contentType).toContain("text/csv");
    expect(result.toBuffer().toString("utf8")).toBe(csv);
    expect(accept).not.toBe("application/json");
  });
});
