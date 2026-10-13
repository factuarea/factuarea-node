import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

const generator = fileURLToPath(new URL("../scripts/build-resources.mjs", import.meta.url));
const scratch: string[] = [];
const generatedHeader = "// AUTO-GENERATED resource wrapper. Do not edit by hand.\n";

function fixture() {
  const dir = mkdtempSync(join(tmpdir(), "factuarea-native-generation-"));
  scratch.push(dir);
  const out = join(dir, "resources");
  mkdirSync(out);
  const spec = join(dir, "fixture.json");
  writeFileSync(spec, JSON.stringify({
    openapi: "3.1.0",
    paths: {
      "/widgets": {
        get: {
          operationId: "public-api.v1.widgets.list",
          "x-speakeasy-group": "widgets",
          responses: { "200": { description: "Fixture only" } },
        },
      },
    },
  }));
  return { out, run: () => spawnSync(process.execPath, [generator, "--spec", spec, "--out", out], { encoding: "utf8" }) };
}

afterEach(() => {
  for (const dir of scratch.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("native resources survive canonical regeneration", () => {
  it("preserves the real handwritten Meta resource byte for byte while replacing generated files", () => {
    const { out, run } = fixture();
    const native = readFileSync(new URL("../src/resources/crmMetaNativeBatch80.ts", import.meta.url));
    writeFileSync(join(out, "crmMetaNativeBatch80.ts"), native);
    writeFileSync(join(out, "retired.ts"), generatedHeader + "export class RetiredResource {}\n");
    writeFileSync(join(out, "widgets.ts"), generatedHeader + "export class PreviousWidgetsResource {}\n");
    mkdirSync(join(out, "native-nested"));
    writeFileSync(join(out, "native-nested", "resource.ts"), "export const native = true;\n");

    const result = run();

    expect(result.status, result.stderr).toBe(0);
    expect(readFileSync(join(out, "crmMetaNativeBatch80.ts"))).toEqual(native);
    expect(existsSync(join(out, "retired.ts"))).toBe(false);
    expect(readFileSync(join(out, "widgets.ts"), "utf8")).toContain("export class WidgetsResource");
    expect(readFileSync(join(out, "index.ts"), "utf8")).toContain("widgets: new WidgetsResource(client)");
    expect(readFileSync(join(out, "native-nested", "resource.ts"), "utf8")).toBe("export const native = true;\n");
    const first = readFileSync(join(out, "widgets.ts"));
    expect(run().status).toBe(0);
    expect(readFileSync(join(out, "widgets.ts"))).toEqual(first);
    expect(readFileSync(join(out, "crmMetaNativeBatch80.ts"))).toEqual(native);
  });

  it.each(["widgets.ts", "index.ts"])("rejects a handwritten %s collision before removing any generated output", (target) => {
    const { out, run } = fixture();
    const manual = "export const handwritten = true;\n";
    const retired = generatedHeader + "export class RetiredResource {}\n";
    writeFileSync(join(out, target), manual);
    writeFileSync(join(out, "retired.ts"), retired);

    const result = run();

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("refusing to overwrite hand-written resource(s)");
    expect(result.stderr).toContain(join(out, target));
    expect(readFileSync(join(out, target), "utf8")).toBe(manual);
    expect(readFileSync(join(out, "retired.ts"), "utf8")).toBe(retired);
    expect(existsSync(join(out, target === "widgets.ts" ? "index.ts" : "widgets.ts"))).toBe(false);
  });

  it("rejects a target directory without removing its native contents", () => {
    const { out, run } = fixture();
    mkdirSync(join(out, "widgets.ts"));
    writeFileSync(join(out, "widgets.ts", "owner.ts"), "export const owner = true;\n");
    writeFileSync(join(out, "retired.ts"), generatedHeader);

    const result = run();

    expect(result.status).toBe(1);
    expect(readFileSync(join(out, "widgets.ts", "owner.ts"), "utf8")).toBe("export const owner = true;\n");
    expect(existsSync(join(out, "retired.ts"))).toBe(true);
    expect(existsSync(join(out, "index.ts"))).toBe(false);
  });
});
