import { Factuarea, crmUuid, crmDecimal, type CrmLeadCreate, type CrmOpportunityCreate, type CrmActivityCreate, type CrmCommercialWriteUnconfirmedError } from "@factuarea/sdk";
const entity = crmUuid("019aaaaa-aaaa-7aaa-8aaa-aaaaaaaaaaaa");
const lead: CrmLeadCreate = { name: "Installed lead", email: null };
const opportunity: CrmOpportunityCreate = { title: "Installed opportunity", lead_id: entity, pipeline_id: entity, stage_id: entity, amount: crmDecimal("1.0000"), currency: "EUR" };
const activity: CrmActivityCreate = { type: "note", title: "Installed activity", target: { type: "opportunity", id: entity }, timezone: "UTC" };
const client = new Factuarea({ oauthBearer: "fixture_compile_only" });
const intent = client.crm.prepareLeadCreate("installed-types", lead);
const result: Promise<{ data: { data: { id: typeof entity } } }> = client.crm.createLead(intent);
declare const error: CrmCommercialWriteUnconfirmedError;
const retained: typeof intent = error.intent;
// @ts-expect-error An unvalidated arbitrary string is not an entity UUID.
const invalidIdentity: CrmOpportunityCreate = { ...opportunity, pipeline_id: "123" };
// @ts-expect-error Native monetary strings are not JS numbers.
const invalidAmount: CrmOpportunityCreate = { ...opportunity, amount: 1.1 };
// @ts-expect-error Unknown write activity types are not widened.
const futureActivity: CrmActivityCreate = { ...activity, type: "future" };
void [lead, opportunity, activity, result, retained, invalidIdentity, invalidAmount, futureActivity];
