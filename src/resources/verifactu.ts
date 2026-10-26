// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1VerifactuAeatAccessShowResponses, PublicApiV1VerifactuCertificatesActivateResponses, PublicApiV1VerifactuCertificatesActiveResponses, PublicApiV1VerifactuCertificatesListResponses, PublicApiV1VerifactuCertificatesUploadResponses, PublicApiV1VerifactuChainValidateResponses, PublicApiV1VerifactuConfigResponses, PublicApiV1VerifactuDeclaracionCurrentResponses, PublicApiV1VerifactuDeclaracionHistoryResponses, PublicApiV1VerifactuEventsRetryResponses, PublicApiV1VerifactuEventsShowResponses, PublicApiV1VerifactuEventsSummaryResponses, PublicApiV1VerifactuRecordsFindByCsvData, PublicApiV1VerifactuRecordsFindByCsvResponses, PublicApiV1VerifactuRecordsFindByHuellaData, PublicApiV1VerifactuRecordsFindByHuellaResponses, PublicApiV1VerifactuRecordsFindByInvoiceNumberData, PublicApiV1VerifactuRecordsFindByInvoiceNumberResponses, PublicApiV1VerifactuRecordsRetryBlockedResponses, PublicApiV1VerifactuRecordsRetryResponses, PublicApiV1VerifactuRecordsShowResponses, PublicApiV1VerifactuRecordsSubsanarResponses, PublicApiV1VerifactuRepresentationRegisterResponses, PublicApiV1VerifactuRepresentationShowResponses, PublicApiV1VerifactuSettingsUpdateData, PublicApiV1VerifactuSettingsUpdateResponses, PublicApiV1VerifactuStatsResponses } from "../generated/types.gen.js";


export class VerifactuCertificatesResource extends BaseResource {
  /** Activate a company certificate */
  async activate(company: string, certificate: string, config?: RequestConfig): Promise<PublicApiV1VerifactuCertificatesActivateResponses[200]> {
    const path = this.buildPath("/companies/{company}/verifactu/certificates/{certificate}/activate", { "company": company, "certificate": certificate });
    return this._send<PublicApiV1VerifactuCertificatesActivateResponses[200]>("POST", path, undefined, config);
  }

  /** Retrieve the active certificate */
  async active(company: string, config?: RequestConfig): Promise<PublicApiV1VerifactuCertificatesActiveResponses[200]> {
    const path = this.buildPath("/companies/{company}/verifactu/certificates/active", { "company": company });
    return this._get<PublicApiV1VerifactuCertificatesActiveResponses[200]>(path, undefined, config);
  }

  /** List company certificates */
  async list(company: string, config?: RequestConfig): Promise<PublicApiV1VerifactuCertificatesListResponses[200]> {
    const path = this.buildPath("/companies/{company}/verifactu/certificates", { "company": company });
    return this._get<PublicApiV1VerifactuCertificatesListResponses[200]>(path, undefined, config);
  }

  /** Upload a company certificate */
  async upload(company: string, formData: FormData, config?: RequestConfig): Promise<PublicApiV1VerifactuCertificatesUploadResponses[201]> {
    const path = this.buildPath("/companies/{company}/verifactu/certificates", { "company": company });
    return this._sendForm<PublicApiV1VerifactuCertificatesUploadResponses[201]>(path, formData, config);
  }

  /** Revoke a company certificate */
  async revoke(company: string, certificate: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/verifactu/certificates/{certificate}", { "company": company, "certificate": certificate });
    return this._delete<unknown>(path, params, config, { idempotent: true });
  }
}

export class VerifactuRecordsResource extends BaseResource {
  /** Find a VeriFactu record by AEAT CSV */
  async findByCsv(company: string, body?: PublicApiV1VerifactuRecordsFindByCsvData["body"], config?: RequestConfig): Promise<PublicApiV1VerifactuRecordsFindByCsvResponses[200]> {
    const path = this.buildPath("/companies/{company}/verifactu/records/find-by-csv", { "company": company });
    return this._send<PublicApiV1VerifactuRecordsFindByCsvResponses[200]>("POST", path, body, config);
  }

