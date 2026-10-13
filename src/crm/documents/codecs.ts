import * as w from "./wire.js";
import type { CommercialDocument, CommercialDocumentPage, CommercialDocumentReceipt, CrmNativeDocument, CrmDocumentDecimal, CrmDocumentWriteOperation, OpportunityDocumentCandidate, OpportunityDocumentCandidatePage, OpportunityDocumentFinancialSummary, OpportunityDocumentLink, OpportunityDocumentPage, OpportunityDocumentUnlinkReceipt } from "./types.js";

export function envelope(value: unknown): unknown { return w.record(value, ["data"]).data; }
export function libraryReceipt(value: unknown): CommercialDocumentReceipt {
  const r = w.record(value, ["id", "version"]);
  return { id: w.id(r.id), version: w.version(r.version) };
}
export function libraryDocument(value: unknown): CommercialDocument {
  const r = w.record(value, ["id", "version"], ["title", "visibility", "created_by_id", "archived_at", "archived_by_id", "versions", "links", "shares"]);
  const out: CommercialDocument = { id: w.id(r.id), version: w.version(r.version) };
  if (w.has(r, "title")) out.title = w.text(r.title, 255);
  if (w.has(r, "visibility")) out.visibility = w.text(r.visibility, 100);
  if (w.has(r, "created_by_id")) out.created_by_id = w.ownerId(r.created_by_id);
  if (w.has(r, "archived_at")) out.archived_at = w.nullable(r.archived_at, w.timestamp);
  if (w.has(r, "archived_by_id")) out.archived_by_id = w.nullable(r.archived_by_id, w.ownerId);
  if (w.has(r, "versions")) out.versions = w.items(r.versions).map(item => {
    const v = w.record(item, ["number", "mime", "size_bytes", "created_by_id", "created_at"]);
    return { number: w.version(v.number), mime: w.mime(v.mime), size_bytes: w.integer(v.size_bytes, true), created_by_id: w.ownerId(v.created_by_id), created_at: w.timestamp(v.created_at) };
  });
  if (w.has(r, "links")) out.links = w.items(r.links).map(item => {
    const v = w.record(item, ["entity_type", "entity_id", "document_version", "linked_by_id", "linked_at"]);
    return { entity_type: w.text(v.entity_type, 100), entity_id: w.id(v.entity_id), document_version: w.version(v.document_version), linked_by_id: w.ownerId(v.linked_by_id), linked_at: w.timestamp(v.linked_at) };
  });
  if (w.has(r, "shares")) out.shares = w.items(r.shares).map(item => {
    const v = w.record(item, ["id", "grant_type", "grantee_id", "expires_at", "revoked_at", "revoked_by_id", "created_by_id", "created_at"]);
    return { id: w.id(v.id), grant_type: w.oneOf(v.grant_type, ["user", "team"] as const), grantee_id: w.ownerId(v.grantee_id), expires_at: w.nullable(v.expires_at, w.timestamp), revoked_at: w.nullable(v.revoked_at, w.timestamp), revoked_by_id: w.nullable(v.revoked_by_id, w.ownerId), created_by_id: w.ownerId(v.created_by_id), created_at: w.timestamp(v.created_at) };
  });
  return out;
}
export function libraryPage(value: unknown): CommercialDocumentPage {
  const r = w.record(value, ["items", "total", "page", "per_page"]);
  return { items: w.items(r.items).map(libraryDocument), total: w.integer(r.total, true), page: w.integer(r.page), per_page: w.integer(r.per_page) };
}
export function nativeDocument(value: unknown): CrmNativeDocument {
  const r = w.record(value, ["id", "type", "version", "state", "number", "currency", "quoted_amount", "invoiced_amount", "paid_amount", "financial_applicability", "valid_from", "valid_until"]);
  const type = w.documentType(r.type);
  const fiscal = type === "quote" || type === "invoice";
  if (r.financial_applicability !== (fiscal ? "applicable" : "not_applicable")) throw new TypeError("Factuarea: native document financial applicability does not match its owner.");
  const amount = (value: unknown): CrmDocumentDecimal | null => {
    if (fiscal) return w.decimal(value);
    if (value !== null) throw new TypeError("Factuarea: non-fiscal document amounts must remain null.");
    return null;
  };
  return { id: w.ownerId(r.id), type, version: w.version(r.version), state: w.text(r.state, 100), number: w.nullable(r.number, v => w.text(v, 100)), currency: w.currency(r.currency), quoted_amount: amount(r.quoted_amount), invoiced_amount: amount(r.invoiced_amount), paid_amount: amount(r.paid_amount), financial_applicability: fiscal ? "applicable" : "not_applicable", valid_from: w.nullable(r.valid_from, w.date), valid_until: w.nullable(r.valid_until, w.date) };
}
export function opportunityLink(value: unknown): OpportunityDocumentLink {
  const r = w.record(value, ["id", "version", "opportunity_id", "document_type", "document_id", "is_primary", "status", "document"]);
  const out = { id: w.id(r.id), version: w.version(r.version), opportunity_id: w.id(r.opportunity_id), document_type: w.documentType(r.document_type), document_id: w.ownerId(r.document_id), is_primary: w.boolean(r.is_primary), status: w.text(r.status, 100), document: w.nullable(r.document, nativeDocument) };
  if (out.document !== null && (out.document.type !== out.document_type || !w.sameId(out.document.id, out.document_id))) throw new TypeError("Factuarea: association references another native document.");
  return out;
}
export function unlinkReceipt(value: unknown): OpportunityDocumentUnlinkReceipt {
  const r = w.record(value, ["id", "version", "opportunity_id", "document_type", "document_id"]);
  return { id: w.id(r.id), version: w.version(r.version), opportunity_id: w.id(r.opportunity_id), document_type: w.documentType(r.document_type), document_id: w.ownerId(r.document_id) };
}
export function opportunityPage(value: unknown): OpportunityDocumentPage {
  const r = w.record(value, ["opportunity_id", "items", "next_cursor", "total", "pending_count"]);
  const parent = w.id(r.opportunity_id);
  const items = w.items(r.items).map(opportunityLink);
  if (items.some(item => !w.sameId(item.opportunity_id, parent))) throw new TypeError("Factuarea: document page contains another Opportunity.");
  return { opportunity_id: parent, items, next_cursor: w.nullable(r.next_cursor, v => w.text(v, 8192)), total: w.integer(r.total, true), pending_count: w.integer(r.pending_count, true) };
}
function candidate(value: unknown): OpportunityDocumentCandidate {
  const r = w.record(value, ["id", "type", "revision", "state", "label", "currency", "valid_from", "valid_until", "financial_applicability"]);
  const type = w.documentType(r.type);
  const applicability = type === "quote" || type === "invoice" ? "applicable" : "not_applicable";
  if (r.financial_applicability !== applicability) throw new TypeError("Factuarea: candidate financial applicability does not match its owner.");
  return { id: w.ownerId(r.id), type, revision: w.version(r.revision), state: w.text(r.state, 100), label: w.nullable(r.label, v => w.text(v, 255)), currency: w.currency(r.currency), valid_from: w.nullable(r.valid_from, w.date), valid_until: w.nullable(r.valid_until, w.date), financial_applicability: applicability };
}
export function candidatePage(value: unknown): OpportunityDocumentCandidatePage {
  const r = w.record(value, ["opportunity_id", "document_type", "items", "next_cursor", "available", "unavailable_reason"]);
  const type = w.documentType(r.document_type);
  const items = w.items(r.items).map(candidate);
  const available = w.boolean(r.available);
  const reason = w.nullable(r.unavailable_reason, v => w.text(v, 255));
  const cursor = w.nullable(r.next_cursor, v => w.text(v, 32768));
  if (items.some(item => item.type !== type) || (available && reason !== null) || (!available && (reason === null || items.length !== 0 || cursor !== null))) throw new TypeError("Factuarea: unavailable candidates cannot fabricate items or a cursor.");
  return { opportunity_id: w.id(r.opportunity_id), document_type: type, items, next_cursor: cursor, available, unavailable_reason: reason };
}
export function financialSummary(value: unknown): OpportunityDocumentFinancialSummary {
  const r = w.record(value, ["opportunity_id", "version", "currencies"]);
  const seen = new Set<string>();
  const currencies = w.items(r.currencies).map(item => {
    const v = w.record(item, ["currency", "forecast", "quoted", "invoiced", "paid"]);
    const currency = w.currency(v.currency);
    if (seen.has(currency)) throw new TypeError("Factuarea: currency buckets cannot be repeated or aggregated by the SDK.");
    seen.add(currency);
    return { currency, forecast: w.decimal(v.forecast, 4), quoted: w.decimal(v.quoted), invoiced: w.decimal(v.invoiced), paid: w.decimal(v.paid) };
  });
  return { opportunity_id: w.id(r.opportunity_id), version: w.version(r.version), currencies };
}

