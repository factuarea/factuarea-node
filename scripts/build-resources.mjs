#!/usr/bin/env node
/**
 * Resource-layer generator.
 *
 * Reads the pinned OpenAPI spec (`spec/openapi.json`) and emits the ergonomic
 * resource wrappers in `src/resources/`. Each emitted class extends
 * `BaseResource` (the hand-written core) — the wrappers NEVER call the
 * generated HTTP client; they compose `src/core` only (design D5).
 *
 * Method names follow the SDK naming contract
 * (`backend/docs/api/sdk-method-naming.md @ 1.1.0`): the last dotted segment of
 * the operationId is the action, the preceding segments are the namespace, all
 * camelCased.
 *
 * Run via `npm run generate:resources` (and as part of `npm run generate`).
 * Output is committed; it is regenerated only when the spec changes.
 *
 * Accepts `--spec <path>` and `--out <dir>` to override the default input/output
 * locations (used by `test/build-resources.test.ts` against fixture specs in a
 * scratch directory). Without them, the real `spec/openapi.json` and
 * `src/resources/` are used, unchanged from before.
 */
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  existsSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--spec") args.spec = argv[++i];
    else if (argv[i] === "--out") args.out = argv[++i];
    else if (argv[i] === "--types") args.types = argv[++i];
  }
  return args;
}
const cliArgs = parseArgs(process.argv.slice(2));

const specPath = cliArgs.spec ? resolve(cliArgs.spec) : join(root, "spec", "openapi.json");
const outDir = cliArgs.out ? resolve(cliArgs.out) : join(root, "src", "resources");

// Generated openapi-ts types, used to type request bodies and JSON responses.
// Default run (real spec): `src/generated/types.gen.ts`. With `--spec` (fixtures)
// nothing is typed unless `--types` names a file, so output never depends on
// the repo's real types.
const typesPath = cliArgs.types
  ? resolve(cliArgs.types)
  : cliArgs.spec
    ? null
    : join(root, "src", "generated", "types.gen.ts");
const typesSource = typesPath && existsSync(typesPath) ? readFileSync(typesPath, "utf8") : "";

const HTTP_METHODS = new Set(["get", "post", "put", "patch", "delete"]);

/**
 * Operations that shipped as `(…, config?)` and later gained their first query
 * parameter. The generator emits `(…, params?, config?)` for every operation
 * with a query, which would move `config` to the third position under callers
 * already on the previous release. These operations keep both call shapes
 * through an overload: a second argument whose keys are all `RequestConfig`
 * keys is the request config (`splitQueryAndConfig` in `src/core/resource.ts`).
 *
 * Add an operation here when a spec sync gives an existing parameterless
 * operation a query parameter, and remove it at the next major version. Only
 * plain GET operations are supported; the generator fails on any other shape.
 */
/**
 * Operations whose `text/csv` response is returned as a `BinaryResponse`. Other
 * operations that list `text/csv` keep their existing return type, so adding one
 * here is an explicit decision per operation.
 */
const BINARY_CSV_OPERATIONS = new Set(["public-api.v1.contacts.imports.errors"]);

/**
 * Operations that must never be retried automatically, with the reason. The
 * spec extension `x-no-retry: true` on an operation does the same; this list
 * covers what the published spec does not mark yet (it declares the same
 * `x-speakeasy-retries` backoff on every operation).
 */
const NO_RETRY_OPERATIONS = new Map([
  [
    "public-api.v1.invoices.face_submissions.submit",
    "sends the invoice to FACe (a third party): a repeated call can submit it twice",
  ],
  [
    "public-api.v1.face_submissions.cancel",
    "asks FACe (a third party) to cancel the submission: a repeated call can cancel twice",
  ],
]);

/** Header parameters the client already manages (version, idempotency, profile). */
const MANAGED_HEADERS = new Set(["idempotency-key", "factuarea-version", "x-active-profile"]);

const LEGACY_CONFIG_SECOND = new Set(["public-api.v1.invoices.pdf_link", "public-api.v1.series.active"]);

function camel(segment) {
  const parts = segment.replace(/-/g, "_").split("_");
  return (
    parts[0] +
    parts
      .slice(1)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join("")
  );
}

