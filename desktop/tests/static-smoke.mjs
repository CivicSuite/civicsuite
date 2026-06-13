import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const main = readFileSync(join(root, "src", "main.js"), "utf8");
const css = readFileSync(join(root, "src", "styles.css"), "utf8");
const tauriConfig = readFileSync(join(root, "src-tauri", "tauri.conf.json"), "utf8");
const rustMain = readFileSync(join(root, "src-tauri", "src", "main.rs"), "utf8");
const runtimeManifest = JSON.parse(readFileSync(join(root, "runtime", "windows-local-runtime.json"), "utf8"));
const firstRunManifest = JSON.parse(readFileSync(join(root, "runtime", "windows-first-run.json"), "utf8"));

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
  "repair, backup, and uninstall"
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

if (!rustMain.includes('include_str!("../../../installer/modules.json")')) {
  throw new Error("desktop shell must read the suite module registry at compile time");
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

if (css.includes("blur(") || css.includes("radial-gradient")) {
  throw new Error("desktop shell should avoid blurred/orb-like decorative styling");
}

console.log("PASS: desktop static smoke checks passed");
