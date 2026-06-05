/**
 * List invoices with transparent auto-pagination.
 *
 * In your project: `import { Factuarea } from "@factuarea/sdk";`
 */
import { Factuarea } from "../src/index.js";
import type { Invoice } from "../src/index.js";

const factuarea = new Factuarea({ apiKey: process.env.FACTUAREA_API_KEY ?? "fact_test_xxx" });

async function main(): Promise<void> {
  // `for await` walks every page automatically via next_cursor.
  let count = 0;
  for await (const invoice of (await factuarea.invoices.list({ status: "paid" })) as AsyncIterable<Invoice>) {
    count += 1;
    console.log(invoice.id, invoice.status);
    if (count >= 100) {
      break; // stop early — no extra pages are fetched
    }
  }
  console.log(`Iterated ${count} paid invoices.`);

  // Page-by-page control:
  const page = await factuarea.invoices.list({ limit: 25 });
  console.log("First page size:", page.data.length, "has more:", page.hasMore);
}

await main();
