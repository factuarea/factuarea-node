import { defineConfig } from "@hey-api/openapi-ts";

/**
 * Code generation config for the Factuarea TypeScript SDK.
 *
 * The generator emits ONLY into `src/generated/` (types for the 234 v1
 * operations). The hand-written runtime in `src/core/` and the ergonomic
 * wrappers in `src/resources/` compose those types — regenerating from a
 * newer spec NEVER touches hand-written code (design D5).
 *
 * Input is the local pinned copy of the spec (`spec/openapi.json`), frozen
 * at the private spec commit e822661bc.
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
