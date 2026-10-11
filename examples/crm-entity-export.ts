import { writeFile } from "node:fs/promises";
import { CrmUnconfirmedWriteError, Factuarea } from "../src/index.js";

const client = new Factuarea({ apiKey: process.env.FACTUAREA_API_KEY! });
// Obtain a stable lowercase UUIDv7 and key for this selection before human review.
const id = process.env.FACTUAREA_EXPORT_ID!;
const intent = client.crm.entityExports.prepare(
  {
    entity_type: "opportunity",
    filters: {
      status: "open",
      expected_close_from: "2026-10-01",
      expected_close_to: "2026-10-31",
    },
    columns: ["uuid", "title", "amount", "currency", "weighted_value"],
  },
  { id, idempotencyKey: process.env.FACTUAREA_EXPORT_IDEMPOTENCY_KEY! }
);

// An interactive caller must obtain this acknowledgement for the retained selection.
if (process.env.FACTUAREA_EXPORT_HUMAN_CONFIRMED !== "true") {
  throw new Error(
    "Review the retained export selection and explicitly confirm it before dispatch."
  );
}
try {
  await client.crm.entityExports.request(intent, { humanConfirmed: true });
} catch (error) {
  if (!(error instanceof CrmUnconfirmedWriteError)) throw error;
  // Keep intent.id, intent.rawRequest and intent.idempotencyKey; never submit another POST.
}
const original = await client.crm.entityExports.getOriginal(intent);
if (original.data.status === "ready") {
  const csv = await client.crm.entityExports.download(intent);
  // No numeric parsing, currency conversion or CSV assembly in the SDK.
  await writeFile(original.data.filename, csv.toBuffer());
}
