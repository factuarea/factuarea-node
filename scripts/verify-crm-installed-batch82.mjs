import { cp, mkdir, mkdtemp, readFile, writeFile, symlink, chmod } from "node:fs/promises";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const evidenceRoot = resolve(repo, "../runtime-evidence/resume-20261010");
await mkdir(evidenceRoot, { recursive: true, mode: 0o700 });
const run = await mkdtemp(join(evidenceRoot, "node-installed-batch82-"));
await chmod(run, 0o700);
const staging = join(run, "package-source"), packs = join(run, "packs"), consumer = join(run, "consumer");
for (const dir of [staging, packs, consumer]) await mkdir(dir, { mode: 0o700 });
const frozenPath = join(evidenceRoot, "node-native-commercial.json");
const frozen = JSON.parse(await readFile(frozenPath, "utf8"));
const replacementPath = join(evidenceRoot, "node-installed-batch82-approved-replacements.json");
let approvedReplacements = [];
try { approvedReplacements = JSON.parse(await readFile(replacementPath, "utf8")).replacements; } catch (error) { if (error.code !== "ENOENT") throw error; }
const digest = bytes => createHash("sha256").update(bytes).digest("hex");
async function assertFrozen() {
  for (const pin of frozen.owned_pins) {
    const replacement = approvedReplacements.find(row => row.path === pin.path);
    if (replacement && replacement.before !== pin.sha256) throw new Error(`Approved replacement baseline mismatch: ${pin.path}`);
    if (digest(await readFile(pin.path)) !== (replacement?.after ?? pin.sha256)) throw new Error(`Frozen source drift: ${pin.path}`);
  }
}
await assertFrozen();
const proof = { schema: "factuarea.private.node-installed-batch82.v1", run, repository: repo, frozenHandoff: { path: frozenPath, sha256: digest(await readFile(frozenPath)), ownedPins: frozen.owned_pins.length }, approvedReplacements, commands: [], constraints: { published: false, backendRuntime: false, nativeIssuerExecuted: false, sql: false, finalOpenApiGeneration: false, liveGrant: false, fullInventoryQualification: false } };
const reportPath = join(run, "installed-evidence.json");
async function persist() { await writeFile(reportPath, `${JSON.stringify(proof, null, 2)}\n`, { mode: 0o600 }); }
function command(program, args, cwd) {
  const result = spawnSync(program, args, { cwd, encoding: "utf8", maxBuffer: 32 * 1024 * 1024, timeout: 180_000, env: { ...process.env, npm_config_cache: join(run, "npm-cache"), npm_config_offline: "true", npm_config_audit: "false", npm_config_fund: "false", npm_config_update_notifier: "false" } });
  const record = { program, args, cwd, status: result.status, stdout: result.stdout, stderr: result.stderr, error: result.error?.message };
  proof.commands.push(record);
  if (result.status !== 0) throw new Error(`Directed installed check failed: ${program} ${args.join(" ")}. See ${reportPath}`);
  return record;
}
try {
  for (const name of ["src", "spec", "package.json", "package-lock.json", "README.md", "LICENSE", "tsconfig.json", "tsup.config.ts"]) await cp(join(repo, name), join(staging, name), { recursive: true });
  await symlink(join(repo, "node_modules"), join(staging, "node_modules"), "dir");
  command("npm", ["run", "build", "--", "--silent"], staging);
  const packed = JSON.parse(command("npm", ["pack", "--ignore-scripts", "--json", "--pack-destination", packs], staging).stdout)[0];
  const tarball = join(packs, packed.filename);
  await chmod(tarball, 0o600);
  proof.tarball = { path: tarball, sha256: digest(await readFile(tarball)), name: packed.name, version: packed.version, files: packed.files.map(file => file.path), integrity: packed.integrity };
  await writeFile(join(consumer, "package.json"), `${JSON.stringify({ name: "factuarea-crm-installed-batch82-consumer", private: true, type: "module", dependencies: { "@factuarea/sdk": `file:${tarball}` } }, null, 2)}\n`, { mode: 0o600 });
  command("npm", ["install", "--offline", "--ignore-scripts", "--no-audit", "--no-fund", "--package-lock=false"], consumer);
  const installed = join(consumer, "node_modules/@factuarea/sdk");
  proof.installedPackage = JSON.parse(await readFile(join(installed, "package.json"), "utf8"));
  proof.installedArtifacts = [];
  for (const name of ["dist/index.js", "dist/index.cjs", "dist/index.d.ts", "dist/index.d.cts", "spec/openapi.json"]) proof.installedArtifacts.push({ path: join(installed, name), sha256: digest(await readFile(join(installed, name))) });
  // Examples are application source, excluded from package.files. Keep that limitation explicit.
  const examples = join(consumer, "examples"); await mkdir(examples, { mode: 0o700 });
  proof.applicationExamples = [];
  for (const name of ["crm-website-server.ts", "crm-commercial-journey.ts"]) {
    const original = await readFile(join(repo, "examples", name), "utf8");
    const adapted = original.replaceAll('"../src/index.js"', '"@factuarea/sdk"');
    await writeFile(join(examples, name), adapted, { mode: 0o600 });
    proof.applicationExamples.push({ source: join(repo, "examples", name), sourceSha256: digest(original), consumer: join(examples, name), consumerSha256: digest(adapted), adaptation: "Public ../src/index.js imports changed to the actual installed @factuarea/sdk; no behavior/body changes." });
  }
  for (const example of proof.applicationExamples) if ((await readFile(example.consumer, "utf8")).includes("../src/")) throw new Error("A frozen example still requires an internal SDK subpath; correct the public producer under an explicit Source lease.");
  await cp(join(repo, "tests/crmInstalledBatch82/consumer-types.ts"), join(consumer, "consumer-types.ts"));
  await cp(join(repo, "tests/crmInstalledBatch82/consumer-types.cts"), join(consumer, "consumer-types.cts"));
  const tsc = join(repo, "node_modules/.bin/tsc");
  command(tsc, ["--strict", "--skipLibCheck", "--target", "ES2022", "--module", "NodeNext", "--moduleResolution", "NodeNext", "--lib", "ES2022,DOM", "--typeRoots", join(repo, "node_modules/@types"), "--types", "node", "--outDir", "compiled", "examples/crm-website-server.ts", "examples/crm-commercial-journey.ts", "consumer-types.ts", "consumer-types.cts"], consumer);
  await cp(join(repo, "tests/crmInstalledBatch82/contract.mjs"), join(consumer, "contract.mjs"));
  const test = command(process.execPath, ["--test", "--test-reporter=tap", "contract.mjs"], consumer);
  proof.runtime = { status: test.status, reporter: "node:test TAP", output: test.stdout, network: "127.0.0.1 random port only; real installed HTTP transport; no provider/backend" };
  proof.capabilities = {
    packageFormats: ["ESM", "CJS"], declarations: ["index.d.ts", "index.d.cts"],
    installedNativeCommercial: { methods: ["prepareLeadCreate", "createLead", "prepareOpportunityCreate", "createOpportunity", "prepareOpportunityStage", "moveOpportunityStage", "prepareActivityCreate", "createActivity", "getLead", "getOpportunity", "getActivity", "listLeads", "iterateLeads"], direction: "SDK→native HTTP JSON and native response→typed consumer", fields: "Exact first wire/key; UUIDv7/user UUID; decimal strings; omitted/null; CAS; cursor; native confirmed identity/privacy null.", fixtureTested: true },
    installedOriginals: { direction: "Read-only GET with raw key and exact first-body SHA", fixtureTested: true },
    sourceOnlyOtherFamilies: { families: ["WhatsApp", "CustomerService", "ServiceLevel", "Documents", "Meta"], condition: "Public installed imports are qualified; final operation inventory, live scopes/grants and external provider runtime are not asserted." },
    websiteJourney: { includedInTarball: false, recipe: "Copy frozen application examples privately; bind imports solely to the installed public SDK; atomic application reservation port supplied by consumer.", fixtureTested: true },
    limitations: ["Final booted canonical OpenAPI and operationIds remain Root-owned; bundled older spec is packed unchanged.", "Application examples are not included in the published-package file inventory; the public-import consumer recipe is explicit.", "No production atomic persistence, browser bundle build or provider live grant is asserted.", "No full generated API inventory or capability matrix ratification is inferred from local install."]
  };
  await assertFrozen(); proof.frozenPinsVerifiedAfter = frozen.owned_pins.length;
  proof.runtimeVersions = { node: process.version, npm: command("npm", ["--version"], consumer).stdout.trim(), typescript: command(tsc, ["--version"], consumer).stdout.trim() };
  proof.recipe = { command: "node scripts/verify-crm-installed-batch82.mjs", privateConsumer: consumer, install: "npm install --offline --ignore-scripts --no-audit --no-fund --package-lock=false (local tarball dependency)", publication: false };
  proof.result = "installed-directed-delta-green";
} catch (error) {
  proof.result = "failed"; proof.failure = error.message;
  await persist(); process.stderr.write(`${proof.failure}\n`); process.exitCode = 1;
}
await persist();
const final = await readFile(reportPath);
process.stdout.write(`${JSON.stringify({ evidence: reportPath, sha256: digest(final), result: proof.result, run })}\n`);
