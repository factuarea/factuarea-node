/** Exact actual Native149 selection; no public release inputs are changed. */
export default {
  input: "./src/NativeCrm134/native149.json",
  output: { path: "./src/NativeCrm134/generated", postProcess: [] },
  plugins: [{ name: "@hey-api/typescript", enums: false }],
};
