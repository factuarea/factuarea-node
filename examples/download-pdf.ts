/**
 * Download an invoice PDF and write it to disk.
 *
 * In your project: `import { Factuarea } from "@factuarea/sdk";`
 */
import { writeFile } from "node:fs/promises";
import { Factuarea } from "../src/index.js";

const factuarea = new Factuarea({ apiKey: process.env.FACTUAREA_API_KEY ?? "fact_test_xxx" });

async function main(): Promise<void> {
  const invoiceId = process.argv[2] ?? "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a9b";

  const pdf = await factuarea.invoices.pdf(invoiceId);
  console.log("Content-Type:", pdf.contentType);

  // Node: write the Buffer straight to a file.
  await writeFile(`invoice-${invoiceId}.pdf`, pdf.toBuffer());
  console.log(`Saved invoice-${invoiceId}.pdf`);
}

await main();