  /** Find a VeriFactu record by hash */
  async findByHuella(company: string, body?: PublicApiV1VerifactuRecordsFindByHuellaData["body"], config?: RequestConfig): Promise<PublicApiV1VerifactuRecordsFindByHuellaResponses[200]> {
    const path = this.buildPath("/companies/{company}/verifactu/records/find-by-huella", { "company": company });
    return this._send<PublicApiV1VerifactuRecordsFindByHuellaResponses[200]>("POST", path, body, config);
  }

  /** Find a VeriFactu record by invoice number */
  async findByInvoiceNumber(company: string, body?: PublicApiV1VerifactuRecordsFindByInvoiceNumberData["body"], config?: RequestConfig): Promise<PublicApiV1VerifactuRecordsFindByInvoiceNumberResponses[200]> {
    const path = this.buildPath("/companies/{company}/verifactu/records/find-by-invoice-number", { "company": company });
    return this._send<PublicApiV1VerifactuRecordsFindByInvoiceNumberResponses[200]>("POST", path, body, config);
  }

  /** List VeriFactu record activity timeline */
  async activities(company: string, record: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/verifactu/records/{record}/activities", { "company": company, "record": record });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** List VeriFactu records */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/verifactu/records", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Retry every blocked VeriFactu record */
  async retryBlocked(company: string, config?: RequestConfig): Promise<PublicApiV1VerifactuRecordsRetryBlockedResponses[202]> {
    const path = this.buildPath("/companies/{company}/verifactu/records/retry-blocked", { "company": company });
    return this._send<PublicApiV1VerifactuRecordsRetryBlockedResponses[202]>("POST", path, undefined, config);
  }

  /** Retry VeriFactu transmission */
  async retry(company: string, record: string, config?: RequestConfig): Promise<PublicApiV1VerifactuRecordsRetryResponses[200]> {
    const path = this.buildPath("/companies/{company}/verifactu/records/{record}/retry", { "company": company, "record": record });
    return this._send<PublicApiV1VerifactuRecordsRetryResponses[200]>("POST", path, undefined, config);
  }

  /** Retrieve a VeriFactu record */
  async show(company: string, record: string, config?: RequestConfig): Promise<PublicApiV1VerifactuRecordsShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/verifactu/records/{record}", { "company": company, "record": record });
    return this._get<PublicApiV1VerifactuRecordsShowResponses[200]>(path, undefined, config);
  }

  /** Subsanar a VeriFactu record */
  async subsanar(company: string, record: string, config?: RequestConfig): Promise<PublicApiV1VerifactuRecordsSubsanarResponses[202]> {
    const path = this.buildPath("/companies/{company}/verifactu/records/{record}/subsanar", { "company": company, "record": record });
    return this._send<PublicApiV1VerifactuRecordsSubsanarResponses[202]>("POST", path, undefined, config);
  }
}

export class VerifactuRepresentationResource extends BaseResource {
  /** Retrieve the active representation */
  async show(company: string, config?: RequestConfig): Promise<PublicApiV1VerifactuRepresentationShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/verifactu/representation", { "company": company });
    return this._get<PublicApiV1VerifactuRepresentationShowResponses[200]>(path, undefined, config);
  }

  /** Register a representation */
  async register(company: string, formData: FormData, config?: RequestConfig): Promise<PublicApiV1VerifactuRepresentationRegisterResponses[201]> {
    const path = this.buildPath("/companies/{company}/verifactu/representation", { "company": company });
    return this._sendForm<PublicApiV1VerifactuRepresentationRegisterResponses[201]>(path, formData, config);
  }

  /** Revoke the active representation */
  async revoke(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/verifactu/representation", { "company": company });
    return this._delete<unknown>(path, params, config, { idempotent: true });
  }
}

export class VerifactuDeclaracionResource extends BaseResource {
  /** List declaración responsable history */
  async history(company: string, config?: RequestConfig): Promise<PublicApiV1VerifactuDeclaracionHistoryResponses[200]> {
    const path = this.buildPath("/companies/{company}/verifactu/declaracion-responsable/history", { "company": company });
    return this._get<PublicApiV1VerifactuDeclaracionHistoryResponses[200]>(path, undefined, config);
  }

  /** Retrieve the current declaración responsable */
  async current(company: string, config?: RequestConfig): Promise<PublicApiV1VerifactuDeclaracionCurrentResponses[200]> {
    const path = this.buildPath("/companies/{company}/verifactu/declaracion-responsable", { "company": company });
    return this._get<PublicApiV1VerifactuDeclaracionCurrentResponses[200]>(path, undefined, config);
  }
}

