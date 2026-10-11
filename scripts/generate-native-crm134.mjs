import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve as absolute } from "node:path";
import { fileURLToPath } from "node:url";

// No schema, endpoint or operation selector is embedded here. Supply the actual
// Root Native149 handoff and a naming-only mapping after its freeze151 receipt.
const [manifestPath, selectionPath, suppliedRoot] = process.argv.slice(2);
if (!manifestPath || !selectionPath || process.argv.length > 5)
  throw new Error(
    "Usage: node scripts/generate-native-crm134.mjs <actual-native149-input.json> <naming-selection.json> [sdk-root]"
  );
const root = suppliedRoot
  ? absolute(suppliedRoot)
  : fileURLToPath(new URL("../", import.meta.url));
const manifestBytes = readFileSync(manifestPath);
const input = JSON.parse(manifestBytes.toString("utf8"));
const selection = JSON.parse(readFileSync(selectionPath, "utf8"));
if (
  input.production?.published !== false ||
  input.production.ratified !== false ||
  input.production.delivery !== false ||
  !Array.isArray(input.production.capabilities) ||
  input.production.capabilities.length !== 0 ||
  !Array.isArray(input.selected_native_operations) ||
  input.selected_native_operations.length !== 7
)
  throw new Error(
    "An actual private Native149 Root handoff is required; generation cannot publish or activate it."
  );
const bytes = readFileSync(input.artifact);
const sha256 = createHash("sha256").update(bytes).digest("hex");
const expectedSha = input.artifact_sha256 ?? input.sha256;
const carrierCount = input.contract_carrier_count ?? input.carrier_count;
if (
  !/^[0-9a-f]{64}$/.test(expectedSha ?? "") ||
  sha256 !== expectedSha ||
  !Number.isSafeInteger(carrierCount) ||
  carrierCount < 1 ||
  (input.bytes !== undefined && input.bytes !== bytes.length)
)
  throw new Error(
    "The Root native artifact bytes differ from their exact handoff."
  );
if (typeof JSON.rawJSON !== "function")
  throw new Error(
    "The existing Node generator must support exact native JSON integer tokens."
  );
const spec = JSON.parse(bytes.toString("utf8"), (_key, value, context) =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  !Number.isSafeInteger(value)
    ? JSON.rawJSON(context.source)
    : value
);
const profile = spec["x-factuarea-contract-profile"];
if (
  profile?.name !== "crm-source-contracts" ||
  profile.source !== "Source" ||
  profile.state !== "unreleased" ||
  profile.published !== false ||
  profile.ratified !== false ||
  profile.delivery_enabled !== false ||
  !/^[0-9a-f]{64}$/.test(profile.catalog_sha256 ?? "") ||
  (input.catalog_sha256 !== undefined &&
    profile.catalog_sha256 !== input.catalog_sha256) ||
  !Array.isArray(profile.carriers) ||
  profile.carriers.length !== carrierCount
)
  throw new Error(
    "Preserve the actual native private profile and exact catalog selector."
  );
const manifestSha256 = createHash("sha256").update(manifestBytes).digest("hex");
const exportBytes = readFileSync(input.export_result);
const exportResult = JSON.parse(exportBytes.toString("utf8"));
if (
  createHash("sha256").update(exportBytes).digest("hex") !==
    input.export_result_sha256 ||
  exportResult.exit_code !== 0 ||
  exportResult.native_result?.export !== "PASS" ||
  exportResult.native_result.artifact_sha256 !== sha256
)
  throw new Error("The exact Root Native149 PASS receipt is required.");
if (
  selection.consumer_manifest_sha256 !== manifestSha256 ||
  selection.native_sha256 !== sha256 ||
  !Array.isArray(selection.operations) ||
  selection.operations.length !== input.selected_native_operations.length
)
  throw new Error(
    "The naming-only selection must be pinned to the actual Native149 artifact."
  );

