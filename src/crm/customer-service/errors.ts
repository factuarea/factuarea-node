import { ConnectionError, FactuareaError } from "../../core/errors.js";
import type { ApiResponse } from "../../core/http-client.js";
import type { CustomerServiceWriteIntent } from "./intent.js";

export class CustomerServiceWriteUnconfirmedError extends ConnectionError {
  readonly intent: CustomerServiceWriteIntent;
  readonly originalError: unknown;

  constructor(intent: CustomerServiceWriteIntent, cause: unknown, response?: ApiResponse<unknown>) {
    const native = cause instanceof FactuareaError ? cause : undefined;
    super({
      message: "El resultado del ticket no está confirmado. Conserva la intención original y recupera su recibo explícitamente.",
      cause, status: native?.status ?? response?.status, requestId: native?.requestId ?? response?.requestId,
      code: native?.code, subcode: native?.subcode, type: native?.type
    });
    this.intent = intent;
    this.originalError = cause;
  }
}
