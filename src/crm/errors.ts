import { ConnectionError, FactuareaError } from "../core/errors.js";

/** The server may have committed the original effect; reconcile before any new intention. */
export class CrmUnconfirmedWriteError extends ConnectionError {
  readonly state = "unconfirmed" as const;

  constructor(
    readonly operationId: string,
    readonly idempotencyKey: string,
    cause: Error,
  ) {
    super({ message: "Factuarea: CRM write outcome is unconfirmed; reconcile the original effect before retrying.",
      code: "crm_write_unconfirmed",
      status: cause instanceof FactuareaError ? cause.status : undefined,
      requestId: cause instanceof FactuareaError ? cause.requestId : undefined, cause });
  }
}