const resolve = (value) => {
  const seen = new Set();
  while (value?.$ref) {
    if (!value.$ref.startsWith("#/") || seen.has(value.$ref))
      throw new Error("Only resolved local native references are allowed.");
    seen.add(value.$ref);
    value = value.$ref
      .slice(2)
      .split("/")
      .reduce(
        (node, part) => node?.[part.replace(/~1/g, "/").replace(/~0/g, "~")],
        spec
      );
    if (!value) throw new Error("A local native reference is missing.");
  }
  return value;
};
const allowedSelectionFields = new Set([
  "operation_id",
  "group",
  "method",
  "role",
]);
const selections = new Map();
const names = new Set();
for (const item of selection.operations) {
  if (
    Object.keys(item).some((key) => !allowedSelectionFields.has(key)) ||
    typeof item.operation_id !== "string" ||
    !/^[a-z][a-zA-Z0-9]*$/.test(item.group) ||
    !/^[a-z][a-zA-Z0-9]*$/.test(item.method) ||
    !["current", "original", "effect"].includes(item.role) ||
    selections.has(item.operation_id) ||
    names.has(`${item.group}.${item.method}`)
  )
    throw new Error(
      "The native selection contains duplicate or non-naming data."
    );
  if (
    !input.selected_native_operations.some(
      (native) => native.operation_id === item.operation_id
    )
  )
    throw new Error(
      "The selection is outside the exact Root consumer manifest."
    );
  selections.set(item.operation_id, item);
  names.add(`${item.group}.${item.method}`);
}
const operations = [];
const paths = {};
const httpMethods = [
  "get",
  "put",
  "post",
  "patch",
  "delete",
  "options",
  "head",
  "trace",
];
for (const [path, methods] of Object.entries(spec.paths ?? {})) {
  for (const [method, operation] of Object.entries(methods)) {
    const owner = selections.get(operation?.operationId);
    if (!owner) continue;
    if (
      !["get", "post", "patch"].includes(method) ||
      !operation["x-crm-operation"] ||
      (owner.role === "effect") !== (method !== "get") ||
      !profile.carriers.some(
        (carrier) =>
          carrier.operation_id === operation.operationId &&
          carrier.methods.includes(method.toUpperCase())
      ) ||
      operations.some(
        (item) => item.operation.operationId === operation.operationId
      )
    )
      throw new Error(
        `The actual native carrier is incompatible: ${operation.operationId}`
      );
    const admitted = input.selected_native_operations.find(
      (native) => native.operation_id === operation.operationId
    );
    if (
      !admitted ||
      admitted.path !== path ||
      admitted.method !== method ||
      admitted.required_scope !== operation["x-required-scope"] ||
      admitted.oauth_scope !== operation["x-required-oauth-scope"] ||
      admitted.crm_operation !== operation["x-crm-operation"]
    )
      throw new Error(
        "Native operation data differs from the Root consumer manifest."
      );
    const requestBody = resolve(operation.requestBody);
    if (
      method === "get"
        ? requestBody !== undefined
        : !requestBody?.content?.["application/json"]?.schema
    )
      throw new Error(
        `The native method/body boundary is incompatible: ${operation.operationId}`
      );
    const parameters = new Map();
    for (const parameter of [
      ...(methods.parameters ?? []),
      ...(operation.parameters ?? []),
    ].map(resolve)) {
      if (!["path", "query", "header"].includes(parameter.in))
        throw new Error("Unsupported native parameter location.");
      parameters.set(`${parameter.in}:${parameter.name.toLowerCase()}`, {
        ...parameter,
        schema: resolve(parameter.schema),
      });
    }
    operations.push({
      path,
      method,
      operation,
      owner,
      requestBody,
      parameters: [...parameters.values()],
    });
    paths[path] = {
      ...(paths[path] ??
        Object.fromEntries(
          Object.entries(methods).filter(([key]) => !httpMethods.includes(key))
        )),
      [method]: operation,
    };
  }
}
if (operations.length !== selections.size)
  throw new Error(
    "A selected operation is absent from the actual Root export; do not fabricate it."
  );

