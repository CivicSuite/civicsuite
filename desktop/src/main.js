import { invoke } from "@tauri-apps/api/core";
import "./styles.css";

const fallbackState = {
  product_name: "CivicSuite",
  status_label: "Windows Local 1.0 desktop",
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
  module_profiles: [
    {
      id: "city-core",
      label: "City Core",
      description: "CivicCore, CivicRecords AI, CivicClerk, and CivicCode",
      selected: true,
      disabled: false,
      module_count: 4
    }
  ],
  module_selection: {
    profile_id: "city-core",
    profile_label: "City Core",
    installed_module_ids: ["civiccore", "civicrecords-ai", "civicclerk", "civiccode"],
    disabled_module_ids: [],
    last_updated_unix_seconds: 0
  },
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
    runtime_model: "civicsuite-gemma4-12b-qat:q4_0",
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
        status: "Needs start",
        message: "The bundled local model runtime is not responding yet.",
        next_action: "Start the bundled Ollama runtime after the portable runtime is installed."
      },
      {
        id: "runtime-model",
        label: "Gemma model loaded in Ollama",
        ok: false,
        status: "Needs load",
        message: "The local Ollama runtime does not list civicsuite-gemma4-12b-qat:q4_0 yet.",
        next_action: "Load the verified Gemma model into the local Ollama runtime before staff workflows use AI."
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
  ],
  city_work: {
    meetings: [],
    records_requests: [],
    code_sources: [],
    code_handoffs: [],
    audit_entries: []
  },
  city_profile: null,
  users: [],
  access: {
    configured: false,
    signed_in: false,
    operator_name: null,
    operator_email: null,
    role: null,
    status: "Setup needed",
    next_action: "Create the first local administrator."
  }
};

const state = {
  activeArea: "home",
  activeSurface: "Staff",
  auditOpen: false,
  actionResult: null,
  modelActionResult: null,
  supervisorActionResult: null,
  workActionResult: null,
  authActionResult: null,
  searchResults: [],
  setupDraft: {
    cityName: "",
    state: "",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    recordsContact: "",
    clerkContact: "",
    adminName: "",
    adminEmail: "",
    adminPasscode: ""
  },
  accessDraft: {
    email: "",
    passcode: ""
  },
  workDraft: {
    meetingTitle: "",
    meetingDate: "",
    meetingSummary: "",
    agendaTitle: "",
    minutes: "",
    vote: "",
    actionItem: "",
    residentComment: "",
    requester: "",
    recordsSummary: "",
    deadline: "",
    responseDraft: "",
    citation: "",
    codeTitle: "",
    codeCitation: "",
    codeBody: "",
    handoffSummary: "",
    searchQuery: ""
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
    hydrateSetupDraftFromApp();
  } catch (error) {
    console.warn("Using browser fallback state", error);
  }
}

function hydrateSetupDraftFromApp() {
  const profile = state.app.city_profile;
  if (profile) {
    state.setupDraft.cityName = profile.city_name || "";
    state.setupDraft.state = profile.state || "";
    state.setupDraft.timeZone = profile.time_zone || "";
    state.setupDraft.recordsContact = profile.records_contact || "";
    state.setupDraft.clerkContact = profile.clerk_contact || "";
  }
  const admin = (state.app.users || [])[0];
  if (admin) {
    state.setupDraft.adminName = admin.display_name || "";
    state.setupDraft.adminEmail = admin.email || "";
  }
  const access = accessState();
  if (access.operator_email) {
    state.accessDraft.email = access.operator_email;
  } else if (admin?.email) {
    state.accessDraft.email = admin.email;
  }
}

function hasTauriBridge() {
  return "__TAURI_INTERNALS__" in window;
}

function accessState() {
  return state.app.access || fallbackState.access;
}

