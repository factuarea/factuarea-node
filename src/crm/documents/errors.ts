import { ConnectionError, FactuareaError } from "../../core/errors.js";
import type { CrmDocumentWriteIntent } from "./intent.js";
import type { ApiResponse } from "../../core/http-client.js";

/** A timeout, revoked/unconfirmed result or malformed success is not proof of the native committed outcome. */
export class CrmDocumentWriteUnconfirmedError extends ConnectionError {
  readonly intent: CrmDocumentWriteIntent;
  readonly originalError: unknown;

  constructor(intent: CrmDocumentWriteIntent, cause: unknown, response?: ApiResponse<unknown>) {
    const native = cause instanceof FactuareaError ? cause : undefined;
    super({
      message: "El resultado documental no está confirmado. Conserva la intención original y recupera su recibo explícitamente.",
      cause, status: native?.status ?? response?.status, requestId: native?.requestId ?? response?.requestId,
      code: native?.code, subcode: native?.subcode, type: native?.type
    });
    this.intent = intent;
    this.originalError = cause;
  }
}