const boundary = input.validation_only_boundary;
const restore = spec.paths?.[boundary?.path]?.[boundary?.method?.toLowerCase()];
if (
  boundary?.operation_id !== "crmRestoreCommercialDocument" ||
  restore?.operationId !== boundary.operation_id ||
  restore["x-required-scope"] !== boundary.required_scope
)
  throw new Error(
    "The exact native Restore POST validation boundary is required."
  );
paths[boundary.path] = {
  ...(paths[boundary.path] ?? {}),
  [boundary.method.toLowerCase()]: restore,
};

const components = {};
const seen = new Set();
function collect(node) {
  if (node === null || typeof node !== "object") return;
  if (node.$ref) {
    const match = /^#\/components\/([^/]+)\/([^/]+)$/.exec(node.$ref);
    const kind = match?.[1];
    const name = match?.[2]?.replace(/~1/g, "/").replace(/~0/g, "~");
    if (!kind || !name || !spec.components?.[kind]?.[name])
      throw new Error(`Unresolved native component: ${node.$ref}`);
    if (!seen.has(node.$ref)) {
      seen.add(node.$ref);
      (components[kind] ??= {})[name] = spec.components[kind][name];
      collect(spec.components[kind][name]);
    }
  }
  for (const value of Object.values(node)) collect(value);
}
collect(paths);
for (const [name, scheme] of Object.entries(
  spec.components?.securitySchemes ?? {}
))
  (components.securitySchemes ??= {})[name] = scheme;
const projected = { ...spec, paths, components };
delete projected.webhooks;
function schemaTree(schema, trail = new Set()) {
  schema = resolve(schema);
  if (schema === null || typeof schema !== "object" || JSON.isRawJSON(schema))
    return schema;
  if (trail.has(schema))
    throw new Error(
      "A selected native request/success schema is recursively unsupported."
    );
  const next = new Set(trail).add(schema);
  return Array.isArray(schema)
    ? schema.map((item) => schemaTree(item, next))
    : Object.fromEntries(
        Object.entries(schema).map(([key, value]) => [
          key,
          schemaTree(value, next),
        ])
      );
}
function integerPaths(schema, prefix = "", trail = new Set()) {
  schema = resolve(schema);
  if (!schema || trail.has(schema)) return [];
  const next = new Set(trail).add(schema);
  const found =
    schema.type === "integer" || schema.type?.includes?.("integer")
      ? [prefix]
      : [];
  for (const [name, property] of Object.entries(schema.properties ?? {}))
    found.push(
      ...integerPaths(property, prefix ? `${prefix}.${name}` : name, next)
    );
  if (schema.items)
    found.push(...integerPaths(schema.items, `${prefix}[]`, next));
  if (
    schema.additionalProperties &&
    typeof schema.additionalProperties === "object"
  )
    found.push(
      ...integerPaths(schema.additionalProperties, `${prefix}.*`, next)
    );
  for (const branch of [
    ...(schema.allOf ?? []),
    ...(schema.anyOf ?? []),
    ...(schema.oneOf ?? []),
  ])
    found.push(...integerPaths(branch, prefix, next));
  return [...new Set(found)];
}
const metadata = operations.map(
  ({ path, method, operation, owner, requestBody, parameters }) => {
    const successes = Object.entries(operation.responses ?? {}).filter(
      ([code]) => /^2\d\d$/.test(code)
    );
    const json = successes
      .map(
        ([, response]) =>
          resolve(response)?.content?.["application/json"]?.schema
      )
      .filter(Boolean);
    if (!successes.length || !json.length)
      throw new Error(
        "Selected Source134 consumers require native JSON success responses."
      );
    return {
      operationId: operation.operationId,
      operation: operation["x-crm-operation"],
      method: method.toUpperCase(),
      path,
      sdk: `crm.native134.${owner.group}.${owner.method}`,
      scope: operation["x-required-scope"],
      oauthScope: operation["x-required-oauth-scope"] ?? null,
      ...(operation["x-required-scopes"]
        ? { scopes: operation["x-required-scopes"] }
        : {}),
      parameters,
      successStatuses: successes.map(([code]) => Number(code)),
      successSchemas: successes.map(([, response]) =>
        schemaTree(resolve(response).content["application/json"].schema)
      ),
      ...(requestBody
        ? {
            requestSchema: schemaTree(
              requestBody.content["application/json"].schema
            ),
          }
        : {}),
      exactIntegerPaths: [
        ...new Set(json.flatMap((schema) => integerPaths(schema))),
      ],
      ...(requestBody
        ? {
            requestIntegerPaths: integerPaths(
              requestBody.content["application/json"].schema
            ),
          }
        : {}),
      original: owner.role === "original",
      binary: false,
    };
  }
);
const upper = (name) => name[0].toUpperCase() + name.slice(1);
const typeName = (name) =>
  name
    .split(/[^a-zA-Z0-9]+/)
    .map(upper)
    .join("");
