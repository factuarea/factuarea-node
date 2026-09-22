/**
 * List invoices with transparent auto-pagination.
 *
 * In your project: `import { Factuarea } from "@factuarea/sdk";`
 */
import { Factuarea } from "../src/index.js";
import type { Invoice } from "../src/index.js";

const factuarea = new Factuarea({ apiKey: process.env.FACTUAREA_API_KEY ?? "fact_test_xxx" });

// Company axis: every company resource hangs off `/v1/companies/{company}/…`,
// so the company id is the first argument of the call. It is the `id` that
// `factuarea.account.show()` returns in `data.scope[].id`.
const company = process.env.FACTUAREA_COMPANY_ID ?? "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a01";


async function main(): Promise<void> {
  // `for await` walks every page automatically via next_cursor.
  let count = 0;
  for await (const invoice of (await factuarea.invoices.list(company, { status: "paid" })) as AsyncIterable<Invoice>) {
    count += 1;
    console.log(invoice.id, invoice.status);
    if (count >= 100) {
      break; // stop early — no extra pages are fetched
    }
  }
  console.log(`Iterated ${count} paid invoices.`);

  // Page-by-page control:
  const page = await factuarea.invoices.list(company, { limit: 25 });
  console.log("First page size:", page.data.length, "has more:", page.hasMore);
}

await main();
