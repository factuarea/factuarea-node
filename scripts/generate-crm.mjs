import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

process.umask(0o022);
const root = new URL("../", import.meta.url);
const nativeBytes = readFileSync(new URL("spec/crm-native77.json", root));
const spec = JSON.parse(nativeBytes.toString("utf8"));
const previousSource = JSON.parse(readFileSync(new URL("spec/crm-native-source.json", root), "utf8"));
const previousBytes = readFileSync(new URL("spec/crm-native.json", root));
const previousSpec = JSON.parse(previousBytes.toString("utf8"));
const nativeSource = JSON.parse(readFileSync(new URL("spec/crm-native77-source.json", root), "utf8"));
if (createHash("sha256").update(nativeBytes).digest("hex") !== nativeSource.full_native_export.sha256) throw new Error("Native CRM contract hash differs from its Source handoff; reconcile before generation.");
if (createHash("sha256").update(previousBytes).digest("hex") !== nativeSource.immutable_previous49.sha256) throw new Error("Previous Source49 changed.");
for (const [path, methods] of Object.entries(previousSpec.paths)) for (const [method, operation] of Object.entries(methods)) {
  if (JSON.stringify(spec.paths[path]?.[method]) !== JSON.stringify(operation)) throw new Error(`Previous Source49 operation changed: ${method} ${path}`);
}
for (const [name, schema] of Object.entries(previousSpec.components.schemas)) {
  if (JSON.stringify(spec.components.schemas[name]) !== JSON.stringify(schema)) throw new Error(`Previous Source49 schema changed: ${name}`);
}
const handlers = { ...previousSource.handler_contracts_by_crm_operation, ...nativeSource.handler_contracts_by_crm_operation };
const upper = (name) => name[0].toUpperCase() + name.slice(1);
const camel = (name) => name.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
const typeIdentifier = (name) => name.split(/[^a-zA-Z0-9]+/).map(upper).join("");
const groups = { crm_contact_people: "contactPeople", crm_leads: "leads", crm_pipelines: "pipelines", knowledge_articles: "knowledgeArticles", public_help_centers: "publicHelpCenters" };
const pageTypes = {
  "crm_contact_people.index": ["number", "CrmContactPersonListItem"],
  "crm_contact_people.duplicates": ["number", "CrmContactPersonDuplicate"],
  "crm_contact_people.options": ["number", "CrmContactRelationshipOption"],
  "crm_leads.index": ["cursor", "Lead", "data"],
  "crm_leads.search": ["cursor", "Lead", "data"],
  "crm_leads.history": ["cursor", "LeadHistoryItem", "data"],
  "crm_leads.duplicates": ["cursor", "LeadDuplicate", "data"],
  "crm_pipelines.index": ["cursor", "Pipeline", "items"],
  "knowledge_articles.search": ["knowledge", "KnowledgeArticle"],
};
const inventory = [];
const classes = new Map(Object.values(groups).map((name) => [name, []]));
for (const [path, methods] of Object.entries(spec.paths)) {
  for (const [method, operation] of Object.entries(methods)) {
    const key = operation["x-crm-operation"];
    const handler = handlers[key];
    if (!handler) throw new Error(`Missing native handler metadata: ${key}`);
    const effect = handler.handlerContract === "App\\Shared\\Application\\Bus\\Command\\CommandHandlerInterface";
    if (!effect && handler.handlerContract !== "App\\Shared\\Application\\Bus\\Query\\QueryHandlerInterface") throw new Error(`Unknown native handler contract: ${key}`);
    const [family, action] = key.split(".");
    const group = groups[family];
    if (!group) throw new Error(`Unowned CRM operation: ${key}`);
    const methodName = action === "index" ? "list" : camel(action);
    const typeName = typeIdentifier(operation.operationId);
    const pathParams = (operation.parameters ?? []).filter((item) => item.in === "path");
    const queryParams = (operation.parameters ?? []).filter((item) => item.in === "query");
    const hasBody = Boolean(operation.requestBody);
    const page = pageTypes[key];
    const newFamily = family === "knowledge_articles" || family === "public_help_centers";
    const originalKey = newFamily && (operation.parameters ?? []).some((item) => item.in === "header" && item.name.toLowerCase() === "idempotency-key" && item.required);
    const localConfirmation = operation["x-crm-requires-confirmation"] && (family === "crm_contact_people" || family === "knowledge_articles");
    const configType = originalKey ? (localConfirmation ? "CrmConfirmedOriginalKeyRequestConfig" : "CrmOriginalKeyRequestConfig") : localConfirmation ? "CrmConfirmedRequestConfig" : "CrmRequestConfig";
    const configRequired = localConfirmation || originalKey;
    const sig = pathParams.map((item) => `${camel(item.name)}: string`);
    if (hasBody) sig.push(`body: ${key === "knowledge_articles.category_save" ? "KnowledgeCategorySaveIntent" : key === "public_help_centers.publish" ? "PublicHelpCenterPublishIntent" : `T.${typeName}Data["body"]`}`);
    if (queryParams.length) sig.push(`params${queryParams.some((item) => item.required) ? "" : "?"}: NonNullable<T.${typeName}Data["query"]>`);
    sig.push(`config${configRequired ? "" : "?"}: ${configType}`);
    const pp = pathParams.map((item) => `"${item.name}": ${camel(item.name)}`).join(", ");
    const pathExpr = pathParams.length ? `this.buildPath("${path}", { ${pp} })` : JSON.stringify(path);
    let result = `T.${typeName}Responses[keyof T.${typeName}Responses]`;
    if (page) result = `Crm${upper(page[0])}Page<T.${page[1]}>`;
    const lines = [`  /** ${operation.summary?.replace(/\n/g, " ") ?? key} (${operation.operationId}). */`, `  async ${methodName}(${sig.join(", ")}): Promise<${result}> {`, `    const path = ${pathExpr};`];
    if (localConfirmation) lines.push(`    this.requireHumanConfirmation(config);`);
    if (originalKey) lines.push(`    this.requireOriginalKey(config);`);
    if (newFamily && hasBody) lines.push(`    this.requireExactCas(body);`);
    if (key === "knowledge_articles.suggest") lines.push(`    this.requireExactCas(params);`);
    if (page?.[0] === "cursor") {
      lines.push(`    return this.cursorPage<T.${page[1]}>(path, params, "${page[2]}", config);`);
    } else if (page?.[0] === "number") {
      lines.push(`    return this.numberPage<T.${page[1]}>(path, params, config);`);
    } else if (page?.[0] === "knowledge") {
      lines.push(`    return this.knowledgePage<T.${page[1]}>(path, params, config);`);
    } else if (method === "get") {
      const receiptOperation = originalKey ? key.replace(".receipt_", ".").replace("_receipt", "").replace("knowledge_articles.category", "knowledge_articles.category_save") : undefined;
      lines.push(`    return this.getCrm<${result}>(path, ${queryParams.length ? "params" : "undefined"}, config${newFamily ? ", true" : ""}${receiptOperation ? `, "${receiptOperation}"` : ""});`);
    } else {
      lines.push(`    return this.sendCrm<${result}>("${method.toUpperCase()}", path, ${hasBody ? "body" : "undefined"}, config, ${effect}, "${operation.operationId}"${newFamily && effect ? `, "${key}"` : ""});`);
    }
    lines.push("  }");
    classes.get(group).push(lines.join("\n"));
    inventory.push({ operationId: operation.operationId, operation: key, method: method.toUpperCase(), path, sdk: `crm.${group}.${methodName}`, scope: operation["x-required-scope"], oauthScope: operation["x-required-oauth-scope"], requiresConfirmation: operation["x-crm-requires-confirmation"], effect, ...(operation["x-required-scopes"] ? { scopes: operation["x-required-scopes"] } : {}), ...(originalKey ? { requiresOriginalKey: true } : {}) });
  }
}
if (inventory.length !== 77 || inventory.filter((entry) => /^(knowledge_articles|public_help_centers)\./.test(entry.operation)).length !== 28) throw new Error(`CRM inventory changed (${inventory.length}); reconcile native operations and pagination before generation.`);
const header = `// AUTO-GENERATED from spec/crm-native77.json. Run npm run generate:crm.\nimport { CrmBaseResource, type CrmRequestConfig, type CrmConfirmedRequestConfig, type CrmOriginalKeyRequestConfig, type CrmConfirmedOriginalKeyRequestConfig } from "./resource.js";\nimport type { HttpClient } from "../core/http-client.js";\nimport type { CrmNumberPage, CrmCursorPage, CrmKnowledgePage } from "./pagination.js";\nimport type { KnowledgeCategorySaveIntent, PublicHelpCenterPublishIntent } from "./intents.js";\nimport type * as T from "./generated/types.gen.js";\n`;
const source = [header];
for (const [group, methods] of classes) source.push(`export class Crm${upper(group)}Resource extends CrmBaseResource {\n${methods.join("\n\n")}\n}`);
source.push(`export class CrmResource {\n${[...classes.keys()].map((group) => `  readonly ${group}: Crm${upper(group)}Resource;`).join("\n")}\n\n  constructor(client: HttpClient) {\n${[...classes.keys()].map((group) => `    this.${group} = new Crm${upper(group)}Resource(client);`).join("\n")}\n  }\n}`);
writeFileSync(new URL("src/crm/resources.ts", root), source.join("\n\n") + "\n");
writeFileSync(new URL("src/crm/operations.ts", root), `// AUTO-GENERATED metadata; catalogue membership grants no runtime access.\nexport const CRM_OPERATIONS = ${JSON.stringify(inventory, null, 2)} as const;\n`);
console.log(`Generated ${inventory.length} native CRM methods; no future operations.`);
