// AUTO-GENERATED from actual private Native149 3667e01b82dea255c23b2eecb80e6e600baa445b5b7a2beb5a65eb978a1fc073; no metadata grants access.

import {
  type CrmSourceRequestConfig,
  type CrmSourceOriginalRequestConfig,
  type CrmSourceWriteConfig,
} from "../crm/source/resource.js";

import { CRM_NATIVE134_OPERATIONS } from "./operations.gen.js";

import { NativeCrm134BaseResource } from "./resource.js";

import type { HttpClient } from "../core/http-client.js";

import type * as T from "./generated/types.gen.js";

export class NativeCrm134BulkResource extends NativeCrm134BaseResource {
  /** Native applyServiceTicketBulkAction: one human-confirmed dispatch; no retry or redirect. */
  async apply(
    body: NonNullable<T.ApplyServiceTicketBulkActionData["body"]>,
    config: CrmSourceWriteConfig
  ): Promise<
    T.ApplyServiceTicketBulkActionResponses[keyof T.ApplyServiceTicketBulkActionResponses]
  > {
    return this.writeNative<
      T.ApplyServiceTicketBulkActionResponses[keyof T.ApplyServiceTicketBulkActionResponses]
    >(CRM_NATIVE134_OPERATIONS[0], {}, body, { ...config, maxRetries: 0 });
  }

  /** Native getOriginalServiceTicketBulkItem: Original under current native authority; never Current or POST recovery. */
  async getItemOriginal(
    ticket: NonNullable<
      T.GetOriginalServiceTicketBulkItemData["path"]
    >["ticket"],
    params: NonNullable<T.GetOriginalServiceTicketBulkItemData["query"]>,
    config: CrmSourceOriginalRequestConfig
  ): Promise<
    T.GetOriginalServiceTicketBulkItemResponses[keyof T.GetOriginalServiceTicketBulkItemResponses]
  > {
    return this.readNative<
      T.GetOriginalServiceTicketBulkItemResponses[keyof T.GetOriginalServiceTicketBulkItemResponses]
    >(CRM_NATIVE134_OPERATIONS[2], { ticket }, params, {
      ...config,
      maxRetries: 0,
    });
  }

  /** Native getServiceTicketBulkOptions: current authorized native read. */
  async getOptions(
    config?: CrmSourceRequestConfig
  ): Promise<
    T.GetServiceTicketBulkOptionsResponses[keyof T.GetServiceTicketBulkOptionsResponses]
  > {
    return this.readNative<
      T.GetServiceTicketBulkOptionsResponses[keyof T.GetServiceTicketBulkOptionsResponses]
    >(CRM_NATIVE134_OPERATIONS[4], {}, undefined, { ...config, maxRetries: 0 });
  }
}

export class NativeCrm134DocumentsResource extends NativeCrm134BaseResource {
  /** Native crmGetCommercialDocumentRestoreOriginal: Original under current native authority; never Current or POST recovery. */
  async getRestoreOriginal(
    document: NonNullable<
      T.CrmGetCommercialDocumentRestoreOriginalData["path"]
    >["document"],
    params: NonNullable<T.CrmGetCommercialDocumentRestoreOriginalData["query"]>,
    config: CrmSourceOriginalRequestConfig
  ): Promise<
    T.CrmGetCommercialDocumentRestoreOriginalResponses[keyof T.CrmGetCommercialDocumentRestoreOriginalResponses]
  > {
    return this.readNative<
      T.CrmGetCommercialDocumentRestoreOriginalResponses[keyof T.CrmGetCommercialDocumentRestoreOriginalResponses]
    >(CRM_NATIVE134_OPERATIONS[1], { document }, params, {
      ...config,
      maxRetries: 0,
    });
  }
}

export class NativeCrm134StagesResource extends NativeCrm134BaseResource {
  /** Native getServiceStageOriginal: Original under current native authority; never Current or POST recovery. */
  async getOriginal(
    stage: NonNullable<T.GetServiceStageOriginalData["path"]>["stage"],
    params: NonNullable<T.GetServiceStageOriginalData["query"]>,
    config: CrmSourceOriginalRequestConfig
  ): Promise<
    T.GetServiceStageOriginalResponses[keyof T.GetServiceStageOriginalResponses]
  > {
    return this.readNative<
      T.GetServiceStageOriginalResponses[keyof T.GetServiceStageOriginalResponses]
    >(CRM_NATIVE134_OPERATIONS[3], { stage }, params, {
      ...config,
      maxRetries: 0,
    });
  }

  /** Native listServiceStages: current authorized native read. */
  async list(
    params?: NonNullable<T.ListServiceStagesData["query"]>,
    config?: CrmSourceRequestConfig
  ): Promise<T.ListServiceStagesResponses[keyof T.ListServiceStagesResponses]> {
    return this.readNative<
      T.ListServiceStagesResponses[keyof T.ListServiceStagesResponses]
    >(CRM_NATIVE134_OPERATIONS[5], {}, params, { ...config, maxRetries: 0 });
  }

  /** Native updateServiceStage: one human-confirmed dispatch; no retry or redirect. */
  async update(
    stage: NonNullable<T.UpdateServiceStageData["path"]>["stage"],
    body: NonNullable<T.UpdateServiceStageData["body"]>,
    config: CrmSourceWriteConfig
  ): Promise<
    T.UpdateServiceStageResponses[keyof T.UpdateServiceStageResponses]
  > {
    return this.writeNative<
      T.UpdateServiceStageResponses[keyof T.UpdateServiceStageResponses]
    >(CRM_NATIVE134_OPERATIONS[6], { stage }, body, {
      ...config,
      maxRetries: 0,
    });
  }
}

export class NativeCrm134Resource {
  readonly bulk: NativeCrm134BulkResource;
  readonly documents: NativeCrm134DocumentsResource;
  readonly stages: NativeCrm134StagesResource;

  constructor(client: HttpClient) {
    this.bulk = new NativeCrm134BulkResource(client);
    this.documents = new NativeCrm134DocumentsResource(client);
    this.stages = new NativeCrm134StagesResource(client);
  }
}
