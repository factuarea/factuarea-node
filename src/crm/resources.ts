// AUTO-GENERATED from spec/crm-native77.json. Run npm run generate:crm.
import { CrmBaseResource, type CrmRequestConfig, type CrmConfirmedRequestConfig, type CrmOriginalKeyRequestConfig, type CrmConfirmedOriginalKeyRequestConfig } from "./resource.js";
import type { HttpClient } from "../core/http-client.js";
import type { CrmNumberPage, CrmCursorPage, CrmKnowledgePage } from "./pagination.js";
import type { KnowledgeCategorySaveIntent, PublicHelpCenterPublishIntent } from "./intents.js";
import type * as T from "./generated/types.gen.js";


export class CrmContactPeopleResource extends CrmBaseResource {
  /** Archive a CRM contact person or organization (crmContactPeopleArchive). */
  async archive(person: string, body: T.CrmContactPeopleArchiveData["body"], config: CrmConfirmedRequestConfig): Promise<T.CrmContactPeopleArchiveResponses[keyof T.CrmContactPeopleArchiveResponses]> {
    const path = this.buildPath("/crm/contact-people/{person}/archive", { "person": person });
    this.requireHumanConfirmation(config);
    return this.sendCrm<T.CrmContactPeopleArchiveResponses[keyof T.CrmContactPeopleArchiveResponses]>("POST", path, body, config, true, "crmContactPeopleArchive");
  }

  /** Create a CRM contact person or organization (crmContactPeopleCreate). */
  async create(body: T.CrmContactPeopleCreateData["body"], config?: CrmRequestConfig): Promise<T.CrmContactPeopleCreateResponses[keyof T.CrmContactPeopleCreateResponses]> {
    const path = "/crm/contact-people";
    return this.sendCrm<T.CrmContactPeopleCreateResponses[keyof T.CrmContactPeopleCreateResponses]>("POST", path, body, config, true, "crmContactPeopleCreate");
  }

  /** List CRM contact people and organizations (crmContactPeopleIndex). */
  async list(params?: NonNullable<T.CrmContactPeopleIndexData["query"]>, config?: CrmRequestConfig): Promise<CrmNumberPage<T.CrmContactPersonListItem>> {
    const path = "/crm/contact-people";
    return this.numberPage<T.CrmContactPersonListItem>(path, params, config);
  }

  /** Find visible CRM contact duplicate suggestions (crmContactPeopleDuplicates). */
  async duplicates(person: string, params?: NonNullable<T.CrmContactPeopleDuplicatesData["query"]>, config?: CrmRequestConfig): Promise<CrmNumberPage<T.CrmContactPersonDuplicate>> {
    const path = this.buildPath("/crm/contact-people/{person}/duplicates", { "person": person });
    return this.numberPage<T.CrmContactPersonDuplicate>(path, params, config);
  }

  /** Retrieve a CRM contact person or organization (crmContactPeopleShow). */
  async show(person: string, params?: NonNullable<T.CrmContactPeopleShowData["query"]>, config?: CrmRequestConfig): Promise<T.CrmContactPeopleShowResponses[keyof T.CrmContactPeopleShowResponses]> {
    const path = this.buildPath("/crm/contact-people/{person}", { "person": person });
    return this.getCrm<T.CrmContactPeopleShowResponses[keyof T.CrmContactPeopleShowResponses]>(path, params, config);
  }

  /** Update a CRM contact person or organization (crmContactPeopleUpdate). */
  async update(person: string, body: T.CrmContactPeopleUpdateData["body"], config?: CrmRequestConfig): Promise<T.CrmContactPeopleUpdateResponses[keyof T.CrmContactPeopleUpdateResponses]> {
    const path = this.buildPath("/crm/contact-people/{person}", { "person": person });
    return this.sendCrm<T.CrmContactPeopleUpdateResponses[keyof T.CrmContactPeopleUpdateResponses]>("PATCH", path, body, config, true, "crmContactPeopleUpdate");
  }

  /** List authorized CRM contact relationship options (crmContactPeopleOptions). */
  async options(params: NonNullable<T.CrmContactPeopleOptionsData["query"]>, config?: CrmRequestConfig): Promise<CrmNumberPage<T.CrmContactRelationshipOption>> {
    const path = "/crm/contact-people/options";
    return this.numberPage<T.CrmContactRelationshipOption>(path, params, config);
  }

  /** Merge CRM contact people or organizations (crmContactPeopleMerge). */
  async merge(body: T.CrmContactPeopleMergeData["body"], config: CrmConfirmedRequestConfig): Promise<T.CrmContactPeopleMergeResponses[keyof T.CrmContactPeopleMergeResponses]> {
    const path = "/crm/contact-people/merge";
    this.requireHumanConfirmation(config);
    return this.sendCrm<T.CrmContactPeopleMergeResponses[keyof T.CrmContactPeopleMergeResponses]>("POST", path, body, config, true, "crmContactPeopleMerge");
  }

  /** Preview CRM contact normalization (crmContactPeopleNormalize). */
  async normalize(body: T.CrmContactPeopleNormalizeData["body"], config?: CrmRequestConfig): Promise<T.CrmContactPeopleNormalizeResponses[keyof T.CrmContactPeopleNormalizeResponses]> {
    const path = "/crm/contact-people/normalization-preview";
    return this.sendCrm<T.CrmContactPeopleNormalizeResponses[keyof T.CrmContactPeopleNormalizeResponses]>("POST", path, body, config, false, "crmContactPeopleNormalize");
  }

  /** Preview a CRM contact people merge (crmContactPeopleMergePreview). */
  async mergePreview(body: T.CrmContactPeopleMergePreviewData["body"], config?: CrmRequestConfig): Promise<T.CrmContactPeopleMergePreviewResponses[keyof T.CrmContactPeopleMergePreviewResponses]> {
    const path = "/crm/contact-people/merge-preview";
    return this.sendCrm<T.CrmContactPeopleMergePreviewResponses[keyof T.CrmContactPeopleMergePreviewResponses]>("POST", path, body, config, false, "crmContactPeopleMergePreview");
  }

