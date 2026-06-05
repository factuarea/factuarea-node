import type { HttpClient, RequestOptions } from "./http-client.js";

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

  constructor(
    client: HttpClient,
    baseOptions: RequestOptions,
    cursorParam: CursorParam,
    payload: PaginatedList<T>,
    requestId: string | null,
  ) {
    this.#client = client;
    this.#baseOptions = baseOptions;
    this.#cursorParam = cursorParam;
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
    return new Page<T>(this.#client, options, this.#cursorParam, response.data, response.requestId);
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
): Promise<Page<T>> {
  const options: RequestOptions = { method: "GET", path, query };
  const response = await client.request<PaginatedList<T>>(options);
  return new Page<T>(client, options, cursorParam, response.data, response.requestId);
}
