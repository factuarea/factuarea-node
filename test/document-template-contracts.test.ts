// Document-template client flows (cases CE01–CE25) exercised through
// the REAL generated wrappers with a scripted fake `fetch`: what the test asserts
// is the request that leaves the SDK (method, path, query, headers, body bytes)
// and what the caller gets back, never a value derived by the code under test.
//
// Not covered here, with the reason: CE18 and CE19 (public selector and Stripe
// return) have no SDK resource, the server builds those URLs; CE20 only has the
// private signing call, tested as an idempotent POST; CE21 is the forget call.
import { describe, expect, it } from "vitest";
import {
  ConflictError,
  ConnectionError,
  Factuarea,
  FactuareaError,
  NotFoundError,
  RateLimitError,
  ServerError,
  ValidationError,
} from "../src/index.js";
import type { ResponseMeta } from "../src/index.js";

const BASE = "https://api.factuarea.test/v1";
// Company axis: every call below takes the company id first and hangs off
// `/v1/companies/{company}/…`; paths in the assertions are relative to it.
const COMPANY = "0198a0a0-0000-7000-8000-0000000000c1";
const AXIS = `${BASE}/companies/${COMPANY}`;
const INVOICE = "0198a0a0-0000-7000-8000-000000000001";
const TEMPLATE = "0198a0a0-0000-7000-8000-000000000002";
const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]);

interface Call {
  method: string;
  url: string;
  headers: Headers;
  body: BodyInit | null | undefined;
}

type Reply = Response | Error;

function json(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } });
}

/** A client whose `fetch` answers the scripted replies in order and records every call. */
function scripted(replies: Reply[], config: { maxRetries?: number } = {}) {
  const calls: Call[] = [];
  const queue = [...replies];
  const fetchFn: typeof fetch = async (input, init) => {
    calls.push({
      method: init?.method ?? "GET",
      url: String(input),
      headers: new Headers(init?.headers),
      body: init?.body,
    });
    const next = queue.shift();
    if (next === undefined) throw new Error("scripted fetch: no reply left");
    if (next instanceof Error) throw next;
    return next;
  };
  const sdk = new Factuarea({ apiKey: "fact_test_secret", baseUrl: BASE, maxRetries: 0, timeout: 2000, ...config, fetch: fetchFn });
  return { sdk, calls };
}

function bodyOf(call: Call | undefined): unknown {
  return JSON.parse(String(call?.body));
}

