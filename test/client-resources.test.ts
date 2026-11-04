import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { createResources } from "../src/resources/index.js";
import { COMPANY, COMPANY_URL, server, testClient, useMockServer } from "./helpers.js";

useMockServer();

describe("client resources", () => {
  it("exposes every generated resource namespace", () => {
    const client = testClient();
    const exposed = client as unknown as Record<string, unknown>;

    const missing = Object.entries(createResources(client.http))
      .filter(([name, resource]) => !(exposed[name] instanceof (resource as object).constructor))
      .map(([name]) => name);

    expect(missing).toEqual([]);
  });

  it("reaches a resource that the client did not list by hand", async () => {
    const urls: string[] = [];
    server.use(http.get(`${COMPANY_URL}/packs`, ({ request }) => {
      urls.push(request.url);
      return HttpResponse.json({ data: [{ id: "pack-1", object: "pack" }], has_more: false, next_cursor: null });
    }));

    const page = await testClient().packs.list(COMPANY);

    expect((await page.toArray()).map((pack) => (pack as { id: string }).id)).toEqual(["pack-1"]);
    expect(urls).toEqual([`${COMPANY_URL}/packs`]);
  });
});
