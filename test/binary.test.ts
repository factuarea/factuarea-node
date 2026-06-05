import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { BASE_URL, server, testClient, useMockServer } from "./helpers.js";
import { NotFoundError } from "../src/index.js";

useMockServer();

const PDF_BYTES = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]); // "%PDF-"

describe("binary downloads", () => {
  it("returns the raw bytes as a BinaryResponse preserving content-type", async () => {
    server.use(
      http.get(`${BASE_URL}/invoices/inv_1/pdf`, () =>
        HttpResponse.arrayBuffer(PDF_BYTES.buffer as ArrayBuffer, {
          headers: { "Content-Type": "application/pdf", "X-Request-Id": "req_pdf" },
        }),
      ),
    );

    const result = await testClient().invoices.pdf("inv_1");
    expect(result.contentType).toBe("application/pdf");
    expect(result.requestId).toBe("req_pdf");
    expect(new Uint8Array(result.body)).toEqual(PDF_BYTES);
  });

  it("exposes a Buffer helper in Node", async () => {
    server.use(
      http.get(`${BASE_URL}/invoices/inv_1/pdf`, () =>
        HttpResponse.arrayBuffer(PDF_BYTES.buffer as ArrayBuffer, { headers: { "Content-Type": "application/pdf" } }),
      ),
    );
    const result = await testClient().invoices.pdf("inv_1");
    const buffer = result.toBuffer();
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  });

  it("exposes a Blob helper with the right type", async () => {
    server.use(
      http.get(`${BASE_URL}/invoices/inv_1/pdf`, () =>
        HttpResponse.arrayBuffer(PDF_BYTES.buffer as ArrayBuffer, { headers: { "Content-Type": "application/pdf" } }),
      ),
    );
    const result = await testClient().invoices.pdf("inv_1");
    const blob = result.toBlob();
    expect(blob.type).toBe("application/pdf");
    expect(blob.size).toBe(PDF_BYTES.length);
  });

  it("maps an error response on a binary endpoint to a typed error", async () => {
    server.use(
      http.get(`${BASE_URL}/invoices/missing/pdf`, () =>
        HttpResponse.json({ error: { type: "not_found_error", code: "resource_not_found", request_id: "r1" } }, { status: 404 }),
      ),
    );
    await expect(testClient().invoices.pdf("missing")).rejects.toBeInstanceOf(NotFoundError);
  });
});