function pascal(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function isBinary(op) {
  for (const resp of Object.values(op.responses ?? {})) {
    for (const ct of Object.keys(resp.content ?? {})) {
      if (
        ct.includes("pdf") ||
        ct.startsWith("image/") ||
        ct.includes("octet-stream") ||
        ct.includes("zip") ||
        ct.startsWith("image/") ||
        ct === "application/xml" || ct === "text/xml" ||
        (ct.includes("csv") && BINARY_CSV_OPERATIONS.has(op.operationId))
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Binary success plus a JSON success (`200`/`202`) or a `304`: the call answers
 * with bytes, a JSON status document or nothing, so it returns a discriminated
 * union instead of `BinaryResponse`.
 */
function isBinaryOrJson(op) {
  if (!isBinary(op)) return false;
  const responses = op.responses ?? {};
  if ("304" in responses) return true;
  return ["200", "202"].some((code) =>
    Object.keys(responses[code]?.content ?? {}).some((ct) => ct.includes("json"))
  );
}

function isMultipart(op) {
  for (const ct of Object.keys(op.requestBody?.content ?? {})) {
    if (ct.includes("multipart")) {
      return true;
    }
  }
  return false;
}

function cursorParam(op) {
  const names = new Set(
    (op.parameters ?? []).filter((p) => p.in === "query").map((p) => p.name)
  );
  if (names.has("starting_after")) return "starting_after";
  if (names.has("cursor")) return "cursor";
  return null;
}

function hasQuery(op) {
  return (op.parameters ?? []).some((p) => p.in === "query");
}

function pathParams(op) {
  return (op.parameters ?? [])
    .filter((p) => p.in === "path")
    .map((p) => p.name);
}

/** Names of the header parameters the operation declares, `$ref`s resolved. */
function headerParams(spec, op) {
  return (op.parameters ?? [])
    .map((p) => resolveParam(spec, p))
    .filter((p) => p.in === "header")
    .map((p) => p.name);
}

function noRetryReason(op) {
  const reason = NO_RETRY_OPERATIONS.get(op.operationId);
  if (reason) return reason;
  return op["x-no-retry"] === true ? "marked x-no-retry in the spec" : null;
}

/** True when a success response of the operation offers an `image/*` representation. */
function hasImageResponse(op) {
  return Object.values(op.responses ?? {}).some((resp) =>
    Object.keys(resp.content ?? {}).some((ct) => ct.startsWith("image/"))
  );
}

/** `public-api.v1.series.assign_pdf_template` -> `PublicApiV1SeriesAssignPdfTemplate` (openapi-ts naming). */
function typeBase(operationId) {
  return operationId
    .split(/[^A-Za-z0-9]+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

/** Type of the request body of an operation, or `null` when openapi-ts did not emit one. */
function bodyTypeName(operationId) {
  const name = `${typeBase(operationId)}Data`;
  const block = typesSource.match(new RegExp(`export type ${name} = \\{([\\s\\S]*?)\\n\\};`));
  if (!block || !/^ {4}body\??: /m.test(block[1])) return null;
  return name;
}

/**
 * Type of the JSON side of a bytes-or-JSON operation: `Responses[202]` when
 * openapi-ts emitted a `202` entry, else `Responses[200]` when the `200` also
 * offers `application/json` (openapi-ts types that entry from the JSON schema),
 * else `null`.
 */
function jsonResponseType(op) {
  const name = `${typeBase(op.operationId)}Responses`;
  const block = typesSource.match(new RegExp(`export type ${name} = \\{([\\s\\S]*?)\\n\\};`));
  if (!block) return null;
  if (/^ {4}202: /m.test(block[1])) return `${name}[202]`;
  const json200 = Object.keys(op.responses?.["200"]?.content ?? {}).some((ct) => ct.includes("json"));
  return json200 && /^ {4}200: /m.test(block[1]) ? `${name}[200]` : null;
}

/**
 * Type of the body a JSON operation answers with: `Responses[200 | 201 | …]` for
 * the `2xx` entries openapi-ts emitted (`204` has no body), else `null` and the
 * wrapper keeps `unknown`.
 */
function successType(operationId) {
  const name = `${typeBase(operationId)}Responses`;
  const block = typesSource.match(new RegExp(`export type ${name} = \\{([\\s\\S]*?)\\n\\};`));
  if (!block) return null;
  const codes = [...block[1].matchAll(/^ {4}(2\d\d): /gm)].map((m) => m[1]).filter((code) => code !== "204");
  return codes.length > 0 ? `${name}[${codes.join(" | ")}]` : null;
}

function hasBody(op) {
  return Boolean(op.requestBody);
}

/** Resolves a parameter object that may be a `$ref` to `components.parameters`. */
function resolveParam(spec, param) {
  if (param && typeof param === "object" && typeof param.$ref === "string") {
    const segments = param.$ref.replace(/^#\//, "").split("/");
    let node = spec;
    for (const segment of segments) {
      node = node?.[segment];
    }
    return node ?? {};
  }
  return param;
}

/**
 * True when the spec requires the `Idempotency-Key` header on an operation
 * that is not `POST` (design D6). `POST` already gets an auto-generated key
 * unconditionally (`http-client.ts` `METHODS_WITH_IDEMPOTENCY`), so it is
 * excluded here — the flag only carries new information for PUT/PATCH/DELETE.
 * Parameters declared via `$ref` to `components.parameters` are resolved.
 */
function idempotencyRequiredOffPost(method, op, spec) {
  if (method === "post") return false;
  return (op.parameters ?? []).some((p) => {
    const resolved = resolveParam(spec, p);
    return resolved.in === "header" && resolved.name === "Idempotency-Key" && resolved.required === true;
  });
}

// ---- Parse spec into a namespace tree ----------------------------------------

const spec = JSON.parse(readFileSync(specPath, "utf8"));

/**
 * Map: topResource -> Node, where Node = { ops: [], children: Map<name, Node> }.
 * Groups nest to any depth (`automations.rules.versions` → three levels): each
 * segment after the top resource becomes a child namespace with its own class,
 * so `rules.list` and `rules.versions.list` never collide on the same class.
 */
const tree = new Map();

function childNode(node, name) {
  if (!node.children.has(name)) {
    node.children.set(name, { ops: [], children: new Map() });
  }
  return node.children.get(name);
}

// Operations without `x-speakeasy-group` used to be dropped silently (`continue`).
// Endurecido (D4): they are collected here and fail the run below, before any
// output is written, instead of vanishing from the generated SDK unnoticed.
const ungrouped = [];

for (const [path, methods] of Object.entries(spec.paths)) {
  for (const [method, op] of Object.entries(methods)) {
    if (!HTTP_METHODS.has(method)) continue;
    const group = op["x-speakeasy-group"];
    if (!group) {
      ungrouped.push({ method: method.toUpperCase(), path, operationId: op.operationId ?? "(no operationId)" });
      continue;
    }
    const [top, ...rest] = group.split(".");
    if (!tree.has(top)) {
      tree.set(top, { ops: [], children: new Map() });
    }
    let node = tree.get(top);
    for (const segment of rest) {
      node = childNode(node, segment);
    }
    const action = camel(
      op.operationId.replace("public-api.v1.", "").split(".").pop()
    );
    const entry = {
      action,
      method: method.toUpperCase(),
      path,
      pathParams: pathParams(op),
      cursor: cursorParam(op),
      hasQuery: hasQuery(op),
      hasBody: hasBody(op),
      isBinary: isBinary(op),
      isBinaryOrJson: isBinaryOrJson(op),
      headerParams: headerParams(spec, op),
      noRetry: noRetryReason(op),
      bodyType: op.requestBody && !isMultipart(op) ? bodyTypeName(op.operationId) : null,
      acceptedType: jsonResponseType(op),
      successType: successType(op.operationId),
      hasImage: hasImageResponse(op),
      isMultipart: isMultipart(op),
      idempotent: idempotencyRequiredOffPost(method, op, spec),
      operationId: op.operationId,
      legacyConfigSecond: LEGACY_CONFIG_SECOND.has(op.operationId),
      summary: op.summary ?? "",
    };
    node.ops.push(entry);
  }
}

if (ungrouped.length > 0) {
  console.error(
    `build-resources: ${ungrouped.length} operation(s) have no x-speakeasy-group and would be silently dropped:`
  );
  for (const entry of ungrouped) {
    console.error(`  ${entry.method} ${entry.path} ${entry.operationId}`);
  }
  process.exit(1);
}

// ---- Emit per-method TS source ----------------------------------------------

function pathParamSignature(params) {
  return params.map((p) => `${camel(p)}: string`);
}

function pathParamObject(params) {
  return params.map((p) => `"${p}": ${camel(p)}`).join(", ");
}

function methodSource(entry) {
  const {
    action,
    method,
    path,
    pathParams: pp,
    cursor,
    hasQuery: hq,
    hasBody: hb,
    isBinary: bin,
    isBinaryOrJson: binJson,
    headerParams: headers,
    noRetry,
    bodyType,
    acceptedType,
    successType: okType,
    hasImage,
    isMultipart: mp,
    idempotent,
    operationId,
    legacyConfigSecond,
    summary,
  } = entry;
  const lines = [];
  const doc = summary ? summary.replace(/\n/g, " ") : `${method} ${path}`;
  const notes = [];
  if (headers.some((h) => h.toLowerCase() === "if-match")) {
    notes.push("Conditional: pass the `ETag` of the last read as `config.ifMatch`.");
  }
  // Only a bytes-or-JSON method has a `not_modified` result; a plain JSON method
  // would raise the `304`, so it does not advertise `config.ifNoneMatch`.
  if (binJson && headers.some((h) => h.toLowerCase() === "if-none-match")) {
    notes.push("Pass the `ETag` you hold as `config.ifNoneMatch` to get a `not_modified` result when it is current.");
  }
  const otherHeaders = headers.filter(
    (h) => !MANAGED_HEADERS.has(h.toLowerCase()) && !["if-match", "if-none-match"].includes(h.toLowerCase())
  );
  if (otherHeaders.length > 0) {
    notes.push(`Declared headers (${otherHeaders.join(", ")}) go in \`config.headers\`.`);
  }
  if (hasImage) {
    notes.push("Answers with JSON metadata by default; send `config.headers: { Accept: \"image/png\" }` (or another image type) to get the stored bytes.");
  }
  if (noRetry) {
    notes.push(`Never retried automatically: ${noRetry}.`);
  }
  if (notes.length === 0) {
    lines.push(`  /** ${doc} */`);
  } else {
    lines.push("  /**", `   * ${doc}`, ...notes.map((note) => `   * ${note}`), "   */");
  }

  if (legacyConfigSecond && (method !== "GET" || cursor || bin || mp || !hq)) {
    throw new Error(
      `build-resources: ${operationId} is in LEGACY_CONFIG_SECOND but is not a plain GET with a query; ` +
        "the overload is only implemented for that shape."
    );
  }

  const ret = okType ?? "unknown";
  const sig = [];
  const callPathParams = pp.length > 0;
  for (const p of pp) {
    sig.push(`${camel(p)}: string`);
  }

  const pathExpr = callPathParams
    ? `this.buildPath("${path}", { ${pathParamObject(pp)} })`
    : `"${path}"`;

  // ---- Listing with cursor pagination -> Page<unknown>
  if (cursor) {
    sig.push("params?: Record<string, unknown>", "config?: RequestConfig");
    lines.push(
      `  async ${action}(${sig.join(", ")}): Promise<Page<unknown>> {`
    );
    if (callPathParams) {
      lines.push(`    const path = ${pathExpr};`);
      lines.push(
        `    return this._paginate<unknown>(path, params, "${cursor}", config);`
      );
    } else {
      lines.push(
        `    return this._paginate<unknown>(${pathExpr}, params, "${cursor}", config);`
      );
    }
    lines.push(`  }`);
    return lines.join("\n");
  }

  // ---- Bytes, JSON status document or 304: discriminated union
  if (binJson) {
    if (hq) sig.push("params?: Record<string, unknown>");
    if (hb) sig.push(`body?: ${bodyType ? `${bodyType}["body"]` : "unknown"}`);
    sig.push("config?: RequestConfig");
    lines.push(
      `  async ${action}(${sig.join(", ")}): Promise<BinaryOrJsonResponse<${acceptedType ?? "unknown"}>> {`
    );
    lines.push(`    const path = ${pathExpr};`);
    const q = hq ? "params" : "undefined";
    const b = hb ? "body" : "undefined";
    lines.push(
      `    return this._binaryOrJson<${acceptedType ?? "unknown"}>(path, "${method}", ${q}, ${b}, config);`
    );
    lines.push(`  }`);
    return lines.join("\n");
  }

  // ---- Binary download
  if (bin) {
    if (hq) sig.push("params?: Record<string, unknown>");
    if (hb) sig.push(`body?: ${bodyType ? `${bodyType}["body"]` : "unknown"}`);
    sig.push("config?: RequestConfig");
    lines.push(
      `  async ${action}(${sig.join(", ")}): Promise<BinaryResponse> {`
    );
    lines.push(`    const path = ${pathExpr};`);
    const q = hq ? "params" : "undefined";
    const b = hb ? "body" : "undefined";
    lines.push(
      `    return this._binary(path, "${method}", ${q}, ${b}, config);`
    );
    lines.push(`  }`);
    return lines.join("\n");
  }

  // ---- Multipart upload
  if (mp) {
    sig.push("formData: FormData", "config?: RequestConfig");
    lines.push(`  async ${action}(${sig.join(", ")}): Promise<${ret}> {`);
    lines.push(`    const path = ${pathExpr};`);
    lines.push(`    return this._sendForm<${ret}>(path, formData, config);`);
    lines.push(`  }`);
    return lines.join("\n");
  }

  // ---- GET (non-list) that gained its first query after shipping as `(…, config?)`
  if (legacyConfigSecond) {
    const head = sig.join(", ");
    const lead = head ? `${head}, ` : "";
    const q = "Record<string, unknown>";
    lines.push(`  ${action}(${lead}config?: RequestConfig): Promise<${ret}>;`);
    lines.push(`  ${action}(${lead}params?: ${q}, config?: RequestConfig): Promise<${ret}>;`);
    lines.push(
      `  async ${action}(${lead}paramsOrConfig?: ${q} | RequestConfig, config?: RequestConfig): Promise<${ret}> {`
    );
    lines.push(`    const path = ${pathExpr};`);
    lines.push(`    const args = splitQueryAndConfig(paramsOrConfig, config);`);
    lines.push(`    return this._get<${ret}>(path, args.params, args.config);`);
    lines.push(`  }`);
    return lines.join("\n");
  }

  // ---- GET (non-list)
  if (method === "GET") {
    if (hq) sig.push("params?: Record<string, unknown>");
    sig.push("config?: RequestConfig");
    lines.push(`  async ${action}(${sig.join(", ")}): Promise<${ret}> {`);
    lines.push(`    const path = ${pathExpr};`);
    const q = hq ? "params" : "undefined";
    lines.push(`    return this._get<${ret}>(path, ${q}, config);`);
    lines.push(`  }`);
    return lines.join("\n");
  }

  // ---- POST / PUT / PATCH / DELETE
  if (hb) sig.push(`body?: ${bodyType ? `${bodyType}["body"]` : "unknown"}`);
  if (hq && !hb) sig.push("params?: Record<string, unknown>");
  sig.push("config?: RequestConfig");
  lines.push(`  async ${action}(${sig.join(", ")}): Promise<${ret}> {`);
  lines.push(`    const path = ${pathExpr};`);
  // Spec-guided idempotency (D6): the spec requires `Idempotency-Key` on this
  // non-POST mutation, so the call opts in explicitly via the resource layer.
  const flags = [idempotent ? "idempotent: true" : null, noRetry ? "noRetry: true" : null].filter(Boolean);
  const opts = flags.length > 0 ? `, { ${flags.join(", ")} }` : "";
  if (method === "DELETE" && hq && !hb) {
    // DELETE with query (legacy bulk): pass query, no body.
    lines.push(`    return this._delete<${ret}>(path, params, config${opts});`);
  } else {
    const b = hb ? "body" : "undefined";
    lines.push(
      `    return this._send<${ret}>("${method}", path, ${b}, config${opts});`
    );
  }
  lines.push(`  }`);
  return lines.join("\n");
}

/**
 * Emits the class of a namespace node and, recursively, of every descendant.
 * `nested` holds the descendant sources, which the file writes BEFORE this
 * class because the class references them. Class names concatenate the
 * PascalCased path (`AutomationsRulesVersionsResource`), so two-level names
 * are unchanged from the previous generator.
 */
function classSource(prefix, node) {
  const className = `${prefix}Resource`;
  const nested = [];
  const childFields = [];

  for (const [childName, child] of node.children) {
    const emitted = classSource(`${prefix}${pascal(childName)}`, child);
    nested.push(...emitted.nested, emitted.source);
    childFields.push({ name: camel(childName), className: emitted.className });
  }

  const methods = node.ops.map(methodSource).join("\n\n");

  const lines = [];
  lines.push(`export class ${className} extends BaseResource {`);
  for (const f of childFields) {
    lines.push(`  readonly ${f.name}: ${f.className};`);
  }
  if (childFields.length > 0) {
    lines.push("");
    lines.push("  constructor(client: HttpClient) {");
    lines.push("    super(client);");
    for (const f of childFields) {
      lines.push(`    this.${f.name} = new ${f.className}(client);`);
    }
    lines.push("  }");
    if (methods) lines.push("");
  }
  if (methods) lines.push(methods);
  lines.push("}");
  return { className, source: lines.join("\n"), nested };
}

// ---- Write files -------------------------------------------------------------

if (existsSync(outDir)) {
  rmSync(outDir, { recursive: true, force: true });
}
mkdirSync(outDir, { recursive: true });

const header = `// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with \`npm run generate:resources\`. These wrappers compose the
// hand-written core (\`../core\`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
`;

const indexExports = [];
const sortedTops = [...tree.keys()].sort();

for (const top of sortedTops) {
  const node = tree.get(top);
  // descendant classes first (referenced by their parents)
  const topClass = classSource(pascal(top), node);
  const body = [...topClass.nested, topClass.source];
  // Only the files that emit a legacy overload import the splitter.
  const usesSplitter = body.some((source) => source.includes("splitQueryAndConfig("));
  // Imports that only some files need are added on demand, so unrelated
  // generated files stay byte-identical when a feature lands.
  const usesUnion = body.some((source) => source.includes("BinaryOrJsonResponse<"));
  const generatedTypes = [
    ...new Set(body.join("\n").match(/\bPublicApiV1\w+(?:Data|Responses)(?=\[)/g) ?? []),
  ].sort();
  let fileHeader = header;
  if (usesSplitter) {
    fileHeader = fileHeader.replace(
      "import { BaseResource, type RequestConfig }",
      "import { BaseResource, splitQueryAndConfig, type RequestConfig }"
    );
  }
  if (usesUnion) {
    fileHeader = fileHeader.replace(
      "import type { HttpClient, BinaryResponse }",
      "import type { HttpClient, BinaryOrJsonResponse, BinaryResponse }"
    );
  }
  if (generatedTypes.length > 0) {
    fileHeader += `import type { ${generatedTypes.join(", ")} } from "../generated/types.gen.js";\n`;
  }
  const parts = [fileHeader, ...body];

  const fileName = `${top}.ts`;
  writeFileSync(join(outDir, fileName), parts.join("\n\n") + "\n", "utf8");
  indexExports.push({
    file: top,
    className: topClass.className,
    field: camel(top),
  });
}

// Resource index: re-exports + a registry the client uses to wire namespaces.
const indexLines = [
  "// AUTO-GENERATED. Do not edit by hand. Regenerate with `npm run generate:resources`.",
  "",
  'import type { HttpClient } from "../core/http-client.js";',
];
for (const e of indexExports) {
  indexLines.push(`import { ${e.className} } from "./${e.file}.js";`);
}
indexLines.push("");
for (const e of indexExports) {
  indexLines.push(`export { ${e.className} } from "./${e.file}.js";`);
}
indexLines.push("");
indexLines.push("export interface ResourceNamespaces {");
for (const e of indexExports) {
  indexLines.push(`  ${e.field}: ${e.className};`);
}
indexLines.push("}");
indexLines.push("");
indexLines.push(
  "export function createResources(client: HttpClient): ResourceNamespaces {"
);
indexLines.push("  return {");
for (const e of indexExports) {
  indexLines.push(`    ${e.field}: new ${e.className}(client),`);
}
indexLines.push("  };");
indexLines.push("}");

writeFileSync(join(outDir, "index.ts"), indexLines.join("\n") + "\n", "utf8");

function countOps(node) {
  return (
    node.ops.length +
    [...node.children.values()].reduce((acc, child) => acc + countOps(child), 0)
  );
}
const totalOps = [...tree.values()].reduce(
  (acc, node) => acc + countOps(node),
  0
);
console.log(
  `Generated ${sortedTops.length} resource files (${totalOps} operations) into src/resources/.`
);
