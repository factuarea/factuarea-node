import { createHash } from "node:crypto";
import { nativeUuid, type CrmOriginalOperation } from "./types.js";
const paths: Record<CrmOriginalOperation, string> = {
  leadCreate: "/crm/leads/create/original",
  opportunityCreate: "/crm/opportunity/create/original",
  opportunityStage: "/crm/opportunity/{opportunity}/stage/original",
  activityCreate: "/crm/crmactivity/create/original",
};
/** Retain the exact first HTTP body, including whitespace, decimal strings, nulls and omissions. */
export class CrmOriginalIntent {
  readonly originalBodySha256: string;
  readonly path: string;
  private constructor(readonly operation: CrmOriginalOperation, readonly idempotencyKey: string, readonly firstBody: string, opportunity?: string) {
    if (!Object.hasOwn(paths, operation)) throw new TypeError("Unsupported CRM original operation.");
    if (!/^[\x20-\x7e]{1,255}$/.test(idempotencyKey) || idempotencyKey.trim() !== idempotencyKey) throw new TypeError("Idempotency-Key requires 1–255 printable ASCII bytes without boundary whitespace, which HTTP normalizes.");
    if (typeof firstBody !== "string" || Buffer.from(firstBody, "utf8").toString("utf8") !== firstBody) throw new TypeError("Retain the first valid UTF-8 wire body.");
    try { const value: unknown = JSON.parse(firstBody); if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(); } catch { throw new TypeError("Retain the first JSON object wire body."); }
    if ((operation === "opportunityStage") !== (opportunity !== undefined)) throw new TypeError("Only stage recovery requires an opportunity UUID.");
    this.path = opportunity === undefined ? paths[operation] : paths[operation].replace("{opportunity}", nativeUuid(opportunity));
    this.originalBodySha256 = createHash("sha256").update(firstBody, "utf8").digest("hex");
    Object.freeze(this);
  }
  static capture(operation: CrmOriginalOperation, idempotencyKey: string, firstBody: string, opportunity?: string): CrmOriginalIntent {
    return new CrmOriginalIntent(operation, idempotencyKey, firstBody, opportunity);
  }
}
