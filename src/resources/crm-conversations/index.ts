import type { ApiResponse, HttpClient } from "../../core/http-client.js";
import { ConnectionError } from "../../core/errors.js";
import { CrmCursorPage } from "../../crm/pagination.js";
import type { CrmRequestConfig } from "../../crm/resource.js";
import { conversationId, conversationPaths, conversationQuery, decodeCrmConversationInbox, decodeCrmConversationThread } from "./codec.js";
import type * as T from "./types.js";

export type CrmConversationsNativeTransport = Pick<HttpClient, "request">;
export type CrmConversationsReadConfig = Omit<CrmRequestConfig, "idempotencyKey">;
function clone<V>(value: V): V { return structuredClone(value); }
function unreadable(response: Pick<ApiResponse<unknown>, "data" | "requestId">, cause: unknown): ConnectionError {
  return new ConnectionError({ message: "Factuarea: the native Conversation projection could not be read.", code: "crm_conversation_projection_unreadable", requestId: response.requestId, rawResponse: response.data, cause });
}

/** Only traversal facts are retained; current metadata is returned separately on every native page. */
class NativeConversationCursorPage<Row extends { id: string }, Data extends { next_cursor: string | null; limit: number }> extends CrmCursorPage<Row> {
  readonly payload: Data;
  readonly meta: T.CrmConversationReadMeta;
  private readonly original: T.CrmConversationEnvelope<Data>;
  private readonly rows: Row[];
  private visited: Set<string>;
  private identities: Set<string>;
  private readonly nextNative: (cursor: string) => Promise<NativeConversationCursorPage<Row, Data>>;

  constructor(envelope: T.CrmConversationEnvelope<Data>, rows: Row[], requestId: string | null, requestedCursor: string | null,
    next: (cursor: string) => Promise<NativeConversationCursorPage<Row, Data>>) {
    super(clone(rows), envelope.data.next_cursor !== null, envelope.data.next_cursor, requestId, next);
    this.payload = clone(envelope.data); this.meta = clone(envelope.meta); this.original = clone(envelope); this.rows = clone(rows);
    this.identities = new Set(rows.map((row) => row.id.toLowerCase()));
    this.visited = new Set(requestedCursor === null ? [] : [requestedCursor]); this.nextNative = next;
  }

  override async getNextPage(): Promise<NativeConversationCursorPage<Row, Data> | null> {
    const cursor = this.original.data.next_cursor;
    if (cursor === null) return null;
    if (this.visited.has(cursor)) throw unreadable({ data: this.original, requestId: this.requestId }, new TypeError("Factuarea: repeated original Conversation cursor."));
    const next = await this.nextNative(cursor);
    const visited = new Set([...this.visited, cursor]);
    if ((next.original.data.next_cursor !== null && visited.has(next.original.data.next_cursor))
      || next.original.data.limit !== this.original.data.limit || next.rows.some((row) => this.identities.has(row.id.toLowerCase()))) {
      throw unreadable({ data: next.original, requestId: next.requestId }, new TypeError("Factuarea: incompatible native Conversation traversal."));
    }
    next.visited = visited; next.identities = new Set([...this.identities, ...next.rows.map((row) => row.id.toLowerCase())]);
    return next;
  }

