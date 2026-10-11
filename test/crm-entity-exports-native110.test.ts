import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import {
  AuthenticationError,
  CrmUnconfirmedWriteError,
  Factuarea,
  type CrmEntityExportConfirmedConfig,
  type CrmEntityExportSelection,
} from "../src/index.js";
import { BASE_URL, server, testClient, useMockServer } from "./helpers.js";

useMockServer();
const ID = "0199e542-3030-7000-8000-000000000110";
const KEY = "native-entity-export-110-original";

describe("native CRM entity exports110", () => {
  it("retains the confirmed full selection, reads factual Original states and downloads the exact native currency bytes", async () => {
    const csv = new TextEncoder().encode(
      "uuid,amount,currency,weighted_value\r\nfirst,9007199254740993.01,EUR,4503599627370496.50\r\nsecond,2.10,USD,0.63\r\n"
    );
    const filters = {
      status: "open" as const,
      created_from: "2026-10-01",
      created_to: "2026-10-11",
      typed_filters: { definition_version: 3, filters: [] },
    };
    const columns = ["uuid", "amount", "currency", "weighted_value"] as const;
    const client = testClient({ maxRetries: 3 });
    const intent = client.crm.entityExports.prepare(
      { entity_type: "opportunity", filters, columns },
      { id: ID, idempotencyKey: KEY }
    );
    const raw = intent.rawRequest;
    filters.created_from = "2020-01-01";
    filters.typed_filters.definition_version = 99;
    let posts = 0;
    let reads = 0;
    let downloads = 0;
    server.use(
      http.post(`${BASE_URL}/crm/entity-exports`, async ({ request }) => {
        posts++;
        expect(await request.text()).toBe(raw);
        expect(request.headers.get("Idempotency-Key")).toBe(KEY);
        expect(request.headers.get("Authorization")).toBe(
          "Bearer fact_test_secret"
        );
        expect(JSON.parse(raw)).toEqual({
          id: ID,
          entity_type: "opportunity",
          filters: {
            status: "open",
            created_from: "2026-10-01",
            created_to: "2026-10-11",
            typed_filters: { definition_version: 3, filters: [] },
          },
          columns,
          confirmed: true,
        });
        return HttpResponse.json(
          {
            data: { id: ID, entity_type: "opportunity", status: "processing" },
          },
          { status: 202 }
        );
      }),
      http.get(`${BASE_URL}/crm/entity-exports/${ID}`, async ({ request }) => {
        reads++;
        expect(new URL(request.url).search).toBe("");
        expect(await request.text()).toBe("");
        return HttpResponse.json({
          data:
            reads === 1
              ? { id: ID, entity_type: "opportunity", status: "processing" }
              : {
                  id: ID,
                  entity_type: "opportunity",
                  status: "ready",
                  filename: "crm-opportunity.csv",
                  size_bytes: csv.byteLength,
                },
        });
      }),
      http.get(
        `${BASE_URL}/crm/entity-exports/${ID}/download`,
        async ({ request }) => {
          downloads++;
          expect(reads).toBe(3);
          expect(new URL(request.url).search).toBe("");
          expect(await request.text()).toBe("");
          expect(request.headers.get("Accept")).toBe("text/csv");
          return HttpResponse.arrayBuffer(csv.buffer as ArrayBuffer, {
            headers: {
              "Content-Type": "text/csv; charset=utf-8",
              "Content-Disposition":
                'attachment; filename="crm-opportunity.csv"',
              "X-Request-Id": "req_native_binary110",
            },
          });
        }
      )
    );
    const accepted = await client.crm.entityExports.request(intent, {
      humanConfirmed: true,
    });
    expect(accepted.data.status).toBe("processing");
    expect(accepted.data.filename).toBeUndefined();
    expect((await client.crm.entityExports.status(intent)).data.status).toBe(
      "processing"
    );
    expect(
      (await client.crm.entityExports.getOriginal(intent)).data.status
    ).toBe("ready");
    const binary = await client.crm.entityExports.download(intent);
    expect(binary.requestId).toBe("req_native_binary110");
    expect(binary.contentType).toBe("text/csv; charset=utf-8");
    expect(new Uint8Array(binary.body)).toEqual(csv);
    expect(binary.toBuffer().toString("utf8")).toBe(
      new TextDecoder().decode(csv)
    );
    expect(binary.toBlob().size).toBe(csv.byteLength);
    expect([posts, reads, downloads]).toEqual([1, 3, 1]);
    expect(Object.isFrozen(intent.request.filters)).toBe(true);
    expect(Object.isFrozen(intent.request.columns)).toBe(true);
    expect(JSON.stringify(intent)).toBe(JSON.stringify({ id: ID }));
  });

  it("recovers a lost confirmed POST only by the same Original and reauthorizes after credential revocation without resending", async () => {
    let credential = "issuer-current110";
    const client = new Factuarea({
      apiKey: "",
      baseUrl: BASE_URL,
      maxRetries: 3,
      timeout: 2000,
      authStrategy: {
        headers: async () => ({ Authorization: `Bearer ${credential}` }),
      },
    });
    const selection = {
      entity_type: "lead",
      filters: {
        has_email: true,
        status: ["open"],
        created_from: "2026-10-01T00:00:00.123456Z",
      },
      columns: ["uuid", "estimated_value_amount", "estimated_value_currency"],
    } satisfies CrmEntityExportSelection<"lead">;
    const intent = client.crm.entityExports.prepare(selection, {
      id: ID,
      idempotencyKey: KEY,
    });
    let posts = 0;
    let reads = 0;
    let downloads = 0;
    server.use(
      http.post(`${BASE_URL}/crm/entity-exports`, async ({ request }) => {
        posts++;
        expect(await request.text()).toBe(intent.rawRequest);
        expect(request.headers.get("Idempotency-Key")).toBe(KEY);
        return HttpResponse.error(); // The fake owner committed, but the receipt was lost.
      }),
      http.get(`${BASE_URL}/crm/entity-exports/${ID}`, async ({ request }) => {
        reads++;
        expect(new URL(request.url).search).toBe("");
        expect(await request.text()).toBe("");
        if (
          request.headers.get("Authorization") !== "Bearer issuer-current110"
        ) {
          return HttpResponse.json(
            {
              error: {
                type: "authorization_error",
                code: "crm_context_revoked",
                message: "Current context revoked",
                request_id: "req_revoked110",
              },
            },
            { status: 403 }
          );
        }
        return HttpResponse.json({
          data: {
            id: ID,
            entity_type: "lead",
            status: "ready",
            filename: "crm-lead.csv",
            size_bytes: 0,
          },
        });
      }),
      http.get(`${BASE_URL}/crm/entity-exports/${ID}/download`, () => {
        downloads++;
        return HttpResponse.text("");
      })
    );
    await expect(
      client.crm.entityExports.request(intent, {
        humanConfirmed: false,
      } as unknown as CrmEntityExportConfirmedConfig)
    ).rejects.toThrow("human confirmation");
    expect(posts).toBe(0);
    await expect(
      client.crm.entityExports.request(intent, {
        humanConfirmed: true,
        headers: { "idempotency-key": "must-not-replace-the-original110" },
      })
    ).rejects.toMatchObject({
      name: CrmUnconfirmedWriteError.name,
      state: "unconfirmed",
      idempotencyKey: KEY,
    });
    expect(posts).toBe(1);
    expect(
      (await client.crm.entityExports.getOriginal(intent)).data.status
    ).toBe("ready");
    await expect(
      client.crm.entityExports.request(intent, { humanConfirmed: true })
    ).rejects.toThrow("read the same Original");
    credential = "issuer-revoked110";
    await expect(
      client.crm.entityExports.download(intent)
    ).rejects.toBeInstanceOf(AuthenticationError);
    expect([posts, reads, downloads]).toEqual([1, 2, 0]);
    expect(intent.id).toBe(ID);
    expect(intent.idempotencyKey).toBe(KEY);
    expect(intent.request.filters.has_email).toBe(true);
  });
});
