import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  ConnectionError,
  ConflictError,
  CrmUnconfirmedWriteError,
  Factuarea,
} from "../src/index.js";

const run = "019c0000-0000-7000-8000-000000001431";
const blob = "019c0000-0000-7000-8000-000000001432";
const effect = "019c0000-0000-7000-8000-000000001433";
const document = "019c0000-0000-7000-8000-000000001434";
const profile = "019c0000-0000-7000-8000-000000001435";
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "X-Request-Id": "source143-native-request",
    },
  });

describe("private native Source143 Import and Restore", () => {
  it("keeps initial202 Original separate from Current and exact CSV bytes after one lost Apply", async () => {
    const body = {
      expected_version: 3,
      preview_hash: "a".repeat(64),
      effect_uuid: effect,
      mode: "import" as const,
      confirmed: true as const,
    };
    const raw = JSON.stringify(body);
    const hash = createHash("sha256").update(raw).digest("hex");
    const firstRun = {
      id: run,
      source_blob_id: blob,
      entity_type: "lead",
      version: 4,
      state: "applying",
      preview_hash: body.preview_hash,
      counts: { total: 2 },
      blocking_codes: [],
      progress: { total: 2, processed: 0, pending: 2 },
    };
    const originalBytes = JSON.stringify({ data: firstRun });
    const csvBytes = Buffer.from(
      "\ufeffsource_row,field,codes\r\n7,,validation_failed\r\n",
      "utf8"
    );
    const cursor = "native_cursor_v9";
    const key = " source143-apply-key ";
    let unsafeCount = false;
    const calls: Array<{
      method: string;
      path: string;
      body: BodyInit | null | undefined;
    }> = [];
    const client = new Factuarea({
      apiKey: "fact_test_source143_fixture",
      maxRetries: 7,
      defaultHeaders: { "X-Active-Profile": profile },
      fetch: async (input, init) => {
        const url = new URL(String(input));
        const headers = init?.headers as Record<string, string>;
        calls.push({
          method: init?.method ?? "GET",
          path: url.pathname,
          body: init?.body,
        });
        expect(headers["X-Active-Profile"]).toBe(profile);
        if (init?.method === "POST") {
          expect(url.pathname).toBe(`/v1/crm/imports/${run}/apply`);
          expect(headers["Idempotency-Key"]).toBe(key);
          expect(init.body).toBe(raw);
          expect(init.redirect).toBe("error");
          throw new TypeError("lost initial202 after native dispatch");
        }
        expect(init?.body).toBeUndefined();
        if (url.pathname.endsWith("/original")) {
          expect(headers["Idempotency-Key"]).toBe(key);
          expect(url.searchParams.get("original_body_sha256")).toBe(hash);
          return json({
            data: {
              state: "confirmed",
              original_body_sha256: hash,
              authorization_version: "opaque-current-C7:143",
              original_response: { status: 202, body: originalBytes },
            },
          });
        }
        if (url.searchParams.get("report_format") === "csv") {
          expect(url.searchParams.get("expected_version")).toBe("9");
          expect(url.searchParams.has("cursor")).toBe(false);
          expect(url.searchParams.has("limit")).toBe(false);
          return new Response(csvBytes, {
            headers: {
              "Content-Type": "text/csv; charset=UTF-8",
              "Cache-Control": "private, no-store, max-age=0",
              "X-Request-Id": "source143-csv",
            },
          });
        }
        if (url.searchParams.has("cursor"))
          return json(
            {
              error: {
                type: "conflict_error",
                code: "version_conflict",
                subcode: "current_run_changed",
                message: "The current run version changed.",
              },
            },
            409
          );
        return json({
          data: {
            ...firstRun,
            version: 9,
            state: "native_future_state",
            counts: {
              total: 2,
              failed: unsafeCount ? Number.MAX_SAFE_INTEGER + 1 : 1,
            },
            progress: { total: 2, processed: 1, pending: 1 },
            errors: {
              version: 9,
              items: [
                { source_row: 7, field: null, codes: ["validation_failed"] },
              ],
              has_more: true,
              next_row: 8,
              next_cursor: cursor,
            },
          },
        });
      },
    });
    await expect(
      client.crm.source.imports.apply(run, body, {
        idempotencyKey: key,
        humanConfirmed: true,
      })
    ).rejects.toBeInstanceOf(CrmUnconfirmedWriteError);
    const original = await client.crm.source.imports.getApplyOriginal(
      run,
      { original_body_sha256: hash },
      { idempotencyKey: key, maxRetries: 0 }
    );
    expect(original.data.original_response?.status).toBe(202);
    expect(original.data.original_response?.body).toBe(originalBytes);
    const current = await client.crm.source.imports.getCurrent(run, {
      limit: 1,
    });
    expect(current.data.version).toBe(9);
    expect(current.data.state).toBe("native_future_state");
    expect(current.data.errors.items[0]?.field).toBeNull();
    expect(current.data.errors.next_cursor).toBe(cursor);
    const csv = await client.crm.source.imports.downloadErrorsCsv(run, {
      report_format: "csv",
      expected_version: 9,
    });
    expect(csv.toBuffer()).toEqual(csvBytes);
    expect(csv.contentType).toBe("text/csv; charset=UTF-8");
    expect(csv.requestId).toBe("source143-csv");
    await expect(
      client.crm.source.imports.getCurrent(run, { cursor }, { maxRetries: 0 })
    ).rejects.toBeInstanceOf(ConflictError);
    unsafeCount = true;
    await expect(
      client.crm.source.imports.getCurrent(run)
    ).rejects.toMatchObject({
      code: "crm_response_unsafe_integer",
      requestId: "source143-native-request",
    });
    expect(calls.filter((call) => call.method === "POST")).toHaveLength(1);
    expect(calls.slice(1).every((call) => call.method === "GET")).toBe(true);
    expect(original.data.original_response?.body).toBe(originalBytes);
  });

  it("stops a lost Restore at UNKNOWN without an invented Original, current-proof lookup or POST replay", async () => {
    const calls: Array<{
      method: string;
      path: string;
      key?: string;
      body: BodyInit | null | undefined;
    }> = [];
    const key = "native143-restore-key";
    const body = { expected_version: 8, confirmed: true as const };
    const client = new Factuarea({
      apiKey: "fact_test_source143_fixture",
      maxRetries: 9,
      fetch: async (input, init) => {
        const headers = init?.headers as Record<string, string>;
        calls.push({
          method: init?.method ?? "GET",
          path: new URL(String(input)).pathname,
          key: headers["Idempotency-Key"],
          body: init?.body,
        });
        expect(init?.redirect).toBe("error");
        throw new TypeError("lost restore response after native dispatch");
      },
    });
    let outcome: "unknown" | undefined;
    try {
      await client.crm.source.documents.restore(document, body, {
        idempotencyKey: key,
        humanConfirmed: true,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(CrmUnconfirmedWriteError);
      if (!(error instanceof CrmUnconfirmedWriteError)) throw error;
      expect(error.idempotencyKey).toBe(key);
      expect(error.cause).toBeInstanceOf(ConnectionError);
      outcome = "unknown";
    }
    expect(outcome).toBe("unknown");
    expect("getRestoreOriginal" in client.crm.source.documents).toBe(false);
    expect(calls).toEqual([
      {
        method: "POST",
        path: `/v1/crm/documents/${document}/restore`,
        key,
        body: JSON.stringify(body),
      },
    ]);
  });
});

// Compile-only boundaries. This function is never invoked by either HTTP case.
function nativeConditionalTypes(client: Factuarea) {
  const config = { idempotencyKey: "retained143-key", humanConfirmed: true as const };
  const invalidApply = { expected_version: 3, preview_hash: "a".repeat(64),
    effect_uuid: effect, mode: "import" as const, confirmed: true as const,
    corrected_source_blob_id: blob };
  const invalidCsv = { report_format: "csv" as const, cursor: "native_cursor" };
  const invalidJson = { report_format: "csv" as const, expected_version: 9 };
  // @ts-expect-error Native allOf permits corrected_source_blob_id only for retry_failed.
  void client.crm.source.imports.apply(run, invalidApply, config);
  // @ts-expect-error CSV mode requires the native expected_version and excludes cursor/limit.
  void client.crm.source.imports.downloadErrorsCsv(run, invalidCsv);
  // @ts-expect-error Current JSON query does not silently select CSV media.
  void client.crm.source.imports.getCurrent(run, invalidJson);
}
void nativeConditionalTypes;
