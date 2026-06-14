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
const moduleRegistryRust = readFileSync(join(root, "src-tauri", "src", "module_registry.rs"), "utf8");
const workflowRust = readFileSync(join(root, "src-tauri", "src", "workflows.rs"), "utf8");
const modelRust = readFileSync(join(root, "src-tauri", "src", "model.rs"), "utf8");
const supervisorRust = readFileSync(join(root, "src-tauri", "src", "supervisor.rs"), "utf8");
const firstRunRust = readFileSync(join(root, "src-tauri", "src", "first_run.rs"), "utf8");
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
  "Download progress",
  "Official Google weights",
  "Download / Resume Model",
  "Notice meeting type",
  "Statutory notice basis",
  "Notice deadline",
  "Notice time zone",
  "Clerk has reviewed and approved the notice checklist",
  "Actual posting date",
  "Approve Notice Checklist",
  "Notice posting location",
  "Posting confirmation",
  "Generate Local AI Minutes",
  "Generate Local AI Draft",
  "Generate Local AI Guidance",
  "Deadline basis",
  "Set Deadline",
  "Fee line description",
  "Fee schedule or policy basis",
  "Fee line amount",
  "Fee waiver reason",
  "Add Fee Line",
  "Waive Fee",
  "Fee lines:",
  "Fee waiver:",
  "Notification Outbox",
  "Local notification log",
  "Log Notification Sent",
  "Request Timeline",
  "Request Messages",
  "Message to requester",
  "Add Request Message",
  "Message to records staff",
  "Send Request Message",
  "Search Sessions",
  "Records search query",
  "Searched locations",
  "Search result title",
  "Search result citation",
  "Search result summary",
  "Search result status",
  "Search reviewer",
  "Save Search Session",
  "Request Documents",
  "Document title",
  "Source file path",
  "Document citation",
  "Attach Document",
  "Exemption source",
  "Exemption category",
  "Staff finding",
  "Decision basis",
  "Exemption reviewer",
  "Save Exemption Decision",
  "Exemption Decisions",
  "Set Up Services and Model",
  "Package Profiles",
  "Module Catalog",
  "Choose Product Modules",
  "Custom selection will install CivicCore plus",
  "Not ready for Windows Local 1.0",
  "Apply Module Selection",
  "Save Local Folders",
  "City data folder",
  "Backup folder",
  "The Windows installer owns the app folder.",
  "Enabled modules:",
  "Data remains installed. Re-enable this module to show its work area.",
  "Backup includes:",
  "code workflow history",
  "Module actions are handled by the Windows desktop app",
  "Source history:",
  "Sign in as local administrator to change local model setup.",
  "Sign in with the local administrator passcode before continuing setup.",
  "before changing city work, setup, model setup, settings, backups, restore, repair, or runtime services"
];

for (const phrase of requiredUiPhrases) {
  if (!main.includes(phrase)) {
    throw new Error(`missing desktop UI phrase: ${phrase}`);
  }
}

for (const phrase of [
  "function publicMeetingView",
  "function publicRecordsRequestView",
  "function publicCodeSourceView",
  "function codeQuestionSearchFields",
  "function codeSourceSearchFields",
  "if (!publicOnly) fields.push(source.staff_guidance);",
  "? [entry.label, entry.source, entry.status, entry.authoritative_url]"
]) {
  if (!main.includes(phrase)) {
    throw new Error(`desktop public/staff boundary guard missing phrase: ${phrase}`);
  }
}

for (const phrase of ["Docker", "WSL"]) {
  if (main.includes(`Start ${phrase}`) || main.includes(`Install ${phrase}`)) {
    throw new Error(`desktop shell should not direct clerks to start/install ${phrase}`);
  }
}

