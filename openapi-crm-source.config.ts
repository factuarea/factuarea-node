import { defineConfig } from "@hey-api/openapi-ts";

/** Private native Source selection; public/versioned generator and release input remain separate. */
export default defineConfig({
  input: "./spec/crm-source139.json",
  output: { path: "./src/crm/source/generated", postProcess: [] },
  plugins: [{ name: "@hey-api/typescript", enums: false }],
});
