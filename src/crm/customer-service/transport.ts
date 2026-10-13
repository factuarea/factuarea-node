import { ConnectionError, FactuareaError } from "../../core/errors.js";
import { RequestContextChangedError, type ApiResponse, type HttpClient } from "../../core/http-client.js";
import type { RequestConfig } from "../../core/resource.js";
import { CustomerServiceWriteUnconfirmedError } from "./errors.js";
import { createIntent, retainedIntent, type CustomerServiceWriteIntent } from "./intent.js";
import type { CustomerServiceRecoveryConfig, CustomerServiceResponse, CustomerServiceWriteConfig, CustomerServiceWriteOperation, ServiceTicketId, ServiceTicketReceipt } from "./types.js";
import * as c from "./codecs.js";
import * as w from "./wire.js";

/** Existing native authentication/error decoder/timeouts; each mutation and explicit recovery attempts once. */
export class CustomerServiceTransport {
  constructor(readonly client: HttpClient) { }

  async read<T>(path: string, query: Record<string, unknown>, decode: (value: unknown) => T, config?: RequestConfig): Promise<CustomerServiceResponse<T>> {
    const response = await this.client.request<unknown>({ ...config, method: "GET", path, query });
    if (response.status !== 200) throw new TypeError("Factuarea: unexpected native ticket read status.");
    return { ...response, data: decode(c.envelope(response.data)) };
  }

  async write(operation: CustomerServiceWriteOperation, ticketId: ServiceTicketId, body: unknown,
    config: CustomerServiceWriteConfig): Promise<CustomerServiceResponse<ServiceTicketReceipt>> {
    return this.execute(await createIntent(this.client, operation, ticketId, body, config));
  }

  async recover(intent: CustomerServiceWriteIntent, config?: CustomerServiceRecoveryConfig): Promise<CustomerServiceResponse<ServiceTicketReceipt>> {
    retainedIntent(intent, this.client, true);
    if (config !== undefined) {
      w.record(config, [], ["timeout", "signal"]);
      if (config.timeout !== undefined) w.integer(config.timeout);
      if (config.signal !== undefined && !(config.signal instanceof AbortSignal)) throw new TypeError("Factuarea: signal must be an AbortSignal.");
    }
    return this.execute(intent, config);
  }

  private async execute(intent: CustomerServiceWriteIntent, recovery?: CustomerServiceRecoveryConfig): Promise<CustomerServiceResponse<ServiceTicketReceipt>> {
    const state = retainedIntent(intent, this.client);
    let response: ApiResponse<unknown> | undefined;
    try {
      state.sent = true;
      response = await this.client.request<unknown>({
        ...state.config,
        signal: recovery === undefined ? state.config.signal : recovery.signal,
        timeout: recovery?.timeout ?? state.config.timeout,
        method: intent.method, path: intent.path, body: JSON.parse(intent.bodyJson),
        contextFingerprint: state.fingerprint, idempotencyKey: intent.idempotencyKey, maxRetries: 0
      });
      if (response.status !== 200) throw new TypeError("Factuarea: missing native confirmed ticket receipt status.");
      const result = c.receipt(c.envelope(response.data));
      const versions = intent.operation === "moveToStage" ? [intent.expectedVersion, intent.expectedVersion + 1] : [intent.expectedVersion + 1];
      if (!w.sameId(result.id, intent.ticketId) || !versions.includes(result.version)) throw new TypeError("Factuarea: ticket receipt differs from its original identity/operation CAS.");
      return { ...response, data: result };
    } catch (error) {
      if (error instanceof RequestContextChangedError) throw new RequestContextChangedError("Factuarea: ticket recovery requires its original request context.", { cause: error });
      if (error instanceof FactuareaError && !(error instanceof ConnectionError)) {
        const ambiguous = (error.status ?? 0) >= 500 || [403, 404].includes(error.status ?? 0) || /unconfirmed|revoked/.test(error.subcode ?? "");
        if (!ambiguous) throw error;
      }
      throw new CustomerServiceWriteUnconfirmedError(intent, error, response);
    }
  }
}