const groups = new Map();
const generated = [
  `// AUTO-GENERATED from actual private Native149 ${sha256}; no metadata grants access.`,
  `import { type CrmSourceRequestConfig, type CrmSourceOriginalRequestConfig, type CrmSourceWriteConfig } from "../crm/source/resource.js";`,
  `import { CRM_NATIVE134_OPERATIONS } from "./operations.gen.js";`,
  `import { NativeCrm134BaseResource } from "./resource.js";`,
  `import type { HttpClient } from "../core/http-client.js";`,
  `import type * as T from "./generated/types.gen.js";`,
];
for (let index = 0; index < operations.length; index++) {
  const { operation, owner, parameters } = operations[index];
  const meta = metadata[index];
  const typed = typeName(operation.operationId);
  const mutation = owner.role === "effect";
  const pathParams = parameters.filter((parameter) => parameter.in === "path");
  const queryParams = parameters.filter(
    (parameter) => parameter.in === "query"
  );
  const originalKey = parameters.some(
    (parameter) =>
      parameter.in === "header" &&
      parameter.name.toLowerCase() === "idempotency-key" &&
      parameter.required
  );
  const requiredHeaders = parameters.filter(
    (parameter) =>
      parameter.in === "header" &&
      parameter.name.toLowerCase() !== "idempotency-key" &&
      parameter.required
  );
  const configType = mutation
    ? "CrmSourceWriteConfig"
    : originalKey
    ? "CrmSourceOriginalRequestConfig"
    : "CrmSourceRequestConfig";
  const configRequired = mutation || originalKey || requiredHeaders.length > 0;
  const args = pathParams.map(
    (parameter) =>
      `${parameter.name}: NonNullable<T.${typed}Data["path"]>[${JSON.stringify(
        parameter.name
      )}]`
  );
  if (mutation) args.push(`body: NonNullable<T.${typed}Data["body"]>`);
  if (queryParams.length)
    args.push(
      `params${
        queryParams.some((parameter) => parameter.required) || configRequired
          ? ""
          : "?"
      }: NonNullable<T.${typed}Data["query"]>`
    );
  args.push(
    `config${configRequired ? "" : "?"}: ${configType}${
      requiredHeaders.length
        ? ` & { headers: NonNullable<T.${typed}Data["headers"]> }`
        : ""
    }`
  );
  const response = `T.${typed}Responses[keyof T.${typed}Responses]`;
  const body = `  /** Native ${operation.operationId}: ${
    mutation
      ? "one human-confirmed dispatch; no retry or redirect"
      : owner.role === "original"
      ? "Original under current native authority; never Current or POST recovery"
      : "current authorized native read"
  }. */\n  async ${owner.method}(${args.join(
    ", "
  )}): Promise<${response}> {\n    return this.${
    mutation ? "writeNative" : "readNative"
  }<${response}>(CRM_NATIVE134_OPERATIONS[${index}], { ${pathParams
    .map((parameter) => parameter.name)
    .join(", ")} }, ${
    mutation ? "body" : queryParams.length ? "params" : "undefined"
  }, { ...config, maxRetries: 0 });\n  }`;
  (
    groups.get(owner.group) ?? groups.set(owner.group, []).get(owner.group)
  ).push(body);
}
for (const [group, methods] of groups)
  generated.push(
    `export class NativeCrm134${upper(
      group
    )}Resource extends NativeCrm134BaseResource {\n${methods.join("\n\n")}\n}`
  );
