// AUTO-GENERATED metadata; catalogue membership grants no runtime access.
export const CRM_OPERATIONS = [
  {
    "operationId": "crmApplyLeadScoreRecalculation",
    "operation": "crm_leads.apply_score_recalculation",
    "method": "POST",
    "path": "/crm/lead-score-runs/{run}/apply",
    "sdk": "crm.leads.applyScoreRecalculation",
    "scope": "crm_leads:write",
    "oauthScope": "crm_leads.write",
    "requiresConfirmation": true,
    "effect": true
  },
  {
    "operationId": "crmContactPeopleArchive",
    "operation": "crm_contact_people.archive",
    "method": "POST",
    "path": "/crm/contact-people/{person}/archive",
    "sdk": "crm.contactPeople.archive",
    "scope": "crm_contact_people:delete",
    "requiresConfirmation": true,
    "effect": true
  },
  {
    "operationId": "archivePipelineStage",
    "operation": "crm_pipelines.archive_stage",
    "method": "POST",
    "path": "/crm/pipelines/{pipeline}/stages/{stage}/archive",
    "sdk": "crm.pipelines.archiveStage",
    "scope": "crm_pipelines:write",
    "requiresConfirmation": true,
    "effect": true
  },
  {
    "operationId": "archivePipeline",
    "operation": "crm_pipelines.archive",
    "method": "POST",
    "path": "/crm/pipelines/{pipeline}/archive",
    "sdk": "crm.pipelines.archive",
    "scope": "crm_pipelines:write",
    "requiresConfirmation": true,
    "effect": true
  },
  {
    "operationId": "crmAssignLead",
    "operation": "crm_leads.assign",
    "method": "PUT",
    "path": "/crm/leads/{lead}/owner",
    "sdk": "crm.leads.assign",
    "scope": "crm_leads:write",
    "oauthScope": "crm_leads.write",
    "requiresConfirmation": false,
    "effect": true
  },
  {
    "operationId": "crmChangeLeadStage",
    "operation": "crm_leads.stage",
    "method": "PUT",
    "path": "/crm/leads/{lead}/stage",
    "sdk": "crm.leads.stage",
    "scope": "crm_leads:write",
    "oauthScope": "crm_leads.write",
    "requiresConfirmation": false,
    "effect": true
  },
  {
    "operationId": "crmConvertLead",
    "operation": "crm_leads.convert",
    "method": "POST",
    "path": "/crm/leads/{lead}/convert",
    "sdk": "crm.leads.convert",
    "scope": "crm_leads:write",
    "oauthScope": "crm_leads.write",
    "requiresConfirmation": true,
    "effect": true
  },
  {
    "operationId": "crmContactPeopleCreate",
    "operation": "crm_contact_people.create",
    "method": "POST",
    "path": "/crm/contact-people",
    "sdk": "crm.contactPeople.create",
    "scope": "crm_contact_people:write",
    "requiresConfirmation": false,
    "effect": true
  },
  {
    "operationId": "crmContactPeopleIndex",
    "operation": "crm_contact_people.index",
    "method": "GET",
    "path": "/crm/contact-people",
    "sdk": "crm.contactPeople.list",
    "scope": "crm_contact_people:read",
    "requiresConfirmation": false,
    "effect": false
  },
  {
    "operationId": "createCrmStagePlaybook",
    "operation": "crm_pipelines.create_playbook",
    "method": "POST",
    "path": "/crm/stages/{stage}/playbook",
    "sdk": "crm.pipelines.createPlaybook",
    "scope": "crm_pipelines:write",
    "requiresConfirmation": false,
    "effect": true
  },
  {
    "operationId": "findCrmStagePlaybook",
    "operation": "crm_pipelines.find_playbook",
    "method": "GET",
    "path": "/crm/stages/{stage}/playbook",
    "sdk": "crm.pipelines.findPlaybook",
    "scope": "crm_pipelines:read",
    "requiresConfirmation": false,
    "effect": false
  },
  {
    "operationId": "saveCrmStagePlaybook",
    "operation": "crm_pipelines.save_playbook",
    "method": "PUT",
    "path": "/crm/stages/{stage}/playbook",
    "sdk": "crm.pipelines.savePlaybook",
    "scope": "crm_pipelines:write",
    "requiresConfirmation": false,
    "effect": true
  },
  {
    "operationId": "crmCreateLead",
    "operation": "crm_leads.create",
    "method": "POST",
    "path": "/crm/leads",
    "sdk": "crm.leads.create",
    "scope": "crm_leads:write",
    "oauthScope": "crm_leads.write",
    "requiresConfirmation": false,
    "effect": true
  },
  {
    "operationId": "crmListLeads",
    "operation": "crm_leads.index",
    "method": "GET",
    "path": "/crm/leads",
    "sdk": "crm.leads.list",
    "scope": "crm_leads:read",
    "oauthScope": "crm_leads.read",
    "requiresConfirmation": false,
    "effect": false
  },
  {
    "operationId": "createPipeline",
    "operation": "crm_pipelines.create",
    "method": "POST",
    "path": "/crm/pipelines",
    "sdk": "crm.pipelines.create",
    "scope": "crm_pipelines:write",
    "requiresConfirmation": false,
    "effect": true
  },
  {
    "operationId": "listPipelines",
    "operation": "crm_pipelines.index",
    "method": "GET",
    "path": "/crm/pipelines",
    "sdk": "crm.pipelines.list",
    "scope": "crm_pipelines:read",
    "requiresConfirmation": false,
    "effect": false
  },
  {
    "operationId": "crmDeleteLead",
    "operation": "crm_leads.delete",
    "method": "DELETE",
    "path": "/crm/leads/{lead}",
    "sdk": "crm.leads.delete",
    "scope": "crm_leads:delete",
    "oauthScope": "crm_leads.delete",
    "requiresConfirmation": true,
    "effect": true
  },
  {
    "operationId": "crmFindLead",
    "operation": "crm_leads.show",
    "method": "GET",
    "path": "/crm/leads/{lead}",
    "sdk": "crm.leads.show",
    "scope": "crm_leads:read",
    "oauthScope": "crm_leads.read",
    "requiresConfirmation": false,
    "effect": false
  },
  {
    "operationId": "crmUpdateLead",
    "operation": "crm_leads.update",
    "method": "PATCH",
    "path": "/crm/leads/{lead}",
    "sdk": "crm.leads.update",
    "scope": "crm_leads:write",
    "oauthScope": "crm_leads.write",
    "requiresConfirmation": false,
    "effect": true
  },
  {
    "operationId": "crmDisqualifyLead",
    "operation": "crm_leads.disqualify",
    "method": "POST",
    "path": "/crm/leads/{lead}/disqualify",
    "sdk": "crm.leads.disqualify",
    "scope": "crm_leads:write",
    "oauthScope": "crm_leads.write",
    "requiresConfirmation": false,
    "effect": true
  },
  {
    "operationId": "crmExportLeadData",
    "operation": "crm_leads.export",
    "method": "GET",
    "path": "/crm/leads/{lead}/export",
    "sdk": "crm.leads.export",
    "scope": "crm_leads:export",
    "oauthScope": "crm_leads.export",
    "requiresConfirmation": false,
    "effect": false
  },
  {
    "operationId": "crmContactPeopleDuplicates",
    "operation": "crm_contact_people.duplicates",
    "method": "GET",
    "path": "/crm/contact-people/{person}/duplicates",
    "sdk": "crm.contactPeople.duplicates",
    "scope": "crm_contact_people:read",
    "requiresConfirmation": false,
    "effect": false
  },
  {
    "operationId": "crmContactPeopleShow",
    "operation": "crm_contact_people.show",
    "method": "GET",
    "path": "/crm/contact-people/{person}",
    "sdk": "crm.contactPeople.show",
    "scope": "crm_contact_people:read",
    "requiresConfirmation": false,
    "effect": false
  },
  {
    "operationId": "crmContactPeopleUpdate",
    "operation": "crm_contact_people.update",
    "method": "PATCH",
    "path": "/crm/contact-people/{person}",
    "sdk": "crm.contactPeople.update",
    "scope": "crm_contact_people:write",
    "requiresConfirmation": false,
    "effect": true
  },
  {
    "operationId": "crmFindLeadDuplicates",
    "operation": "crm_leads.duplicates",
    "method": "GET",
    "path": "/crm/leads/{lead}/duplicates",
    "sdk": "crm.leads.duplicates",
    "scope": "crm_leads:read",
    "oauthScope": "crm_leads.read",
    "requiresConfirmation": false,
    "effect": false
  },
  {
    "operationId": "crmFindLeadScoreRecalculationRun",
    "operation": "crm_leads.find_score_recalculation_run",
    "method": "GET",
    "path": "/crm/lead-score-runs/{run}",
    "sdk": "crm.leads.findScoreRecalculationRun",
    "scope": "crm_leads:read",
    "oauthScope": "crm_leads.read",
    "requiresConfirmation": false,
    "effect": false
  },
  {
    "operationId": "crmContactPeopleOptions",
    "operation": "crm_contact_people.options",
    "method": "GET",
    "path": "/crm/contact-people/options",
    "sdk": "crm.contactPeople.options",
    "scope": "crm_contact_people:read",
    "requiresConfirmation": false,
    "effect": false
  },
  {
    "operationId": "public-api.v1.crm-public-help-center.get",
    "operation": "public_help_centers.administration_get",
    "method": "GET",
    "path": "/crm/public-help-center",
    "sdk": "crm.publicHelpCenters.administrationGet",
    "scope": "public_help_centers:write",
    "requiresConfirmation": false,
    "effect": false,
    "scopes": [
      "customer_service:write",
      "public_help_centers:write"
    ]
  },
  {
    "operationId": "crmGetKnowledgeArticleVersions",
    "operation": "knowledge_articles.versions",
    "method": "GET",
    "path": "/crm/knowledge/articles/{article}/versions",
    "sdk": "crm.knowledgeArticles.versions",
    "scope": "knowledge_articles:read",
    "requiresConfirmation": false,
    "effect": false,
    "scopes": [
      "customer_service:read",
      "knowledge_articles:read"
    ]
  },
  {
    "operationId": "crmGetLeadHistory",
    "operation": "crm_leads.history",
    "method": "GET",
    "path": "/crm/leads/{lead}/history",
    "sdk": "crm.leads.history",
    "scope": "crm_leads:read",
    "oauthScope": "crm_leads.read",
    "requiresConfirmation": false,
    "effect": false
  },
  {
    "operationId": "crmGetLeadStats",
    "operation": "crm_leads.stats",
    "method": "GET",
    "path": "/crm/leads/stats",
    "sdk": "crm.leads.stats",
    "scope": "crm_leads:read",
    "oauthScope": "crm_leads.read",
    "requiresConfirmation": false,
    "effect": false
  },
  {
    "operationId": "getPipeline",
    "operation": "crm_pipelines.show",
    "method": "GET",
    "path": "/crm/pipelines/{pipeline}",
    "sdk": "crm.pipelines.show",
    "scope": "crm_pipelines:read",
    "requiresConfirmation": false,
    "effect": false
  },
  {
    "operationId": "updatePipeline",
    "operation": "crm_pipelines.update",
    "method": "PATCH",
    "path": "/crm/pipelines/{pipeline}",
    "sdk": "crm.pipelines.update",
    "scope": "crm_pipelines:write",
    "requiresConfirmation": false,
    "effect": true
  },
  {
    "operationId": "listKnowledgeCategories",
    "operation": "knowledge_articles.categories",
    "method": "GET",
    "path": "/crm/knowledge/categories",
    "sdk": "crm.knowledgeArticles.categories",
    "scope": "knowledge_articles:read",
    "requiresConfirmation": false,
    "effect": false,
    "scopes": [
      "customer_service:read",
      "knowledge_articles:read"
    ]
  },
  {
    "operationId": "crmContactPeopleMerge",
    "operation": "crm_contact_people.merge",
    "method": "POST",
    "path": "/crm/contact-people/merge",
    "sdk": "crm.contactPeople.merge",
    "scope": "crm_contact_people:write",
    "requiresConfirmation": true,
    "effect": true
  },
  {
    "operationId": "crmContactPeopleNormalize",
    "operation": "crm_contact_people.normalize",
    "method": "POST",
    "path": "/crm/contact-people/normalization-preview",
    "sdk": "crm.contactPeople.normalize",
    "scope": "crm_contact_people:read",
    "requiresConfirmation": false,
    "effect": false
  },
  {
    "operationId": "crmContactPeopleMergePreview",
    "operation": "crm_contact_people.merge_preview",
    "method": "POST",
    "path": "/crm/contact-people/merge-preview",
    "sdk": "crm.contactPeople.mergePreview",
    "scope": "crm_contact_people:read",
    "requiresConfirmation": false,
    "effect": false
  },
  {
    "operationId": "crmPreviewLeadConversion",
    "operation": "crm_leads.conversion_preview",
    "method": "POST",
    "path": "/crm/leads/{lead}/conversion-preview",
    "sdk": "crm.leads.conversionPreview",
    "scope": "crm_leads:write",
    "oauthScope": "crm_leads.write",
    "requiresConfirmation": false,
    "effect": false
  },
  {
    "operationId": "crmPreviewLeadErasure",
    "operation": "crm_leads.erasure_preview",
    "method": "POST",
    "path": "/crm/leads/{lead}/erasure-preview",
    "sdk": "crm.leads.erasurePreview",
    "scope": "crm_leads:delete",
    "oauthScope": "crm_leads.delete",
    "requiresConfirmation": false,
    "effect": false
  },
  {
    "operationId": "crmPreviewLeadScoreRecalculation",
    "operation": "crm_leads.preview_score_recalculation",
    "method": "POST",
    "path": "/crm/lead-score-runs/preview",
    "sdk": "crm.leads.previewScoreRecalculation",
    "scope": "crm_leads:write",
    "oauthScope": "crm_leads.write",
    "requiresConfirmation": false,
    "effect": true
  },
  {
    "operationId": "previewStageRemap",
    "operation": "crm_pipelines.preview_remap",
    "method": "POST",
    "path": "/crm/pipelines/{pipeline}/archive-preview",
    "sdk": "crm.pipelines.previewRemap",
    "scope": "crm_pipelines:read",
    "requiresConfirmation": false,
    "effect": false
  },
  {
    "operationId": "publishCrmStagePlaybook",
    "operation": "crm_pipelines.publish_playbook",
    "method": "POST",
    "path": "/crm/stages/{stage}/playbook/publish",
    "sdk": "crm.pipelines.publishPlaybook",
    "scope": "crm_pipelines:write",
    "requiresConfirmation": false,
    "effect": true
  },
  {
    "operationId": "crmQualifyLead",
    "operation": "crm_leads.qualify",
    "method": "POST",
    "path": "/crm/leads/{lead}/qualify",
    "sdk": "crm.leads.qualify",
    "scope": "crm_leads:write",
    "oauthScope": "crm_leads.write",
    "requiresConfirmation": false,
    "effect": true
  },
  {
    "operationId": "crmRecalculateLeadScore",
    "operation": "crm_leads.score",
    "method": "POST",
    "path": "/crm/leads/{lead}/score/recalculate",
    "sdk": "crm.leads.score",
    "scope": "crm_leads:write",
    "oauthScope": "crm_leads.write",
    "requiresConfirmation": false,
    "effect": true
  },
  {
    "operationId": "crmRecordLeadConsent",
    "operation": "crm_leads.consent",
    "method": "POST",
    "path": "/crm/leads/{lead}/consents",
    "sdk": "crm.leads.consent",
    "scope": "crm_leads:write",
    "oauthScope": "crm_leads.write",
    "requiresConfirmation": true,
    "effect": true
  },
  {
    "operationId": "public-api.v1.crm-public-help-center.receipt-publish",
    "operation": "public_help_centers.publish_receipt",
    "method": "GET",
    "path": "/crm/public-help-center/receipts/publish",
    "sdk": "crm.publicHelpCenters.publishReceipt",
    "scope": "public_help_centers:write",
    "requiresConfirmation": false,
    "effect": false,
    "scopes": [
      "customer_service:write",
      "public_help_centers:write"
    ],
    "requiresOriginalKey": true
  },
  {
    "operationId": "public-api.v1.crm-public-help-center.receipt-unpublish",
    "operation": "public_help_centers.unpublish_receipt",
    "method": "GET",
    "path": "/crm/public-help-center/receipts/unpublish",
    "sdk": "crm.publicHelpCenters.unpublishReceipt",
    "scope": "public_help_centers:write",
    "requiresConfirmation": false,
    "effect": false,
    "scopes": [
      "customer_service:write",
      "public_help_centers:write"
    ],
    "requiresOriginalKey": true
  },
  {
    "operationId": "crmRecoverKnowledgeArticleCreateReceipt",
    "operation": "knowledge_articles.receipt_create",
    "method": "GET",
    "path": "/crm/knowledge/receipts/knowledge_articles.create",
    "sdk": "crm.knowledgeArticles.receiptCreate",
    "scope": "knowledge_articles:write",
    "requiresConfirmation": false,
    "effect": false,
    "scopes": [
      "customer_service:write",
      "knowledge_articles:write"
    ],
    "requiresOriginalKey": true
  },
  {
    "operationId": "crmRecoverKnowledgeArticleSaveReceipt",
    "operation": "knowledge_articles.receipt_save",
    "method": "GET",
    "path": "/crm/knowledge/receipts/knowledge_articles.save",
    "sdk": "crm.knowledgeArticles.receiptSave",
    "scope": "knowledge_articles:write",
    "requiresConfirmation": false,
    "effect": false,
    "scopes": [
      "customer_service:write",
      "knowledge_articles:write"
    ],
    "requiresOriginalKey": true
  },
  {
    "operationId": "crmRecoverKnowledgeArticleSubmitReceipt",
    "operation": "knowledge_articles.receipt_submit",
    "method": "GET",
    "path": "/crm/knowledge/receipts/knowledge_articles.submit",
    "sdk": "crm.knowledgeArticles.receiptSubmit",
    "scope": "knowledge_articles:write",
    "requiresConfirmation": false,
    "effect": false,
    "scopes": [
      "customer_service:write",
      "knowledge_articles:write"
    ],
    "requiresOriginalKey": true
  },
  {
    "operationId": "crmRecoverKnowledgeArticleApproveReceipt",
    "operation": "knowledge_articles.receipt_approve",
    "method": "GET",
    "path": "/crm/knowledge/receipts/knowledge_articles.approve",
    "sdk": "crm.knowledgeArticles.receiptApprove",
    "scope": "knowledge_articles:write",
    "requiresConfirmation": false,
    "effect": false,
    "scopes": [
      "customer_service:write",
      "knowledge_articles:write"
    ],
    "requiresOriginalKey": true
  },
  {
    "operationId": "crmRecoverKnowledgeArticlePublishReceipt",
    "operation": "knowledge_articles.receipt_publish",
    "method": "GET",
    "path": "/crm/knowledge/receipts/knowledge_articles.publish",
    "sdk": "crm.knowledgeArticles.receiptPublish",
    "scope": "knowledge_articles:write",
    "requiresConfirmation": false,
    "effect": false,
    "scopes": [
      "customer_service:write",
      "knowledge_articles:write"
    ],
    "requiresOriginalKey": true
  },
  {
    "operationId": "crmRecoverKnowledgeArticleUnpublishReceipt",
    "operation": "knowledge_articles.receipt_unpublish",
    "method": "GET",
    "path": "/crm/knowledge/receipts/knowledge_articles.unpublish",
    "sdk": "crm.knowledgeArticles.receiptUnpublish",
    "scope": "knowledge_articles:write",
    "requiresConfirmation": false,
    "effect": false,
    "scopes": [
      "customer_service:write",
      "knowledge_articles:write"
    ],
    "requiresOriginalKey": true
  },
  {
    "operationId": "crmRecoverKnowledgeArticleArchiveReceipt",
    "operation": "knowledge_articles.receipt_archive",
    "method": "GET",
    "path": "/crm/knowledge/receipts/knowledge_articles.archive",
    "sdk": "crm.knowledgeArticles.receiptArchive",
    "scope": "knowledge_articles:write",
    "requiresConfirmation": false,
    "effect": false,
    "scopes": [
      "customer_service:write",
      "knowledge_articles:write"
    ],
    "requiresOriginalKey": true
  },
  {
    "operationId": "crmRecoverKnowledgeArticleLinkReceipt",
    "operation": "knowledge_articles.receipt_link",
    "method": "GET",
    "path": "/crm/knowledge/receipts/knowledge_articles.link",
    "sdk": "crm.knowledgeArticles.receiptLink",
    "scope": "knowledge_articles:write",
    "requiresConfirmation": false,
    "effect": false,
    "scopes": [
      "customer_service:write",
      "knowledge_articles:write"
    ],
    "requiresOriginalKey": true
  },
  {
    "operationId": "recoverKnowledgeCategoryReceipt",
    "operation": "knowledge_articles.category_receipt",
    "method": "GET",
    "path": "/crm/knowledge/categories/receipts/category-save",
    "sdk": "crm.knowledgeArticles.categoryReceipt",
    "scope": "knowledge_articles:write",
    "requiresConfirmation": false,
    "effect": false,
    "scopes": [
      "customer_service:write",
      "knowledge_articles:write"
    ],
    "requiresOriginalKey": true
  },
  {
    "operationId": "crmReopenLead",
    "operation": "crm_leads.reopen",
    "method": "POST",
    "path": "/crm/leads/{lead}/reopen",
    "sdk": "crm.leads.reopen",
    "scope": "crm_leads:write",
    "oauthScope": "crm_leads.write",
    "requiresConfirmation": false,
    "effect": true
  },
  {
    "operationId": "reorderPipelineStages",
    "operation": "crm_pipelines.reorder_stages",
    "method": "PUT",
    "path": "/crm/pipelines/{pipeline}/stages/order",
    "sdk": "crm.pipelines.reorderStages",
    "scope": "crm_pipelines:write",
    "requiresConfirmation": false,
    "effect": true
  },
  {
    "operationId": "crmContactPeopleRelationships",
    "operation": "crm_contact_people.relationships",
    "method": "PUT",
    "path": "/crm/contact-people/{person}/relationships",
    "sdk": "crm.contactPeople.relationships",
    "scope": "crm_contact_people:write",
    "requiresConfirmation": false,
    "effect": true
  },
  {
    "operationId": "saveKnowledgeCategory",
    "operation": "knowledge_articles.category_save",
    "method": "POST",
    "path": "/crm/knowledge/categories/save",
    "sdk": "crm.knowledgeArticles.categorySave",
    "scope": "knowledge_articles:write",
    "requiresConfirmation": true,
    "effect": true,
    "scopes": [
      "customer_service:write",
      "knowledge_articles:write"
    ],
    "requiresOriginalKey": true
  },
  {
    "operationId": "saveLossReason",
    "operation": "crm_pipelines.save_loss_reason",
    "method": "POST",
    "path": "/crm/pipelines/{pipeline}/loss-reasons/save",
    "sdk": "crm.pipelines.saveLossReason",
    "scope": "crm_pipelines:write",
    "requiresConfirmation": false,
    "effect": true
  },
  {
    "operationId": "savePipelineStage",
    "operation": "crm_pipelines.save_stage",
    "method": "POST",
    "path": "/crm/pipelines/{pipeline}/stages/save",
    "sdk": "crm.pipelines.saveStage",
    "scope": "crm_pipelines:write",
    "requiresConfirmation": false,
    "effect": true
  },
  {
    "operationId": "saveStageHealthConfiguration",
    "operation": "crm_pipelines.save_health_configuration",
    "method": "PUT",
    "path": "/crm/pipelines/{pipeline}/stages/{stage}/health-configuration",
    "sdk": "crm.pipelines.saveHealthConfiguration",
    "scope": "crm_pipelines:write",
    "oauthScope": "crm_pipelines.write",
    "effect": true
  },
  {
    "operationId": "crmSearchKnowledgeArticles",
    "operation": "knowledge_articles.search",
    "method": "GET",
    "path": "/crm/knowledge/articles",
    "sdk": "crm.knowledgeArticles.search",
    "scope": "knowledge_articles:read",
    "requiresConfirmation": false,
    "effect": false,
    "scopes": [
      "customer_service:read",
      "knowledge_articles:read"
    ]
  },
  {
    "operationId": "crmCreateKnowledgeArticle",
    "operation": "knowledge_articles.create",
    "method": "POST",
    "path": "/crm/knowledge/articles",
    "sdk": "crm.knowledgeArticles.create",
    "scope": "knowledge_articles:write",
    "requiresConfirmation": true,
    "effect": true,
    "scopes": [
      "customer_service:write",
      "knowledge_articles:write"
    ],
    "requiresOriginalKey": true
  },
  {
    "operationId": "crmSearchLeads",
    "operation": "crm_leads.search",
    "method": "GET",
    "path": "/crm/leads/search",
    "sdk": "crm.leads.search",
    "scope": "crm_leads:read",
    "oauthScope": "crm_leads.read",
    "requiresConfirmation": false,
    "effect": false
  },
  {
    "operationId": "crmGetKnowledgeArticle",
    "operation": "knowledge_articles.show",
    "method": "GET",
    "path": "/crm/knowledge/articles/{article}",
    "sdk": "crm.knowledgeArticles.show",
    "scope": "knowledge_articles:read",
    "requiresConfirmation": false,
    "effect": false,
    "scopes": [
      "customer_service:read",
      "knowledge_articles:read"
    ]
  },
  {
    "operationId": "crmSaveKnowledgeArticle",
    "operation": "knowledge_articles.save",
    "method": "PUT",
    "path": "/crm/knowledge/articles/{article}",
    "sdk": "crm.knowledgeArticles.save",
    "scope": "knowledge_articles:write",
    "requiresConfirmation": true,
    "effect": true,
    "scopes": [
      "customer_service:write",
      "knowledge_articles:write"
    ],
    "requiresOriginalKey": true
  },
  {
    "operationId": "suggestServiceArticles",
    "operation": "knowledge_articles.suggest",
    "method": "GET",
    "path": "/crm/knowledge/tickets/{ticket}/suggestions",
    "sdk": "crm.knowledgeArticles.suggest",
    "scope": "knowledge_articles:read",
    "requiresConfirmation": false,
    "effect": false,
    "scopes": [
      "customer_service:read",
      "knowledge_articles:read"
    ]
  },
  {
    "operationId": "public-api.v1.crm-public-help-center.publish",
    "operation": "public_help_centers.publish",
    "method": "POST",
    "path": "/crm/public-help-center/publish",
    "sdk": "crm.publicHelpCenters.publish",
    "scope": "public_help_centers:write",
    "requiresConfirmation": true,
    "effect": true,
    "scopes": [
      "customer_service:write",
      "public_help_centers:write"
    ],
    "requiresOriginalKey": true
  },
  {
    "operationId": "public-api.v1.crm-public-help-center.unpublish",
    "operation": "public_help_centers.unpublish",
    "method": "POST",
    "path": "/crm/public-help-center/{center}/unpublish",
    "sdk": "crm.publicHelpCenters.unpublish",
    "scope": "public_help_centers:write",
    "requiresConfirmation": true,
    "effect": true,
    "scopes": [
      "customer_service:write",
      "public_help_centers:write"
    ],
    "requiresOriginalKey": true
  },
  {
    "operationId": "crmSubmitKnowledgeArticle",
    "operation": "knowledge_articles.submit",
    "method": "POST",
    "path": "/crm/knowledge/articles/{article}/submit",
    "sdk": "crm.knowledgeArticles.submit",
    "scope": "knowledge_articles:write",
    "requiresConfirmation": true,
    "effect": true,
    "scopes": [
      "customer_service:write",
      "knowledge_articles:write"
    ],
    "requiresOriginalKey": true
  },
  {
    "operationId": "crmApproveKnowledgeArticle",
    "operation": "knowledge_articles.approve",
    "method": "POST",
    "path": "/crm/knowledge/articles/{article}/approve",
    "sdk": "crm.knowledgeArticles.approve",
    "scope": "knowledge_articles:write",
    "requiresConfirmation": true,
    "effect": true,
    "scopes": [
      "customer_service:write",
      "knowledge_articles:write"
    ],
    "requiresOriginalKey": true
  },
  {
    "operationId": "crmPublishKnowledgeArticle",
    "operation": "knowledge_articles.publish",
    "method": "POST",
    "path": "/crm/knowledge/articles/{article}/publish",
    "sdk": "crm.knowledgeArticles.publish",
    "scope": "knowledge_articles:write",
    "requiresConfirmation": true,
    "effect": true,
    "scopes": [
      "customer_service:write",
      "knowledge_articles:write"
    ],
    "requiresOriginalKey": true
  },
  {
    "operationId": "crmUnpublishKnowledgeArticle",
    "operation": "knowledge_articles.unpublish",
    "method": "POST",
    "path": "/crm/knowledge/articles/{article}/unpublish",
    "sdk": "crm.knowledgeArticles.unpublish",
    "scope": "knowledge_articles:write",
    "requiresConfirmation": true,
    "effect": true,
    "scopes": [
      "customer_service:write",
      "knowledge_articles:write"
    ],
    "requiresOriginalKey": true
  },
  {
    "operationId": "crmArchiveKnowledgeArticle",
    "operation": "knowledge_articles.archive",
    "method": "POST",
    "path": "/crm/knowledge/articles/{article}/archive",
    "sdk": "crm.knowledgeArticles.archive",
    "scope": "knowledge_articles:write",
    "requiresConfirmation": true,
    "effect": true,
    "scopes": [
      "customer_service:write",
      "knowledge_articles:write"
    ],
    "requiresOriginalKey": true
  },
  {
    "operationId": "crmLinkKnowledgeArticle",
    "operation": "knowledge_articles.link",
    "method": "POST",
    "path": "/crm/knowledge/articles/{article}/link",
    "sdk": "crm.knowledgeArticles.link",
    "scope": "knowledge_articles:write",
    "requiresConfirmation": true,
    "effect": true,
    "scopes": [
      "customer_service:write",
      "knowledge_articles:write"
    ],
    "requiresOriginalKey": true
  }
] as const;
