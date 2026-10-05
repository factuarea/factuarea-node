import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyWebhook, WebhookSignatureError } from "../src/index.js";

const SECRET = "whsec_test_secret";

function sign(payload: string, timestamp: number, secret: string = SECRET): string {
  const sig = createHmac("sha256", secret).update(`${timestamp}.${payload}`, "utf8").digest("hex");
  return `t=${timestamp},v1=${sig}`;
}

const eventBody = JSON.stringify({
  id: "evt_1",
  object: "event",
  type: "invoice.paid",
  livemode: false,
  data: { object: { id: "inv_1" } },
  created: "2026-06-05T10:00:00Z",
});

describe("webhook signature verification", () => {
  it("returns the typed event for a valid signature", () => {
    const now = 1_700_000_000_000;
    const header = sign(eventBody, Math.floor(now / 1000));
    const event = verifyWebhook(eventBody, header, SECRET, { now });
    expect(event.id).toBe("evt_1");
    expect(event.type).toBe("invoice.paid");
  });

  it("accepts a signature within the timestamp tolerance", () => {
    const now = 1_700_000_000_000;
    const headerTs = Math.floor(now / 1000) - 200; // 200s old, within default 300s
    const header = sign(eventBody, headerTs);
    expect(() => verifyWebhook(eventBody, header, SECRET, { now })).not.toThrow();
  });

  it("rejects a signature outside the timestamp tolerance (replay)", () => {
    const now = 1_700_000_000_000;
    const headerTs = Math.floor(now / 1000) - 600; // 10 min old
    const header = sign(eventBody, headerTs);
    expect(() => verifyWebhook(eventBody, header, SECRET, { now })).toThrow(WebhookSignatureError);
  });

  it("rejects a tampered body", () => {
    const now = 1_700_000_000_000;
    const header = sign(eventBody, Math.floor(now / 1000));
    expect(() => verifyWebhook(eventBody + " ", header, SECRET, { now })).toThrow(WebhookSignatureError);
  });

  it("rejects a wrong secret", () => {
    const now = 1_700_000_000_000;
    const header = sign(eventBody, Math.floor(now / 1000), "whsec_other");
    expect(() => verifyWebhook(eventBody, header, SECRET, { now })).toThrow(WebhookSignatureError);
  });

  it("accepts when either of two v1 signatures matches (rotation grace window)", () => {
    const now = 1_700_000_000_000;
    const ts = Math.floor(now / 1000);
    const goodSig = createHmac("sha256", SECRET).update(`${ts}.${eventBody}`).digest("hex");
    const staleSig = createHmac("sha256", "whsec_previous").update(`${ts}.${eventBody}`).digest("hex");
    // Header carries previous (stale) first and current second — both present.
    const header = `t=${ts},v1=${staleSig},v1=${goodSig}`;
    const event = verifyWebhook(eventBody, header, SECRET, { now });
    expect(event.id).toBe("evt_1");
  });

  it("throws on a malformed signature header", () => {
    expect(() => verifyWebhook(eventBody, "garbage", SECRET)).toThrow(WebhookSignatureError);
    expect(() => verifyWebhook(eventBody, "t=123", SECRET)).toThrow(WebhookSignatureError);
  });

  it("can skip the timestamp check with toleranceSeconds=0", () => {
    const header = sign(eventBody, 1); // ancient timestamp
    expect(() => verifyWebhook(eventBody, header, SECRET, { toleranceSeconds: 0 })).not.toThrow();
  });

  it("throws when the verified body is not valid JSON", () => {
    const now = 1_700_000_000_000;
    const ts = Math.floor(now / 1000);
    const body = "not-json";
    const header = sign(body, ts);
    expect(() => verifyWebhook(body, header, SECRET, { now })).toThrow(WebhookSignatureError);
  });
});

describe("account webhook envelope", () => {
  const COMPANY_ID = "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a01";
  const ACCOUNT_ID = "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8b01";
  const accountBody = JSON.stringify({
    id: "evt_account_1",
    object: "event",
    type: "account.nif_added",
    api_version: "2026-06-04",
    created: "2026-10-05T10:00:00Z",
    livemode: true,
    test: false,
    correlation_id: "corr_1",
    account: { id: ACCOUNT_ID },
    account_relationship: "managed",
    company_id: COMPANY_ID,
    data: { object: { id: COMPANY_ID } },
  });

  it("returns the account event with account, account_relationship and company_id intact", () => {
    const now = 1_700_000_000_000;
    const header = sign(accountBody, Math.floor(now / 1000));
    const event = verifyWebhook(accountBody, header, SECRET, { now }) as unknown as Record<string, unknown>;
    expect(event["type"]).toBe("account.nif_added");
    expect(event["account"]).toEqual({ id: ACCOUNT_ID });
    expect(event["account_relationship"]).toBe("managed");
    expect(event["company_id"]).toBe(COMPANY_ID);
  });

  it("keeps a null company_id for an event of the account itself", () => {
    const now = 1_700_000_000_000;
    const own = JSON.stringify({ ...JSON.parse(accountBody), account_relationship: "own", company_id: null });
    const header = sign(own, Math.floor(now / 1000));
    const event = verifyWebhook(own, header, SECRET, { now }) as unknown as Record<string, unknown>;
    expect(event["account_relationship"]).toBe("own");
    expect(event["company_id"]).toBeNull();
  });

  it("throws the signature error for an account envelope signed with another secret", () => {
    const now = 1_700_000_000_000;
    const header = sign(accountBody, Math.floor(now / 1000), "whsec_other");
    expect(() => verifyWebhook(accountBody, header, SECRET, { now })).toThrow(WebhookSignatureError);
  });
});
