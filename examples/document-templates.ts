/**
 * Document templates: library, per-document presentation, PDF output and FACe.
 *
 * Each function is a self-contained flow; none runs on import. In your project:
 * `import { Factuarea } from "@factuarea/sdk";`
 */
import { writeFile } from "node:fs/promises";
import { setTimeout as sleep } from "node:timers/promises";
import { ConflictError, ConnectionError, Factuarea } from "../src/index.js";

const factuarea = new Factuarea({ apiKey: process.env.FACTUAREA_API_KEY ?? "fact_test_xxx" });

// Company axis: templates, presentations and PDFs hang off `/v1/companies/{company}/…`,
// so the company id is the first argument of every call below. It is the `id` that
// `factuarea.account.show()` returns in `data.scope[].id`.
const company = process.env.FACTUAREA_COMPANY_ID ?? "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a01";

/** Create a template, read what publishing it affects and publish its first revision. */
export async function createAndPublishTemplate(): Promise<string> {
  const template = await factuarea.pdfTemplates.create(company, { name: "Clásica", description: null });
  const impact = await factuarea.pdfTemplates.impact(company, template.id, { action: "publish" });
  await factuarea.pdfTemplates.publishRevision(company, template.id, {
    expected_version: template.version,
    expected_impact_fingerprint: impact.impact_fingerprint,
  });
  return template.id;
}

/**
 * Pin a template on an invoice, or hand the choice back to the defaults with an
 * explicit `null` (an omitted `template_id` is rejected: it is a required, nullable field).
 */
export async function setInvoiceTemplate(invoiceId: string, templateId: string | null): Promise<void> {
  let etag: string | null = null;
  const state = await factuarea.invoices.getPresentation(company, invoiceId, {
    onResponse: (meta) => {
      etag = meta.etag;
    },
  });
  await factuarea.invoices.assignPresentation(
    company,
    invoiceId,
    { template_id: templateId, expected_version: state.data.selection_version },
    // The ETag of the read goes back verbatim; a stale one is a 412, a missing one a 428.
    { ifMatch: etag ?? undefined },
  );
}

/**
 * Download the PDF: `202` means "still preparing, ask again after `retryAfter`", and
 * a `304` means the copy you hold (identified by its ETag) is current. Returns the ETag to keep.
 */
export async function downloadInvoicePdf(invoiceId: string, cachedEtag?: string): Promise<string | undefined> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const pdf = await factuarea.invoices.pdf(company, invoiceId, undefined, cachedEtag ? { ifNoneMatch: cachedEtag } : undefined);
    switch (pdf.kind) {
      case "not_modified":
        return cachedEtag;
      case "binary":
        await writeFile(`invoice-${invoiceId}.pdf`, pdf.toBuffer());
        return pdf.etag ?? undefined;
      case "json":
        await sleep((pdf.retryAfter ?? 1) * 1000);
    }
  }
  throw new Error(`The PDF of ${invoiceId} is still not ready.`);
}

/**
 * Send an invoice to FACe once. The call is never retried by the SDK: after a
 * connection failure the outcome is unknown, so read the attempts instead of sending again.
 */
export async function submitToFace(invoiceId: string): Promise<void> {
  try {
    await factuarea.invoices.faceSubmissions.submit(company, invoiceId);
  } catch (error) {
    if (error instanceof ConnectionError || error instanceof ConflictError) {
      const attempts = await factuarea.invoices.faceSubmissions.list(company, invoiceId);
      console.log("Check the attempts before deciding:", attempts);
      return;
    }
    throw error;
  }
}
