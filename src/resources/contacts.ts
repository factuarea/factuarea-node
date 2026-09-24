// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class ContactsResource extends BaseResource {
  /** Archive a contact */
  async archive(contact: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/contacts/{contact}/archive", { "contact": contact });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Assign a contact role */
  async assignContactRole(contact: string, role: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/contacts/{contact}/roles/{role}", { "contact": contact, "role": role });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Remove a contact role */
  async removeContactRole(contact: string, role: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/contacts/{contact}/roles/{role}", { "contact": contact, "role": role });
    return this._delete<unknown>(path, params, config, { idempotent: true });
  }

  /** Archive contacts in bulk */
  async bulkArchive(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/contacts/bulk/archive";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Change contact role status in bulk */
  async bulkChangeContactRoleStatus(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/contacts/bulk/status";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Create contacts in bulk */
  async bulkCreate(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/contacts/bulk-create";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Delete contacts in bulk */
  async bulkDelete(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/contacts/bulk-delete";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Change a contact role status */
  async changeContactRoleStatus(contact: string, role: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/contacts/{contact}/roles/{role}/status", { "contact": contact, "role": role });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** Create a contact */
  async create(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/contacts";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List contacts */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/contacts", params, "starting_after", config);
  }

  /** Delete a contact */
  async delete(contact: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/contacts/{contact}", { "contact": contact });
    return this._send<unknown>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Retrieve a contact */
  async show(contact: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/contacts/{contact}", { "contact": contact });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a contact */
  async update(contact: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/contacts/{contact}", { "contact": contact });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** Download the contact import template */
  async importTemplate(config?: RequestConfig): Promise<unknown> {
    const path = "/contacts/import/template";
    return this._get<unknown>(path, undefined, config);
  }

  /** Find a contact by external ID */
  async findByExternalId(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/contacts/find-by-external-id";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Find a contact by tax ID */
  async findByTaxId(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/contacts/find-by-tax-id";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List contact activity */
  async activities(contact: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/contacts/{contact}/activities", { "contact": contact });
    return this._get<unknown>(path, params, config);
  }

  /** List contact filter options */
  async options(params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = "/contacts/options";
    return this._get<unknown>(path, params, config);
  }

  /** Get contact statistics */
  async stats(config?: RequestConfig): Promise<unknown> {
    const path = "/contacts/stats";
    return this._get<unknown>(path, undefined, config);
  }

  /** Import contacts */
  async import(formData: FormData, config?: RequestConfig): Promise<unknown> {
    const path = "/contacts/import";
    return this._sendForm<unknown>(path, formData, config);
  }

  /** Preview a contact import */
  async previewImport(formData: FormData, config?: RequestConfig): Promise<unknown> {
    const path = "/contacts/import/preview";
    return this._sendForm<unknown>(path, formData, config);
  }

  /** Restore an archived contact */
  async restore(contact: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/contacts/{contact}/restore", { "contact": contact });
    return this._send<unknown>("PUT", path, undefined, config);
  }

  /** Search contacts */
  async search(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/contacts/search", params, "starting_after", config);
  }

  /** Replace the bank accounts of a contact */
  async updateBankAccounts(contact: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/contacts/{contact}/bank-accounts", { "contact": contact });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** Update a customer profile */
  async updateCustomerProfile(contact: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/contacts/{contact}/customer-profile", { "contact": contact });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** Update a supplier profile */
  async updateSupplierProfile(contact: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/contacts/{contact}/supplier-profile", { "contact": contact });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** Verify a contact against the AEAT census */
  async verifyCensus(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/contacts/census-verification";
    return this._send<unknown>("POST", path, body, config);
  }
}
