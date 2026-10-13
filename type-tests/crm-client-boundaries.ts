import type { CrmCommercialResource } from "../src/crm/commercial/resource.js";
import type {
  CrmDecimal,
  CrmLeadListParams,
  CrmOpportunity,
  CrmOpportunityStage,
  CrmUuid,
} from "../src/crm/commercial/types.js";

/** Compile-only contracts. This function is never invoked or given credentials. */
export async function crmClientBoundaryTypes(
  client: CrmCommercialResource,
  uuid: CrmUuid
): Promise<void> {
  const params: CrmLeadListParams = {
    cursor: "opaque-signed-cursor",
    limit: 25,
    sort: "-uuid",
  };
  const stage: CrmOpportunityStage = {
    expected_version: 2,
    target_pipeline_id: uuid,
    target_stage_id: uuid,
    expected_definition_version: 0,
  };
  const intent = client.prepareOpportunityStage(uuid, "original-cas", stage);
  void client.listLeads(params);
  void client.moveOpportunityStage(intent);

  // @ts-expect-error Numeric database identities are never public CRM identities.
  void client.getLead(42);
  // @ts-expect-error Arbitrary strings must pass the canonical UUID validator first.
  void client.getOpportunity("unvalidated-identity");
  // @ts-expect-error A cursor is opaque text, never a numeric offset.
  void client.listLeads({ cursor: 2 });
  // @ts-expect-error Cursor collections do not accept synthetic page numbers.
  void client.listLeads({ page: 2 });
  // @ts-expect-error Tenant authority comes from credentials, not list filters at the top level.
  void client.listLeads({ company_id: uuid });
  // @ts-expect-error Commercial calls cannot replace their captured Company/profile headers.
  void client.getLead(uuid, { headers: { "X-Company-Id": uuid } });
  // @ts-expect-error A stage change requires the original CAS version.
  client.prepareOpportunityStage(uuid, "missing-cas", {
    target_pipeline_id: uuid,
    target_stage_id: uuid,
    expected_definition_version: 0,
  });
  client.prepareOpportunityStage(uuid, "invalid-stage", {
    ...stage,
    // @ts-expect-error Target stages retain the validated UUID brand.
    target_stage_id: "internal-id",
  });
  // @ts-expect-error Intents preserve the original immutable wire body.
  intent.firstBody = "{}";
  // @ts-expect-error A prepared intent is required; a raw object cannot bypass capture.
  void client.createLead({ name: "Uncaptured lead" });

  const response = await client.getOpportunity(uuid);
  // @ts-expect-error An unavailable representation remains null in the return contract.
  const visible: CrmOpportunity = response.data.data;
  if (response.data.data !== null) {
    // @ts-expect-error A masked amount remains nullable instead of becoming a synthetic zero.
    const amount: CrmDecimal = response.data.data.amount;
    void amount;
  }
  void visible;
}
