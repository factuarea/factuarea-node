// AUTO-GENERATED from unchanged selected native Source139 operations.
import {
  CrmSourceBaseResource,
  type CrmSourceRequestConfig,
  type CrmSourceOriginalRequestConfig,
} from "./resource.js";
import { CRM_SOURCE_OPERATIONS } from "./operations.gen.js";
import type { HttpClient, BinaryResponse } from "../../core/http-client.js";
import type * as T from "./generated/types.gen.js";

export class CrmSourceDocumentsResource extends CrmSourceBaseResource {
  /** Native crmDownloadCommercialDocument; current authorized read. */
  async download(
    document: NonNullable<
      T.CrmDownloadCommercialDocumentData["path"]
    >["document"],
    params?: NonNullable<T.CrmDownloadCommercialDocumentData["query"]>,
    config?: CrmSourceRequestConfig
  ): Promise<BinaryResponse> {
    return this.readSource(
      CRM_SOURCE_OPERATIONS[0],
      { document },
      params,
      config
    );
  }

  /** Native crmGetCommercialDocument; current authorized read. */
  async getCurrent(
    document: NonNullable<T.CrmGetCommercialDocumentData["path"]>["document"],
    config?: CrmSourceRequestConfig
  ): Promise<T.CrmGetCommercialDocumentResponses[200]> {
    return this.readSource<T.CrmGetCommercialDocumentResponses[200]>(
      CRM_SOURCE_OPERATIONS[5],
      { document },
      undefined,
      config
    );
  }

  /** Native crmListCommercialDocuments; current authorized read. */
  async list(
    params?: NonNullable<T.CrmListCommercialDocumentsData["query"]>,
    config?: CrmSourceRequestConfig
  ): Promise<T.CrmListCommercialDocumentsResponses[200]> {
    return this.readSource<T.CrmListCommercialDocumentsResponses[200]>(
      CRM_SOURCE_OPERATIONS[19],
      {},
      params,
      config
    );
  }

  async *iterate(
    params?: NonNullable<T.CrmListCommercialDocumentsData["query"]>,
    config?: CrmSourceRequestConfig
  ): AsyncGenerator<
    T.CrmListCommercialDocumentsResponses[200]["data"]["items"][number]
  > {
    let number = params?.page ?? 1;
    do {
      const page = await this.list({ ...params, page: number }, config);
      if (page.data.page !== number || page.data.per_page < 1)
        throw new TypeError("Factuarea: incompatible native document page.");
      yield* page.data.items;
      if (
        BigInt(page.data.page) * BigInt(page.data.per_page) >=
        BigInt(page.data.total)
      )
        return;
      number++;
    } while (true);
  }
}

export class CrmSourceActivitiesResource extends CrmSourceBaseResource {
  /** Native crmGetCrmActivityCreateOriginal; Original, never Current or a write retry. */
  async getCreateOriginal(
    params: NonNullable<T.CrmGetCrmActivityCreateOriginalData["query"]>,
    config: CrmSourceOriginalRequestConfig
  ): Promise<T.CrmGetCrmActivityCreateOriginalResponses[200]> {
    return this.readSource<T.CrmGetCrmActivityCreateOriginalResponses[200]>(
      CRM_SOURCE_OPERATIONS[1],
      {},
      params,
      config
    );
  }
}

export class CrmSourceImportsResource extends CrmSourceBaseResource {
  /** Native public-api.v1.crm-spreadsheet-imports.apply-original; Original, never Current or a write retry. */
  async getApplyOriginal(
    run: NonNullable<
      T.PublicApiV1CrmSpreadsheetImportsApplyOriginalData["path"]
    >["run"],
    params: NonNullable<
      T.PublicApiV1CrmSpreadsheetImportsApplyOriginalData["query"]
    >,
    config: CrmSourceOriginalRequestConfig
  ): Promise<T.PublicApiV1CrmSpreadsheetImportsApplyOriginalResponses[200]> {
    return this.readSource<
      T.PublicApiV1CrmSpreadsheetImportsApplyOriginalResponses[200]
    >(CRM_SOURCE_OPERATIONS[2], { run }, params, config);
  }
}

