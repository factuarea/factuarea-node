// Server-only recipe. Importing this module never dispatches a request.
import { createHash } from "node:crypto";
import {
  ConflictError,
  CrmUnconfirmedWriteError,
  Factuarea,
  type CrmCreateLeadRequest,
  type CrmUpdateLeadRequest,
  type Lead,
} from "../src/index.js";
import type {
  CrmCreateOpportunityRequest,
  CrmUpdateOpportunityRequest,
  CrmCreateCrmActivityRequest,
  CrmUpdateCrmActivityRequest,
  CrmActivity,
  Opportunity,
} from "../src/crm/source/index.js";

const uuid7 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const sha256 = (raw: string) =>
  createHash("sha256").update(raw, "utf8").digest("hex");
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function freeze<T>(value: T): T {
  if (value !== null && typeof value === "object") {
    for (const nested of Object.values(value)) freeze(nested);
    Object.freeze(value);
  }
  return value;
}

export interface RetainedCreation {
  readonly companyId: string;
  readonly idempotencyKey: string;
  /** The host retained these exact UTF-8 JSON bytes before the original POST. */
  readonly rawBody: string;
}

export interface HumanReview {
  readonly companyId: string;
  readonly operation:
    | "lead_create"
    | "lead_update"
    | "opportunity_create"
    | "opportunity_update"
    | "activity_create"
    | "activity_update";
  readonly idempotencyKey: string;
  readonly originalBodySha256: string;
  readonly expectedVersion: number | null;
  readonly body:
    | CrmCreateLeadRequest
    | CrmUpdateLeadRequest
    | CrmCreateOpportunityRequest
    | CrmUpdateOpportunityRequest
    | CrmCreateCrmActivityRequest
    | CrmUpdateCrmActivityRequest;
}

/** The host must obtain a real human decision for this exact frozen review. */
export type ConfirmHumanReview = (
  review: Readonly<HumanReview>
) => Promise<boolean>;

type LeadCreateOutcome =
  | { state: "confirmed"; id: string; originalBody?: string }
  | { state: "unknown"; retained: RetainedCreation; nativeState: string };

type LeadUpdateOutcome =
  | { state: "confirmed"; id: string }
  | {
      state: "needs_human_review";
      current: Lead;
      retainedBody: CrmUpdateLeadRequest;
      retainedKey: string;
      requestId?: string | null;
    }
  | { state: "unknown"; retained: RetainedCreation; expectedVersion: number };

type NativeUpdateOutcome<TCurrent, TBody> =
  | { state: "confirmed"; id: string }
  | {
      state: "needs_human_review";
      current: TCurrent;
      retainedBody: TBody;
      retainedKey: string;
      requestId?: string | null;
    }
  | { state: "unknown"; retained: RetainedCreation; expectedVersion: number };

export interface JourneyInput {
  lead: CrmCreateLeadRequest;
  opportunity: Omit<CrmCreateOpportunityRequest, "lead_id">;
  activity: Omit<CrmCreateCrmActivityRequest, "target">;
  keys: { lead: string; opportunity: string; activity: string };
}

/** Read a piped secret explicitly; no argv, echo, disk file or implicit execution. */
export async function readSandboxKeyFromStdin(): Promise<string> {
  if (process.stdin.isTTY)
    throw new Error(
      "Pipe a secret through stdin; this recipe does not echo an interactive key."
    );
  let key = "";
  for await (const chunk of process.stdin) {
    key += Buffer.isBuffer(chunk) ? chunk.toString("utf8") : String(chunk);
    if (Buffer.byteLength(key, "utf8") > 4096)
      throw new Error("Secret input is too large.");
  }
  key = key.replace(/\r?\n$/, "");
  if (!key.startsWith("fact_test_") || /[\r\n]/.test(key))
    throw new Error("A single sandbox API key is required.");
  return key;
}

/**
 * One isolated Company session. Pass a piped key as secret, or use the server's
 * FACTUAREA_API_KEY. The native API validates the requested profile and C7.
 */
