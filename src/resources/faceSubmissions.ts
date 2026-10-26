// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1FaceSubmissionsCancelData, PublicApiV1FaceSubmissionsCancelResponses, PublicApiV1FaceSubmissionsShowResponses } from "../generated/types.gen.js";


export class FaceSubmissionsResource extends BaseResource {
  /**
   * Request FACe submission cancellation
   * Never retried automatically: asks FACe (a third party) to cancel the submission: a repeated call can cancel twice.
   */
  async cancel(company: string, faceSubmission: string, body?: PublicApiV1FaceSubmissionsCancelData["body"], config?: RequestConfig): Promise<PublicApiV1FaceSubmissionsCancelResponses[200]> {
    const path = this.buildPath("/companies/{company}/face-submissions/{faceSubmission}/cancel", { "company": company, "faceSubmission": faceSubmission });
    return this._send<PublicApiV1FaceSubmissionsCancelResponses[200]>("POST", path, body, config, { noRetry: true });
  }

  /** Retrieve a durable FACe attempt */
  async show(company: string, faceSubmission: string, config?: RequestConfig): Promise<PublicApiV1FaceSubmissionsShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/face-submissions/{faceSubmission}", { "company": company, "faceSubmission": faceSubmission });
    return this._get<PublicApiV1FaceSubmissionsShowResponses[200]>(path, undefined, config);
  }
}
