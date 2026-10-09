// Server only: the application's existing session/consent gate must authorize the form.
import { Factuarea, type CrmCreateLeadRequest } from "../src/index.js";

export async function createAuthorizedSandboxLead(input: CrmCreateLeadRequest, originalStepKey: string) {
  const apiKey = process.env.FACTUAREA_API_KEY;
  if (!apiKey?.startsWith("fact_test_")) throw new Error("This recipe requires a sandbox API key.");
  const client = new Factuarea({ apiKey, baseUrl: process.env.FACTUAREA_BASE_URL });
  // Save originalStepKey in the host's durable request record before calling.
  return client.crm.leads.create(input, { idempotencyKey: originalStepKey });
}
