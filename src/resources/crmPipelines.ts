// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


import type * as NativeApi from "../generated/types.gen.js";

export class CrmPipelinesResource extends BaseResource {
  /** Archivar etapa */
  async archivePipelineStage(pipeline: string, stage: string, body: NativeApi.ArchivePipelineStageData["body"], config?: RequestConfig): Promise<NativeApi.ArchivePipelineStageResponse> {
    const path = this.buildPath("/crm/pipelines/{pipeline}/stages/{stage}/archive", { "pipeline": pipeline, "stage": stage });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.ArchivePipelineStageResponse>("POST", path, body, config);
  }

  /** Archivar embudo */
  async archivePipeline(pipeline: string, body: NativeApi.ArchivePipelineData["body"], config?: RequestConfig): Promise<NativeApi.ArchivePipelineResponse> {
    const path = this.buildPath("/crm/pipelines/{pipeline}/archive", { "pipeline": pipeline });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.ArchivePipelineResponse>("POST", path, body, config);
  }

  /** Crear guía de etapa */
  async createCrmStagePlaybook(stage: string, body: NativeApi.CreateCrmStagePlaybookData["body"], config?: RequestConfig): Promise<NativeApi.CreateCrmStagePlaybookResponse> {
    const path = this.buildPath("/crm/stages/{stage}/playbook", { "stage": stage });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CreateCrmStagePlaybookResponse>("POST", path, body, config);
  }

  /** Consultar guía de etapa */
  async findCrmStagePlaybook(stage: string, params?: NativeApi.FindCrmStagePlaybookData["query"], config?: RequestConfig): Promise<NativeApi.FindCrmStagePlaybookResponse> {
    const path = this.buildPath("/crm/stages/{stage}/playbook", { "stage": stage });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.FindCrmStagePlaybookResponse>(path, params, config);
  }

  /** Guardar guía de etapa */
  async saveCrmStagePlaybook(stage: string, body: NativeApi.SaveCrmStagePlaybookData["body"], config?: RequestConfig): Promise<NativeApi.SaveCrmStagePlaybookResponse> {
    const path = this.buildPath("/crm/stages/{stage}/playbook", { "stage": stage });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.SaveCrmStagePlaybookResponse>("PUT", path, body, config);
  }

  /** Crear embudo */
  async createPipeline(body: NativeApi.CreatePipelineData["body"], config?: RequestConfig): Promise<NativeApi.CreatePipelineResponse> {
    const path = "/crm/pipelines";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CreatePipelineResponse>("POST", path, body, config);
  }

  /** Listar embudos */
  async listPipelines(params?: NativeApi.ListPipelinesData["query"], config?: RequestConfig): Promise<NativeApi.ListPipelinesResponse> {
    const path = "/crm/pipelines";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.ListPipelinesResponse>(path, params, config);
  }

  /** Consultar embudo */
  async getPipeline(pipeline: string, params?: NativeApi.GetPipelineData["query"], config?: RequestConfig): Promise<NativeApi.GetPipelineResponse> {
    const path = this.buildPath("/crm/pipelines/{pipeline}", { "pipeline": pipeline });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.GetPipelineResponse>(path, params, config);
  }

  /** Editar embudo */
  async updatePipeline(pipeline: string, body: NativeApi.UpdatePipelineData["body"], config?: RequestConfig): Promise<NativeApi.UpdatePipelineResponse> {
    const path = this.buildPath("/crm/pipelines/{pipeline}", { "pipeline": pipeline });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.UpdatePipelineResponse>("PATCH", path, body, config);
  }

  /** Previsualizar archivo */
  async previewStageRemap(pipeline: string, body: NativeApi.PreviewStageRemapData["body"], config?: RequestConfig): Promise<NativeApi.PreviewStageRemapResponse> {
    const path = this.buildPath("/crm/pipelines/{pipeline}/archive-preview", { "pipeline": pipeline });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.PreviewStageRemapResponse>("POST", path, body, config);
  }

  /** Publicar guía de etapa */
  async publishCrmStagePlaybook(stage: string, body: NativeApi.PublishCrmStagePlaybookData["body"], config?: RequestConfig): Promise<NativeApi.PublishCrmStagePlaybookResponse> {
    const path = this.buildPath("/crm/stages/{stage}/playbook/publish", { "stage": stage });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.PublishCrmStagePlaybookResponse>("POST", path, body, config);
  }

  /** Ordenar etapas */
  async reorderPipelineStages(pipeline: string, body: NativeApi.ReorderPipelineStagesData["body"], config?: RequestConfig): Promise<NativeApi.ReorderPipelineStagesResponse> {
    const path = this.buildPath("/crm/pipelines/{pipeline}/stages/order", { "pipeline": pipeline });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.ReorderPipelineStagesResponse>("PUT", path, body, config);
  }

  /** Guardar motivo de pérdida */
  async saveLossReason(pipeline: string, body: NativeApi.SaveLossReasonData["body"], config?: RequestConfig): Promise<NativeApi.SaveLossReasonResponse> {
    const path = this.buildPath("/crm/pipelines/{pipeline}/loss-reasons/save", { "pipeline": pipeline });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.SaveLossReasonResponse>("POST", path, body, config);
  }

  /** Guardar etapa */
  async savePipelineStage(pipeline: string, body: NativeApi.SavePipelineStageData["body"], config?: RequestConfig): Promise<NativeApi.SavePipelineStageResponse> {
    const path = this.buildPath("/crm/pipelines/{pipeline}/stages/save", { "pipeline": pipeline });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.SavePipelineStageResponse>("POST", path, body, config);
  }

  /** Configurar salud de etapa */
  async saveStageHealthConfiguration(pipeline: string, stage: string, body: NativeApi.SaveStageHealthConfigurationData["body"], config?: RequestConfig): Promise<NativeApi.SaveStageHealthConfigurationResponse> {
    const path = this.buildPath("/crm/pipelines/{pipeline}/stages/{stage}/health-configuration", { "pipeline": pipeline, "stage": stage });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.SaveStageHealthConfigurationResponse>("PUT", path, body, config);
  }
}