/** Validate real request shapes before retaining their immutable original JSON. */
export function writeBody(operation: CrmDocumentWriteOperation, body: unknown): Record<string, unknown> {
  const fields = { upload: ["title", "producer_reference_id", "claimed_mime"], replaceVersion: ["expected_version", "producer_reference_id", "claimed_mime"], share: ["expected_version", "grant_type", "grantee_id"], revokeShare: ["expected_version", "share_id"], archive: ["expected_version"], unlink: ["expected_version"], link: ["document_type", "document_id", "is_primary"], createQuote: ["quote_draft"] } as const;
  const r = w.record(body, fields[operation], operation === "share" ? ["expires_at"] : operation === "createQuote" ? ["contact_id"] : []);
  const out: Record<string, unknown> = {};
  if ("expected_version" in r) out.expected_version = w.expectedVersion(r.expected_version);
  if (operation === "upload") out.title = w.cleanText(r.title, 255);
  if (operation === "upload" || operation === "replaceVersion") { out.producer_reference_id = w.id(r.producer_reference_id); out.claimed_mime = w.mime(r.claimed_mime); }
  if (operation === "share") {
    out.grant_type = w.oneOf(r.grant_type, ["user", "team"] as const);
    out.grantee_id = out.grant_type === "user" ? w.ownerId(r.grantee_id) : w.id(r.grantee_id);
    if (w.has(r, "expires_at")) out.expires_at = w.nullable(r.expires_at, w.timestamp);
  }
  if (operation === "revokeShare") out.share_id = w.id(r.share_id);
  if (operation === "link") { out.document_type = w.documentType(r.document_type); out.document_id = w.ownerId(r.document_id); out.is_primary = w.boolean(r.is_primary); }
  if (operation === "createQuote") {
    const draft = w.record(r.quote_draft, ["date", "recipient"], ["expiry_date", "series_id", "client_id", "notes", "terms", "expected_root_version", "expected_line_version"]);
    const recipient = w.record(draft.recipient, ["kind"], ["id"]);
    const kind = w.oneOf(recipient.kind, ["unassigned", "commercial_counterparty", "business_contact"] as const);
    const target: Record<string, unknown> = { kind };
    if (kind !== "unassigned") target.id = w.id(recipient.id);
    else if (w.has(recipient, "id")) { if (recipient.id !== null) throw new TypeError("Factuarea: unassigned recipient cannot have an id."); target.id = null; }
    const quote: Record<string, unknown> = { date: w.date(draft.date), recipient: target };
    if (w.has(draft, "expiry_date")) { const expiry = w.nullable(draft.expiry_date, w.date); if (expiry !== null && expiry < String(quote.date)) throw new TypeError("Factuarea: quote expiry precedes its date."); quote.expiry_date = expiry; }
    for (const key of ["series_id", "client_id"] as const) if (w.has(draft, key)) quote[key] = w.nullable(draft[key], w.ownerId);
    if (quote.client_id != null && kind !== "business_contact") throw new TypeError("Factuarea: customer id requires a business-contact recipient.");
    for (const key of ["notes", "terms"] as const) if (w.has(draft, key)) quote[key] = w.nullable(draft[key], v => w.text(v, 262144, true));
    for (const key of ["expected_root_version", "expected_line_version"] as const) if (w.has(draft, key)) quote[key] = w.expectedVersion(draft[key]);
    out.quote_draft = quote;
    if (w.has(r, "contact_id")) out.contact_id = w.nullable(r.contact_id, w.id);
  }
  return out;
}
