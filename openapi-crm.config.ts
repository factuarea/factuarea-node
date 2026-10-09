import { defineConfig } from "@hey-api/openapi-ts";

process.umask(0o022);

/** CRM Source contract only; runtime availability remains with the native API. */
export default defineConfig({
  input: "./spec/crm-native.json",
  output: { path: "./src/crm/generated", postProcess: [] },
  plugins: [{ name: "@hey-api/typescript", enums: false }],
});