export class CrmSourceBookingResource extends CrmSourceBaseResource {
  /** Native getBookingSequenceStopDecision; current authorized read. */
  async getSequenceStopDecision(
    booking: NonNullable<
      T.GetBookingSequenceStopDecisionData["path"]
    >["booking"],
    params: NonNullable<T.GetBookingSequenceStopDecisionData["query"]>,
    config?: CrmSourceRequestConfig
  ): Promise<T.GetBookingSequenceStopDecisionResponses[200]> {
    return this.readSource<T.GetBookingSequenceStopDecisionResponses[200]>(
      CRM_SOURCE_OPERATIONS[3],
      { booking },
      params,
      config
    );
  }

  /** Native getBookingService; current authorized read. */
  async getService(
    service: NonNullable<T.GetBookingServiceData["path"]>["service"],
    config?: CrmSourceRequestConfig
  ): Promise<T.GetBookingServiceResponses[200]> {
    return this.readSource<T.GetBookingServiceResponses[200]>(
      CRM_SOURCE_OPERATIONS[4],
      { service },
      undefined,
      config
    );
  }

  /** Native listBookingServices; current authorized read. */
  async listServices(
    params?: NonNullable<T.ListBookingServicesData["query"]>,
    config?: CrmSourceRequestConfig
  ): Promise<T.ListBookingServicesResponses[200]> {
    return this.readSource<T.ListBookingServicesResponses[200]>(
      CRM_SOURCE_OPERATIONS[17],
      {},
      params,
      config
    );
  }

  async *iterateServices(
    params?: NonNullable<T.ListBookingServicesData["query"]>,
    config?: CrmSourceRequestConfig
  ): AsyncGenerator<
    T.ListBookingServicesResponses[200]["data"]["items"][number]
  > {
    let cursor = params?.cursor;
    do {
      const page = await this.listServices(
        { ...params, ...(cursor ? { cursor } : {}) },
        config
      );
      yield* page.data.items;
      const next = page.data.next_cursor;
      if (next !== null && next === cursor)
        throw new TypeError("Factuarea: the native cursor did not advance.");
      cursor = next ?? undefined;
    } while (cursor !== undefined);
  }

  /** Native listBookings; current authorized read. */
  async listBookings(
    params?: NonNullable<T.ListBookingsData["query"]>,
    config?: CrmSourceRequestConfig
  ): Promise<T.ListBookingsResponses[200]> {
    return this.readSource<T.ListBookingsResponses[200]>(
      CRM_SOURCE_OPERATIONS[18],
      {},
      params,
      config
    );
  }

  async *iterateBookings(
    params?: NonNullable<T.ListBookingsData["query"]>,
    config?: CrmSourceRequestConfig
  ): AsyncGenerator<T.ListBookingsResponses[200]["data"]["items"][number]> {
    let cursor = params?.cursor;
    do {
      const page = await this.listBookings(
        { ...params, ...(cursor ? { cursor } : {}) },
        config
      );
      yield* page.data.items;
      const next = page.data.next_cursor;
      if (next !== null && next === cursor)
        throw new TypeError("Factuarea: the native cursor did not advance.");
      cursor = next ?? undefined;
    } while (cursor !== undefined);
  }
}

export class CrmSourceSequencesResource extends CrmSourceBaseResource {
  /** Native v1.crm.sequences.original_enrol; Original, never Current or a write retry. */
  async getEnrolOriginal(
    config: CrmSourceOriginalRequestConfig
  ): Promise<T.V1CrmSequencesOriginalEnrolResponses[200]> {
    return this.readSource<T.V1CrmSequencesOriginalEnrolResponses[200]>(
      CRM_SOURCE_OPERATIONS[6],
      {},
      undefined,
      config
    );
  }

  /** Native v1.crm.sequences.original_save; Original, never Current or a write retry. */
  async getSaveOriginal(
    config: CrmSourceOriginalRequestConfig
  ): Promise<T.V1CrmSequencesOriginalSaveResponses[200]> {
    return this.readSource<T.V1CrmSequencesOriginalSaveResponses[200]>(
      CRM_SOURCE_OPERATIONS[8],
      {},
      undefined,
      config
    );
  }

  /** Native v1.crm.sequences.get; current authorized read. */
  async getCurrent(
    sequence: NonNullable<T.V1CrmSequencesGetData["path"]>["sequence"],
    config?: CrmSourceRequestConfig
  ): Promise<T.V1CrmSequencesGetResponses[200]> {
    return this.readSource<T.V1CrmSequencesGetResponses[200]>(
      CRM_SOURCE_OPERATIONS[14],
      { sequence },
      undefined,
      config
    );
  }

