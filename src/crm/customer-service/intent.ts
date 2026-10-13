import type { HttpClient } from "../../core/http-client.js";
import type { CustomerServiceWriteConfig, CustomerServiceWriteOperation, ServiceTicketId, ServiceTicketVersion } from "./types.js";
import { writeBody } from "./codecs.js";
import * as w from "./wire.js";

const token = Symbol("original ticket intent");
interface RetainedState { client: HttpClient; fingerprint: string; config: CustomerServiceWriteConfig; sent: boolean; }
const retained = new WeakMap<CustomerServiceWriteIntent, RetainedState>();

/** Original wire bytes, ticket CAS and caller key. Credentials and private headers are retained outside this public object. */
export class CustomerServiceWriteIntent {
  readonly method = "POST" as const;
  readonly path: string;
  readonly bodyJson: string;
  readonly idempotencyKey: string;
  readonly expectedVersion: ServiceTicketVersion;
  readonly waitingReasonProvided: boolean;
  readonly waitingReason?: "waiting_customer" | null;
  readonly customerMessageId?: ServiceTicketId | null;

  constructor(seal: typeof token, readonly operation: CustomerServiceWriteOperation, readonly ticketId: ServiceTicketId,
    body: Record<string, unknown>, idempotencyKey: string) {
    if (seal !== token) throw new TypeError("Factuarea: ticket intent must come from its original transport.");
    const suffix = operation === "moveToStage" ? "move-to-stage" : operation === "attachDocument" ? "attachments" : "attachments/remove";
    this.path = `/crm/service-tickets/${ticketId}/${suffix}`;
    this.bodyJson = JSON.stringify(body);
    if (new TextEncoder().encode(this.bodyJson).byteLength > 262144) throw new TypeError("Factuarea: ticket mutation exceeds its native payload limit.");
    this.expectedVersion = w.expectedVersion(body.expected_version);
    this.idempotencyKey = w.key(idempotencyKey);
    this.waitingReasonProvided = Object.hasOwn(body, "waiting_reason");
    if (this.waitingReasonProvided) this.waitingReason = body.waiting_reason as "waiting_customer" | null;
    if (Object.hasOwn(body, "customer_message_id")) this.customerMessageId = body.customer_message_id as ServiceTicketId | null;
    Object.freeze(this);
  }
}

export async function createIntent(client: HttpClient, operation: CustomerServiceWriteOperation, ticketId: ServiceTicketId,
  body: unknown, config: CustomerServiceWriteConfig): Promise<CustomerServiceWriteIntent> {
  const id = w.id(ticketId).toLowerCase() as ServiceTicketId;
  const wire = writeBody(operation, body);
  w.record(config, ["idempotencyKey"], ["headers", "timeout", "signal", "maxRetries"]);
  const key = w.key(config.idempotencyKey);
  if (config.timeout !== undefined) w.integer(config.timeout);
  if (config.signal !== undefined && !(config.signal instanceof AbortSignal)) throw new TypeError("Factuarea: signal must be an AbortSignal.");
  const headers = config.headers === undefined ? undefined : Object.freeze({ ...config.headers });
  if (headers !== undefined) {
    for (const [name, value] of Object.entries(headers)) {
      if (typeof value !== "string" || ["idempotency-key", "content-type", "content-length"].includes(name.toLowerCase())) throw new TypeError("Factuarea: ticket JSON/key headers are managed by the native transport.");
    }
    new Headers(headers);
  }
  const originalConfig = Object.freeze({ idempotencyKey: key, headers, timeout: config.timeout, signal: config.signal });
  const intent = new CustomerServiceWriteIntent(token, operation, id, wire, key);
  retained.set(intent, { client, fingerprint: await client.requestContextFingerprint(headers), config: originalConfig, sent: false });
  return intent;
}

export function retainedIntent(intent: CustomerServiceWriteIntent, client: HttpClient, recovery = false): RetainedState {
  const state = retained.get(intent);
  if (!state || state.client !== client || (recovery && !state.sent)) throw new TypeError("Factuarea: recovery requires the original sent ticket intent and client.");
  return state;
}
