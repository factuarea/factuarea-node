import type { ApiResponse, HttpClient } from "../../core/http-client.js";
import { ConnectionError, ServerError } from "../../core/errors.js";
import { CrmUnconfirmedWriteError } from "../../crm/errors.js";
import type { CrmRequestConfig } from "../../crm/resource.js";
import { assertCrmMailboxOriginalReceipt, decodeCrmMailboxWriteReceipt, mailboxWriterPath, validateCrmMailboxWriteIntent, validateCrmMailboxWriterPaths } from "./codec.js";
import type * as T from "./types.js";

export type CrmMailboxWriterNativeTransport = Pick<HttpClient, "request" | "requestOriginalJson">;
export type CrmMailboxWriterConfig = Omit<CrmRequestConfig, "idempotencyKey" | "maxRetries">;
export class CrmMailboxUnconfirmedWriteError extends CrmUnconfirmedWriteError {
  constructor(readonly originalIntent: T.CrmMailboxWriteIntent, cause: Error) {
    super(originalIntent.targetId === null ? "createMailboxConfigurationV1" : "updateMailboxConfigurationV1", originalIntent.originalKey, cause);
  }
}
function headers(config?: CrmMailboxWriterConfig): Record<string, string> | undefined {
  const result = Object.fromEntries(Object.entries(config?.headers ?? {}).filter(([name]) => !["idempotency-key", "content-type"].includes(name.toLowerCase())));
  return Object.keys(result).length === 0 ? undefined : result;
}
function beforeDispatch(config?: CrmMailboxWriterConfig): void {
  if (config?.signal?.aborted) throw new ConnectionError({ message: "Factuarea: request was cancelled before dispatch.", code: "request_aborted", cause: config.signal.reason });
}
function unreadable(response: ApiResponse<unknown>, cause: unknown): ConnectionError {
  return new ConnectionError({ message: "Factuarea: the native Mailbox original receipt could not be read.", code: "crm_mailbox_original_unreadable",
    requestId: response.requestId, rawResponse: response.data, cause });
}
/** Native configuration writer/recovery only. Public conversations:read original readers remain separate. */
export class CrmMailboxWritersResource {
  constructor(private readonly client: CrmMailboxWriterNativeTransport, private readonly paths: T.CrmMailboxWriterV1Paths) {
    if (typeof client?.request !== "function" || typeof client?.requestOriginalJson !== "function") throw new TypeError("Factuarea: the same configured native Mailbox HTTP transport is required.");
    validateCrmMailboxWriterPaths(paths);
  }
  async createMailboxConfiguration(intent: T.CrmMailboxCreateIntent, config?: CrmMailboxWriterConfig): Promise<T.CrmMailboxWriteEnvelope> {
    const original = validateCrmMailboxWriteIntent(intent);
    if (original.targetId !== null) throw new TypeError("Factuarea: mailbox creation requires an original create intention.");
    return this.write(original, mailboxWriterPath(this.paths.createMailboxConfiguration), config);
  }
  async updateMailboxConfiguration(intent: T.CrmMailboxUpdateIntent, config?: CrmMailboxWriterConfig): Promise<T.CrmMailboxWriteEnvelope> {
    const original = validateCrmMailboxWriteIntent(intent);
    if (original.targetId === null) throw new TypeError("Factuarea: mailbox update requires the original target.");
    return this.write(original, mailboxWriterPath(this.paths.updateMailboxConfiguration(original.targetId)), config);
  }
  /** Readonly native crm:write original recovery: exact opaque header plus a single original_wire query. */
  async getMailboxWriteOriginal(intent: T.CrmMailboxWriteIntent, config?: CrmMailboxWriterConfig): Promise<T.CrmMailboxWriteEnvelope> {
    const original = validateCrmMailboxWriteIntent(intent); beforeDispatch(config);
    const response = await this.client.request<unknown>({ ...config, method: "GET", path: mailboxWriterPath(this.paths.getMailboxWriteOriginal(original.targetId)),
      query: { original_wire: original.originalWire }, body: undefined, rawJsonBody: undefined, formData: undefined,
      idempotencyKey: original.originalKey, autoIdempotency: undefined, maxRetries: 0, headers: headers(config) });
    config?.onResponse?.(response);
    try { return this.receipt(response, original, 200); } catch (cause) { throw unreadable(response, cause); }
  }
  private async write(original: T.CrmMailboxWriteIntent, path: string, config?: CrmMailboxWriterConfig): Promise<T.CrmMailboxWriteEnvelope> {
    beforeDispatch(config); let response: ApiResponse<unknown>;
    try {
      response = await this.client.requestOriginalJson<unknown>({ ...config, method: original.targetId === null ? "POST" : "PUT", path,
        rawJsonBody: original.originalWire, body: undefined, formData: undefined, query: undefined, idempotencyKey: original.originalKey,
        autoIdempotency: undefined, maxRetries: 0, headers: headers(config) });
    } catch (cause) {
      if (cause instanceof ConnectionError || cause instanceof ServerError || (cause instanceof Error && cause.name === "AbortError")) throw new CrmMailboxUnconfirmedWriteError(original, cause);
      throw cause;
    }
    config?.onResponse?.(response);
    try { return this.receipt(response, original, original.targetId === null ? 201 : 200); }
    catch (cause) { throw new CrmMailboxUnconfirmedWriteError(original, unreadable(response, cause)); }
  }
  private receipt(response: ApiResponse<unknown>, original: T.CrmMailboxWriteIntent, status: number): T.CrmMailboxWriteEnvelope {
    if (response.status !== status) throw new TypeError("Factuarea: incompatible Mailbox original response status.");
    const result = decodeCrmMailboxWriteReceipt(response.data); assertCrmMailboxOriginalReceipt(result.data, original); return result;
  }
}
export function createCrmMailboxWritersResource(client: CrmMailboxWriterNativeTransport, paths: T.CrmMailboxWriterV1Paths): CrmMailboxWritersResource { return new CrmMailboxWritersResource(client, paths); }
export { decodeCrmMailboxWriteIntent, decodeCrmMailboxWriteReceipt } from "./codec.js";
export type * from "./types.js";
