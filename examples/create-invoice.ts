/**
 * Create an invoice.
 *
 * In your project: `import { Factuarea } from "@factuarea/sdk";`
 * Run here with:   `node --experimental-strip-types examples/create-invoice.ts`
 *                  (Node 22.6+) — set FACTUAREA_API_KEY first.
 */
import { Factuarea, ValidationError } from "../src/index.js";

const factuarea = new Factuarea({ apiKey: process.env.FACTUAREA_API_KEY ?? "fact_test_xxx" });

async function main(): Promise<void> {
  try {
    const invoice = await factuarea.invoices.create({
      client_id: "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a9b",
      series_id: "01931b3e-7c4a-7f2e-9a8b-000000000001",
      issue_date: "2026-06-05",
      lines: [
        { description: "Consulting", quantity: 1, unit_price: 1000, taxes_id: "01931b3e-7c4a-7f2e-9a8b-000000000021" },
      ],
    });
    console.log("Created invoice:", invoice);
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error("Validation failed:", error.fields, "request:", error.requestId);
      return;
    }
    throw error;
  }
}

await main();