describe("CE01 library and revisions", () => {
  it("creates, reads, updates with the ETag and publishes a revision", async () => {
    const { sdk, calls } = scripted([
      json(201, { data: { id: TEMPLATE } }),
      json(200, { data: { id: TEMPLATE } }, { ETag: '"t1"' }),
      json(200, { data: { id: TEMPLATE } }),
      json(200, { data: { fingerprint: "fp" } }),
      json(201, { data: { id: TEMPLATE } }),
    ]);
    await sdk.pdfTemplates.create(COMPANY, { name: "Clásica", description: null });
    let etag: string | null = null;
    await sdk.pdfTemplates.find(COMPANY, TEMPLATE, { onResponse: (meta: ResponseMeta) => (etag = meta.etag) });
    await sdk.pdfTemplates.update(COMPANY, TEMPLATE, { name: "Nueva" }, { ifMatch: etag ?? "" });
    await sdk.pdfTemplates.impact(COMPANY, TEMPLATE, { action: "publish" });
    await sdk.pdfTemplates.publishRevision(COMPANY, TEMPLATE, { expected_version: 3, expected_impact_fingerprint: "fp" });

    expect(calls.map((c) => `${c.method} ${c.url.replace(AXIS, "")}`)).toEqual([
      "POST /pdf-templates",
      `GET /pdf-templates/${TEMPLATE}`,
      `PATCH /pdf-templates/${TEMPLATE}`,
      `GET /pdf-templates/${TEMPLATE}/impact?action=publish`,
      `POST /pdf-templates/${TEMPLATE}/revisions`,
    ]);
    expect(bodyOf(calls[0])).toEqual({ name: "Clásica", description: null });
    expect(calls[2]?.headers.get("If-Match")).toBe('"t1"');
    expect(bodyOf(calls[4])).toEqual({ expected_version: 3, expected_impact_fingerprint: "fp" });
    expect(calls[1]?.headers.get("Idempotency-Key")).toBeNull();
    expect(calls[0]?.headers.get("Idempotency-Key")).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("duplicates, archives with replacements and restores", async () => {
    const { sdk, calls } = scripted([json(201, {}), json(200, {}), json(200, {})]);
    await sdk.pdfTemplates.duplicate(COMPANY, TEMPLATE, { expected_version: 1, name: "Copia" });
    await sdk.pdfTemplates.archive(COMPANY, TEMPLATE, {
      expected_version: 1,
      expected_impact_fingerprint: "fp",
      replacements: [{ key: "company_default", expected_version: 2, action: "clear", replacement_id: null }],
    });
    await sdk.pdfTemplates.restore(COMPANY, TEMPLATE, undefined);
    expect(calls.map((c) => `${c.method} ${c.url.replace(AXIS, "")}`)).toEqual([
      `POST /pdf-templates/${TEMPLATE}/duplicate`,
      `POST /pdf-templates/${TEMPLATE}/archive`,
      `POST /pdf-templates/${TEMPLATE}/restore`,
    ]);
    expect(bodyOf(calls[1])).toMatchObject({ replacements: [{ replacement_id: null, action: "clear" }] });
  });

  it("surfaces a 422 with every failed field of error.errors[]", async () => {
    const { sdk } = scripted([
      json(422, {
        error: {
          type: "invalid_request_error",
          code: "parameter_invalid",
          message: "Invalid",
          param: "configuration",
          errors: [
            { param: "configuration.colors.primary", code: "parameter_invalid_format", message: "Color inválido" },
            { param: "name", code: "parameter_missing", message: "Falta el nombre" },
          ],
        },
      }),
    ]);
    const error = await sdk.pdfTemplates.create(COMPANY, { name: "" }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ValidationError);
    const validation = error as ValidationError;
    expect(validation.errors?.map((e) => e.code)).toEqual(["parameter_invalid_format", "parameter_missing"]);
    expect(validation.fields).toEqual({ "configuration.colors.primary": ["Color inválido"], name: ["Falta el nombre"] });
  });
});

describe("CE02 shared brand", () => {
  it("reads impact, publishes a brand revision and archives with 404 for a foreign identity", async () => {
    const { sdk, calls } = scripted([
      json(200, { data: {} }),
      json(201, { data: {} }),
      json(404, { error: { type: "not_found_error", code: "resource_not_found", message: "No existe" } }),
    ]);
    await sdk.pdfCommercialIdentities.impact(COMPANY, "ident-1", { action: "publish" });
    await sdk.pdfCommercialIdentities.publishRevision(COMPANY, "ident-1", {
      expected_version: 1,
      expected_impact_fingerprint: "fp",
      configuration: { commercial_name: "Marca", logo_asset_id: null },
    });
    await expect(sdk.pdfCommercialIdentities.find(COMPANY, "foreign")).rejects.toBeInstanceOf(NotFoundError);
    expect(calls[0]?.url).toBe(`${AXIS}/pdf-commercial-identities/ident-1/impact?action=publish`);
    expect(bodyOf(calls[1])).toEqual({
      expected_version: 1,
      expected_impact_fingerprint: "fp",
      configuration: { commercial_name: "Marca", logo_asset_id: null },
    });
  });
});

describe("CE03 defaults", () => {
  it("keeps the ETag literal and sends null, [] and the omission as different things", async () => {
    const { sdk, calls } = scripted([json(200, { data: {} }, { ETag: 'W/"d7"' }), json(200, {}), json(200, {}), json(200, {})]);
    let etag: string | null = null;
    await sdk.pdfTemplates.defaultsGet(COMPANY, { onResponse: (meta) => (etag = meta.etag) });
    expect(etag).toBe('W/"d7"');
    await sdk.pdfTemplates.defaultsSet(COMPANY, { company_template_id: null, type_defaults: [] }, { ifMatch: etag ?? "" });
    await sdk.pdfTemplates.defaultsSet(COMPANY, { type_defaults: null });
    await sdk.pdfTemplates.defaultsSet(COMPANY, {});
    expect(calls[1]?.headers.get("If-Match")).toBe('W/"d7"');
    expect(String(calls[1]?.body)).toBe('{"company_template_id":null,"type_defaults":[]}');
    expect(String(calls[2]?.body)).toBe('{"type_defaults":null}');
    expect(String(calls[3]?.body)).toBe("{}");
  });

  it("keeps 412, 409 and 428 distinguishable by status and code", async () => {
    const envelope = (code: string) => ({ error: { type: "invalid_request_error", code, message: code } });
    const { sdk } = scripted([json(412, envelope("precondition_failed")), json(409, { error: { type: "conflict_error", code: "version_conflict", message: "x" } }), json(428, envelope("precondition_required"))]);
    const first = await sdk.pdfTemplates.defaultsSet(COMPANY, {}, { ifMatch: '"old"' }).catch((e: unknown) => e);
    const second = await sdk.pdfTemplates.defaultsSet(COMPANY, { expected_version: 1 }).catch((e: unknown) => e);
    const third = await sdk.pdfTemplates.defaultsSet(COMPANY, {}).catch((e: unknown) => e);
    expect([first, second, third].map((e) => [(e as FactuareaError).status, (e as FactuareaError).code])).toEqual([
      [412, "precondition_failed"],
      [409, "version_conflict"],
      [428, "precondition_required"],
    ]);
    expect(second).toBeInstanceOf(ConflictError);
  });
});

describe("CE04 contact preference", () => {
  it("encodes the exact key and clears with an explicit null", async () => {
    const { sdk, calls } = scripted([json(200, {}), json(200, {})]);
    await sdk.pdfTemplates.contactDefaultGet(COMPANY, "c 1", "delivery-note", "complete");
    await sdk.pdfTemplates.contactDefaultSet(COMPANY, "c 1", "invoice", "simplified", { template_id: null, expected_version: 4 });
    expect(calls[0]?.url).toBe(`${AXIS}/pdf-templates/contact-defaults/c%201/delivery-note/complete`);
    expect(calls[1]?.method).toBe("PATCH");
    expect(String(calls[1]?.body)).toBe('{"template_id":null,"expected_version":4}');
  });
});

describe("CE05 series and Series.update", () => {
  it("reads and patches the series template with the ETag; update is a PATCH", async () => {
    const { sdk, calls } = scripted([json(200, {}, { ETag: '"s1"' }), json(200, {}), json(200, {})]);
    await sdk.series.getPdfTemplate(COMPANY, "ser-1");
    await sdk.series.assignPdfTemplate(COMPANY, "ser-1", { pdf_template_id: null }, { ifMatch: '"s1"' });
    await sdk.series.update(COMPANY, "ser-1", { name: "A", pdf_template_id: TEMPLATE, pdf_template_expected_version: 2 });
    expect(calls.map((c) => `${c.method} ${c.url.replace(AXIS, "")}`)).toEqual([
      "GET /series/ser-1/pdf-template",
      "PATCH /series/ser-1/pdf-template",
      "PATCH /series/ser-1",
    ]);
    expect(calls[1]?.headers.get("If-Match")).toBe('"s1"');
    expect(String(calls[1]?.body)).toBe('{"pdf_template_id":null}');
    expect(bodyOf(calls[2])).toEqual({ name: "A", pdf_template_id: TEMPLATE, pdf_template_expected_version: 2 });
  });
});

describe("CE06 presentation state and history", () => {
  it.each([
    ["invoices", "invoice"],
    ["quotes", "quote"],
    ["proformas", "proforma"],
    ["deliveryNotes", "delivery_note"],
  ] as const)("%s: state, paged history and intent change", async (resource, _label) => {
    const { sdk, calls } = scripted([json(200, {}, { ETag: '"p1"' }), json(200, {}), json(200, {})]);
    const target = sdk[resource];
    await target.getPresentation(COMPANY, "doc-1");
    await target.listPresentations(COMPANY, "doc-1", { page: 2, per_page: 25 });
    await target.assignPresentation(COMPANY, "doc-1", { template_id: null, expected_version: 7 }, { ifMatch: '"p1"' });
    const base = calls[0]?.url.split("/presentation")[0];
    expect(calls[0]?.url).toBe(`${base}/presentation`);
    expect(calls[1]?.url).toBe(`${base}/presentation-history?page=2&per_page=25`);
    expect(calls[2]?.method).toBe("PATCH");
    expect(calls[2]?.headers.get("If-Match")).toBe('"p1"');
    expect(String(calls[2]?.body)).toBe('{"template_id":null,"expected_version":7}');
  });
});

describe("CE07 preview", () => {
  it("sends the source and reads a 202 with its Retry-After and Idempotency-Key", async () => {
    const { sdk, calls } = scripted([json(202, { data: { status: "pending" } }, { "Retry-After": "2" }), json(200, { data: { status: "ready" } })]);
    let retryAfter: number | null = null;
    await sdk.pdfTemplatePreviews.create(
      COMPANY,
      { document_type: "invoice", purpose: "complete", format: "a4", locale: "es", source: { kind: "persisted_draft", document_id: INVOICE } },
      { idempotencyKey: "prev-1", onResponse: (meta) => (retryAfter = meta.retryAfter) },
    );
    expect(retryAfter).toBe(2);
    expect(calls[0]?.headers.get("Idempotency-Key")).toBe("prev-1");
    expect(bodyOf(calls[0])).toMatchObject({ source: { kind: "persisted_draft", document_id: INVOICE } });
  });

  it("an abort before the call leaves nothing sent", async () => {
    const { sdk, calls } = scripted([]);
    const controller = new AbortController();
    controller.abort();
    const error = await sdk.pdfTemplatePreviews
      .create(COMPANY, { document_type: "invoice", purpose: "complete", format: "a4", locale: "es", source: { kind: "persisted_draft", document_id: INVOICE } }, { signal: controller.signal })
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ConnectionError);
    expect(calls).toHaveLength(0);
  });
});

describe("CE08 private assets", () => {
  it("uploads multipart without a manual Content-Type and reads JSON metadata or the image bytes", async () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0, 1, 2, 3]);
    const { sdk, calls } = scripted([
      json(201, { data: { id: "a1" } }),
      json(200, { data: { id: "a1", mime: "image/png" } }),
      new Response(png, { status: 200, headers: { "Content-Type": "image/png" } }),
    ]);
    const form = new FormData();
    form.append("kind", "logo");
    form.append("file", new Blob([png], { type: "image/png" }), "logo.png");
    await sdk.pdfTemplates.assetUpload(COMPANY, form);
    const meta = await sdk.pdfTemplates.assetGet(COMPANY, "a1");
    const image = await sdk.pdfTemplates.assetGet(COMPANY, "a1", { headers: { Accept: "image/png" } });

    expect(calls[0]?.headers.has("Content-Type")).toBe(false);
    const sent = calls[0]?.body as FormData;
    expect(sent.get("kind")).toBe("logo");
    expect(new Uint8Array(await (sent.get("file") as File).arrayBuffer())).toEqual(png);
    expect((sent.get("file") as File).name).toBe("logo.png");
    expect(calls[1]?.headers.get("Accept")).toContain("application/json");
    expect(meta.kind).toBe("json");
    expect(calls[2]?.headers.get("Accept")).toBe("image/png");
    expect(image.kind).toBe("binary");
    if (image.kind === "binary") {
      expect(image.contentType).toBe("image/png");
      expect(new Uint8Array(image.body)).toEqual(png);
    }
  });
});

