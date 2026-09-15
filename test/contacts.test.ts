import { http, HttpResponse } from "msw";
import type { PreviewBusinessContactImportV1Request } from "../src/index.js";
import { describe, expect, it } from "vitest";
import { BASE_URL, server, testClient, useMockServer } from "./helpers.js";

useMockServer();
const contactId = "0199152d-525d-7000-8000-000000000001";

describe("canonical contacts", () => {
  it.each(["list", "search"] as const)("keeps per-request options and archived filters across %s pages", async (method) => {
    const requests: Request[] = [];
    const path = method === "list" ? "/contacts" : "/contacts/search";
    server.use(http.get(`${BASE_URL}${path}`, ({ request }) => {
      requests.push(request);
      const next = new URL(request.url).searchParams.has("starting_after");
      return HttpResponse.json({ data: [{ id: next ? "second" : contactId }], has_more: !next, next_cursor: next ? null : contactId });
    }));
    const page = await testClient().contacts[method](
      { roles: ["supplier"], tags: ["preferred", "local"], is_archived: true, has_email: false },
      { headers: { "X-Active-Profile": "managed-company" }, timeout: 5000 },
    );
    expect(await page.toArray()).toHaveLength(2);
    for (const request of requests) {
      const url = new URL(request.url);
      expect(request.headers.get("X-Active-Profile")).toBe("managed-company");
      expect(url.searchParams.getAll("roles[]")).toEqual(["supplier"]);
      expect(url.searchParams.getAll("tags[]")).toEqual(["preferred", "local"]);
      expect(url.searchParams.get("is_archived")).toBe("1");
      expect(url.searchParams.get("has_email")).toBe("0");
    }
  });

  it("keeps role and phone filters across cursor pages", async () => {
    const urls: URL[] = [];
    server.use(http.get(`${BASE_URL}/contacts`, ({ request }) => {
      const url = new URL(request.url);
      urls.push(url);
      const next = url.searchParams.has("starting_after");
      return HttpResponse.json({ data: [{ id: next ? "second" : contactId }], has_more: !next, next_cursor: next ? null : contactId });
    }));
    const page = await testClient().contacts.list({ roles: ["lead", "customer"], search: "600123456", limit: 1 });
    expect(await page.toArray()).toHaveLength(2);
    for (const url of urls) {
      expect(url.searchParams.get("search")).toBe("600123456");
      expect(url.searchParams.getAll("roles[]")).toEqual(["lead", "customer"]);
    }
    expect(urls[1]?.searchParams.get("starting_after")).toBe(contactId);
  });

  it("creates a fiscal lead and assigns customer to the same identity", async () => {
    let body: unknown;
    server.use(
      http.post(`${BASE_URL}/contacts`, async ({ request }) => {
        body = await request.json();
        expect(request.headers.get("Idempotency-Key")).toBeTruthy();
        return HttpResponse.json({ data: { id: contactId, roles: [{ role: "lead", status: "active" }] } }, { status: 201 });
      }),
      http.post(`${BASE_URL}/contacts/${contactId}/roles/customer`, () => HttpResponse.json({ data: { id: contactId } })),
    );
    const client = testClient();
    await client.contacts.create({ name: "Prospect", kind: "company", tax_id: "B87654323", roles: ["lead"] });
    expect(body).toEqual({ name: "Prospect", kind: "company", tax_id: "B87654323", roles: ["lead"] });
    expect(await client.contacts.assignContactRole(contactId, "customer")).toEqual({ data: { id: contactId } });
  });

  it("writes the customer tariff through the profile endpoint", async () => {
    const profile = { default_price_list_id: "0199152d-525d-7000-8000-000000000002" };
    server.use(http.put(`${BASE_URL}/contacts/${contactId}/customer-profile`, async ({ request }) => {
      expect(await request.json()).toEqual(profile);
      return HttpResponse.json({ data: { id: contactId } });
    }));
    await testClient().contacts.updateCustomerProfile(contactId, profile);
  });

  it("archives and restores the same identity without losing its roles", async () => {
    const contact = { id: contactId, roles: [{ role: "customer", status: "active" }, { role: "supplier", status: "active" }], is_archived: false };
    server.use(
      http.delete(`${BASE_URL}/contacts/${contactId}`, () => {
        contact.is_archived = true;
        return HttpResponse.json({ data: contact });
      }),
      http.put(`${BASE_URL}/contacts/${contactId}/restore`, () => {
        contact.is_archived = false;
        return HttpResponse.json({ data: contact });
      }),
    );
    const client = testClient();
    expect(await client.contacts.delete(contactId)).toEqual({ data: { ...contact, is_archived: true } });
    expect(await client.contacts.restore(contactId)).toEqual({ data: { id: contactId, roles: contact.roles, is_archived: false } });
  });

  it.each(["previewImport", "import"] as const)("sends a named-column mapping and cumulative roles to %s", async (method) => {
    const path = method === "previewImport" ? "/contacts/import/preview" : "/contacts/import";
    server.use(http.post(`${BASE_URL}${path}`, async ({ request }) => {
      const body = await request.formData();
      expect(body.get("mapping[name]")).toBe("Name");
      expect(body.get("mapping[tax_id]")).toBe("Tax ID");
      expect(body.getAll("target_roles[]")).toEqual(["customer", "supplier"]);
      expect(await (body.get("file") as File).text()).toBe("Name,Tax ID\nContact,B12345674\n");
      expect(request.headers.get("Idempotency-Key")).toBeTruthy();
      return HttpResponse.json({ data: { create: 1, invalid: 0 } });
    }));
    const body = new FormData();
    body.append("file", new Blob(["Name,Tax ID\nContact,B12345674\n"], { type: "text/csv" }), "contacts.csv");
    const mapping: PreviewBusinessContactImportV1Request["mapping"] = { name: "Name", tax_id: "Tax ID" };
    for (const [field, column] of Object.entries(mapping)) body.append(`mapping[${field}]`, column);
    body.append("target_roles[]", "customer");
    body.append("target_roles[]", "supplier");
    expect(await testClient().contacts[method](body)).toEqual({ data: { create: 1, invalid: 0 } });
  });
});
