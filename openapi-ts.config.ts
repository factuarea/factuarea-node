import { defineConfig } from "@hey-api/openapi-ts";

/**
 * Code generation config for the Factuarea TypeScript SDK.
 *
 * The generator emits ONLY into `src/generated/` (types for the v1 operations:
 * 654 over 532 paths, measured 2026-09-18 on the pinned copy). The ergonomic
 * wrappers in `src/resources/` are ALSO generated, by `scripts/build-resources.mjs`
 * — `npm run generate` chains the two. The hand-written runtime in `src/core/`
 * is the ONLY layer neither generator touches (design D5/D6).
 *
 * Input is the local pinned copy of the spec (`spec/openapi.json`). It is
 * re-pinned from the contract exported by the private `factuarea` repo, never
 * downloaded from production while the surface it declares is not deployed
 * there yet: `node scripts/spec-sync.mjs apply <contract.json>` writes it in
 * this repo's convention. Pinned 2026-09-18 from the ERP omnichannel contract,
 * sha256 687f70a156a90cd41c453e87cb6627b3cb3ff85c21db0ff81b392c7b1945f49c.
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
