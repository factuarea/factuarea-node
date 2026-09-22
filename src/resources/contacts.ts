// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class ContactsResource extends BaseResource {
  /** Archive a contact */
  async archive(company: string, contact: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/contacts/{contact}/archive", { "company": company, "contact": contact });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Assign a contact role */
  async assignContactRole(company: string, contact: string, role: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/contacts/{contact}/roles/{role}", { "company": company, "contact": contact, "role": role });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Remove a contact role */
  async removeContactRole(company: string, contact: string, role: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/contacts/{contact}/roles/{role}", { "company": company, "contact": contact, "role": role });
    return this._delete<unknown>(path, params, config);
  }

  /** Archive contacts in bulk */
  async bulkArchive(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/contacts/bulk/archive", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Change contact role status in bulk */
  async bulkChangeContactRoleStatus(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/contacts/bulk/status", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Create contacts in bulk */
  async bulkCreate(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/contacts/bulk-create", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Delete contacts in bulk */
  async bulkDelete(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/contacts/bulk-delete", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Change a contact role status */
  async changeContactRoleStatus(company: string, contact: string, role: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/contacts/{contact}/roles/{role}/status", { "company": company, "contact": contact, "role": role });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** Create a contact */
  async create(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/contacts", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List contacts */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/contacts", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Delete a contact */
  async delete(company: string, contact: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/contacts/{contact}", { "company": company, "contact": contact });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a contact */
  async show(company: string, contact: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/contacts/{contact}", { "company": company, "contact": contact });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a contact */
  async update(company: string, contact: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/contacts/{contact}", { "company": company, "contact": contact });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** Download the contact import template */
  async importTemplate(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/contacts/import/template", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** Find a contact by external ID */
  async findByExternalId(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/contacts/find-by-external-id", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Find a contact by tax ID */
  async findByTaxId(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/contacts/find-by-tax-id", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List contact activity */
  async activities(company: string, contact: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/contacts/{contact}/activities", { "company": company, "contact": contact });
    return this._get<unknown>(path, params, config);
  }

  /** List contact filter options */
  async options(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/contacts/options", { "company": company });
    return this._get<unknown>(path, params, config);
  }

  /** Get contact statistics */
  async stats(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/contacts/stats", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** Import contacts */
  async import(company: string, formData: FormData, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/contacts/import", { "company": company });
    return this._sendForm<unknown>(path, formData, config);
  }

  /** Preview a contact import */
  async previewImport(company: string, formData: FormData, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/contacts/import/preview", { "company": company });
    return this._sendForm<unknown>(path, formData, config);
  }

  /** Restore an archived contact */
  async restore(company: string, contact: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/contacts/{contact}/restore", { "company": company, "contact": contact });
    return this._send<unknown>("PATCH", path, undefined, config);
  }

  /** Search contacts */
  async search(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/contacts/search", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Replace the bank accounts of a contact */
  async updateBankAccounts(company: string, contact: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/contacts/{contact}/bank-accounts", { "company": company, "contact": contact });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** Update a customer profile */
  async updateCustomerProfile(company: string, contact: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/contacts/{contact}/customer-profile", { "company": company, "contact": contact });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** Update a supplier profile */
  async updateSupplierProfile(company: string, contact: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/contacts/{contact}/supplier-profile", { "company": company, "contact": contact });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** Verify a contact against the AEAT census */
  async verifyCensus(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/contacts/census-verification", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }
}