export class VerifactuEventsResource extends BaseResource {
  /** Get VeriFactu event summary */
  async summary(company: string, config?: RequestConfig): Promise<PublicApiV1VerifactuEventsSummaryResponses[200]> {
    const path = this.buildPath("/companies/{company}/verifactu/events/summary", { "company": company });
    return this._get<PublicApiV1VerifactuEventsSummaryResponses[200]>(path, undefined, config);
  }

  /** List VeriFactu events */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/verifactu/events", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Retry a VeriFactu event */
  async retry(company: string, event: string, config?: RequestConfig): Promise<PublicApiV1VerifactuEventsRetryResponses[200]> {
    const path = this.buildPath("/companies/{company}/verifactu/events/{event}/retry", { "company": company, "event": event });
    return this._send<PublicApiV1VerifactuEventsRetryResponses[200]>("POST", path, undefined, config);
  }

  /** Retrieve a VeriFactu event */
  async show(company: string, event: string, config?: RequestConfig): Promise<PublicApiV1VerifactuEventsShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/verifactu/events/{event}", { "company": company, "event": event });
    return this._get<PublicApiV1VerifactuEventsShowResponses[200]>(path, undefined, config);
  }
}

export class VerifactuAeatAccessResource extends BaseResource {
  /** List AEAT access records */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/verifactu/aeat-access/records", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Retrieve an AEAT access record */
  async show(company: string, record: string, config?: RequestConfig): Promise<PublicApiV1VerifactuAeatAccessShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/verifactu/aeat-access/records/{record}", { "company": company, "record": record });
    return this._get<PublicApiV1VerifactuAeatAccessShowResponses[200]>(path, undefined, config);
  }
}

export class VerifactuSettingsResource extends BaseResource {
  /** Update VeriFactu settings */
  async update(company: string, body?: PublicApiV1VerifactuSettingsUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1VerifactuSettingsUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/verifactu/settings", { "company": company });
    return this._send<PublicApiV1VerifactuSettingsUpdateResponses[200]>("PATCH", path, body, config, { idempotent: true });
  }
}

export class VerifactuChainResource extends BaseResource {
  /** Validate the VeriFactu hash chain */
  async validate(company: string, config?: RequestConfig): Promise<PublicApiV1VerifactuChainValidateResponses[200]> {
    const path = this.buildPath("/companies/{company}/verifactu/chain/validate", { "company": company });
    return this._get<PublicApiV1VerifactuChainValidateResponses[200]>(path, undefined, config);
  }
}

export class VerifactuResource extends BaseResource {
  readonly certificates: VerifactuCertificatesResource;
  readonly records: VerifactuRecordsResource;
  readonly representation: VerifactuRepresentationResource;
  readonly declaracion: VerifactuDeclaracionResource;
  readonly events: VerifactuEventsResource;
  readonly aeatAccess: VerifactuAeatAccessResource;
  readonly settings: VerifactuSettingsResource;
  readonly chain: VerifactuChainResource;

  constructor(client: HttpClient) {
    super(client);
    this.certificates = new VerifactuCertificatesResource(client);
    this.records = new VerifactuRecordsResource(client);
    this.representation = new VerifactuRepresentationResource(client);
    this.declaracion = new VerifactuDeclaracionResource(client);
    this.events = new VerifactuEventsResource(client);
    this.aeatAccess = new VerifactuAeatAccessResource(client);
    this.settings = new VerifactuSettingsResource(client);
    this.chain = new VerifactuChainResource(client);
  }

  /** Retrieve VeriFactu config */
  async config(company: string, config?: RequestConfig): Promise<PublicApiV1VerifactuConfigResponses[200]> {
    const path = this.buildPath("/companies/{company}/verifactu/config", { "company": company });
    return this._get<PublicApiV1VerifactuConfigResponses[200]>(path, undefined, config);
  }

  /** Get VeriFactu stats */
  async stats(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1VerifactuStatsResponses[200]> {
    const path = this.buildPath("/companies/{company}/verifactu/stats", { "company": company });
    return this._get<PublicApiV1VerifactuStatsResponses[200]>(path, params, config);
  }
}
