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
 * (`backend/docs/api/sdk-method-naming.md @ 1.0.0`): the last dotted segment of
 * the operationId is the action, the preceding segments are the namespace, all
 * camelCased.
 *
 * Run via `npm run generate:resources` (and as part of `npm run generate`).
 * Output is committed; it is regenerated only when the spec changes.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const specPath = join(root, "spec", "openapi.json");
const outDir = join(root, "src", "resources");

const HTTP_METHODS = new Set(["get", "post", "put", "patch", "delete"]);

function camel(segment) {
  const parts = segment.replace(/-/g, "_").split("_");
  return parts[0] + parts.slice(1).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
}

function pascal(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function isBinary(op) {
  for (const resp of Object.values(op.responses ?? {})) {
    for (const ct of Object.keys(resp.content ?? {})) {
      if (ct.includes("pdf") || ct.includes("octet-stream") || ct.includes("zip")) {
        return true;
      }
    }
  }
  return false;
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
  const names = new Set((op.parameters ?? []).filter((p) => p.in === "query").map((p) => p.name));
  if (names.has("starting_after")) return "starting_after";
  if (names.has("cursor")) return "cursor";
  return null;
}

function hasQuery(op) {
  return (op.parameters ?? []).some((p) => p.in === "query");
}

function pathParams(op) {
  return (op.parameters ?? []).filter((p) => p.in === "path").map((p) => p.name);
}

function hasBody(op) {
  return Boolean(op.requestBody);
}

// ---- Parse spec into a namespace tree ----------------------------------------

const spec = JSON.parse(readFileSync(specPath, "utf8"));

/** Map: topResource -> { ops: [], children: Map<childName, [ops]> } */
const tree = new Map();

for (const [path, methods] of Object.entries(spec.paths)) {
  for (const [method, op] of Object.entries(methods)) {
    if (!HTTP_METHODS.has(method)) continue;
    const group = op["x-speakeasy-group"];
    if (!group) continue;
    const [top, child] = group.split(".");
    if (!tree.has(top)) {
      tree.set(top, { ops: [], children: new Map() });
    }
    const node = tree.get(top);
    const action = camel(op.operationId.replace("public-api.v1.", "").split(".").pop());
    const entry = {
      action,
      method: method.toUpperCase(),
      path,
      pathParams: pathParams(op),
      cursor: cursorParam(op),
      hasQuery: hasQuery(op),
      hasBody: hasBody(op),
      isBinary: isBinary(op),
      isMultipart: isMultipart(op),
      summary: op.summary ?? "",
    };
    if (child) {
      if (!node.children.has(child)) {
        node.children.set(child, []);
      }
      node.children.get(child).push(entry);
    } else {
      node.ops.push(entry);
    }
  }
}

// ---- Emit per-method TS source ----------------------------------------------

function pathParamSignature(params) {
  return params.map((p) => `${camel(p)}: string`);
}

function pathParamObject(params) {
  return params.map((p) => `"${p}": ${camel(p)}`).join(", ");
}

function methodSource(entry) {
  const { action, method, path, pathParams: pp, cursor, hasQuery: hq, hasBody: hb, isBinary: bin, isMultipart: mp, summary } = entry;
  const lines = [];
  const doc = summary ? summary.replace(/\n/g, " ") : `${method} ${path}`;
  lines.push(`  /** ${doc} */`);

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
    lines.push(`  async ${action}(${sig.join(", ")}): Promise<Page<unknown>> {`);
    if (callPathParams) {
      lines.push(`    const path = ${pathExpr};`);
      lines.push(`    return this._paginate<unknown>(path, params, "${cursor}");`);
    } else {
      lines.push(`    return this._paginate<unknown>(${pathExpr}, params, "${cursor}");`);
    }
    lines.push(`  }`);
    return lines.join("\n");
  }

  // ---- Binary download
  if (bin) {
    if (hq) sig.push("params?: Record<string, unknown>");
    if (hb) sig.push("body?: unknown");
    sig.push("config?: RequestConfig");
    lines.push(`  async ${action}(${sig.join(", ")}): Promise<BinaryResponse> {`);
    lines.push(`    const path = ${pathExpr};`);
    const q = hq ? "params" : "undefined";
    const b = hb ? "body" : "undefined";
    lines.push(`    return this._binary(path, "${method}", ${q}, ${b}, config);`);
    lines.push(`  }`);
    return lines.join("\n");
  }

  // ---- Multipart upload
  if (mp) {
    sig.push("formData: FormData", "config?: RequestConfig");
    lines.push(`  async ${action}(${sig.join(", ")}): Promise<unknown> {`);
    lines.push(`    const path = ${pathExpr};`);
    lines.push(`    return this._sendForm<unknown>(path, formData, config);`);
    lines.push(`  }`);
    return lines.join("\n");
  }

  // ---- GET (non-list)
  if (method === "GET") {
    if (hq) sig.push("params?: Record<string, unknown>");
    sig.push("config?: RequestConfig");
    lines.push(`  async ${action}(${sig.join(", ")}): Promise<unknown> {`);
    lines.push(`    const path = ${pathExpr};`);
    const q = hq ? "params" : "undefined";
    lines.push(`    return this._get<unknown>(path, ${q}, config);`);
    lines.push(`  }`);
    return lines.join("\n");
  }

  // ---- POST / PUT / PATCH / DELETE
  if (hb) sig.push("body?: unknown");
  if (hq && !hb) sig.push("params?: Record<string, unknown>");
  sig.push("config?: RequestConfig");
  lines.push(`  async ${action}(${sig.join(", ")}): Promise<unknown> {`);
  lines.push(`    const path = ${pathExpr};`);
  if (method === "DELETE" && hq && !hb) {
    // DELETE with query (legacy bulk): pass query, no body.
    lines.push(`    return this._delete<unknown>(path, params, config);`);
  } else {
    const b = hb ? "body" : "undefined";
    lines.push(`    return this._send<unknown>("${method}", path, ${b}, config);`);
  }
  lines.push(`  }`);
  return lines.join("\n");
}