function moduleStatusLabel(module) {
  if (module.required) return "Required";
  if (module.installed) return "Installed";
  if (module.selectable) return "Available";
  return "Unavailable";
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
  const access = accessState();
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
        ${access.signed_in ? `<button type="button" class="icon-text" data-auth-action="sign-out">Sign Out</button>` : ""}
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
      <p class="eyebrow">${state.activeSurface} surface</p>
      <h2>Work that needs attention</h2>
      <p>Start with the task, not the module. City-core workflows stay local on this machine.</p>
    </section>
    ${renderFirstRunWizard()}
    ${renderAccessPanel()}
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
    "verify-health": "Set Up and Check Services",
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
        <label>Local passcode <input type="password" data-setup-field="adminPasscode" value="${state.setupDraft.adminPasscode}" autocomplete="new-password" /></label>
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

function renderWorkActionResult() {
  if (!state.workActionResult) return "";
  const result = state.workActionResult;
  return `
    <div class="action-result ${result.accepted ? "saved" : "blocked"}" role="status">
      <strong>${result.status}</strong>
      <span>${result.message}</span>
      <small>${result.next_action}</small>
    </div>
  `;
}

function renderAuthActionResult() {
  if (!state.authActionResult) return "";
  const result = state.authActionResult;
  return `
    <div class="action-result ${result.accepted ? "saved" : "blocked"}" role="status">
      <strong>${result.status}</strong>
      <span>${result.message}</span>
      <small>${result.next_action}</small>
    </div>
  `;
}

function renderAccessPanel() {
  const access = accessState();
  if (!access.configured) return "";
  if (access.signed_in) {
    return `
      <section class="section-band access-panel" aria-label="Local access">
        <div class="section-title">
          <p class="eyebrow">Local access</p>
          <h3>Signed in as ${access.operator_name || "local administrator"}</h3>
          <p>${access.role || "local-admin"}</p>
        </div>
        <div class="health-actions">
          <button type="button" class="secondary-action" data-auth-action="sign-out">Sign Out</button>
        </div>
      </section>
    `;
  }
  return `
    <section class="section-band access-panel" aria-label="Local administrator sign in">
      <div class="section-title">
        <p class="eyebrow">Local access</p>
        <h3>Sign In</h3>
        <p>Use the local administrator passcode before changing city work, settings, backups, restore, repair, or runtime services.</p>
      </div>
      <div class="workflow-form compact-form">
        <label>Email <input type="email" data-access-field="email" value="${state.accessDraft.email}" autocomplete="email" /></label>
        <label>Passcode <input type="password" data-access-field="passcode" value="${state.accessDraft.passcode}" autocomplete="current-password" /></label>
        <button type="button" class="primary-action" data-auth-action="sign-in">Sign In</button>
      </div>
      ${renderAuthActionResult()}
    </section>
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
      <button type="button" class="secondary-action" data-model-action="load-runtime-model">
        Load in Ollama
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
          <span>Official source</span>
          <strong>${model.ollama_model}</strong>
        </div>
        <div>
          <span>Runtime name</span>
          <strong>${model.runtime_model || model.ollama_model}</strong>
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
          <span class="${action.ready ? "status-ok" : "status-muted"}">${action.ready ? "Ready" : "Queued"}</span>
        </article>
      `).join("")}
    </section>
  `;
}

function cityWork() {
  return state.app.city_work || fallbackState.city_work;
}

function workflowEmpty(label) {
  return `<p class="empty-note">${label}</p>`;
}

function isPublicSurface() {
  return state.activeSurface === "Resident/Public";
}

function isPublicReadableArea() {
  return isPublicSurface() && ["home", "meetings", "records", "code", "search"].includes(state.activeArea);
}

function publicMeetings(work) {
  return work.meetings.filter((meeting) => (
    meeting.notice_status === "public notice ready" ||
    meeting.status === "packet exported" ||
    meeting.status === "archived public record" ||
    Boolean(meeting.archived_at_unix_seconds)
  ));
}

function renderPublicMeetingsWorkflow() {
  const meetings = publicMeetings(cityWork());
  return `
    <section class="page-heading">
      <p class="eyebrow">Resident/Public</p>
      <h2>Public Meeting Materials</h2>
      <p>Posted agendas, notices, packets, and approved public outcomes appear here without staff drafting controls.</p>
    </section>
    <section class="workflow-list">
      ${meetings.length === 0 ? workflowEmpty("No public meeting materials have been posted yet.") : meetings.map((meeting) => `
        <article class="workflow-record">
          <span class="status-ok">${meeting.status === "archived public record" ? "archived public record" : meeting.notice_status}</span>
          <h3>${meeting.title}</h3>
          <p>${meeting.summary || "No public summary recorded."}</p>
          <small>${meeting.meeting_date} - ${(meeting.agenda_items || []).length} agenda items - ${(meeting.votes || []).length} outcomes - ${(meeting.exports || []).length} public exports</small>
        </article>
      `).join("")}
    </section>
  `;
}

function renderMeetingsWorkflow() {
  if (isPublicSurface()) return renderPublicMeetingsWorkflow();
  const work = cityWork();
  const pendingCodeHandoffs = work.code_handoffs.filter((handoff) => handoff.status !== "sent to clerk agenda");
  return `
    <section class="page-heading">
      <p class="eyebrow">${state.activeSurface}</p>
      <h2>Meetings & Notices</h2>
      <p>Create meetings, agenda items, notices, minutes, votes, and action records in the local city profile.</p>
    </section>
    <section class="workflow-editor">
      <div class="workflow-form">
        <h3>Prepare Meeting</h3>
        <label>Meeting title <input type="text" data-work-field="meetingTitle" value="${state.workDraft.meetingTitle}" /></label>
        <label>Date <input type="date" data-work-field="meetingDate" value="${state.workDraft.meetingDate}" /></label>
        <label>Summary <textarea data-work-field="meetingSummary">${state.workDraft.meetingSummary}</textarea></label>
        <label>First agenda item <input type="text" data-work-field="agendaTitle" value="${state.workDraft.agendaTitle}" /></label>
        <div class="workflow-actions">
          <button type="button" class="primary-action" data-work-action="create-meeting">Create Meeting</button>
          <button type="button" class="secondary-action" data-work-action="add-agenda-item">Add Agenda Item</button>
          <button type="button" class="secondary-action" data-work-action="add-code-handoff-agenda">Add Code Handoff</button>
          <button type="button" class="secondary-action" data-work-action="post-notice">Mark Notice Ready</button>
          <button type="button" class="secondary-action" data-work-action="export-meeting-packet">Export Packet</button>
        </div>
      </div>
      <div class="workflow-form">
        <h3>Capture Outcomes</h3>
        <label>Minutes draft <textarea data-work-field="minutes">${state.workDraft.minutes}</textarea></label>
        <label>Motion or vote <input type="text" data-work-field="vote" value="${state.workDraft.vote}" /></label>
        <label>Action item <input type="text" data-work-field="actionItem" value="${state.workDraft.actionItem}" /></label>
        <label>Resident comment <textarea data-work-field="residentComment">${state.workDraft.residentComment}</textarea></label>
        <div class="workflow-actions">
          <button type="button" class="secondary-action" data-work-action="record-minutes">Save Minutes Draft</button>
          <button type="button" class="secondary-action" data-work-action="record-vote">Record Outcome</button>
          <button type="button" class="secondary-action" data-work-action="add-action-item">Add Action Item</button>
          <button type="button" class="secondary-action" data-work-action="record-resident-comment">Record Resident Comment</button>
          <button type="button" class="secondary-action" data-work-action="adopt-minutes">Adopt Minutes</button>
          <button type="button" class="secondary-action" data-work-action="archive-meeting">Archive Public Record</button>
        </div>
      </div>
    </section>
    ${renderWorkActionResult()}
    <section class="workflow-list">
      ${work.meetings.length === 0 ? workflowEmpty("No local meetings have been created yet.") : work.meetings.map((meeting) => `
        <article class="workflow-record">
          <span class="status-warn">${meeting.status}</span>
          <h3>${meeting.title}</h3>
          <p>${meeting.summary || "No summary yet."}</p>
          ${meeting.minutes_adopted_at_unix_seconds ? "<p><strong>Minutes:</strong> adopted</p>" : ""}
          ${(meeting.action_items || []).length > 0 ? `<p><strong>Action items:</strong> ${(meeting.action_items || []).join("; ")}</p>` : ""}
          ${(meeting.resident_comments || []).length > 0 ? `<p><strong>Resident comments:</strong> ${(meeting.resident_comments || []).length} logged</p>` : ""}
          <small>${meeting.meeting_date} · ${meeting.notice_status} · ${(meeting.agenda_items || []).length} agenda items · ${(meeting.votes || []).length} outcomes · ${(meeting.action_items || []).length} action items · ${(meeting.exports || []).length} exports</small>
        </article>
      `).join("")}
    </section>
    <section class="workflow-list" aria-label="CivicCode handoffs">
      ${pendingCodeHandoffs.length === 0 ? workflowEmpty("No CivicCode handoffs are waiting for the clerk.") : pendingCodeHandoffs.map((handoff) => `
        <article class="workflow-record handoff">
          <span class="status-warn">${handoff.status}</span>
          <h3>${handoff.title}</h3>
          <p>${handoff.summary}</p>
          <small>CivicCode handoff for agenda review</small>
        </article>
      `).join("")}
    </section>
  `;
}

function publicRecordsRequests(work) {
  return work.records_requests.filter((request) => request.status === "exported");
}

function publicCodeSources(work) {
  return work.code_sources.filter((source) => source.public_status === "published");
}

function renderPublicRecordsWorkflow() {
  const requests = publicRecordsRequests(cityWork());
  return `
    <section class="page-heading">
      <p class="eyebrow">Resident/Public</p>
      <h2>Public Records Status</h2>
      <p>Released records responses appear here without staff review drafts or internal citations.</p>
    </section>
    <section class="workflow-list">
      ${requests.length === 0 ? workflowEmpty("No public records responses have been released yet.") : requests.map((request) => `
        <article class="workflow-record">
          <span class="status-ok">${request.status}</span>
          <h3>${request.requester}</h3>
          <p>${request.summary}</p>
          <small>Released exports: ${request.exports.length}</small>
        </article>
      `).join("")}
    </section>
  `;
}

function renderRecordsWorkflow() {
  if (isPublicSurface()) return renderPublicRecordsWorkflow();
  const work = cityWork();
  return `
    <section class="page-heading">
      <p class="eyebrow">${state.activeSurface}</p>
      <h2>Records Requests</h2>
      <p>Track intake, deadline, review draft, citations, exports, and audit evidence locally.</p>
    </section>
    <section class="workflow-editor">
      <div class="workflow-form">
        <h3>Request Intake</h3>
        <label>Requester <input type="text" data-work-field="requester" value="${state.workDraft.requester}" /></label>
        <label>Deadline <input type="date" data-work-field="deadline" value="${state.workDraft.deadline}" /></label>
        <label>Request summary <textarea data-work-field="recordsSummary">${state.workDraft.recordsSummary}</textarea></label>
        <button type="button" class="primary-action" data-work-action="create-records-request">Create Request</button>
      </div>
      <div class="workflow-form">
        <h3>Draft Response</h3>
        <label>Response draft <textarea data-work-field="responseDraft">${state.workDraft.responseDraft}</textarea></label>
        <label>Citation or source note <input type="text" data-work-field="citation" value="${state.workDraft.citation}" /></label>
        <div class="workflow-actions">
          <button type="button" class="secondary-action" data-work-action="draft-records-response">Save Draft</button>
          <button type="button" class="secondary-action" data-work-action="export-records-response">Export Response</button>
        </div>
      </div>
    </section>
    ${renderWorkActionResult()}
    <section class="workflow-list">
      ${work.records_requests.length === 0 ? workflowEmpty("No local records requests have been created yet.") : work.records_requests.map((request) => `
        <article class="workflow-record">
          <span class="status-warn">${request.status}</span>
          <h3>${request.requester}</h3>
          <p>${request.summary}</p>
          <small>Due ${request.deadline} · ${request.citations.length} citations · ${request.exports.length} exports</small>
        </article>
      `).join("")}
    </section>
  `;
}

function renderPublicCodeWorkflow() {
  const sources = publicCodeSources(cityWork());
  return `
    <section class="page-heading">
      <p class="eyebrow">Resident/Public</p>
      <h2>Municipal Code Search</h2>
      <p>Published code sources appear with citations. Staff handoffs and draft guidance stay in the Staff surface.</p>
    </section>
    <section class="workflow-list">
      ${sources.length === 0 ? workflowEmpty("No published municipal code sources are available yet.") : sources.map((source) => `
        <article class="workflow-record">
          <span class="status-ok">${source.public_status}</span>
          <h3>${source.title}</h3>
          <p>${source.body}</p>
          <small>${source.citation} - ${source.public_exports?.length || 0} public exports</small>
        </article>
      `).join("")}
    </section>
  `;
}

function renderCodeWorkflow() {
  if (isPublicSurface()) return renderPublicCodeWorkflow();
  const work = cityWork();
  return `
    <section class="page-heading">
      <p class="eyebrow">${state.activeSurface}</p>
      <h2>Code & Ordinances</h2>
      <p>Import local code sources with citation text and create clerk handoffs for ordinance or resolution work.</p>
    </section>
    <section class="workflow-editor">
      <div class="workflow-form">
        <h3>Import Code Source</h3>
        <label>Source title <input type="text" data-work-field="codeTitle" value="${state.workDraft.codeTitle}" /></label>
        <label>Citation <input type="text" data-work-field="codeCitation" value="${state.workDraft.codeCitation}" /></label>
        <label>Source text <textarea data-work-field="codeBody">${state.workDraft.codeBody}</textarea></label>
        <div class="workflow-actions">
          <button type="button" class="primary-action" data-work-action="import-code-source">Import Source</button>
          <button type="button" class="secondary-action" data-work-action="publish-code-source">Publish Source</button>
          <button type="button" class="secondary-action" data-work-action="unpublish-code-source">Unpublish Source</button>
        </div>
      </div>
      <div class="workflow-form">
        <h3>Clerk Handoff</h3>
        <label>Handoff summary <textarea data-work-field="handoffSummary">${state.workDraft.handoffSummary}</textarea></label>
        <button type="button" class="secondary-action" data-work-action="create-code-handoff">Create Clerk Handoff</button>
      </div>
    </section>
    ${renderWorkActionResult()}
    <section class="workflow-list">
      ${work.code_sources.length === 0 ? workflowEmpty("No local code sources have been imported yet.") : work.code_sources.map((source) => `
        <article class="workflow-record">
          <span class="status-ok">${source.status}</span>
          <h3>${source.title}</h3>
          <p>${source.body}</p>
          <small>${source.citation} - ${source.public_status || "internal draft"} - ${source.public_exports?.length || 0} public exports</small>
        </article>
      `).join("")}
      ${work.code_handoffs.map((handoff) => `
        <article class="workflow-record handoff">
          <span class="status-warn">${handoff.status}</span>
          <h3>${handoff.title}</h3>
          <p>${handoff.summary}</p>
        </article>
      `).join("")}
    </section>
  `;
}

function localSearchResults(query, { publicOnly = false } = {}) {
  const normalized = query.trim().toLowerCase();
  const work = cityWork();
  if (!normalized) return [];
  const results = [];
  const meetings = publicOnly ? publicMeetings(work) : work.meetings;
  meetings.forEach((meeting) => {
    const agendaTitles = (meeting.agenda_items || []).map((item) => item.title).join(" ");
    const outcomes = (meeting.votes || []).join(" ");
    const actionItems = (meeting.action_items || []).join(" ");
    const residentComments = (meeting.resident_comments || []).join(" ");
    if ([meeting.title, meeting.summary, meeting.status, meeting.minutes, agendaTitles, outcomes, actionItems, residentComments].some((value) => String(value || "").toLowerCase().includes(normalized))) {
      results.push({ module_id: "civicclerk", title: meeting.title, snippet: meeting.summary, citation: `Meeting ${meeting.meeting_date}`, status: meeting.status });
    }
  });
  const recordsRequests = publicOnly ? publicRecordsRequests(work) : work.records_requests;
  recordsRequests.forEach((request) => {
    if ([request.requester, request.summary, request.status].some((value) => String(value || "").toLowerCase().includes(normalized))) {
      results.push({ module_id: "civicrecords-ai", title: `Records request: ${request.requester}`, snippet: request.summary, citation: request.citations[0] || "Local records request", status: request.status });
    }
  });
  const codeSources = publicOnly ? publicCodeSources(work) : work.code_sources;
  codeSources.forEach((source) => {
    if ([source.title, source.citation, source.body].some((value) => String(value || "").toLowerCase().includes(normalized))) {
      results.push({ module_id: "civiccode", title: source.title, snippet: source.body, citation: source.citation, status: source.status });
    }
  });
  return results;
}

function renderSearchWorkflow() {
  const publicOnly = isPublicSurface();
  const results = state.searchResults.length > 0 && !publicOnly ? state.searchResults : localSearchResults(state.workDraft.searchQuery, { publicOnly });
  return `
    <section class="page-heading">
      <p class="eyebrow">${state.activeSurface}</p>
      <h2>Search City Knowledge</h2>
      <p>${publicOnly ? "Search public meeting materials, released records, and published code sources." : "Search local meetings, records requests, and imported code sources with citations and owning module labels."}</p>
    </section>
    ${publicOnly ? "" : `<section class="workflow-editor single">
      <div class="workflow-form">
        <h3>Local Search</h3>
        <label>Search terms <input type="search" data-work-field="searchQuery" value="${state.workDraft.searchQuery}" /></label>
        <button type="button" class="primary-action" data-work-action="search-city-knowledge">Search Local Data</button>
      </div>
    </section>`}
    ${publicOnly ? `<section class="workflow-editor single">
      <div class="workflow-form">
        <h3>Public Search</h3>
        <label>Search terms <input type="search" data-work-field="searchQuery" value="${state.workDraft.searchQuery}" /></label>
      </div>
    </section>` : ""}
    ${renderWorkActionResult()}
    <section class="workflow-list">
      ${results.length === 0 ? workflowEmpty("No local search results yet.") : results.map((result) => `
        <article class="workflow-record">
          <span class="status-ok">${result.module_id}</span>
          <h3>${result.title}</h3>
          <p>${result.snippet || "No snippet available."}</p>
          <small>${result.citation} · ${result.status}</small>
        </article>
      `).join("")}
    </section>
  `;
}

function renderModuleRow(module) {
  const proofCount = module.proof_required?.length || 0;
  return `
    <article class="module-row">
      <div>
        <h3>${module.display_name}</h3>
        <p>${module.role}</p>
      </div>
      <div class="module-meta">
        <span class="${moduleStatusClass(module)}">${moduleStatusLabel(module)}</span>
        <small>${module.version || "No release yet"}${proofCount ? ` - ${proofCount} proof checks` : ""}</small>
      </div>
    </article>
  `;
}

function renderModules() {
  const installed = state.app.modules.filter((module) => module.installed || module.required);
  const selection = state.app.module_selection || fallbackState.module_selection;
  const admin = (state.app.users || [])[0];
  return `
    <section class="page-heading">
      <p class="eyebrow">Settings</p>
      <h2>Settings</h2>
      <p>The module manager shares this screen with the local city profile, first admin, and installed City Core package on this Windows machine.</p>
    </section>
    <section class="workflow-editor">
      <div class="workflow-form">
        <h3>City Profile</h3>
        <label>City name <input type="text" data-setup-field="cityName" value="${state.setupDraft.cityName}" autocomplete="organization" /></label>
        <label>State <input type="text" data-setup-field="state" value="${state.setupDraft.state}" autocomplete="address-level1" /></label>
        <label>Time zone <input type="text" data-setup-field="timeZone" value="${state.setupDraft.timeZone}" /></label>
        <label>Records contact <input type="email" data-setup-field="recordsContact" value="${state.setupDraft.recordsContact}" autocomplete="email" /></label>
        <label>Clerk contact <input type="email" data-setup-field="clerkContact" value="${state.setupDraft.clerkContact}" autocomplete="email" /></label>
        <button type="button" class="primary-action" data-first-run-action="create-city-profile" data-step-id="city-profile">Save City Profile</button>
      </div>
      <div class="workflow-form">
        <h3>First Admin</h3>
        <label>Admin name <input type="text" data-setup-field="adminName" value="${state.setupDraft.adminName}" autocomplete="name" /></label>
        <label>Admin email <input type="email" data-setup-field="adminEmail" value="${state.setupDraft.adminEmail}" autocomplete="email" /></label>
        <label>Local passcode <input type="password" data-setup-field="adminPasscode" value="${state.setupDraft.adminPasscode}" autocomplete="new-password" /></label>
        <div class="module-meta">
          <span class="${admin ? "status-ok" : "status-warn"}">${admin ? admin.role : "Needed"}</span>
        </div>
        <button type="button" class="secondary-action" data-first-run-action="create-admin" data-step-id="first-admin">Save First Admin</button>
      </div>
    </section>
    ${renderActionResult()}
    <section class="page-heading compact-heading">
      <p class="eyebrow">Module Manager</p>
      <h2>City Core Modules</h2>
      <p>CivicCore stays installed and product modules are managed through the City Core package.</p>
    </section>
    <section class="module-columns">
      <div>
        <div class="section-title">
          <h3>City Core Package</h3>
          <p>Installed for the ${selection.profile_label} local profile.</p>
        </div>
        <div class="empty-note">
          Selected profile: ${selection.profile_label}. Installed modules: ${selection.installed_module_ids.length}.
        </div>
        <div class="module-list">${installed.map(renderModuleRow).join("")}</div>
      </div>
      <div>
        <div class="section-title">
          <h3>Module Slots</h3>
          <p>Additional city modules will appear here after your city enables their installation package.</p>
        </div>
        <div class="empty-note">
          CivicCore, CivicRecords AI, CivicClerk, and CivicCode are active in this package.
        </div>
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
    <section class="section-band lifecycle-panel" aria-label="Local lifecycle actions">
      <div class="section-title">
        <p class="eyebrow">Local profile lifecycle</p>
        <h3>Backup, Restore, Uninstall</h3>
        <p>These actions work on the local CivicSuite city profile. Uninstall creates a final backup before removing local data and setup state.</p>
      </div>
      <div class="health-actions lifecycle-actions">
        <button type="button" class="secondary-action" data-supervisor-action="backup">Backup Now</button>
        <button type="button" class="secondary-action" data-supervisor-action="restore">Restore Latest Backup</button>
        <button type="button" class="secondary-action" data-supervisor-action="uninstall">Prepare Uninstall</button>
      </div>
    </section>
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
  const access = accessState();
  if (state.activeArea !== "home" && access.configured && !access.signed_in && !isPublicReadableArea()) {
    return renderAccessPanel();
  }
  switch (state.activeArea) {
    case "meetings":
      return renderMeetingsWorkflow();
    case "records":
      return renderRecordsWorkflow();
    case "code":
      return renderCodeWorkflow();
    case "search":
      return renderSearchWorkflow();
    case "health":
      return renderHealth();
    case "settings":
      return renderModules();
    default:
      return renderHome();
  }
}

