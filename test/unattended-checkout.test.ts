import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { ConflictError, ValidationError } from "../src/index.js";
import { splitQueryAndConfig } from "../src/core/resource.js";
import type { CreateInvoiceRequest, InvoiceWithCheckoutBlocks } from "../src/index.js";
import { BASE_URL, server, testClient, useMockServer } from "./helpers.js";

useMockServer();

/**
 * Unattended checkout (kiosks, parking and toll machines): one idempotent
 * `POST /invoices` that issues an already-paid simplified invoice (F2) with the
 * VERI*FACTU alta generated before responding. The fixtures are the examples
 * the pinned contract publishes for the operation, so a contract change that
 * touches them fails here.
 */
type Json = Record<string, any>;
const spec = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "spec", "openapi.json"), "utf8"),
) as Json;
const createOperation = spec.paths["/invoices"].post as Json;
const responseExample = (status: string, name: string): Json =>
  createOperation.responses[status].content["application/json"].examples[name].value as Json;

/** A 5.00 € parking ticket paid by card, prices WITH VAT included, no client. */
const parkingTicket: CreateInvoiceRequest = {
  type: "F2",
  series_id: "019e5584-7a72-7038-a8f6-561ed180b699",
  issued_on: "2026-06-01",
  due_on: "2026-06-01",
  external_id: "KIOSK-0042-20260601-000187",
  prices_include_tax: true,
  lines: [{ description: "Aparcamiento 2 h 30 min", quantity: 1, unit_price: 5, tax_rate: 21 }],
  payment: { method: "credit_card", paid_at: "2026-06-01T10:42:11+02:00", reference: "TPV-8841-000187" },
  options: { register_verifactu: true, wait_for_pdf: true },
};

const issued = responseExample("201", "unattended_checkout") as { data: InvoiceWithCheckoutBlocks };
const replayed = responseExample("200", "idempotent_replay") as { data: InvoiceWithCheckoutBlocks };

describe("unattended checkout contract", () => {
  it("sends the same parking ticket the contract documents", () => {
    expect(spec.components.examples.invoice_cajero_ticket_anonimo.value).toEqual(parkingTicket);
  });
});

