import { createHash } from "node:crypto";
import { describe, it, expect } from "vitest";
import { Factuarea } from "../src/client.js";
import { CrmWhatsAppSendIntent } from "../src/crm/whatsapp/intent.js";
import { WhatsAppSendUnconfirmedError } from "../src/crm/whatsapp/resource.js";
import type { WhatsAppPreparation } from "../src/crm/whatsapp/types.js";
const c="01900000-0000-7000-8000-000000000001",m="01900000-0000-7000-8000-000000000002",e="01900000-0000-7000-8000-000000000003";
const p:WhatsAppPreparation={conversation_id:c,message_id:m,effect_id:e,expected_version:3,message_version:4,purpose:"contact_request",sender:{channel:"whatsapp",phone:"+34611111111",name:null},recipient:{channel:"whatsapp",phone:"+34622222222",name:"Àngela 山",kind:"to"},body:"Hola 山",template:null,preparation_token:"opaque-server-sealed-token",snapshot_digest:"a".repeat(64),authorization_version:"current-C7"};
const receipt={status:"confirmed",provider_message_id:"wamid-native",submitted_at:"2026-10-10T11:00:00Z",reason_code:null};
const response=(data:unknown,status=200)=>new Response(JSON.stringify({data}),{status,headers:{"Content-Type":"application/json","X-Request-Id":"request-native"}});
function setup(replies:(Response|Error)[]) { const calls:{url:URL,init:RequestInit}[]=[];const sdk=new Factuarea({apiKey:"fact_test_actual",baseUrl:"https://native.invalid/v1",maxRetries:8,fetch:async(input,init)=>{calls.push({url:new URL(String(input)),init:init!});const next=replies.shift();if(next instanceof Error)throw next;if(!next)throw new Error("unexpected dispatch");return next;}});return {sdk,calls}; }
async function intent(sdk:Factuarea,raw?:string) { return sdk.whatsapp.prepareSend((await sdk.whatsapp.prepareCrmWhatsAppMessage(c,m,"contact_request")).data.data,raw); }
describe("native WhatsApp effect transport",()=>{
 it("uses native prepare, exact frozen seven-field SEND, then GET original without replay or key",async()=>{
  const raw=' \n'+JSON.stringify({preparation_token:p.preparation_token,template:null,purpose:p.purpose,message_version:4,expected_version:3,effect_id:e,conversation_id:c})+'\n';
  const hash=createHash("sha256").update(raw).digest("hex");
  const {sdk,calls}=setup([response(p),response(receipt),response({state:"confirmed",conversation_id:c,message_id:m,effect_id:e,original_wire_hash:hash,preparation_digest:p.snapshot_digest,receipt})]);
  const i=await intent(sdk,raw);expect(Object.isFrozen(i)).toBe(true);expect(Object.isFrozen(i.preparation)).toBe(true);
  expect((await sdk.whatsapp.sendCrmWhatsAppMessage(i)).data.data.status).toBe("confirmed");expect((await sdk.whatsapp.getCrmWhatsAppMessageOriginal(i)).data.data.state).toBe("confirmed");
  expect(calls.map(x=>[x.init.method,x.url.pathname])).toEqual([["GET",`/v1/crm/conversation/${c}/messages/${m}/whatsapp-cloud/preparation`],["POST",`/v1/crm/conversation/${c}/messages/${m}/whatsapp-cloud/send`],["GET",`/v1/crm/conversation/${c}/messages/${m}/whatsapp-cloud/original`]]);
  expect(calls[1]!.init.body).toBe(raw);expect([...calls[2]!.url.searchParams.keys()]).toEqual(["original_wire"]);expect(calls[2]!.url.searchParams.get("original_wire")).toBe(raw);
  for(const call of calls){const h=new Headers(call.init.headers);expect(h.get("Authorization")).toBe("Bearer fact_test_actual");expect(h.has("Idempotency-Key")).toBe(false);expect(h.has("X-API-Key")).toBe(false);expect(call.init.redirect).toBe("error");}
  await expect(sdk.whatsapp.sendCrmWhatsAppMessage(i)).rejects.toThrow("already dispatched");expect(calls).toHaveLength(3);
 });
 it.each([new Error("timeout"),response({},503),response({status:"pending",provider_message_id:null,submitted_at:null,reason_code:null})])("retains unknown effect and never resends",async failure=>{
  const {sdk,calls}=setup([response(p),failure]);const i=await intent(sdk);await expect(sdk.whatsapp.sendCrmWhatsAppMessage(i)).rejects.toBeInstanceOf(WhatsAppSendUnconfirmedError);await expect(sdk.whatsapp.sendCrmWhatsAppMessage(i)).rejects.toThrow("already dispatched");await expect(sdk.whatsapp.prepareCrmWhatsAppMessage(c,m,"contact_request")).rejects.toThrow("original effect");expect(calls).toHaveLength(2);
 });
 it.each([401,403,409,422,429])("preserves typed native rejection %s without retry",async status=>{const {sdk,calls}=setup([response(p),response({},status)]);const i=await intent(sdk);await expect(sdk.whatsapp.sendCrmWhatsAppMessage(i)).rejects.toMatchObject({status});expect(calls).toHaveLength(2);});
 it("rejects OAuth without inventing conversation grants",async()=>{let calls=0;const sdk=new Factuarea({oauthBearer:"actual-oauth",fetch:async()=>{calls++;return response(p);}});await expect(sdk.whatsapp.prepareCrmWhatsAppMessage(c,m,"contact_request")).rejects.toThrow("actual API key");expect(calls).toBe(0);});
 it("revalidates only same token/effect and rejects changed snapshot",async()=>{const {sdk,calls}=setup([response(p),response(p),response({...p,effect_id:m})]);const previous=(await sdk.whatsapp.prepareCrmWhatsAppMessage(c,m,"contact_request")).data.data;await sdk.whatsapp.prepareCrmWhatsAppMessage(c,m,"contact_request",{previous});expect(calls[1]!.url.searchParams.get("preparation_token")).toBe(p.preparation_token);await expect(sdk.whatsapp.prepareCrmWhatsAppMessage(c,m,"contact_request",{previous})).rejects.toThrow("changed");});
 it("rejects altered intent, foreign preparation and current credential drift before HTTP",async()=>{const {sdk,calls}=setup([response(p)]);const prepared=(await sdk.whatsapp.prepareCrmWhatsAppMessage(c,m,"contact_request")).data.data;expect(()=>sdk.whatsapp.prepareSend({...prepared})).toThrow("issued");expect(()=>new CrmWhatsAppSendIntent(prepared,JSON.stringify({...JSON.parse(new CrmWhatsAppSendIntent(prepared).firstWire),body:"injected"}))).toThrow("fields");const other=setup([]).sdk;await expect(other.whatsapp.getCrmWhatsAppMessageOriginal(sdk.whatsapp.prepareSend(prepared))).rejects.toThrow("issued");expect(calls).toHaveLength(1);});
 it.each(["not_found","unconfirmed","failed"])('preserves factual original %s without SEND',async state=>{const {sdk,calls}=setup([response(p)]);const i=await intent(sdk);const r=state==="not_found"?null:{status:state,provider_message_id:null,submitted_at:null,reason_code:"native_reason"};const native=response({state,conversation_id:c,message_id:m,effect_id:e,original_wire_hash:i.originalWireHash,preparation_digest:p.snapshot_digest,receipt:r});const fetchCalls=calls; // install response through the retained mock queue below
  const second=setup([response(p),native]);const j=await intent(second.sdk);expect((await second.sdk.whatsapp.getCrmWhatsAppMessageOriginal(j)).data.data.state).toBe(state);expect(second.calls.map(x=>x.init.method)).toEqual(["GET","GET"]);expect(fetchCalls).toHaveLength(1);
 });
 it("rejects an original with a foreign wire hash",async()=>{const {sdk}=setup([response(p),response({state:"not_found",conversation_id:c,message_id:m,effect_id:e,original_wire_hash:"b".repeat(64),preparation_digest:p.snapshot_digest,receipt:null})]);await expect(sdk.whatsapp.getCrmWhatsAppMessageOriginal(await intent(sdk))).rejects.toThrow("retained intent");});
 it("accepts native six-digit E164 and 512-character template name, retaining the selected native template",async()=>{
  const selected={id:"123",name:"a".repeat(512),language:"es_ES",category:"UTILITY" as const,parameters:["Hola 山"]};
  const prepared={...p,sender:{...p.sender,phone:"+123456"},template:selected};const {sdk,calls}=setup([response(prepared)]);
  const result=await sdk.whatsapp.prepareCrmWhatsAppMessage(c,m,"contact_request",{template:selected});expect(result.data.data.template).toEqual(selected);expect(JSON.parse(calls[0]!.url.searchParams.get("template")!)).toEqual(selected);
  const captured=sdk.whatsapp.prepareSend(result.data.data);expect(JSON.parse(captured.firstWire).template).toEqual(selected);
 });
 it("restores a durable original only for GET, even if the saved flag predates dispatch",async()=>{
  const first=setup([response(p)]);const captured=await intent(first.sdk);const checkpoint=JSON.parse(JSON.stringify(first.sdk.whatsapp.exportIntent(captured)));
  expect(checkpoint.dispatched).toBe(false);
  const restarted=setup([response({state:"not_found",conversation_id:c,message_id:m,effect_id:e,original_wire_hash:captured.originalWireHash,preparation_digest:p.snapshot_digest,receipt:null})]);
  const restored=await restarted.sdk.whatsapp.restoreOriginal(checkpoint);expect((await restarted.sdk.whatsapp.getCrmWhatsAppMessageOriginal(restored)).data.data.state).toBe("not_found");
  await expect(restarted.sdk.whatsapp.sendCrmWhatsAppMessage(restored)).rejects.toThrow("already dispatched");expect(restarted.calls.map(x=>x.init.method)).toEqual(["GET"]);
  const foreign=new Factuarea({apiKey:"fact_test_other",baseUrl:"https://native.invalid/v1",fetch:async()=>{throw new Error("foreign HTTP");}});await expect(foreign.whatsapp.restoreOriginal(checkpoint)).rejects.toThrow("exact current credential");
 });
 it("removes a configured generic HTTP key from every native effect request",async()=>{
  const seen:Headers[]=[];let writes=0;const sdk=new Factuarea({apiKey:"fact_test_actual",defaultHeaders:{"Idempotency-Key":"unrelated-generic-key"},fetch:async(_url,init)=>{seen.push(new Headers(init?.headers));if(init?.method==="POST"){writes++;return response(receipt);}return response(p);}});
  const i=await intent(sdk);await sdk.whatsapp.sendCrmWhatsAppMessage(i);expect(writes).toBe(1);expect(seen.every(h=>!h.has("Idempotency-Key"))).toBe(true);
 });
});
