// Exercises `scripts/build-resources.mjs` end-to-end against fixture specs
// written to a scratch directory, via its `--spec <path>` / `--out <dir>`
// flags (design D4). Covers: the happy path, the hardened guard against
// operations missing `x-speakeasy-group` (which used to be dropped silently),
// the spec-guided `Idempotency-Key` opt-in for non-POST mutations (D6), and the
// `(…, config?)` overload of operations that later gained their first query.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

const scriptPath = fileURLToPath(new URL("../scripts/build-resources.mjs", import.meta.url));
const scratchDirs: string[] = [];

function scratchDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "build-resources-test-"));
  scratchDirs.push(dir);
  return dir;
}

function writeSpec(dir: string, spec: unknown): string {
  const specPath = join(dir, "openapi.json");
  writeFileSync(specPath, JSON.stringify(spec), "utf8");
  return specPath;
}

interface RunResult {
  status: number;
  stdout: string;
  stderr: string;
}

function run(specPath: string, outDir: string, typesPath?: string): RunResult {
  const args = [scriptPath, "--spec", specPath, "--out", outDir, ...(typesPath ? ["--types", typesPath] : [])];
  try {
    const stdout = execFileSync(process.execPath, args, {
      encoding: "utf8",
    });
    return { status: 0, stdout, stderr: "" };
  } catch (error) {
    const e = error as { status?: number; stdout?: Buffer | string; stderr?: Buffer | string };
    return {
      status: e.status ?? 1,
      stdout: e.stdout?.toString() ?? "",
      stderr: e.stderr?.toString() ?? "",
    };
  }
}

afterEach(() => {
  // Scratch dirs live under the OS tmpdir; nothing under the repo to clean.
  scratchDirs.length = 0;
});

