import { Factuarea, type CrmConvertLeadRequest, type CrmPreviewLeadConversionRequest } from "../src/index.js";

export async function reviewSandboxLeads(client: Factuarea) {
  if (client.environment !== "test") throw new Error("Use a sandbox credential for this recipe.");
  const leads = await client.crm.leads.list({ limit: 25, sort: "-created_at", filters: JSON.stringify({ status: "open" }) });
  for await (const lead of leads) console.log(lead.id, lead.version);
  const pipelines = await client.crm.pipelines.list({ status: "active", limit: 25 });
  for await (const pipeline of pipelines) console.log(pipeline.id, pipeline.version);
}

export async function previewConversion(client: Factuarea, leadId: string, request: CrmPreviewLeadConversionRequest) {
  return client.crm.leads.conversionPreview(leadId, request);
}

// Invoke only after a human reviews the native preview, plan hash and current version.
export async function applyHumanConfirmedConversion(client: Factuarea, leadId: string, request: CrmConvertLeadRequest, originalStepKey: string) {
  return client.crm.leads.convert(leadId, request, { idempotencyKey: originalStepKey });
}
