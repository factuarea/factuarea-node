/**
 * The two steps of paying: the payment link and the synchronous confirmation.
 *
 * `checkout` asks the shop's gateway for a payment link (or the data the shop's
 * front end needs to raise the gateway's own widget). `confirmPayment` tells
 * Factuarea that the charge went through, and it is the ONLY irreversible
 * operation of the buyer lane: it turns the order into a paid order and starts
 * the invoicing the shop configured.
 *
 * Both carry an `Idempotency-Key`. The transport mints one per logical call and
 * reuses it across retries, so a shopper on a flaky phone network cannot be
 * charged twice by a retry, and a page that retries the confirmation after a
 * timeout gets back the FIRST result instead of a second charge. The server
 * declares the header REQUIRED on the confirmation — measured in the frozen
 * contract, where `public-api.v1.storefront.orders.confirm_payment` is the only
 * operation of the lane that declares it. Pass `config.idempotencyKey` when the
 * page has its own natural key (the shop's own order reference, for instance)
 * and wants the same key to survive a page reload.
 *
 * These live in their own module because paying is the part of the lane worth
 * reading on its own; they are published as methods of `orders`, which is where
 * the contract groups them.
 */

import type {
  StorefrontRequestConfig,
  StorefrontTransport,
} from "./transport.js";

/** Start the checkout of an order: asks for the payment link. */
export async function startStorefrontOrderCheckout(
  transport: StorefrontTransport,
  company: string,
  order: string,
  body?: unknown,
  config?: StorefrontRequestConfig,
): Promise<unknown> {
  return transport.request({
    method: "POST",
    path: transport.buildPath("/companies/{company}/storefront/orders/{order}/checkout", {
      company,
      order,
    }),
    body,
    ...config,
  });
}

/** Confirm the charge of an order. Irreversible. */
export async function confirmStorefrontOrderPayment(
  transport: StorefrontTransport,
  company: string,
  order: string,
  body: unknown,
  config?: StorefrontRequestConfig,
): Promise<unknown> {
  return transport.request({
    method: "POST",
    path: transport.buildPath("/companies/{company}/storefront/orders/{order}/confirm-payment", {
      company,
      order,
    }),
    body,
    ...config,
  });
}
