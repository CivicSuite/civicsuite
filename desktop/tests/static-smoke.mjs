import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const main = readFileSync(join(root, "src", "main.js"), "utf8");
const css = readFileSync(join(root, "src", "styles.css"), "utf8");
const tauriConfig = readFileSync(join(root, "src-tauri", "tauri.conf.json"), "utf8");
const desktopMsiWorkflow = readFileSync(join(root, "..", ".github", "workflows", "desktop-windows-msi.yml"), "utf8");
const installerNotice = readFileSync(join(root, "installer", "windows", "unsigned-beta-install-notice.txt"), "utf8");
const nsisHooks = readFileSync(join(root, "installer", "windows", "nsis-hooks.nsh"), "utf8");
const rustMain = readFileSync(join(root, "src-tauri", "src", "main.rs"), "utf8");
const runtimeManifest = JSON.parse(readFileSync(join(root, "runtime", "windows-local-runtime.json"), "utf8"));
const runtimePayloadManifest = JSON.parse(readFileSync(join(root, "runtime", "windows-runtime-payloads.json"), "utf8"));
const runtimeSourcesManifest = JSON.parse(readFileSync(join(root, "runtime", "windows-runtime-sources.json"), "utf8"));
const firstRunManifest = JSON.parse(readFileSync(join(root, "runtime", "windows-first-run.json"), "utf8"));
const modelManifest = JSON.parse(readFileSync(join(root, "runtime", "gemma4-model.json"), "utf8"));
const runtimePayloadScript = readFileSync(join(root, "scripts", "prepare-runtime-payload.ps1"), "utf8");

const requiredUiPhrases = [
  "Meetings & Notices",
  "Records Requests",
  "Code & Ordinances",
  "Search City Knowledge",
  "System Health",
  "Audit Trail",
  "module manager",
  "Windows SmartScreen explanation",
  "First admin user",
  "repair, backup, and uninstall",
  "Gemma 4 12B QAT Q4_0",
  "Checksum required",
  "No silent download",
  "Official Google weights"
];

for (const phrase of requiredUiPhrases) {
  if (!main.includes(phrase)) {
    throw new Error(`missing desktop UI phrase: ${phrase}`);
  }
}

for (const phrase of ["Docker", "WSL"]) {
  if (main.includes(`Start ${phrase}`) || main.includes(`Install ${phrase}`)) {
    throw new Error(`desktop shell should not direct clerks to start/install ${phrase}`);
  }
}

if (!tauriConfig.includes('"identifier": "org.civicsuite.desktop"')) {
  throw new Error("Tauri identifier is missing");
}

if (!tauriConfig.includes('"icon": ["icons/icon.ico"]')) {
  throw new Error("Tauri bundle must declare the Windows .ico icon");
}

if (!tauriConfig.includes('"targets": ["msi"]')) {
  throw new Error("Tauri bundle must default to the MSI target for the full Windows runtime payload");
}

if (!tauriConfig.includes('"licenseFile": "../installer/windows/unsigned-beta-install-notice.txt"')) {
  throw new Error("Tauri bundle must include the unsigned beta install notice");
}

if (!tauriConfig.includes('"installerHooks": "../installer/windows/nsis-hooks.nsh"')) {
  throw new Error("Tauri Windows installer must include the CivicSuite install hook");
}

if (!tauriConfig.includes('"resources": ["../runtime/payload/"]')) {
  throw new Error("Tauri bundle must include the Windows runtime payload resource folder");
}

