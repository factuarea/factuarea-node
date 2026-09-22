// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class VerifactuCertificatesResource extends BaseResource {
  /** Activate a company certificate */
  async activate(company: string, certificate: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/verifactu/certificates/{certificate}/activate", { "company": company, "certificate": certificate });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Retrieve the active certificate */
  async active(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/verifactu/certificates/active", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** List company certificates */
  async list(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/verifactu/certificates", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** Upload a company certificate */
  async upload(company: string, formData: FormData, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/verifactu/certificates", { "company": company });
    return this._sendForm<unknown>(path, formData, config);
  }

  /** Revoke a company certificate */
  async revoke(company: string, certificate: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/verifactu/certificates/{certificate}", { "company": company, "certificate": certificate });
    return this._delete<unknown>(path, params, config);
  }
}

export class VerifactuRecordsResource extends BaseResource {
  /** Find a VeriFactu record by AEAT CSV */
  async findByCsv(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/verifactu/records/find-by-csv", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Find a VeriFactu record by hash */
  async findByHuella(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/verifactu/records/find-by-huella", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Find a VeriFactu record by invoice number */
  async findByInvoiceNumber(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/verifactu/records/find-by-invoice-number", { "company": company });
    return this._send<unknown>("POST", path, body, config);
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

  /** Retry VeriFactu transmission */
  async retry(company: string, record: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/verifactu/records/{record}/retry", { "company": company, "record": record });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Retrieve a VeriFactu record */
  async show(company: string, record: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/verifactu/records/{record}", { "company": company, "record": record });
    return this._get<unknown>(path, undefined, config);
  }

  /** Subsanar a rejected VeriFactu record */
  async subsanar(company: string, record: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/verifactu/records/{record}/subsanar", { "company": company, "record": record });
    return this._send<unknown>("POST", path, undefined, config);
  }
}

export class VerifactuDeclaracionResource extends BaseResource {
  /** List declaración responsable history */
  async history(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/verifactu/declaracion-responsable/history", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** Retrieve the current declaración responsable */
  async current(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/verifactu/declaracion-responsable", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }
}

export class VerifactuEventsResource extends BaseResource {
  /** Get VeriFactu event summary */
  async summary(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/verifactu/events/summary", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** List VeriFactu events */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/verifactu/events", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Retry a VeriFactu event */
  async retry(company: string, event: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/verifactu/events/{event}/retry", { "company": company, "event": event });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Retrieve a VeriFactu event */
  async show(company: string, event: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/verifactu/events/{event}", { "company": company, "event": event });
    return this._get<unknown>(path, undefined, config);
  }
}

export class VerifactuAeatAccessResource extends BaseResource {
  /** List AEAT access records */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/verifactu/aeat-access/records", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Retrieve an AEAT access record */
  async show(company: string, record: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/verifactu/aeat-access/records/{record}", { "company": company, "record": record });
    return this._get<unknown>(path, undefined, config);
  }
}

export class VerifactuSettingsResource extends BaseResource {
  /** Update VeriFactu settings */
  async update(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/verifactu/settings", { "company": company });
    return this._send<unknown>("PATCH", path, body, config);
  }
}

export class VerifactuChainResource extends BaseResource {
  /** Validate the VeriFactu hash chain */
  async validate(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/verifactu/chain/validate", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }
}

export class VerifactuResource extends BaseResource {
  readonly certificates: VerifactuCertificatesResource;
  readonly records: VerifactuRecordsResource;
  readonly declaracion: VerifactuDeclaracionResource;
  readonly events: VerifactuEventsResource;
  readonly aeatAccess: VerifactuAeatAccessResource;
  readonly settings: VerifactuSettingsResource;
  readonly chain: VerifactuChainResource;

  constructor(client: HttpClient) {
    super(client);
    this.certificates = new VerifactuCertificatesResource(client);
    this.records = new VerifactuRecordsResource(client);
    this.declaracion = new VerifactuDeclaracionResource(client);
    this.events = new VerifactuEventsResource(client);
    this.aeatAccess = new VerifactuAeatAccessResource(client);
    this.settings = new VerifactuSettingsResource(client);
    this.chain = new VerifactuChainResource(client);
  }

  /** Retrieve VeriFactu config */
  async config(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/verifactu/config", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** Get VeriFactu stats */
  async stats(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/verifactu/stats", { "company": company });
    return this._get<unknown>(path, params, config);
  }
}
