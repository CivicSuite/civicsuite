import { invoke } from "@tauri-apps/api/core";
import "./styles.css";

const fallbackState = {
  product_name: "CivicSuite",
  status_label: "Desktop shell scaffold",
  local_only: true,
  navigation: [
    ["home", "Home", "Work that needs attention"],
    ["meetings", "Meetings & Notices", "Agendas, notices, minutes, votes"],
    ["records", "Records Requests", "Intake, review, response, exports"],
    ["code", "Code & Ordinances", "Search, imports, guidance, handoffs"],
    ["search", "Search City Knowledge", "Cross-module search with citations"],
    ["health", "System Health", "Local services, model, backup, repair"],
    ["settings", "Settings", "City profile, users, modules"]
  ].map(([id, label, description]) => ({ id, label, description })),
  modules: [
    {
      id: "civiccore",
      display_name: "CivicCore",
      role: "shared platform",
      version: "1.2.0",
      required: true,
      selectable: false,
      installed: true
    },
    {
      id: "civicrecords-ai",
      display_name: "CivicRecords AI",
      role: "records workflow",
      version: "1.7.3",
      required: false,
      selectable: true,
      installed: true
    },
    {
      id: "civicclerk",
      display_name: "CivicClerk",
      role: "meetings workflow",
      version: "1.0.4",
      required: false,
      selectable: true,
      installed: true
    },
    {
      id: "civiccode",
      display_name: "CivicCode",
      role: "municipal code",
      version: "1.0.8",
      required: false,
      selectable: true,
      installed: true
    }
  ],
  installer_steps: [],
  first_run: {
    profile: "windows-local-1.0",
    profile_label: "City Core",
    local_only: true,
    finished: false,
    status: "Needs setup",
    current_step_id: "unsigned-beta",
    locations: {
      install_root: "%LOCALAPPDATA%\\CivicSuite",
      data_root: "%LOCALAPPDATA%\\CivicSuite\\Data",
      backup_root: "%USERPROFILE%\\Documents\\CivicSuite Backups"
    },
    available_actions: ["review", "choose-location", "select-modules", "download-model", "create-city-profile", "create-admin", "choose-backup", "verify-health", "open-app", "repair", "backup", "uninstall"],
    steps: [
      {
        id: "unsigned-beta",
        label: "Welcome and unsigned beta notice",
        surface: "Installer",
        required: true,
        completed: false,
        current: true,
        status: "Current",
        summary: "CivicSuite is beta software from an unsigned open-source build.",
        detail: "Install only from the official CivicSuite release source after checksum verification.",
        next_action: "Review the unsigned beta notice before continuing.",
        action: "review"
      },
      {
        id: "smartscreen",
        label: "Windows SmartScreen explanation",
        surface: "Installer",
        required: true,
        completed: false,
        current: false,
        status: "Needs setup",
        summary: "Windows may show an Unknown Publisher warning for this beta.",
        detail: "The installer explains More info and Run anyway for this verified unsigned beta.",
        next_action: "Confirm the warning text matches the CivicSuite guidance.",
        action: "review"
      },
      {
        id: "locations",
        label: "Install and local data locations",
        surface: "Installer",
        required: true,
        completed: false,
        current: false,
        status: "Needs setup",
        summary: "Choose where the app and city data live on this machine.",
        detail: "Defaults stay under the current Windows user profile.",
        next_action: "Choose install, data, and backup folders.",
        action: "choose-location"
      },
      {
        id: "modules",
        label: "Module selection",
        surface: "Installer",
        required: true,
        completed: false,
        current: false,
        status: "Needs setup",
        summary: "City Core is selected by default and CivicCore is locked on.",
        detail: "Future modules appear only after their package and proof gates pass.",
        next_action: "Review the City Core module set.",
        action: "select-modules"
      },
      {
        id: "model",
        label: "Local AI model download",
        surface: "Installer",
        required: true,
        completed: false,
        current: false,
        status: "Needs setup",
        summary: "Download Gemma 4 12B quantization-aware weights for local AI.",
        detail: "Model setup must verify pinned metadata and checksums.",
        next_action: "Download and verify the pinned local model weights.",
        action: "download-model"
      },
      {
        id: "city-profile",
        label: "City profile",
        surface: "First run",
        required: true,
        completed: false,
        current: false,
        status: "Needs setup",
        summary: "Enter city profile and contact details.",
        detail: "The city profile personalizes notices, records responses, code guidance, and audit context.",
        next_action: "Create the city profile.",
        action: "create-city-profile"
      },
      {
        id: "first-admin",
        label: "First admin user",
        surface: "First run",
        required: true,
        completed: false,
        current: false,
        status: "Needs setup",
        summary: "Create the first local administrator before staff work begins.",
        detail: "The first admin owns users, roles, backups, and recovery contact information.",
        next_action: "Create the first admin user.",
        action: "create-admin"
      },
      {
        id: "backup",
        label: "Backup default",
        surface: "First run",
        required: true,
        completed: false,
        current: false,
        status: "Needs setup",
        summary: "Choose the default local backup folder.",
        detail: "Backup is configured before city work begins.",
        next_action: "Choose the default backup folder.",
        action: "choose-backup"
      },
      {
        id: "health",
        label: "Health verification",
        surface: "First run",
        required: true,
        completed: false,
        current: false,
        status: "Needs setup",
        summary: "Verify local services, storage, backup, and the local model.",
        detail: "Health checks cover the desktop shell, local data store, workflow services, task queue, local AI model, and document storage.",
        next_action: "Run local health verification.",
        action: "verify-health"
      },
      {
        id: "finish",
        label: "Finish and lifecycle entry points",
        surface: "First run",
        required: true,
        completed: false,
        current: false,
        status: "Needs setup",
        summary: "Open CivicSuite and keep repair, backup, and uninstall reachable.",
        detail: "The same product surface owns lifecycle actions.",
        next_action: "Open CivicSuite after all setup checks pass.",
        action: "open-app"
      }
    ]
  },
  model: {
    profile: "windows-local-1.0",
    local_only: true,
    ready: false,
    status: "Needs download",
    display_name: "Gemma 4 12B QAT Q4_0",
    model_id: "gemma-4-12b-it-qat-q4_0",
    provider: "Google",
    source_repo: "google/gemma-4-12B-it-qat-q4_0-gguf",
    source_url: "https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-gguf",
    resolve_url: "https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-gguf/resolve/main/gemma-4-12b-it-qat-q4_0.gguf",
    documentation_url: "https://ai.google.dev/gemma/docs/core",
    license: "Apache-2.0",
    runtime: "ollama",
    ollama_model: "hf.co/google/gemma-4-12B-it-qat-q4_0-gguf:Q4_0",
    format: "GGUF",
    quantization: "QAT Q4_0",
    parameters: "12B",
    context_window_tokens: 256000,
    approximate_weight_memory_gb: 6.7,
    download_size_bytes: 6975877728,
    download_resumable: true,
    download_requires_consent: true,
    download_policy: "Explicit model setup only",
    minimum_free_disk_bytes: 15000000000,
    artifact: {
      file_name: "gemma-4-12b-it-qat-q4_0.gguf",
      local_path: "%LOCALAPPDATA%\\CivicSuite\\Data\\models\\gemma-4-12b-it-qat-q4_0.gguf",
      expected_size_bytes: 6975877728,
      expected_sha256: "faff1a63667fac17ac5e777f47114688fcefea96e220e211aaa8d62c2c4561f1",
      checksum_required: true,
      checksum_source: "https://huggingface.co/api/models/google/gemma-4-12B-it-qat-q4_0-gguf?blobs=true",
      etag_blob_id: "2bf67e31a647c65d7037e38fd6e42fd6319da4bc"
    },
    checks: [
      {
        id: "metadata",
        label: "Pinned model metadata",
        ok: true,
        status: "OK",
        message: "Gemma 4 12B QAT Q4_0 is pinned with official source metadata and checksum requirements.",
        next_action: "Keep this pinned model contract with the Windows Local 1.0 installer."
      },
      {
        id: "artifact-file",
        label: "Local model file",
        ok: false,
        status: "Needs download",
        message: "The pinned GGUF file is not present with the expected size on this machine yet.",
        next_action: "Download the pinned GGUF file during first-run setup."
      },
      {
        id: "checksum",
        label: "Checksum verification",
        ok: false,
        status: "Needs verification",
        message: "The model must match the pinned SHA-256 before AI workflows can run.",
        next_action: "Verify the local file against the pinned SHA-256 before enabling AI workflows."
      },
      {
        id: "runtime",
        label: "Local model runtime",
        ok: false,
        status: "Needs setup",
        message: "The bundled local model runtime has not been started by the installer yet.",
        next_action: "Start the bundled Ollama runtime after the portable runtime is installed."
      },
      {
        id: "registered-model",
        label: "CivicCore model registry",
        ok: false,
        status: "Needs setup",
        message: "CivicCore has not registered this verified local model yet.",
        next_action: "Register the verified model with CivicCore before staff workflows use it."
      }
    ],
    next_action: "Use first-run setup to download, resume, and verify the pinned local model."
  },
  health: [
    {
      id: "desktop-shell",
      label: "Desktop shell",
      ok: true,
      status: "OK",
      message: "Tauri/WebView2 shell is running locally.",
      next_action: "Continue the Windows local setup.",
      admin_detail: "Browser preview fallback; Tauri provides live state in the desktop app."
    },
    {
      id: "postgres",
      label: "Local data store",
      ok: false,
      status: "Needs setup",
      message: "Local data store is defined for the Windows local runtime but has not been installed yet.",
      next_action: "Install the portable local data store during first run.",
      admin_detail: "Portable PostgreSQL 17 + pgvector"
    },
    {
      id: "model-runtime",
      label: "Local AI model",
      ok: false,
      status: "Needs setup",
      message: "Local AI model is defined for the Windows local runtime but has not been installed yet.",
      next_action: "Download and verify the pinned local model weights.",
      admin_detail: "Ollama runtime with Gemma 4 12B quantization-aware weights"
    }
  ]
};

