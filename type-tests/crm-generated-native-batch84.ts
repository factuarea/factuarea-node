import type { Factuarea, NativeApi, Page } from "../dist/index.js";

// These symbols must be emitted by the normal openapi-ts stage from the exact
// producer operation IDs. Resource generation verifies every actual symbol.
type LeadInput = NativeApi.CrmCreateLeadData["body"];
const omitted: LeadInput = { name: "Human draft" };
const explicitNull: LeadInput = { name: "Human draft", notes: null, owner_id: null };
const exactDecimal: LeadInput = { name: "Human draft", estimated_value: { amount: "999999999999999999.99", currency: "EUR" } };
// @ts-expect-error The producer closes this request; Company authority is not an input.
const foreignAuthority: LeadInput = { name: "Human draft", company_id: "foreign-company" };
// @ts-expect-error Exact decimal wire values are strings.
const floatAmount: LeadInput = { name: "Human draft", estimated_value: { amount: 1.1, currency: "EUR" } };
// @ts-expect-error The only native source value is manual.
const futureWriteEnum: LeadInput = { name: "Human draft", source: "future_source" };
// @ts-expect-error Under exact optional properties, undefined is not omission.
const explicitUndefined: LeadInput = { name: "Human draft", notes: undefined };

type LeadQuery = NonNullable<NativeApi.CrmListLeadsData["query"]>;
const cursor: LeadQuery = { cursor: "opaque-server-cursor", limit: 1, sort: "-created_at" };
// @ts-expect-error The exact producer sort vocabulary is retained.
const inventedSort: LeadQuery = { sort: "future_sort" };
type LeadPageItem = NativeApi.CrmListLeadsResponse["data"]["data"][number];
declare const page: Page<LeadPageItem>;
const currentId: string = page.data[0]!.id;

type OriginalQuery = NonNullable<NativeApi.CrmGetLeadCreateOriginalData["query"]>;
const original: OriginalQuery = { original_body_sha256: "a".repeat(64) };
// @ts-expect-error The raw original key belongs in the retained header, never in query.
const inventedOriginalQuery: OriginalQuery = { original_body_sha256: "a".repeat(64), idempotency_key: "key" };
declare const receipt: NativeApi.CrmGetLeadCreateOriginalResponse;
const state: "confirmed" | "pending" | "in_progress" | "unconfirmed" | "missing" = receipt.data.state;
const originalBody: string | undefined = receipt.data.original_response?.body;

// Consumer calls use the standard built public barrel, including the actual
// generated namespaces from the producer's x-speakeasy-group metadata.
declare const sdk: Factuarea;
declare const signal: AbortSignal;
const createCall: Promise<NativeApi.CrmCreateLeadResponse> = sdk.resources.crmLeads.crmCreateLead(omitted, { signal, idempotencyKey: "retained key" });
const listCall: Promise<Page<LeadPageItem>> = sdk.resources.crmLeads.crmListLeads(cursor, { signal });
const recoveryCall: Promise<NativeApi.CrmGetLeadCreateOriginalResponse> = sdk.resources.crmLeads.crmGetLeadCreateOriginal(original, { signal, idempotencyKey: "original key" });
const contextCall: Promise<NativeApi.CrmGetOAuthCredentialContextResponse> = sdk.resources.crmCredentialContext.crmGetOAuthCredentialContext({ signal });
// @ts-expect-error An original lookup requires the caller's retained key.
sdk.resources.crmLeads.crmGetLeadCreateOriginal(original);
// @ts-expect-error The generated create method uses the producer's closed input.
sdk.resources.crmLeads.crmCreateLead({ name: "Human draft", company_id: "foreign-company" });

void [omitted, explicitNull, exactDecimal, foreignAuthority, floatAmount, futureWriteEnum,
  explicitUndefined, cursor, inventedSort, currentId, original, inventedOriginalQuery, state, originalBody,
  createCall, listCall, recoveryCall, contextCall];
