/**
 * Idempotency keys generated in the browser.
 *
 * A mutating call of the buyer lane carries an `Idempotency-Key` so a retry —
 * the SDK's own, or the shopper hitting "Pay" twice on a flaky phone network —
 * returns the result of the first attempt instead of creating a second order or
 * charging twice. The server requires the header on the payment confirmation
 * and honours it everywhere else.
 *
 * ## The three sources, in order, and why there are three
 *
 * 1. `crypto.randomUUID()` — the Web Crypto API. Available in every modern
 *    browser, BUT only in a SECURE CONTEXT (https, or localhost).
 * 2. `crypto.getRandomValues()` — also Web Crypto, and available in INSECURE
 *    contexts too (a shop served over plain http, or an internal preview). We
 *    build the RFC 4122 v4 layout by hand from 16 cryptographic bytes.
 * 3. A declared last resort for runtimes with no Web Crypto at all (a very old
 *    browser, a stripped embedded webview). It mixes a monotonic timestamp with
 *    `Math.random()` into the same v4 layout. It is NOT cryptographic and it is
 *    never used for anything but this key.
 *
 * Tier 3 is a legitimate fallback and not a weakening: an idempotency key is
 * not a secret and grants nothing. Its only requirement is to be unique per
 * logical operation, so that two different operations never collide. Nothing in
 * the API is authorised by holding one — the publishable credential and the
 * declared origin do that. The trade-off is written here and in the README so
 * nobody has to guess whether an http preview is safe to test against.
 *
 * This module imports nothing (design.md D7).
 */

/** The slice of the Web Crypto API this module needs, structurally typed. */
export interface WebCryptoLike {
  randomUUID?: () => string;
  getRandomValues?: <T extends ArrayBufferView>(array: T) => T;
}

/** How the key was produced. Useful in diagnostics; never sent to the API. */
export type IdempotencySource = "web-crypto-random-uuid" | "web-crypto-bytes" | "fallback";

function formatUuidV4(bytes: Uint8Array): string {
  // Version (4) and variant (10xx) bits, per RFC 4122 §4.4.
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;

  const hex: string[] = [];
  for (let index = 0; index < 16; index += 1) {
    hex.push((bytes[index] ?? 0).toString(16).padStart(2, "0"));
  }
  return (
    `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-` +
    `${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`
  );
}

function fallbackBytes(): Uint8Array {
  const bytes = new Uint8Array(16);
  // The timestamp makes two keys minted in the same tick differ even if the
  // pseudo-random source were poor; the rest is Math.random().
  let seed = Date.now();
  for (let index = 0; index < 16; index += 1) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    bytes[index] = (seed ^ Math.floor(Math.random() * 256)) & 0xff;
  }
  return bytes;
}

/** Which of the three sources the given Web Crypto implementation offers. */
export function idempotencySource(crypto: WebCryptoLike | undefined): IdempotencySource {
  if (typeof crypto?.randomUUID === "function") {
    return "web-crypto-random-uuid";
  }
  if (typeof crypto?.getRandomValues === "function") {
    return "web-crypto-bytes";
  }
  return "fallback";
}

/**
 * Mints an idempotency key, preferring the browser's cryptographic interface.
 *
 * @param crypto  injectable Web Crypto implementation; defaults to the global.
 */
export function newIdempotencyKey(
  crypto: WebCryptoLike | undefined = (globalThis as { crypto?: WebCryptoLike }).crypto,
): string {
  switch (idempotencySource(crypto)) {
    case "web-crypto-random-uuid":
      return crypto!.randomUUID!();
    case "web-crypto-bytes":
      return formatUuidV4(crypto!.getRandomValues!(new Uint8Array(16)));
    default:
      return formatUuidV4(fallbackBytes());
  }
}
