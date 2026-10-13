import type { CrmUuid, CrmDecimal, CrmLeadCreate, CrmOpportunityCreate, CrmActivityCreate, CrmOpportunityStage } from "../src/crm/commercial/types.js";
declare const uuid: CrmUuid;
declare const decimal: CrmDecimal;
const omitted: CrmLeadCreate = { name: "Native Lead" };
const nullable: CrmLeadCreate = { name: "Native Lead", email: null, owner_id: null };
const opportunity: CrmOpportunityCreate = { title: "Native opportunity", lead_id: uuid, pipeline_id: uuid, stage_id: uuid, amount: decimal, currency: "EUR" };
const activity: CrmActivityCreate = { type: "note", title: "Native note", target: { type: "opportunity", id: uuid }, timezone: "UTC" };
// @ts-expect-error Entity identity is an explicitly validated native UUID, not arbitrary string.
const wrongId: CrmOpportunityCreate = { ...opportunity, pipeline_id: "internal-id" };
// @ts-expect-error Decimal values never use JS numbers.
const wrongAmount: CrmOpportunityCreate = { ...opportunity, amount: 1.1 };
// @ts-expect-error With exactOptionalPropertyTypes, explicit undefined is not omitted.
const wrongOmission: CrmLeadCreate = { name: "Native Lead", email: undefined };
// @ts-expect-error Future write states are rejected rather than widened.
const wrongType: CrmActivityCreate = { ...activity, type: "future_activity" };
// @ts-expect-error CAS version is required for stage movement.
const wrongStage: CrmOpportunityStage = { target_pipeline_id: uuid, target_stage_id: uuid, expected_definition_version: 0 };
void [omitted, nullable, opportunity, activity, wrongId, wrongAmount, wrongOmission, wrongType, wrongStage];
