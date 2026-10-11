import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const root = new URL("../", import.meta.url);
const manifestPath = process.argv[2];
if (!manifestPath || process.argv.length !== 3)
  throw new Error(
    "Usage: node scripts/generate-crm-source.mjs <native-private-input.json>"
  );
const input = JSON.parse(readFileSync(manifestPath, "utf8"));
if (
  input.state !== "private-native-unreleased-source-contract" ||
  input.published !== false ||
  input.ratified !== false ||
  input.delivery_enabled !== false ||
  !Array.isArray(input.capabilities) ||
  input.capabilities.length !== 0
)
  throw new Error(
    "Source generation requires the private native unreleased handoff; it cannot publish or ratify a contract."
  );
const bytes = readFileSync(input.artifact);
const sha256 = createHash("sha256").update(bytes).digest("hex");
if (sha256 !== input.artifact_sha256)
  throw new Error("Native Source bytes differ from the supplied handoff.");
const spec = JSON.parse(bytes.toString("utf8"));
const profile = spec["x-factuarea-contract-profile"];
if (
  profile?.name !== "crm-source-contracts" ||
  profile.source !== "Source" ||
  profile.state !== "unreleased" ||
  profile.published !== false ||
  profile.ratified !== false ||
  profile.delivery_enabled !== false ||
  profile.catalog_sha256 !== input.catalog_sha256 ||
  !Array.isArray(profile.carriers) ||
  profile.carriers.length !== input.contract_carrier_count
)
  throw new Error(
    "The native private profile and exact catalogue selector must be preserved."
  );

// SDK names only. Every path, parameter, response and schema comes from the native input.
const selection = {
  crmCreateOpportunity: ["opportunities", "create"],
  crmUpdateOpportunity: ["opportunities", "update"],
  crmGetOpportunity: ["opportunities", "getCurrent"],
  crmCreateCrmActivity: ["activities", "create"],
  crmUpdateCrmActivity: ["activities", "update"],
  crmGetCrmActivity: ["activities", "getCurrent"],
  crmGetCrmActivityCreateOriginal: ["activities", "getCreateOriginal"],
  "public-api.v1.crm-spreadsheet-imports.apply-original": [
    "imports",
    "getApplyOriginal",
  ],
  "v1.crm.sequences.original_enrol": ["sequences", "getEnrolOriginal"],
  "v1.crm.sequences.original_save": ["sequences", "getSaveOriginal"],
  "v1.crm.sequences.get": ["sequences", "getCurrent"],
  "v1.crm.sequences.list": ["sequences", "list"],
  "v1.crm.sequences.preview": ["sequences", "preview"],
  GetCrmReportDefinitionOriginal: ["reports", "getDefinitionOriginal"],
  crmGetLeadCreateOriginal: ["leads", "getCreateOriginal"],
  crmGetOpportunityCreateOriginal: ["opportunities", "getCreateOriginal"],
  crmGetOpportunityStageOriginal: ["opportunities", "getStageOriginal"],
  crmGetOriginalCaptureFormSave: ["capture", "getFormSaveOriginal"],
  crmGetOriginalWebToTicketSubmission: ["capture", "getSubmissionOriginal"],
  getServiceReplyOriginal: ["serviceTickets", "getReplyOriginal"],
  getCrmWhatsAppMessageOriginal: ["conversations", "getWhatsAppOriginal"],
  crmGetCommercialDocument: ["documents", "getCurrent"],
  crmListCommercialDocuments: ["documents", "list"],
  crmDownloadCommercialDocument: ["documents", "download"],
  listBookings: ["booking", "listBookings"],
  listBookingServices: ["booking", "listServices"],
  getBookingService: ["booking", "getService"],
  getBookingSequenceStopDecision: ["booking", "getSequenceStopDecision"],
};
const resolve = (value) => {
  if (!value?.$ref) return value;
  if (!value.$ref.startsWith("#/"))
    throw new Error("Remote references are not an installed Source contract.");
  return resolve(
    value.$ref
      .slice(2)
      .split("/")
      .reduce(
        (node, part) => node?.[part.replace(/~1/g, "/").replace(/~0/g, "~")],
        spec
      )
  );
};
const operations = [];
const paths = {};
for (const [path, methods] of Object.entries(spec.paths))
  for (const [method, operation] of Object.entries(methods)) {
    const owner = selection[operation?.operationId];
    if (!owner) continue;
    if (
      !["get", "post", "patch"].includes(method) ||
      !operation["x-crm-operation"] ||
      (method === "get"
        ? operation.requestBody
        : !operation.requestBody?.content?.["application/json"]?.schema) ||
      operations.some(
        (item) => item.operation.operationId === operation.operationId
      )
    )
      throw new Error(
        `Source carrier is missing or incompatible: ${operation.operationId}`
      );
    if (
      !profile.carriers.some(
        (carrier) =>
          carrier.operation_id === operation.operationId &&
          carrier.methods.includes(method.toUpperCase())
      )
    )
      throw new Error(
        `Source operation is not selected by the exact native profile: ${operation.operationId}`
      );
    operations.push({ path, method, operation, owner });
    paths[path] = {
      ...(paths[path] ?? {}),
      ...Object.fromEntries(
        Object.entries(methods).filter(
          ([key]) =>
            ![
              "get",
              "put",
              "post",
              "patch",
              "delete",
              "options",
              "head",
              "trace",
            ].includes(key)
        )
      ),
      [method]: operation,
    };
  }