describe("build-resources.mjs --spec/--out", () => {
  it("generates resource wrappers from a fixture spec into the given --out directory", () => {
    const dir = scratchDir();
    const outDir = join(dir, "resources");
    const specPath = writeSpec(dir, {
      openapi: "3.1.0",
      paths: {
        "/widgets": {
          get: {
            operationId: "public-api.v1.widgets.list",
            "x-speakeasy-group": "widgets",
            parameters: [{ name: "starting_after", in: "query", schema: { type: "string" } }],
            responses: { "200": { content: { "application/json": {} } } },
          },
        },
      },
    });

    const result = run(specPath, outDir);

    expect(result.status).toBe(0);
    expect(existsSync(join(outDir, "widgets.ts"))).toBe(true);
    expect(existsSync(join(outDir, "index.ts"))).toBe(true);
    const source = readFileSync(join(outDir, "widgets.ts"), "utf8");
    expect(source).toContain("export class WidgetsResource extends BaseResource");
    expect(source).toContain("async list(");
  });

  it("fails before writing when an operation has no x-speakeasy-group, listing method, path and operationId", () => {
    const dir = scratchDir();
    const outDir = join(dir, "resources");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, "sentinel.ts"), "// pre-existing, must survive a failed run\n", "utf8");
    const specPath = writeSpec(dir, {
      openapi: "3.1.0",
      paths: {
        "/widgets": {
          get: {
            operationId: "public-api.v1.widgets.list",
            // No `x-speakeasy-group`: this used to be dropped silently.
            responses: { "200": { content: { "application/json": {} } } },
          },
        },
      },
    });

    const result = run(specPath, outDir);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("GET /widgets public-api.v1.widgets.list");
    // The guard runs before the output directory is wiped (D4): a late
    // failure must not leave `--out` empty.
    expect(existsSync(join(outDir, "sentinel.ts"))).toBe(true);
  });

  it("opts non-POST mutations that require Idempotency-Key into the spec-guided { idempotent: true }", () => {
    const dir = scratchDir();
    const outDir = join(dir, "resources");
    const specPath = writeSpec(dir, {
      openapi: "3.1.0",
      paths: {
        "/widgets/{widget}": {
          delete: {
            operationId: "public-api.v1.widgets.archive",
            "x-speakeasy-group": "widgets",
            parameters: [
              { name: "widget", in: "path", required: true, schema: { type: "string" } },
              { name: "Idempotency-Key", in: "header", required: true, schema: { type: "string" } },
            ],
            requestBody: { content: { "application/json": {} } },
            responses: { "200": { content: { "application/json": {} } } },
          },
        },
      },
    });

    const result = run(specPath, outDir);

    expect(result.status).toBe(0);
    const source = readFileSync(join(outDir, "widgets.ts"), "utf8");
    expect(source).toContain(
      'return this._send<unknown>("DELETE", path, body, config, { idempotent: true });'
    );
  });

  it("resolves a $ref to components.parameters when checking for a required Idempotency-Key", () => {
    const dir = scratchDir();
    const outDir = join(dir, "resources");
    const specPath = writeSpec(dir, {
      openapi: "3.1.0",
      paths: {
        "/widgets/{widget}": {
          delete: {
            operationId: "public-api.v1.widgets.archive",
            "x-speakeasy-group": "widgets",
            parameters: [
              { name: "widget", in: "path", required: true, schema: { type: "string" } },
              { $ref: "#/components/parameters/IdempotencyKey" },
            ],
            requestBody: { content: { "application/json": {} } },
            responses: { "200": { content: { "application/json": {} } } },
          },
        },
      },
      components: {
        parameters: {
          IdempotencyKey: { name: "Idempotency-Key", in: "header", required: true, schema: { type: "string" } },
        },
      },
    });

    const result = run(specPath, outDir);

    expect(result.status).toBe(0);
    const source = readFileSync(join(outDir, "widgets.ts"), "utf8");
    expect(source).toContain(
      'return this._send<unknown>("DELETE", path, body, config, { idempotent: true });'
    );
  });

  it("does not opt a mutation into { idempotent: true } when Idempotency-Key is not required", () => {
    const dir = scratchDir();
    const outDir = join(dir, "resources");
    const specPath = writeSpec(dir, {
      openapi: "3.1.0",
      paths: {
        "/widgets/{widget}": {
          put: {
            operationId: "public-api.v1.widgets.update",
            "x-speakeasy-group": "widgets",
            parameters: [{ name: "widget", in: "path", required: true, schema: { type: "string" } }],
            requestBody: { content: { "application/json": {} } },
            responses: { "200": { content: { "application/json": {} } } },
          },
        },
      },
    });

    const result = run(specPath, outDir);

    expect(result.status).toBe(0);
    const source = readFileSync(join(outDir, "widgets.ts"), "utf8");
    expect(source).toContain('return this._send<unknown>("PUT", path, body, config);');
    expect(source).not.toContain("{ idempotent: true }");
  });

  it("emits _sendForm for multipart requests and _binary for binary responses", () => {
    const dir = scratchDir();
    const outDir = join(dir, "resources");
    const specPath = writeSpec(dir, {
      openapi: "3.1.0",
      paths: {
        "/widgets": {
          post: {
            operationId: "public-api.v1.widgets.create",
            "x-speakeasy-group": "widgets",
            requestBody: { content: { "multipart/form-data": {} } },
            responses: { "202": { content: { "application/json": {} } } },
          },
        },
        "/widgets/{widget}/source": {
          get: {
            operationId: "public-api.v1.widgets.source",
            "x-speakeasy-group": "widgets",
            parameters: [{ name: "widget", in: "path", required: true, schema: { type: "string" } }],
            responses: {
              "200": { content: { "application/pdf": {}, "image/png": {} } },
            },
          },
        },
      },
    });

    const result = run(specPath, outDir);

    expect(result.status).toBe(0);
    const source = readFileSync(join(outDir, "widgets.ts"), "utf8");
    expect(source).toContain("async create(formData: FormData, config?: RequestConfig): Promise<unknown> {");
    expect(source).toContain('return this._sendForm<unknown>(path, formData, config);');
    expect(source).toContain("Promise<BinaryResponse> {");
    expect(source).toContain('return this._binary(path, "GET", undefined, undefined, config);');
  });

  it("emits _binary for an operation that only answers with images", () => {
    const dir = scratchDir();
    const outDir = join(dir, "resources");
    const specPath = writeSpec(dir, {
      openapi: "3.1.0",
      paths: {
        "/widgets/{widget}/qr": {
          get: {
            operationId: "public-api.v1.widgets.qr",
            "x-speakeasy-group": "widgets",
            parameters: [{ name: "widget", in: "path", required: true, schema: { type: "string" } }],
            responses: {
              "200": { content: { "image/svg+xml": {}, "image/png": {} } },
              "422": { content: { "application/json": {} } },
            },
          },
        },
      },
    });

    const result = run(specPath, outDir);

    expect(result.status).toBe(0);
    const source = readFileSync(join(outDir, "widgets.ts"), "utf8");
    expect(source).toContain("Promise<BinaryResponse> {");
    expect(source).toContain('return this._binary(path, "GET", undefined, undefined, config);');
  });

  it("does not opt POST into { idempotent: true } (already unconditional in http-client.ts)", () => {
    const dir = scratchDir();
    const outDir = join(dir, "resources");
    const specPath = writeSpec(dir, {
      openapi: "3.1.0",
      paths: {
        "/widgets": {
          post: {
            operationId: "public-api.v1.widgets.create",
            "x-speakeasy-group": "widgets",
            parameters: [{ name: "Idempotency-Key", in: "header", required: true, schema: { type: "string" } }],
            requestBody: { content: { "application/json": {} } },
            responses: { "200": { content: { "application/json": {} } } },
          },
        },
      },
    });

    const result = run(specPath, outDir);

    expect(result.status).toBe(0);
    const source = readFileSync(join(outDir, "widgets.ts"), "utf8");
    expect(source).toContain('return this._send<unknown>("POST", path, body, config);');
    expect(source).not.toContain("{ idempotent: true }");
  });

  it("keeps the (…, config?) call shape of a listed legacy GET that gained a query parameter", () => {
    const dir = scratchDir();
    const outDir = join(dir, "resources");
    const specPath = writeSpec(dir, {
      openapi: "3.1.0",
      paths: {
        "/invoices/{invoice}/pdf-link": {
          get: {
            operationId: "public-api.v1.invoices.pdf_link",
            "x-speakeasy-group": "invoices",
            parameters: [
              { name: "invoice", in: "path", required: true, schema: { type: "string" } },
              { name: "format", in: "query", schema: { type: "string" } },
            ],
            responses: { "200": { content: { "application/json": {} } } },
          },
        },
        "/widgets/{widget}": {
          get: {
            operationId: "public-api.v1.widgets.show",
            "x-speakeasy-group": "widgets",
            parameters: [
              { name: "widget", in: "path", required: true, schema: { type: "string" } },
              { name: "include", in: "query", schema: { type: "string" } },
            ],
            responses: { "200": { content: { "application/json": {} } } },
          },
        },
      },
    });

    const result = run(specPath, outDir);

    expect(result.status).toBe(0);
    const legacy = readFileSync(join(outDir, "invoices.ts"), "utf8");
    expect(legacy).toContain("pdfLink(invoice: string, config?: RequestConfig): Promise<unknown>;");
    expect(legacy).toContain("pdfLink(invoice: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown>;");
    expect(legacy).toContain("const args = splitQueryAndConfig(paramsOrConfig, config);");
    expect(legacy).toContain("return this._get<unknown>(path, args.params, args.config);");
    expect(legacy).toContain("import { BaseResource, splitQueryAndConfig, type RequestConfig }");
    // An unlisted GET with a query keeps the plain (params?, config?) shape and no splitter import.
    const plain = readFileSync(join(outDir, "widgets.ts"), "utf8");
    expect(plain).toContain("async show(widget: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {");
    expect(plain).not.toContain("splitQueryAndConfig");
  });

  it("fails when a legacy-listed operation is not a plain GET with a query", () => {
    const dir = scratchDir();
    const outDir = join(dir, "resources");
    const specPath = writeSpec(dir, {
      openapi: "3.1.0",
      paths: {
        "/invoices/{invoice}/pdf-link": {
          post: {
            operationId: "public-api.v1.invoices.pdf_link",
            "x-speakeasy-group": "invoices",
            parameters: [{ name: "invoice", in: "path", required: true, schema: { type: "string" } }],
            responses: { "200": { content: { "application/json": {} } } },
          },
        },
      },
    });

    const result = run(specPath, outDir);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("LEGACY_CONFIG_SECOND");
  });

  it("returns a listed text/csv operation as a BinaryResponse and leaves other CSV operations alone", () => {
    const dir = scratchDir();
    const outDir = join(dir, "resources");
    const csv = { "200": { content: { "text/csv": {} } } };
    const specPath = writeSpec(dir, {
      openapi: "3.1.0",
      paths: {
        "/contacts/imports/{id}/errors.csv": {
          get: {
            operationId: "public-api.v1.contacts.imports.errors",
            "x-speakeasy-group": "contacts.imports",
            parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
            responses: csv,
          },
        },
        "/widgets/template": {
          get: { operationId: "public-api.v1.widgets.template", "x-speakeasy-group": "widgets", responses: csv },
        },
      },
    });

    const result = run(specPath, outDir);

    expect(result.status).toBe(0);
    expect(readFileSync(join(outDir, "contacts.ts"), "utf8")).toContain("async errors(id: string, config?: RequestConfig): Promise<BinaryResponse> {");
    expect(readFileSync(join(outDir, "widgets.ts"), "utf8")).toContain("async template(config?: RequestConfig): Promise<unknown> {");
  });

  it("documents conditional headers and routes ifMatch/ifNoneMatch through config", () => {
    const dir = scratchDir();
    const outDir = join(dir, "resources");
    const specPath = writeSpec(dir, {
      openapi: "3.1.0",
      paths: {
        "/widgets/{widget}/layout": {
          patch: {
            operationId: "public-api.v1.widgets.assign_layout",
            "x-speakeasy-group": "widgets",
            summary: "Assign a layout",
            parameters: [
              { name: "widget", in: "path", required: true, schema: { type: "string" } },
              { name: "If-Match", in: "header", schema: { type: "string" } },
              { name: "X-Trace", in: "header", schema: { type: "string" } },
            ],
            requestBody: { content: { "application/json": {} } },
            responses: { "200": { content: { "application/json": {} } } },
          },
        },
      },
    });

    expect(run(specPath, outDir).status).toBe(0);
    const source = readFileSync(join(outDir, "widgets.ts"), "utf8");
    expect(source).toContain("Conditional: pass the `ETag` of the last read as `config.ifMatch`.");
    expect(source).toContain("Declared headers (X-Trace) go in `config.headers`.");
    expect(source).toContain('return this._send<unknown>("PATCH", path, body, config);');
  });

  it("promises a not_modified result for If-None-Match only where the method returns BinaryOrJsonResponse", () => {
    const dir = scratchDir();
    const outDir = join(dir, "resources");
    const ifNoneMatch = { name: "If-None-Match", in: "header", schema: { type: "string" } };
    const specPath = writeSpec(dir, {
      openapi: "3.1.0",
      paths: {
        "/widgets/{widget}/pdf": {
          get: {
            operationId: "public-api.v1.widgets.pdf",
            "x-speakeasy-group": "widgets",
            summary: "Download a widget PDF",
            parameters: [{ name: "widget", in: "path", required: true, schema: { type: "string" } }, ifNoneMatch],
            responses: { "200": { content: { "application/pdf": {} } }, "304": { description: "Not modified" } },
          },
        },
        "/widgets/catalog": {
          get: {
            operationId: "public-api.v1.widgets.catalog",
            "x-speakeasy-group": "widgets",
            summary: "Retrieve the widget catalog",
            parameters: [ifNoneMatch],
            responses: { "200": { content: { "application/json": {} } }, "304": { description: "Not modified" } },
          },
        },
      },
    });

    expect(run(specPath, outDir).status).toBe(0);
    const source = readFileSync(join(outDir, "widgets.ts"), "utf8");
    const note = "Pass the `ETag` you hold as `config.ifNoneMatch` to get a `not_modified` result when it is current.";
    expect(source).toContain(`   * Download a widget PDF\n   * ${note}\n   */\n  async pdf(widget: string, config?: RequestConfig): Promise<BinaryOrJsonResponse<unknown>> {`);
    expect(source).toContain("  /** Retrieve the widget catalog */\n  async catalog(config?: RequestConfig): Promise<unknown> {");
    expect(source.split(note)).toHaveLength(2);
  });

  it("returns the bytes/JSON/304 union for a binary operation that also declares 202 or 304", () => {
    const dir = scratchDir();
    const outDir = join(dir, "resources");
    const specPath = writeSpec(dir, {
      openapi: "3.1.0",
      paths: {
        "/widgets/{widget}/pdf": {
          get: {
            operationId: "public-api.v1.widgets.pdf",
            "x-speakeasy-group": "widgets",
            parameters: [{ name: "widget", in: "path", required: true, schema: { type: "string" } }],
            responses: {
              "200": { content: { "application/pdf": {} } },
              "202": { content: { "application/json": {} } },
              "304": { description: "Not modified" },
            },
          },
        },
        "/widgets/{widget}/plain.pdf": {
          get: {
            operationId: "public-api.v1.widgets.plain",
            "x-speakeasy-group": "widgets",
            parameters: [{ name: "widget", in: "path", required: true, schema: { type: "string" } }],
            responses: { "200": { content: { "application/pdf": {} } }, "404": { content: { "application/json": {} } } },
          },
        },
      },
    });

    expect(run(specPath, outDir).status).toBe(0);
    const source = readFileSync(join(outDir, "widgets.ts"), "utf8");
    expect(source).toContain("Promise<BinaryOrJsonResponse<unknown>>");
    expect(source).toContain('return this._binaryOrJson<unknown>(path, "GET", undefined, undefined, config);');
    expect(source).toContain("import type { HttpClient, BinaryOrJsonResponse, BinaryResponse }");
    // Error responses in JSON do not turn a plain download into the union.
    expect(source).toContain("async plain(widget: string, config?: RequestConfig): Promise<BinaryResponse> {");
  });

  it("marks operations as never retried: the explicit FACe list and x-no-retry in the spec", () => {
    const dir = scratchDir();
    const outDir = join(dir, "resources");
    const json = { "200": { content: { "application/json": {} } } };
    const specPath = writeSpec(dir, {
      openapi: "3.1.0",
      paths: {
        "/invoices/{invoice}/face-submissions": {
          post: {
            operationId: "public-api.v1.invoices.face_submissions.submit",
            "x-speakeasy-group": "invoices.face_submissions",
            parameters: [{ name: "invoice", in: "path", required: true, schema: { type: "string" } }],
            responses: json,
          },
        },
        "/widgets/ship": {
          post: { operationId: "public-api.v1.widgets.ship", "x-speakeasy-group": "widgets", "x-no-retry": true, responses: json },
        },
        "/widgets/list-all": {
          post: { operationId: "public-api.v1.widgets.find", "x-speakeasy-group": "widgets", responses: json },
        },
      },
    });

    expect(run(specPath, outDir).status).toBe(0);
    expect(readFileSync(join(outDir, "invoices.ts"), "utf8")).toContain(
      '"POST", path, undefined, config, { noRetry: true }'
    );
    const widgets = readFileSync(join(outDir, "widgets.ts"), "utf8");
    expect(widgets).toContain('this._send<unknown>("POST", path, undefined, config, { noRetry: true });');
    expect(widgets).toContain('async find(config?: RequestConfig): Promise<unknown> {\n    const path = "/widgets/list-all";\n    return this._send<unknown>("POST", path, undefined, config);');
  });

  it("types request bodies with the generated types when they exist and falls back to unknown otherwise", () => {
    const dir = scratchDir();
    const outDir = join(dir, "resources");
    const typesPath = join(dir, "types.gen.ts");
    writeFileSync(
      typesPath,
      [
        "export type PublicApiV1WidgetsUpdateData = {",
        "    body?: UpdateWidgetRequest;",
        "    path: {",
        "        widget: string;",
        "    };",
        "    query?: never;",
        "    url: '/widgets/{widget}';",
        "};",
        "",
      ].join("\n"),
      "utf8"
    );
    const body = { content: { "application/json": {} } };
    const responses = { "200": { content: { "application/json": {} } } };
    const specPath = writeSpec(dir, {
      openapi: "3.1.0",
      paths: {
        "/widgets/{widget}": {
          put: {
            operationId: "public-api.v1.widgets.update",
            "x-speakeasy-group": "widgets",
            parameters: [{ name: "widget", in: "path", required: true, schema: { type: "string" } }],
            requestBody: body,
            responses,
          },
        },
        "/widgets": {
          post: { operationId: "public-api.v1.widgets.create", "x-speakeasy-group": "widgets", requestBody: body, responses },
        },
      },
    });

    expect(run(specPath, outDir, typesPath).status).toBe(0);
    const typed = readFileSync(join(outDir, "widgets.ts"), "utf8");
    expect(typed).toContain('body?: PublicApiV1WidgetsUpdateData["body"]');
    expect(typed).toContain('import type { PublicApiV1WidgetsUpdateData } from "../generated/types.gen.js";');
    expect(typed).toContain("async create(body?: unknown, config?: RequestConfig)");

    // Without --types a fixture run never reads the repo's real generated types.
    expect(run(specPath, outDir).status).toBe(0);
    expect(readFileSync(join(outDir, "widgets.ts"), "utf8")).not.toContain("types.gen");
  });

  it("emits a multipart wrapper that takes the whole FormData (file + kind)", () => {
    const dir = scratchDir();
    const outDir = join(dir, "resources");
    const specPath = writeSpec(dir, {
      openapi: "3.1.0",
      paths: {
        "/pdf-templates/assets": {
          post: {
            operationId: "public-api.v1.pdf_templates.asset_upload",
            "x-speakeasy-group": "pdf_templates",
            requestBody: {
              content: {
                "multipart/form-data": {
                  schema: {
                    type: "object",
                    properties: { kind: { type: "string" }, file: { type: "string", format: "binary" } },
                    required: ["kind", "file"],
                  },
                },
              },
            },
            responses: { "201": { content: { "application/json": {} } } },
          },
        },
      },
    });

    expect(run(specPath, outDir).status).toBe(0);
    const source = readFileSync(join(outDir, "pdf_templates.ts"), "utf8");
    expect(source).toContain("async assetUpload(formData: FormData, config?: RequestConfig): Promise<unknown> {");
    expect(source).toContain("return this._sendForm<unknown>(path, formData, config);");
  });
  it("treats image/* as bytes next to a JSON 200 and types the JSON side from the 200", () => {
    const dir = scratchDir();
    const outDir = join(dir, "resources");
    const typesPath = join(dir, "types.gen.ts");
    writeFileSync(typesPath, "export type PublicApiV1WidgetsAssetResponses = {\n    200: { id: string };\n};\n", "utf8");
    const specPath = writeSpec(dir, {
      openapi: "3.1.0",
      paths: {
        "/widgets/assets/{asset}": {
          get: {
            operationId: "public-api.v1.widgets.asset",
            "x-speakeasy-group": "widgets",
            parameters: [{ name: "asset", in: "path", required: true, schema: { type: "string" } }],
            responses: { "200": { content: { "application/json": {}, "image/png": {} } } },
          },
        },
        "/widgets/logos/{logo}": {
          get: {
            operationId: "public-api.v1.widgets.logo",
            "x-speakeasy-group": "widgets",
            parameters: [{ name: "logo", in: "path", required: true, schema: { type: "string" } }],
            responses: { "200": { content: { "image/png": {} } } },
          },
        },
      },
    });

    expect(run(specPath, outDir, typesPath).status).toBe(0);
    const source = readFileSync(join(outDir, "widgets.ts"), "utf8");
    expect(source).toContain("async asset(asset: string, config?: RequestConfig): Promise<BinaryOrJsonResponse<PublicApiV1WidgetsAssetResponses[200]>> {");
    expect(source).toContain("send `config.headers: { Accept: \"image/png\" }`");
    expect(source).toContain("async logo(logo: string, config?: RequestConfig): Promise<BinaryResponse> {");
  });

  it("returns the success body type of the generated types, and unknown when there is none", () => {
    const dir = scratchDir();
    const outDir = join(dir, "resources");
    const typesPath = join(dir, "types.gen.ts");
    writeFileSync(
      typesPath,
      [
        "export type PublicApiV1WidgetsCreateResponses = {\n    200: { data: string };\n    201: { data: number };\n    204: void;\n    422: { error: string };\n};",
        "export type PublicApiV1WidgetsRemoveResponses = {\n    204: void;\n};",
      ].join("\n\n"),
      "utf8"
    );
    const specPath = writeSpec(dir, {
      openapi: "3.1.0",
      paths: {
        "/widgets": {
          post: { operationId: "public-api.v1.widgets.create", "x-speakeasy-group": "widgets", requestBody: { content: { "application/json": {} } }, responses: { "201": { content: { "application/json": {} } } } },
          delete: { operationId: "public-api.v1.widgets.remove", "x-speakeasy-group": "widgets", responses: { "204": {} } },
        },
      },
    });

    expect(run(specPath, outDir, typesPath).status).toBe(0);
    const source = readFileSync(join(outDir, "widgets.ts"), "utf8");
    expect(source).toContain("Promise<PublicApiV1WidgetsCreateResponses[200 | 201]> {");
    expect(source).toContain('return this._send<PublicApiV1WidgetsCreateResponses[200 | 201]>("POST", path, body, config);');
    expect(source).toContain("async remove(config?: RequestConfig): Promise<unknown> {");
  });

  it("treats application/xml as bytes", () => {
    const dir = scratchDir();
    const outDir = join(dir, "resources");
    const specPath = writeSpec(dir, {
      openapi: "3.1.0",
      paths: {
        "/widgets/{widget}/xml": {
          get: {
            operationId: "public-api.v1.widgets.xml",
            "x-speakeasy-group": "widgets",
            parameters: [{ name: "widget", in: "path", required: true, schema: { type: "string" } }],
            responses: { "200": { content: { "application/xml": {} } } },
          },
        },
      },
    });

    expect(run(specPath, outDir).status).toBe(0);
    expect(readFileSync(join(outDir, "widgets.ts"), "utf8")).toContain("Promise<BinaryResponse>");
  });

  it("types the request body of a binary operation", () => {
    const dir = scratchDir();
    const outDir = join(dir, "resources");
    const typesPath = join(dir, "types.gen.ts");
    writeFileSync(typesPath, "export type PublicApiV1WidgetsBulkPdfData = {\n    body: { ids: string[] };\n};\n", "utf8");
    const specPath = writeSpec(dir, {
      openapi: "3.1.0",
      paths: {
        "/widgets/bulk-pdf": {
          post: {
            operationId: "public-api.v1.widgets.bulk_pdf",
            "x-speakeasy-group": "widgets",
            requestBody: { content: { "application/json": {} } },
            responses: { "200": { content: { "application/zip": {} } } },
          },
        },
      },
    });

    expect(run(specPath, outDir, typesPath).status).toBe(0);
    expect(readFileSync(join(outDir, "widgets.ts"), "utf8")).toContain(
      'async bulkPdf(body?: PublicApiV1WidgetsBulkPdfData["body"], config?: RequestConfig): Promise<BinaryResponse> {'
    );
  });
});

