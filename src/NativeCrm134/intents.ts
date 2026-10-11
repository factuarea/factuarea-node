import type {
  ApplyServiceTicketBulkActionData,
  ApplyServiceTicketBulkActionResponses,
  CrmGetCommercialDocumentRestoreOriginalResponses,
  CrmRestoreCommercialDocumentData,
  CrmRestoreCommercialDocumentResponses,
  GetOriginalServiceTicketBulkItemData,
  GetOriginalServiceTicketBulkItemResponses,
  GetServiceStageOriginalResponses,
  UpdateServiceStageData,
  UpdateServiceStageResponses,
} from "./generated/types.gen.js";
import type { CrmSourceDocumentsResource } from "../crm/source/resources.gen.js";
import { ConnectionError } from "../core/errors.js";
import { CrmUnconfirmedWriteError } from "../crm/errors.js";
import type {
  NativeCrm134BulkResource,
  NativeCrm134DocumentsResource,
  NativeCrm134StagesResource,
} from "./resources.gen.js";
import { CRM_NATIVE134_OPERATIONS } from "./operations.gen.js";
import { CRM_NATIVE134_RESTORE_VALIDATION } from "./validation.gen.js";
import { matchesNativeJson } from "./schema.js";
import {
  RetainedNativeEffect,
  type NativeEffectOriginalConfig,
} from "./retained-effect.js";
import { stageRequestFingerprint } from "./stage-fingerprint.js";

export type StageUpdateBody = NonNullable<UpdateServiceStageData["body"]>;
export type BulkActionBody = NonNullable<
  ApplyServiceTicketBulkActionData["body"]
>;
export type DocumentRestoreBody = NonNullable<
  CrmRestoreCommercialDocumentData["body"]
>;
export type StageUpdateIntention = RetainedNativeEffect<
  StageUpdateBody,
  UpdateServiceStageResponses[200],
  GetServiceStageOriginalResponses[200]
>;
export type DocumentRestoreIntention = RetainedNativeEffect<
  DocumentRestoreBody,
  CrmRestoreCommercialDocumentResponses[200],
  CrmGetCommercialDocumentRestoreOriginalResponses[200]
>;
type BulkItemOriginal = GetOriginalServiceTicketBulkItemResponses[200];
type BulkOriginalQuery = NonNullable<
  GetOriginalServiceTicketBulkItemData["query"]
>;

function assertKey(key: string): void {
  if (
    typeof key !== "string" ||
    key.length < 1 ||
    key.length > 255 ||
    /[^\x20-\x7e]/u.test(key)
  )
    throw new TypeError(
      "Factuarea: retain the exact native printable ASCII key, 1..255 bytes."
    );
}

function assertBody(operationId: string, body: unknown): void {
  const operation = CRM_NATIVE134_OPERATIONS.find(
    (item) => item.operationId === operationId
  );
  if (
    !operation ||
    !("requestSchema" in operation) ||
    !matchesNativeJson(body, operation.requestSchema)
  )
    throw new TypeError(
      "Factuarea: review the closed actual native body before preparing an intention."
    );
}

export function prepareStageUpdate(
  stages: NativeCrm134StagesResource,
  stage: string,
  body: StageUpdateBody,
  retainedKey: string,
  sessionSignal: AbortSignal
): StageUpdateIntention {
  assertKey(retainedKey);
  assertBody("updateServiceStage", body);
  const operation = CRM_NATIVE134_OPERATIONS.find(
    (item) => item.operationId === "updateServiceStage"
  );
  const stageSchema = operation?.parameters.find(
    (parameter) => parameter.name === "stage"
  )?.schema;
  if (!stageSchema || !matchesNativeJson(stage, stageSchema))
    throw new TypeError("Factuarea: retain the reviewed native stage UUID.");
  return new RetainedNativeEffect(
    body,
    retainedKey,
    sessionSignal,
    (reviewed, config) => stages.update(stage, reviewed, config),
    (reviewed, _localHash, config) =>
      stages.getOriginal(
        stage,
        { request_fingerprint: stageRequestFingerprint(stage, reviewed) },
        config
      )
  );
}

