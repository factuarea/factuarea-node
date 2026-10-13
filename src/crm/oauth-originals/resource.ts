import { HttpClient, type ApiResponse } from "../../core/http-client.js";
import { CrmOriginalIntent } from "./intent.js";
import { decodeCredentialContext, decodeOriginal, type CrmCredentialContext, type CrmOriginalEnvelope } from "./types.js";
export class CrmOAuthOriginalsResource {
  constructor(private readonly http: HttpClient) {}
  /** Actual OAuth bearer only. Environment and permissions come from the native issuer. */
  async credentialContext(signal?: AbortSignal): Promise<ApiResponse<{ data: CrmCredentialContext }>> {
    if (this.http.authModel !== "oauth") throw new TypeError("Credential context requires native OAuth authentication.");
    const response = await this.http.request<unknown>({ method: "GET", path: "/crm/credential-context", signal, maxRetries: 0, noRedirects: true });
    return { ...response, data: { data: decodeCredentialContext(response.data) } };
  }
  getLeadCreateOriginal(key: string, firstBody: string, signal?: AbortSignal) { return this.recover(CrmOriginalIntent.capture("leadCreate", key, firstBody), signal); }
  getOpportunityCreateOriginal(key: string, firstBody: string, signal?: AbortSignal) { return this.recover(CrmOriginalIntent.capture("opportunityCreate", key, firstBody), signal); }
  getOpportunityStageOriginal(opportunity: string, key: string, firstBody: string, signal?: AbortSignal) { return this.recover(CrmOriginalIntent.capture("opportunityStage", key, firstBody, opportunity), signal); }
  getActivityCreateOriginal(key: string, firstBody: string, signal?: AbortSignal) { return this.recover(CrmOriginalIntent.capture("activityCreate", key, firstBody), signal); }
  /** GET only, with the current credential. The server proves authentic refresh ancestry or the API-key singleton. */
  async recover(intent: CrmOriginalIntent, signal?: AbortSignal): Promise<ApiResponse<CrmOriginalEnvelope>> {
    if (!(intent instanceof CrmOriginalIntent)) throw new TypeError("A retained original intent is required.");
    const response = await this.http.request<unknown>({ method: "GET", path: intent.path,
      query: { original_body_sha256: intent.originalBodySha256 }, idempotencyKey: intent.idempotencyKey,
      signal, maxRetries: 0, noRedirects: true });
    return { ...response, data: decodeOriginal(response.data, intent.originalBodySha256) };
  }
}