describe("invoices.create for an unattended checkout", () => {
  it("sends the anonymous F2 with VAT included, the payment and the external id in one idempotent call", async () => {
    let body: unknown;
    let headers: Headers | undefined;
    server.use(
      http.post(`${BASE_URL}/invoices`, async ({ request }) => {
        body = await request.json();
        headers = request.headers;
        return HttpResponse.json(issued, { status: 201 });
      }),
    );

    await testClient().invoices.create(parkingTicket);

    expect(body).toEqual(parkingTicket);
    expect(body).toMatchObject({
      type: "F2",
      prices_include_tax: true,
      external_id: "KIOSK-0042-20260601-000187",
      payment: { method: "credit_card", reference: "TPV-8841-000187" },
      options: { register_verifactu: true },
    });
    expect(body).not.toHaveProperty("client_id");
    expect(headers?.get("Idempotency-Key")).toBeTruthy();
    expect(headers?.get("Authorization")).toBe("Bearer fact_test_secret");
  });

  it("lets the terminal reuse its own Idempotency-Key across retries", async () => {
    const keys: Array<string | null> = [];
    server.use(
      http.post(`${BASE_URL}/invoices`, ({ request }) => {
        keys.push(request.headers.get("Idempotency-Key"));
        return HttpResponse.json(issued, { status: 201 });
      }),
    );
    const client = testClient();

    await client.invoices.create(parkingTicket, { idempotencyKey: parkingTicket.external_id! });
    await client.invoices.create(parkingTicket, { idempotencyKey: parkingTicket.external_id! });

    expect(keys).toEqual(["KIOSK-0042-20260601-000187", "KIOSK-0042-20260601-000187"]);
  });

  it("parses the invoice with the verifactu, pdf and public_url blocks the terminal prints", async () => {
    server.use(http.post(`${BASE_URL}/invoices`, () => HttpResponse.json(issued, { status: 201 })));

    const { data: invoice } = (await testClient().invoices.create(parkingTicket)) as { data: InvoiceWithCheckoutBlocks };

    expect(invoice.type).toBe("F2");
    expect(invoice.status).toBe("paid");
    expect(invoice.client).toEqual({ id: null, name: null });
    // 5.00 € with 21 % VAT included: 4.13 € of base plus 0.87 € of VAT, total exactly what was charged.
    expect(invoice.subtotal).toBe(4.13);
    expect(invoice.taxes_total).toBe(0.87);
    expect(invoice.total).toBe(5);
    expect(invoice.lines[0]?.unit_price).toBe(4.13);
    expect(invoice.payments.detail[0]).toMatchObject({ amount: 5, reference: "TPV-8841-000187", is_reversed: false });

    expect(invoice.verifactu).toMatchObject({ status: "registered", error_code: null, aeat_status: "pending", legend: "VERI*FACTU" });
    expect(invoice.verifactu?.huella).toMatch(/^[0-9A-F]{64}$/);
    expect(invoice.verifactu?.qr_url).toContain("ValidarQR?nif=");
    expect(invoice.verifactu?.qr_png_base64).toBeTruthy();
    expect(invoice.pdf).toMatchObject({ status: "ready" });
    expect(invoice.pdf?.url).toContain("/api/pdf/materialized");
    expect(invoice.public_url).toBe(invoice.public_link?.url);
  });

  it("returns the invoice already issued on a late retry: 200 with Idempotent-Replayed", async () => {
    let calls = 0;
    server.use(
      http.post(`${BASE_URL}/invoices`, () => {
        calls += 1;
        return calls === 1
          ? HttpResponse.json(issued, { status: 201, headers: { "Idempotent-Replayed": "false" } })
          : HttpResponse.json(replayed, { status: 200, headers: { "Idempotent-Replayed": "true" } });
      }),
    );
    const client = testClient();

    const first = await client.http.request<{ data: InvoiceWithCheckoutBlocks }>({ method: "POST", path: "/invoices", body: parkingTicket });
    const retry = await client.http.request<{ data: InvoiceWithCheckoutBlocks }>({ method: "POST", path: "/invoices", body: parkingTicket });

    expect(first.status).toBe(201);
    expect(first.headers.get("Idempotent-Replayed")).toBe("false");
    expect(retry.status).toBe(200);
    expect(retry.headers.get("Idempotent-Replayed")).toBe("true");
    // The retry hands back the same invoice, number and blocks: nothing new was created.
    expect(retry.data.data.id).toBe(first.data.data.id);
    expect(retry.data.data.number).toBe("TK-2026-01307");
    expect(retry.data.data.external_id).toBe(parkingTicket.external_id);
    expect(retry.data.data.verifactu?.huella).toBe(first.data.data.verifactu?.huella);
    expect(retry.data.data.payments.detail).toHaveLength(1);

    // The typed resource decodes the replay exactly like the first answer.
    const viaResource = (await client.invoices.create(parkingTicket)) as { data: InvoiceWithCheckoutBlocks };
    expect(viaResource.data.id).toBe(first.data.data.id);
    expect(calls).toBe(3);
  });

  it("keeps the invoice issued and the QR empty when the VeriFactu alta failed", async () => {
    const failedBlock: NonNullable<InvoiceWithCheckoutBlocks["verifactu"]> = {
      status: "failed",
      error_code: "certificate_missing",
      aeat_status: null,
      huella: null,
      qr_url: null,
      qr_png_base64: null,
      legend: null,
      csv: null,
    };
    server.use(
      http.post(`${BASE_URL}/invoices`, () =>
        HttpResponse.json({ data: { ...issued.data, verifactu: failedBlock, pdf: { ...issued.data.pdf, status: "pending" } } }, { status: 201 }),
      ),
    );

    const { data: invoice } = (await testClient().invoices.create(parkingTicket)) as { data: InvoiceWithCheckoutBlocks };

    expect(invoice.status).toBe("paid");
    expect(invoice.number).toBe("TK-2026-01307");
    expect(invoice.verifactu).toEqual(failedBlock);
    expect(invoice.pdf?.status).toBe("pending");
  });
});

describe("unattended checkout errors", () => {
  it.each([
    ["unattended_replay_mismatch", "idempotency_key_reused", "unattended_replay_mismatch"],
    ["resource_locked", "resource_locked", null],
  ] as const)("maps the 409 %s to a ConflictError carrying code, subcode and param", async (example, code, subcode) => {
    server.use(http.post(`${BASE_URL}/invoices`, () => HttpResponse.json(responseExample("409", example), { status: 409 })));

    const error = await testClient().invoices.create(parkingTicket).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ConflictError);
    expect(error).toMatchObject({ status: 409, code, subcode, param: "external_id" });
  });

  it("maps the 422 verifactu_not_eligible with the signing_certificate_unavailable subcode", async () => {
    server.use(
      http.post(`${BASE_URL}/invoices`, () => HttpResponse.json(responseExample("422", "signing_certificate_unavailable"), { status: 422 })),
    );

    const error = await testClient().invoices.create(parkingTicket).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ValidationError);
    expect(error).toMatchObject({ status: 422, code: "verifactu_not_eligible", subcode: "signing_certificate_unavailable", param: "certificate" });
  });

  it("rejects an email without recipient before anything is created", async () => {
    server.use(http.post(`${BASE_URL}/invoices`, () => HttpResponse.json(responseExample("422", "missing_send_to"), { status: 422 })));

    const error = await testClient()
      .invoices.create({ ...parkingTicket, options: { send_automatically: true } })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ValidationError);
    expect(error).toMatchObject({ status: 422, code: "missing_required_param", param: "options.send_to" });
  });

  it("exposes the line_index of the line a domain rule rejected", async () => {
    server.use(
      http.post(`${BASE_URL}/invoices`, () =>
        HttpResponse.json(
          {
            error: {
              type: "invalid_request_error",
              code: "missing_required_param",
              message: "La línea 2 no tiene tipo de IVA y la empresa no tiene un IVA por defecto.",
              param: "lines.1.tax_rate",
              line_index: 1,
              request_id: "req_line_index",
            },
          },
          { status: 422 },
        ),
      ),
    );

    const error = await testClient()
      .invoices.create({ ...parkingTicket, lines: [{ description: "A", quantity: 1, unit_price: 1, tax_rate: 21 }, { description: "B", quantity: 1, unit_price: 1 }] })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ValidationError);
    expect(error).toMatchObject({ code: "missing_required_param", param: "lines.1.tax_rate", lineIndex: 1 });
  });

  it("leaves lineIndex null when the error does not point at a line", async () => {
    server.use(http.post(`${BASE_URL}/invoices`, () => HttpResponse.json(responseExample("422", "missing_send_to"), { status: 422 })));

    const error = await testClient().invoices.create(parkingTicket).catch((e: unknown) => e);

    expect(error).toMatchObject({ lineIndex: null });
  });
});

