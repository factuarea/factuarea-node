import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { ValidationError } from "../src/index.js";
import { BASE_URL, server, testClient, useMockServer } from "./helpers.js";

useMockServer();
const scanId = "0199152d-525d-7000-8000-000000000011";

describe("purchase scanner", () => {
  it("discovers company expense category IDs for scanner review", async () => {
    const categories = { data: [{ id: scanId, object: "expense_category", name: "Professional services" }] };
    server.use(http.get(`${BASE_URL}/purchase_invoices/expense_categories`, () => HttpResponse.json(categories)));
    expect(await testClient().purchaseInvoices.expenseCategories()).toEqual(categories);
  });

  it("uploads multiple originals with a stable idempotency key and keeps partial rejections", async () => {
    const batch = { accepted: [{ id: scanId, item_index: 0 }], rejected: [{ item_index: 1, filename: "invalid.pdf", code: "scan_file_invalid" }], idempotent_replay: false };
    server.use(http.post(`${BASE_URL}/purchase_scans`, async ({ request }) => {
      expect(request.headers.get("Idempotency-Key")).toBe("scanner-batch-key-001");
      const form = await request.formData();
      const files = form.getAll("files[]") as File[];
      expect(files.map((file) => file.name)).toEqual(["invoice.pdf", "invalid.pdf"]);
      expect(await files[0]!.text()).toBe("%PDF-fixture");
      return HttpResponse.json({ data: batch }, { status: 202 });
    }));
    const form = new FormData();
    form.append("files[]", new Blob(["%PDF-fixture"], { type: "application/pdf" }), "invoice.pdf");
    form.append("files[]", new Blob(["invalid"]), "invalid.pdf");
    expect(await testClient().purchaseScans.create(form, { idempotencyKey: "scanner-batch-key-001" })).toEqual({ data: batch });
  });

  it("preserves per-file failure data when all documents are rejected with 422", async () => {
    const data = { accepted: [], rejected: [{ item_index: 0, filename: "bad.pdf", code: "scan_file_invalid" }], idempotent_replay: false };
    server.use(http.post(`${BASE_URL}/purchase_scans`, () => HttpResponse.json({ data }, { status: 422 })));
    await expect(testClient().purchaseScans.create(new FormData())).rejects.toMatchObject({ status: 422, data });
  });

  it("preserves filters and active-profile headers on following scanner pages", async () => {
    const requests: URL[] = [];
    server.use(http.get(`${BASE_URL}/purchase_scans`, ({ request }) => {
      const url = new URL(request.url);
      requests.push(url);
      expect(request.headers.get("X-Active-Profile")).toBe("profile-a");
      expect(url.searchParams.getAll("status[]")).toEqual(["needs_review", "failed"]);
      const second = url.searchParams.has("starting_after");
      return HttpResponse.json({ data: [{ id: second ? "second" : scanId }], has_more: !second, next_cursor: second ? null : scanId });
    }));
    const page = await testClient().purchaseScans.list({ status: ["needs_review", "failed"] }, { headers: { "X-Active-Profile": "profile-a" } });
    expect(await page.toArray()).toHaveLength(2);
    expect(requests[1]?.searchParams.get("starting_after")).toBe(scanId);
  });

  it("sends partial line operations and the expected version without manufacturing line ids", async () => {
    const body = { expected_version: 3, fields: { notes: { value: null } }, lines: [{ operation: "add", fields: { description: { value: "Supplies" } } }] };
    server.use(http.put(`${BASE_URL}/purchase_scans/${scanId}/review`, async ({ request }) => {
      expect(await request.json()).toEqual(body);
      expect(request.headers.get("Idempotency-Key")).toBe("scanner-review-key-003");
      return HttpResponse.json({ data: { id: scanId, version: 4 } });
    }));
    expect(await testClient().purchaseScans.review(scanId, body, { idempotencyKey: "scanner-review-key-003" })).toEqual({ data: { id: scanId, version: 4 } });
  });

  it("archives with a versioned JSON DELETE body and downloads the original as binary", async () => {
    server.use(
      http.delete(`${BASE_URL}/purchase_scans/${scanId}`, async ({ request }) => {
        expect(await request.json()).toEqual({ expected_version: 4 });
        expect(request.headers.get("Idempotency-Key")).toBeTruthy();
        return HttpResponse.json({ data: { id: scanId, status: "archived" } });
      }),
      http.get(`${BASE_URL}/purchase_scans/${scanId}/source`, () => new HttpResponse("original-image", { headers: { "Content-Type": "image/png" } })),
    );
    await testClient().purchaseScans.archive(scanId, { expected_version: 4 });
    const source = await testClient().purchaseScans.source(scanId);
    expect(source.contentType).toBe("image/png");
    expect(source.toBuffer().toString()).toBe("original-image");
  });

  it("exposes review field errors for corrective clients", async () => {
    server.use(http.post(`${BASE_URL}/purchase_scans/${scanId}/convert`, () => HttpResponse.json({ error: { code: "purchase_scan_review_incomplete", details: { field_errors: { "supplier_id": ["Select a supplier"] } } } }, { status: 422 })));
    const error = await testClient().purchaseScans.convert(scanId, { expected_version: 4 }).catch((error: unknown) => error);
    expect(error).toBeInstanceOf(ValidationError);
    expect(error).toMatchObject({ fields: { "supplier_id": ["Select a supplier"] } });
  });
});
