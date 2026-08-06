import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const script = join(root, "scripts", "spec-sync.mjs");
const workflow = join(root, ".github", "workflows", "spec-sync.yml");

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

  it("ignores x-codeSamples added by the docs site", () => {
    // The docs site decorates each operation with `x-codeSamples`; the SDK does
    // not carry them. A spec that differs ONLY in those snippets must compare
    // as unchanged, otherwise the daily sync would open noisy PRs every time
    // the docs are republished.
    const spec = committedSpec();
    let decorated = 0;
    for (const methods of Object.values(spec.paths)) {
      for (const op of Object.values(methods)) {
        if (op && typeof op === "object") {
          (op as Record<string, unknown>)["x-codeSamples"] = [
            { lang: "JavaScript", label: "SDK", source: "client.foo()" },
          ];
          decorated++;
        }
      }
    }
    expect(decorated).toBeGreaterThan(0); // guard: the fixture actually changed
    expect(runCheck(spec).changed).toBe("false");
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

  it("keeps a removed operation at minor, because 0.x reserves major for the API GA", () => {
    const spec = committedSpec();
    // Drop the first path entirely → at least one operation removed.
    const firstPath = Object.keys(spec.paths)[0];
    if (firstPath) {
      delete spec.paths[firstPath];
    }
    const res = runCheck(spec);
    expect(res.changed).toBe("true");
    expect(res.bump).toBe("minor");
    expect(Number(res.removed_ops)).toBeGreaterThan(0);
  });

  it("proposes a patch bump when no operation is added or removed", () => {
    const spec = committedSpec();
    const firstPath = Object.keys(spec.paths)[0]!;
    const firstOp = Object.values(spec.paths[firstPath]!)[0]!;
    (firstOp as Record<string, unknown>).description = "changed schema-side only";
    const res = runCheck(spec);
    expect(res.changed).toBe("true");
    expect(res.bump).toBe("patch");
    expect(res.added_ops).toBe("0");
    expect(res.removed_ops).toBe("0");
  });
});

const REQUIRED_TRIGGERS = ["repository_dispatch", "workflow_dispatch", "schedule"];
// `workflow_dispatch` is excluded on purpose: it only fires when a human
// remembers, so it is not coverage.
const UNATTENDED_TRIGGERS = ["repository_dispatch", "schedule"];
const PAUSE_NOTE = /^#\s*PAUSED\s+(\S+)\s+since\s+\d{4}-\d{2}-\d{2};\s*reactivate when:\s*\S/;
const PAUSE_TEMPLATE =
  "# PAUSED <trigger> since <YYYY-MM-DD>; reactivate when: <condition anyone reading this file can check>";

function activeTriggers(source: string): Set<string> {
  const found = new Set<string>();
  let inOnBlock = false;
  for (const line of source.split("\n")) {
    if (/^on:/.test(line)) {
      inOnBlock = true;
      continue;
    }
    if (!inOnBlock) continue;
    if (/^[^\s#]/.test(line)) break;
    const key = /^ {2}([a-z_]+):/.exec(line.replace(/#.*$/, ""));
    if (key) found.add(key[1]!);
  }
  return found;
}

function pausedTriggers(source: string): Set<string> {
  const paused = new Set<string>();
  for (const line of source.split("\n")) {
    const note = PAUSE_NOTE.exec(line.trim());
    if (note) paused.add(note[1]!);
  }
  return paused;
}

function workflowSource(): string {
  return readFileSync(workflow, "utf8");
}

describe("spec-sync trigger parsing", () => {
  const fixture = [
    "on:",
    "  repository_dispatch:",
    "    types: [spec-updated]",
    "  workflow_dispatch:",
    "  # PAUSED schedule since 2026-06-07; reactivate when: the published spec has at least as",
    "  # many paths as spec/openapi.json",
    "  # schedule:",
    '  #   - cron: "17 6 * * *"',
    "",
    "permissions:",
    "  contents: write",
    "  schedule: this-is-not-a-trigger",
  ].join("\n");

  it("does not count a commented-out trigger as active", () => {
    expect([...activeTriggers(fixture)].sort()).toEqual([
      "repository_dispatch",
      "workflow_dispatch",
    ]);
  });

  it("reads the pause note of a disabled trigger", () => {
    expect([...pausedTriggers(fixture)]).toEqual(["schedule"]);
  });

  it("rejects a pause note without a date or without a condition", () => {
    const vague = [
      "# PAUSED schedule since 2026-06-07; reactivate when:",
      "# PAUSED schedule; reactivate when: docs == prod",
      "# schedule paused for now, will re-enable later",
    ].join("\n");
    expect([...pausedTriggers(vague)]).toEqual([]);
  });
});

describe("spec-sync trigger coverage", () => {
  it("keeps at least one unattended trigger active", () => {
    const covering = UNATTENDED_TRIGGERS.filter((t) => activeTriggers(workflowSource()).has(t));
    expect(
      covering,
      `spec-sync.yml has no unattended trigger left (${UNATTENDED_TRIGGERS.join(" / ")} are all ` +
        `off). workflow_dispatch alone is not coverage: it fires only when someone remembers. ` +
        `That state is what left this SDK two months behind the published spec without a signal, ` +
        `so it has no opt-out — restore a trigger, or remove this test in a reviewed PR that says ` +
        `why the SDK is going uncovered.`,
    ).not.toHaveLength(0);
  });

  it("requires every disabled trigger to declare a checkable reactivation condition", () => {
    const source = workflowSource();
    const active = activeTriggers(source);
    const paused = pausedTriggers(source);
    const undeclared = REQUIRED_TRIGGERS.filter((t) => !active.has(t) && !paused.has(t));
    expect(
      undeclared,
      `Disabled with no declared pause: ${undeclared.join(", ")}. Add this line next to the ` +
        `disabled block:\n\n  ${PAUSE_TEMPLATE}\n\nThe condition has to be checkable by whoever ` +
        `reads the file, without knowing the context of whoever paused it.`,
    ).toEqual([]);
  });

  it("requires a restored trigger to drop its pause note", () => {
    const source = workflowSource();
    const active = activeTriggers(source);
    const stale = [...pausedTriggers(source)].filter((t) => active.has(t));
    expect(
      stale,
      `Active trigger still carrying a pause note: ${stale.join(", ")}. Reactivating replaces the ` +
        `note with the evidence that its condition was met, and the date it was met.`,
    ).toEqual([]);
  });
});
