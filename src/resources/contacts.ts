// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1ContactsActivitiesResponses, PublicApiV1ContactsArchiveResponses, PublicApiV1ContactsAssignContactRoleResponses, PublicApiV1ContactsBulkArchiveData, PublicApiV1ContactsBulkArchiveResponses, PublicApiV1ContactsBulkChangeContactRoleStatusData, PublicApiV1ContactsBulkChangeContactRoleStatusResponses, PublicApiV1ContactsBulkCreateData, PublicApiV1ContactsBulkCreateResponses, PublicApiV1ContactsBulkDeleteData, PublicApiV1ContactsBulkDeleteResponses, PublicApiV1ContactsChangeContactRoleStatusData, PublicApiV1ContactsChangeContactRoleStatusResponses, PublicApiV1ContactsCreateData, PublicApiV1ContactsCreateResponses, PublicApiV1ContactsDeleteResponses, PublicApiV1ContactsFindByExternalIdData, PublicApiV1ContactsFindByExternalIdResponses, PublicApiV1ContactsFindByTaxIdData, PublicApiV1ContactsFindByTaxIdResponses, PublicApiV1ContactsImportResponses, PublicApiV1ContactsImportTemplateResponses, PublicApiV1ContactsImportsShowResponses, PublicApiV1ContactsOptionsResponses, PublicApiV1ContactsPreviewImportResponses, PublicApiV1ContactsRemoveContactRoleResponses, PublicApiV1ContactsRestoreResponses, PublicApiV1ContactsShowResponses, PublicApiV1ContactsStatsResponses, PublicApiV1ContactsUpdateBankAccountsData, PublicApiV1ContactsUpdateBankAccountsResponses, PublicApiV1ContactsUpdateCustomerProfileData, PublicApiV1ContactsUpdateCustomerProfileResponses, PublicApiV1ContactsUpdateData, PublicApiV1ContactsUpdateResponses, PublicApiV1ContactsUpdateSupplierProfileData, PublicApiV1ContactsUpdateSupplierProfileResponses, PublicApiV1ContactsVerifyCensusData, PublicApiV1ContactsVerifyCensusResponses } from "../generated/types.gen.js";


export class ContactsImportsResource extends BaseResource {
  /** Download contact import errors */
  async errors(company: string, id: string, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/contacts/imports/{id}/errors.csv", { "company": company, "id": id });
    return this._binary(path, "GET", undefined, undefined, config);
  }

  /** Retrieve a contact import */
  async show(company: string, id: string, config?: RequestConfig): Promise<PublicApiV1ContactsImportsShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/contacts/imports/{id}", { "company": company, "id": id });
    return this._get<PublicApiV1ContactsImportsShowResponses[200]>(path, undefined, config);
  }
}

export class ContactsResource extends BaseResource {
  readonly imports: ContactsImportsResource;

  constructor(client: HttpClient) {
    super(client);
    this.imports = new ContactsImportsResource(client);
  }

  /** Archive a contact */
  async archive(company: string, contact: string, config?: RequestConfig): Promise<PublicApiV1ContactsArchiveResponses[200]> {
    const path = this.buildPath("/companies/{company}/contacts/{contact}/archive", { "company": company, "contact": contact });
    return this._send<PublicApiV1ContactsArchiveResponses[200]>("POST", path, undefined, config);
  }

  /** Assign a contact role */
  async assignContactRole(company: string, contact: string, role: string, config?: RequestConfig): Promise<PublicApiV1ContactsAssignContactRoleResponses[200]> {
    const path = this.buildPath("/companies/{company}/contacts/{contact}/roles/{role}", { "company": company, "contact": contact, "role": role });
    return this._send<PublicApiV1ContactsAssignContactRoleResponses[200]>("POST", path, undefined, config);
  }