generated.push(
  `export class NativeCrm134Resource {\n${[...groups.keys()]
    .map((group) => `  readonly ${group}: NativeCrm134${upper(group)}Resource;`)
    .join("\n")}\n\n  constructor(client: HttpClient) {\n${[...groups.keys()]
    .map(
      (group) =>
        `    this.${group} = new NativeCrm134${upper(group)}Resource(client);`
    )
    .join("\n")}\n  }\n}`
);
const restoreValidation = {
  operationId: restore.operationId,
  method: "POST",
  path: boundary.path,
  scope: restore["x-required-scope"],
  oauthScope: restore["x-required-oauth-scope"],
  parameters: restore.parameters.map(resolve),
  successSchemas: Object.entries(restore.responses)
    .filter(([status]) => /^2\d\d$/.test(status))
    .map(([, response]) =>
      schemaTree(resolve(response).content["application/json"].schema)
    ),
  requestSchema: schemaTree(
    resolve(restore.requestBody).content["application/json"].schema
  ),
};
const out = absolute(root, "src/NativeCrm134");
mkdirSync(out, { recursive: true });
writeFileSync(
  absolute(out, "native149.json"),
  JSON.stringify(projected, null, 2) + "\n"
);
writeFileSync(
  absolute(out, "input.json"),
  JSON.stringify(
    {
      native_sha256: sha256,
      native_input_manifest: absolute(manifestPath),
      native_input_group: 149,
      consumer_manifest_sha256: manifestSha256,
      native_export_result_sha256: input.export_result_sha256,
      validation_only_operation_id: boundary.operation_id,
      native_catalog_sha256: profile.catalog_sha256,
      native_operation_count: input.operation_count,
      native_carrier_count: profile.carriers.length,
      selected_operation_ids: operations.map(
        (item) => item.operation.operationId
      ),
      projection:
        "Unchanged actual native operations and recursive local components; actual private profile copied unchanged.",
      published: false,
      ratified: false,
      delivery_enabled: false,
      capabilities: [],
    },
    null,
    2
  ) + "\n"
);
writeFileSync(
  absolute(out, "operations.gen.ts"),
  `// AUTO-GENERATED from actual private Native149 ${sha256}.\nexport const CRM_NATIVE134_OPERATIONS = ${JSON.stringify(
    metadata,
    null,
    2
  )} as const;\n`
);
writeFileSync(absolute(out, "resources.gen.ts"), generated.join("\n\n") + "\n");
writeFileSync(
  absolute(out, "validation.gen.ts"),
  `// AUTO-GENERATED native Restore POST validation only; existing Source143 owns the writer.\nexport const CRM_NATIVE134_RESTORE_VALIDATION = ${JSON.stringify(
    restoreValidation,
    null,
    2
  )} as const;\n`
);
writeFileSync(
  absolute(out, "index.ts"),
  `export { NativeCrm134Resource } from "./resources.gen.js";\nexport { NativeCrm134Client } from "./client.js";\nexport { RetainedBulkAction, prepareStageUpdate, prepareDocumentRestore } from "./intents.js";\nexport type { StageUpdateBody, BulkActionBody, DocumentRestoreBody, StageUpdateIntention, DocumentRestoreIntention } from "./intents.js";\nexport { CRM_NATIVE134_OPERATIONS } from "./operations.gen.js";\nexport { RetainedNativeEffect } from "./retained-effect.js";\nexport type { RetainedNativeEffectState, NativeEffectDispatchConfig, NativeEffectOriginalConfig } from "./retained-effect.js";\nexport type * from "./generated/types.gen.js";\n`
);
console.log(
  `Generated ${operations.length} selected wrappers from actual Native149 ${sha256}; run only the isolated native134 TypeScript generator next.`
);
