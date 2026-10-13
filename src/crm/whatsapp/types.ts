export type WhatsAppPurpose = "contact_request" | "marketing";
export interface WhatsAppTemplate { readonly id: string; readonly name: string; readonly language: string; readonly category: "MARKETING" | "UTILITY" | "AUTHENTICATION"; readonly parameters: readonly string[] }
export interface WhatsAppPreparation {
  readonly conversation_id: string; readonly message_id: string; readonly effect_id: string;
  readonly expected_version: number; readonly message_version: number; readonly purpose: WhatsAppPurpose;
  readonly sender: Readonly<{ channel: "whatsapp"; phone: string; name: string | null }>;
  readonly recipient: Readonly<{ channel: "whatsapp"; phone: string; name: string | null; kind: "to" }>;
  readonly body: string; readonly template: WhatsAppTemplate | null; readonly preparation_token: string;
  readonly snapshot_digest: string; readonly authorization_version: string;
}
export interface WhatsAppDeliveryReceipt { readonly status: "confirmed" | "unconfirmed" | "failed"; readonly provider_message_id: string | null; readonly submitted_at: string | null; readonly reason_code: string | null }
export interface WhatsAppOriginalReceipt { readonly state: "not_found" | "confirmed" | "unconfirmed" | "failed"; readonly conversation_id: string; readonly message_id: string; readonly effect_id: string; readonly original_wire_hash: string; readonly preparation_digest: string; readonly receipt: WhatsAppDeliveryReceipt | null }
export const uuid = (v: unknown): v is string => typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
export const digest = (v: unknown): v is string => typeof v === "string" && /^[0-9a-f]{64}$/.test(v);
export function object(v: unknown): Record<string, unknown> { if (!v || typeof v !== "object" || Array.isArray(v)) throw new TypeError("Invalid native WhatsApp object."); return v as Record<string, unknown>; }
export function keys(v: Record<string, unknown>, expected: readonly string[]): void { if (Object.keys(v).length !== expected.length || expected.some(k => !Object.hasOwn(v,k))) throw new TypeError("Invalid native WhatsApp fields."); }
export function text(v: unknown, maximum: number): v is string { return typeof v === "string" && v.length > 0 && Buffer.byteLength(v, "utf8") <= maximum && Buffer.from(v,"utf8").toString("utf8") === v; }
export function template(v: unknown): WhatsAppTemplate | null {
  if (v === null) return null;
  const t = object(v); keys(t,["id","name","language","category","parameters"]);
  if (typeof t.id!=="string" || !/^[1-9][0-9]{0,63}$/.test(t.id) || typeof t.name!=="string" || !/^[a-z][a-z0-9_]{0,511}$/.test(t.name) || typeof t.language!=="string" || !/^[a-z]{2,3}(?:_[A-Z]{2})?$/.test(t.language) || !["MARKETING","UTILITY","AUTHENTICATION"].includes(String(t.category)) || !Array.isArray(t.parameters) || t.parameters.length>100 || !t.parameters.every(x => typeof x === "string" && x.trim()!=="" && [...x].length<=4096 && Buffer.from(x,"utf8").toString("utf8")===x && !/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(x))) throw new TypeError("Invalid native WhatsApp template.");
  return Object.freeze({ id:t.id as string,name:t.name as string,language:t.language as string,category:t.category as WhatsAppTemplate["category"],parameters:Object.freeze([...t.parameters]) });
}
export function preparation(wire: unknown, conversation: string, message: string): WhatsAppPreparation {
  const p = object(object(wire).data);
  keys(p,["conversation_id","message_id","effect_id","expected_version","message_version","purpose","sender","recipient","body","template","preparation_token","snapshot_digest","authorization_version"]);
  if (p.conversation_id !== conversation || p.message_id !== message || !uuid(p.effect_id) || !Number.isSafeInteger(p.expected_version) || Number(p.expected_version) < 1 || !Number.isSafeInteger(p.message_version) || Number(p.message_version) < 1 || !["contact_request","marketing"].includes(String(p.purpose)) || !text(p.body,16384) || [...String(p.body)].length > 4096 || !text(p.preparation_token,65536) || !digest(p.snapshot_digest) || !text(p.authorization_version,255)) throw new TypeError("Invalid native WhatsApp preparation.");
  const party = (v: unknown, recipient: boolean) => { const a=object(v); keys(a,recipient?["channel","phone","name","kind"]:["channel","phone","name"]); if (a.channel !== "whatsapp" || typeof a.phone !== "string" || !/^\+[1-9][0-9]{5,14}$/.test(a.phone) || (a.name !== null && typeof a.name !== "string") || (recipient && a.kind !== "to")) throw new TypeError("Invalid native WhatsApp address."); return Object.freeze({...a}); };
  return Object.freeze({...p,sender:party(p.sender,false),recipient:party(p.recipient,true),template:template(p.template)}) as unknown as WhatsAppPreparation;
}
export function delivery(v: unknown): WhatsAppDeliveryReceipt {
  const r=object(v); keys(r,["status","provider_message_id","submitted_at","reason_code"]);
  if (!["confirmed","unconfirmed","failed"].includes(String(r.status)) || (r.provider_message_id !== null && (!text(r.provider_message_id,4096) || [...r.provider_message_id].length>1024 || r.provider_message_id.trim()==="" || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(r.provider_message_id))) || (r.submitted_at !== null && (typeof r.submitted_at !== "string" || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(r.submitted_at) || Number.isNaN(Date.parse(r.submitted_at)) || new Date(r.submitted_at).toISOString().replace(".000Z", "Z") !== r.submitted_at)) || (r.reason_code !== null && (typeof r.reason_code !== "string" || !/^[a-z][a-z0-9_]{0,63}$/.test(r.reason_code))) || (r.status === "confirmed" && r.submitted_at === null) || (r.status === "failed" && (r.provider_message_id !== null || r.submitted_at !== null || r.reason_code === null))) throw new TypeError("Invalid native WhatsApp receipt.");
  return Object.freeze({...r}) as unknown as WhatsAppDeliveryReceipt;
}

export interface WhatsAppOriginalCheckpoint { readonly format: "factuarea.crm.whatsapp.v1"; readonly preparation: WhatsAppPreparation; readonly first_wire: string; readonly wire_hash: string; readonly context_fingerprint: string; readonly dispatched: boolean }
