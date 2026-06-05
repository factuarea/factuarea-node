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
  async activate(certificate: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/verifactu/certificates/{certificate}/activate", { "certificate": certificate });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Retrieve the active certificate */
  async active(config?: RequestConfig): Promise<unknown> {
    const path = "/verifactu/certificates/active";
    return this._get<unknown>(path, undefined, config);
  }

  /** List company certificates */
  async list(config?: RequestConfig): Promise<unknown> {
    const path = "/verifactu/certificates";
    return this._get<unknown>(path, undefined, config);
  }

  /** Upload a company certificate */
  async upload(formData: FormData, config?: RequestConfig): Promise<unknown> {
    const path = "/verifactu/certificates";
    return this._sendForm<unknown>(path, formData, config);
  }

  /** Revoke a company certificate */
  async revoke(certificate: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/verifactu/certificates/{certificate}", { "certificate": certificate });
    return this._delete<unknown>(path, params, config);
  }
}

export class VerifactuRecordsResource extends BaseResource {
  /** Find a VeriFactu record by AEAT CSV */
  async findByCsv(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/verifactu/records/find-by-csv";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Find a VeriFactu record by hash */
  async findByHuella(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/verifactu/records/find-by-huella";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Find a VeriFactu record by invoice number */
  async findByInvoiceNumber(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/verifactu/records/find-by-invoice-number";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List VeriFactu record activity timeline */
  async activities(record: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/verifactu/records/{record}/activities", { "record": record });
    return this._get<unknown>(path, undefined, config);
  }

  /** List VeriFactu records */
  async list(config?: RequestConfig): Promise<unknown> {
    const path = "/verifactu/records";
    return this._get<unknown>(path, undefined, config);
  }

  /** Retry VeriFactu transmission */
  async retry(record: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/verifactu/records/{record}/retry", { "record": record });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Retrieve a VeriFactu record */
  async show(record: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/verifactu/records/{record}", { "record": record });
    return this._get<unknown>(path, undefined, config);
  }
}

export class VerifactuDeclaracionResource extends BaseResource {
  /** List declaración responsable history */
  async history(config?: RequestConfig): Promise<unknown> {
    const path = "/verifactu/declaracion-responsable/history";
    return this._get<unknown>(path, undefined, config);
  }

  /** Retrieve the current declaración responsable */
  async current(config?: RequestConfig): Promise<unknown> {
    const path = "/verifactu/declaracion-responsable";
    return this._get<unknown>(path, undefined, config);
  }
}

export class VerifactuEventsResource extends BaseResource {
  /** Get VeriFactu event summary */
  async summary(config?: RequestConfig): Promise<unknown> {
    const path = "/verifactu/events/summary";
    return this._get<unknown>(path, undefined, config);
  }

  /** List VeriFactu events */
  async list(config?: RequestConfig): Promise<unknown> {
    const path = "/verifactu/events";
    return this._get<unknown>(path, undefined, config);
  }

  /** Retry a VeriFactu event */
  async retry(event: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/verifactu/events/{event}/retry", { "event": event });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Retrieve a VeriFactu event */
  async show(event: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/verifactu/events/{event}", { "event": event });
    return this._get<unknown>(path, undefined, config);
  }
}

export class VerifactuAeatAccessResource extends BaseResource {
  /** List AEAT access records */
  async list(config?: RequestConfig): Promise<unknown> {
    const path = "/verifactu/aeat-access/records";
    return this._get<unknown>(path, undefined, config);
  }

  /** Retrieve an AEAT access record */
  async show(record: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/verifactu/aeat-access/records/{record}", { "record": record });
    return this._get<unknown>(path, undefined, config);
  }
}

export class VerifactuSettingsResource extends BaseResource {
  /** Update VeriFactu settings */
  async update(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/verifactu/settings";
    return this._send<unknown>("PUT", path, body, config);
  }
}

export class VerifactuChainResource extends BaseResource {
  /** Validate the VeriFactu hash chain */
  async validate(config?: RequestConfig): Promise<unknown> {
    const path = "/verifactu/chain/validate";
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
  async config(config?: RequestConfig): Promise<unknown> {
    const path = "/verifactu/config";
    return this._get<unknown>(path, undefined, config);
  }

  /** Get VeriFactu stats */
  async stats(config?: RequestConfig): Promise<unknown> {
    const path = "/verifactu/stats";
    return this._get<unknown>(path, undefined, config);
  }
}
