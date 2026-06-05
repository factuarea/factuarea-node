import { createHmac, timingSafeEqual } from "node:crypto";
import { WebhookSignatureError } from "./errors.js";
import type { Event } from "../generated/types.gen.js";

/**
 * Webhook signature verifier, matching the backend scheme exactly
 * (`App\Webhooks\Domain\Service\HmacSignatureGenerator`):
 *
 *   Header `Factuarea-Signature: t=<unix>,v1=<hex>[,v1=<hex_previous>]`
 *
 * - Signed payload is `<timestamp>.<rawBody>`.
 * - Algorithm is HMAC-SHA256, hex-encoded.
 * - During a secret-rotation grace window the header carries TWO `v1=`
 *   signatures (current + previous secret); a match against EITHER is valid.
 * - The timestamp is checked against a configurable tolerance to prevent
 *   replay (the backend documents ±5 min as the client-side default).
 *
 * Comparison is constant-time (`crypto.timingSafeEqual`). On success the parsed
 * `Event` is returned; otherwise `WebhookSignatureError` is thrown.
 */

/** Name of the signature header the backend sends. */
export const SIGNATURE_HEADER = "Factuarea-Signature";

/** Default replay tolerance in seconds (matches the backend's documented ±5 min). */
export const DEFAULT_TOLERANCE_SECONDS = 300;

export interface VerifyOptions {
  /** Max allowed age of the timestamp, in seconds. Default 300. Set 0 to skip. */
  toleranceSeconds?: number;
  /** Current unix time in ms, injectable for tests. Default `Date.now()`. */
  now?: number;
}

interface ParsedSignature {
  timestamp: number;
  signatures: string[];
}

function parseSignatureHeader(header: string): ParsedSignature {
  let timestamp: number | undefined;
  const signatures: string[] = [];

  for (const part of header.split(",")) {
    const eq = part.indexOf("=");
    if (eq === -1) {
      continue;
    }
    const key = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    if (key === "t") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        timestamp = parsed;
      }
    } else if (key === "v1") {
      signatures.push(value);
    }
  }

  if (timestamp === undefined || signatures.length === 0) {
    throw new WebhookSignatureError(
      "Factuarea webhook: malformed signature header (missing `t` or `v1`).",
    );
  }

  return { timestamp, signatures };
}

/** Constant-time comparison of two hex strings of (potentially) different lengths. */
function secureCompareHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length || bufA.length === 0) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/**
 * Verifies a webhook delivery and returns the typed `Event`.
 *
 * @param rawBody  the EXACT raw request body string (do not re-serialize JSON).
 * @param signatureHeader  the value of the `Factuarea-Signature` header.
 * @param secret  the endpoint signing secret (`whsec_...`).
 */
export function verifyWebhook(
  rawBody: string,
  signatureHeader: string,
  secret: string,
  options: VerifyOptions = {},
): Event {
  if (typeof rawBody !== "string") {
    throw new WebhookSignatureError("Factuarea webhook: `rawBody` must be the raw string body.");
  }
  if (!signatureHeader) {
    throw new WebhookSignatureError("Factuarea webhook: missing signature header.");
  }
  if (!secret) {
    throw new WebhookSignatureError("Factuarea webhook: missing signing secret.");
  }

  const { timestamp, signatures } = parseSignatureHeader(signatureHeader);

  const tolerance = options.toleranceSeconds ?? DEFAULT_TOLERANCE_SECONDS;
  if (tolerance > 0) {
    const nowSeconds = Math.floor((options.now ?? Date.now()) / 1000);
    if (Math.abs(nowSeconds - timestamp) > tolerance) {
      throw new WebhookSignatureError(
        "Factuarea webhook: timestamp outside the allowed tolerance (possible replay).",
      );
    }
  }

  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex");

  const matched = signatures.some((candidate) => secureCompareHex(expected, candidate));
  if (!matched) {
    throw new WebhookSignatureError("Factuarea webhook: signature mismatch.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch (cause) {
    throw new WebhookSignatureError("Factuarea webhook: body is not valid JSON.");
  }

  return parsed as Event;
}

/**
 * The `Webhooks` namespace exposed on the client. Stateless: the verifier
 * needs no client state, but living on the instance keeps the surface uniform
 * (`factuarea.webhooks.verify(...)`).
 */
export class Webhooks {
  /** Verify a webhook signature and return the typed event. */
  verify(rawBody: string, signatureHeader: string, secret: string, options?: VerifyOptions): Event {
    return verifyWebhook(rawBody, signatureHeader, secret, options);
  }
}
