import {
  HttpClient,
  type FactuareaConfig,
} from "../../src/core/http-client.js";
import { crmUuid } from "../../src/crm/commercial/codecs.js";
import { CrmCommercialResource } from "../../src/crm/commercial/resource.js";
import type {
  CrmLead,
  CrmOpportunity,
} from "../../src/crm/commercial/types.js";

export const CRM_BOUNDARY_URL = "https://crm-contract.invalid/v1";
export const leadId = crmUuid("019aaaaa-aaaa-7aaa-8aaa-aaaaaaaaaaaa");
export const opportunityId = crmUuid("019bbbbb-bbbb-7bbb-8bbb-bbbbbbbbbbbb");
export const pipelineId = crmUuid("019ccccc-cccc-7ccc-8ccc-cccccccccccc");
export const stageId = crmUuid("019ddddd-dddd-7ddd-8ddd-dddddddddddd");
export const foreignId = crmUuid("019eeeee-eeee-7eee-8eee-eeeeeeeeeeee");
const at = "2026-10-13T12:00:00Z";

/** The canonical CRM resource and transport; only HTTP is replaced by the test. */
export function boundaryClient(
  fetch: typeof globalThis.fetch,
  overrides: Partial<FactuareaConfig> = {}
): CrmCommercialResource {
  return new CrmCommercialResource(
    new HttpClient({
      apiKey: "fact_test_boundary_tenant_a",
      baseUrl: CRM_BOUNDARY_URL,
      fetch,
      maxRetries: 5,
      timeout: 1000,
      ...overrides,
    })
  );
}

export function leadRecord(overrides: Partial<CrmLead> = {}): CrmLead {
  return {
    id: leadId,
    version: 1,
    status: "open",
    stage: "inbox",
    name: "Contract lead",
    email: null,
    phone: null,
    mobile: null,
    contact_data: {},
    owner_id: null,
    team_id: null,
    contact_id: null,
    person_id: null,
    first_attribution: {},
    last_attribution: {},
    source: "manual",
    source_term_id: null,
    score: 0,
    rules_version: "v1",
    score_factors: [],
    score_policy_id: null,
    score_policy_version: null,
    score_evaluated_at: at,
    consent: [],
    typed_fields: {},
    typed_conflicts: [],
    typed_projection: null,
    next_action: {
      status: "unavailable",
      activity_id: null,
      type: null,
      title: null,
      due_at: null,
      reason: "producer_unavailable",
    },
    created_at: at,
    updated_at: at,
    erased_at: null,
    routing: null,
    ...overrides,
  };
}

export function maskedOpportunity(
  overrides: Partial<CrmOpportunity> = {}
): CrmOpportunity {
  return {
    id: opportunityId,
    version: 3,
    status: "open",
    title: null,
    lead_id: null,
    contact_id: null,
    pipeline_id: null,
    stage_id: null,
    owner_id: null,
    team_id: null,
    amount: null,
    currency: null,
    probability: null,
    probability_override: null,
    override_reason: null,
    weighted_value: null,
    expected_close: null,
    next_step: null,
    closed_at: null,
    loss_reason_id: null,
    close_reason: null,
    stage_changed_at: null,
    participants: null,
    playbook_answers: null,
    history: null,
    ...overrides,
  };
}

export function boundaryResponse(data: unknown, status = 200): Response {
  return Response.json(
    { data },
    { status, headers: { "X-Request-Id": "crm-contract-request" } }
  );
}
