#!/usr/bin/env node
/**
 * Keeps `SDK_VERSION` in `src/core/version.ts` in lockstep with the `version`
 * field in `package.json`. Changesets bumps `package.json`; this script
 * propagates that bump into the source constant used by the `User-Agent`.
 *
 * Run automatically by the `version` npm script (after `changeset version`)
 * and verified in CI with `--check` (fails if out of sync).
 *
 * NOTE: this only touches `SDK_VERSION`. `DEFAULT_FACTUAREA_VERSION` is the
 * pinned API date (design D6) and is changed deliberately by a human when the
 * SDK adopts a newer `Factuarea-Version`, never by this script.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const pkgPath = join(root, "package.json");
const versionFile = join(root, "src", "core", "version.ts");

const check = process.argv.includes("--check");

const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const version = pkg.version;

const source = readFileSync(versionFile, "utf8");
const re = /export const SDK_VERSION = "([^"]*)";/;
const match = source.match(re);

if (!match) {
  console.error("sync-version: could not find `export const SDK_VERSION = \"...\";` in src/core/version.ts");
  process.exit(1);
}

const current = match[1];

if (current === version) {
  if (check) {
    console.log(`sync-version: SDK_VERSION is in sync (${version}).`);
  }
  process.exit(0);
}

if (check) {
  console.error(
    `sync-version: SDK_VERSION ("${current}") is out of sync with package.json ("${version}").\n` +
      "Run `npm run version` (or `node scripts/sync-version.mjs`) and commit.",
  );
  process.exit(1);
}

const next = source.replace(re, `export const SDK_VERSION = "${version}";`);
writeFileSync(versionFile, next, "utf8");
console.log(`sync-version: SDK_VERSION ${current} -> ${version}.`);