function renderAuditDrawer() {
  const entries = cityWork().audit_entries || [];
  return `
    <aside class="audit-drawer ${state.auditOpen ? "open" : ""}" aria-hidden="${!state.auditOpen}">
      <div class="section-title">
        <h2>Audit Trail</h2>
        <p>Local workflow actions record module, action, time, and summary in the Windows data profile.</p>
      </div>
      ${entries.length === 0 ? `
        <div class="audit-entry">
          <span class="status-muted">No entries</span>
          <p>No local workflow actions have been recorded yet.</p>
        </div>
      ` : entries.slice(0, 12).map((entry) => `
        <div class="audit-entry">
          <span class="status-ok">${entry.module_id}</span>
          <p><strong>${entry.action}</strong></p>
          <p>${entry.summary}</p>
          <small>${new Date(entry.created_at_unix_seconds * 1000).toLocaleString()}</small>
          ${entry.entry_hash ? `<small>Audit hash ${entry.entry_hash.slice(0, 12)}${entry.previous_hash ? `; previous ${entry.previous_hash.slice(0, 12)}` : ""}</small>` : ""}
        </div>
      `).join("")}
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
  document.querySelectorAll("[data-access-field]").forEach((input) => {
    input.addEventListener("input", () => {
      state.accessDraft[input.dataset.accessField] = input.value;
    });
  });
  document.querySelectorAll("[data-auth-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      await handleAuthAction(button.dataset.authAction);
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
  document.querySelectorAll("[data-work-field]").forEach((input) => {
    input.addEventListener("input", () => {
      state.workDraft[input.dataset.workField] = input.value;
      if (input.dataset.workField === "searchQuery") {
        state.searchResults = [];
      }
    });
  });
  document.querySelectorAll("[data-work-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      await handleCityWorkAction(button.dataset.workAction);
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
      adminEmail: state.setupDraft.adminEmail,
      adminPasscode: state.setupDraft.adminPasscode
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

function authPayloadForAction(action) {
  if (action === "sign-in") {
    return {
      email: state.accessDraft.email,
      passcode: state.accessDraft.passcode
    };
  }
  return {};
}

async function handleAuthAction(action) {
  if (!hasTauriBridge()) {
    state.authActionResult = {
      accepted: false,
      status: "Desktop app required",
      message: "Local access is managed by the Windows desktop app, not the browser preview.",
      next_action: "Open the CivicSuite desktop app to sign in."
    };
    render();
    return;
  }
  try {
    state.authActionResult = await invoke("auth_action", {
      action,
      payload: authPayloadForAction(action)
    });
    state.accessDraft.passcode = "";
    await loadAppState();
  } catch (error) {
    state.authActionResult = {
      accepted: false,
      status: "Needs attention",
      message: String(error),
      next_action: "Check the email and local administrator passcode, then try again."
    };
  }
  render();
}

function workPayloadForAction(action) {
  const draft = state.workDraft;
  const payloads = {
    "create-meeting": {
      title: draft.meetingTitle,
      meetingDate: draft.meetingDate,
      summary: draft.meetingSummary,
      agendaTitle: draft.agendaTitle
    },
    "add-agenda-item": { agendaTitle: draft.agendaTitle },
    "record-minutes": { minutes: draft.minutes },
    "record-vote": { vote: draft.vote },
    "add-action-item": { actionItem: draft.actionItem },
    "record-resident-comment": { residentComment: draft.residentComment },
    "adopt-minutes": {},
    "archive-meeting": {},
    "create-records-request": {
      requester: draft.requester,
      summary: draft.recordsSummary,
      deadline: draft.deadline
    },
    "draft-records-response": {
      responseDraft: draft.responseDraft,
      citation: draft.citation
    },
    "import-code-source": {
      title: draft.codeTitle,
      citation: draft.codeCitation,
      body: draft.codeBody
    },
    "publish-code-source": {},
    "unpublish-code-source": {},
    "create-code-handoff": { summary: draft.handoffSummary },
    "search-city-knowledge": { query: draft.searchQuery }
  };
  return payloads[action] || {};
}

async function handleCityWorkAction(action) {
  if (action === "search-city-knowledge" && !hasTauriBridge()) {
    state.searchResults = localSearchResults(state.workDraft.searchQuery);
    state.workActionResult = {
      accepted: true,
      status: "Search complete",
      message: "Browser preview searched the local preview state. The desktop app records search audit events.",
      next_action: "Open a result or refine the search terms."
    };
    render();
    return;
  }
  if (!hasTauriBridge()) {
    state.workActionResult = {
      accepted: false,
      status: "Desktop app required",
      message: "City workflow changes are saved by the Windows desktop app, not the browser preview.",
      next_action: "Open the CivicSuite desktop app to save local city work."
    };
    render();
    return;
  }
  try {
    const result = await invoke("city_work_action", {
      action,
      payload: workPayloadForAction(action)
    });
    state.workActionResult = result;
    state.app.city_work = result.state;
    state.searchResults = result.search_results || [];
  } catch (error) {
    state.workActionResult = {
      accepted: false,
      status: "Needs attention",
      message: String(error),
      next_action: "Review the required fields and try again."
    };
  }
  render();
}

await loadAppState();
render();