  /** Replace CRM contact relationships (crmContactPeopleRelationships). */
  async relationships(person: string, body: T.CrmContactPeopleRelationshipsData["body"], config?: CrmRequestConfig): Promise<T.CrmContactPeopleRelationshipsResponses[keyof T.CrmContactPeopleRelationshipsResponses]> {
    const path = this.buildPath("/crm/contact-people/{person}/relationships", { "person": person });
    return this.sendCrm<T.CrmContactPeopleRelationshipsResponses[keyof T.CrmContactPeopleRelationshipsResponses]>("PUT", path, body, config, true, "crmContactPeopleRelationships");
  }
}

export class CrmLeadsResource extends CrmBaseResource {
  /** Apply Lead Score Recalculation (crmApplyLeadScoreRecalculation). */
  async applyScoreRecalculation(run: string, body: T.CrmApplyLeadScoreRecalculationData["body"], config?: CrmRequestConfig): Promise<T.CrmApplyLeadScoreRecalculationResponses[keyof T.CrmApplyLeadScoreRecalculationResponses]> {
    const path = this.buildPath("/crm/lead-score-runs/{run}/apply", { "run": run });
    return this.sendCrm<T.CrmApplyLeadScoreRecalculationResponses[keyof T.CrmApplyLeadScoreRecalculationResponses]>("POST", path, body, config, true, "crmApplyLeadScoreRecalculation");
  }

  /** Assign Lead (crmAssignLead). */
  async assign(lead: string, body: T.CrmAssignLeadData["body"], config?: CrmRequestConfig): Promise<T.CrmAssignLeadResponses[keyof T.CrmAssignLeadResponses]> {
    const path = this.buildPath("/crm/leads/{lead}/owner", { "lead": lead });
    return this.sendCrm<T.CrmAssignLeadResponses[keyof T.CrmAssignLeadResponses]>("PUT", path, body, config, true, "crmAssignLead");
  }

  /** Change Lead Stage (crmChangeLeadStage). */
  async stage(lead: string, body: T.CrmChangeLeadStageData["body"], config?: CrmRequestConfig): Promise<T.CrmChangeLeadStageResponses[keyof T.CrmChangeLeadStageResponses]> {
    const path = this.buildPath("/crm/leads/{lead}/stage", { "lead": lead });
    return this.sendCrm<T.CrmChangeLeadStageResponses[keyof T.CrmChangeLeadStageResponses]>("PUT", path, body, config, true, "crmChangeLeadStage");
  }

  /** Convert Lead (crmConvertLead). */
  async convert(lead: string, body: T.CrmConvertLeadData["body"], config?: CrmRequestConfig): Promise<T.CrmConvertLeadResponses[keyof T.CrmConvertLeadResponses]> {
    const path = this.buildPath("/crm/leads/{lead}/convert", { "lead": lead });
    return this.sendCrm<T.CrmConvertLeadResponses[keyof T.CrmConvertLeadResponses]>("POST", path, body, config, true, "crmConvertLead");
  }

  /** Create Lead (crmCreateLead). */
  async create(body: T.CrmCreateLeadData["body"], config?: CrmRequestConfig): Promise<T.CrmCreateLeadResponses[keyof T.CrmCreateLeadResponses]> {
    const path = "/crm/leads";
    return this.sendCrm<T.CrmCreateLeadResponses[keyof T.CrmCreateLeadResponses]>("POST", path, body, config, true, "crmCreateLead");
  }

  /** List Leads (crmListLeads). */
  async list(params?: NonNullable<T.CrmListLeadsData["query"]>, config?: CrmRequestConfig): Promise<CrmCursorPage<T.Lead>> {
    const path = "/crm/leads";
    return this.cursorPage<T.Lead>(path, params, "data", config);
  }

  /** Delete Lead (crmDeleteLead). */
  async delete(lead: string, body: T.CrmDeleteLeadData["body"], config?: CrmRequestConfig): Promise<T.CrmDeleteLeadResponses[keyof T.CrmDeleteLeadResponses]> {
    const path = this.buildPath("/crm/leads/{lead}", { "lead": lead });
    return this.sendCrm<T.CrmDeleteLeadResponses[keyof T.CrmDeleteLeadResponses]>("DELETE", path, body, config, true, "crmDeleteLead");
  }

  /** Find Lead (crmFindLead). */
  async show(lead: string, config?: CrmRequestConfig): Promise<T.CrmFindLeadResponses[keyof T.CrmFindLeadResponses]> {
    const path = this.buildPath("/crm/leads/{lead}", { "lead": lead });
    return this.getCrm<T.CrmFindLeadResponses[keyof T.CrmFindLeadResponses]>(path, undefined, config);
  }

  /** Update Lead (crmUpdateLead). */
  async update(lead: string, body: T.CrmUpdateLeadData["body"], config?: CrmRequestConfig): Promise<T.CrmUpdateLeadResponses[keyof T.CrmUpdateLeadResponses]> {
    const path = this.buildPath("/crm/leads/{lead}", { "lead": lead });
    return this.sendCrm<T.CrmUpdateLeadResponses[keyof T.CrmUpdateLeadResponses]>("PATCH", path, body, config, true, "crmUpdateLead");
  }

  /** Disqualify Lead (crmDisqualifyLead). */
  async disqualify(lead: string, body: T.CrmDisqualifyLeadData["body"], config?: CrmRequestConfig): Promise<T.CrmDisqualifyLeadResponses[keyof T.CrmDisqualifyLeadResponses]> {
    const path = this.buildPath("/crm/leads/{lead}/disqualify", { "lead": lead });
    return this.sendCrm<T.CrmDisqualifyLeadResponses[keyof T.CrmDisqualifyLeadResponses]>("POST", path, body, config, true, "crmDisqualifyLead");
  }