const state = {
  activeArea: "home",
  activeSurface: "Staff",
  auditOpen: false,
  actionResult: null,
  modelActionResult: null,
  supervisorActionResult: null,
  setupDraft: {
    cityName: "",
    state: "",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    recordsContact: "",
    clerkContact: "",
    adminName: "",
    adminEmail: ""
  },
  app: fallbackState
};

function byId(id) {
  return document.getElementById(id);
}

async function loadAppState() {
  if (!("__TAURI_INTERNALS__" in window)) {
    return;
  }
  try {
    state.app = await invoke("get_app_state");
  } catch (error) {
    console.warn("Using browser fallback state", error);
  }
}

function hasTauriBridge() {
  return "__TAURI_INTERNALS__" in window;
}

function moduleStatusLabel(module) {
  if (module.required) return "Required";
  if (module.installed) return "Installed";
  if (module.selectable) return "Available";
  return "Not ready";
}

function moduleStatusClass(module) {
  if (module.required || module.installed) return "status-ok";
  if (module.selectable) return "status-warn";
  return "status-muted";
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "Unknown size";
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

function renderTopbar() {
  return `
    <header class="topbar">
      <div>
        <p class="eyebrow">Windows Local 1.0</p>
        <h1>CivicSuite</h1>
      </div>
      <div class="topbar-actions" aria-label="Application actions">
        <div class="surface-switch" role="tablist" aria-label="Surface">
          ${["Staff", "Resident/Public", "IT/Admin"].map((surface) => `
            <button
              type="button"
              class="${state.activeSurface === surface ? "active" : ""}"
              data-surface="${surface}"
              role="tab"
              aria-selected="${state.activeSurface === surface}"
            >${surface}</button>
          `).join("")}
        </div>
        <button type="button" class="icon-text" id="audit-toggle" aria-expanded="${state.auditOpen}">
          Audit Trail
        </button>
      </div>
    </header>
  `;
}

function renderNav() {
  return `
    <nav class="sidebar" aria-label="Primary">
      ${state.app.navigation.map((item) => `
        <button
          type="button"
          class="nav-item ${state.activeArea === item.id ? "active" : ""}"
          data-area="${item.id}"
        >
          <span>${item.label}</span>
          <small>${item.description}</small>
        </button>
      `).join("")}
    </nav>
  `;
}

function renderHome() {
  const installed = state.app.modules.filter((module) => module.installed || module.required);
  return `
    <section class="page-heading">
      <p class="eyebrow">Staff surface</p>
      <h2>Work that needs attention</h2>
      <p>Start with the task, not the module. City-core workflows stay local on this machine.</p>
    </section>
    ${renderFirstRunWizard()}
    ${renderModelReadiness({ compact: true })}
    <section class="task-grid" aria-label="Primary work areas">
      ${state.app.navigation.filter((item) => item.id !== "home" && item.id !== "settings").slice(0, 5).map((item) => `
        <article class="task-card">
          <div>
            <p class="eyebrow">${item.id === "health" ? "Local system" : "City work"}</p>
            <h3>${item.label}</h3>
            <p>${item.description}</p>
          </div>
          <button type="button" data-area="${item.id}">Open</button>
        </article>
      `).join("")}
    </section>
    <section class="section-band">
      <div class="section-title">
        <h3>Installed foundation</h3>
        <p>${installed.length} local components are part of this Windows profile.</p>
      </div>
      <div class="module-list compact">
        ${installed.map(renderModuleRow).join("")}
      </div>
    </section>
  `;
}

function firstRunStatusClass(step) {
  if (step.completed) return "status-ok";
  if (step.current) return "status-warn";
  return "status-muted";
}

function setupActionLabel(step) {
  const labels = {
    "review": "Review and continue",
    "choose-location": "Create local folders",
    "select-modules": "Use City Core modules",
    "download-model": "Confirm model verified",
    "create-city-profile": "Save city profile",
    "create-admin": "Save first admin",
    "choose-backup": "Create backup folder",
    "verify-health": "Run health check",
    "open-app": "Finish setup"
  };
  return labels[step.action] || "Continue setup";
}

function renderSetupFields(step) {
  if (!step.current) return "";
  if (step.id === "city-profile") {
    return `
      <div class="setup-form" aria-label="City profile">
        <label>City name <input type="text" data-setup-field="cityName" value="${state.setupDraft.cityName}" autocomplete="organization" /></label>
        <label>State <input type="text" data-setup-field="state" value="${state.setupDraft.state}" autocomplete="address-level1" /></label>
        <label>Time zone <input type="text" data-setup-field="timeZone" value="${state.setupDraft.timeZone}" /></label>
        <label>Records contact <input type="email" data-setup-field="recordsContact" value="${state.setupDraft.recordsContact}" autocomplete="email" /></label>
        <label>Clerk contact <input type="email" data-setup-field="clerkContact" value="${state.setupDraft.clerkContact}" autocomplete="email" /></label>
      </div>
    `;
  }
  if (step.id === "first-admin") {
    return `
      <div class="setup-form two-column" aria-label="First admin">
        <label>Admin name <input type="text" data-setup-field="adminName" value="${state.setupDraft.adminName}" autocomplete="name" /></label>
        <label>Admin email <input type="email" data-setup-field="adminEmail" value="${state.setupDraft.adminEmail}" autocomplete="email" /></label>
      </div>
    `;
  }
  return "";
}

function renderFirstRunStep(step, index) {
  return `
    <article class="first-run-step ${step.current ? "current" : ""}">
      <strong>${index + 1}</strong>
      <div>
        <div class="step-header">
          <h3>${step.label}</h3>
          <span class="${firstRunStatusClass(step)}">${step.status}</span>
        </div>
        <p>${step.summary}</p>
        <small>${step.detail}</small>
        ${step.current ? `<p class="next-action"><strong>Next:</strong> ${step.next_action}</p>` : ""}
        ${renderSetupFields(step)}
        ${step.current ? `
          <div class="setup-actions">
            <button type="button" class="primary-action" data-first-run-action="${step.action}" data-step-id="${step.id}">
              ${setupActionLabel(step)}
            </button>
          </div>
        ` : ""}
      </div>
    </article>
  `;
}

function renderActionResult() {
  if (!state.actionResult) return "";
  const result = state.actionResult;
  return `
    <div class="action-result ${result.accepted ? "saved" : "blocked"}" role="status">
      <strong>${result.status}</strong>
      <span>${result.message}</span>
      <small>${result.next_action}</small>
    </div>
  `;
}

function renderModelActionResult() {
  if (!state.modelActionResult) return "";
  const result = state.modelActionResult;
  return `
    <div class="action-result ${result.accepted ? "saved" : "blocked"}" role="status">
      <strong>${result.status}</strong>
      <span>${result.message}</span>
      <small>${result.next_action}</small>
    </div>
  `;
}

function renderSupervisorActionResult() {
  if (!state.supervisorActionResult) return "";
  const result = state.supervisorActionResult;
  return `
    <div class="action-result ${result.accepted ? "saved" : "blocked"}" role="status">
      <strong>${result.status}</strong>
      <span>${result.message}</span>
      <small>${result.next_action}</small>
    </div>
  `;
}

function renderFirstRunWizard({ compact = false } = {}) {
  const firstRun = state.app.first_run;
  if (!firstRun || firstRun.finished) return "";
  const steps = compact ? firstRun.steps.slice(0, 5) : firstRun.steps;
  return `
    <section class="section-band first-run-panel" aria-label="First-run setup">
      <div class="section-title">
        <p class="eyebrow">First-run setup</p>
        <h3>${firstRun.profile_label} setup checklist</h3>
        <p>Install stays local to this Windows machine. No Docker, WSL, terminal, or developer tooling is part of the clerk path.</p>
      </div>
      <div class="location-grid" aria-label="Default local locations">
        <div>
          <span>Install</span>
          <strong>${firstRun.locations.install_root}</strong>
        </div>
        <div>
          <span>City data</span>
          <strong>${firstRun.locations.data_root}</strong>
        </div>
        <div>
          <span>Backups</span>
          <strong>${firstRun.locations.backup_root}</strong>
        </div>
      </div>
      <div class="first-run-list">
        ${steps.map(renderFirstRunStep).join("")}
      </div>
      ${renderActionResult()}
      ${compact && firstRun.steps.length > steps.length ? `
        <button type="button" class="text-link" data-area="health">View all setup and health steps</button>
      ` : ""}
    </section>
  `;
}

function renderModelActions(model) {
  return `
    <div class="model-actions" aria-label="Local model setup actions">
      <button type="button" class="secondary-action" data-model-action="open-model-folder">
        Open Model Folder
      </button>
      <button type="button" class="primary-action" data-model-action="${model.download_resumable ? "resume-download" : "download"}">
        ${model.download_resumable ? "Download / Resume" : "Download Model"}
      </button>
      <button type="button" class="secondary-action" data-model-action="verify-checksum">
        Verify Checksum
      </button>
      <button type="button" class="secondary-action" data-model-action="retry">
        Retry Setup
      </button>
    </div>
  `;
}

function renderModelReadiness({ compact = false } = {}) {
  const model = state.app.model;
  if (!model) return "";
  const checks = compact ? model.checks.slice(0, 3) : model.checks;
  return `
    <section class="section-band model-panel" aria-label="Local AI model readiness">
      <div class="section-title">
        <p class="eyebrow">Local AI model</p>
        <h3>${model.display_name}</h3>
        <p>Official Google weights are pinned for local-only use. No silent download starts from this screen.</p>
      </div>
      <div class="model-meta-grid">
        <div>
          <span>Status</span>
          <strong class="${model.ready ? "status-ok" : "status-warn"}">${model.status}</strong>
        </div>
        <div>
          <span>Download</span>
          <strong>${formatBytes(model.download_size_bytes)} resumable</strong>
        </div>
        <div>
          <span>Runtime id</span>
          <strong>${model.ollama_model}</strong>
        </div>
        <div>
          <span>Checksum required</span>
          <strong>${model.artifact.expected_sha256}</strong>
        </div>
      </div>
      <div class="model-source">
        <span>${model.provider} source</span>
        <strong>${model.source_repo}</strong>
        <small>${model.download_policy}; explicit setup consent required.</small>
        <small>Checksum source: ${model.artifact.checksum_source}</small>
        <small>Local path: ${model.artifact.local_path}</small>
      </div>
      ${renderModelActions(model)}
      ${renderModelActionResult()}
      <div class="readiness-list">
        ${checks.map((check) => `
          <article class="readiness-item">
            <span class="${check.ok ? "status-ok" : "status-warn"}">${check.status}</span>
            <div>
              <h4>${check.label}</h4>
              <p>${check.message}</p>
              ${check.next_action ? `<small>${check.next_action}</small>` : ""}
            </div>
          </article>
        `).join("")}
      </div>
      ${compact && model.checks.length > checks.length ? `
        <button type="button" class="text-link" data-area="health">View full model readiness</button>
      ` : ""}
    </section>
  `;
}

function renderWorkflow(title, body, actions) {
  return `
    <section class="page-heading">
      <p class="eyebrow">${state.activeSurface}</p>
      <h2>${title}</h2>
      <p>${body}</p>
    </section>
    <section class="workflow-panel">
      ${actions.map((action, index) => `
        <article class="workflow-step">
          <strong>${index + 1}</strong>
          <div>
            <h3>${action.title}</h3>
            <p>${action.body}</p>
          </div>
          <span class="${action.ready ? "status-ok" : "status-muted"}">${action.ready ? "Ready" : "Scaffold"}</span>
        </article>
      `).join("")}
    </section>
  `;
}

function renderModuleRow(module) {
  return `
    <article class="module-row">
      <div>
        <h3>${module.display_name}</h3>
        <p>${module.role}</p>
      </div>
      <div class="module-meta">
        <span class="${moduleStatusClass(module)}">${moduleStatusLabel(module)}</span>
        <small>${module.version || "No release yet"}</small>
      </div>
    </article>
  `;
}

function renderModules() {
  const installed = state.app.modules.filter((module) => module.installed || module.required);
  const available = state.app.modules.filter((module) => module.selectable && !module.installed);
  const notReady = state.app.modules.filter((module) => !module.selectable && !module.required);
  return `
    <section class="page-heading">
      <p class="eyebrow">Settings</p>
      <h2>Module Manager</h2>
      <p>The module manager keeps CivicCore installed and adds product modules only after their contract and proof gates pass.</p>
    </section>
    <section class="module-columns">
      <div>
        <div class="section-title">
          <h3>Installed</h3>
          <p>Available in this desktop shell.</p>
        </div>
        <div class="module-list">${installed.map(renderModuleRow).join("")}</div>
      </div>
      <div>
        <div class="section-title">
          <h3>Available later</h3>
          <p>Selectable modules must pass install, health, and proof gates.</p>
        </div>
        <div class="module-list">${available.slice(0, 8).map(renderModuleRow).join("")}</div>
      </div>
      <div>
        <div class="section-title">
          <h3>Not ready</h3>
          <p>Shown honestly; not installable from the clerk path.</p>
        </div>
        <div class="module-list">${notReady.map(renderModuleRow).join("")}</div>
      </div>
    </section>
  `;
}

function renderHealth() {
  return `
    <section class="page-heading">
      <p class="eyebrow">IT/Admin</p>
      <h2>System Health</h2>
      <p>Plain-English local health first. Technical logs stay behind repair detail screens.</p>
    </section>
    ${renderModelReadiness()}
    <section class="health-grid">
      ${state.app.health.map((item) => `
        <article class="health-card">
          <span class="${item.ok ? "status-ok" : "status-warn"}">${item.status || (item.ok ? "OK" : "Needs setup")}</span>
          <h3>${item.label}</h3>
          <p>${item.message}</p>
          ${item.next_action ? `<p class="next-action"><strong>Next:</strong> ${item.next_action}</p>` : ""}
          ${item.admin_detail ? `<small>${item.admin_detail}</small>` : ""}
          ${item.id !== "desktop-shell" ? `
            <div class="health-actions" aria-label="${item.label} actions">
              <button type="button" class="secondary-action" data-supervisor-action="health" data-service-id="${item.id}">Check</button>
              <button type="button" class="secondary-action" data-supervisor-action="install" data-service-id="${item.id}">Install</button>
              <button type="button" class="secondary-action" data-supervisor-action="start" data-service-id="${item.id}">Start</button>
              <button type="button" class="secondary-action" data-supervisor-action="repair" data-service-id="${item.id}">Repair</button>
              <button type="button" class="secondary-action" data-supervisor-action="logs" data-service-id="${item.id}">Logs</button>
              <button type="button" class="secondary-action" data-supervisor-action="stop" data-service-id="${item.id}">Stop</button>
            </div>
          ` : ""}
        </article>
      `).join("")}
    </section>
    ${renderSupervisorActionResult()}
    ${renderFirstRunWizard()}
  `;
}

function renderActiveArea() {
  switch (state.activeArea) {
    case "meetings":
      return renderWorkflow("Meetings & Notices", "Create agendas, packets, notices, minutes, votes, actions, and archive records with source-backed review.", [
        { title: "Prepare packet", body: "Collect agenda items and source documents before public posting.", ready: false },
        { title: "Review notice", body: "Show draft/public/official status before a notice is posted.", ready: false },
        { title: "Capture outcomes", body: "Record motions, votes, minutes, and action items with audit entries.", ready: false }
      ]);
    case "records":
      return renderWorkflow("Records Requests", "Track intake, search, review, response letters, exports, and citations in the local city data store.", [
        { title: "Intake request", body: "Capture requester, scope, deadline, and staff owner.", ready: false },
        { title: "Search sources", body: "Use local indexed documents and show citations beside AI-assisted drafts.", ready: false },
        { title: "Export response", body: "Label exports as draft, internal, public, or official.", ready: false }
      ]);
    case "code":
      return renderWorkflow("Code & Ordinances", "Search local code, import source material, and create clerk handoffs for ordinances and resolutions.", [
        { title: "Import source", body: "Store source documents locally with provenance.", ready: false },
        { title: "Answer with citations", body: "Every answer shows source sections and refuses when sources are missing.", ready: false },
        { title: "Create handoff", body: "Move ordinance and resolution work to the clerk workflow through CivicCore.", ready: false }
      ]);
    case "search":
      return renderWorkflow("Search City Knowledge", "Find local records, code, meetings, and notices through one cited search surface.", [
        { title: "Search local index", body: "Search must stay local by default.", ready: false },
        { title: "Show citations", body: "Results distinguish official source, local file, staff note, and sample data.", ready: false },
        { title: "Open source workflow", body: "Each result routes to the owning module.", ready: false }
      ]);
    case "health":
      return renderHealth();
    case "settings":
      return renderModules();
    default:
      return renderHome();
  }
}

function renderAuditDrawer() {
  return `
    <aside class="audit-drawer ${state.auditOpen ? "open" : ""}" aria-hidden="${!state.auditOpen}">
      <div class="section-title">
        <h2>Audit Trail</h2>
        <p>Every official staff action will write who, what, when, and source context.</p>
      </div>
      <div class="audit-entry">
        <span class="status-muted">Scaffold</span>
        <p>No official actions have been recorded by this shell yet.</p>
      </div>
    </aside>
  `;
}

function render() {
  byId("app").innerHTML = `
    ${renderTopbar()}
    <div class="layout">
      ${renderNav()}
      <main id="main-content" tabindex="-1">${renderActiveArea()}</main>
      ${renderAuditDrawer()}
    </div>
  `;
  bindEvents();
}

function bindEvents() {
  document.querySelectorAll("[data-area]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeArea = button.dataset.area;
      render();
      byId("main-content")?.focus();
    });
  });
  document.querySelectorAll("[data-surface]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeSurface = button.dataset.surface;
      render();
    });
  });
  byId("audit-toggle")?.addEventListener("click", () => {
    state.auditOpen = !state.auditOpen;
    render();
  });
  document.querySelectorAll("[data-setup-field]").forEach((input) => {
    input.addEventListener("input", () => {
      state.setupDraft[input.dataset.setupField] = input.value;
    });
  });
  document.querySelectorAll("[data-first-run-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      await handleFirstRunAction(button.dataset.firstRunAction, button.dataset.stepId);
    });
  });
  document.querySelectorAll("[data-model-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      await handleModelAction(button.dataset.modelAction);
    });
  });
  document.querySelectorAll("[data-supervisor-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      await handleSupervisorAction(button.dataset.supervisorAction, button.dataset.serviceId);
    });
  });
}

