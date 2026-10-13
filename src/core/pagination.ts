import type { HttpClient, RequestOptions } from "./http-client.js";
import type { RequestConfig } from "./resource.js";

/** The cursor-paginated envelope every v1 listing returns. */
export interface PaginatedList<T> {
  data: T[];
  has_more: boolean;
  next_cursor: string | null;
}

/**
 * Which query parameter carries the forward cursor for a listing.
 *
 * Most v1 listings use `starting_after`; a few (overdue/pending purchase
 * invoices) use `cursor`. Both return `{ data, has_more, next_cursor }`.
 */
export type CursorParam = "starting_after" | "cursor";

/**
 * A single page of results plus helpers to walk the rest of the collection.
 *
 * `Page` is itself an async-iterable: `for await (const item of page)` yields
 * every element across all following pages transparently. For page-by-page
 * control, use `.data`, `.hasMore` and `.getNextPage()`.
 */
export class Page<T> implements AsyncIterable<T> {
  /** Items on this page. */
  readonly data: T[];
  /** Whether another page exists after this one. */
  readonly hasMore: boolean;
  /** Opaque cursor for the next page, or `null`. */
  readonly nextCursor: string | null;
  /** Request id of the response that produced this page. */
  readonly requestId: string | null;

  readonly #client: HttpClient;
  readonly #baseOptions: RequestOptions;
  readonly #cursorParam: CursorParam;
  readonly #responseDataPath: readonly string[];

  constructor(
    client: HttpClient,
    baseOptions: RequestOptions,
    cursorParam: CursorParam,
    payload: PaginatedList<T>,
    requestId: string | null,
    responseDataPath: readonly string[] = [],
  ) {
    this.#client = client;
    this.#baseOptions = baseOptions;
    this.#cursorParam = cursorParam;
    this.#responseDataPath = Object.freeze([...responseDataPath]);
    this.data = payload.data ?? [];
    this.hasMore = payload.has_more ?? false;
    this.nextCursor = payload.next_cursor ?? null;
    this.requestId = requestId;
  }

  /** Fetches the next page, or `null` if there are no more pages. */
  async getNextPage(): Promise<Page<T> | null> {
    if (!this.hasMore || this.nextCursor === null) {
      return null;
    }
    const options: RequestOptions = {
      ...this.#baseOptions,
      query: {
        ...this.#baseOptions.query,
        [this.#cursorParam]: this.nextCursor,
      },
    };
    const response = await this.#client.request<PaginatedList<T>>(options);
    return new Page<T>(this.#client, options, this.#cursorParam,
      pagePayload<T>(response.data, this.#responseDataPath), response.requestId, this.#responseDataPath);
  }

  /** Async iterator over every element across all pages. */
  async *[Symbol.asyncIterator](): AsyncIterator<T> {
    let current: Page<T> | null = this;
    while (current !== null) {
      for (const item of current.data) {
        yield item;
      }
      current = await current.getNextPage();
    }
  }

  /** Collects every element across all pages into a single array. */
  async toArray(): Promise<T[]> {
    const all: T[] = [];
    for await (const item of this) {
      all.push(item);
    }
    return all;
  }
}

/**
 * Fetches the first page of a listing and wraps it in an auto-paginating
 * `Page`. Used by resource list methods.
 */
export async function fetchPage<T>(
  client: HttpClient,
  path: string,
  query: Record<string, unknown> | undefined,
  cursorParam: CursorParam = "starting_after",
  config?: RequestConfig,
  responseDataPath: readonly string[] = [],
): Promise<Page<T>> {
  const options: RequestOptions = { method: "GET", path, query, ...config };
  const response = await client.request<PaginatedList<T>>(options);
  return new Page<T>(client, options, cursorParam,
    pagePayload<T>(response.data, responseDataPath), response.requestId, responseDataPath);
}

function pagePayload<T>(wire: unknown, dataPath: readonly string[]): PaginatedList<T> {
  // Preserve the established legacy path. Native envelopes are selected from
  // their actual response schema by the resource generator.
  if (dataPath.length === 0) return wire as PaginatedList<T>;
  let payload = wire;
  for (const key of dataPath) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload) ||
      !Object.hasOwn(payload, key)) throw new TypeError("Factuarea: invalid native cursor envelope.");
    payload = (payload as Record<string, unknown>)[key];
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new TypeError("Factuarea: invalid native cursor page.");
  }
  const page = payload as Record<string, unknown>;
  if (!Array.isArray(page.data) || typeof page.has_more !== "boolean" ||
    !(page.next_cursor === null || typeof page.next_cursor === "string" && page.next_cursor.length > 0) ||
    page.has_more !== (page.next_cursor !== null)) {
    throw new TypeError("Factuarea: invalid native cursor page.");
  }
  return page as unknown as PaginatedList<T>;
}
