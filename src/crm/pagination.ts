/** Native page helpers preserve owner-specific envelopes and opaque cursors. */
export interface CrmNumberMeta {
  total: number;
  current_page: number;
  per_page?: number;
  last_page?: number;
}

export class CrmCursorPage<T> implements AsyncIterable<T> {
  constructor(
    readonly data: T[],
    readonly hasMore: boolean,
    readonly nextCursor: string | null,
    readonly requestId: string | null,
    private readonly next: (cursor: string) => Promise<CrmCursorPage<T>>,
  ) {}

  async getNextPage(): Promise<CrmCursorPage<T> | null> {
    return this.hasMore && this.nextCursor !== null ? this.next(this.nextCursor) : null;
  }

  async *[Symbol.asyncIterator](): AsyncIterator<T> {
    const visited = new Set<string>();
    let page: CrmCursorPage<T> | null = this;
    while (page !== null) {
      for (const item of page.data) yield item;
      if (page.hasMore && page.nextCursor !== null) {
        if (visited.has(page.nextCursor)) throw new TypeError("Factuarea: repeated CRM cursor.");
        visited.add(page.nextCursor);
      }
      page = await page.getNextPage();
    }
  }

  async toArray(): Promise<T[]> {
    const items: T[] = [];
    for await (const item of this) items.push(item);
    return items;
  }
}

export class CrmNumberPage<T> implements AsyncIterable<T> {
  readonly hasMore: boolean;

  constructor(
    readonly data: T[],
    readonly meta: CrmNumberMeta,
    readonly requestId: string | null,
    private readonly next: (page: number) => Promise<CrmNumberPage<T>>,
  ) {
    // Duplicates/options use the owner's fixed PAGE_SIZE=25; list supplies metadata.
    this.hasMore = meta.last_page !== undefined
      ? meta.current_page < meta.last_page
      : meta.current_page * (meta.per_page ?? 25) < meta.total;
  }

  async getNextPage(): Promise<CrmNumberPage<T> | null> {
    return this.hasMore ? this.next(this.meta.current_page + 1) : null;
  }

  async *[Symbol.asyncIterator](): AsyncIterator<T> {
    let page: CrmNumberPage<T> | null = this;
    while (page !== null) {
      for (const item of page.data) yield item;
      const next: CrmNumberPage<T> | null = await page.getNextPage();
      if (next !== null && next.meta.current_page <= page.meta.current_page) {
        throw new TypeError("Factuarea: repeated CRM page.");
      }
      page = next;
    }
  }

  async toArray(): Promise<T[]> {
    const items: T[] = [];
    for await (const item of this) items.push(item);
    return items;
  }
}
