import { defineConfig } from "@hey-api/openapi-ts";

/**
 * Code generation config for the Factuarea TypeScript SDK.
 *
 * The generator emits ONLY into `src/generated/` (types for the 234 v1
 * operations). The hand-written runtime in `src/core/` and the ergonomic
 * wrappers in `src/resources/` compose those types — regenerating from a
 * newer spec NEVER touches hand-written code (design D5).
 *
 * Input is the local pinned copy of the spec (`spec/openapi.json`), copied
 * byte for byte from the private repo's export. Its provenance (SHA256) is
 * recorded in docs/SPEC_SYNC.md, "Pinned spec".
 */
export default defineConfig({
  input: "./spec/openapi.json",
  output: {
    path: "./src/generated",
    postProcess: [],
  },
  plugins: [
    {
      name: "@hey-api/typescript",
      enums: false,
    },
  ],
});