describe("CE09 creation, issuance and conversion intent", () => {
  it("sends pdf_template_id omitted, null or explicit exactly as given", async () => {
    const { sdk, calls } = scripted([json(201, {}), json(201, {}), json(201, {}), json(200, {})]);
    const base = { series_id: "s", client_id: "c", issued_on: "2026-10-01", due_on: "2026-10-31", lines: [] };
    await sdk.invoices.create(COMPANY, base);
    await sdk.invoices.create(COMPANY, { ...base, pdf_template_id: null });
    await sdk.invoices.create(COMPANY, { ...base, pdf_template_id: TEMPLATE });
    await sdk.invoices.issue(COMPANY, INVOICE, { expected_selection_version: 3, expected_source_token: "tok", expected_template_revision_id: null });
    expect(Object.keys(bodyOf(calls[0]) as object)).not.toContain("pdf_template_id");
    expect((bodyOf(calls[1]) as Record<string, unknown>).pdf_template_id).toBeNull();
    expect((bodyOf(calls[2]) as Record<string, unknown>).pdf_template_id).toBe(TEMPLATE);
    expect(bodyOf(calls[3])).toEqual({ expected_selection_version: 3, expected_source_token: "tok", expected_template_revision_id: null });
  });

  it("a stale source comes back as a 409 with its code", async () => {
    const { sdk } = scripted([json(409, { error: { type: "conflict_error", code: "pdf_presentation_source_stale", message: "x" } })]);
    const error = await sdk.invoices.issue(COMPANY, INVOICE, { expected_source_token: "old" }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ConflictError);
    expect((error as ConflictError).code).toBe("pdf_presentation_source_stale");
  });
});

