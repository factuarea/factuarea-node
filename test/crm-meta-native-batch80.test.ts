import { describe, expect, it, vi } from "vitest";
import { CrmMetaNativeBatch80, META_NATIVE_FINE_SCOPE, META_NATIVE_OPERATION, META_NATIVE_OAUTH_SCOPE, META_NATIVE_ROUTES, MetaNativeError, type MetaMappingInput, type MetaConsentInput } from "../src/index.js";

const connection="01900000-0000-7000-8000-000000000001", form="01900000-0000-7000-8000-000000000002", credential="01900000-0000-4000-8000-000000000003";
const page="90071992547409931234567890123456", state="01900000-0000-7000-8000-000000000004", digest="a".repeat(64);
const mapping=[{remote_name:"Àngela 山",target:"name",type:"text" as const,field_version:null,required:true,options:{}}];
const inspectBody={credential_uuid:credential,remote_form_id:"12345678901234567890123456789012"};
const publish: MetaMappingInput={...inspectBody,mapping,expected_mapping_version:null,expected_publication_version:9007199254740991,fields_snapshot_checksum:digest,confirmed:true};
const consent:MetaConsentInput={credential_uuid:credential,grants:[{stream:form,actions:["read","ingest"]}],expected_consent_version:null,confirmed:true};
const publication={status:"mapping_published",connection_uuid:connection,credential_uuid:credential,form_uuid:form,page_id:page,remote_form_id:inspectBody.remote_form_id,mapping_version:4,publication_version:publish.expected_publication_version,fields_snapshot_checksum:digest,mapping};
const snapshot={z:[{version:7,options:[{id:form,name:"Original"}]}],a:{required:true}};
const inspection={status:"mapping_inspected",connection_uuid:connection,credential_uuid:credential,form_uuid:form,page_id:page,remote_form_id:inspectBody.remote_form_id,app_id:"123",responsible_uuid:credential,remote_field_names:["Àngela 山"],publication_version:9,authorization_version:2,configuration_version:3,fields_snapshot_checksum:digest,expected_mapping_version:null,expected_consent_version:null,destination:{basic_fields:["name","notes"],required_basic_fields:["name"],allowed_field_ids:[form],required_field_ids:[],fields_snapshot:snapshot},app_review:{available:false,reason:"app_review_evidence_unavailable"}};
function reply(body:unknown,status=200,headers:Record<string,string>={}):Response{return new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json","X-Request-Id":"native-request",...headers}});}
function client(fetcher: ReturnType<typeof vi.fn>, auth: "oauth"|"apiKey"="oauth") {return new CrmMetaNativeBatch80({...(auth==="oauth"?{oauthBearer:"native-token"}:{apiKey:"fact_test_actual"}),baseUrl:"https://sdk.invalid/v1",factuareaVersion:"2026-10-10",fetch:fetcher as typeof fetch});}

describe("native human Meta seven carriers",()=>{
 it("uses actual qualified IDs and scopes with Query inspect",()=>{
  expect(Object.values(META_NATIVE_ROUTES).map(r=>r.operationId)).toEqual(["prepareCrmMetaOAuth","completeCrmMetaOAuth","listCrmMetaConnectionOptions","getCrmMetaMapping","inspectCrmMetaMapping","publishCrmMetaMapping","publishCrmMetaConsent"]);
  expect([META_NATIVE_OPERATION,META_NATIVE_FINE_SCOPE,META_NATIVE_OAUTH_SCOPE]).toEqual(["crm_connections.configure","crm_connections:write","crm_connections.write"]);
 });
 it("dispatches seven exact routes independently and preserves the real unavailable consent",async()=>{
  const fetcher=vi.fn().mockResolvedValueOnce(reply({authorization_url:"https://www.facebook.com/dialog/oauth?state="+state,state}))
   .mockResolvedValueOnce(reply({status:"credentials_installed",connection_uuid:connection,credential_uuid:credential,page_id:page,scopes:["ads_management","leads_retrieval","pages_manage_ads","pages_manage_metadata","pages_read_engagement","pages_show_list"]}))
   .mockResolvedValueOnce(reply({data:{options:[{connection_uuid:connection,credential_uuid:credential,page_id:page,page_name:null}]}}))
   .mockResolvedValueOnce(reply({data:publication})).mockResolvedValueOnce(reply({data:inspection})).mockResolvedValueOnce(reply({data:publication}))
   .mockResolvedValueOnce(reply({error:"meta_oauth_unavailable"},503));
  const sdk=client(fetcher);
  expect((await sdk.prepareCrmMetaOAuth({page_id:page,confirmed:true})).data.state).toBe(state);
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect((await sdk.completeCrmMetaOAuth({state,code:"actual-human-code"})).data.scopes).toEqual(["ads_management","leads_retrieval","pages_manage_ads","pages_manage_metadata","pages_read_engagement","pages_show_list"]);
  await sdk.listCrmMetaConnectionOptions(); await sdk.getCrmMetaMapping(connection,form); const inspected=await sdk.inspectCrmMetaMapping(connection,form,inspectBody);
  expect(inspected.data.data.destination.fields_snapshot).toEqual(snapshot); expect(Object.keys(inspected.data.data.destination.fields_snapshot)).toEqual(["z","a"]); expect(Object.isFrozen(inspected.data.data.destination.fields_snapshot)).toBe(true);
  expect(inspected.data.data.app_review.available).toBe(false); expect(inspected.rawBody).toBe(JSON.stringify({data:inspection}));
  await sdk.publishCrmMetaMapping(connection,form,publish);
  await expect(sdk.publishCrmMetaConsent(connection,consent)).rejects.toMatchObject({status:503,reason:"unavailable",unconfirmed:false});
  expect(fetcher).toHaveBeenCalledTimes(7);
  const expected=["/oauth/prepare","/oauth/complete","/options",`/${connection}/mappings/${form}`,`/${connection}/mappings/${form}/inspect`,`/${connection}/mappings/${form}`,`/${connection}/consent`];
  for(const [i,args] of fetcher.mock.calls.entries()) { expect(args[0]).toBe("https://sdk.invalid/v1/crm/connections/meta-lead-ads"+expected[i]); const init=args[1] as RequestInit; const h=new Headers(init.headers); expect(init.redirect).toBe("error");expect(h.get("Authorization")).toBe("Bearer native-token"); expect(h.has("Idempotency-Key")).toBe(false); expect(h.has("X-API-Key")).toBe(false);expect(h.get("Factuarea-Version")).toBe("2026-10-10"); }
  expect(fetcher.mock.calls[2]?.[1].body).toBeUndefined(); expect(fetcher.mock.calls[3]?.[1].body).toBeUndefined(); expect(JSON.parse(fetcher.mock.calls[5]?.[1].body).mapping[0].options).toEqual({});
 });
 it("captures human choices before resolving the genuine current OAuth provider",async()=>{
  let release!:()=>void; const pending=new Promise<void>(r=>{release=r}); let token="current-native"; const fetcher=vi.fn().mockResolvedValue(reply({authorization_url:"https://www.facebook.com/dialog/oauth",state}));
  const sdk=new CrmMetaNativeBatch80({oauthBearer:async()=>{await pending;return token;},fetch:fetcher as typeof fetch}); const body={page_id:page,confirmed:true as const}; const result=sdk.prepareCrmMetaOAuth(body); body.page_id="888"; token="actual-descendant"; release(); await result;
  expect(JSON.parse(fetcher.mock.calls[0]?.[1].body).page_id).toBe(page);expect(new Headers(fetcher.mock.calls[0]?.[1].headers).get("Authorization")).toBe("Bearer actual-descendant");expect(fetcher).toHaveBeenCalledTimes(1);
 });
 it.each([401,409,429,503,307])("native status %i is one dispatch and closed secret-free facts",async(status)=>{
  const fetcher=vi.fn().mockResolvedValue(reply({error:status===503?"meta_oauth_unconfirmed":status===429?"meta_oauth_rate_limited":"meta_oauth_mapping_conflict",provider_body:"secret-code-and-state"},status,status===307?{Location:"https://foreign.invalid"}:status===429?{"Retry-After":"7"}:{}));
  try {await client(fetcher).completeCrmMetaOAuth({state,code:"secret-code-and-state"});expect.fail();}catch(error){expect(error).toBeInstanceOf(MetaNativeError);expect(String(error)).not.toContain("secret-code-and-state");expect((error as MetaNativeError).status).toBe(status);if(status===429)expect((error as MetaNativeError).retryAfter).toBe(7);} expect(fetcher).toHaveBeenCalledTimes(1);
 });
 it("network failure never replays completion; inspect remains a failed query",async()=>{
  const fetcher=vi.fn().mockRejectedValue(new Error("secret-code-and-state"));
  await expect(client(fetcher).completeCrmMetaOAuth({state,code:"secret-code-and-state"})).rejects.toMatchObject({reason:"unconfirmed",unconfirmed:true});
  await expect(client(fetcher).inspectCrmMetaMapping(connection,form,inspectBody)).rejects.toMatchObject({reason:"transport_failure",unconfirmed:false});expect(fetcher).toHaveBeenCalledTimes(2);
 });
 it("genuine API keys stay actual API keys and cannot masquerade as OAuth",async()=>{
  const fetcher=vi.fn().mockResolvedValue(reply({data:{options:[]}}));await client(fetcher,"apiKey").listCrmMetaConnectionOptions();expect(new Headers(fetcher.mock.calls[0]?.[1].headers).get("Authorization")).toBe("Bearer fact_test_actual");
  expect(()=>new CrmMetaNativeBatch80({oauthBearer:"fact_test_actual"})).toThrow();expect(()=>new CrmMetaNativeBatch80({apiKey:"fact_test_actual",oauthBearer:"native"})).toThrow();
 });
 it.each([
  {...publish,confirmed:false},{...publish,expected_mapping_version:0},{...publish,expected_publication_version:9007199254740992},{...publish,company_id:connection},
  {...publish,mapping:[{...mapping[0],options:[]}]},{...publish,mapping:[...mapping,...mapping]}, {...publish,mapping:[{...mapping[0],type:"select",options:{"answer":form}}]},
 ])("rejects fabricated context/CAS/options before HTTP %#",async(body)=>{const fetcher=vi.fn(); await expect(client(fetcher).publishCrmMetaMapping(connection,form,body as MetaMappingInput)).rejects.toThrow(TypeError);expect(fetcher).not.toHaveBeenCalled();});
 it("rejects changed native binding and invented Review approval",async()=>{
  for(const bad of [{...inspection,credential_uuid:connection},{...inspection,form_uuid:connection},{...inspection,app_review:{available:true,reason:"approved"}}]) {const fetcher=vi.fn().mockResolvedValue(reply({data:bad}));await expect(client(fetcher).inspectCrmMetaMapping(connection,form,inspectBody)).rejects.toMatchObject({reason:"invalid_native_response",unconfirmed:false});expect(fetcher).toHaveBeenCalledTimes(1);}
 });
 it("does not permit serialization hooks to inject authority after input validation",async()=>{
  const fetcher=vi.fn();const body={page_id:page,confirmed:true as const};Object.defineProperty(body,"toJSON",{value:()=>({...body,company_id:connection})});await expect(client(fetcher).prepareCrmMetaOAuth(body)).rejects.toThrow(TypeError);expect(fetcher).not.toHaveBeenCalled();
 });
 it("hides token-provider failures and honours already-aborted queries without HTTP",async()=>{
  const fetcher=vi.fn();const sdk=new CrmMetaNativeBatch80({oauthBearer:()=>{throw new Error("secret-state");},fetch:fetcher as typeof fetch});await expect(sdk.listCrmMetaConnectionOptions()).rejects.toMatchObject({reason:"credential_unavailable"});const signal=AbortSignal.abort();await expect(client(fetcher).listCrmMetaConnectionOptions(signal)).rejects.toMatchObject({reason:"cancelled"});expect(fetcher).not.toHaveBeenCalled();
 });
 it("uses native byte limits and rejects installations missing the actual Meta permission union",async()=>{
  const fetcher=vi.fn().mockResolvedValue(reply({status:"credentials_installed",connection_uuid:connection,credential_uuid:credential,page_id:page,scopes:["leads_retrieval"]}));
  await expect(client(fetcher).completeCrmMetaOAuth({state,code:"é".repeat(4097)})).rejects.toThrow(TypeError);expect(fetcher).not.toHaveBeenCalled();
  await expect(client(fetcher).completeCrmMetaOAuth({state,code:"actual-code"})).rejects.toMatchObject({reason:"invalid_native_response",unconfirmed:true});expect(fetcher).toHaveBeenCalledTimes(1);
 });
 it.each([["crm_access_denied","crm_access_denied"],["secret_code_and_state","native_rejection"]])("retains actual C7 code and closes unrecognized provider strings %s",async(code,expected)=>{
  const fetcher=vi.fn().mockResolvedValue(reply({error:{code,message:"secret_code_and_state"}},403));
  await expect(client(fetcher).listCrmMetaConnectionOptions()).rejects.toMatchObject({status:403,reason:expected});expect(fetcher).toHaveBeenCalledTimes(1);
 });
});
