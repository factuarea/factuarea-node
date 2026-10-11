import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { CrmUnconfirmedWriteError, Factuarea } from "../src/index.js";
import type { CrmCreateOpportunityRequest } from "../src/crm/source/index.js";

const id = "019c0000-0000-7000-8000-000000001401";
const pipeline = "019c0000-0000-7000-8000-000000001402";
const stage = "019c0000-0000-7000-8000-000000001403";
const body: CrmCreateOpportunityRequest = {
  title: "Synthetic native opportunity",
  pipeline_id: pipeline,
  stage_id: stage,
  amount: "1234567890123456.0100",
  currency: "EUR",
};

describe("private native Source140 writer transport", () => {
  it("dispatches a lost creation once and reads its literal Original only by GET", async () => {
    const calls: Array<{
      path: string;
      method: string;
      body: BodyInit | null | undefined;
      redirect: RequestRedirect | undefined;
    }> = [];
    const raw = JSON.stringify(body);
    const hash = createHash("sha256").update(raw).digest("hex");
    const originalBytes = JSON.stringify({
      data: { id, version: 1, amount: body.amount, currency: "EUR" },
    });
    const key = " native140-retained-key ";
    const client = new Factuarea({
      apiKey: "fact_test_native140_fixture",
      maxRetries: 5,
      fetch: async (input, init) => {
        const url = new URL(String(input));
        const headers = init?.headers as Record<string, string>;
        calls.push({
          path: url.pathname,
          method: init?.method ?? "GET",
          body: init?.body,
          redirect: init?.redirect,
        });
        expect(headers["Idempotency-Key"]).toBe(key);
        if (init?.method === "POST") {
          expect(url.pathname).toBe("/v1/crm/opportunity");
          expect(init.body).toBe(raw);
          expect(init.redirect).toBe("error");
          throw new TypeError("native dispatch response lost");
        }
        expect(url.pathname).toBe("/v1/crm/opportunity/create/original");
        expect(url.searchParams.get("original_body_sha256")).toBe(hash);
        expect(init?.body).toBeUndefined();
        return new Response(
          JSON.stringify({
            data: {
              state: "confirmed",
              original_body_sha256: hash,
              original_response: { status: 201, body: originalBytes },
            },
            meta: { authorization_version: "opaque-native140-C7" },
          }),
          {
            headers: {
              "Content-Type": "application/json",
              "X-Request-Id": "native140-original",
            },
          }
        );
      },
    });
    await expect(
      client.crm.source.opportunities.create(body, {
        idempotencyKey: key,
        humanConfirmed: true,
        maxRetries: 9,
      })
    ).rejects.toBeInstanceOf(CrmUnconfirmedWriteError);
    const original = await client.crm.source.opportunities.getCreateOriginal(
      { original_body_sha256: hash },
      { idempotencyKey: key, maxRetries: 0 }
    );
    expect(original.data.original_response?.body).toBe(originalBytes);
    expect(original.meta.authorization_version).toBe("opaque-native140-C7");
    expect(calls.map((call) => call.method)).toEqual(["POST", "GET"]);
  });

  it("denies a 307 receipt and never follows the foreign Location or repeats a mutation", async () => {
    const calls: Array<{
      origin: string;
      method: string;
      redirect: RequestRedirect | undefined;
    }> = [];
    const client = new Factuarea({
      apiKey: "fact_test_native140_fixture",
      maxRetries: 9,
      fetch: async (input, init) => {
        calls.push({
          origin: new URL(String(input)).origin,
          method: init?.method ?? "GET",
          redirect: init?.redirect,
        });
        // HTTP fake returns the redirect response without following it; assert the real transport's fetch policy.
        expect(init?.redirect).toBe("error");
        return new Response(null, {
          status: 307,
          headers: {
            Location: "https://foreign.invalid/collect",
            "X-Request-Id": "native140-redirect",
          },
        });
      },
    });
    await expect(
      client.crm.source.opportunities.create(body, {
        idempotencyKey: "native140-redirect-key",
        humanConfirmed: true,
      })
    ).rejects.toMatchObject({ status: 307, requestId: "native140-redirect" });
    expect(calls).toEqual([
      {
        origin: "https://api.factuarea.com",
        method: "POST",
        redirect: "error",
      },
    ]);
  });
});
