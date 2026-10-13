import { createHash } from "node:crypto";
import { ConnectionError, ConflictError } from "../../../core/errors.js";
import { CrmUnconfirmedWriteError } from "../../errors.js";
import type {
  CrmRestoreCommercialDocumentData,
  CrmRestoreCommercialDocumentResponses,
} from "../generated/types.gen.js";
import type { CrmSourceWriteConfig } from "../resource.js";
import type { CrmSourceDocumentsResource } from "../resources.gen.js";

type RestoreBody = NonNullable<CrmRestoreCommercialDocumentData["body"]>;
type RestoreDocument = NonNullable<CrmRestoreCommercialDocumentData["path"]>["document"];
type RestoreReceipt = CrmRestoreCommercialDocumentResponses[200];

export type RetainedRestoreState =
  | "prepared"
  | "dispatched"
  | "unknown"
  | "received"
  | "conflict"
  | "rejected"
  | "retired";

/** Private draft only: the committed Source143 namespace does not export this module. */
export class RetainedDocumentRestore {
  private currentState: RetainedRestoreState = "prepared";
  private intention:
    | {
        document: RestoreDocument;
        body: Readonly<RestoreBody>;
        key: string;
        rawBody: string;
        bodySha256: string;
      }
    | undefined;
  private readonly controller = new AbortController();
  private readonly retireSession = () => this.retire();

  constructor(
    private readonly writer: CrmSourceDocumentsResource,
    document: RestoreDocument,
    reviewedBody: RestoreBody,
    retainedKey: string,
    private readonly sessionSignal: AbortSignal,
  ) {
    if (!Number.isSafeInteger(reviewedBody.expected_version) || reviewedBody.expected_version < 1)
      throw new TypeError("Factuarea: retain the exact reviewed native document version.");
    if (reviewedBody.confirmed !== true)
      throw new TypeError("Factuarea: this native Restore intention requires human review.");
    if (!/^[ -~]{1,255}$/.test(retainedKey))
      throw new TypeError("Factuarea: retain the literal native Idempotency-Key.");
    if (Object.keys(reviewedBody).some((field) => !["expected_version", "confirmed"].includes(field)))
      throw new TypeError("Factuarea: Restore accepts only its native closed fields.");

    // These are the exact bytes of the object passed to the existing native writer.
    // They remain in memory; no header, Company, credential or native permission is created here.
    const body = Object.freeze({
      expected_version: reviewedBody.expected_version,
      confirmed: true as const,
    });
    const rawBody = JSON.stringify(body);
    this.intention = {
      document,
      body,
      key: retainedKey,
      rawBody,
      bodySha256: createHash("sha256").update(rawBody, "utf8").digest("hex"),
    };
    sessionSignal.addEventListener("abort", this.retireSession, { once: true });
    if (sessionSignal.aborted) this.retire();
  }

  get state(): RetainedRestoreState {
    return this.currentState;
  }

  /** Local intention metadata only. A body hash is not a server-issued proof or grant. */
  get retained(): Readonly<{
    document: RestoreDocument;
    expectedVersion: number;
    key: string;
    rawBody: string;
    bodySha256: string;
  }> {
    const intention = this.requireIntention();
    return Object.freeze({
      document: intention.document,
      expectedVersion: intention.body.expected_version,
      key: intention.key,
      rawBody: intention.rawBody,
      bodySha256: intention.bodySha256,
    });
  }

  /** One explicit human dispatch through the same native writer; never a retry mechanism. */
  async dispatch(
    config: Omit<CrmSourceWriteConfig, "idempotencyKey" | "signal">,
  ): Promise<RestoreReceipt> {
    const intention = this.requireIntention();
    if (this.currentState !== "prepared")
      throw new TypeError("Factuarea: this retained Restore has already been dispatched.");
    if (config?.humanConfirmed !== true)
      throw new TypeError("Factuarea: explicitly confirm this reviewed Restore intention.");
    if (Object.entries(config.headers ?? {}).some(([name, value]) =>
      name.toLowerCase() === "idempotency-key" && value !== intention.key))
      throw new TypeError("Factuarea: a header cannot replace the retained Restore key.");
    this.currentState = "dispatched";
    try {
      const receipt = await this.writer.restore(intention.document, intention.body, {
        ...config,
        idempotencyKey: intention.key,
        signal: this.controller.signal,
        humanConfirmed: true,
        maxRetries: 0,
      });
      this.requireIntention();
      this.currentState = "received";
      return receipt;
    } catch (error) {
      if (this.currentState !== "retired")
        this.currentState = error instanceof CrmUnconfirmedWriteError
          ? "unknown"
          : error instanceof ConflictError
            ? "conflict"
            : "rejected";
      throw error;
    }
  }

  /** The host retires this intention on Company/credential change or teardown. */
  retire(): void {
    this.currentState = "retired";
    this.intention = undefined;
    this.sessionSignal.removeEventListener("abort", this.retireSession);
    this.controller.abort();
  }

  private requireIntention() {
    if (!this.intention || this.sessionSignal.aborted || this.controller.signal.aborted)
      throw new ConnectionError({
        message: "Factuarea: this Restore intention belongs to a retired session.",
        code: "request_aborted",
      });
    return this.intention;
  }
}
