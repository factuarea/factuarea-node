import sdk = require("@factuarea/sdk");
function checkInstalledCommonJsDeclarations(): void {
  const entity = sdk.crmUuid("019aaaaa-aaaa-7aaa-8aaa-aaaaaaaaaaaa");
  const client = new sdk.Factuarea({ oauthBearer: "fixture_compile_only" });
  const payload: sdk.CrmLeadCreate = { name: "Installed CJS types", email: null };
  const intent = client.crm.prepareLeadCreate("cjs-types", payload);
  const request: Promise<sdk.ApiResponse<{ data: sdk.CrmLead | sdk.CrmLeadIdentity }>> = client.crm.createLead(intent);
  // @ts-expect-error Public CJS declarations retain native branded identifiers.
  const invalid: sdk.CrmActivityCreate = { type: "note", title: "Installed CJS", target: { type: "lead", id: "123" }, timezone: "UTC" };
  void [entity, request, invalid];
}
void checkInstalledCommonJsDeclarations;
