import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import type { Factuarea } from "../src/index.js";
import {
  AccountResource,
  CompaniesResource,
  ManagedAccountsResource,
} from "../src/resources/index.js";
import { BASE_URL, server, testClient, useMockServer } from "./helpers.js";

useMockServer();

/** Account axis: `{account}` is the first argument of every account-scoped method. */
const ACCOUNT = "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8b01";
const MANAGED = "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8b02";
const WEBHOOK = "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8b03";
const DELIVERY = "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8b04";
const TRANSFER = "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8b05";
const REQUEST_ID = "req_01931b3e7c4a";

type Verb = "GET" | "POST" | "PATCH" | "DELETE";

interface OperationCase {
  /** operationId of the frozen document (inventory section D). */
  operationId: string;
  method: Verb;
  /** Path under `/v1`, as the frozen document declares it, with ids filled in. */
  path: string;
  call: (client: Factuarea) => Promise<unknown>;
}

function form(): FormData {
  const data = new FormData();
  data.append("accounts_file", new Blob(["nif,mode\nB12345674,managed_account\n"], { type: "text/csv" }), "accounts.csv");
  return data;
}

const OPERATIONS: OperationCase[] = [
  // NIF transfer (4)
  { operationId: "public-api.v1.account.nif_transfers.accept", method: "POST", path: `/accounts/${ACCOUNT}/nif-transfers/accept`, call: (c) => c.account.nifTransfers.accept(ACCOUNT, {} as never) },
  { operationId: "public-api.v1.account.nif_transfers.create", method: "POST", path: `/accounts/${ACCOUNT}/nif-transfers`, call: (c) => c.account.nifTransfers.create(ACCOUNT, {} as never) },
  { operationId: "public-api.v1.account.nif_transfers.list", method: "GET", path: `/accounts/${ACCOUNT}/nif-transfers`, call: (c) => c.account.nifTransfers.list(ACCOUNT) },
  { operationId: "public-api.v1.account.nif_transfers.revoke", method: "POST", path: `/accounts/${ACCOUNT}/nif-transfers/${TRANSFER}/revoke`, call: (c) => c.account.nifTransfers.revoke(ACCOUNT, TRANSFER, {}) },
  // Managed accounts provisioning (9)
  { operationId: "public-api.v1.managed_accounts.access_level.update", method: "PATCH", path: `/accounts/${MANAGED}/access-level`, call: (c) => c.managedAccounts.accessLevel.update(MANAGED, {} as never) },
  { operationId: "public-api.v1.managed_accounts.claim_tokens.create", method: "POST", path: `/accounts/${MANAGED}/claim-tokens`, call: (c) => c.managedAccounts.claimTokens.create(MANAGED, {}) },
  { operationId: "public-api.v1.managed_accounts.create", method: "POST", path: "/accounts", call: (c) => c.managedAccounts.create({} as never) },
  { operationId: "public-api.v1.managed_accounts.list", method: "GET", path: "/accounts", call: (c) => c.managedAccounts.list() },
  { operationId: "public-api.v1.managed_accounts.management.end", method: "DELETE", path: `/accounts/${MANAGED}/management`, call: (c) => c.managedAccounts.management.end(MANAGED) },
  { operationId: "public-api.v1.managed_accounts.plan.preview", method: "GET", path: `/accounts/${MANAGED}/plan/preview`, call: (c) => c.managedAccounts.plan.preview(MANAGED) },
  { operationId: "public-api.v1.managed_accounts.plan.update", method: "PATCH", path: `/accounts/${MANAGED}/plan`, call: (c) => c.managedAccounts.plan.update(MANAGED, {} as never) },
  { operationId: "public-api.v1.managed_accounts.show", method: "GET", path: `/accounts/${MANAGED}`, call: (c) => c.managedAccounts.show(MANAGED) },
  { operationId: "public-api.v1.account.provisioning_usage", method: "GET", path: `/accounts/${ACCOUNT}/provisioning-usage`, call: (c) => c.account.provisioningUsage(ACCOUNT) },
  // Bulk import (3)
  { operationId: "public-api.v1.managed_accounts.imports.create", method: "POST", path: "/accounts/imports", call: (c) => c.managedAccounts.imports.create(form()) },
  { operationId: "public-api.v1.managed_accounts.imports.preview", method: "POST", path: "/accounts/imports/preview", call: (c) => c.managedAccounts.imports.preview(form()) },
  { operationId: "public-api.v1.managed_accounts.imports.template", method: "GET", path: "/accounts/imports/template", call: (c) => c.managedAccounts.imports.template() },
  // Account webhooks (10)
  { operationId: "public-api.v1.account.webhooks.create", method: "POST", path: `/accounts/${ACCOUNT}/webhooks`, call: (c) => c.account.webhooks.create(ACCOUNT, {} as never) },
  { operationId: "public-api.v1.account.webhooks.delete", method: "DELETE", path: `/accounts/${ACCOUNT}/webhooks/${WEBHOOK}`, call: (c) => c.account.webhooks.delete(ACCOUNT, WEBHOOK) },
  { operationId: "public-api.v1.account.webhooks.deliveries.list", method: "GET", path: `/accounts/${ACCOUNT}/webhooks/${WEBHOOK}/deliveries`, call: (c) => c.account.webhooks.deliveries.list(ACCOUNT, WEBHOOK) },
  { operationId: "public-api.v1.account.webhooks.deliveries.retry", method: "POST", path: `/accounts/${ACCOUNT}/webhooks/${WEBHOOK}/deliveries/${DELIVERY}/retry`, call: (c) => c.account.webhooks.deliveries.retry(ACCOUNT, WEBHOOK, DELIVERY) },
  { operationId: "public-api.v1.account.webhooks.deliveries.show", method: "GET", path: `/accounts/${ACCOUNT}/webhooks/${WEBHOOK}/deliveries/${DELIVERY}`, call: (c) => c.account.webhooks.deliveries.show(ACCOUNT, WEBHOOK, DELIVERY) },
  { operationId: "public-api.v1.account.webhooks.list", method: "GET", path: `/accounts/${ACCOUNT}/webhooks`, call: (c) => c.account.webhooks.list(ACCOUNT) },
  { operationId: "public-api.v1.account.webhooks.rotate_secret", method: "POST", path: `/accounts/${ACCOUNT}/webhooks/${WEBHOOK}/secret`, call: (c) => c.account.webhooks.rotateSecret(ACCOUNT, WEBHOOK) },
  { operationId: "public-api.v1.account.webhooks.show", method: "GET", path: `/accounts/${ACCOUNT}/webhooks/${WEBHOOK}`, call: (c) => c.account.webhooks.show(ACCOUNT, WEBHOOK) },
  { operationId: "public-api.v1.account.webhooks.test", method: "POST", path: `/accounts/${ACCOUNT}/webhooks/${WEBHOOK}/test`, call: (c) => c.account.webhooks.test(ACCOUNT, WEBHOOK, {}) },
  { operationId: "public-api.v1.account.webhooks.update", method: "PATCH", path: `/accounts/${ACCOUNT}/webhooks/${WEBHOOK}`, call: (c) => c.account.webhooks.update(ACCOUNT, WEBHOOK, {}) },
  // Account request logs (2)
  { operationId: "public-api.v1.account.request_logs.list", method: "GET", path: `/accounts/${ACCOUNT}/request-logs`, call: (c) => c.account.requestLogs.list(ACCOUNT) },
  { operationId: "public-api.v1.account.request_logs.show", method: "GET", path: `/accounts/${ACCOUNT}/request-logs/${REQUEST_ID}`, call: (c) => c.account.requestLogs.show(ACCOUNT, REQUEST_ID) },
];

