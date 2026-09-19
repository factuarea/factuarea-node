import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

/**
 * Resolves the TRANSITIVE import graph of a TypeScript entry point.
 *
 * Task 6.21 asks for the browser-safety check to run "over the resolved import
 * tree and not by text search": grepping `src/storefront/*.ts` for `node:` only
 * sees the files you remembered to grep. A module that pulls a Node builtin one
 * hop away — `src/storefront/x.ts` → `src/core/http-client.ts` → `node:crypto`
 * — is invisible to a grep of the folder and fatal to a browser bundle. So this
 * helper follows every relative specifier to the real file on disk and returns
 * the closure plus every bare (non-relative) specifier reached anywhere in it.
 *
 * Comments are stripped before scanning so a docblock that merely NAMES a
 * module cannot fake a hit (the `//` strip keeps `https://` intact).
 */

const FROM_SPECIFIER = /\bfrom\s*["']([^"']+)["']/g;
const BARE_IMPORT = /\bimport\s*["']([^"']+)["']/g;
const DYNAMIC_IMPORT = /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;
const REQUIRE_CALL = /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g;

export interface ImportGraph {
  /** Absolute paths of every file reachable from the entry, entry included. */
  files: string[];
  /** Every non-relative specifier reached, with the files that ask for it. */
  external: Map<string, string[]>;
}

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

function specifiersOf(source: string): string[] {
  const code = stripComments(source);
  const out: string[] = [];
  for (const pattern of [FROM_SPECIFIER, BARE_IMPORT, DYNAMIC_IMPORT, REQUIRE_CALL]) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null = pattern.exec(code);
    while (match !== null) {
      const specifier = match[1];
      if (specifier !== undefined) {
        out.push(specifier);
      }
      match = pattern.exec(code);
    }
  }
  return out;
}

/** Maps an ESM specifier (`./x.js`) back to the TypeScript file on disk. */
function resolveRelative(fromFile: string, specifier: string): string | null {
  const base = resolve(dirname(fromFile), specifier);
  const candidates = [
    base.replace(/\.js$/, ".ts"),
    base.replace(/\.js$/, ".tsx"),
    base,
    `${base}.ts`,
    join(base, "index.ts"),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate) && !candidate.endsWith("/")) {
      return candidate;
    }
  }
  return null;
}

export function importGraph(entry: string): ImportGraph {
  const seen = new Set<string>();
  const external = new Map<string, string[]>();
  const queue = [resolve(entry)];

  while (queue.length > 0) {
    const file = queue.pop()!;
    if (seen.has(file)) {
      continue;
    }
    seen.add(file);
    const source = readFileSync(file, "utf8");
    for (const specifier of specifiersOf(source)) {
      if (specifier.startsWith(".")) {
        const resolved = resolveRelative(file, specifier);
        if (resolved === null) {
          throw new Error(`No se pudo resolver \`${specifier}\` desde ${file}.`);
        }
        queue.push(resolved);
      } else {
        external.set(specifier, [...(external.get(specifier) ?? []), file]);
      }
    }
  }

  return { files: [...seen].sort(), external };
}
