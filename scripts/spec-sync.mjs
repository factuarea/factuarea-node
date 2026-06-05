#!/usr/bin/env node
/**
 * Spec sync helper for the receiver side of the cross-repo spec flow (design
 * D10). Compares the PUBLISHED spec against the committed `spec/openapi.json`
 * CANONICALLY — never byte-for-byte: the published spec is served minified
 * while the committed copy is pretty-printed, so a raw `diff` would always
 * report a (spurious) change.
 *
 * Canonical comparison = parse both JSON documents, recursively sort object
 * keys, then compare the resulting stable serialization. Two specs that differ
 * only in whitespace/key-order are treated as identical.
 *
 * Usage:
 *   node scripts/spec-sync.mjs check   <published.json>
 *     → prints `changed=true|false` (+ `bump=minor|patch`) for $GITHUB_OUTPUT;
 *       exit 0 always (the workflow decides what to do).
 *   node scripts/spec-sync.mjs apply   <published.json>
 *     → overwrites spec/openapi.json with a pretty-printed copy of the
 *       published spec (to be followed by `npm run generate`).
 *
 * The published spec is fetched by the workflow (curl) and passed as a file so
 * this script has no network dependency and is unit-testable.
 */
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const committedPath = join(root, "spec", "openapi.json");

const [, , command, publishedPathArg] = process.argv;

if (!command || !publishedPathArg) {
  console.error("usage: spec-sync.mjs <check|apply> <published-spec.json>");
  process.exit(2);
}

/** Recursively sort object keys so serialization is order-independent. */
function canonicalize(value) {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }
  if (value !== null && typeof value === "object") {
    const out = {};
    for (const key of Object.keys(value).sort()) {
      out[key] = canonicalize(value[key]);
    }
    return out;
  }
  return value;
}

function canonicalString(obj) {
  return JSON.stringify(canonicalize(obj));
}

/** All operationIds present in a spec, as a Set. Used to infer the SemVer bump. */
function operationIds(spec) {
  const ids = new Set();
  for (const methods of Object.values(spec.paths ?? {})) {
    for (const [method, op] of Object.entries(methods)) {
      if (!["get", "post", "put", "patch", "delete"].includes(method)) continue;
      if (op && typeof op === "object" && typeof op.operationId === "string") {
        ids.add(op.operationId);
      }
    }
  }
  return ids;
}

const publishedRaw = readFileSync(publishedPathArg, "utf8");
let published;
try {
  published = JSON.parse(publishedRaw);
} catch (e) {
  console.error(`spec-sync: published spec is not valid JSON: ${e.message}`);
  process.exit(2);
}

const committed = JSON.parse(readFileSync(committedPath, "utf8"));

const changed = canonicalString(published) !== canonicalString(committed);

function output(line) {
  console.log(line);
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, line + "\n");
  }
}

if (command === "check") {
  output(`changed=${changed}`);
  if (changed) {
    // New operationIds vs none-removed → minor; anything else (removed ops,
    // schema-only changes) → patch by default. A human still reviews the PR
    // and can promote the changeset to major for breaking changes.
    const before = operationIds(committed);
    const after = operationIds(published);
    const added = [...after].filter((id) => !before.has(id));
    const removed = [...before].filter((id) => !after.has(id));
    const bump = added.length > 0 && removed.length === 0 ? "minor" : "patch";
    output(`bump=${bump}`);
    output(`added_ops=${added.length}`);
    output(`removed_ops=${removed.length}`);
  }
  process.exit(0);
}

if (command === "apply") {
  // Persist pretty-printed so the committed copy stays diff-friendly while the
  // canonical comparison ignores the formatting difference vs the minified URL.
  writeFileSync(committedPath, JSON.stringify(published, null, 2) + "\n", "utf8");
  console.log(`spec-sync: wrote ${committedPath} from ${publishedPathArg}.`);
  process.exit(0);
}

console.error(`spec-sync: unknown command "${command}"`);
process.exit(2);