  /** Export Lead Data (crmExportLeadData). */
  async export(lead: string, config?: CrmRequestConfig): Promise<T.CrmExportLeadDataResponses[keyof T.CrmExportLeadDataResponses]> {
    const path = this.buildPath("/crm/leads/{lead}/export", { "lead": lead });
    return this.getCrm<T.CrmExportLeadDataResponses[keyof T.CrmExportLeadDataResponses]>(path, undefined, config);
  }

  /** Find Lead Duplicates (crmFindLeadDuplicates). */
  async duplicates(lead: string, params?: NonNullable<T.CrmFindLeadDuplicatesData["query"]>, config?: CrmRequestConfig): Promise<CrmCursorPage<T.LeadDuplicate>> {
    const path = this.buildPath("/crm/leads/{lead}/duplicates", { "lead": lead });
    return this.cursorPage<T.LeadDuplicate>(path, params, "data", config);
  }

  /** Find Lead Score Recalculation Run (crmFindLeadScoreRecalculationRun). */
  async findScoreRecalculationRun(run: string, params?: NonNullable<T.CrmFindLeadScoreRecalculationRunData["query"]>, config?: CrmRequestConfig): Promise<T.CrmFindLeadScoreRecalculationRunResponses[keyof T.CrmFindLeadScoreRecalculationRunResponses]> {
    const path = this.buildPath("/crm/lead-score-runs/{run}", { "run": run });
    return this.getCrm<T.CrmFindLeadScoreRecalculationRunResponses[keyof T.CrmFindLeadScoreRecalculationRunResponses]>(path, params, config);
  }

  /** Get Lead History (crmGetLeadHistory). */
  async history(lead: string, params?: NonNullable<T.CrmGetLeadHistoryData["query"]>, config?: CrmRequestConfig): Promise<CrmCursorPage<T.LeadHistoryItem>> {
    const path = this.buildPath("/crm/leads/{lead}/history", { "lead": lead });
    return this.cursorPage<T.LeadHistoryItem>(path, params, "data", config);
  }

  /** Get Lead Stats (crmGetLeadStats). */
  async stats(params?: NonNullable<T.CrmGetLeadStatsData["query"]>, config?: CrmRequestConfig): Promise<T.CrmGetLeadStatsResponses[keyof T.CrmGetLeadStatsResponses]> {
    const path = "/crm/leads/stats";
    return this.getCrm<T.CrmGetLeadStatsResponses[keyof T.CrmGetLeadStatsResponses]>(path, params, config);
  }

  /** Preview Lead Conversion (crmPreviewLeadConversion). */
  async conversionPreview(lead: string, body: T.CrmPreviewLeadConversionData["body"], config?: CrmRequestConfig): Promise<T.CrmPreviewLeadConversionResponses[keyof T.CrmPreviewLeadConversionResponses]> {
    const path = this.buildPath("/crm/leads/{lead}/conversion-preview", { "lead": lead });
    return this.sendCrm<T.CrmPreviewLeadConversionResponses[keyof T.CrmPreviewLeadConversionResponses]>("POST", path, body, config, false, "crmPreviewLeadConversion");
  }

  /** Preview Lead Erasure (crmPreviewLeadErasure). */
  async erasurePreview(lead: string, body: T.CrmPreviewLeadErasureData["body"], config?: CrmRequestConfig): Promise<T.CrmPreviewLeadErasureResponses[keyof T.CrmPreviewLeadErasureResponses]> {
    const path = this.buildPath("/crm/leads/{lead}/erasure-preview", { "lead": lead });
    return this.sendCrm<T.CrmPreviewLeadErasureResponses[keyof T.CrmPreviewLeadErasureResponses]>("POST", path, body, config, false, "crmPreviewLeadErasure");
  }

  /** Preview Lead Score Recalculation (crmPreviewLeadScoreRecalculation). */
  async previewScoreRecalculation(body: T.CrmPreviewLeadScoreRecalculationData["body"], config?: CrmRequestConfig): Promise<T.CrmPreviewLeadScoreRecalculationResponses[keyof T.CrmPreviewLeadScoreRecalculationResponses]> {
    const path = "/crm/lead-score-runs/preview";
    return this.sendCrm<T.CrmPreviewLeadScoreRecalculationResponses[keyof T.CrmPreviewLeadScoreRecalculationResponses]>("POST", path, body, config, true, "crmPreviewLeadScoreRecalculation");
  }

  /** Qualify Lead (crmQualifyLead). */
  async qualify(lead: string, body: T.CrmQualifyLeadData["body"], config?: CrmRequestConfig): Promise<T.CrmQualifyLeadResponses[keyof T.CrmQualifyLeadResponses]> {
    const path = this.buildPath("/crm/leads/{lead}/qualify", { "lead": lead });
    return this.sendCrm<T.CrmQualifyLeadResponses[keyof T.CrmQualifyLeadResponses]>("POST", path, body, config, true, "crmQualifyLead");
  }

  /** Recalculate Lead Score (crmRecalculateLeadScore). */
  async score(lead: string, body: T.CrmRecalculateLeadScoreData["body"], config?: CrmRequestConfig): Promise<T.CrmRecalculateLeadScoreResponses[keyof T.CrmRecalculateLeadScoreResponses]> {
    const path = this.buildPath("/crm/leads/{lead}/score/recalculate", { "lead": lead });
    return this.sendCrm<T.CrmRecalculateLeadScoreResponses[keyof T.CrmRecalculateLeadScoreResponses]>("POST", path, body, config, true, "crmRecalculateLeadScore");
  }

  /** Record Lead Consent (crmRecordLeadConsent). */
  async consent(lead: string, body: T.CrmRecordLeadConsentData["body"], config?: CrmRequestConfig): Promise<T.CrmRecordLeadConsentResponses[keyof T.CrmRecordLeadConsentResponses]> {
    const path = this.buildPath("/crm/leads/{lead}/consents", { "lead": lead });
    return this.sendCrm<T.CrmRecordLeadConsentResponses[keyof T.CrmRecordLeadConsentResponses]>("POST", path, body, config, true, "crmRecordLeadConsent");
  }