  /** Native v1.crm.sequences.list; current authorized read. */
  async list(
    params: NonNullable<T.V1CrmSequencesListData["query"]>,
    config?: CrmSourceRequestConfig
  ): Promise<T.V1CrmSequencesListResponses[200]> {
    return this.readSource<T.V1CrmSequencesListResponses[200]>(
      CRM_SOURCE_OPERATIONS[20],
      {},
      params,
      config
    );
  }

  async *pages(
    params: NonNullable<T.V1CrmSequencesListData["query"]>,
    config?: CrmSourceRequestConfig
  ): AsyncGenerator<T.V1CrmSequencesListResponses[200]> {
    let cursor = params.cursor;
    do {
      const page = await this.list(
        { ...params, ...(cursor ? { cursor } : {}) },
        config
      );
      yield page;
      const next = page.data.next_cursor;
      if (next !== null && next === cursor)
        throw new TypeError("Factuarea: the native cursor did not advance.");
      cursor = next ?? undefined;
    } while (cursor !== undefined);
  }

  /** Native v1.crm.sequences.preview; current authorized read. */
  async preview(
    sequence: NonNullable<T.V1CrmSequencesPreviewData["path"]>["sequence"],
    params: NonNullable<T.V1CrmSequencesPreviewData["query"]>,
    config?: CrmSourceRequestConfig
  ): Promise<T.V1CrmSequencesPreviewResponses[200]> {
    return this.readSource<T.V1CrmSequencesPreviewResponses[200]>(
      CRM_SOURCE_OPERATIONS[21],
      { sequence },
      params,
      config
    );
  }
}

export class CrmSourceReportsResource extends CrmSourceBaseResource {
  /** Native GetCrmReportDefinitionOriginal; Original, never Current or a write retry. */
  async getDefinitionOriginal(
    definition: NonNullable<
      T.GetCrmReportDefinitionOriginalData["path"]
    >["definition"],
    params: NonNullable<T.GetCrmReportDefinitionOriginalData["query"]>,
    config: CrmSourceOriginalRequestConfig
  ): Promise<T.GetCrmReportDefinitionOriginalResponses[200]> {
    return this.readSource<T.GetCrmReportDefinitionOriginalResponses[200]>(
      CRM_SOURCE_OPERATIONS[7],
      { definition },
      params,
      config
    );
  }
}

export class CrmSourceLeadsResource extends CrmSourceBaseResource {
  /** Native crmGetLeadCreateOriginal; Original, never Current or a write retry. */
  async getCreateOriginal(
    params: NonNullable<T.CrmGetLeadCreateOriginalData["query"]>,
    config: CrmSourceOriginalRequestConfig
  ): Promise<T.CrmGetLeadCreateOriginalResponses[200]> {
    return this.readSource<T.CrmGetLeadCreateOriginalResponses[200]>(
      CRM_SOURCE_OPERATIONS[9],
      {},
      params,
      config
    );
  }
}

export class CrmSourceOpportunitiesResource extends CrmSourceBaseResource {
  /** Native crmGetOpportunityCreateOriginal; Original, never Current or a write retry. */
  async getCreateOriginal(
    params: NonNullable<T.CrmGetOpportunityCreateOriginalData["query"]>,
    config: CrmSourceOriginalRequestConfig
  ): Promise<T.CrmGetOpportunityCreateOriginalResponses[200]> {
    return this.readSource<T.CrmGetOpportunityCreateOriginalResponses[200]>(
      CRM_SOURCE_OPERATIONS[10],
      {},
      params,
      config
    );
  }

  /** Native crmGetOpportunityStageOriginal; Original, never Current or a write retry. */
  async getStageOriginal(
    opportunity: NonNullable<
      T.CrmGetOpportunityStageOriginalData["path"]
    >["opportunity"],
    params: NonNullable<T.CrmGetOpportunityStageOriginalData["query"]>,
    config: CrmSourceOriginalRequestConfig
  ): Promise<T.CrmGetOpportunityStageOriginalResponses[200]> {
    return this.readSource<T.CrmGetOpportunityStageOriginalResponses[200]>(
      CRM_SOURCE_OPERATIONS[11],
      { opportunity },
      params,
      config
    );
  }
}