function setupPayloadForStep(stepId) {
  if (stepId === "city-profile") {
    return {
      cityName: state.setupDraft.cityName,
      state: state.setupDraft.state,
      timeZone: state.setupDraft.timeZone,
      recordsContact: state.setupDraft.recordsContact,
      clerkContact: state.setupDraft.clerkContact
    };
  }
  if (stepId === "first-admin") {
    return {
      adminName: state.setupDraft.adminName,
      adminEmail: state.setupDraft.adminEmail
    };
  }
  return {};
}

async function handleFirstRunAction(action, stepId) {
  if (!hasTauriBridge()) {
    state.actionResult = {
      accepted: false,
      status: "Desktop app required",
      message: "Setup changes are saved by the Windows desktop app, not the browser preview.",
      next_action: "Open the CivicSuite desktop app to continue setup."
    };
    render();
    return;
  }
  try {
    state.actionResult = await invoke("first_run_action", {
      action,
      stepId,
      payload: setupPayloadForStep(stepId)
    });
    await loadAppState();
  } catch (error) {
    state.actionResult = {
      accepted: false,
      status: "Needs attention",
      message: String(error),
      next_action: "Correct the setup information and try again."
    };
  }
  render();
}

async function handleModelAction(action) {
  if (!hasTauriBridge()) {
    state.modelActionResult = {
      accepted: false,
      status: "Desktop app required",
      message: "Model setup changes are saved by the Windows desktop app, not the browser preview.",
      next_action: "Open the CivicSuite desktop app to continue local model setup."
    };
    render();
    return;
  }
  try {
    state.modelActionResult = await invoke("model_action", { action });
    await loadAppState();
  } catch (error) {
    state.modelActionResult = {
      accepted: false,
      status: "Needs attention",
      message: String(error),
      next_action: "Check the local model file, network connection, and available disk space, then retry."
    };
  }
  render();
}

async function handleSupervisorAction(action, serviceId) {
  if (!hasTauriBridge()) {
    state.supervisorActionResult = {
      accepted: false,
      status: "Desktop app required",
      message: "Runtime service changes are saved by the Windows desktop app, not the browser preview.",
      next_action: "Open the CivicSuite desktop app to manage local runtime services."
    };
    render();
    return;
  }
  try {
    state.supervisorActionResult = await invoke("supervisor_action", {
      action,
      serviceId
    });
    await loadAppState();
  } catch (error) {
    state.supervisorActionResult = {
      accepted: false,
      status: "Needs attention",
      message: String(error),
      next_action: "Review System Health and try the action again."
    };
  }
  render();
}

await loadAppState();
render();