for (const [label, character] of [
  ["mojibake capital A with circumflex", String.fromCharCode(0x00c2)],
  ["middle dot separator", String.fromCharCode(0x00b7)]
]) {
  if (main.includes(character)) {
    throw new Error(`desktop shell contains non-ASCII or mojibake separator: ${label}`);
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
  '"wix": {',
  '"upgradeCode": "a63fc1d3-5437-5f55-89a2-fef93fb1f930"',
  '"language": "en-US"',
  '"enableElevatedUpdateTask": false'
]) {
  if (!tauriConfig.includes(phrase)) {
    throw new Error(`Tauri MSI WiX config missing phrase: ${phrase}`);
  }
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
  "UpgradeCode=a63fc1d3-5437-5f55-89a2-fef93fb1f930",
  "UnsignedBetaNotice=desktop/installer/windows/unsigned-beta-install-notice.txt",
  "SmartScreenNoticeIncluded=true",
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

if (!rustMain.includes("before changing local model setup")) {
  throw new Error("desktop shell must require local admin access before model setup mutations");
}

if (!rustMain.includes("fn module_action") || !main.includes('invoke("module_action"')) {
  throw new Error("desktop shell must expose and call module enable/disable actions");
}

if (!rustMain.includes("before changing CivicSuite setup, profile, model, backup, or runtime settings")) {
  throw new Error("desktop shell must require local admin access before first-run setup/profile/model/runtime mutations");
}

for (const phrase of [
  'model::model_action("resume-download")',
  'model::model_action("load-runtime-model")'
]) {
  if (!firstRunRust.includes(phrase)) {
    throw new Error(`Windows first-run setup must call the real model action: ${phrase}`);
  }
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

if (!runtimeSourcesManifest.sources.postgres.download_url?.includes("postgresql-17.10-2-windows-x64-binaries.zip")) {
  throw new Error("Windows runtime sources manifest must pin a direct PostgreSQL 17 Windows binary ZIP URL");
}

for (const phrase of [
  "Install-PostgresPayload",
  "Install-PythonPayload",
  "Install-OllamaPayload",
  "Install-PgvectorPayload",
  "Get-PostgresSourceUrl",
  "MSVC cl.exe and nmake.exe are required",
  "System.Security.Cryptography.SHA256",
  "PayloadManifestPath",
  "New-RuntimePayloadLock",
  "required_files",
  "size_bytes",
  "runtime-payload-lock.json"
]) {
  if (!runtimePayloadScript.includes(phrase)) {
    throw new Error(`Windows runtime payload script missing phrase: ${phrase}`);
  }
}

if (runtimePayloadScript.includes("Get-FileHash")) {
  throw new Error("Windows runtime payload hashing must not depend on Get-FileHash availability");
}

for (const phrase of [
  "runtime-payload-lock.json",
  "Runtime payload file failed integrity check",
  "source payload integrity check failed",
  "copied payload integrity check failed"
]) {
  if (!supervisorRust.includes(phrase)) {
    throw new Error(`Windows supervisor missing payload integrity phrase: ${phrase}`);
  }
}

for (const phrase of [
  "ModelDownloadState",
  "model-download-status.json",
  "Partial download",
  "Download failed"
]) {
  if (!readFileSync(join(root, "src-tauri", "src", "model.rs"), "utf8").includes(phrase)) {
    throw new Error(`Windows model setup missing durable download state phrase: ${phrase}`);
  }
}

for (const phrase of [
  "CivicSuite cannot finish setup until these required steps are complete",
  "CivicSuite setup is complete on this Windows profile.",
  "System Health keeps backup, repair, logs, restore, and uninstall available.",
  "Start city work from Meetings & Notices, Records Requests, Code & Ordinances, or Search City Knowledge."
]) {
  if (!firstRunRust.includes(phrase)) {
    throw new Error(`Windows first-run finish contract missing phrase: ${phrase}`);
  }
}

for (const phrase of [
  "city_work_action_module_requirement",
  "Install or enable {} in Settings before using this workflow.",
  "Local search completed across enabled modules with {} result(s)."
]) {
  if (!rustMain.includes(phrase)) {
    throw new Error(`desktop command boundary missing disabled-module guard phrase: ${phrase}`);
  }
}

for (const phrase of [
  "install-module",
  "remove-module",
  "update-module",
  "open-module-exports",
  "backup_restore_hooks",
  "Module exports opened",
  "Existing module data was not deleted"
]) {
  if (!rustMain.includes(phrase) && !moduleRegistryRust.includes(phrase)) {
    throw new Error(`desktop command boundary missing module lifecycle phrase: ${phrase}`);
  }
}

for (const phrase of [
  "renderGuidedModuleReview",
  "Review Before Removing",
  "Creates a verified local profile backup",
  "Writes a backup manifest before updating the local module-selection record",
  "Existing module data is not deleted.",
  "data-module-review-confirm",
  "Open Exports",
  "open local module exports"
]) {
  if (!main.includes(phrase)) {
    throw new Error(`desktop module manager missing guided review phrase: ${phrase}`);
  }
}

for (const phrase of [
  "Notice Checklist",
  "complete-notice-checklist",
  "noticeStatutoryBasis",
  "noticeTimeZone",
  "Notice Posting Evidence",
  "postingLocation",
  "postingConfirmation",
  "postingDate",
  "suggest-minutes-draft",
  "suggest-records-response",
  "suggest-code-guidance",
  "set-records-deadline",
  "deadlineBasis",
  "Generated local AI minutes draft",
  "Generated local AI records response draft",
  "Generated local AI code guidance draft"
]) {
  if (!workflowRust.includes(phrase)) {
    throw new Error(`desktop workflow missing local AI action phrase: ${phrase}`);
  }
}

for (const phrase of [
  "generate_local_text",
  "/api/generate",
  "Local AI model is not ready"
]) {
  if (!modelRust.includes(phrase)) {
    throw new Error(`desktop model runtime missing local generation phrase: ${phrase}`);
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

for (const action of ["install", "start", "stop", "health", "repair", "logs", "backup", "open-backup-folder", "restore", "uninstall"]) {
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

for (const phrase of [
  "City data folder has not been created yet.",
  "Backup folder has not been created yet.",
  "item.actionable !== false"
]) {
  if (!main.includes(phrase)) {
    throw new Error(`Desktop health UI missing local folder health phrase: ${phrase}`);
  }
}

for (const phrase of [
  "is available and writable on this Windows profile.",
  "CivicSuite cannot save files there.",
  "Choose another city data folder in Settings or ask IT to grant write access.",
  "Choose another backup folder in Settings or ask IT to grant write access.",
  "writable {}; write_check {}"
]) {
  if (!supervisorRust.includes(phrase)) {
    throw new Error(`Windows supervisor missing folder write-health phrase: ${phrase}`);
  }
}

for (const phrase of [
  "CivicSuite Local Logs",
  "Use these files when IT or CivicSuite support asks for local runtime evidence.",
  "Prepared and opened the CivicSuite logs folder under the selected city data folder",
  "Share README.txt and the relevant service log with IT or CivicSuite support."
]) {
  if (!supervisorRust.includes(phrase)) {
    throw new Error(`Windows supervisor missing local logs support phrase: ${phrase}`);
  }
}

for (const requiredPayload of [
  ["postgres-17-pgvector", "bin/pg_ctl.exe", "share/extension/vector.control"],
  [
    "cpython-services",
    "python.exe",
    "Lib/site-packages/civiccore/__init__.py",
    "Lib/site-packages/civiccore/migrations/alembic.ini",
    "Lib/site-packages/civiccore/migrations/versions/civiccore_0003_local_task_queue.py",
    "Lib/site-packages/app/main.py",
    "Lib/site-packages/civicclerk/main.py",
    "Lib/site-packages/civiccode/main.py",
    "Lib/site-packages/civicsuite_runtime/__init__.py",
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
