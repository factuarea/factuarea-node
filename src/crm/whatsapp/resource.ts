import { HttpClient, type ApiResponse } from "../../core/http-client.js";
import { CrmWhatsAppSendIntent } from "./intent.js";
import { delivery, digest, keys, object, preparation, template, uuid, type WhatsAppDeliveryReceipt, type WhatsAppOriginalReceipt, type WhatsAppOriginalCheckpoint, type WhatsAppPreparation, type WhatsAppPurpose, type WhatsAppTemplate } from "./types.js";
export class WhatsAppSendUnconfirmedError extends Error {
  constructor(readonly intent: CrmWhatsAppSendIntent, override readonly cause: unknown, readonly requestId: string | null = null) { super("WhatsApp send is unconfirmed. Retain this intent and query its original; never resend automatically."); this.name="WhatsAppSendUnconfirmedError"; }
}
export class CrmWhatsAppResource {
  readonly #preparations=new WeakMap<WhatsAppPreparation,string>(); readonly #intents=new WeakMap<CrmWhatsAppSendIntent,string>(); readonly #sent=new Set<string>();
  constructor(private readonly http: HttpClient) {}
  #native(): void { if((this.http.authModel!=="api_key" || this.http.environment==="unknown")) throw new TypeError("The native catalog currently requires an actual API key for WhatsApp conversation operations."); }
  #path(conversation: string, message: string, action: string): string { if(!uuid(conversation)||!uuid(message)) throw new TypeError("Native conversation and message UUIDv7 are required."); return `/crm/conversation/${conversation}/messages/${message}/whatsapp-cloud/${action}`; }
  async prepareCrmWhatsAppMessage(conversation: string, message: string, purpose: WhatsAppPurpose, options: { template?: WhatsAppTemplate; previous?: WhatsAppPreparation; signal?: AbortSignal } = {}): Promise<ApiResponse<{data:WhatsAppPreparation}>> {
    this.#native(); if(!["contact_request","marketing"].includes(purpose)) throw new TypeError("Invalid native WhatsApp purpose.");
    const fingerprint=await this.http.requestContextFingerprint(); const previous=options.previous;
    if(previous && (this.#preparations.get(previous)!==fingerprint || previous.conversation_id!==conversation || previous.message_id!==message || previous.purpose!==purpose)) throw new TypeError("Revalidation requires the same current credential and preparation.");
    if(!previous && this.#sent.has(`${conversation}/${message}`)) throw new TypeError("An attempted send must retain its original effect.");
    const chosen=previous?.template ?? (options.template === undefined ? null : template(options.template));
    if(previous && options.template!==undefined && JSON.stringify(template(options.template))!==JSON.stringify(previous.template)) throw new TypeError("Revalidation cannot change the original template.");
    const response=await this.http.request<unknown>({method:"GET",path:this.#path(conversation,message,"preparation"),query:{purpose,...(chosen===null?{}:{template:JSON.stringify(chosen)}),...(previous?{preparation_token:previous.preparation_token}:{})},signal:options.signal,autoIdempotency:false,maxRetries:0,noRedirects:true,contextFingerprint:fingerprint});
    const p=preparation(response.data,conversation,message);
    if(p.purpose!==purpose || JSON.stringify(p.template)!==JSON.stringify(chosen) || (previous && JSON.stringify(p)!==JSON.stringify(previous))) throw new TypeError("Native revalidation changed the sealed preparation.");
    this.#preparations.set(p,fingerprint); return {...response,data:{data:p}};
  }
  prepareSend(p: WhatsAppPreparation, firstWire?: string): CrmWhatsAppSendIntent { const fingerprint=this.#preparations.get(p); if(!fingerprint) throw new TypeError("Use a preparation issued to this client."); const intent=new CrmWhatsAppSendIntent(p,firstWire); this.#intents.set(intent,fingerprint); return intent; }
  exportIntent(intent: CrmWhatsAppSendIntent): WhatsAppOriginalCheckpoint {
    const fingerprint=this.#intents.get(intent); if(!fingerprint) throw new TypeError("Retain the original intent issued to this client.");
    return Object.freeze({format:"factuarea.crm.whatsapp.v1",preparation:intent.preparation,first_wire:intent.firstWire,wire_hash:intent.originalWireHash,context_fingerprint:fingerprint,dispatched:this.#sent.has(intent.preparation.effect_id)});
  }
  /** Restored checkpoints are read-only, regardless of their stored dispatched flag. */
  async restoreOriginal(checkpoint: unknown): Promise<CrmWhatsAppSendIntent> {
    this.#native(); const c=object(checkpoint); keys(c,["format","preparation","first_wire","wire_hash","context_fingerprint","dispatched"]);
    const native=object(c.preparation);
    if(c.format!=="factuarea.crm.whatsapp.v1" || !uuid(native.conversation_id) || !uuid(native.message_id) || typeof c.first_wire!=="string" || !digest(c.wire_hash) || !digest(c.context_fingerprint) || typeof c.dispatched!=="boolean" || c.context_fingerprint!==await this.http.requestContextFingerprint()) throw new TypeError("The original checkpoint requires its exact current credential and context.");
    const p=preparation({data:native},native.conversation_id,native.message_id); const intent=new CrmWhatsAppSendIntent(p,c.first_wire);
    if(intent.originalWireHash!==c.wire_hash) throw new TypeError("The original checkpoint wire changed.");
    this.#preparations.set(p,c.context_fingerprint); this.#intents.set(intent,c.context_fingerprint); this.#sent.add(p.effect_id); this.#sent.add(`${p.conversation_id}/${p.message_id}`); return intent;
  }
  async sendCrmWhatsAppMessage(intent: CrmWhatsAppSendIntent, signal?: AbortSignal): Promise<ApiResponse<{data:WhatsAppDeliveryReceipt}>> {
    this.#native(); const fingerprint=this.#intents.get(intent); if(!fingerprint || fingerprint!==await this.http.requestContextFingerprint()) throw new TypeError("Send requires the original current credential and sealed intent.");
    const p=intent.preparation; if(this.#sent.has(p.effect_id)) throw new TypeError("This effect was already dispatched. Query its original.");
    this.#sent.add(p.effect_id); this.#sent.add(`${p.conversation_id}/${p.message_id}`);
    let requestId: string | null = null;
    try { const response=await this.http.request<unknown>({method:"POST",path:this.#path(p.conversation_id,p.message_id,"send"),rawBody:intent.firstWire,autoIdempotency:false,signal,maxRetries:0,noRedirects:true,contextFingerprint:fingerprint}); requestId=response.requestId; return {...response,data:{data:delivery(object(response.data).data)}}; }
    catch(cause) { if(cause && typeof cause==="object" && "status" in cause && typeof cause.status==="number" && cause.status>=400 && cause.status<500) throw cause; throw new WhatsAppSendUnconfirmedError(intent,cause, requestId ?? (cause && typeof cause==="object" && "requestId" in cause && typeof cause.requestId==="string" ? cause.requestId : null)); }
  }
  async getCrmWhatsAppMessageOriginal(intent: CrmWhatsAppSendIntent, signal?: AbortSignal): Promise<ApiResponse<{data:WhatsAppOriginalReceipt}>> {
    this.#native(); const fingerprint=this.#intents.get(intent); if(!fingerprint) throw new TypeError("Retain the original intent issued to this client."); const p=intent.preparation;
    const response=await this.http.request<unknown>({method:"GET",path:this.#path(p.conversation_id,p.message_id,"original"),query:{original_wire:intent.firstWire},signal,autoIdempotency:false,maxRetries:0,noRedirects:true,contextFingerprint:fingerprint});
    const r=object(object(response.data).data); keys(r,["state","conversation_id","message_id","effect_id","original_wire_hash","preparation_digest","receipt"]);
    if(r.conversation_id!==p.conversation_id||r.message_id!==p.message_id||r.effect_id!==p.effect_id||r.original_wire_hash!==intent.originalWireHash||r.preparation_digest!==p.snapshot_digest||!["not_found","confirmed","unconfirmed","failed"].includes(String(r.state))) throw new TypeError("Native original does not match its retained intent.");
    const receipt=r.receipt===null?null:delivery(r.receipt); if(r.state==="not_found"?receipt!==null:receipt?.status!==r.state) throw new TypeError("Native original has an inconsistent receipt.");
    return {...response,data:{data:Object.freeze({...r,receipt}) as unknown as WhatsAppOriginalReceipt}};
  }
}
