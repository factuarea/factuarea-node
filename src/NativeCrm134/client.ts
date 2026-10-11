import { ConnectionError } from "../core/errors.js";
import type { HttpClient } from "../core/http-client.js";
import type { CrmSourceRequestConfig } from "../crm/source/resource.js";
import type { CrmSourceDocumentsResource } from "../crm/source/resources.gen.js";
import type {
  ListServiceStagesData,
  ListServiceStagesResponses,
} from "./generated/types.gen.js";
import { NativeCrm134Resource } from "./resources.gen.js";
import {
  prepareStageUpdate,
  prepareDocumentRestore,
  RetainedBulkAction,
  type StageUpdateBody,
  type BulkActionBody,
  type DocumentRestoreBody,
} from "./intents.js";

/** Same authenticated SDK client; native availability, Company and C7 remain server decisions. */
export class NativeCrm134Client extends NativeCrm134Resource {
  constructor(
    client: HttpClient,
    private readonly existingDocuments: CrmSourceDocumentsResource
  ) {
    super(client);
  }

  prepareStageUpdate(
    stage: string,
    body: StageUpdateBody,
    key: string,
    sessionSignal: AbortSignal
  ) {
    return prepareStageUpdate(this.stages, stage, body, key, sessionSignal);
  }

  prepareBulkAction(
    body: BulkActionBody,
    key: string,
    sessionSignal: AbortSignal
  ) {
    return new RetainedBulkAction(this.bulk, body, key, sessionSignal);
  }

  prepareDocumentRestore(
    document: string,
    body: DocumentRestoreBody,
    key: string,
    sessionSignal: AbortSignal
  ) {
    return prepareDocumentRestore(
      this.existingDocuments,
      this.documents,
      document,
      body,
      key,
      sessionSignal
    );
  }

  /** Walk the actual numbered catalog, reauthorizing each GET rather than caching its head. */
  async *stagePages(
    params?: NonNullable<ListServiceStagesData["query"]>,
    config?: CrmSourceRequestConfig
  ): AsyncGenerator<ListServiceStagesResponses[200]> {
    let number = params?.page ?? 1;
    do {
      const page = await this.stages.list({ ...params, page: number }, config);
      if (
        page.data.page !== number ||
        page.data.per_page < 1 ||
        (params?.per_page !== undefined &&
          page.data.per_page !== params.per_page)
      )
        throw new ConnectionError({
          message:
            "Factuarea: the native stage page differs from the requested selector.",
          code: "crm_native134_page_unreadable",
        });
      yield page;
      if (
        BigInt(page.data.page) * BigInt(page.data.per_page) >=
        BigInt(page.data.total)
      )
        return;
      number++;
    } while (true);
  }
}
