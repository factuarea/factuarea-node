import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  AuthenticationError,
  ConnectionError,
  CrmUnconfirmedWriteError,
  Factuarea,
} from "../src/index.js";

const id = "019c0000-0000-7000-8000-000000001391";
const owner = "019c0000-0000-7000-8000-000000001392";
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "X-Request-Id": "native-source139-request",
      "Cache-Control": "no-store, private",
    },
  });

describe("private native Source139 transport", () => {
  it("reconciles a lost write only by factual GET Original, retaining exact bytes, decimal text and current C7", async () => {
    const calls: Array<{
      url: URL;
      method: string;
      body: BodyInit | null | undefined;
      headers: Record<string, string>;
    }> = [];
    const body = { name: "Synthetic native lead" };
    const originalBytes = JSON.stringify(body);
    const hash = createHash("sha256").update(originalBytes).digest("hex");
    const originalResponse =
      '{ "data": { "id": "019c0000-0000-7000-8000-000000001391", "estimated_value_amount": "12345678901234567890.0100", "estimated_value_currency": "EUR" } }';
    let confirmed = false;
    let revoked = false;
    const client = new Factuarea({
      apiKey: "fact_test_source139_fixture",
      maxRetries: 5,
      fetch: async (input, init) => {
        const request = {
          url: new URL(String(input)),
          method: init?.method ?? "GET",
          body: init?.body,
          headers: init?.headers as Record<string, string>,
        };
        calls.push(request);
        if (request.method === "POST")
          throw new TypeError("response lost after native dispatch");
        expect(request.url.pathname).toBe("/v1/crm/leads/create/original");
        expect(request.url.searchParams.get("original_body_sha256")).toBe(hash);
        expect(request.headers["Idempotency-Key"]).toBe(" original139-key ");
        expect(request.body).toBeUndefined();
        if (revoked)
          return json(
            {
              error: {
                type: "authorization_error",
                code: "permission_denied",
                subcode: "revoked",
                message: "Current native permission withdrawn.",
              },
            },
            403
          );
        return json({
          data: {
            state: confirmed ? "confirmed" : "unconfirmed",
            original_body_sha256: hash,
            original_response: confirmed
              ? { status: 201, body: originalResponse }
              : null,
          },
          meta: {
            authorization_version: confirmed
              ? "opaque-current-C7:2+=="
              : "opaque-current-C7:1+==",
          },
        });
      },
    });
    await expect(
      client.crm.leads.create(body, { idempotencyKey: " original139-key " })
    ).rejects.toBeInstanceOf(CrmUnconfirmedWriteError);
    expect(calls[0]?.body).toBe(originalBytes);
    const pending = await client.crm.source.leads.getCreateOriginal(
      { original_body_sha256: hash },
      { idempotencyKey: " original139-key ", maxRetries: 0 }
    );
    expect(pending.data.state).toBe("unconfirmed");
    expect(pending.data.original_response).toBeNull();
    confirmed = true;
    const original = await client.crm.source.leads.getCreateOriginal(
      { original_body_sha256: hash },
      { idempotencyKey: " original139-key ", maxRetries: 0 }
    );
    expect(original.data.original_response?.body).toBe(originalResponse);
    expect(original.meta.authorization_version).toBe("opaque-current-C7:2+==");
    revoked = true;
    await expect(
      client.crm.source.leads.getCreateOriginal(
        { original_body_sha256: hash },
        { idempotencyKey: " original139-key ", maxRetries: 0 }
      )
    ).rejects.toBeInstanceOf(AuthenticationError);
    expect(calls.filter((call) => call.method === "POST")).toHaveLength(1);
    expect(calls.slice(1).every((call) => call.method === "GET")).toBe(true);
  });

  it("separates Original from Current, preserves opaque keys and masked pages, and retires reads after cancellation or revocation", async () => {
    const calls: Array<{
      path: string;
      cursor: string | null;
      key?: string;
      profile?: string;
    }> = [];
    const sequenceKey = "k".repeat(512);
    const cursor = "native/opaque+cursor==";
    let revoked = false;
    let unsafeVersion = false;
    const binary = new Uint8Array([0, 255, 13, 10, 195, 177]);
    const client = new Factuarea({
      apiKey: "fact_test_source139_fixture",
      maxRetries: 0,
      fetch: async (input, init) => {
        const url = new URL(String(input));
        const headers = init?.headers as Record<string, string>;
        expect(init?.method).toBe("GET");
        expect(init?.body).toBeUndefined();
        calls.push({
          path: url.pathname,
          cursor: url.searchParams.get("cursor"),
          key: headers["Idempotency-Key"],
          profile: headers["X-Active-Profile"],
        });
        if (revoked)
          return json(
            {
              error: {
                type: "authorization_error",
                code: "permission_denied",
                message: "Current native context denied.",
              },
            },
            403
          );
        if (url.pathname.endsWith("/download"))
          return new Response(binary, {
            headers: {
              "Content-Type": "application/octet-stream",
              "X-Request-Id": "native-binary139",
            },
          });
        if (url.pathname.endsWith("/bookings"))
          return json({
            data: {
              items: [
                { id: url.searchParams.has("cursor") ? owner : id, version: 1 },
              ],
              total: 2,
              next_cursor: url.searchParams.has("cursor") ? null : cursor,
            },
          });
        const original = url.pathname.endsWith("/original");
        if (original) expect(headers["Idempotency-Key"]).toBe(sequenceKey);
        return json({
          data: {
            id,
            version: unsafeVersion
              ? Number.MAX_SAFE_INTEGER + 1
              : original
              ? 2
              : 9,
            authorization_version: original
              ? "current-C7:original"
              : "current-C7:head",
            sandbox: true,
            state: "draft",
            owner_id: owner,
            team_id: null,
            fields: {},
          },
        });
      },
    });
    const original = await client.crm.source.sequences.getSaveOriginal({
      idempotencyKey: sequenceKey,
    });
    const current = await client.crm.source.sequences.getCurrent(id);
    expect([original.data.version, current.data.version]).toEqual([2, 9]);
    expect(original.data.fields).toEqual({});
    expect(original.data.team_id).toBeNull();
    const items = [];
    for await (const item of client.crm.source.booking.iterateBookings(
      { limit: 1, status: "held" },
      { headers: { "X-Active-Profile": owner } }
    ))
      items.push(item);
    expect(items).toEqual([
      { id, version: 1 },
      { id: owner, version: 1 },
    ]);
    expect(
      calls
        .filter((call) => call.path.endsWith("/bookings"))
        .map((call) => [call.cursor, call.profile])
    ).toEqual([
      [null, owner],
      [cursor, owner],
    ]);
    const downloaded = await client.crm.source.documents.download(id);
    expect(downloaded.toBuffer()).toEqual(Buffer.from(binary));
    expect(downloaded.requestId).toBe("native-binary139");
    unsafeVersion = true;
    await expect(
      client.crm.source.sequences.getCurrent(id)
    ).rejects.toMatchObject({
      code: "crm_response_unsafe_integer",
      requestId: "native-source139-request",
    });
    const controller = new AbortController();
    controller.abort();
    const count = calls.length;
    await expect(
      client.crm.source.booking.listBookings(undefined, {
        signal: controller.signal,
      })
    ).rejects.toBeInstanceOf(ConnectionError);
    expect(calls).toHaveLength(count);
    revoked = true;
    await expect(
      client.crm.source.sequences.getSaveOriginal({
        idempotencyKey: sequenceKey,
      })
    ).rejects.toBeInstanceOf(AuthenticationError);
    expect(calls.every((call) => call.path.includes("/crm/"))).toBe(true);
  });
});
