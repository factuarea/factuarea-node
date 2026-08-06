// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class FaceSubmissionsResource extends BaseResource {
  /** Request FACe submission cancellation */
  async cancel(faceSubmission: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/face-submissions/{faceSubmission}/cancel", { "faceSubmission": faceSubmission });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Retrieve a FACe submission */
  async show(faceSubmission: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/face-submissions/{faceSubmission}", { "faceSubmission": faceSubmission });
    return this._get<unknown>(path, undefined, config);
  }
}
