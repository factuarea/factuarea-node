// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


import type * as NativeApi from "../generated/types.gen.js";

export class CrmTaskLinksResource extends BaseResource {
  /** Crear y vincular una tarea canónica */
  async crmCreateLinkedCrmTask(body: NativeApi.CrmCreateLinkedCrmTaskData["body"], config?: RequestConfig): Promise<NativeApi.CrmCreateLinkedCrmTaskResponse> {
    const path = "/crm/task-links";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmCreateLinkedCrmTaskResponse>("POST", path, body, config);
  }

  /** Listar tareas vinculadas a un registro CRM */
  async crmListLinkedCrmTasks(params: NativeApi.CrmListLinkedCrmTasksData["query"], config?: RequestConfig): Promise<NativeApi.CrmListLinkedCrmTasksResponse> {
    const path = "/crm/task-links";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmListLinkedCrmTasksResponse>(path, params, config);
  }

  /** Consultar acciones disponibles de tareas vinculadas */
  async crmGetCrmTaskActionAvailability(params: NativeApi.CrmGetCrmTaskActionAvailabilityData["query"], config?: RequestConfig): Promise<NativeApi.CrmGetCrmTaskActionAvailabilityResponse> {
    const path = "/crm/task-links/availability";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmGetCrmTaskActionAvailabilityResponse>(path, params, config);
  }

  /** Desvincular una tarea de un registro CRM */
  async crmUnlinkCrmTask(task: string, link: string, body: NativeApi.CrmUnlinkCrmTaskData["body"], config?: RequestConfig): Promise<NativeApi.CrmUnlinkCrmTaskResponse> {
    const path = this.buildPath("/crm/task-links/{task}/links/{link}", { "task": task, "link": link });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmUnlinkCrmTaskResponse>("DELETE", path, body, config);
  }

  /** Editar una tarea canónica vinculada */
  async crmUpdateLinkedCrmTask(task: string, body: NativeApi.CrmUpdateLinkedCrmTaskData["body"], config?: RequestConfig): Promise<NativeApi.CrmUpdateLinkedCrmTaskResponse> {
    const path = this.buildPath("/crm/task-links/{task}", { "task": task });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmUpdateLinkedCrmTaskResponse>("PATCH", path, body, config);
  }
}