  /** Reopen Lead (crmReopenLead). */
  async reopen(lead: string, body: T.CrmReopenLeadData["body"], config?: CrmRequestConfig): Promise<T.CrmReopenLeadResponses[keyof T.CrmReopenLeadResponses]> {
    const path = this.buildPath("/crm/leads/{lead}/reopen", { "lead": lead });
    return this.sendCrm<T.CrmReopenLeadResponses[keyof T.CrmReopenLeadResponses]>("POST", path, body, config, true, "crmReopenLead");
  }

  /** Search Leads (crmSearchLeads). */
  async search(params?: NonNullable<T.CrmSearchLeadsData["query"]>, config?: CrmRequestConfig): Promise<CrmCursorPage<T.Lead>> {
    const path = "/crm/leads/search";
    return this.cursorPage<T.Lead>(path, params, "data", config);
  }
}

export class CrmPipelinesResource extends CrmBaseResource {
  /** Archivar etapa (archivePipelineStage). */
  async archiveStage(pipeline: string, stage: string, body: T.ArchivePipelineStageData["body"], config?: CrmRequestConfig): Promise<T.ArchivePipelineStageResponses[keyof T.ArchivePipelineStageResponses]> {
    const path = this.buildPath("/crm/pipelines/{pipeline}/stages/{stage}/archive", { "pipeline": pipeline, "stage": stage });
    return this.sendCrm<T.ArchivePipelineStageResponses[keyof T.ArchivePipelineStageResponses]>("POST", path, body, config, true, "archivePipelineStage");
  }

  /** Archivar embudo (archivePipeline). */
  async archive(pipeline: string, body: T.ArchivePipelineData["body"], config?: CrmRequestConfig): Promise<T.ArchivePipelineResponses[keyof T.ArchivePipelineResponses]> {
    const path = this.buildPath("/crm/pipelines/{pipeline}/archive", { "pipeline": pipeline });
    return this.sendCrm<T.ArchivePipelineResponses[keyof T.ArchivePipelineResponses]>("POST", path, body, config, true, "archivePipeline");
  }

  /** Crear guía de etapa (createCrmStagePlaybook). */
  async createPlaybook(stage: string, body: T.CreateCrmStagePlaybookData["body"], config?: CrmRequestConfig): Promise<T.CreateCrmStagePlaybookResponses[keyof T.CreateCrmStagePlaybookResponses]> {
    const path = this.buildPath("/crm/stages/{stage}/playbook", { "stage": stage });
    return this.sendCrm<T.CreateCrmStagePlaybookResponses[keyof T.CreateCrmStagePlaybookResponses]>("POST", path, body, config, true, "createCrmStagePlaybook");
  }

  /** Consultar guía de etapa (findCrmStagePlaybook). */
  async findPlaybook(stage: string, params?: NonNullable<T.FindCrmStagePlaybookData["query"]>, config?: CrmRequestConfig): Promise<T.FindCrmStagePlaybookResponses[keyof T.FindCrmStagePlaybookResponses]> {
    const path = this.buildPath("/crm/stages/{stage}/playbook", { "stage": stage });
    return this.getCrm<T.FindCrmStagePlaybookResponses[keyof T.FindCrmStagePlaybookResponses]>(path, params, config);
  }

  /** Guardar guía de etapa (saveCrmStagePlaybook). */
  async savePlaybook(stage: string, body: T.SaveCrmStagePlaybookData["body"], config?: CrmRequestConfig): Promise<T.SaveCrmStagePlaybookResponses[keyof T.SaveCrmStagePlaybookResponses]> {
    const path = this.buildPath("/crm/stages/{stage}/playbook", { "stage": stage });
    return this.sendCrm<T.SaveCrmStagePlaybookResponses[keyof T.SaveCrmStagePlaybookResponses]>("PUT", path, body, config, true, "saveCrmStagePlaybook");
  }

  /** Crear embudo (createPipeline). */
  async create(body: T.CreatePipelineData["body"], config?: CrmRequestConfig): Promise<T.CreatePipelineResponses[keyof T.CreatePipelineResponses]> {
    const path = "/crm/pipelines";
    return this.sendCrm<T.CreatePipelineResponses[keyof T.CreatePipelineResponses]>("POST", path, body, config, true, "createPipeline");
  }

  /** Listar embudos (listPipelines). */
  async list(params?: NonNullable<T.ListPipelinesData["query"]>, config?: CrmRequestConfig): Promise<CrmCursorPage<T.Pipeline>> {
    const path = "/crm/pipelines";
    return this.cursorPage<T.Pipeline>(path, params, "items", config);
  }

  /** Consultar embudo (getPipeline). */
  async show(pipeline: string, params?: NonNullable<T.GetPipelineData["query"]>, config?: CrmRequestConfig): Promise<T.GetPipelineResponses[keyof T.GetPipelineResponses]> {
    const path = this.buildPath("/crm/pipelines/{pipeline}", { "pipeline": pipeline });
    return this.getCrm<T.GetPipelineResponses[keyof T.GetPipelineResponses]>(path, params, config);
  }

  /** Editar embudo (updatePipeline). */
  async update(pipeline: string, body: T.UpdatePipelineData["body"], config?: CrmRequestConfig): Promise<T.UpdatePipelineResponses[keyof T.UpdatePipelineResponses]> {
    const path = this.buildPath("/crm/pipelines/{pipeline}", { "pipeline": pipeline });
    return this.sendCrm<T.UpdatePipelineResponses[keyof T.UpdatePipelineResponses]>("PATCH", path, body, config, true, "updatePipeline");
  }

