/**
 * Browser SDK — the whole shopper journey: cart, order, payment link, charge
 * confirmation and tracking.
 *
 * In your project: `import { FactuareaStorefront } from "@factuarea/sdk/storefront";`
 *
 * Read `examples/storefront-catalog.ts` first for the credential model.
 */
import {
  FactuareaStorefront,
  StorefrontConflictError,
  StorefrontError,
  StorefrontValidationError,
} from "../src/storefront/index.js";

const shop = new FactuareaStorefront({
  publishableKey: process.env.FACTUAREA_STOREFRONT_KEY ?? "sf_pk_xxxxxxxxxxxxxxxxxxxxxxxx",
  company: process.env.FACTUAREA_COMPANY ?? "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a9b",
});

const PRODUCT_ID = process.env.FACTUAREA_PRODUCT_ID ?? "01931b3e-7c4a-7f2e-9a8b-000000000042";

type Identified = { id: string };
type Checkout = { payment_url?: string | null };

async function main(): Promise<void> {
  // 1. The cart. It is a SESSION: it expires and it can be abandoned.
  const session = (await shop.sessions.create({
    lines: [{ product_id: PRODUCT_ID, quantity: 2 }],
  })) as { data: Identified };
  const cart = session.data.id;
  console.log("cart:", cart);

  // Partial update: send only what changes.
  await shop.sessions.update(cart, { lines: [{ product_id: PRODUCT_ID, quantity: 3 }] });

  // 2. Before showing a total, ask what the cart is worth NOW. Prices and
  //    availability can have moved while the shopper was thinking.
  const revalidated = await shop.sessions.revalidate(cart);
  console.log("revalidated cart:", revalidated !== undefined);

  // Availability of every line in one request, for the basket page.
  const availability = await shop.availability.bulkResolve({
    items: [{ product_id: PRODUCT_ID, quantity: 3 }],
  });
  console.log("cart availability:", availability !== undefined);

  // 3. The order.
  const created = (await shop.orders.create({
    session_id: cart,
    buyer: { email: "shopper@example.com", name: "A. Shopper" },
  })) as { data: Identified };
  const order = created.data.id;
  console.log("order:", order);

  // The fiscal identity is a separate step on purpose: a shopper can buy with
  // just an email and only supply the tax id when they want a full invoice.
  await shop.orders.buyerIdentity.update(order, {
    tax_id: "B12345678",
    name: "Example S.L.",
    address: { line1: "Calle Mayor 1", city: "Madrid", postal_code: "28013", country: "ES" },
  });

  // 4. The payment link.
  const checkout = (await shop.orders.checkout(order, {
    return_url: "https://shop.example.com/thanks",
  })) as { data: Checkout };
  console.log("payment link:", checkout.data.payment_url);

  // 5. The charge confirmation. This one is IRREVERSIBLE: it turns the order
  //    into a paid order and starts the invoicing the merchant configured.
  //
  //    The SDK attaches an `Idempotency-Key` to every mutating call and reuses
  //    it across its own retries, so a flaky network cannot charge twice. Pass
  //    your own key when the page has a natural one that must survive a reload:
  await shop.orders.confirmPayment(
    order,
    { payment_reference: "pi_3PXyz…" },
    { idempotencyKey: `confirm-${order}` },
  );

  // 6. Afterwards: the order and its shipment.
  console.log("order:", await shop.orders.show(order));
  // Tracking mirrors the LAST fulfilment notice: after a delivery the link may
  // legitimately be gone. Render its absence as absence, not as an error.
  console.log("tracking:", await shop.orders.tracking(order));
}

try {
  await main();
} catch (error) {
  if (error instanceof StorefrontValidationError) {
    // 422 also covers "the cart expired", "that configuration cannot be sold"
    // and "a line asks for more units than are available": branch on the code.
    console.error(`cannot continue: ${error.code}`, error.fields);
  } else if (error instanceof StorefrontConflictError) {
    console.error(`conflict: ${error.code} (request ${error.requestId})`);
  } else if (error instanceof StorefrontError) {
    console.error(`[${error.status}] ${error.code}: ${error.message}`);
  } else {
    throw error;
  }
}