describe("account model: client surface", () => {
  it("exposes companies and managedAccounts as client properties", () => {
    const client = testClient();
    expect(client.companies).toBeInstanceOf(CompaniesResource);
    expect(client.managedAccounts).toBeInstanceOf(ManagedAccountsResource);
    expect(client.account).toBeInstanceOf(AccountResource);
  });

  it("gives account the transfer, webhooks, request logs and provisioning usage resources", () => {
    const { account } = testClient();
    expect(account.nifTransfers).toBeDefined();
    expect(account.webhooks).toBeDefined();
    expect(account.webhooks.deliveries).toBeDefined();
    expect(account.requestLogs).toBeDefined();
    expect(typeof account.provisioningUsage).toBe("function");
  });

  it("does not keep the retired account claim voucher resource", () => {
    const account = testClient().account as unknown as Record<string, unknown>;
    expect(account["claimTokens"]).toBeUndefined();
  });

  it("keeps the NIF portfolio on companies, with its statistics", () => {
    expect(typeof testClient().companies.stats).toBe("function");
  });
});

describe("account model: one method per operation of the frozen document", () => {
  it("covers the 28 operations of the inventory", () => {
    expect(new Set(OPERATIONS.map((op) => op.operationId)).size).toBe(28);
  });

  it("declares each case with the method and operationId of spec/openapi.json", () => {
    const root = join(dirname(fileURLToPath(import.meta.url)), "..");
    const spec = JSON.parse(readFileSync(join(root, "spec", "openapi.json"), "utf8")) as {
      paths: Record<string, Record<string, { operationId?: string }>>;
    };
    const templates = Object.keys(spec.paths).map((template) => ({ template, segments: template.split("/") }));

    for (const { operationId, method, path } of OPERATIONS) {
      const segments = path.split("/");
      // A `{param}` segment of the document matches any concrete value of the case.
      // The template with the most literal segments wins (`/accounts/imports` over `/accounts/{account}`).
      const candidates = templates
        .filter((t) => t.segments.length === segments.length)
        .filter((t) => t.segments.every((seg, i) => seg.startsWith("{") || seg === segments[i]))
        .map((t) => ({ ...t, literals: t.segments.filter((seg) => !seg.startsWith("{")).length }))
        .sort((a, b) => b.literals - a.literals);
      const best = candidates[0];
      expect(best, `${operationId}: no path of the document matches ${path}`).toBeDefined();
      const operation = spec.paths[best!.template]?.[method.toLowerCase()];
      expect(operation?.operationId, `${method} ${best!.template}`).toBe(operationId);
    }
  });

  it.each(OPERATIONS)("$operationId builds $method $path", async ({ method, path, call }) => {
    const seen: Array<{ method: string; pathname: string }> = [];
    const handler = (request: Request): Response => {
      seen.push({ method: request.method, pathname: new URL(request.url).pathname });
      const listLike = method === "GET" && /\/(accounts|webhooks|deliveries|nif-transfers|request-logs)$/.test(path);
      return HttpResponse.json(listLike ? { data: [], has_more: false, next_cursor: null } : { data: {} });
    };
    server.use(
      http.get(`${BASE_URL}/*`, ({ request }) => handler(request)),
      http.post(`${BASE_URL}/*`, ({ request }) => handler(request)),
      http.patch(`${BASE_URL}/*`, ({ request }) => handler(request)),
      http.delete(`${BASE_URL}/*`, ({ request }) => handler(request)),
    );

    await call(testClient());

    expect(seen).toHaveLength(1);
    expect(seen[0]?.method).toBe(method);
    expect(seen[0]?.pathname).toBe(`${new URL(BASE_URL).pathname}${path}`);
  });
});

describe("account model: bulk import multipart", () => {
  it.each(["create", "preview"] as const)("sends imports.%s as multipart without a JSON content type", async (operation) => {
    const target = operation === "create" ? "/accounts/imports" : "/accounts/imports/preview";
    let contentType: string | null = null;
    let received: FormData | null = null;
    server.use(
      http.post(`${BASE_URL}${target}`, async ({ request }) => {
        contentType = request.headers.get("content-type");
        received = await request.formData();
        return HttpResponse.json({ data: {} });
      }),
    );

    const data = form();
    data.append("customers_file", new Blob(["account_ref,name\nA1,Cliente\n"], { type: "text/csv" }), "customers.csv");
    data.append("options[send_email]", "true");
    await testClient().managedAccounts.imports[operation](data);

    expect(contentType).toMatch(/^multipart\/form-data; boundary=/);
    expect(contentType).not.toMatch(/json/i);
    const body = received as FormData | null;
    expect((body?.get("accounts_file") as File).name).toBe("accounts.csv");
    expect((body?.get("customers_file") as File).name).toBe("customers.csv");
    expect(body?.get("options[send_email]")).toBe("true");
  });
});