function bulkOriginalQuery(
  body: Readonly<BulkActionBody>,
  expectedVersion: number
): BulkOriginalQuery {
  const base = { action: body.action, expected_version: expectedVersion };
  switch (body.action) {
    case "assign":
      return {
        ...base,
        assignee_id:
          body.assignee_id === null ? "null" : body.assignee_id.toLowerCase(),
      };
    case "priority":
      return { ...base, priority: body.priority };
    case "tags":
      return {
        ...base,
        tag_ids: JSON.stringify(body.tag_ids.map((id) => id.toLowerCase())),
      };
    case "status":
      return {
        ...base,
        pipeline_id: body.pipeline_id.toLowerCase(),
        stage_id: body.stage_id.toLowerCase(),
      };
  }
}

/** Each recovery result is a separate native item Original; no batch receipt is invented. */
export class RetainedBulkAction extends RetainedNativeEffect<
  BulkActionBody,
  ApplyServiceTicketBulkActionResponses[200],
  BulkItemOriginal[]
> {
  constructor(
    private readonly nativeBulk: NativeCrm134BulkResource,
    body: BulkActionBody,
    retainedKey: string,
    sessionSignal: AbortSignal
  ) {
    assertKey(retainedKey);
    assertBody("applyServiceTicketBulkAction", body);
    if (
      new Set(body.items.map((item) => item.id.toLowerCase())).size !==
      body.items.length
    )
      throw new TypeError(
        "Factuarea: each reviewed ticket belongs in the native selection once."
      );
    super(
      body,
      retainedKey,
      sessionSignal,
      (reviewed, config) => nativeBulk.apply(reviewed, config),
      async (reviewed, _localHash, config) => {
        const results: BulkItemOriginal[] = [];
        for (const item of reviewed.items)
          results.push(
            await nativeBulk.getItemOriginal(
              item.id.toLowerCase(),
              bulkOriginalQuery(reviewed, item.expected_version),
              config
            )
          );
        return results;
      }
    );
  }

  /** Explicitly recover one retained selection index after a global failure or unknown item. */
  getItemOriginal(
    index: number,
    config?: NativeEffectOriginalConfig
  ): Promise<BulkItemOriginal> {
    if (!Number.isSafeInteger(index) || index < 0)
      throw new TypeError("Factuarea: select a retained item index.");
    return this.queryOriginal((reviewed, _localHash, originalConfig) => {
      const item = reviewed.items[index];
      if (!item)
        throw new TypeError(
          "Factuarea: the item is outside this retained selection."
        );
      return this.nativeBulk.getItemOriginal(
        item.id.toLowerCase(),
        bulkOriginalQuery(reviewed, item.expected_version),
        originalConfig
      );
    }, config);
  }
}

export function prepareDocumentRestore(
  existingWriter: CrmSourceDocumentsResource,
  documents: NativeCrm134DocumentsResource,
  document: string,
  body: DocumentRestoreBody,
  retainedKey: string,
  sessionSignal: AbortSignal
): DocumentRestoreIntention {
  assertKey(retainedKey);
  const documentSchema = CRM_NATIVE134_RESTORE_VALIDATION.parameters.find(
    (parameter) => "name" in parameter && parameter.name === "document"
  );
  if (
    !documentSchema ||
    !("schema" in documentSchema) ||
    !matchesNativeJson(document, documentSchema.schema) ||
    !matchesNativeJson(body, CRM_NATIVE134_RESTORE_VALIDATION.requestSchema) ||
    body.expected_version >= Number.MAX_SAFE_INTEGER
  )
    throw new TypeError(
      "Factuarea: review the exact native document, confirmed restoration and safely representable Original revision."
    );
  return new RetainedNativeEffect(
    body,
    retainedKey,
    sessionSignal,
    async (reviewed, config) => {
      const receipt = await existingWriter.restore(document, reviewed, config);
      if (
        !CRM_NATIVE134_RESTORE_VALIDATION.successSchemas.some((schema) =>
          matchesNativeJson(receipt, schema)
        ) ||
        receipt.data.id.toLowerCase() !== document.toLowerCase() ||
        receipt.data.version !== reviewed.expected_version + 1
      )
        throw new CrmUnconfirmedWriteError(
          "crmRestoreCommercialDocument",
          retainedKey,
          new ConnectionError({
            message:
              "Factuarea: the native Restore receipt cannot confirm this retained restoration.",
            code: "crm_native134_response_unreadable",
          })
        );
      return receipt;
    },
    (reviewed, _localHash, config) =>
      documents.getRestoreOriginal(
        document,
        { expected_version: reviewed.expected_version },
        config
      )
  );
}
