import type { CrmCreateLeadRequest, PipelineCreatePipelineRequest, CreateContactPersonV1Request } from "../src/index.js";
import { Factuarea } from "../src/index.js";

// Compile-only negative contracts; no credentials or effects are executed.
export function crmTypeContracts(client: Factuarea): void {
  const lead: CrmCreateLeadRequest = { name: "Test", estimated_value: { amount: "100.25", currency: "EUR" } };
  const person: CreateContactPersonV1Request = { kind: "person", name: "Test" };
  const pipeline: PipelineCreatePipelineRequest = { name: "Sales", visibility: "company", team_ids: [], initial_stage: { name: "Inbox", probability: "10.00", definition_version: 0 } };
  void lead; void person; void pipeline;
  // @ts-expect-error tenant is resolved from the credential, never a body field
  client.crm.leads.create({ name: "Test", company_id: 42 });
  // @ts-expect-error decimal amounts remain exact strings
  client.crm.leads.create({ name: "Test", estimated_value: { amount: 100.25, currency: "EUR" } });
  // @ts-expect-error collection replacement rejects null
  client.crm.contactPeople.update("uuid", { expected_version: 1, channels: null });
  // @ts-expect-error sensitive People archive requires caller acknowledgement
  client.crm.contactPeople.archive("uuid", { expected_version: 1 });
  // @ts-expect-error Pipeline archive requires the native explicit confirmation
  client.crm.pipelines.archive("uuid", { expected_version: 1, plan_token: "plan", confirmed: false });
  // @ts-expect-error future Opportunity operations are absent in this delivery group
  client.crm.opportunities.create({});
  // @ts-expect-error native Lead filters are a JSON string
  client.crm.leads.list({ filters: { status: "open" } });
}
