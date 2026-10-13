// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


import type * as NativeApi from "../generated/types.gen.js";

export class AutomationResource extends BaseResource {
  /** Cancel CRM sequence */
  async cancel(enrolment: string, body: NativeApi.V1CrmSequencesCancelData["body"], config?: RequestConfig): Promise<NativeApi.V1CrmSequencesCancelResponse> {
    const path = this.buildPath("/crm/crmsequence/enrolments/{enrolment}/cancel", { "enrolment": enrolment });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.V1CrmSequencesCancelResponse>("PATCH", path, body, config);
  }

  /** Enrol CRM sequence */
  async enrol(sequence: string, body: NativeApi.V1CrmSequencesEnrolData["body"], config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.V1CrmSequencesEnrolResponse> {
    const path = this.buildPath("/crm/crmsequence/{sequence}/enrolments", { "sequence": sequence });
    config = this._nativeConfig(config, true);
    return this._sendNative<NativeApi.V1CrmSequencesEnrolResponse>("POST", path, body, config);
  }

  /** Original Enrol CRM sequence */
  async originalEnrol(config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.V1CrmSequencesOriginalEnrolResponse> {
    const path = "/crm/crmsequence/enrolments/original";
    config = this._nativeConfig(config, true);
    return this._get<NativeApi.V1CrmSequencesOriginalEnrolResponse>(path, undefined, config);
  }

  /** Original Save CRM sequence */
  async originalSave(config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.V1CrmSequencesOriginalSaveResponse> {
    const path = "/crm/crmsequence/original";
    config = this._nativeConfig(config, true);
    return this._get<NativeApi.V1CrmSequencesOriginalSaveResponse>(path, undefined, config);
  }

  /** List CRM sequence */
  async list(params: NativeApi.V1CrmSequencesListData["query"], config?: RequestConfig): Promise<NativeApi.V1CrmSequencesListResponse> {
    const path = "/crm/crmsequence";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.V1CrmSequencesListResponse>(path, params, config);
  }

  /** Save CRM sequence */
  async saveNew(body: NativeApi.V1CrmSequencesSaveNewData["body"], config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.V1CrmSequencesSaveNewResponse> {
    const path = "/crm/crmsequence";
    config = this._nativeConfig(config, true);
    return this._sendNative<NativeApi.V1CrmSequencesSaveNewResponse>("POST", path, body, config);
  }

  /** Pause CRM sequence */
  async pause(enrolment: string, body: NativeApi.V1CrmSequencesPauseData["body"], config?: RequestConfig): Promise<NativeApi.V1CrmSequencesPauseResponse> {
    const path = this.buildPath("/crm/crmsequence/enrolments/{enrolment}/pause", { "enrolment": enrolment });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.V1CrmSequencesPauseResponse>("PATCH", path, body, config);
  }

  /** Preview CRM sequence */
  async preview(sequence: string, params: NativeApi.V1CrmSequencesPreviewData["query"], config?: RequestConfig): Promise<NativeApi.V1CrmSequencesPreviewResponse> {
    const path = this.buildPath("/crm/crmsequence/{sequence}/preview", { "sequence": sequence });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.V1CrmSequencesPreviewResponse>(path, params, config);
  }

  /** Resume CRM sequence */
  async resume(enrolment: string, body: NativeApi.V1CrmSequencesResumeData["body"], config?: RequestConfig): Promise<NativeApi.V1CrmSequencesResumeResponse> {
    const path = this.buildPath("/crm/crmsequence/enrolments/{enrolment}/resume", { "enrolment": enrolment });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.V1CrmSequencesResumeResponse>("PATCH", path, body, config);
  }

  /** Save CRM sequence */
  async saveExisting(sequence: string, body: NativeApi.V1CrmSequencesSaveExistingData["body"], config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.V1CrmSequencesSaveExistingResponse> {
    const path = this.buildPath("/crm/crmsequence/{sequence}", { "sequence": sequence });
    config = this._nativeConfig(config, true);
    return this._sendNative<NativeApi.V1CrmSequencesSaveExistingResponse>("POST", path, body, config);
  }
}
