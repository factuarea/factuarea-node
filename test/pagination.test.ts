import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { BASE_URL, server, testClient, useMockServer } from "./helpers.js";
import { Page } from "../src/index.js";

useMockServer();

interface Row {
  id: string;
}

function pageHandler() {
  // Three-page dataset keyed by starting_after.
  return http.get(`${BASE_URL}/invoices`, ({ request }) => {
    const url = new URL(request.url);
    const after = url.searchParams.get("starting_after");
    if (after === null) {
      return HttpResponse.json({ data: [{ id: "1" }, { id: "2" }], has_more: true, next_cursor: "2" });
    }
    if (after === "2") {
      return HttpResponse.json({ data: [{ id: "3" }, { id: "4" }], has_more: true, next_cursor: "4" });
    }
    return HttpResponse.json({ data: [{ id: "5" }], has_more: false, next_cursor: null });
  });
}

describe("auto-pagination", () => {
  it("returns a Page with the first page of data", async () => {
    server.use(pageHandler());
    const page = (await testClient().invoices.list()) as Page<Row>;
    expect(page).toBeInstanceOf(Page);
    expect(page.data.map((r) => r.id)).toEqual(["1", "2"]);
    expect(page.hasMore).toBe(true);
    expect(page.nextCursor).toBe("2");
  });

  it("iterates every element across all pages with for await", async () => {
    server.use(pageHandler());
    const page = (await testClient().invoices.list()) as Page<Row>;
    const ids: string[] = [];
    for await (const row of page) {
      ids.push(row.id);
    }
    expect(ids).toEqual(["1", "2", "3", "4", "5"]);
  });

  it("walks pages manually via getNextPage", async () => {
    server.use(pageHandler());
    const first = (await testClient().invoices.list()) as Page<Row>;
    const second = await first.getNextPage();
    expect(second?.data.map((r) => r.id)).toEqual(["3", "4"]);
    const third = await second?.getNextPage();
    expect(third?.data.map((r) => r.id)).toEqual(["5"]);
    expect(third?.hasMore).toBe(false);
    const end = await third?.getNextPage();
    expect(end).toBeNull();
  });

  it("toArray() collects all elements", async () => {
    server.use(pageHandler());
    const page = (await testClient().invoices.list()) as Page<Row>;
    const all = await page.toArray();
    expect(all).toHaveLength(5);
  });

  it("forwards user filters and passes the cursor on subsequent pages", async () => {
    const seenCursors: Array<string | null> = [];
    let sawStatusFilter = false;
    server.use(
      http.get(`${BASE_URL}/invoices`, ({ request }) => {
        const url = new URL(request.url);
        seenCursors.push(url.searchParams.get("starting_after"));
        if (url.searchParams.get("status") === "paid") {
          sawStatusFilter = true;
        }
        const after = url.searchParams.get("starting_after");
        if (after === null) {
          return HttpResponse.json({ data: [{ id: "1" }], has_more: true, next_cursor: "1" });
        }
        return HttpResponse.json({ data: [{ id: "2" }], has_more: false, next_cursor: null });
      }),
    );

    const page = (await testClient().invoices.list({ status: "paid" })) as Page<Row>;
    await page.toArray();
    expect(sawStatusFilter).toBe(true);
    expect(seenCursors).toEqual([null, "1"]);
  });

  it("supports the `cursor` param style for purchase-invoice listings", async () => {
    const seen: Array<string | null> = [];
    server.use(
      http.get(`${BASE_URL}/purchase_invoices/overdue`, ({ request }) => {
        const url = new URL(request.url);
        seen.push(url.searchParams.get("cursor"));
        if (url.searchParams.get("cursor") === null) {
          return HttpResponse.json({ data: [{ id: "p1" }], has_more: true, next_cursor: "p1" });
        }
        return HttpResponse.json({ data: [{ id: "p2" }], has_more: false, next_cursor: null });
      }),
    );

    const page = (await testClient().purchaseInvoices.overdue()) as Page<Row>;
    const all = await page.toArray();
    expect(all.map((r) => r.id)).toEqual(["p1", "p2"]);
    expect(seen).toEqual([null, "p1"]);
  });
});