  /** Previsualizar archivo (previewStageRemap). */
  async previewRemap(pipeline: string, body: T.PreviewStageRemapData["body"], config?: CrmRequestConfig): Promise<T.PreviewStageRemapResponses[keyof T.PreviewStageRemapResponses]> {
    const path = this.buildPath("/crm/pipelines/{pipeline}/archive-preview", { "pipeline": pipeline });
    return this.sendCrm<T.PreviewStageRemapResponses[keyof T.PreviewStageRemapResponses]>("POST", path, body, config, false, "previewStageRemap");
  }

  /** Publicar guía de etapa (publishCrmStagePlaybook). */
  async publishPlaybook(stage: string, body: T.PublishCrmStagePlaybookData["body"], config?: CrmRequestConfig): Promise<T.PublishCrmStagePlaybookResponses[keyof T.PublishCrmStagePlaybookResponses]> {
    const path = this.buildPath("/crm/stages/{stage}/playbook/publish", { "stage": stage });
    return this.sendCrm<T.PublishCrmStagePlaybookResponses[keyof T.PublishCrmStagePlaybookResponses]>("POST", path, body, config, true, "publishCrmStagePlaybook");
  }

  /** Ordenar etapas (reorderPipelineStages). */
  async reorderStages(pipeline: string, body: T.ReorderPipelineStagesData["body"], config?: CrmRequestConfig): Promise<T.ReorderPipelineStagesResponses[keyof T.ReorderPipelineStagesResponses]> {
    const path = this.buildPath("/crm/pipelines/{pipeline}/stages/order", { "pipeline": pipeline });
    return this.sendCrm<T.ReorderPipelineStagesResponses[keyof T.ReorderPipelineStagesResponses]>("PUT", path, body, config, true, "reorderPipelineStages");
  }

  /** Guardar motivo de pérdida (saveLossReason). */
  async saveLossReason(pipeline: string, body: T.SaveLossReasonData["body"], config?: CrmRequestConfig): Promise<T.SaveLossReasonResponses[keyof T.SaveLossReasonResponses]> {
    const path = this.buildPath("/crm/pipelines/{pipeline}/loss-reasons/save", { "pipeline": pipeline });
    return this.sendCrm<T.SaveLossReasonResponses[keyof T.SaveLossReasonResponses]>("POST", path, body, config, true, "saveLossReason");
  }

  /** Guardar etapa (savePipelineStage). */
  async saveStage(pipeline: string, body: T.SavePipelineStageData["body"], config?: CrmRequestConfig): Promise<T.SavePipelineStageResponses[keyof T.SavePipelineStageResponses]> {
    const path = this.buildPath("/crm/pipelines/{pipeline}/stages/save", { "pipeline": pipeline });
    return this.sendCrm<T.SavePipelineStageResponses[keyof T.SavePipelineStageResponses]>("POST", path, body, config, true, "savePipelineStage");
  }

  /** Configurar salud de etapa (saveStageHealthConfiguration). */
  async saveHealthConfiguration(pipeline: string, stage: string, body: T.SaveStageHealthConfigurationData["body"], config?: CrmRequestConfig): Promise<T.SaveStageHealthConfigurationResponses[keyof T.SaveStageHealthConfigurationResponses]> {
    const path = this.buildPath("/crm/pipelines/{pipeline}/stages/{stage}/health-configuration", { "pipeline": pipeline, "stage": stage });
    return this.sendCrm<T.SaveStageHealthConfigurationResponses[keyof T.SaveStageHealthConfigurationResponses]>("PUT", path, body, config, true, "saveStageHealthConfiguration");
  }
}

export class CrmKnowledgeArticlesResource extends CrmBaseResource {
  /** Versions knowledge articles (crmGetKnowledgeArticleVersions). */
  async versions(article: string, config?: CrmRequestConfig): Promise<T.CrmGetKnowledgeArticleVersionsResponses[keyof T.CrmGetKnowledgeArticleVersionsResponses]> {
    const path = this.buildPath("/crm/knowledge/articles/{article}/versions", { "article": article });
    return this.getCrm<T.CrmGetKnowledgeArticleVersionsResponses[keyof T.CrmGetKnowledgeArticleVersionsResponses]>(path, undefined, config, true);
  }

  /** List knowledge categories (listKnowledgeCategories). */
  async categories(config?: CrmRequestConfig): Promise<T.ListKnowledgeCategoriesResponses[keyof T.ListKnowledgeCategoriesResponses]> {
    const path = "/crm/knowledge/categories";
    return this.getCrm<T.ListKnowledgeCategoriesResponses[keyof T.ListKnowledgeCategoriesResponses]>(path, undefined, config, true);
  }

  /** Recover the original create receipt (crmRecoverKnowledgeArticleCreateReceipt). */
  async receiptCreate(config: CrmOriginalKeyRequestConfig): Promise<T.CrmRecoverKnowledgeArticleCreateReceiptResponses[keyof T.CrmRecoverKnowledgeArticleCreateReceiptResponses]> {
    const path = "/crm/knowledge/receipts/knowledge_articles.create";
    this.requireOriginalKey(config);
    return this.getCrm<T.CrmRecoverKnowledgeArticleCreateReceiptResponses[keyof T.CrmRecoverKnowledgeArticleCreateReceiptResponses]>(path, undefined, config, true, "knowledge_articles.create");
  }

  /** Recover the original save receipt (crmRecoverKnowledgeArticleSaveReceipt). */
  async receiptSave(config: CrmOriginalKeyRequestConfig): Promise<T.CrmRecoverKnowledgeArticleSaveReceiptResponses[keyof T.CrmRecoverKnowledgeArticleSaveReceiptResponses]> {
    const path = "/crm/knowledge/receipts/knowledge_articles.save";
    this.requireOriginalKey(config);
    return this.getCrm<T.CrmRecoverKnowledgeArticleSaveReceiptResponses[keyof T.CrmRecoverKnowledgeArticleSaveReceiptResponses]>(path, undefined, config, true, "knowledge_articles.save");
  }

