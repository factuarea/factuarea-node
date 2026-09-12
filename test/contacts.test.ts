import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { BASE_URL, server, testClient, useMockServer } from "./helpers.js";

useMockServer();
const contactId = "0199152d-525d-7000-8000-000000000001";

describe("canonical contacts", () => {
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
});
