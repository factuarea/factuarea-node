/**
 * The guard that keeps a server credential out of the browser.
 *
 * ## The two credential shapes, measured — not invented
 *
 * | Lane | Prefix | Secret | Where it may live |
 * |---|---|---|---|
 * | Shopper (this package) | `sf_pk_` | prefix + 24 base62 | the web page, in plain sight |
 * | Integrator (server SDK) | `fact_live_` / `fact_test_` | prefix + 24 base62 | your server, never a page |
 *
 * The publishable key is NOT a secret: it travels inside the JavaScript a
 * shopper downloads, it is scoped to the origins the merchant declares, it is
 * revocable, and rotating it has no grace window by design. The integrator key
 * is the opposite: it is bound to the company with full API access and a leak
 * is an incident.
 *
 * ## Why the rejection happens at CONSTRUCTION
 *
 * A key of the wrong lane pasted into a page would otherwise work for months in
 * development against a permissive environment and only surface as a 401 on the
 * first shopper's first request — by then it is already published in a bundle
 * on a CDN. Failing in the constructor puts the error on the developer's screen
 * the moment the client is created, with no request emitted.
 */

import { StorefrontCredentialError } from "./errors.js";

/** Prefix of the publishable storefront credential. */
export const PUBLISHABLE_KEY_PREFIX = "sf_pk_";

/** Length of the base62 body of the FULL secret (not the 8-char visible prefix). */
export const PUBLISHABLE_KEY_SECRET_BODY_LENGTH = 24;

/**
 * Accepted shape of the publishable credential, derived from the two constants
 * above so the three can never drift apart.
 */
export const PUBLISHABLE_KEY_PATTERN = new RegExp(
  `^${PUBLISHABLE_KEY_PREFIX}[0-9A-Za-z]{${PUBLISHABLE_KEY_SECRET_BODY_LENGTH}}$`,
);

/** Prefixes of the server lane. Neither may ever reach a browser. */
export const INTEGRATOR_KEY_PREFIXES = ["fact_live_", "fact_test_"] as const;

const MISSING_MESSAGE =
  "Factuarea storefront: `publishableKey` is required. Pass the publishable storefront key " +
  "(`sf_pk_…`) the merchant issued for this shop.";

const INTEGRATOR_MESSAGE =
  "Factuarea storefront: an integrator API key (`fact_live_…` / `fact_test_…`) was passed to the " +
  "browser client. A server credential must NEVER travel to a browser: it is a secret bound to " +
  "the company, with access to the whole API, and anything shipped to a page is public. Use a " +
  "publishable storefront key (`sf_pk_…`) instead — it only reaches the shopper lane, it is " +
  "scoped to the origins you declare and you can revoke it. If this key ever reached a browser, " +
  "rotate it now.";

const MALFORMED_MESSAGE =
  "Factuarea storefront: `publishableKey` is not a publishable storefront key. Expected the " +
  `prefix \`${PUBLISHABLE_KEY_PREFIX}\` followed by ${PUBLISHABLE_KEY_SECRET_BODY_LENGTH} ` +
  "base62 characters (`[0-9A-Za-z]`) — the FULL secret, not the 8-character visible prefix the " +
  "merchant dashboard lists.";

/**
 * Validates a publishable storefront credential and returns it unchanged.
 *
 * @throws {StorefrontCredentialError} with `code`:
 *   - `publishable_key_missing` when absent or blank,
 *   - `integrator_credential_in_browser` for a server key,
 *   - `publishable_key_malformed` for anything else.
 *
 * The offending value is never echoed back in the message.
 */
export function assertPublishableStorefrontKey(value: unknown): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new StorefrontCredentialError({
      message: MISSING_MESSAGE,
      code: "publishable_key_missing",
    });
  }

  const key = value.trim();

  if (INTEGRATOR_KEY_PREFIXES.some((prefix) => key.startsWith(prefix))) {
    throw new StorefrontCredentialError({
      message: INTEGRATOR_MESSAGE,
      code: "integrator_credential_in_browser",
    });
  }

  if (!PUBLISHABLE_KEY_PATTERN.test(key)) {
    throw new StorefrontCredentialError({
      message: MALFORMED_MESSAGE,
      code: "publishable_key_malformed",
    });
  }

  return key;
}

/**
 * Validates the public company id the shop is served under. The axis is fixed
 * once, at construction: every path of the buyer lane carries it, and asking
 * for it on every call would let a page mix two shops by accident.
 */
export function assertStorefrontCompany(value: unknown): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new StorefrontCredentialError({
      message:
        "Factuarea storefront: `company` is required. It is the public id of the company that " +
        "owns the shop, and it is fixed when the client is built, not on every call.",
      code: "company_missing",
    });
  }
  return value.trim();
}
