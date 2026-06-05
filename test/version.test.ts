import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { DEFAULT_FACTUAREA_VERSION, SDK_VERSION } from "../src/index.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("version pinning (design D6)", () => {
  it("pins Factuarea-Version to the frozen spec date 2026-06-04", () => {
    // The first release ships the date of the spec frozen in P0.
    expect(DEFAULT_FACTUAREA_VERSION).toBe("2026-06-04");
  });

  it("keeps SDK_VERSION in lockstep with package.json", () => {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
    expect(SDK_VERSION).toBe(pkg.version);
  });
});
