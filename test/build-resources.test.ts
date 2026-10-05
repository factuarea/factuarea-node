// Exercises `scripts/build-resources.mjs` end-to-end against fixture specs
// written to a scratch directory, via its `--spec <path>` / `--out <dir>`
// flags (design D4). Covers: the happy path, the hardened guard against
// operations missing `x-speakeasy-group` (which used to be dropped silently),
// the spec-guided `Idempotency-Key` opt-in for non-POST mutations (D6), and the
// `(…, config?)` overload of operations that later gained their first query.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
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

function run(specPath: string, outDir: string): RunResult {
  try {
    const stdout = execFileSync(process.execPath, [scriptPath, "--spec", specPath, "--out", outDir], {
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
});
