import { createHash } from "node:crypto";
import { ConnectionError } from "../core/errors.js";
import type {
  CrmSourceOriginalRequestConfig,
  CrmSourceWriteConfig,
} from "../crm/source/resource.js";

export type RetainedNativeEffectState =
  | "prepared"
  | "dispatched"
  | "unknown"
  | "received"
  | "retired";

export type NativeEffectDispatchConfig = Omit<
  CrmSourceWriteConfig,
  "idempotencyKey" | "signal" | "maxRetries"
>;

export type NativeEffectOriginalConfig = Omit<
  CrmSourceOriginalRequestConfig,
  "idempotencyKey" | "signal"
>;

interface NativeIntention<Body extends object, Receipt, Original> {
  body: Readonly<Body>;
  key: string;
  rawBody: string;
  bodySha256: string;
  dispatch: (
    body: Readonly<Body>,
    config: CrmSourceWriteConfig
  ) => Promise<Receipt>;
  readOriginal: (
    body: Readonly<Body>,
    bodySha256: string,
    config: CrmSourceOriginalRequestConfig
  ) => Promise<Original>;
}

function freezeJson<T>(value: T): T {
  if (value !== null && typeof value === "object") {
    for (const child of Object.values(value)) freezeJson(child);
    Object.freeze(value);
  }
  return value;
}

/**
 * An in-memory intention bound by generated native methods to their exact target.
 * This is neither a receipt ledger nor a native authorization decision.
 */
export class RetainedNativeEffect<Body extends object, Receipt, Original> {
  private currentState: RetainedNativeEffectState = "prepared";
  private intention: NativeIntention<Body, Receipt, Original> | undefined;
  private readonly controller = new AbortController();
  private readonly retireSession = () => this.retire();

  constructor(
    reviewedBody: Body,
    retainedKey: string,
    private readonly sessionSignal: AbortSignal,
    dispatch: NativeIntention<Body, Receipt, Original>["dispatch"],
    readOriginal: NativeIntention<Body, Receipt, Original>["readOriginal"]
  ) {
    if (typeof retainedKey !== "string" || retainedKey.length === 0)
      throw new TypeError(
        "Factuarea: retain the literal native intention key."
      );
    if (
      reviewedBody === null ||
      typeof reviewedBody !== "object" ||
      Array.isArray(reviewedBody)
    )
      throw new TypeError("Factuarea: retain the reviewed native JSON object.");
    const rawBody = JSON.stringify(reviewedBody);
    if (rawBody === undefined)
      throw new TypeError("Factuarea: the reviewed intention is not JSON.");
    const snapshot = JSON.parse(rawBody) as Body;
    if (
      snapshot === null ||
      typeof snapshot !== "object" ||
      Array.isArray(snapshot)
    )
      throw new TypeError(
        "Factuarea: the reviewed intention must remain a JSON object."
      );
    const body = freezeJson(snapshot);
    this.intention = {
      body,
      key: retainedKey,
      rawBody,
      bodySha256: createHash("sha256").update(rawBody, "utf8").digest("hex"),
      dispatch,
      readOriginal,
    };
    sessionSignal.addEventListener("abort", this.retireSession, { once: true });
    if (sessionSignal.aborted) this.retire();
  }

  get state(): RetainedNativeEffectState {
    return this.currentState;
  }

  /** Local bytes only; native generated Original methods determine any wire selector. */
  get retained(): Readonly<{
    body: Readonly<Body>;
    key: string;
    rawBody: string;
    bodySha256: string;
  }> {
    const intention = this.requireIntention();
    return Object.freeze({
      body: intention.body,
      key: intention.key,
      rawBody: intention.rawBody,
      bodySha256: intention.bodySha256,
    });
  }

  /** Exactly one explicitly acknowledged dispatch, including after an uncertain result. */
  async dispatch(config: NativeEffectDispatchConfig): Promise<Receipt> {
    const intention = this.requireIntention();
    if (this.currentState !== "prepared")
      throw new TypeError(
        "Factuarea: this retained intention has already been dispatched."
      );
    if (config?.humanConfirmed !== true)
      throw new TypeError(
        "Factuarea: explicitly confirm this reviewed native intention."
      );
    this.assertRetainedKey(config.headers, intention.key);
    this.currentState = "dispatched";
    try {
      const receipt = await intention.dispatch(intention.body, {
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
      if (this.state !== "retired")
        // A global rejection can follow partial work or post-effect revocation.
        // Only the owner's Original can establish a result; preserve native errors.
        this.currentState = "unknown";
      throw error;
    }
  }

  /** A separate current-authority native GET; no Current inference or write redispatch. */
  async readOriginal(config?: NativeEffectOriginalConfig): Promise<Original> {
    const intention = this.requireIntention();
    return this.queryOriginal(intention.readOriginal, config);
  }

  protected async queryOriginal<Result>(
    reader: (
      body: Readonly<Body>,
      bodySha256: string,
      config: CrmSourceOriginalRequestConfig
    ) => Promise<Result>,
    config?: NativeEffectOriginalConfig
  ): Promise<Result> {
    const intention = this.requireIntention();
    if (this.currentState === "prepared" || this.currentState === "dispatched")
      throw new TypeError(
        "Factuarea: await the original dispatch before reconciling its result."
      );
    this.assertRetainedKey(config?.headers, intention.key);
    const original = await reader(intention.body, intention.bodySha256, {
      ...config,
      idempotencyKey: intention.key,
      signal: this.controller.signal,
    });
    this.requireIntention();
    // Return the owner's native state unchanged; an Original read is not a new receipt.
    return original;
  }

  /** The host aborts its Company/credential session to discard old intentions. */
  retire(): void {
    this.currentState = "retired";
    this.intention = undefined;
    this.sessionSignal.removeEventListener("abort", this.retireSession);
    this.controller.abort();
  }

  private assertRetainedKey(
    headers: Record<string, string> | undefined,
    key: string
  ): void {
    if (
      Object.entries(headers ?? {}).some(
        ([name, value]) =>
          name.toLowerCase() === "idempotency-key" && value !== key
      )
    )
      throw new TypeError(
        "Factuarea: a header cannot replace the retained intention key."
      );
  }

  private requireIntention(): NativeIntention<Body, Receipt, Original> {
    if (
      !this.intention ||
      this.sessionSignal.aborted ||
      this.controller.signal.aborted
    )
      throw new ConnectionError({
        message:
          "Factuarea: this intention belongs to a retired Company/credential session.",
        code: "request_aborted",
      });
    return this.intention;
  }
}