for (const phrase of [
  "name: desktop-windows-msi",
  "runs-on: windows-latest",
  "path: civicsuite",
  "path: civiccore",
  "ref: 1a53f0680fffce34efeb939cbeb9915b6e208d6c",
  "path: civicrecords-ai",
  "ref: 538766523ad90ee7553b0ffa75b626d3d4850b17",
  "path: civicclerk",
  "ref: dae807ec9d1370dd22cf6aba88e4c6fc6b4168d5",
  "path: civiccode",
  "ref: a960bba0a2249d118b593dd61bee3a65a69a9d77",
  "npm run prepare-runtime-payload",
  "npm run tauri -- build",
  "desktop/src-tauri/target/release/bundle/msi/*.msi",
  "NoDockerPrerequisite=true",
  "NoWslPrerequisite=true"
]) {
  if (!desktopMsiWorkflow.includes(phrase)) {
    throw new Error(`desktop MSI workflow missing phrase: ${phrase}`);
  }
}

for (const phrase of [
  "not code-signed",
  "Microsoft Defender SmartScreen",
  "More info",
  "Run anyway",
  "No Docker requirement",
  "No WSL requirement",
  "No terminal requirement",
  "Windows uninstall entry",
  "repair, backup, restore, and uninstall"
]) {
  if (!installerNotice.includes(phrase)) {
    throw new Error(`installer notice missing phrase: ${phrase}`);
  }
}

for (const phrase of [
  "NSIS_HOOK_PREINSTALL",
  "unsigned beta software",
  "Microsoft Defender SmartScreen",
  "More info",
  "Run anyway",
  "does not require Docker, WSL, or a terminal"
]) {
  if (!nsisHooks.includes(phrase)) {
    throw new Error(`NSIS hook missing phrase: ${phrase}`);
  }
}

if (!rustMain.includes('include_str!("../../../installer/modules.json")')) {
  throw new Error("desktop shell must read the suite module registry at compile time");
}

if (!rustMain.includes('mod model;') || !rustMain.includes('get_model_state')) {
  throw new Error("desktop shell must expose model readiness state");
}

if (runtimeManifest.local_only !== true) {
  throw new Error("Windows runtime manifest must default to local-only");
}

if (runtimePayloadManifest.profile !== "windows-local-1.0" || runtimePayloadManifest.local_only !== true) {
  throw new Error("Windows runtime payload manifest must target the local-only Windows profile");
}

if (runtimeSourcesManifest.profile !== "windows-local-1.0") {
  throw new Error("Windows runtime sources manifest must target the Windows profile");
}

for (const sourceKey of ["postgres", "pgvector", "python", "ollama"]) {
  if (!runtimeSourcesManifest.sources[sourceKey]) {
    throw new Error(`Windows runtime sources manifest missing source: ${sourceKey}`);
  }
}

for (const phrase of [
  "Install-PostgresPayload",
  "Install-PythonPayload",
  "Install-OllamaPayload",
  "Install-PgvectorPayload",
  "MSVC cl.exe and nmake.exe are required",
  "runtime-payload-lock.json"
]) {
  if (!runtimePayloadScript.includes(phrase)) {
    throw new Error(`Windows runtime payload script missing phrase: ${phrase}`);
  }
}

for (const key of ["requires_docker", "requires_wsl", "requires_terminal"]) {
  if (runtimeManifest.operator_path[key] !== false) {
    throw new Error(`Windows runtime operator path cannot require ${key}`);
  }
  if (firstRunManifest.operator_path[key] !== false) {
    throw new Error(`Windows first-run operator path cannot require ${key}`);
  }
  if (modelManifest.operator_path[key] !== false) {
    throw new Error(`Windows model operator path cannot require ${key}`);
  }
}

for (const action of ["install", "start", "stop", "health", "repair", "logs", "backup", "restore", "uninstall"]) {
  if (!runtimeManifest.lifecycle_actions.includes(action)) {
    throw new Error(`Windows runtime manifest missing lifecycle action: ${action}`);
  }
}

for (const serviceId of ["postgres", "python-services", "task-queue", "model-runtime", "file-storage"]) {
  if (!runtimeManifest.services.some((service) => service.id === serviceId)) {
    throw new Error(`Windows runtime manifest missing service: ${serviceId}`);
  }
  if (!runtimePayloadManifest.payloads.some((payload) => payload.services.includes(serviceId))) {
    throw new Error(`Windows runtime payload manifest missing service payload: ${serviceId}`);
  }
}