function childClassSource(top, childName, ops) {
  const className = `${pascal(top)}${pascal(childName)}Resource`;
  const body = ops.map(methodSource).join("\n\n");
  return { className, source: `export class ${className} extends BaseResource {\n${body}\n}` };
}

function topClassSource(top, node) {
  const className = `${pascal(top)}Resource`;
  const childClasses = [];
  const childFields = [];

  for (const [childName, ops] of node.children) {
    const { className: childClassName } = childClassSource(top, childName, ops);
    childFields.push({ name: camel(childName), className: childClassName });
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
  return { className, source: lines.join("\n") };
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
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
`;

const indexExports = [];
const sortedTops = [...tree.keys()].sort();

for (const top of sortedTops) {
  const node = tree.get(top);
  const parts = [header];
  // child classes first (referenced by the top class)
  for (const [childName, ops] of node.children) {
    parts.push(childClassSource(top, childName, ops).source);
  }
  const topClass = topClassSource(top, node);
  parts.push(topClass.source);

  const fileName = `${top}.ts`;
  writeFileSync(join(outDir, fileName), parts.join("\n\n") + "\n", "utf8");
  indexExports.push({ file: top, className: topClass.className, field: camel(top) });
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
indexLines.push("export function createResources(client: HttpClient): ResourceNamespaces {");
indexLines.push("  return {");
for (const e of indexExports) {
  indexLines.push(`    ${e.field}: new ${e.className}(client),`);
}
indexLines.push("  };");
indexLines.push("}");

writeFileSync(join(outDir, "index.ts"), indexLines.join("\n") + "\n", "utf8");

const totalOps = [...tree.values()].reduce(
  (acc, node) => acc + node.ops.length + [...node.children.values()].reduce((a, o) => a + o.length, 0),
  0,
);
console.log(`Generated ${sortedTops.length} resource files (${totalOps} operations) into src/resources/.`);
