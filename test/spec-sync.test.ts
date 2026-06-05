import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const script = join(root, "scripts", "spec-sync.mjs");

type Spec = {
  paths: Record<string, Record<string, { operationId?: string; responses?: unknown }>>;
  [key: string]: unknown;
};

function committedSpec(): Spec {
  return JSON.parse(readFileSync(join(root, "spec", "openapi.json"), "utf8")) as Spec;
}

/**
 * Runs `spec-sync.mjs check <file>` and parses the `key=value` output lines
 * into a record. The committed spec/openapi.json is the baseline it compares
 * against.
 */
function runCheck(published: unknown): Record<string, string> {
  const file = join(workDir, "published.json");
  writeFileSync(file, JSON.stringify(published));
  const out = execFileSync("node", [script, "check", file], { encoding: "utf8" });
  const result: Record<string, string> = {};
  for (const line of out.trim().split("\n")) {
    const [k, v] = line.split("=");
    if (k) result[k] = v ?? "";
  }
  return result;
}

let workDir: string;
beforeEach(() => {
  workDir = mkdtempSync(join(tmpdir(), "spec-sync-"));
});
afterEach(() => {
  rmSync(workDir, { recursive: true, force: true });
});

describe("spec-sync canonical comparison (design D10)", () => {
  it("treats a minified copy of the committed spec as unchanged", () => {
    // The published URL serves minified JSON; the committed copy is pretty.
    // A canonical (parsed, key-sorted) compare must ignore that difference.
    expect(runCheck(committedSpec()).changed).toBe("false");
  });

  it("ignores key ordering and whitespace", () => {
    // Rebuild every object with its keys reversed — same data, different order.
    const reorder = (v: unknown): unknown => {
      if (Array.isArray(v)) return v.map(reorder);
      if (v && typeof v === "object") {
        const out: Record<string, unknown> = {};
        for (const k of Object.keys(v as object).reverse()) {
          out[k] = reorder((v as Record<string, unknown>)[k]);
        }
        return out;
      }
      return v;
    };
    expect(runCheck(reorder(committedSpec())).changed).toBe("false");
  });

  it("detects an added operation and proposes a minor bump", () => {
    const spec = committedSpec();
    spec.paths["/__synthetic_new_resource"] = {
      get: { operationId: "synthetic.list", responses: { "200": { description: "ok" } } },
    };
    const res = runCheck(spec);
    expect(res.changed).toBe("true");
    expect(res.bump).toBe("minor");
    expect(res.added_ops).toBe("1");
    expect(res.removed_ops).toBe("0");
  });

  it("falls back to a patch bump when an operation is removed", () => {
    const spec = committedSpec();
    // Drop the first path entirely → at least one operation removed.
    const firstPath = Object.keys(spec.paths)[0];
    if (firstPath) {
      delete spec.paths[firstPath];
    }
    const res = runCheck(spec);
    expect(res.changed).toBe("true");
    expect(res.bump).toBe("patch");
    expect(Number(res.removed_ops)).toBeGreaterThan(0);
  });
});
