// Exercises `scripts/build-resources.mjs` end-to-end against fixture specs
// written to a scratch directory, via its `--spec <path>` / `--out <dir>`
// flags (design D4). Covers: the happy path, the hardened guard against
// operations missing `x-speakeasy-group` (which used to be dropped silently),
// and the spec-guided `Idempotency-Key` opt-in for non-POST mutations (D6).
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
});
