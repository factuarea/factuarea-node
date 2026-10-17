/**
 * Prepare a transport control document (DeCA) from a delivery note, issue it and
 * save the copy for the driver: the PDF and the QR image.
 * Run with your project's TypeScript runner and FACTUAREA_API_KEY configured; the
 * key needs the `transport_documents:write`, `transport_documents:transition` and
 * `pdfs:read` scopes.
 *
 * In your project: `import { Factuarea } from "@factuarea/sdk";`
 */
import { writeFile } from "node:fs/promises";
import {
  Factuarea,
  type CreateTransportDocumentRequest,
  type TransportDocument,
} from "../src/index.js";

const factuarea = new Factuarea({ apiKey: process.env.FACTUAREA_API_KEY ?? "fact_test_xxx" });
const company = process.env.FACTUAREA_COMPANY_ID ?? "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a01";

async function main(): Promise<void> {
  const deliveryNoteId = process.argv[2] ?? "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a9b";
  const carrierContactId = process.argv[3] ?? "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a9c";

  // Only `company_role` is required for a draft; the delivery note pre-fills one
  // shipment. Issuing checks the minimum data the transport needs.
  const draftInput: CreateTransportDocumentRequest = {
    company_role: "shipper",
    carrier: { contact_id: carrierContactId },
    delivery_note_ids: [deliveryNoteId],
    vehicle: { tractor_plate: "1234BCD" },
  };
  const { data: draft } = (await factuarea.transportDocuments.create(company, draftInput, {
    idempotencyKey: `deca-draft-${deliveryNoteId}`,
  })) as { data: TransportDocument };

  // Irreversible: it takes the next number of the DC series and publishes
  // version 1 at a permanent public URL. Keep the key stable across retries.
  const { data: issued } = (await factuarea.transportDocuments.issue(company, draft.id, {
    idempotencyKey: `deca-issue-${draft.id}`,
  })) as { data: TransportDocument };
  console.log(`Issued ${issued.number}: ${issued.public_url}`);

  const pdf = await factuarea.transportDocuments.pdf(company, issued.id);
  await writeFile(`deca-${issued.id}.pdf`, pdf.toBuffer());
  const qr = await factuarea.transportDocuments.qr(company, issued.id, { format: "png" });
  await writeFile(`deca-${issued.id}-qr.png`, qr.toBuffer());
}

await main();