export class CrmSourceCaptureResource extends CrmSourceBaseResource {
  /** Native crmGetOriginalCaptureFormSave; Original, never Current or a write retry. */
  async getFormSaveOriginal(
    params: NonNullable<T.CrmGetOriginalCaptureFormSaveData["query"]>,
    config: CrmSourceRequestConfig & {
      headers: NonNullable<T.CrmGetOriginalCaptureFormSaveData["headers"]>;
    }
  ): Promise<T.CrmGetOriginalCaptureFormSaveResponses[200]> {
    return this.readSource<T.CrmGetOriginalCaptureFormSaveResponses[200]>(
      CRM_SOURCE_OPERATIONS[12],
      {},
      params,
      config
    );
  }

  /** Native crmGetOriginalWebToTicketSubmission; Original, never Current or a write retry. */
  async getSubmissionOriginal(
    form: NonNullable<
      T.CrmGetOriginalWebToTicketSubmissionData["path"]
    >["form"],
    config: CrmSourceOriginalRequestConfig
  ): Promise<T.CrmGetOriginalWebToTicketSubmissionResponses[200]> {
    return this.readSource<T.CrmGetOriginalWebToTicketSubmissionResponses[200]>(
      CRM_SOURCE_OPERATIONS[13],
      { form },
      undefined,
      config
    );
  }
}

export class CrmSourceServiceTicketsResource extends CrmSourceBaseResource {
  /** Native getServiceReplyOriginal; Original, never Current or a write retry. */
  async getReplyOriginal(
    ticket: NonNullable<T.GetServiceReplyOriginalData["path"]>["ticket"],
    params: NonNullable<T.GetServiceReplyOriginalData["query"]>,
    config: CrmSourceOriginalRequestConfig
  ): Promise<T.GetServiceReplyOriginalResponses[200]> {
    return this.readSource<T.GetServiceReplyOriginalResponses[200]>(
      CRM_SOURCE_OPERATIONS[15],
      { ticket },
      params,
      config
    );
  }
}

export class CrmSourceConversationsResource extends CrmSourceBaseResource {
  /** Native getCrmWhatsAppMessageOriginal; Original, never Current or a write retry. */
  async getWhatsAppOriginal(
    conversation: NonNullable<
      T.GetCrmWhatsAppMessageOriginalData["path"]
    >["conversation"],
    message: NonNullable<
      T.GetCrmWhatsAppMessageOriginalData["path"]
    >["message"],
    params: NonNullable<T.GetCrmWhatsAppMessageOriginalData["query"]>,
    config?: CrmSourceRequestConfig
  ): Promise<T.GetCrmWhatsAppMessageOriginalResponses[200]> {
    return this.readSource<T.GetCrmWhatsAppMessageOriginalResponses[200]>(
      CRM_SOURCE_OPERATIONS[16],
      { conversation, message },
      params,
      config
    );
  }
}

export class CrmSourceResource {
  readonly documents: CrmSourceDocumentsResource;
  readonly activities: CrmSourceActivitiesResource;
  readonly imports: CrmSourceImportsResource;
  readonly booking: CrmSourceBookingResource;
  readonly sequences: CrmSourceSequencesResource;
  readonly reports: CrmSourceReportsResource;
  readonly leads: CrmSourceLeadsResource;
  readonly opportunities: CrmSourceOpportunitiesResource;
  readonly capture: CrmSourceCaptureResource;
  readonly serviceTickets: CrmSourceServiceTicketsResource;
  readonly conversations: CrmSourceConversationsResource;

  constructor(client: HttpClient) {
    this.documents = new CrmSourceDocumentsResource(client);
    this.activities = new CrmSourceActivitiesResource(client);
    this.imports = new CrmSourceImportsResource(client);
    this.booking = new CrmSourceBookingResource(client);
    this.sequences = new CrmSourceSequencesResource(client);
    this.reports = new CrmSourceReportsResource(client);
    this.leads = new CrmSourceLeadsResource(client);
    this.opportunities = new CrmSourceOpportunitiesResource(client);
    this.capture = new CrmSourceCaptureResource(client);
    this.serviceTickets = new CrmSourceServiceTicketsResource(client);
    this.conversations = new CrmSourceConversationsResource(client);
  }
}