  /** Recover the original submit receipt (crmRecoverKnowledgeArticleSubmitReceipt). */
  async receiptSubmit(config: CrmOriginalKeyRequestConfig): Promise<T.CrmRecoverKnowledgeArticleSubmitReceiptResponses[keyof T.CrmRecoverKnowledgeArticleSubmitReceiptResponses]> {
    const path = "/crm/knowledge/receipts/knowledge_articles.submit";
    this.requireOriginalKey(config);
    return this.getCrm<T.CrmRecoverKnowledgeArticleSubmitReceiptResponses[keyof T.CrmRecoverKnowledgeArticleSubmitReceiptResponses]>(path, undefined, config, true, "knowledge_articles.submit");
  }

  /** Recover the original approve receipt (crmRecoverKnowledgeArticleApproveReceipt). */
  async receiptApprove(config: CrmOriginalKeyRequestConfig): Promise<T.CrmRecoverKnowledgeArticleApproveReceiptResponses[keyof T.CrmRecoverKnowledgeArticleApproveReceiptResponses]> {
    const path = "/crm/knowledge/receipts/knowledge_articles.approve";
    this.requireOriginalKey(config);
    return this.getCrm<T.CrmRecoverKnowledgeArticleApproveReceiptResponses[keyof T.CrmRecoverKnowledgeArticleApproveReceiptResponses]>(path, undefined, config, true, "knowledge_articles.approve");
  }

  /** Recover the original publish receipt (crmRecoverKnowledgeArticlePublishReceipt). */
  async receiptPublish(config: CrmOriginalKeyRequestConfig): Promise<T.CrmRecoverKnowledgeArticlePublishReceiptResponses[keyof T.CrmRecoverKnowledgeArticlePublishReceiptResponses]> {
    const path = "/crm/knowledge/receipts/knowledge_articles.publish";
    this.requireOriginalKey(config);
    return this.getCrm<T.CrmRecoverKnowledgeArticlePublishReceiptResponses[keyof T.CrmRecoverKnowledgeArticlePublishReceiptResponses]>(path, undefined, config, true, "knowledge_articles.publish");
  }

  /** Recover the original unpublish receipt (crmRecoverKnowledgeArticleUnpublishReceipt). */
  async receiptUnpublish(config: CrmOriginalKeyRequestConfig): Promise<T.CrmRecoverKnowledgeArticleUnpublishReceiptResponses[keyof T.CrmRecoverKnowledgeArticleUnpublishReceiptResponses]> {
    const path = "/crm/knowledge/receipts/knowledge_articles.unpublish";
    this.requireOriginalKey(config);
    return this.getCrm<T.CrmRecoverKnowledgeArticleUnpublishReceiptResponses[keyof T.CrmRecoverKnowledgeArticleUnpublishReceiptResponses]>(path, undefined, config, true, "knowledge_articles.unpublish");
  }

  /** Recover the original archive receipt (crmRecoverKnowledgeArticleArchiveReceipt). */
  async receiptArchive(config: CrmOriginalKeyRequestConfig): Promise<T.CrmRecoverKnowledgeArticleArchiveReceiptResponses[keyof T.CrmRecoverKnowledgeArticleArchiveReceiptResponses]> {
    const path = "/crm/knowledge/receipts/knowledge_articles.archive";
    this.requireOriginalKey(config);
    return this.getCrm<T.CrmRecoverKnowledgeArticleArchiveReceiptResponses[keyof T.CrmRecoverKnowledgeArticleArchiveReceiptResponses]>(path, undefined, config, true, "knowledge_articles.archive");
  }

  /** Recover the original link receipt (crmRecoverKnowledgeArticleLinkReceipt). */
  async receiptLink(config: CrmOriginalKeyRequestConfig): Promise<T.CrmRecoverKnowledgeArticleLinkReceiptResponses[keyof T.CrmRecoverKnowledgeArticleLinkReceiptResponses]> {
    const path = "/crm/knowledge/receipts/knowledge_articles.link";
    this.requireOriginalKey(config);
    return this.getCrm<T.CrmRecoverKnowledgeArticleLinkReceiptResponses[keyof T.CrmRecoverKnowledgeArticleLinkReceiptResponses]>(path, undefined, config, true, "knowledge_articles.link");
  }

  /** Recover the original category receipt (recoverKnowledgeCategoryReceipt). */
  async categoryReceipt(config: CrmOriginalKeyRequestConfig): Promise<T.RecoverKnowledgeCategoryReceiptResponses[keyof T.RecoverKnowledgeCategoryReceiptResponses]> {
    const path = "/crm/knowledge/categories/receipts/category-save";
    this.requireOriginalKey(config);
    return this.getCrm<T.RecoverKnowledgeCategoryReceiptResponses[keyof T.RecoverKnowledgeCategoryReceiptResponses]>(path, undefined, config, true, "knowledge_articles.category_save");
  }

  /** Save a knowledge category (saveKnowledgeCategory). */
  async categorySave(body: KnowledgeCategorySaveIntent, config: CrmConfirmedOriginalKeyRequestConfig): Promise<T.SaveKnowledgeCategoryResponses[keyof T.SaveKnowledgeCategoryResponses]> {
    const path = "/crm/knowledge/categories/save";
    this.requireHumanConfirmation(config);
    this.requireOriginalKey(config);
    this.requireExactCas(body);
    return this.sendCrm<T.SaveKnowledgeCategoryResponses[keyof T.SaveKnowledgeCategoryResponses]>("POST", path, body, config, true, "saveKnowledgeCategory", "knowledge_articles.category_save");
  }

  /** Search knowledge articles (crmSearchKnowledgeArticles). */
  async search(params?: NonNullable<T.CrmSearchKnowledgeArticlesData["query"]>, config?: CrmRequestConfig): Promise<CrmKnowledgePage<T.KnowledgeArticle>> {
    const path = "/crm/knowledge/articles";
    return this.knowledgePage<T.KnowledgeArticle>(path, params, config);
  }

