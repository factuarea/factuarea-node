import { ConnectionError } from "../../core/errors.js";
import type { ApiResponse, BinaryResponse } from "../../core/http-client.js";
import { CrmUnconfirmedWriteError } from "../errors.js";
import { CrmBaseResource, type CrmRequestConfig } from "../resource.js";
import { CrmEntityExportIntent, requireEntityExportId } from "./intent.js";
import {
  CRM_ENTITY_EXPORT_TYPES,
  type CrmEntityExportEnvelope,
  type CrmEntityExportIdentity,
  type CrmEntityExportJob,
  type CrmEntityExportSelection,
  type CrmEntityExportType,
} from "./types.js";

/** Same canonical auth/transport; read options cannot change the original id or add a body/query. */
export type CrmEntityExportReadConfig = Omit<
  CrmRequestConfig,
  "idempotencyKey"
>;
/** Explicit human acknowledgement of this immutable selection; POST retries are always disabled. */
export type CrmEntityExportConfirmedConfig = Omit<
  CrmEntityExportReadConfig,
  "maxRetries"
> & { humanConfirmed: true };

const REQUEST_OPERATION = "public-api.v1.crm-entity-exports.request";
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function decodeJob(
  value: unknown,
  id: string,
  expectedType?: CrmEntityExportType
): CrmEntityExportEnvelope {
  if (
    !isRecord(value) ||
    Object.keys(value).some((key) => key !== "data") ||
    !isRecord(value.data)
  ) {
    throw new TypeError("Factuarea: incompatible native export Original.");
  }
  const job = value.data;
  requireEntityExportId(job.id);
  if (
    job.id !== id ||
    !CRM_ENTITY_EXPORT_TYPES.includes(job.entity_type as CrmEntityExportType) ||
    (expectedType !== undefined && job.entity_type !== expectedType) ||
    !["processing", "ready", "failed", "expired"].includes(String(job.status))
  ) {
    throw new TypeError(
      "Factuarea: native export Original identity or state is incompatible."
    );
  }
  const keys =
    job.status === "ready"
      ? ["id", "entity_type", "status", "filename", "size_bytes"]
      : ["id", "entity_type", "status"];
  if (Object.keys(job).some((key) => !keys.includes(key))) {
    throw new TypeError(
      "Factuarea: native export Original contains unsupported fields."
    );
  }
  if (
    job.status === "ready" &&
    (typeof job.filename !== "string" ||
      !job.filename ||
      job.filename.length > 255 ||
      /[\x00-\x1f\x7f/\\]/.test(job.filename) ||
      typeof job.size_bytes !== "number" ||
      !Number.isSafeInteger(job.size_bytes) ||
      job.size_bytes < 0)
  ) {
    throw new TypeError(
      "Factuarea: ready export Original has invalid file metadata."
    );
  }
  return Object.freeze({
    data: Object.freeze({ ...job }) as CrmEntityExportJob,
  });
}

/** Hand-written Source107 wrapper; current native scopes, C7 and masks decide every operation. */
export class CrmEntityExportsResource extends CrmBaseResource {
  /** Opaque ids only: never retain selection, credentials, receipt or binary in the resource. */
  readonly #attemptedIds = new Set<string>();

  prepare<T extends CrmEntityExportType>(
    selection: CrmEntityExportSelection<T> & { readonly entity_type: T },
    identity: CrmEntityExportIdentity
  ): CrmEntityExportIntent<T> {
    this.requireOriginalKey(identity);
    return CrmEntityExportIntent.prepare(selection, identity);
  }

  /** Dispatch once. On an unknown outcome use getOriginal(intent), retaining the same identity. */
  async request<T extends CrmEntityExportType>(
    intent: CrmEntityExportIntent<T>,
    config: CrmEntityExportConfirmedConfig
  ): Promise<CrmEntityExportEnvelope<T>> {
    this.requireHumanConfirmation(config);
    if (!(intent instanceof CrmEntityExportIntent)) {
      throw new TypeError(
        "Factuarea: prepare an immutable native export intent before dispatch."
      );
    }
    if (this.#attemptedIds.has(intent.id)) {
      throw new TypeError(
        "Factuarea: this export id was already dispatched; read the same Original with getOriginal."
      );
    }
    if (config.signal?.aborted) {
      throw new ConnectionError({
        message: "Factuarea: request was cancelled before dispatch.",
        code: "request_aborted",
      });
    }
    this.#attemptedIds.add(intent.id);
    let response: ApiResponse<unknown> | undefined;
    const envelope = await this.sendCrm<unknown>(
      "POST",
      "/crm/entity-exports",
      intent.request,
      {
        signal: config.signal,
        timeout: config.timeout,
        headers: config.headers,
        idempotencyKey: intent.idempotencyKey,
        onResponse: (received) => {
          response = received;
        },
      },
      true,
      REQUEST_OPERATION
    );
    let decoded: CrmEntityExportEnvelope;
    try {
      decoded = decodeJob(envelope, intent.id, intent.entityType);
      if (
        response?.status !== (decoded.data.status === "processing" ? 202 : 200)
      ) {
        throw new TypeError(
          "Factuarea: native export acceptance has an incompatible HTTP status."
        );
      }
    } catch {
      throw new CrmUnconfirmedWriteError(
        REQUEST_OPERATION,
        intent.idempotencyKey,
        new ConnectionError({
          message:
            "Factuarea: export response could not establish the original state; read getOriginal.",
          code: "crm_receipt_unreadable",
          requestId: response?.requestId,
        })
      );
    }
    if (response) config.onResponse?.(response);
    return decoded as CrmEntityExportEnvelope<T>;
  }

