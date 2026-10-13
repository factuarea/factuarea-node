import { type Factuarea, type CrmUuid, type CrmDecimal, type CrmActivityWrite, type CrmOpportunity, type CrmLead, type CrmLeadIdentity } from "../src/index.js";
export interface CommercialJourneyInput {
  leadName: string; leadEmail: string; pipelineId: CrmUuid; stageId: CrmUuid; amount: CrmDecimal; currency: string;
  leadKey: string; opportunityKey: string; activityKey: string;
}
/** Caller supplies IDs from current native configuration and retains each prepared intent before dispatch. */
export async function commercialJourney(sdk: Factuarea, input: CommercialJourneyInput, retain: (intent: import("../src/index.js").CrmOriginalIntent) => Promise<void>, signal?: AbortSignal): Promise<{ lead: CrmLead | CrmLeadIdentity; opportunity: CrmOpportunity; activity: CrmActivityWrite; currentOpportunity: CrmOpportunity | null }> {
  const leadIntent = sdk.crm.prepareLeadCreate(input.leadKey, { name: input.leadName, email: input.leadEmail, source: "manual" });
  await retain(leadIntent);
  const lead = (await sdk.crm.createLead(leadIntent, { signal })).data.data;
  const opportunityIntent = sdk.crm.prepareOpportunityCreate(input.opportunityKey, { title: `Follow up ${input.leadName}`, lead_id: lead.id, pipeline_id: input.pipelineId, stage_id: input.stageId, amount: input.amount, currency: input.currency });
  await retain(opportunityIntent);
  const opportunity = (await sdk.crm.createOpportunity(opportunityIntent, { signal })).data.data;
  const activityIntent = sdk.crm.prepareActivityCreate(input.activityKey, { type: "note", title: "First contact", target: { type: "opportunity", id: opportunity.id }, timezone: "UTC" });
  await retain(activityIntent);
  const activity = (await sdk.crm.createActivity(activityIntent, { signal })).data.data;
  const currentOpportunity = (await sdk.crm.getOpportunity(opportunity.id, { signal })).data.data;
  // A confirmed activity identity survives a masked activity:null representation. No invented follow-up record.
  return { lead, opportunity, activity, currentOpportunity };
}