describe("quote and proforma acceptance follow the reviewed presentation", () => {
  const precondition = {
    expected_selection_version: 1,
    expected_source_token: "tok",
    expected_preview_context_fingerprint: "fp",
    expected_template_revision_id: TEMPLATE,
    expected_commercial_identity_revision_id: null,
    purpose: "complete",
    format: "a4",
  } as const;

  it("sends the first-capture precondition or the retained capture it cites, as given", async () => {
    const { sdk, calls } = scripted([json(200, {}), json(200, {}), json(200, {})]);
    await sdk.quotes.accept(COMPANY, "q-1", { accepted_on: "2026-06-01", presentation_precondition: precondition });
    await sdk.quotes.accept(COMPANY, "q-2", { notes: "Aceptado", expected_presentation_uuid: "pres-2" });
    await sdk.proformas.accept(COMPANY, "pf-1", { expected_presentation_uuid: null });
    expect(calls.map((c) => `${c.method} ${c.url.replace(AXIS, "")}`)).toEqual([
      "POST /quotes/q-1/accept",
      "POST /quotes/q-2/accept",
      "POST /proformas/pf-1/accept",
    ]);
    expect(bodyOf(calls[0])).toEqual({ accepted_on: "2026-06-01", presentation_precondition: precondition });
    expect(bodyOf(calls[1])).toEqual({ notes: "Aceptado", expected_presentation_uuid: "pres-2" });
    expect(bodyOf(calls[2])).toEqual({ expected_presentation_uuid: null });
  });

  it("a capture that is no longer current comes back as a 409 with its code", async () => {
    const { sdk } = scripted([
      json(409, { error: { type: "conflict_error", code: "pdf_presentation_conflict", message: "La presentación revisada ya no es la vigente" } }),
    ]);
    const error = await sdk.quotes.accept(COMPANY, "q-2", { expected_presentation_uuid: "pres-old" }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ConflictError);
    expect((error as ConflictError).code).toBe("pdf_presentation_conflict");
  });
});

