import { ConnectionError, FactuareaError } from "../core/errors.js";
import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpMethod } from "../core/http-client.js";
import { ServiceLevelUnconfirmedError } from "./service-level-errors.js";
import type {
  ConfigureServiceSlaRequest,
  PauseServiceSlaRequest,
  ResumeServiceSlaRequest,
  ServiceCalendarList,
  ServiceLevelPageQuery,
  ServiceLevelResponse,
  ServiceLevelWriteConfig,
  ServiceLevelWriteOperation,
  ServiceLevelWriteResult,
  ServiceSlaHistory,
  ServiceSlaStatus,
  UpdateServiceCalendarRequest,
} from "./service-level-types.js";

const UUID_V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Native ServiceLevel routes; kept outside the regenerated resource directory. */
export class ServiceLevelResource extends BaseResource {
  status(ticket: string, config?: RequestConfig): Promise<ServiceLevelResponse<ServiceSlaStatus>> {
    return this._get(this.ticketPath(ticket), undefined, config);
  }

  history(ticket: string, query?: ServiceLevelPageQuery, config?: RequestConfig): Promise<ServiceLevelResponse<ServiceSlaHistory>> {
    return this._get(`${this.ticketPath(ticket)}/history`, query ? { ...query } : undefined, config);
  }

  calendars(query?: ServiceLevelPageQuery, config?: RequestConfig): Promise<ServiceLevelResponse<ServiceCalendarList>> {
    return this._get("/crm/service-calendars", query ? { ...query } : undefined, config);
  }

  configure(ticket: string, body: ConfigureServiceSlaRequest, config: ServiceLevelWriteConfig): Promise<ServiceLevelResponse<ServiceLevelWriteResult>> {
    return this.write("configure", "PUT", this.ticketPath(ticket), body, config);
  }

  pause(ticket: string, body: PauseServiceSlaRequest, config: ServiceLevelWriteConfig): Promise<ServiceLevelResponse<ServiceLevelWriteResult>> {
    return this.write("pause", "POST", `${this.ticketPath(ticket)}/pause`, body, config);
  }

  resume(ticket: string, body: ResumeServiceSlaRequest, config: ServiceLevelWriteConfig): Promise<ServiceLevelResponse<ServiceLevelWriteResult>> {
    return this.write("resume", "POST", `${this.ticketPath(ticket)}/resume`, body, config);
  }

  updateCalendar(body: UpdateServiceCalendarRequest, config: ServiceLevelWriteConfig): Promise<ServiceLevelResponse<ServiceLevelWriteResult>> {
    return this.write("updateCalendar", "PUT", "/crm/service-calendars", body, config);
  }

  private ticketPath(ticket: string): string {
    return this.buildPath("/crm/service-tickets/{ticket}/sla", { ticket });
  }

  private async write(
    operation: ServiceLevelWriteOperation,
    method: HttpMethod,
    path: string,
    body: ConfigureServiceSlaRequest | PauseServiceSlaRequest | ResumeServiceSlaRequest | UpdateServiceCalendarRequest,
    config: ServiceLevelWriteConfig,
  ): Promise<ServiceLevelResponse<ServiceLevelWriteResult>> {
    if (typeof config?.idempotencyKey !== "string" || config.idempotencyKey.length < 1
      || config.idempotencyKey.length > 255 || /[^ -~]/.test(config.idempotencyKey)) {
      throw new TypeError("Factuarea: SLA writes require the original ASCII idempotencyKey (1–255 characters).");
    }
    try {
      const response = await this.client.request<unknown>({
        ...config,
        method,
        path,
        body,
        idempotencyKey: config.idempotencyKey,
        maxRetries: 0,
      });
      if (response.status !== 200 || !isWriteReceipt(response.data)) {
        throw new ServiceLevelUnconfirmedError(operation, config.idempotencyKey, new TypeError("Factuarea: missing native SLA write receipt."));
      }
      const originalId = "id" in body ? body.id : body.cycle_id;
      if (originalId !== null && response.data.data.id.toLowerCase() !== originalId.toLowerCase()) {
        throw new ServiceLevelUnconfirmedError(operation, config.idempotencyKey, new TypeError("Factuarea: SLA receipt changed the original identity."));
      }
      return response.data;
    } catch (error) {
      if (error instanceof ServiceLevelUnconfirmedError) {
        throw error;
      }
      // Native 409 (CAS/unconfirmed receipt), 500 (producer unavailable), 422,
      // 403 and 429 keep their original SDK class, code, subcode and fields.
      if (error instanceof FactuareaError && !(error instanceof ConnectionError)) {
        throw error;
      }
      throw new ServiceLevelUnconfirmedError(operation, config.idempotencyKey, error);
    }
  }
}

function isWriteReceipt(value: unknown): value is ServiceLevelResponse<ServiceLevelWriteResult> {
  if (typeof value !== "object" || value === null || !("data" in value)) {
    return false;
  }
  const data = value.data;
  return typeof data === "object" && data !== null && "id" in data && "version" in data
    && typeof data.id === "string" && data.id.length === 36 && UUID_V7.test(data.id)
    && typeof data.version === "number" && Number.isSafeInteger(data.version) && data.version > 0;
}