export function openSandboxJourney(secret = process.env.FACTUAREA_API_KEY) {
  const companyId = process.env.FACTUAREA_SANDBOX_COMPANY_ID;
  const baseUrl = process.env.FACTUAREA_BASE_URL;
  if (!secret?.startsWith("fact_test_"))
    throw new Error("This recipe requires a sandbox API key.");
  if (!companyId || !uuid7.test(companyId))
    throw new Error("Set an authorized sandbox Company UUIDv7.");
  if (!baseUrl)
    throw new Error(
      "Set the explicit native API v1 base URL for this sandbox."
    );
  const url = new URL(baseUrl);
  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    (url.protocol !== "https:" &&
      !(
        url.protocol === "http:" &&
        ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
      ))
  ) {
    throw new Error(
      "Use an HTTPS native API URL, or a local HTTP sandbox, without embedded credentials."
    );
  }
  const controller = new AbortController();
  const headers = Object.freeze({ "X-Active-Profile": companyId });
  const client = new Factuarea({
    apiKey: secret,
    baseUrl,
    maxRetries: 0,
    defaultHeaders: headers,
  });
  if (client.environment !== "test")
    throw new Error("The SDK must identify this credential as test.");
  let retired = false;
  // Only an in-memory example dispatch latch; it creates no owner receipt or effect reservation.
  const dispatchedKeys = new Set<string>();
  const config = { signal: controller.signal, headers, maxRetries: 0 };

  function currentSession(): void {
    if (retired || controller.signal.aborted)
      throw new Error("This Company/credential session has retired.");
  }

  function keyIsNative(key: string): void {
    if (!/^[\x20-\x7e]{1,255}$/.test(key))
      throw new Error(
        "Retain a native 1–255-character printable ASCII key verbatim."
      );
  }

  function dispatchOnce(key: string): void {
    currentSession();
    keyIsNative(key);
    if (dispatchedKeys.has(key))
      throw new Error(
        "This session already dispatched this key; use Original GET or stop UNKNOWN."
      );
    dispatchedKeys.add(key);
  }

  function checkRetained(retained: RetainedCreation): void {
    currentSession();
    if (retained.companyId !== companyId)
      throw new Error("A retained intention belongs to a different Company.");
    keyIsNative(retained.idempotencyKey);
  }

  async function readCreationOriginal(
    entity: "lead" | "opportunity" | "activity",
    retained: RetainedCreation
  ) {
    checkRetained(retained);
    const params = { original_body_sha256: sha256(retained.rawBody) };
    const originalConfig = {
      ...config,
      idempotencyKey: retained.idempotencyKey,
    };
    const original =
      entity === "lead"
        ? await client.crm.source.leads.getCreateOriginal(
            params,
            originalConfig
          )
        : entity === "opportunity"
        ? await client.crm.source.opportunities.getCreateOriginal(
            params,
            originalConfig
          )
        : await client.crm.source.activities.getCreateOriginal(
            params,
            originalConfig
          );
    currentSession();
    if (original.data.original_body_sha256 !== params.original_body_sha256) {
      throw new Error(
        "The native Original receipt does not match the retained body."
      );
    }
    // Keep the immutable response bytes and opaque current C7. No current lookup proves an effect.
    return original;
  }

  async function recoverCreation(
    entity: "lead" | "opportunity" | "activity",
    retained: RetainedCreation
  ): Promise<LeadCreateOutcome> {
    const original = await readCreationOriginal(entity, retained);
    if (
      original.data.state !== "confirmed" ||
      original.data.original_response === null
    ) {
      return { state: "unknown", retained, nativeState: original.data.state };
    }
    const raw = original.data.original_response.body;
    let receipt: unknown;
    try {
      receipt = JSON.parse(raw);
    } catch {
      return { state: "unknown", retained, nativeState: "unreadable_original" };
    }
    // Inspect only the native identity; keep Money/decimals and the rest of the receipt in raw bytes.
    if (!record(receipt) || !record(receipt.data)) {
      return { state: "unknown", retained, nativeState: "unreadable_original" };
    }
    const id =
      entity === "activity" ? receipt.data.activity_id : receipt.data.id;
    if (
      typeof id !== "string" ||
      !uuid7.test(id) ||
      (entity === "activity" && receipt.data.state !== "confirmed")
    )
      return { state: "unknown", retained, nativeState: "unreadable_original" };
    return { state: "confirmed", id, originalBody: raw };
  }

  const recoverLeadCreation = (retained: RetainedCreation) =>
    recoverCreation("lead", retained);

  async function reviewBody<T extends HumanReview["body"]>(
    operation: HumanReview["operation"],
    input: T,
    originalKey: string,
    expectedVersion: number | null,
    confirm: ConfirmHumanReview
  ) {
    currentSession();
    keyIsNative(originalKey);
    const body = freeze(structuredClone(input));
    const rawBody = JSON.stringify(body);
    const retained = Object.freeze({
      companyId,
      idempotencyKey: originalKey,
      rawBody,
    });
    const review = Object.freeze({
      companyId,
      operation,
      idempotencyKey: originalKey,
      originalBodySha256: sha256(rawBody),
      expectedVersion,
      body,
    });
    if ((await confirm(review)) !== true)
      throw new Error("A human must approve this exact frozen intention.");
    currentSession();
    return { body, retained };
  }

  async function createOpportunityOnce(
    input: CrmCreateOpportunityRequest,
    originalKey: string,
    confirm: ConfirmHumanReview
  ): Promise<LeadCreateOutcome> {
    const { body, retained } = await reviewBody(
      "opportunity_create",
      input,
      originalKey,
      null,
      confirm
    );
    dispatchOnce(originalKey);
    try {
      const result = await client.crm.source.opportunities.create(body, {
        ...config,
        idempotencyKey: originalKey,
        humanConfirmed: true,
      });
      currentSession();
      if (!uuid7.test(result.data.id))
        return {
          state: "unknown",
          retained,
          nativeState: "unreadable_identity",
        };
      return { state: "confirmed", id: result.data.id };
    } catch (error) {
      if (
        !(error instanceof CrmUnconfirmedWriteError) ||
        error.idempotencyKey !== originalKey
      )
        throw error;
      return recoverCreation("opportunity", retained);
    }
  }

  async function createActivityOnce(
    input: CrmCreateCrmActivityRequest,
    originalKey: string,
    confirm: ConfirmHumanReview
  ): Promise<LeadCreateOutcome> {
    const { body, retained } = await reviewBody(
      "activity_create",
      input,
      originalKey,
      null,
      confirm
    );
    dispatchOnce(originalKey);
    try {
      const result = await client.crm.source.activities.create(body, {
        ...config,
        idempotencyKey: originalKey,
        humanConfirmed: true,
      });
      currentSession();
      if (
        result.data.state !== "confirmed" ||
        !uuid7.test(result.data.activity_id)
      )
        return {
          state: "unknown",
          retained,
          nativeState: "unreadable_identity",
        };
      return { state: "confirmed", id: result.data.activity_id };
    } catch (error) {
      if (
        !(error instanceof CrmUnconfirmedWriteError) ||
        error.idempotencyKey !== originalKey
      )
        throw error;
      return recoverCreation("activity", retained);
    }
  }

  async function createLeadOnce(
    input: CrmCreateLeadRequest,
    originalKey: string,
    confirm: ConfirmHumanReview
  ): Promise<LeadCreateOutcome> {
    currentSession();
    keyIsNative(originalKey);
    const body = freeze(structuredClone(input));
    const rawBody = JSON.stringify(body);
    const retained = Object.freeze({
      companyId,
      idempotencyKey: originalKey,
      rawBody,
    });
    const review = Object.freeze({
      companyId,
      operation: "lead_create" as const,
      idempotencyKey: originalKey,
      originalBodySha256: sha256(rawBody),
      expectedVersion: null,
      body,
    });
    if ((await confirm(review)) !== true)
      throw new Error("A human must approve the retained Lead creation.");
    dispatchOnce(originalKey);
    try {
      const created = await client.crm.leads.create(body, {
        ...config,
        idempotencyKey: originalKey,
      });
      currentSession();
      if (!uuid7.test(created.data.id))
        return {
          state: "unknown",
          retained,
          nativeState: "unreadable_identity",
        };
      return { state: "confirmed", id: created.data.id };
    } catch (error) {
      if (!(error instanceof CrmUnconfirmedWriteError)) throw error;
      if (error.idempotencyKey !== originalKey) throw error;
      // A lost POST response is followed by one real GET, never another POST or a new key.
      return recoverLeadCreation(retained);
    }
  }

  async function currentLead(id: string): Promise<Lead> {
    currentSession();
    if (!uuid7.test(id)) throw new Error("Use the native Lead identity.");
    const result = await client.crm.leads.show(id, config);
    currentSession();
    if (
      result.data.id !== id ||
      !Number.isSafeInteger(result.data.version) ||
      result.data.version < 1
    ) {
      throw new Error(
        "The native current Lead identity/version is unreadable."
      );
    }
    return result.data;
  }

  async function updateLeadOnce(
    id: string,
    changes: Omit<CrmUpdateLeadRequest, "expected_version">,
    originalKey: string,
    confirm: ConfirmHumanReview
  ): Promise<LeadUpdateOutcome> {
    keyIsNative(originalKey);
    const before = await currentLead(id);
    const body = freeze({
      ...structuredClone(changes),
      expected_version: before.version,
    });
    const rawBody = JSON.stringify(body);
    const review = Object.freeze({
      companyId,
      operation: "lead_update" as const,
      idempotencyKey: originalKey,
      originalBodySha256: sha256(rawBody),
      expectedVersion: before.version,
      body,
    });
    if ((await confirm(review)) !== true)
      throw new Error(
        "A human must approve this exact current Lead version and change."
      );
    const current = await currentLead(id);
    if (current.version !== before.version) {
      return {
        state: "needs_human_review",
        current,
        retainedBody: body,
        retainedKey: originalKey,
      };
    }
    dispatchOnce(originalKey);
    try {
      const updated = await client.crm.leads.update(id, body, {
        ...config,
        idempotencyKey: originalKey,
      });
      currentSession();
      if (updated.data.id !== id)
        throw new Error("The native update identity is unreadable.");
      return { state: "confirmed", id };
    } catch (error) {
      if (error instanceof ConflictError) {
        // Retain the reviewed CAS and draft. The next decision belongs to the human, not a PATCH loop.
        return {
          state: "needs_human_review",
          current: await currentLead(id),
          retainedBody: body,
          retainedKey: originalKey,
          requestId: error.requestId,
        };
      }
      if (!(error instanceof CrmUnconfirmedWriteError)) throw error;
      // No Lead-update Original exists in the mounted SDK. Lead-create Original would be the wrong effect.
      return {
        state: "unknown",
        expectedVersion: before.version,
        retained: Object.freeze({
          companyId,
          idempotencyKey: originalKey,
          rawBody,
        }),
      };
    }
  }

  async function currentOpportunity(id: string): Promise<Opportunity> {
    currentSession();
    const result = await client.crm.source.opportunities.getCurrent(id, config);
    currentSession();
    if (
      result.data.id !== id ||
      !Number.isSafeInteger(result.data.version) ||
      result.data.version < 1
    )
      throw new Error("The native Opportunity identity/version is unreadable.");
    return result.data;
  }

  async function currentActivity(id: string): Promise<CrmActivity> {
    currentSession();
    const result = await client.crm.source.activities.getCurrent(id, config);
    currentSession();
    const current = result.data.activity;
    if (
      current === null ||
      current.id !== id ||
      !Number.isSafeInteger(current.version) ||
      current.version < 1
    )
      throw new Error(
        "The current Activity is unavailable or its identity/version is unreadable."
      );
    return current;
  }

  async function updateOpportunityOnce(
    id: string,
    changes: CrmUpdateOpportunityRequest["changes"],
    originalKey: string,
    confirm: ConfirmHumanReview
  ): Promise<NativeUpdateOutcome<Opportunity, CrmUpdateOpportunityRequest>> {
    const before = await currentOpportunity(id);
    const { body, retained } = await reviewBody(
      "opportunity_update",
      { expected_version: before.version, changes },
      originalKey,
      before.version,
      confirm
    );
    const current = await currentOpportunity(id);
    if (current.version !== before.version)
      return {
        state: "needs_human_review",
        current,
        retainedBody: body,
        retainedKey: originalKey,
      };
    dispatchOnce(originalKey);
    try {
      const result = await client.crm.source.opportunities.update(id, body, {
        ...config,
        idempotencyKey: originalKey,
        humanConfirmed: true,
      });
      currentSession();
      if (result.data.id !== id)
        throw new Error("The native update identity is unreadable.");
      return { state: "confirmed", id };
    } catch (error) {
      if (error instanceof ConflictError)
        return {
          state: "needs_human_review",
          current: await currentOpportunity(id),
          retainedBody: body,
          retainedKey: originalKey,
          requestId: error.requestId,
        };
      if (!(error instanceof CrmUnconfirmedWriteError)) throw error;
      return { state: "unknown", retained, expectedVersion: before.version };
    }
  }

  async function updateActivityOnce(
    id: string,
    changes: CrmUpdateCrmActivityRequest["changes"],
    originalKey: string,
    confirm: ConfirmHumanReview
  ): Promise<NativeUpdateOutcome<CrmActivity, CrmUpdateCrmActivityRequest>> {
    const before = await currentActivity(id);
    const { body, retained } = await reviewBody(
      "activity_update",
      { expected_version: before.version, changes },
      originalKey,
      before.version,
      confirm
    );
    const current = await currentActivity(id);
    if (current.version !== before.version)
      return {
        state: "needs_human_review",
        current,
        retainedBody: body,
        retainedKey: originalKey,
      };
    dispatchOnce(originalKey);
    try {
      const result = await client.crm.source.activities.update(id, body, {
        ...config,
        idempotencyKey: originalKey,
        humanConfirmed: true,
      });
      currentSession();
      if (result.data.state !== "confirmed" || result.data.activity_id !== id)
        throw new Error("The native update identity is unreadable.");
      return { state: "confirmed", id };
    } catch (error) {
      if (error instanceof ConflictError)
        return {
          state: "needs_human_review",
          current: await currentActivity(id),
          retainedBody: body,
          retainedKey: originalKey,
          requestId: error.requestId,
        };
      if (!(error instanceof CrmUnconfirmedWriteError)) throw error;
      return { state: "unknown", retained, expectedVersion: before.version };
    }
  }

  async function runJourney(input: JourneyInput, confirm: ConfirmHumanReview) {
    const lead = await createLeadOnce(input.lead, input.keys.lead, confirm);
    if (lead.state !== "confirmed")
      return {
        state: "unknown" as const,
        step: "lead" as const,
        outcome: lead,
      };
    const opportunity = await createOpportunityOnce(
      { ...input.opportunity, lead_id: lead.id },
      input.keys.opportunity,
      confirm
    );
    if (opportunity.state !== "confirmed")
      return {
        state: "unknown" as const,
        step: "opportunity" as const,
        outcome: opportunity,
      };
    const activity = await createActivityOnce(
      {
        ...input.activity,
        target: { type: "opportunity", id: opportunity.id },
      },
      input.keys.activity,
      confirm
    );
    if (activity.state !== "confirmed")
      return {
        state: "unknown" as const,
        step: "activity" as const,
        outcome: activity,
      };
    return { state: "confirmed" as const, lead, opportunity, activity };
  }

  function retire(
    reason: "company_changed" | "credential_changed" | "host_teardown"
  ): void {
    retired = true;
    dispatchedKeys.clear();
    controller.abort(reason);
  }

  return {
    companyId,
    runJourney,
    createLeadOnce,
    createOpportunityOnce,
    createActivityOnce,
    recoverCreation,
    recoverLeadCreation,
    updateLeadOnce,
    updateOpportunityOnce,
    updateActivityOnce,
    currentLead,
    currentOpportunity,
    currentActivity,
    readCreationOriginal,
    retire,
  };
}