// The committed resources are the generator's output for the committed spec, and
// the document-template operations are there, on the company axis, under the
// names the contract promises. The
// expected values are written out here, not derived with the generator.
describe("committed resources", () => {
  const repoRoot = fileURLToPath(new URL("..", import.meta.url));
  const read = (file: string) => readFileSync(join(repoRoot, "src", "resources", file), "utf8");

  it("equal what the generator writes for spec/openapi.json (no hand edits)", () => {
    const outDir = join(scratchDir(), "resources");
    const result = run(join(repoRoot, "spec", "openapi.json"), outDir, join(repoRoot, "src", "generated", "types.gen.ts"));
    expect(result.status).toBe(0);
    for (const file of readdirSync(join(repoRoot, "src", "resources"))) {
      expect(readFileSync(join(outDir, file), "utf8"), file).toBe(read(file));
    }
    expect(readdirSync(outDir).sort()).toEqual(readdirSync(join(repoRoot, "src", "resources")).sort());
  });

  it.each([
    ["pdfTemplates.ts", "async publishRevision(company: string, template: string, body?: PublicApiV1PdfTemplatesPublishRevisionData[\"body\"]"],
    ["pdfTemplates.ts", "async assetUpload(company: string, formData: FormData"],
    ["pdfTemplates.ts", "Promise<BinaryOrJsonResponse<PublicApiV1PdfTemplatesAssetGetResponses[200]>>"],
    ["pdfCommercialIdentities.ts", "async publishRevision(company: string, identity: string"],
    ["pdfTemplatePreviews.ts", "async create(company: string, body?: PublicApiV1PdfTemplatePreviewsCreateData[\"body\"]"],
    ["pdfArtifacts.ts", "async download(company: string, artifact: string, config?: RequestConfig): Promise<BinaryOrJsonResponse"],
    ["invoices.ts", "async revisePresentation(company: string, invoice: string"],
    ["invoices.ts", "async listPresentations(company: string, invoice: string, params?: Record<string, unknown>"],
    ["invoices.ts", "async facturae(company: string, invoice: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<BinaryResponse>"],
    ["quotes.ts", "async getPresentation(company: string, quote: string"],
    ["proformas.ts", "async assignPresentation(company: string, proforma: string"],
    ["deliveryNotes.ts", "async revisePresentation(company: string, deliveryNote: string"],
    ["series.ts", "async assignPdfTemplate(company: string, series: string"],
    ["series.ts", "async getPdfTemplate(company: string, series: string"],
  ])("%s declares %s", (file, signature) => {
    expect(read(file)).toContain(signature);
  });

  it("Series.update is a PATCH on the company axis and the conditional operations point to config.ifMatch", () => {
    const series = read("series.ts");
    expect(series).toMatch(/async update\(company: string, series: string, body\?: PublicApiV1SeriesUpdateData\["body"\], config\?: RequestConfig\): Promise<[^\n]+> \{\n\s+const path = this\.buildPath\("\/companies\/\{company\}\/series\/\{series\}", \{ "company": company, "series": series \}\);\n\s+return this\._send<[^\n]+>\("PATCH"/);
    expect(read("invoices.ts")).toContain("Conditional: pass the `ETag` of the last read as `config.ifMatch`.");
    expect(read("pdfArtifacts.ts")).toContain("config.ifNoneMatch");
  });

  it("FACe submission and cancellation never retry", () => {
    expect(read("faceSubmissions.ts")).toMatch(/_send<[^\n]+>\("POST", path, body, config, \{ noRetry: true \}\)/);
    expect(read("invoices.ts")).toMatch(/_send<[^\n]+>\("POST", path, body, config, \{ noRetry: true \}\)/);
  });
});
