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
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  existsSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const specPath = join(root, "spec", "openapi.json");
const outDir = join(root, "src", "resources");

const HTTP_METHODS = new Set(["get", "post", "put", "patch", "delete"]);

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
        ct.includes("octet-stream") ||
        ct.includes("zip")
      ) {
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

function hasBody(op) {
  return Boolean(op.requestBody);
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

for (const [path, methods] of Object.entries(spec.paths)) {
  for (const [method, op] of Object.entries(methods)) {
    if (!HTTP_METHODS.has(method)) continue;
    const group = op["x-speakeasy-group"];
    if (!group) continue;
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
      isMultipart: isMultipart(op),
      summary: op.summary ?? "",
    };
    node.ops.push(entry);
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
  const {
    action,
    method,
    path,
    pathParams: pp,
    cursor,
    hasQuery: hq,
    hasBody: hb,
    isBinary: bin,
    isMultipart: mp,
    summary,
  } = entry;
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
    lines.push(
      `  async ${action}(${sig.join(", ")}): Promise<Page<unknown>> {`
    );
    if (callPathParams) {
      lines.push(`    const path = ${pathExpr};`);
      lines.push(
        `    return this._paginate<unknown>(path, params, "${cursor}");`
      );
    } else {
      lines.push(
        `    return this._paginate<unknown>(${pathExpr}, params, "${cursor}");`
      );
    }
    lines.push(`  }`);
    return lines.join("\n");
  }

  // ---- Binary download
  if (bin) {
    if (hq) sig.push("params?: Record<string, unknown>");
    if (hb) sig.push("body?: unknown");
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
    lines.push(
      `    return this._send<unknown>("${method}", path, ${b}, config);`
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
  // descendant classes first (referenced by their parents)
  const topClass = classSource(pascal(top), node);
  parts.push(...topClass.nested, topClass.source);

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