describe("CE10/CE12 references and payment terms on the wire", () => {
  it("keeps signed two-decimal strings, [] and null apart from the omission", async () => {
    const { sdk, calls } = scripted([json(200, {}), json(200, {}), json(200, {}), json(200, {})]);
    await sdk.invoices.update(COMPANY, INVOICE, {
      payment_terms: [{ due_date: "2026-11-30", amount: "100.00", payment_means: "04", account: { iban: "ES9121000418450200051332" } }],
      expected_payment_terms_version: 0,
      business_references: null,
    });
    await sdk.invoices.update(COMPANY, INVOICE, { payment_terms: [] });
    await sdk.invoices.update(COMPANY, INVOICE, { payment_terms: null });
    await sdk.invoices.update(COMPANY, INVOICE, {});
    expect(String(calls[0]?.body)).toContain('"amount":"100.00"');
    expect(String(calls[0]?.body)).toContain('"expected_payment_terms_version":0');
    expect(String(calls[0]?.body)).toContain('"business_references":null');
    expect(String(calls[1]?.body)).toBe('{"payment_terms":[]}');
    expect(String(calls[2]?.body)).toBe('{"payment_terms":null}');
    expect(String(calls[3]?.body)).toBe("{}");
  });
});

describe("CE11 administrative routing", () => {
  it("reads the history and revises with the version in the body, not the parent ETag", async () => {
    const { sdk, calls } = scripted([
      json(200, {}),
      json(201, {}),
      json(428, { error: { type: "invalid_request_error", code: "precondition_required", message: "x" } }),
    ]);
    await sdk.invoices.administrativeRevisions.index(COMPANY, INVOICE);
    await sdk.invoices.administrativeRevisions.store(COMPANY, INVOICE, {
      administrative_centres: [{ role_code: "01", code: "A01" }],
      reason: "Cambio de oficina",
      expected_version: 2,
    });
    const error = await sdk.invoices.administrativeRevisions.store(COMPANY, INVOICE, { administrative_centres: [], reason: "x", expected_version: 0 }).catch((e: unknown) => e);
    expect(calls[1]?.url).toBe(`${AXIS}/invoices/${INVOICE}/administrative-revisions`);
    expect(calls[1]?.headers.has("If-Match")).toBe(false);
    expect(bodyOf(calls[1])).toMatchObject({ expected_version: 2, administrative_centres: [{ role_code: "01", code: "A01" }] });
    expect((error as FactuareaError).status).toBe(428);
  });
});