  /** Current native Original query only: no enqueue, cached receipt, body or query parameters. */
  async getOriginal<T extends CrmEntityExportType>(
    original: CrmEntityExportIntent<T>,
    config?: CrmEntityExportReadConfig
  ): Promise<CrmEntityExportEnvelope<T>>;
  async getOriginal(
    id: string,
    config?: CrmEntityExportReadConfig
  ): Promise<CrmEntityExportEnvelope>;
  async getOriginal(
    original: string | CrmEntityExportIntent,
    config?: CrmEntityExportReadConfig
  ): Promise<CrmEntityExportEnvelope> {
    const id = this.originalId(original);
    const response = await this.client.request<unknown>({
      method: "GET",
      path: this.buildPath("/crm/entity-exports/{id}", { id }),
      signal: config?.signal,
      timeout: config?.timeout,
      maxRetries: config?.maxRetries,
      headers: config?.headers,
    });
    let decoded: CrmEntityExportEnvelope;
    try {
      if (response.status !== 200)
        throw new TypeError("Factuarea: incompatible Original HTTP status.");
      decoded = decodeJob(
        response.data,
        id,
        typeof original === "string" ? undefined : original.entityType
      );
    } catch {
      throw new ConnectionError({
        message: "Factuarea: native export Original could not be read.",
        code: "crm_receipt_unreadable",
        requestId: response.requestId,
      });
    }
    config?.onResponse?.(response);
    return decoded;
  }

  /** Alias for the same Original read; this method never polls automatically. */
  async status<T extends CrmEntityExportType>(
    original: CrmEntityExportIntent<T>,
    config?: CrmEntityExportReadConfig
  ): Promise<CrmEntityExportEnvelope<T>>;
  async status(
    id: string,
    config?: CrmEntityExportReadConfig
  ): Promise<CrmEntityExportEnvelope>;
  async status(
    original: string | CrmEntityExportIntent,
    config?: CrmEntityExportReadConfig
  ): Promise<CrmEntityExportEnvelope> {
    return typeof original === "string"
      ? this.getOriginal(original, config)
      : this.getOriginal(original, config);
  }

  /** Reread current ready Original, then return exact native CSV bytes via canonical BinaryResponse. */
  async download(
    original: string | CrmEntityExportIntent,
    config?: CrmEntityExportReadConfig
  ): Promise<BinaryResponse> {
    const current =
      typeof original === "string"
        ? await this.getOriginal(original, config)
        : await this.getOriginal(original, config);
    if (current.data.status !== "ready") {
      throw new TypeError(
        "Factuarea: the current native export Original must be ready before downloading."
      );
    }
    const binary = await this.client.requestBinary({
      method: "GET",
      path: this.buildPath("/crm/entity-exports/{id}/download", {
        id: current.data.id,
      }),
      signal: config?.signal,
      timeout: config?.timeout,
      maxRetries: config?.maxRetries,
      headers: { ...config?.headers, Accept: "text/csv" },
    });
    if (
      binary.status !== 200 ||
      !/^text\/csv(?:\s*;\s*charset\s*=\s*utf-8)?$/i.test(
        binary.contentType ?? ""
      ) ||
      binary.body.byteLength !== current.data.size_bytes
    ) {
      throw new ConnectionError({
        message:
          "Factuarea: native export download does not match its current ready Original.",
        code: "crm_receipt_unreadable",
        requestId: binary.requestId,
      });
    }
    return binary;
  }

  private originalId(original: string | CrmEntityExportIntent): string {
    if (
      typeof original !== "string" &&
      !(original instanceof CrmEntityExportIntent)
    ) {
      throw new TypeError(
        "Factuarea: the original export id or prepared intent is required."
      );
    }
    const id = typeof original === "string" ? original : original.id;
    requireEntityExportId(id);
    return id;
  }
}