  override async *[Symbol.asyncIterator](): AsyncIterator<Row> {
    let page: NativeConversationCursorPage<Row, Data> | null = this;
    while (page !== null) { for (const row of page.rows) yield clone(row); page = await page.getNextPage(); }
  }
}
export class CrmConversationInboxPage extends NativeConversationCursorPage<T.CrmConversationHead, T.CrmConversationInboxData> {
  override async getNextPage(): Promise<CrmConversationInboxPage | null> { return super.getNextPage() as Promise<CrmConversationInboxPage | null>; }
}
export class CrmConversationThreadPage extends NativeConversationCursorPage<T.CrmConversationMessage, T.CrmConversationThreadData> {
  override async getNextPage(): Promise<CrmConversationThreadPage | null> { return super.getNextPage() as Promise<CrmConversationThreadPage | null>; }
}
function configSnapshot(config?: CrmConversationsReadConfig): CrmConversationsReadConfig | undefined {
  return config === undefined ? undefined : { ...config, headers: config.headers === undefined ? undefined : { ...config.headers } };
}
function readHeaders(config?: CrmConversationsReadConfig): Record<string, string> | undefined {
  const headers = Object.fromEntries(Object.entries(config?.headers ?? {}).filter(([name]) => !["idempotency-key", "content-type"].includes(name.toLowerCase())));
  return Object.keys(headers).length === 0 ? undefined : headers;
}
/** Actual native list/get GETs. No send/retry, original-write recovery or attachment download carrier. */
export class CrmConversationsResource {
  private readonly paths: T.CrmConversationV1Paths;
  constructor(private readonly client: CrmConversationsNativeTransport, paths: T.CrmConversationV1Paths) {
    if (typeof client?.request !== "function") throw new TypeError("Factuarea: the configured native Conversation HTTP client is required.");
    this.paths = conversationPaths(paths);
  }

  async listConversations(parameters: T.CrmConversationListParameters = {}, config?: CrmConversationsReadConfig): Promise<CrmConversationInboxPage> {
    const query = conversationQuery(parameters, true); const originalConfig = configSnapshot(config);
    const response = await this.get(this.paths.listConversations, query, originalConfig);
    const envelope = this.project(response, () => {
      const result = decodeCrmConversationInbox(response.data); this.assertPage(result.data, query);
      return result;
    });
    return new CrmConversationInboxPage(envelope, envelope.data.items, response.requestId, (query.cursor ?? null) as string | null,
      (cursor) => this.listConversations({ ...query, cursor } as T.CrmConversationListParameters, originalConfig));
  }

  async getConversation(conversation: string, parameters: T.CrmConversationPageParameters = {}, config?: CrmConversationsReadConfig): Promise<CrmConversationThreadPage> {
    conversationId(conversation); const query = conversationQuery(parameters, false); const originalConfig = configSnapshot(config);
    const path = this.paths.getConversation.replace("{conversation}", encodeURIComponent(conversation));
    const response = await this.get(path, query, originalConfig);
    const envelope = this.project(response, () => {
      const result = decodeCrmConversationThread(response.data); this.assertPage(result.data, query);
      if (result.data.conversation.id.toLowerCase() !== conversation.toLowerCase()) throw new TypeError("Factuarea: incompatible original Conversation identity.");
      return result;
    });
    return new CrmConversationThreadPage(envelope, envelope.data.messages, response.requestId, (query.cursor ?? null) as string | null,
      (cursor) => this.getConversation(conversation, { ...query, cursor } as T.CrmConversationPageParameters, originalConfig));
  }

  private assertPage(data: { next_cursor: string | null; limit: number }, query: Record<string, unknown>): void {
    if (data.limit !== (query.limit ?? 20) || (data.next_cursor !== null && data.next_cursor === query.cursor)) throw new TypeError("Factuarea: incompatible original Conversation page.");
  }
  private async get(path: string, query: Record<string, unknown>, config?: CrmConversationsReadConfig): Promise<ApiResponse<unknown>> {
    const response = await this.client.request<unknown>({ ...config, method: "GET", path, query, body: undefined, rawJsonBody: undefined, formData: undefined,
      idempotencyKey: undefined, autoIdempotency: false, headers: readHeaders(config) });
    config?.onResponse?.(response); return response;
  }
  private project<V>(response: ApiResponse<unknown>, decode: () => V): V {
    try { if (response.status !== 200) throw new TypeError("Factuarea: incompatible native Conversation response status."); return decode(); }
    catch (cause) { throw unreadable(response, cause); }
  }
}
export function createCrmConversationsResource(client: CrmConversationsNativeTransport, paths: T.CrmConversationV1Paths): CrmConversationsResource { return new CrmConversationsResource(client, paths); }
export { decodeCrmConversationInbox, decodeCrmConversationThread, encodeCrmConversationFilters } from "./codec.js";
export type * from "./types.js";