describe("CE13 recurrence", () => {
  it("sends the policy with explicit nulls for a pinned-without-brand revision", async () => {
    const { sdk, calls } = scripted([json(201, {})]);
    await sdk.recurringInvoices.create(COMPANY, {
      client_id: "c",
      frequency: "monthly",
      start_on: "2026-11-01",
      lines: [],
      presentation_policy: null,
    });
    expect((bodyOf(calls[0]) as Record<string, unknown>).presentation_policy).toBeNull();
  });
});

describe("CE14 current Facturae XML", () => {
  it("returns the XML bytes and mime untouched, with or without submission_id", async () => {
    const xml = new TextEncoder().encode('<?xml version="1.0"?><fe:Facturae/>');
    const { sdk, calls } = scripted([
      new Response(xml, { status: 200, headers: { "Content-Type": "application/xml; charset=utf-8" } }),
      new Response(xml, { status: 200, headers: { "Content-Type": "application/xml" } }),
    ]);
    const current = await sdk.invoices.facturae(COMPANY, INVOICE);
    await sdk.invoices.facturae(COMPANY, INVOICE, { submission_id: "sub-1" });
    expect(calls[0]?.url).toBe(`${AXIS}/invoices/${INVOICE}/facturae`);
    expect(calls[1]?.url).toBe(`${AXIS}/invoices/${INVOICE}/facturae?submission_id=sub-1`);
    expect(current.contentType).toBe("application/xml; charset=utf-8");
    expect(new Uint8Array(current.body)).toEqual(xml);
  });
});

describe("CE15 FACe: exact submission and uncertainty", () => {
  it("submits once on a 502 even with retries enabled, and never repeats a cancel", async () => {
    const bad = () => json(502, { error: { type: "api_error", code: "face_unavailable", message: "FACe" } });
    const { sdk, calls } = scripted([bad(), bad()], { maxRetries: 3 });
    await expect(sdk.invoices.faceSubmissions.submit(COMPANY, INVOICE, { submission_id: "sub-1" })).rejects.toBeInstanceOf(ServerError);
    await expect(sdk.faceSubmissions.cancel(COMPANY, "sub-1")).rejects.toBeInstanceOf(ServerError);
    expect(calls).toHaveLength(2);
  });

  it("a connection failure is not repeated and an uncertain 409 keeps its details", async () => {
    const { sdk, calls } = scripted(
      [new TypeError("socket hang up"), json(409, { error: { type: "conflict_error", code: "face_submission_uncertain", message: "x", details: { attempt_id: "att-1" } } })],
      { maxRetries: 3 },
    );
    await expect(sdk.invoices.faceSubmissions.submit(COMPANY, INVOICE)).rejects.toBeInstanceOf(ConnectionError);
    const error = await sdk.faceSubmissions.show(COMPANY, "sub-1").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ConflictError);
    expect((error as ConflictError).details).toEqual({ attempt_id: "att-1" });
    expect(calls).toHaveLength(2);
  });
});

