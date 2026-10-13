import type { HttpClient, HttpMethod } from "../../core/http-client.js";
import type { CrmDocumentWriteConfig, CrmDocumentWriteOperation } from "./types.js";
import { writeBody } from "./codecs.js";
import * as w from "./wire.js";

const token = Symbol("original document intent");
interface RetainedState { client: HttpClient; fingerprint: string; config: CrmDocumentWriteConfig; sent: boolean }
const retained = new WeakMap<CrmDocumentWriteIntent, RetainedState>();

/** Immutable original wire/CAS/key. Authentication and private headers are never properties of this object. */
export class CrmDocumentWriteIntent {
  readonly method: HttpMethod;
  readonly path: string;
  readonly bodyJson: string;
  readonly idempotencyKey: string;
  readonly expectedVersion?: number;
  readonly documentType?: string;
  readonly documentId?: string;
  readonly isPrimary?: boolean;

  constructor(seal: typeof token, readonly operation: CrmDocumentWriteOperation, body: Record<string, unknown>,
    idempotencyKey: string, readonly targetId?: string, readonly opportunityId?: string) {
    if (seal !== token) throw new TypeError("Factuarea: document intent must come from its original transport.");
    this.method = operation === "unlink" ? "DELETE" : "POST";
    this.path = operation === "upload" ? "/crm/documents"
      : operation === "replaceVersion" ? `/crm/documents/${targetId}/versions`
        : operation === "share" ? `/crm/documents/${targetId}/shares`
          : operation === "revokeShare" ? `/crm/documents/${targetId}/shares/revoke`
            : operation === "archive" ? `/crm/documents/${targetId}/archive`
              : operation === "createQuote" ? `/crm/opportunitydocuments/${opportunityId}/quotes`
                : operation === "link" ? `/crm/opportunitydocuments/${opportunityId}/documents`
                  : `/crm/opportunitydocuments/${opportunityId}/documents/${targetId}`;
    this.bodyJson = JSON.stringify(body);
    if (new TextEncoder().encode(this.bodyJson).byteLength > 262144) throw new TypeError("Factuarea: document mutation exceeds its native payload limit.");
    this.idempotencyKey = w.key(idempotencyKey);
    this.expectedVersion = typeof body.expected_version === "number" ? body.expected_version : undefined;
    this.documentType = operation === "createQuote" ? "quote" : typeof body.document_type === "string" ? body.document_type : undefined;
    this.documentId = typeof body.document_id === "string" ? body.document_id : undefined;
    this.isPrimary = typeof body.is_primary === "boolean" ? body.is_primary : undefined;
    Object.freeze(this);
  }
}

export function libraryOperation(operation: CrmDocumentWriteOperation): boolean {
  return ["upload", "replaceVersion", "share", "revokeShare", "archive"].includes(operation);
}

/** Internal factory; request body validation and context resolution happen before any mutation. */
export async function createIntent(client: HttpClient, operation: CrmDocumentWriteOperation, body: unknown,
  config: CrmDocumentWriteConfig, targetId?: string, opportunityId?: string): Promise<CrmDocumentWriteIntent> {
  w.record(config, ["idempotencyKey"], ["headers", "timeout", "signal", "maxRetries"]);
  const key = w.key(config.idempotencyKey);
  if ((libraryOperation(operation) !== (opportunityId === undefined))
    || (["replaceVersion", "share", "revokeShare", "archive", "unlink"].includes(operation) !== (targetId !== undefined))) {
    throw new TypeError("Factuarea: document operation requires its original owner identities.");
  }
  if (config.timeout !== undefined) w.integer(config.timeout);
  if (config.signal !== undefined && !(config.signal instanceof AbortSignal)) throw new TypeError("Factuarea: signal must be an AbortSignal.");
  const headers = config.headers === undefined ? undefined : Object.freeze({ ...config.headers });
  if (headers !== undefined) {
    for (const [name, value] of Object.entries(headers)) {
      if (typeof value !== "string" || ["idempotency-key", "content-type", "content-length"].includes(name.toLowerCase())) throw new TypeError("Factuarea: document JSON/key headers are managed by the native transport.");
    }
    new Headers(headers);
  }
  const originalConfig = Object.freeze({ idempotencyKey: key, headers, timeout: config.timeout, signal: config.signal });
  const intent = new CrmDocumentWriteIntent(token, operation, writeBody(operation, body), key,
    targetId === undefined ? undefined : w.id(targetId).toLowerCase(), opportunityId === undefined ? undefined : w.id(opportunityId).toLowerCase());
  retained.set(intent, { client, fingerprint: await client.requestContextFingerprint(headers), config: originalConfig, sent: false });
  return intent;
}

export function retainedIntent(intent: CrmDocumentWriteIntent, client: HttpClient, recovery = false): RetainedState {
  const state = retained.get(intent);
  if (!state || state.client !== client || (recovery && !state.sent)) throw new TypeError("Factuarea: recovery requires the original sent intent and client.");
  return state;
}