if (operations.length !== Object.keys(selection).length)
  throw new Error(
    "A selected native Source carrier is absent; do not fabricate its contract."
  );

const components = {};
const seen = new Set();
function collect(node) {
  if (node === null || typeof node !== "object") return;
  if (node.$ref) {
    const match = /^#\/components\/([^/]+)\/([^/]+)$/.exec(node.$ref);
    if (!match || !spec.components?.[match[1]]?.[match[2]])
      throw new Error(`Unresolved native component: ${node.$ref}`);
    if (!seen.has(node.$ref)) {
      seen.add(node.$ref);
      (components[match[1]] ??= {})[match[2]] =
        spec.components[match[1]][match[2]];
      collect(spec.components[match[1]][match[2]]);
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
// Unrelated webhook operations are outside this selected native carrier reference closure.
delete projected.webhooks;
writeFileSync(
  new URL("spec/crm-source139.json", root),
  JSON.stringify(projected, null, 2) + "\n"
);
writeFileSync(
  new URL("spec/crm-source139-input.json", root),
  JSON.stringify(
    {
      native_sha256: sha256,
      native_catalog_sha256: input.catalog_sha256,
      native_operation_count: input.operation_count,
      native_carrier_count: profile.carriers.length,
      projection:
        "Machine selection of unchanged native operations and recursive local component references; private native profile copied unchanged.",
      selected_operation_ids: operations.map(
        (item) => item.operation.operationId
      ),
      published: false,
      ratified: false,
      delivery_enabled: false,
      capabilities: [],
    },
    null,
    2
  ) + "\n"
);

const upper = (name) => name[0].toUpperCase() + name.slice(1);
const typeName = (name) =>
  name
    .split(/[^a-zA-Z0-9]+/)
    .map(upper)
    .join("");
function integerPaths(schema, prefix = "", trail = new Set()) {
  if (!schema || trail.has(schema)) return [];
  const next = new Set(trail).add(schema);
  schema = resolve(schema);
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
  for (const branch of [
    ...(schema.allOf ?? []),
    ...(schema.anyOf ?? []),
    ...(schema.oneOf ?? []),
  ])
    found.push(...integerPaths(branch, prefix, next));
  return [...new Set(found)];
}
const metadata = operations.map(({ path, method, operation, owner }) => {
  const parameters = (operation.parameters ?? []).map(resolve);
  const successes = Object.entries(operation.responses).filter(([code]) =>
    /^2\d\d$/.test(code)
  );
  const json = successes
    .map(
      ([, response]) => resolve(response)?.content?.["application/json"]?.schema
    )
    .filter(Boolean);
  const request = operation.requestBody?.content?.["application/json"]?.schema;
  return {
    operationId: operation.operationId,
    operation: operation["x-crm-operation"],
    method: method.toUpperCase(),
    path,
    sdk: `crm.source.${owner.join(".")}`,
    scope: operation["x-required-scope"],
    oauthScope: operation["x-required-oauth-scope"] ?? null,
    ...(operation["x-required-scopes"]
      ? { scopes: operation["x-required-scopes"] }
      : {}),
    parameters,
    successStatuses: successes.map(([code]) => Number(code)),
    exactIntegerPaths: [
      ...new Set(json.flatMap((schema) => integerPaths(schema))),
    ],
    ...(request ? { requestIntegerPaths: integerPaths(request) } : {}),
    original: /original|receipt/i.test(operation.operationId),
    binary:
      !json.length &&
      Object.values(operation.responses?.["200"]?.content ?? {}).some(
        (media) => media.schema?.format === "binary"
      ),
  };
});
mkdirSync(new URL("src/crm/source", root), { recursive: true });
writeFileSync(
  new URL("src/crm/source/operations.gen.ts", root),
  `// AUTO-GENERATED from private native Source ${sha256}; metadata grants no access.\nexport const CRM_SOURCE_OPERATIONS = ${JSON.stringify(
    metadata,
    null,
    2
  )} as const;\n`
);
const groups = new Map();
const generated = [
  `// AUTO-GENERATED from unchanged selected native Source139 operations.\nimport { CrmSourceBaseResource, type CrmSourceRequestConfig, type CrmSourceOriginalRequestConfig, type CrmSourceWriteConfig } from "./resource.js";\nimport { CRM_SOURCE_OPERATIONS } from "./operations.gen.js";\nimport type { HttpClient, BinaryResponse } from "../../core/http-client.js";\nimport type * as T from "./generated/types.gen.js";\n`,
];
for (let index = 0; index < operations.length; index++) {
  const {
    operation,
    owner: [group, name],
  } = operations[index];
  const meta = metadata[index];
  const mutation = meta.method !== "GET";
  const typed = typeName(operation.operationId);
  const pp = meta.parameters.filter((item) => item.in === "path");
  const qp = meta.parameters.filter((item) => item.in === "query");
  const originalKey = meta.parameters.some(
    (item) =>
      item.in === "header" &&
      item.name.toLowerCase() === "idempotency-key" &&
      item.required
  );
  const customHeaders = meta.parameters.filter(
    (item) =>
      item.in === "header" &&
      item.name.toLowerCase() !== "idempotency-key" &&
      item.required
  );
  const config = `${
    mutation
      ? "CrmSourceWriteConfig"
      : originalKey
      ? "CrmSourceOriginalRequestConfig"
      : "CrmSourceRequestConfig"
  }${
    customHeaders.length
      ? ` & { headers: NonNullable<T.${typed}Data["headers"]> }`
      : ""
  }`;
  const args = pp.map(
    (p) => `${p.name}: NonNullable<T.${typed}Data["path"]>["${p.name}"]`
  );
  if (mutation) args.push(`body: NonNullable<T.${typed}Data["body"]>`);
  if (qp.length)
    args.push(
      `params${
        qp.some((p) => p.required) || originalKey || customHeaders.length
          ? ""
          : "?"
      }: NonNullable<T.${typed}Data["query"]>`
    );
  args.push(
    `config${
      mutation || originalKey || customHeaders.length ? "" : "?"
    }: ${config}`
  );
  const response = meta.binary
    ? "BinaryResponse"
    : mutation
    ? `T.${typed}Responses[keyof T.${typed}Responses]`
    : `T.${typed}Responses[200]`;
  const body = `  /** Native ${operation.operationId}; ${
    mutation
      ? "one explicitly confirmed dispatch, no automatic retry or redirect"
      : meta.original
      ? "Original, never Current or a write retry"
      : "current authorized read"
  }. */\n  async ${name}(${args.join(
    ", "
  )}): Promise<${response}> {\n    return this.${
    mutation ? "writeSource" : "readSource"
  }${meta.binary ? "" : `<${response}>`}(CRM_SOURCE_OPERATIONS[${index}], ${
    pp.length ? `{ ${pp.map((p) => p.name).join(", ")} }` : "{}"
  }, ${mutation ? "body" : qp.length ? "params" : "undefined"}, config);\n  }`;
  (groups.get(group) ?? groups.set(group, []).get(group)).push(body);
  if (["listBookings", "listServices"].includes(name) && group === "booking")
    groups
      .get(group)
      .push(
        `  async *iterate${upper(
          name.replace(/^list/, "")
        )}(params?: NonNullable<T.${typed}Data["query"]>, config?: CrmSourceRequestConfig): AsyncGenerator<T.${typed}Responses[200]["data"]["items"][number]> {\n    let cursor = params?.cursor;\n    do {\n      const page = await this.${name}({ ...params, ...(cursor ? { cursor } : {}) }, config);\n      yield* page.data.items;\n      const next = page.data.next_cursor;\n      if (next !== null && next === cursor) throw new TypeError("Factuarea: the native cursor did not advance.");\n      cursor = next ?? undefined;\n    } while (cursor !== undefined);\n  }`
      );
  if (group === "documents" && name === "list")
    groups
      .get(group)
      .push(
        `  async *iterate(params?: NonNullable<T.${typed}Data["query"]>, config?: CrmSourceRequestConfig): AsyncGenerator<T.${typed}Responses[200]["data"]["items"][number]> {\n    let number = params?.page ?? 1;\n    do {\n      const page = await this.list({ ...params, page: number }, config);\n      if (page.data.page !== number || page.data.per_page < 1) throw new TypeError("Factuarea: incompatible native document page.");\n      yield* page.data.items;\n      if (BigInt(page.data.page) * BigInt(page.data.per_page) >= BigInt(page.data.total)) return;\n      number++;\n    } while (true);\n  }`
      );
  if (group === "sequences" && name === "list")
    groups
      .get(group)
      .push(
        `  async *pages(params: NonNullable<T.${typed}Data["query"]>, config?: CrmSourceRequestConfig): AsyncGenerator<T.${typed}Responses[200]> {\n    let cursor = params.cursor;\n    do {\n      const page = await this.list({ ...params, ...(cursor ? { cursor } : {}) }, config);\n      yield page;\n      const next = page.data.next_cursor;\n      if (next !== null && next === cursor) throw new TypeError("Factuarea: the native cursor did not advance.");\n      cursor = next ?? undefined;\n    } while (cursor !== undefined);\n  }`
      );
}
for (const [group, methods] of groups)
  generated.push(
    `export class CrmSource${upper(
      group
    )}Resource extends CrmSourceBaseResource {\n${methods.join("\n\n")}\n}`
  );
generated.push(
  `export class CrmSourceResource {\n${[...groups.keys()]
    .map((g) => `  readonly ${g}: CrmSource${upper(g)}Resource;`)
    .join("\n")}\n\n  constructor(client: HttpClient) {\n${[...groups.keys()]
    .map((g) => `    this.${g} = new CrmSource${upper(g)}Resource(client);`)
    .join("\n")}\n  }\n}`
);
writeFileSync(
  new URL("src/crm/source/resources.gen.ts", root),
  generated.join("\n\n") + "\n"
);
console.log(
  `Generated ${operations.length} exact native wrappers and a recursive native schema projection. Run the existing TypeScript generator with openapi-crm-source.config.ts.`
);