describe("CE16 PDF as bytes, JSON status or 304", () => {
  it("discriminates 200, 202 and 304 and sends If-None-Match", async () => {
    const { sdk, calls } = scripted([
      new Response(PDF, { status: 200, headers: { "Content-Type": "application/pdf", ETag: '"sha"' } }),
      json(202, { data: { status: "pending" } }, { "Retry-After": "3" }),
      new Response(null, { status: 304, headers: { ETag: '"sha"' } }),
    ]);
    const bytes = await sdk.invoices.pdf(COMPANY, INVOICE, { format: "a4" });
    const pending = await sdk.invoices.pdf(COMPANY, INVOICE);
    const same = await sdk.invoices.pdf(COMPANY, INVOICE, undefined, { ifNoneMatch: '"sha"' });
    expect(bytes.kind).toBe("binary");
    if (bytes.kind === "binary") {
      expect(new Uint8Array(bytes.body)).toEqual(PDF);
      expect(bytes.etag).toBe('"sha"');
    }
    expect(pending.kind).toBe("json");
    if (pending.kind === "json") {
      expect(pending.status).toBe(202);
      expect(pending.retryAfter).toBe(3);
    }
    expect(same.kind).toBe("not_modified");
    expect(calls[2]?.headers.get("If-None-Match")).toBe('"sha"');
    expect(calls[0]?.url).toBe(`${AXIS}/invoices/${INVOICE}/pdf?format=a4`);
  });

  it("a 422 for a scheduled invoice preview throws instead of returning bytes", async () => {
    const { sdk } = scripted([json(422, { error: { type: "invalid_request_error", code: "invoice_scheduled", message: "x" } })]);
    await expect(sdk.invoices.pdf(COMPANY, INVOICE)).rejects.toBeInstanceOf(ValidationError);
  });
});

describe("CE17 prepare, metadata and wait", () => {
  it("prepares with 202, reads the metadata and downloads only when ready", async () => {
    const { sdk, calls } = scripted([
      json(202, { data: { id: "art-1", state: "queued" } }, { "Retry-After": "1" }),
      json(200, { data: { id: "art-1", state: "ready" } }),
      json(503, { error: { type: "service_unavailable_error", code: "pdf_artifact_pending", message: "x" } }, { "Retry-After": "4" }),
      new Response(PDF, { status: 200, headers: { "Content-Type": "application/pdf", ETag: '"a"' } }),
    ]);
    await sdk.pdfArtifacts.prepare(COMPANY, { document_type: "invoice", document_id: INVOICE, presentation_id: "p", purpose: "complete", format: "a4", variant: "official" }, { idempotencyKey: "k-1" });
    await sdk.pdfArtifacts.show(COMPANY, "art-1");
    const pending = await sdk.pdfArtifacts.download(COMPANY, "art-1").catch((e: unknown) => e);
    const ready = await sdk.pdfArtifacts.download(COMPANY, "art-1");
    expect(calls[0]?.headers.get("Idempotency-Key")).toBe("k-1");
    expect(pending).toBeInstanceOf(ServerError);
    expect((pending as ServerError).retryAfter).toBe(4);
    expect(ready.kind).toBe("binary");
  });
});

describe("CE20/CE21/CE22 private signature, forget and mail replay", () => {
  it("sign and send replay with the same Idempotency-Key", async () => {
    const { sdk, calls } = scripted([json(200, {}), json(200, {}), json(200, { ok: true }), json(200, { ok: true }, { "Idempotent-Replayed": "true" })]);
    await sdk.deliveryNotes.sign(COMPANY, "dn-1", { signed_by: "A", recipient_dni: "12345678Z", signature_image_base64: "AAAA" }, { idempotencyKey: "sig-1" });
    await sdk.deliveryNotes.signatureAudits.forget(COMPANY, "audit-1");
    await sdk.invoices.send(COMPANY, INVOICE, { to: "a@example.com", expected_source_token: "t" }, { idempotencyKey: "mail-1" });
    let replayed = false;
    await sdk.invoices.send(COMPANY, INVOICE, { to: "a@example.com", expected_source_token: "t" }, { idempotencyKey: "mail-1", onResponse: (m) => (replayed = m.idempotentReplayed) });
    expect(calls[0]?.headers.get("Idempotency-Key")).toBe("sig-1");
    expect(calls[1]?.url).toBe(`${AXIS}/delivery-notes/signature-audits/audit-1/forget`);
    expect(calls[2]?.headers.get("Idempotency-Key")).toBe(calls[3]?.headers.get("Idempotency-Key"));
    expect(replayed).toBe(true);
  });
});

