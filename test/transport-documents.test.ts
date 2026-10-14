import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { BASE_URL, server, testClient, useMockServer } from "./helpers.js";

useMockServer();
const documentId = "019a1c2e-7d40-7000-8000-000000000041";
const secondDocumentId = "019a1c2e-7d40-7000-8000-000000000042";

describe("transport documents (DeCA)", () => {
  it("lists with filters and follows the cursor", async () => {
    const urls: URL[] = [];
    server.use(http.get(`${BASE_URL}/transport_documents`, ({ request }) => {
      const url = new URL(request.url);
      urls.push(url);
      const second = url.searchParams.has("starting_after");
      return HttpResponse.json({
        data: [{ id: second ? secondDocumentId : documentId, object: "transport_document" }],
        has_more: !second,
        next_cursor: second ? null : documentId,
      });
    }));
    const page = await testClient().transportDocuments.index({ status: "issued", company_role: "shipper", limit: 1 });
    expect((await page.toArray()).map((document) => (document as { id: string }).id)).toEqual([documentId, secondDocumentId]);
    expect(urls).toHaveLength(2);
    for (const url of urls) {
      expect(url.searchParams.get("status")).toBe("issued");
      expect(url.searchParams.get("company_role")).toBe("shipper");
    }
    expect(urls[1]?.searchParams.get("starting_after")).toBe(documentId);
  });

  it("issues with the caller's Idempotency-Key", async () => {
    const keys: Array<string | null> = [];
    server.use(http.post(`${BASE_URL}/transport_documents/${documentId}/issue`, ({ request }) => {
      keys.push(request.headers.get("Idempotency-Key"));
      return HttpResponse.json({ data: { id: documentId, object: "transport_document", status: "issued" } });
    }));
    const issued = await testClient().transportDocuments.issue(documentId, { idempotencyKey: "issue-deca-0041" });
    expect(issued).toEqual({ data: { id: documentId, object: "transport_document", status: "issued" } });
    expect(keys).toEqual(["issue-deca-0041"]);
  });

  it("downloads the PDF of a version and the QR image as binary responses", async () => {
    const queries: URLSearchParams[] = [];
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0xff]);
    server.use(
      http.get(`${BASE_URL}/transport_documents/${documentId}/pdf`, ({ request }) => {
        queries.push(new URL(request.url).searchParams);
        return new HttpResponse("%PDF-deca", { headers: { "Content-Type": "application/pdf" } });
      }),
      http.get(`${BASE_URL}/transport_documents/${documentId}/qr`, ({ request }) => {
        queries.push(new URL(request.url).searchParams);
        return new HttpResponse(png, { headers: { "Content-Type": "image/png" } });
      }),
    );
    const client = testClient();
    const pdf = await client.transportDocuments.pdf(documentId, { version: 2 });
    expect(pdf.contentType).toBe("application/pdf");
    expect(pdf.toBuffer().toString()).toBe("%PDF-deca");
    const qr = await client.transportDocuments.qr(documentId, { format: "png" });
    expect(qr.contentType).toBe("image/png");
    expect([...qr.toBuffer()]).toEqual([...png]);
    expect(queries.map((query) => query.get("version") ?? query.get("format"))).toEqual(["2", "png"]);
  });
});
