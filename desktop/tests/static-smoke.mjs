import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const main = readFileSync(join(root, "src", "main.js"), "utf8");
const css = readFileSync(join(root, "src", "styles.css"), "utf8");
const tauriConfig = readFileSync(join(root, "src-tauri", "tauri.conf.json"), "utf8");
const installerNotice = readFileSync(join(root, "installer", "windows", "unsigned-beta-install-notice.txt"), "utf8");
const nsisHooks = readFileSync(join(root, "installer", "windows", "nsis-hooks.nsh"), "utf8");
const rustMain = readFileSync(join(root, "src-tauri", "src", "main.rs"), "utf8");
const runtimeManifest = JSON.parse(readFileSync(join(root, "runtime", "windows-local-runtime.json"), "utf8"));
const firstRunManifest = JSON.parse(readFileSync(join(root, "runtime", "windows-first-run.json"), "utf8"));
const modelManifest = JSON.parse(readFileSync(join(root, "runtime", "gemma4-model.json"), "utf8"));

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

if (!tauriConfig.includes('"licenseFile": "../installer/windows/unsigned-beta-install-notice.txt"')) {
  throw new Error("Tauri NSIS installer must include the unsigned beta install notice");
}

if (!tauriConfig.includes('"installerHooks": "../installer/windows/nsis-hooks.nsh"')) {
  throw new Error("Tauri NSIS installer must include the CivicSuite install hook");
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

if (!modelManifest.model.artifact.checksum_required || !/^[a-f0-9]{64}$/i.test(modelManifest.model.artifact.sha256)) {
  throw new Error("Windows model manifest must require a SHA-256 checksum");
}

if (modelManifest.download.automatic || !modelManifest.download.resumable || !modelManifest.download.requires_user_consent) {
  throw new Error("Windows model download must be explicit, resumable, and consent-gated");
}

for (const checkId of ["metadata", "artifact-file", "checksum", "runtime", "registered-model"]) {
  if (!modelManifest.readiness_checks.some((check) => check.id === checkId && check.required)) {
    throw new Error(`Windows model manifest missing readiness check: ${checkId}`);
  }
}

if (css.includes("blur(") || css.includes("radial-gradient")) {
  throw new Error("desktop shell should avoid blurred/orb-like decorative styling");
}

console.log("PASS: desktop static smoke checks passed");
