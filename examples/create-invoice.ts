/**
 * Create an invoice.
 *
 * In your project: `import { Factuarea } from "@factuarea/sdk";`
 * Run here with:   `node --experimental-strip-types examples/create-invoice.ts`
 *                  (Node 22.6+) — set FACTUAREA_API_KEY first.
 */
import { Factuarea, ValidationError, type BusinessContact } from "../src/index.js";

const factuarea = new Factuarea({ apiKey: process.env.FACTUAREA_API_KEY ?? "fact_test_xxx" });

async function main(): Promise<void> {
  try {
    const { data: contact } = (await factuarea.contacts.create({
      name: "Cliente Demo SL",
      kind: "company",
      roles: ["customer"],
      tax_id: "B12345674",
    })) as { data: BusinessContact };

    // create/show/update return the API envelope `{ data, ... }`. Operation
    // bodies/results are typed `unknown` in 0.x, so cast to the shape you expect.
    const created = (await factuarea.invoices.create({
      // The invoice contract keeps client_id; pass the canonical contact UUID.
      client_id: contact.id,
      series_id: "01931b3e-7c4a-7f2e-9a8b-000000000001",
      issued_on: "2026-06-05",
      due_on: "2026-07-05",
      lines: [
        // Pass `tax_rate` (percentage) or `tax_rate_id` (a tax UUID).
        { description: "Consulting", quantity: 1, unit_price: 1000, tax_rate: 21 },
      ],
    })) as { data: { id: string } };
    console.log("Created invoice:", created.data.id);
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error("Validation failed:", error.fields, "request:", error.requestId);
      return;
    }
    throw error;
  }
}

await main();
