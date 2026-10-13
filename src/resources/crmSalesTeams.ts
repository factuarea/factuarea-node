// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


import type * as NativeApi from "../generated/types.gen.js";

export class CrmSalesTeamsResource extends BaseResource {
  /** Archive a sales team */
  async crmArchiveSalesTeam(team: string, body: NativeApi.CrmArchiveSalesTeamData["body"], config?: RequestConfig): Promise<NativeApi.CrmArchiveSalesTeamResponse> {
    const path = this.buildPath("/crm/sales-teams/{team}/archive", { "team": team });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmArchiveSalesTeamResponse>("POST", path, body, config);
  }

  /** Create a sales team */
  async crmCreateSalesTeam(body: NativeApi.CrmCreateSalesTeamData["body"], config?: RequestConfig): Promise<NativeApi.CrmCreateSalesTeamResponse> {
    const path = "/crm/sales-teams";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmCreateSalesTeamResponse>("POST", path, body, config);
  }

  /** List sales teams */
  async crmListSalesTeams(params?: NativeApi.CrmListSalesTeamsData["query"], config?: RequestConfig): Promise<NativeApi.CrmListSalesTeamsResponse> {
    const path = "/crm/sales-teams";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmListSalesTeamsResponse>(path, params, config);
  }

  /** Retrieve a sales team */
  async crmGetSalesTeam(team: string, config?: RequestConfig): Promise<NativeApi.CrmGetSalesTeamResponse> {
    const path = this.buildPath("/crm/sales-teams/{team}", { "team": team });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmGetSalesTeamResponse>(path, undefined, config);
  }

  /** Update a sales team */
  async crmUpdateSalesTeam(team: string, body: NativeApi.CrmUpdateSalesTeamData["body"], config?: RequestConfig): Promise<NativeApi.CrmUpdateSalesTeamResponse> {
    const path = this.buildPath("/crm/sales-teams/{team}", { "team": team });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmUpdateSalesTeamResponse>("PATCH", path, body, config);
  }

  /** Set a sales team member */
  async crmSetSalesTeamMember(team: string, user: string, body: NativeApi.CrmSetSalesTeamMemberData["body"], config?: RequestConfig): Promise<NativeApi.CrmSetSalesTeamMemberResponse> {
    const path = this.buildPath("/crm/sales-teams/{team}/members/{user}", { "team": team, "user": user });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmSetSalesTeamMemberResponse>("PUT", path, body, config);
  }
}