  /** Remove a contact role */
  async removeContactRole(company: string, contact: string, role: string, config?: RequestConfig): Promise<PublicApiV1ContactsRemoveContactRoleResponses[200]> {
    const path = this.buildPath("/companies/{company}/contacts/{contact}/roles/{role}", { "company": company, "contact": contact, "role": role });
    return this._send<PublicApiV1ContactsRemoveContactRoleResponses[200]>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Archive contacts in bulk */
  async bulkArchive(company: string, body?: PublicApiV1ContactsBulkArchiveData["body"], config?: RequestConfig): Promise<PublicApiV1ContactsBulkArchiveResponses[200]> {
    const path = this.buildPath("/companies/{company}/contacts/bulk/archive", { "company": company });
    return this._send<PublicApiV1ContactsBulkArchiveResponses[200]>("POST", path, body, config);
  }

  /** Change contact role status in bulk */
  async bulkChangeContactRoleStatus(company: string, body?: PublicApiV1ContactsBulkChangeContactRoleStatusData["body"], config?: RequestConfig): Promise<PublicApiV1ContactsBulkChangeContactRoleStatusResponses[200]> {
    const path = this.buildPath("/companies/{company}/contacts/bulk/status", { "company": company });
    return this._send<PublicApiV1ContactsBulkChangeContactRoleStatusResponses[200]>("POST", path, body, config);
  }

  /** Create contacts in bulk */
  async bulkCreate(company: string, body?: PublicApiV1ContactsBulkCreateData["body"], config?: RequestConfig): Promise<PublicApiV1ContactsBulkCreateResponses[200]> {
    const path = this.buildPath("/companies/{company}/contacts/bulk-create", { "company": company });
    return this._send<PublicApiV1ContactsBulkCreateResponses[200]>("POST", path, body, config);
  }

  /** Delete contacts in bulk */
  async bulkDelete(company: string, body?: PublicApiV1ContactsBulkDeleteData["body"], config?: RequestConfig): Promise<PublicApiV1ContactsBulkDeleteResponses[200]> {
    const path = this.buildPath("/companies/{company}/contacts/bulk-delete", { "company": company });
    return this._send<PublicApiV1ContactsBulkDeleteResponses[200]>("POST", path, body, config);
  }

  /** Change a contact role status */
  async changeContactRoleStatus(company: string, contact: string, role: string, body?: PublicApiV1ContactsChangeContactRoleStatusData["body"], config?: RequestConfig): Promise<PublicApiV1ContactsChangeContactRoleStatusResponses[200]> {
    const path = this.buildPath("/companies/{company}/contacts/{contact}/roles/{role}/status", { "company": company, "contact": contact, "role": role });
    return this._send<PublicApiV1ContactsChangeContactRoleStatusResponses[200]>("PATCH", path, body, config);
  }

  /** Create a contact */
  async create(company: string, body?: PublicApiV1ContactsCreateData["body"], config?: RequestConfig): Promise<PublicApiV1ContactsCreateResponses[200 | 201]> {
    const path = this.buildPath("/companies/{company}/contacts", { "company": company });
    return this._send<PublicApiV1ContactsCreateResponses[200 | 201]>("POST", path, body, config);
  }

  /** List contacts */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/contacts", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Delete a contact */
  async delete(company: string, contact: string, config?: RequestConfig): Promise<PublicApiV1ContactsDeleteResponses[200]> {
    const path = this.buildPath("/companies/{company}/contacts/{contact}", { "company": company, "contact": contact });
    return this._send<PublicApiV1ContactsDeleteResponses[200]>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Retrieve a contact */
  async show(company: string, contact: string, config?: RequestConfig): Promise<PublicApiV1ContactsShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/contacts/{contact}", { "company": company, "contact": contact });
    return this._get<PublicApiV1ContactsShowResponses[200]>(path, undefined, config);
  }

  /** Update a contact */
  async update(company: string, contact: string, body?: PublicApiV1ContactsUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1ContactsUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/contacts/{contact}", { "company": company, "contact": contact });
    return this._send<PublicApiV1ContactsUpdateResponses[200]>("PATCH", path, body, config);
  }

  /** Download the contact import template */
  async importTemplate(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1ContactsImportTemplateResponses[200]> {
    const path = this.buildPath("/companies/{company}/contacts/import/template", { "company": company });
    return this._get<PublicApiV1ContactsImportTemplateResponses[200]>(path, params, config);
  }

  /** Find a contact by external ID */
  async findByExternalId(company: string, body?: PublicApiV1ContactsFindByExternalIdData["body"], config?: RequestConfig): Promise<PublicApiV1ContactsFindByExternalIdResponses[200]> {
    const path = this.buildPath("/companies/{company}/contacts/find-by-external-id", { "company": company });
    return this._send<PublicApiV1ContactsFindByExternalIdResponses[200]>("POST", path, body, config);
  }

  /** Find a contact by tax ID */
  async findByTaxId(company: string, body?: PublicApiV1ContactsFindByTaxIdData["body"], config?: RequestConfig): Promise<PublicApiV1ContactsFindByTaxIdResponses[200]> {
    const path = this.buildPath("/companies/{company}/contacts/find-by-tax-id", { "company": company });
    return this._send<PublicApiV1ContactsFindByTaxIdResponses[200]>("POST", path, body, config);
  }

  /** List contact activity */
  async activities(company: string, contact: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1ContactsActivitiesResponses[200]> {
    const path = this.buildPath("/companies/{company}/contacts/{contact}/activities", { "company": company, "contact": contact });
    return this._get<PublicApiV1ContactsActivitiesResponses[200]>(path, params, config);
  }

  /** List contact filter options */
  async options(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1ContactsOptionsResponses[200]> {
    const path = this.buildPath("/companies/{company}/contacts/options", { "company": company });
    return this._get<PublicApiV1ContactsOptionsResponses[200]>(path, params, config);
  }

  /** Get contact statistics */
  async stats(company: string, config?: RequestConfig): Promise<PublicApiV1ContactsStatsResponses[200]> {
    const path = this.buildPath("/companies/{company}/contacts/stats", { "company": company });
    return this._get<PublicApiV1ContactsStatsResponses[200]>(path, undefined, config);
  }

  /** Import contacts */
  async import(company: string, formData: FormData, config?: RequestConfig): Promise<PublicApiV1ContactsImportResponses[200 | 202]> {
    const path = this.buildPath("/companies/{company}/contacts/import", { "company": company });
    return this._sendForm<PublicApiV1ContactsImportResponses[200 | 202]>(path, formData, config);
  }

  /** Preview a contact import */
  async previewImport(company: string, formData: FormData, config?: RequestConfig): Promise<PublicApiV1ContactsPreviewImportResponses[200]> {
    const path = this.buildPath("/companies/{company}/contacts/import/preview", { "company": company });
    return this._sendForm<PublicApiV1ContactsPreviewImportResponses[200]>(path, formData, config);
  }

  /** Restore an archived contact */
  async restore(company: string, contact: string, config?: RequestConfig): Promise<PublicApiV1ContactsRestoreResponses[200]> {
    const path = this.buildPath("/companies/{company}/contacts/{contact}/restore", { "company": company, "contact": contact });
    return this._send<PublicApiV1ContactsRestoreResponses[200]>("POST", path, undefined, config);
  }

  /** Search contacts */
  async search(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/contacts/search", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Replace the bank accounts of a contact */
  async updateBankAccounts(company: string, contact: string, body?: PublicApiV1ContactsUpdateBankAccountsData["body"], config?: RequestConfig): Promise<PublicApiV1ContactsUpdateBankAccountsResponses[200]> {
    const path = this.buildPath("/companies/{company}/contacts/{contact}/bank-accounts", { "company": company, "contact": contact });
    return this._send<PublicApiV1ContactsUpdateBankAccountsResponses[200]>("PATCH", path, body, config);
  }

  /** Update a customer profile */
  async updateCustomerProfile(company: string, contact: string, body?: PublicApiV1ContactsUpdateCustomerProfileData["body"], config?: RequestConfig): Promise<PublicApiV1ContactsUpdateCustomerProfileResponses[200]> {
    const path = this.buildPath("/companies/{company}/contacts/{contact}/customer-profile", { "company": company, "contact": contact });
    return this._send<PublicApiV1ContactsUpdateCustomerProfileResponses[200]>("PATCH", path, body, config);
  }

  /** Update a supplier profile */
  async updateSupplierProfile(company: string, contact: string, body?: PublicApiV1ContactsUpdateSupplierProfileData["body"], config?: RequestConfig): Promise<PublicApiV1ContactsUpdateSupplierProfileResponses[200]> {
    const path = this.buildPath("/companies/{company}/contacts/{contact}/supplier-profile", { "company": company, "contact": contact });
    return this._send<PublicApiV1ContactsUpdateSupplierProfileResponses[200]>("PATCH", path, body, config);
  }

  /** Verify a contact against the AEAT census */
  async verifyCensus(company: string, body?: PublicApiV1ContactsVerifyCensusData["body"], config?: RequestConfig): Promise<PublicApiV1ContactsVerifyCensusResponses[200]> {
    const path = this.buildPath("/companies/{company}/contacts/census-verification", { "company": company });
    return this._send<PublicApiV1ContactsVerifyCensusResponses[200]>("POST", path, body, config);
  }
}