  /** Create knowledge articles (crmCreateKnowledgeArticle). */
  async create(body: T.CrmCreateKnowledgeArticleData["body"], config: CrmConfirmedOriginalKeyRequestConfig): Promise<T.CrmCreateKnowledgeArticleResponses[keyof T.CrmCreateKnowledgeArticleResponses]> {
    const path = "/crm/knowledge/articles";
    this.requireHumanConfirmation(config);
    this.requireOriginalKey(config);
    this.requireExactCas(body);
    return this.sendCrm<T.CrmCreateKnowledgeArticleResponses[keyof T.CrmCreateKnowledgeArticleResponses]>("POST", path, body, config, true, "crmCreateKnowledgeArticle", "knowledge_articles.create");
  }

  /** Show knowledge articles (crmGetKnowledgeArticle). */
  async show(article: string, config?: CrmRequestConfig): Promise<T.CrmGetKnowledgeArticleResponses[keyof T.CrmGetKnowledgeArticleResponses]> {
    const path = this.buildPath("/crm/knowledge/articles/{article}", { "article": article });
    return this.getCrm<T.CrmGetKnowledgeArticleResponses[keyof T.CrmGetKnowledgeArticleResponses]>(path, undefined, config, true);
  }

  /** Save knowledge articles (crmSaveKnowledgeArticle). */
  async save(article: string, body: T.CrmSaveKnowledgeArticleData["body"], config: CrmConfirmedOriginalKeyRequestConfig): Promise<T.CrmSaveKnowledgeArticleResponses[keyof T.CrmSaveKnowledgeArticleResponses]> {
    const path = this.buildPath("/crm/knowledge/articles/{article}", { "article": article });
    this.requireHumanConfirmation(config);
    this.requireOriginalKey(config);
    this.requireExactCas(body);
    return this.sendCrm<T.CrmSaveKnowledgeArticleResponses[keyof T.CrmSaveKnowledgeArticleResponses]>("PUT", path, body, config, true, "crmSaveKnowledgeArticle", "knowledge_articles.save");
  }

  /** Suggest knowledge articles (suggestServiceArticles). */
  async suggest(ticket: string, params: NonNullable<T.SuggestServiceArticlesData["query"]>, config?: CrmRequestConfig): Promise<T.SuggestServiceArticlesResponses[keyof T.SuggestServiceArticlesResponses]> {
    const path = this.buildPath("/crm/knowledge/tickets/{ticket}/suggestions", { "ticket": ticket });
    this.requireExactCas(params);
    return this.getCrm<T.SuggestServiceArticlesResponses[keyof T.SuggestServiceArticlesResponses]>(path, params, config, true);
  }

  /** Submit knowledge articles (crmSubmitKnowledgeArticle). */
  async submit(article: string, body: T.CrmSubmitKnowledgeArticleData["body"], config: CrmConfirmedOriginalKeyRequestConfig): Promise<T.CrmSubmitKnowledgeArticleResponses[keyof T.CrmSubmitKnowledgeArticleResponses]> {
    const path = this.buildPath("/crm/knowledge/articles/{article}/submit", { "article": article });
    this.requireHumanConfirmation(config);
    this.requireOriginalKey(config);
    this.requireExactCas(body);
    return this.sendCrm<T.CrmSubmitKnowledgeArticleResponses[keyof T.CrmSubmitKnowledgeArticleResponses]>("POST", path, body, config, true, "crmSubmitKnowledgeArticle", "knowledge_articles.submit");
  }

  /** Approve knowledge articles (crmApproveKnowledgeArticle). */
  async approve(article: string, body: T.CrmApproveKnowledgeArticleData["body"], config: CrmConfirmedOriginalKeyRequestConfig): Promise<T.CrmApproveKnowledgeArticleResponses[keyof T.CrmApproveKnowledgeArticleResponses]> {
    const path = this.buildPath("/crm/knowledge/articles/{article}/approve", { "article": article });
    this.requireHumanConfirmation(config);
    this.requireOriginalKey(config);
    this.requireExactCas(body);
    return this.sendCrm<T.CrmApproveKnowledgeArticleResponses[keyof T.CrmApproveKnowledgeArticleResponses]>("POST", path, body, config, true, "crmApproveKnowledgeArticle", "knowledge_articles.approve");
  }

  /** Publish knowledge articles (crmPublishKnowledgeArticle). */
  async publish(article: string, body: T.CrmPublishKnowledgeArticleData["body"], config: CrmConfirmedOriginalKeyRequestConfig): Promise<T.CrmPublishKnowledgeArticleResponses[keyof T.CrmPublishKnowledgeArticleResponses]> {
    const path = this.buildPath("/crm/knowledge/articles/{article}/publish", { "article": article });
    this.requireHumanConfirmation(config);
    this.requireOriginalKey(config);
    this.requireExactCas(body);
    return this.sendCrm<T.CrmPublishKnowledgeArticleResponses[keyof T.CrmPublishKnowledgeArticleResponses]>("POST", path, body, config, true, "crmPublishKnowledgeArticle", "knowledge_articles.publish");
  }

  /** Unpublish knowledge articles (crmUnpublishKnowledgeArticle). */
  async unpublish(article: string, body: T.CrmUnpublishKnowledgeArticleData["body"], config: CrmConfirmedOriginalKeyRequestConfig): Promise<T.CrmUnpublishKnowledgeArticleResponses[keyof T.CrmUnpublishKnowledgeArticleResponses]> {
    const path = this.buildPath("/crm/knowledge/articles/{article}/unpublish", { "article": article });
    this.requireHumanConfirmation(config);
    this.requireOriginalKey(config);
    this.requireExactCas(body);
    return this.sendCrm<T.CrmUnpublishKnowledgeArticleResponses[keyof T.CrmUnpublishKnowledgeArticleResponses]>("POST", path, body, config, true, "crmUnpublishKnowledgeArticle", "knowledge_articles.unpublish");
  }

