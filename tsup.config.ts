import { defineConfig } from "tsup";

/**
 * Two entry points, two targets.
 *
 * `src/index.ts` is the server client and stays on Node 20: it uses Node's own
 * crypto module and is meant to run on a server.
 *
 * `src/storefront/index.ts` is the browser SDK of the anonymous shopper lane.
 * It is bundled for the BROWSER and on purpose from a separate entry, so a web
 * bundle that imports `@factuarea/sdk/storefront` never pulls the server client
 * in — and never has to polyfill a Node builtin to do it (design.md D7).
 *
 * Neither config cleans `dist/`: tsup runs the configs of an array CONCURRENTLY
 * (`Promise.all` over them), so a `clean: true` on one of them would race the
 * other's output. The `build` script of package.json removes `dist/` once,
 * before tsup starts.
 */
export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: false,
    treeshake: true,
    splitting: false,
    target: "node20",
    outExtension({ format }) {
      return { js: format === "cjs" ? ".cjs" : ".js" };
    },
  },
  {
    entry: { storefront: "src/storefront/index.ts" },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: false,
    treeshake: true,
    splitting: false,
    platform: "browser",
    target: "es2020",
    outExtension({ format }) {
      return { js: format === "cjs" ? ".cjs" : ".js" };
    },
  },
]);