for (const requiredPayload of [
  ["postgres-17-pgvector", "bin/pg_ctl.exe", "share/extension/vector.control"],
  [
    "cpython-services",
    "python.exe",
    "Lib/site-packages/civiccore",
    "Lib/site-packages/civiccore/migrations/alembic.ini",
    "Lib/site-packages/civiccore/migrations/versions/civiccore_0003_local_task_queue.py",
    "Lib/site-packages/app",
    "Lib/site-packages/civicclerk",
    "Lib/site-packages/civiccode",
    "Lib/site-packages/civicsuite_runtime",
    "Lib/site-packages/civicsuite_runtime/migrate.py",
    "Lib/site-packages/civicsuite_runtime/civicrecords_alembic/alembic.ini",
    "Lib/site-packages/civicsuite_runtime/civicrecords_alembic/alembic/env.py"
  ],
  ["ollama-runtime", "ollama.exe"]
]) {
  const [payloadId, ...requiredFiles] = requiredPayload;
  const payload = runtimePayloadManifest.payloads.find((candidate) => candidate.id === payloadId);
  if (!payload) {
    throw new Error(`Windows runtime payload manifest missing payload: ${payloadId}`);
  }
  for (const requiredFile of requiredFiles) {
    if (!payload.required_files.includes(requiredFile)) {
      throw new Error(`Windows runtime payload ${payloadId} missing required file: ${requiredFile}`);
    }
  }
}

for (const stepId of ["unsigned-beta", "smartscreen", "locations", "modules", "model", "city-profile", "first-admin", "backup", "health", "finish"]) {
  if (!firstRunManifest.steps.some((step) => step.id === stepId)) {
    throw new Error(`Windows first-run manifest missing step: ${stepId}`);
  }
}

for (const action of ["review", "choose-location", "select-modules", "download-model", "create-city-profile", "create-admin", "choose-backup", "verify-health", "open-app", "repair", "backup", "uninstall"]) {
  if (!firstRunManifest.actions.includes(action)) {
    throw new Error(`Windows first-run manifest missing action: ${action}`);
  }
}

if (modelManifest.local_only !== true) {
  throw new Error("Windows model manifest must default to local-only");
}

if (modelManifest.model.id !== "gemma-4-12b-it-qat-q4_0") {
  throw new Error("Windows model manifest must pin Gemma 4 12B QAT Q4_0");
}

if (modelManifest.model.format !== "GGUF" || !modelManifest.model.quantization.includes("QAT")) {
  throw new Error("Windows model manifest must pin QAT GGUF weights");
}

if (modelManifest.model.artifact.file_name !== "gemma-4-12b-it-qat-q4_0.gguf") {
  throw new Error("Windows model manifest must pin the expected GGUF file");
}

if (modelManifest.model.runtime_model !== "civicsuite-gemma4-12b-qat:q4_0") {
  throw new Error("Windows model manifest must define the local Ollama runtime model name");
}

if (!modelManifest.model.artifact.checksum_required || !/^[a-f0-9]{64}$/i.test(modelManifest.model.artifact.sha256)) {
  throw new Error("Windows model manifest must require a SHA-256 checksum");
}

if (modelManifest.download.automatic || !modelManifest.download.resumable || !modelManifest.download.requires_user_consent) {
  throw new Error("Windows model download must be explicit, resumable, and consent-gated");
}

for (const checkId of ["metadata", "artifact-file", "checksum", "runtime", "runtime-model", "registered-model"]) {
  if (!modelManifest.readiness_checks.some((check) => check.id === checkId && check.required)) {
    throw new Error(`Windows model manifest missing readiness check: ${checkId}`);
  }
}

if (css.includes("blur(") || css.includes("radial-gradient")) {
  throw new Error("desktop shell should avoid blurred/orb-like decorative styling");
}

console.log("PASS: desktop static smoke checks passed");