  /** Archive knowledge articles (crmArchiveKnowledgeArticle). */
  async archive(article: string, body: T.CrmArchiveKnowledgeArticleData["body"], config: CrmConfirmedOriginalKeyRequestConfig): Promise<T.CrmArchiveKnowledgeArticleResponses[keyof T.CrmArchiveKnowledgeArticleResponses]> {
    const path = this.buildPath("/crm/knowledge/articles/{article}/archive", { "article": article });
    this.requireHumanConfirmation(config);
    this.requireOriginalKey(config);
    this.requireExactCas(body);
    return this.sendCrm<T.CrmArchiveKnowledgeArticleResponses[keyof T.CrmArchiveKnowledgeArticleResponses]>("POST", path, body, config, true, "crmArchiveKnowledgeArticle", "knowledge_articles.archive");
  }

  /** Link knowledge articles (crmLinkKnowledgeArticle). */
  async link(article: string, body: T.CrmLinkKnowledgeArticleData["body"], config: CrmConfirmedOriginalKeyRequestConfig): Promise<T.CrmLinkKnowledgeArticleResponses[keyof T.CrmLinkKnowledgeArticleResponses]> {
    const path = this.buildPath("/crm/knowledge/articles/{article}/link", { "article": article });
    this.requireHumanConfirmation(config);
    this.requireOriginalKey(config);
    this.requireExactCas(body);
    return this.sendCrm<T.CrmLinkKnowledgeArticleResponses[keyof T.CrmLinkKnowledgeArticleResponses]>("POST", path, body, config, true, "crmLinkKnowledgeArticle", "knowledge_articles.link");
  }
}

export class CrmPublicHelpCentersResource extends CrmBaseResource {
  /** Get current help center administration (public-api.v1.crm-public-help-center.get). */
  async administrationGet(config?: CrmRequestConfig): Promise<T.PublicApiV1CrmPublicHelpCenterGetResponses[keyof T.PublicApiV1CrmPublicHelpCenterGetResponses]> {
    const path = "/crm/public-help-center";
    return this.getCrm<T.PublicApiV1CrmPublicHelpCenterGetResponses[keyof T.PublicApiV1CrmPublicHelpCenterGetResponses]>(path, undefined, config, true);
  }

  /** Recover the original publish receipt (public-api.v1.crm-public-help-center.receipt-publish). */
  async publishReceipt(config: CrmOriginalKeyRequestConfig): Promise<T.PublicApiV1CrmPublicHelpCenterReceiptPublishResponses[keyof T.PublicApiV1CrmPublicHelpCenterReceiptPublishResponses]> {
    const path = "/crm/public-help-center/receipts/publish";
    this.requireOriginalKey(config);
    return this.getCrm<T.PublicApiV1CrmPublicHelpCenterReceiptPublishResponses[keyof T.PublicApiV1CrmPublicHelpCenterReceiptPublishResponses]>(path, undefined, config, true, "public_help_centers.publish");
  }

  /** Recover the original unpublish receipt (public-api.v1.crm-public-help-center.receipt-unpublish). */
  async unpublishReceipt(config: CrmOriginalKeyRequestConfig): Promise<T.PublicApiV1CrmPublicHelpCenterReceiptUnpublishResponses[keyof T.PublicApiV1CrmPublicHelpCenterReceiptUnpublishResponses]> {
    const path = "/crm/public-help-center/receipts/unpublish";
    this.requireOriginalKey(config);
    return this.getCrm<T.PublicApiV1CrmPublicHelpCenterReceiptUnpublishResponses[keyof T.PublicApiV1CrmPublicHelpCenterReceiptUnpublishResponses]>(path, undefined, config, true, "public_help_centers.unpublish");
  }

  /** Publish the help center with its original intent (public-api.v1.crm-public-help-center.publish). */
  async publish(body: PublicHelpCenterPublishIntent, config: CrmOriginalKeyRequestConfig): Promise<T.PublicApiV1CrmPublicHelpCenterPublishResponses[keyof T.PublicApiV1CrmPublicHelpCenterPublishResponses]> {
    const path = "/crm/public-help-center/publish";
    this.requireOriginalKey(config);
    this.requireExactCas(body);
    return this.sendCrm<T.PublicApiV1CrmPublicHelpCenterPublishResponses[keyof T.PublicApiV1CrmPublicHelpCenterPublishResponses]>("POST", path, body, config, true, "public-api.v1.crm-public-help-center.publish", "public_help_centers.publish");
  }

  /** Withdraw the help center with its original intent (public-api.v1.crm-public-help-center.unpublish). */
  async unpublish(center: string, body: T.PublicApiV1CrmPublicHelpCenterUnpublishData["body"], config: CrmOriginalKeyRequestConfig): Promise<T.PublicApiV1CrmPublicHelpCenterUnpublishResponses[keyof T.PublicApiV1CrmPublicHelpCenterUnpublishResponses]> {
    const path = this.buildPath("/crm/public-help-center/{center}/unpublish", { "center": center });
    this.requireOriginalKey(config);
    this.requireExactCas(body);
    return this.sendCrm<T.PublicApiV1CrmPublicHelpCenterUnpublishResponses[keyof T.PublicApiV1CrmPublicHelpCenterUnpublishResponses]>("POST", path, body, config, true, "public-api.v1.crm-public-help-center.unpublish", "public_help_centers.unpublish");
  }
}

export class CrmResource {
  readonly contactPeople: CrmContactPeopleResource;
  readonly leads: CrmLeadsResource;
  readonly pipelines: CrmPipelinesResource;
  readonly knowledgeArticles: CrmKnowledgeArticlesResource;
  readonly publicHelpCenters: CrmPublicHelpCentersResource;

  constructor(client: HttpClient) {
    this.contactPeople = new CrmContactPeopleResource(client);
    this.leads = new CrmLeadsResource(client);
    this.pipelines = new CrmPipelinesResource(client);
    this.knowledgeArticles = new CrmKnowledgeArticlesResource(client);
    this.publicHelpCenters = new CrmPublicHelpCentersResource(client);
  }
}
