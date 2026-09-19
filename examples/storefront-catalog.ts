/**
 * Browser SDK — catalogue, price and availability.
 *
 * This is the part of a custom shop that paints a listing page: the articles
 * the merchant publishes, one price per card and whether each card can be sold
 * right now.
 *
 * In your project: `import { FactuareaStorefront } from "@factuarea/sdk/storefront";`
 *
 * The credential below is PUBLISHABLE: it ships inside the JavaScript the
 * shopper downloads, it only reaches this lane, and it only works from the
 * origins the merchant declared on it. Never put an integrator key
 * (`fact_live_…` / `fact_test_…`) here — the client rejects it when it is built.
 */
import { FactuareaStorefront, StorefrontError } from "../src/storefront/index.js";

const shop = new FactuareaStorefront({
  publishableKey: process.env.FACTUAREA_STOREFRONT_KEY ?? "sf_pk_xxxxxxxxxxxxxxxxxxxxxxxx",
  company: process.env.FACTUAREA_COMPANY ?? "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a9b",
});

type PublishedProduct = { id: string; name: string; sku: string | null };

async function main(): Promise<void> {
  // 1. The listing page. `list` returns one page and walks the rest for you.
  const page = await shop.products.list({ limit: 24, in_stock: true });
  const products = page.data as PublishedProduct[];
  console.log(`${products.length} articles on the first page, more: ${page.hasMore}`);

  // Everything, across every page (mind the size before doing this in a UI):
  //   for await (const product of page) { … }

  const first = products[0];
  if (first === undefined) {
    console.log("This shop publishes nothing yet.");
    return;
  }

  // 2. The card of one article: detail, images and, if it is configurable,
  //    its variants, presentations and options.
  const detail = await shop.products.show(first.id);
  const images = await shop.products.images.list(first.id);
  const variants = await shop.products.variants.list(first.id);
  console.log("detail, images and variants loaded:", {
    detail: detail !== undefined,
    images: images !== undefined,
    variants: variants !== undefined,
  });

  // 3. Categories, for the filter rail.
  const categories = await shop.categories.list();
  console.log("categories:", categories !== undefined);

  // 4. The price. A configurable article resolves FIRST to the concrete item
  //    the shop will sell, and only then does a price exist for it.
  const selection = await shop.catalogSelections.resolve({
    product_id: first.id,
    // options: { colour: "blue" }, variant_id: "…", presentation_id: "…"
  });
  console.log("selection resolved:", selection !== undefined);

  const price = await shop.prices.resolve({ product_id: first.id, quantity: 1 });
  console.log("price:", price);

  // One request per listing page instead of one per card:
  const prices = await shop.prices.bulkResolve({
    items: products.slice(0, 10).map((product) => ({ product_id: product.id, quantity: 1 })),
  });
  console.log("bulk prices:", prices !== undefined);

  // 5. Availability. It is a READ: it holds nothing, so two shoppers can see
  //    the same last unit and only one of them gets it.
  const availability = await shop.availability.show({ product_id: first.id });
  console.log("availability:", availability);

  // 6. Search, for the search box.
  const found = await shop.products.search({ q: first.name.slice(0, 4) });
  console.log("search:", found !== undefined);
}

try {
  await main();
} catch (error) {
  // Branch on `code`, never on the message: the message is human text served in
  // Spanish and free to change; the code is stable across locales and versions.
  if (error instanceof StorefrontError) {
    console.error(`[${error.status}] ${error.code} (request ${error.requestId}): ${error.message}`);
  } else {
    throw error;
  }
}