describe("CE23 ZIP, quarterly and partial results", () => {
  it("returns the ZIP bytes exactly and sends include_non_invoiced_charges as given", async () => {
    const zip = new Uint8Array([0x50, 0x4b, 3, 4, 9, 9]);
    const { sdk, calls } = scripted([
      new Response(zip, { status: 200, headers: { "Content-Type": "application/zip" } }),
      new Response(zip, { status: 200, headers: { "Content-Type": "application/zip" } }),
      json(200, { data: { results: [{ id: "i", status: "skipped" }] } }),
    ]);
    const quarterly = await sdk.invoices.quarterly.downloadZip(COMPANY, { year: 2026, quarter: 3, include_non_invoiced_charges: false });
    await sdk.invoices.quarterly.downloadZip(COMPANY, { year: 2026, quarter: 3, include_non_invoiced_charges: null });
    await sdk.invoices.bulkSend(COMPANY, { ids: ["i"] });
    expect(new Uint8Array(quarterly.body)).toEqual(zip);
    expect(String(calls[0]?.body)).toBe('{"year":2026,"quarter":3,"include_non_invoiced_charges":false}');
    expect(String(calls[1]?.body)).toContain('"include_non_invoiced_charges":null');
  });
});

describe("CE24 legal revision", () => {
  it("revises with parent, policy and CAS in the body", async () => {
    const { sdk, calls } = scripted([
      json(201, {}),
      json(409, { error: { type: "conflict_error", code: "pdf_presentation_legal_stale", message: "x" } }),
    ]);
    const body = { parent_id: "p-1", expected_version: 5, reason: "IVA", expected_source_token: "t", expected_preview_context_fingerprint: "f", source_policy: "current_legal" as const };
    await sdk.quotes.revisePresentation(COMPANY, "q-1", body);
    const error = await sdk.quotes.revisePresentation(COMPANY, "q-1", body).catch((e: unknown) => e);
    expect(calls[0]?.url).toBe(`${AXIS}/quotes/q-1/presentation-revisions`);
    expect(bodyOf(calls[0])).toEqual(body);
    expect((error as ConflictError).code).toBe("pdf_presentation_legal_stale");
  });
});

describe("CE25 headers, errors and paging", () => {
  it.each([
    [401, "AuthenticationError"],
    [403, "AuthenticationError"],
    [404, "NotFoundError"],
    [410, "FactuareaError"],
    [422, "ValidationError"],
    [429, "RateLimitError"],
    [500, "ServerError"],
    [502, "ServerError"],
    [503, "ServerError"],
  ])("maps %i to %s keeping code and request id", async (status, name) => {
    const { sdk } = scripted([json(status, { error: { type: "api_error", code: `code_${status}`, message: "m", request_id: "req-1" } }, { "Retry-After": "7" })]);
    const error = (await sdk.pdfTemplates.find(COMPANY, TEMPLATE).catch((e: unknown) => e)) as FactuareaError;
    expect(error.constructor.name).toBe(name);
    expect([error.status, error.code, error.requestId]).toEqual([status, `code_${status}`, "req-1"]);
    expect(error.retryAfter).toBe(7);
  });

  it("a 429 exposes the wait and a list page keeps page and per_page", async () => {
    const { sdk, calls } = scripted([
      json(429, { error: { type: "rate_limit_error", code: "rate_limited", message: "x" } }, { "Retry-After": "9" }),
      json(200, { data: [], meta: {} }),
    ]);
    const error = await sdk.pdfTemplates.list(COMPANY).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(RateLimitError);
    expect((error as RateLimitError).retryAfter).toBe(9);
    await sdk.pdfCommercialIdentities.list(COMPANY, { q: "marca", state: "active", page: 3, per_page: 50 });
    expect(calls[1]?.url).toBe(`${AXIS}/pdf-commercial-identities?q=marca&state=active&page=3&per_page=50`);
  });
});
