// Compile-time contract of the document-template surface. The negatives are
// `@ts-expect-error` lines: if the types stop rejecting them, `tsc` reports the
// unused directive and `npm run typecheck` (and the scoped
// `tsc --noEmit -p tsconfig.document-contracts.json`) fails. The wrappers are
// never called: the functions below are only type-checked.
import { describe, expect, it } from "vitest";
import { Factuarea } from "../src/index.js";
import type { BinaryOrJsonResponse, PdfTemplateAsset } from "../src/index.js";

declare const sdk: Factuarea;
/** Company axis: every document-template call takes the company id first. */
const company = "0198a0a0-0000-7000-8000-0000000000c1";

async function money(): Promise<void> {
  await sdk.invoices.update(company, "inv", {
    payment_terms: [{ due_date: "2026-11-30", amount: "-100.00", payment_means: "04", account: { iban: "ES9121000418450200051332" } }],
  });
  await sdk.invoices.update(company, "inv", {
    payment_terms: [
      // @ts-expect-error the amount is a two-decimal string, never a number
      { due_date: "2026-11-30", amount: 100, payment_means: "04" },
    ],
  });
}

async function requiredNullable(): Promise<void> {
  await sdk.invoices.assignPresentation(company, "inv", { template_id: null });
  await sdk.invoices.assignPresentation(company, "inv", { template_id: "0198a0a0-0000-7000-8000-000000000002", expected_version: 3 });
  // @ts-expect-error template_id is required (null inherits) and cannot be left out
  await sdk.invoices.assignPresentation(company, "inv", { expected_version: 3 });
  await sdk.pdfTemplates.defaultsSet(company, {
    type_defaults: [
      // @ts-expect-error template_id is required in every entry; null clears the default
      { document_type: "invoice", purpose: "complete" },
    ],
  });
}

async function previewSource(): Promise<void> {
  await sdk.pdfTemplatePreviews.create(company, {
    document_type: "invoice",
    purpose: "complete",
    format: "a4",
    locale: "es",
    source: { kind: "persisted_draft", document_id: "inv" },
  });
  await sdk.pdfTemplatePreviews.create(company, {
    document_type: "invoice",
    purpose: "complete",
    format: "a4",
    locale: "es",
    // @ts-expect-error the source needs a known kind with all of its fields
    source: { kind: "example" },
  });
  // @ts-expect-error the triple document_type/purpose/format is required whole
  await sdk.pdfTemplatePreviews.create(company, { document_type: "invoice", locale: "es", source: { kind: "persisted_draft", document_id: "inv" } });
}

async function unions(): Promise<void> {
  const result = await sdk.invoices.pdf(company, "inv");
  // @ts-expect-error the union is not narrowed yet: only the binary side has a body
  result.body;
  // @ts-expect-error a 304 has no bytes: narrow on kind first
  result.toBuffer();
  if (result.kind === "binary") {
    result.body.byteLength;
    result.etag;
  } else if (result.kind === "json") {
    result.data;
    result.retryAfter;
  } else {
    result.status satisfies 304;
  }

  const asset = await sdk.pdfTemplates.assetGet(company, "a1");
  if (asset.kind === "json") {
    asset.data.sha256 satisfies string;
    asset.data.mime satisfies PdfTemplateAsset["mime"];
    // @ts-expect-error the metadata has no such field: no unknown fallback
    asset.data.public_url;
  }
}

async function companyAxis(): Promise<void> {
  await sdk.pdfTemplates.find(company, "tpl");
  await sdk.invoices.getPresentation(company, "inv");
  // @ts-expect-error the company id is the first argument: the template id alone is not enough
  await sdk.pdfTemplates.find("tpl");
  // @ts-expect-error the company id is the first argument: the invoice id alone is not enough
  await sdk.invoices.getPresentation("inv");
}

async function acceptance(): Promise<void> {
  await sdk.quotes.accept(company, "q", { expected_presentation_uuid: "0198a0a0-0000-7000-8000-000000000003" });
  await sdk.quotes.accept(company, "q", { expected_presentation_uuid: null });
  await sdk.proformas.accept(company, "pf", { expected_presentation_uuid: "0198a0a0-0000-7000-8000-000000000004" });
  // @ts-expect-error the retained capture is cited by its UUID, a string
  await sdk.quotes.accept(company, "q", { expected_presentation_uuid: 3 });
}

describe("document-template types", () => {
  it("narrows the bytes-or-JSON-or-304 union on kind", () => {
    const sample = { kind: "not_modified", status: 304, headers: new Headers(), requestId: null, etag: '"x"' } as BinaryOrJsonResponse;
    const label = sample.kind === "not_modified" ? `${sample.status}:${sample.etag}` : "other";
    expect(label).toBe('304:"x"');
  });

  it("keeps the compile-time checks reachable", () => {
    expect([money, requiredNullable, previewSource, unions, companyAxis, acceptance]).toHaveLength(6);
  });
});