describe("invoices.pdfLink after it gained the format query", () => {
  const invoiceId = "019e5b7a-3c1d-7a52-b4e1-6f2d9c8a1e37";
  const link = { data: { url: "https://app.factuarea.com/api/pdf/materialized?signature=abc", expires_at: "2026-06-02T10:42:14+02:00" } };

  function captureLink(): { requests: Request[] } {
    const captured: Request[] = [];
    server.use(
      http.get(`${BASE_URL}/invoices/${invoiceId}/pdf-link`, ({ request }) => {
        captured.push(request);
        return HttpResponse.json(link);
      }),
    );
    return { requests: captured };
  }

  it("still honours the previous (invoice, config) call: the options are not sent as a query", async () => {
    const { requests } = captureLink();

    const result = await testClient().invoices.pdfLink(invoiceId, { headers: { "X-Active-Profile": "managed-company" }, timeout: 5000, maxRetries: 0 });

    expect(result).toEqual(link);
    expect(requests).toHaveLength(1);
    expect(requests[0]?.headers.get("X-Active-Profile")).toBe("managed-company");
    expect(new URL(requests[0]!.url).search).toBe("");
  });

  it("still accepts a call with no options", async () => {
    const { requests } = captureLink();

    await testClient().invoices.pdfLink(invoiceId);

    expect(new URL(requests[0]!.url).search).toBe("");
  });

  it("sends format as a query parameter", async () => {
    const { requests } = captureLink();

    await testClient().invoices.pdfLink(invoiceId, { format: "ticket_80" });

    expect(new URL(requests[0]!.url).searchParams.get("format")).toBe("ticket_80");
  });

  it("takes the query second and the options third", async () => {
    const { requests } = captureLink();

    await testClient().invoices.pdfLink(invoiceId, { format: "ticket_58" }, { headers: { "X-Active-Profile": "managed-company" } });

    expect(new URL(requests[0]!.url).searchParams.get("format")).toBe("ticket_58");
    expect(requests[0]?.headers.get("X-Active-Profile")).toBe("managed-company");
  });

  it("takes the options third when the query is skipped", async () => {
    const { requests } = captureLink();

    await testClient().invoices.pdfLink(invoiceId, undefined, { headers: { "X-Active-Profile": "managed-company" } });

    expect(new URL(requests[0]!.url).search).toBe("");
    expect(requests[0]?.headers.get("X-Active-Profile")).toBe("managed-company");
  });
});

describe("splitQueryAndConfig", () => {
  it("reads a second argument made only of RequestConfig keys as the config", () => {
    expect(splitQueryAndConfig({ timeout: 1, headers: { A: "b" } }, undefined)).toEqual({ params: undefined, config: { timeout: 1, headers: { A: "b" } } });
  });

  it("reads anything else as the query, including an object that mixes both kinds of key", () => {
    expect(splitQueryAndConfig({ format: "a4" }, undefined)).toEqual({ params: { format: "a4" }, config: undefined });
    expect(splitQueryAndConfig({ format: "a4", timeout: 1 }, undefined)).toEqual({ params: { format: "a4", timeout: 1 }, config: undefined });
    expect(splitQueryAndConfig({}, undefined)).toEqual({ params: {}, config: undefined });
  });

  it("trusts the new shape whenever a third argument is given", () => {
    expect(splitQueryAndConfig({ timeout: 1 }, { maxRetries: 0 })).toEqual({ params: { timeout: 1 }, config: { maxRetries: 0 } });
    expect(splitQueryAndConfig(undefined, { maxRetries: 0 })).toEqual({ params: undefined, config: { maxRetries: 0 } });
  });
});
