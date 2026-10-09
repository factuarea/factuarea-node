import { ConnectionError } from "../core/errors.js";
import type { ServiceLevelWriteOperation } from "./service-level-types.js";

/** A local transport failure or malformed success cannot establish a committed SLA write. */
export class ServiceLevelUnconfirmedError extends ConnectionError {
  readonly operation: ServiceLevelWriteOperation;
  readonly idempotencyKey: string;

  constructor(operation: ServiceLevelWriteOperation, idempotencyKey: string, cause: unknown) {
    super({
      message: "El resultado SLA no está confirmado. Conserva la clave y el contenido originales para recuperar el recibo explícitamente.",
      cause,
    });
    this.operation = operation;
    this.idempotencyKey = idempotencyKey;
  }
}
