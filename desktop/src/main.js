import { invoke } from "@tauri-apps/api/core";
import "./styles.css";

const LOCKED_FOUNDATION_MODULE_ID = "civiccore";
const CITY_CORE_PRODUCT_MODULE_IDS = ["civicrecords-ai", "civicclerk", "civiccode"];
const MODULE_AREA_BY_ID = {
  meetings: "civicclerk",
  records: "civicrecords-ai",
  code: "civiccode"
};

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
      installed: true,
      enabled: true,
      contract_ready: true,
      blocked_reason: null,
      lifecycle_install: "always-installed-with-profile",
      lifecycle_update: "manifest-versioned",
      lifecycle_disable: "not-allowed-required-foundation",
      lifecycle_uninstall: "backup-first-profile-removal"
    },
    {
      id: "civicrecords-ai",
      display_name: "CivicRecords AI",
      role: "records workflow",
      version: "1.7.3",
      civiccore_requirement: "1.2.0",
      required: false,
      selectable: true,
      installed: true,
      enabled: true,
      contract_ready: true,
      blocked_reason: null,
      dependencies: ["civiccore"],
      route_count: 2,
      service_count: 2,
      task_count: 6,
      model_required: true,
      lifecycle_install: "profile-selected",
      lifecycle_update: "manifest-versioned",
      lifecycle_disable: "allowed-after-backup",
      lifecycle_uninstall: "backup-first-module-data-removal"
    },
    {
      id: "civicclerk",
      display_name: "CivicClerk",
      role: "meetings workflow",
      version: "1.0.4",
      civiccore_requirement: "1.2.0",
      required: false,
      selectable: true,
      installed: true,
      enabled: true,
      contract_ready: true,
      blocked_reason: null,
      dependencies: ["civiccore"],
      route_count: 2,
      service_count: 2,
      task_count: 6,
      model_required: true,
      lifecycle_install: "profile-selected",
      lifecycle_update: "manifest-versioned",
      lifecycle_disable: "allowed-after-backup",
      lifecycle_uninstall: "backup-first-module-data-removal"
    },
    {
      id: "civiccode",
      display_name: "CivicCode",
      role: "municipal code",
      version: "1.0.8",
      civiccore_requirement: "1.2.0",
      required: false,
      selectable: true,
      installed: true,
      enabled: true,
      contract_ready: true,
      blocked_reason: null,
      dependencies: ["civiccore"],
      route_count: 2,
      service_count: 2,
      task_count: 4,
      model_required: true,
      lifecycle_install: "profile-selected",
      lifecycle_update: "manifest-versioned",
      lifecycle_disable: "allowed-after-backup",
      lifecycle_uninstall: "backup-first-module-data-removal"
    },
    {
      id: "civiczone",
      display_name: "CivicZone",
      role: "zoning workflow",
      version: "0.2.2",
      required: false,
      selectable: true,
      installed: false,
      enabled: false,
      contract_ready: false,
      blocked_reason: "Module civiczone must target CivicCore 1.2.0 for Windows Local 1.0",
      route_count: 0,
      service_count: 0,
      task_count: 0,
      model_required: true
    }
  ],
  module_profiles: [
    {
      id: "minimal",
      label: "Minimal",
      description: "CivicCore only",
      selected: false,
      disabled: false,
      module_count: 1
    },
    {
      id: "city-core",
      label: "City Core",
      description: "CivicCore, CivicRecords AI, CivicClerk, and CivicCode",
      selected: true,
      disabled: false,
      module_count: 4
    },
    {
      id: "full-suite",
      label: "Full Suite",
      description: "All tracked CivicSuite modules after CivicCore",
      selected: false,
      disabled: true,
      disabled_reason: "Held until all module packages pass proof.",
      module_count: 28
    }
  ],
  module_selection: {
    profile_id: "city-core",
    profile_label: "City Core",
    installed_module_ids: ["civiccore", "civicrecords-ai", "civicclerk", "civiccode"],
    enabled_module_ids: ["civiccore", "civicrecords-ai", "civicclerk", "civiccode"],
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
    audit_entries: [],
    publication_events: []
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
  publicRecordsLookup: {
    trackingNumber: "",
    requesterContact: "",
    found: false
  },
  pendingSupervisorReviewAction: null,
  pendingSupervisorReviewServiceId: null,
  pendingWorkReviewAction: null,
  workSelection: {
    meetingId: "",
    publicCommentId: "",
    recordsRequestId: "",
    codeSourceId: "",
    codeHandoffId: ""
  },
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
  moduleDraft: {
    profileId: "city-core",
    selectedModuleIds: [...CITY_CORE_PRODUCT_MODULE_IDS]
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
    publicCommentMeetingId: "",
    publicCommentName: "",
    publicCommentContact: "",
    publicCommentMode: "written",
    publicCommentTopic: "",
    publicCommentBody: "",
    publicCommentRedactedBody: "",
    publicCommentRedactionBasis: "",
    requester: "",
    publicRequester: "",
    publicRequesterContact: "",
    publicRecordsSummary: "",
    publicRequestLookup: "",
    publicRequestContact: "",
    recordsSummary: "",
    deadline: "",
    assignedTo: "",
    clarificationNote: "",
    sourceNote: "",
    exemptionNote: "",
    feeEstimate: "",
    responseDraft: "",
    citation: "",
    approvalNote: "",
    codeTitle: "",
    codeCitation: "",
    codeBody: "",
    codifierName: "",
    authoritativeUrl: "",
    versionLabel: "",
    syncError: "",
    amendmentNote: "",
    guidanceDraft: "",
    summaryDraft: "",
    handoffSummary: "",
    codeQuestion: "",
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
    hydrateModuleDraftFromApp();
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

function productModuleIdsFromSelection(selection) {
  return (selection?.installed_module_ids || [])
    .filter((moduleId) => moduleId !== LOCKED_FOUNDATION_MODULE_ID);
}

function hydrateModuleDraftFromApp() {
  const selection = state.app.module_selection || fallbackState.module_selection;
  const productModuleIds = productModuleIdsFromSelection(selection);
  state.moduleDraft.profileId = selection.profile_id === "custom" ? "custom" : "city-core";
  state.moduleDraft.selectedModuleIds =
    productModuleIds.length > 0 ? productModuleIds : [...CITY_CORE_PRODUCT_MODULE_IDS];
}

function isWindowsLocalReadyProductModule(module) {
  return Boolean(
    module &&
    !module.required &&
    module.selectable &&
    module.contract_ready
  );
}

function customSelectedModuleIds() {
  const readyIds = new Set(
    state.app.modules
      .filter(isWindowsLocalReadyProductModule)
      .map((module) => module.id)
  );
  return state.moduleDraft.selectedModuleIds.filter((moduleId) => readyIds.has(moduleId));
}

function moduleSelectionPayload() {
  if (state.moduleDraft.profileId === "custom") {
    return {
      profileId: "custom",
      selectedModuleIds: customSelectedModuleIds()
    };
  }
  return { profileId: "city-core" };
}

function hasTauriBridge() {
  return "__TAURI_INTERNALS__" in window;
}

function accessState() {
  return state.app.access || fallbackState.access;
}

function moduleById(moduleId) {
  return (state.app.modules || []).find((module) => module.id === moduleId) || null;
}

function moduleIsEnabled(moduleId) {
  const module = moduleById(moduleId);
  return Boolean(module && (module.installed || module.required) && module.enabled !== false);
}

function areaIsEnabled(areaId) {
  if (["home", "health", "settings"].includes(areaId)) return true;
  if (areaId === "search") {
    return CITY_CORE_PRODUCT_MODULE_IDS.some((moduleId) => moduleIsEnabled(moduleId));
  }
  const moduleId = MODULE_AREA_BY_ID[areaId];
  return moduleId ? moduleIsEnabled(moduleId) : true;
}

function visibleNavigationItems() {
  return (state.app.navigation || fallbackState.navigation).filter((item) => areaIsEnabled(item.id));
}

function moduleStatusLabel(module) {
  if (module.required) return "Required";
  if (module.installed && module.enabled === false) return "Disabled";
  if (module.installed) return "Enabled";
  if (module.selectable) return "Package waiting";
  return "Locked";
}

function moduleStatusClass(module) {
  if (module.required) return "status-ok";
  if (module.installed && module.enabled === false) return "status-muted";
  if (module.installed) return "status-ok";
  if (module.selectable) return "status-muted";
  return "status-muted";
}

function profileStatusLabel(profile) {
  if (profile.selected) return "Installed";
  if (profile.disabled) return "Queued";
  return "Profile option";
}

function profileStatusClass(profile) {
  if (profile.selected) return "status-ok";
  if (profile.disabled) return "status-muted";
  return "status-warn";
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
      ${visibleNavigationItems().map((item) => `
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
  const primaryTasks = visibleNavigationItems()
    .filter((item) => item.id !== "home" && item.id !== "settings")
    .slice(0, 5);
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
      ${primaryTasks.map((item) => `
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
    "select-modules": state.moduleDraft.profileId === "custom" ? "Save Module Selection" : "Use City Core Modules",
    "download-model": "Download / Resume Model",
    "create-city-profile": "Save city profile",
    "create-admin": "Save first admin",
    "choose-backup": "Create backup folder",
    "verify-health": "Set Up Services and Model",
    "open-app": "Finish setup"
  };
  return labels[step.action] || "Continue setup";
}

function renderModuleSelectionControls() {
  const modules = state.app.modules || [];
  const foundation = modules.find((module) => module.id === LOCKED_FOUNDATION_MODULE_ID);
  const productModules = modules.filter((module) => !module.required);
  const selectedIds = new Set(state.moduleDraft.selectedModuleIds);
  const customMode = state.moduleDraft.profileId === "custom";
  const readySelectedCount = customSelectedModuleIds().length;
  const profileChoices = [
    {
      id: "city-core",
      label: "City Core",
      description: "Installs CivicRecords AI, CivicClerk, and CivicCode with CivicCore."
    },
    {
      id: "custom",
      label: "Custom",
      description: "Choose ready product modules. CivicCore is always included."
    }
  ];
  return `
    <div class="module-selection-panel" aria-label="Module selection">
      <div class="profile-choice-grid" role="radiogroup" aria-label="Module profile">
        ${profileChoices.map((profile) => `
          <label class="profile-choice ${state.moduleDraft.profileId === profile.id ? "selected" : ""}">
            <input
              type="radio"
              name="module-profile"
              value="${profile.id}"
              data-module-profile-id="${profile.id}"
              ${state.moduleDraft.profileId === profile.id ? "checked" : ""}
            />
            <span>
              <strong>${escapeHtml(profile.label)}</strong>
              <small>${escapeHtml(profile.description)}</small>
            </span>
          </label>
        `).join("")}
      </div>
      <div class="module-choice-list" aria-label="Choose product modules">
        ${foundation ? `
          <label class="module-choice locked">
            <input type="checkbox" checked disabled />
            <span>
              <strong>${escapeHtml(foundation.display_name)}</strong>
              <small>Required foundation. CivicCore cannot be removed.</small>
            </span>
          </label>
        ` : ""}
        ${productModules.map((module) => {
          const ready = isWindowsLocalReadyProductModule(module);
          const checked = customMode ? selectedIds.has(module.id) : CITY_CORE_PRODUCT_MODULE_IDS.includes(module.id);
          const disabled = !customMode || !ready;
          const status = ready ? "Ready for Windows Local 1.0" : "Not ready for Windows Local 1.0";
          const blockedReason = !ready && module.blocked_reason ? `: ${module.blocked_reason}` : "";
          return `
            <label class="module-choice ${checked ? "selected" : ""} ${disabled ? "disabled" : ""}">
              <input
                type="checkbox"
                data-module-toggle="${escapeHtml(module.id)}"
                ${checked ? "checked" : ""}
                ${disabled ? "disabled" : ""}
              />
              <span>
                <strong>${escapeHtml(module.display_name)}</strong>
                <small>${escapeHtml(module.role)} - ${status}${escapeHtml(blockedReason)}</small>
              </span>
            </label>
          `;
        }).join("")}
      </div>
      <p class="empty-note">
        ${customMode
          ? `Custom selection will install CivicCore plus ${readySelectedCount} selected product module${readySelectedCount === 1 ? "" : "s"}.`
          : "City Core installs the complete current 1.0 package: CivicRecords AI, CivicClerk, and CivicCode."}
      </p>
    </div>
  `;
}

function renderSetupFields(step) {
  if (!step.current) return "";
  if (step.id === "modules") {
    return renderModuleSelectionControls();
  }
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

function setupActionLockedByAdmin() {
  const access = accessState();
  return access.configured && !access.signed_in;
}

function renderFirstRunStep(step, index) {
  const adminLocked = step.current && setupActionLockedByAdmin();
  const moduleSelectionLocked =
    step.current &&
    step.id === "modules" &&
    state.moduleDraft.profileId === "custom" &&
    customSelectedModuleIds().length === 0;
  const actionLocked = adminLocked || moduleSelectionLocked;
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
            <button type="button" class="primary-action" data-first-run-action="${step.action}" data-step-id="${step.id}" ${actionLocked ? "disabled" : ""}>
              ${setupActionLabel(step)}
            </button>
            ${adminLocked ? `<small>Sign in with the local administrator passcode before continuing setup.</small>` : ""}
            ${moduleSelectionLocked ? `<small>Select at least one ready product module for a custom profile.</small>` : ""}
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
        <p>Use the local administrator passcode before changing city work, setup, model setup, settings, backups, restore, repair, or runtime services.</p>
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
  const access = accessState();
  const needsAdmin = access.configured && !access.signed_in;
  const adminDisabled = needsAdmin ? "disabled" : "";
  return `
    <div class="model-actions" aria-label="Local model setup actions">
      <button type="button" class="secondary-action" data-model-action="open-model-folder" ${adminDisabled}>
        Open Model Folder
      </button>
      <button type="button" class="primary-action" data-model-action="${model.download_resumable ? "resume-download" : "download"}" ${adminDisabled}>
        ${model.download_resumable ? "Download / Resume" : "Download Model"}
      </button>
      <button type="button" class="secondary-action" data-model-action="verify-checksum" ${adminDisabled}>
        Verify Checksum
      </button>
      <button type="button" class="secondary-action" data-model-action="load-runtime-model" ${adminDisabled}>
        Load in Ollama
      </button>
      <button type="button" class="secondary-action" data-model-action="retry" ${adminDisabled}>
        Retry Setup
      </button>
      ${needsAdmin ? `<small>Sign in as local administrator to change local model setup.</small>` : ""}
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

function exportFolderForActiveArea() {
  if (state.activeArea === "meetings") return "meetings";
  if (state.activeArea === "records") return "records";
  if (state.activeArea === "code") return "code";
  return "all";
}

function workflowEmpty(label) {
  return `<p class="empty-note">${label}</p>`;
}

const GUIDED_WORK_ACTIONS = new Set([
  "add-code-handoff-agenda",
  "post-notice",
  "export-meeting-packet",
  "review-public-comment",
  "redact-public-comment",
  "adopt-minutes",
  "archive-meeting",
  "approve-records-response",
  "export-records-response",
  "fulfill-records-request",
  "close-records-request",
  "approve-code-guidance",
  "publish-code-source",
  "unpublish-code-source",
  "create-code-handoff"
]);

const GUIDED_SUPERVISOR_ACTIONS = new Set([
  "backup",
  "restore",
  "uninstall",
  "repair",
  "stop"
]);

function selectedFrom(collection, selectedId) {
  return collection.find((record) => record.id === selectedId) || collection[0] || null;
}

function currentMeeting(work = cityWork()) {
  return selectedFrom(work.meetings || [], state.workSelection.meetingId);
}

function currentPublicComment(work = cityWork()) {
  const meeting = currentMeeting(work);
  return selectedFrom(meeting?.public_comments || [], state.workSelection.publicCommentId);
}

function currentRecordsRequest(work = cityWork()) {
  return selectedFrom(work.records_requests || [], state.workSelection.recordsRequestId);
}

function currentCodeSource(work = cityWork()) {
  return selectedFrom(work.code_sources || [], state.workSelection.codeSourceId);
}

function currentCodeHandoff(work = cityWork()) {
  const handoffs = work.code_handoffs || [];
  return handoffs.find((handoff) => handoff.id === state.workSelection.codeHandoffId) ||
    handoffs.find((handoff) => handoff.status !== "sent to clerk agenda") ||
    handoffs[0] ||
    null;
}

function detailOrFallback(value, fallback) {
  return value ? value : fallback;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[character]);
}

function guidedReviewForAction(action) {
  const work = cityWork();
  const meeting = currentMeeting(work);
  const publicComment = currentPublicComment(work);
  const request = currentRecordsRequest(work);
  const source = currentCodeSource(work);
  const handoff = currentCodeHandoff(work);
  const meetingSubject = meeting ? `${meeting.title} (${meeting.meeting_date})` : "Current meeting";
  const publicCommentSubject = publicComment ? `${publicComment.commenter_name}: ${publicComment.topic || "Public comment"}` : "Current public comment";
  const requestSubject = request ? `${request.requester}: ${request.summary}` : "Current records request";
  const sourceSubject = source ? `${source.title} (${source.citation})` : "Current code source";
  const handoffSubject = handoff ? handoff.title : "Current code handoff";
  const reviews = {
    "add-code-handoff-agenda": {
      title: "Review Before Adding Code Handoff",
      confirmLabel: "Add Code Handoff",
      module: "CivicClerk + CivicCode",
      subject: handoffSubject,
      status: handoff ? handoff.status : "No pending code handoff selected yet.",
      changes: "Adds the pending CivicCode ordinance or resolution handoff to the current meeting agenda.",
      visibility: "Staff agenda draft only until notice, packet, or archive steps make meeting material public.",
      sources: [
        detailOrFallback(handoff?.summary, "No handoff summary is available yet."),
        meeting ? `Target meeting: ${meetingSubject}` : "The desktop app will require a meeting before saving."
      ],
      audit: "Creates a CivicClerk audit entry for adding the code handoff to the agenda.",
      retry: "If no handoff or meeting exists, the desktop app stops before changing local records."
    },
    "post-notice": {
      title: "Review Before Posting Notice",
      confirmLabel: "Mark Notice Ready",
      module: "CivicClerk",
      subject: meetingSubject,
      status: meeting ? `${meeting.status}; ${meeting.notice_status}` : "No meeting selected yet.",
      changes: "Marks the current meeting notice as ready for public posting.",
      visibility: "Resident/Public meeting materials can show posted notice information.",
      sources: [
        meeting ? `${(meeting.agenda_items || []).length} agenda item(s)` : "The desktop app will require a meeting before saving.",
        detailOrFallback(meeting?.summary, "No meeting summary has been recorded yet.")
      ],
      audit: "Creates a CivicClerk audit entry for posting the notice.",
      retry: "If required meeting details are missing, the desktop app shows the issue and leaves the notice unchanged."
    },
    "export-meeting-packet": {
      title: "Review Before Exporting Packet",
      confirmLabel: "Export Packet",
      module: "CivicClerk",
      subject: meetingSubject,
      status: meeting ? meeting.status : "No meeting selected yet.",
      changes: "Writes a local packet export from the meeting agenda, minutes, votes, action items, and comments.",
      visibility: "Exported packet material remains local staff work unless later posted or archived.",
      sources: [
        meeting ? `${(meeting.agenda_items || []).length} agenda item(s); ${(meeting.votes || []).length} recorded outcome(s)` : "The desktop app will require a meeting before saving.",
        detailOrFallback(meeting?.minutes, "No minutes draft has been saved yet.")
      ],
      audit: "Creates a CivicClerk audit entry for the packet export.",
      retry: "If the export path is unavailable, the desktop app reports the failure and preserves the meeting record."
    },
    "adopt-minutes": {
      title: "Review Before Adopting Minutes",
      confirmLabel: "Adopt Minutes",
      module: "CivicClerk",
      subject: meetingSubject,
      status: meeting ? meeting.status : "No meeting selected yet.",
      changes: "Marks the current minutes as adopted and unlocks the public archive step.",
      visibility: "Adopted minutes remain local staff records until archive/publication.",
      sources: [
        detailOrFallback(meeting?.minutes, "No minutes draft has been saved yet."),
        meeting ? `${(meeting.votes || []).length} vote or motion record(s)` : "The desktop app will require a meeting before saving."
      ],
      audit: "Creates a CivicClerk audit entry for adopting minutes.",
      retry: "If no minutes draft exists, the desktop app blocks adoption and asks staff to save minutes first."
    },
    "archive-meeting": {
      title: "Review Before Archiving Public Record",
      confirmLabel: "Archive Public Record",
      module: "CivicClerk",
      subject: meetingSubject,
      status: meeting ? meeting.status : "No meeting selected yet.",
      changes: "Writes the public archive export, locks later meeting edits, and records a publication event hash.",
      visibility: "Resident/Public meeting materials can show this archived public record.",
      sources: [
        meeting?.minutes_adopted_at_unix_seconds ? "Minutes have been adopted." : "Minutes are not marked adopted yet.",
        meeting ? `${(meeting.exports || []).length} existing export(s)` : "The desktop app will require a meeting before saving."
      ],
      audit: "Creates CivicClerk audit and CivicCore publication-gate entries.",
      retry: "If minutes are not adopted, the desktop app blocks archive and leaves the meeting editable."
    },
    "review-public-comment": {
      title: "Review Before Marking Public Comment Reviewed",
      confirmLabel: "Mark Reviewed",
      module: "CivicClerk",
      subject: publicCommentSubject,
      status: publicComment ? publicComment.status : "No public comment selected yet.",
      changes: "Marks the selected submitted public comment as reviewed for the public record.",
      visibility: "Reviewed comments can be included in packet/archive material and public search for public meetings.",
      sources: [
        publicComment ? detailOrFallback(publicComment.body, "No comment body is recorded.") : "The desktop app will require a submitted comment before saving.",
        meeting ? `Meeting: ${meetingSubject}` : "The desktop app will require a meeting before saving."
      ],
      audit: "Creates a CivicClerk audit entry for public comment review.",
      retry: "If the selected meeting is archived or the comment is missing, the desktop app blocks the review."
    },
    "redact-public-comment": {
      title: "Review Before Redacting Public Comment",
      confirmLabel: "Redact Comment",
      module: "CivicClerk",
      subject: publicCommentSubject,
      status: publicComment ? publicComment.status : "No public comment selected yet.",
      changes: "Stores redacted public text while preserving the original comment internally.",
      visibility: "Public packet/archive material and public search use the redacted text, not the original.",
      sources: [
        detailOrFallback(state.workDraft.publicCommentRedactedBody, "No redacted public text has been typed yet."),
        detailOrFallback(state.workDraft.publicCommentRedactionBasis, "No statutory redaction basis has been typed yet.")
      ],
      audit: "Creates a CivicClerk audit entry with the redaction basis.",
      retry: "If redacted text or statutory basis is missing, the desktop app blocks the redaction."
    },
    "approve-records-response": {
      title: "Review Before Approving Records Response",
      confirmLabel: "Approve Response",
      module: "CivicRecords AI",
      subject: requestSubject,
      status: request ? request.status : "No records request selected yet.",
      changes: "Records human approval for the drafted records response.",
      visibility: "Internal staff status changes to human-approved; nothing is public until export and fulfillment.",
      sources: [
        detailOrFallback(request?.response_draft, "No response draft has been saved yet."),
        request ? `${(request.exemption_reviews || []).length} exemption review note(s); ${(request.citations || []).length} citation(s)` : "The desktop app will require a request before saving."
      ],
      audit: "Creates a CivicRecords AI audit entry for human approval.",
      retry: "If the response draft is missing, the desktop app blocks approval before release steps."
    },
    "export-records-response": {
      title: "Review Before Exporting Records Response",
      confirmLabel: "Export Response",
      module: "CivicRecords AI",
      subject: requestSubject,
      status: request ? request.status : "No records request selected yet.",
      changes: "Writes the approved records response package to the local export folder.",
      visibility: "The export remains local until the request is marked fulfilled.",
      sources: [
        request?.approved_at_unix_seconds ? "Response has human approval." : "Response is not approved yet.",
        request ? `${(request.search_notes || []).length} search note(s); ${(request.approval_notes || []).length} approval note(s)` : "The desktop app will require a request before saving."
      ],
      audit: "Creates a CivicRecords AI audit entry for exporting the response package.",
      retry: "If approval is missing, the desktop app blocks export and keeps the draft internal."
    },
    "fulfill-records-request": {
      title: "Review Before Marking Records Fulfilled",
      confirmLabel: "Mark Fulfilled",
      module: "CivicRecords AI",
      subject: requestSubject,
      status: request ? request.status : "No records request selected yet.",
      changes: "Marks the request fulfilled and records a publication event hash for the released response.",
      visibility: "Resident/Public records status can show the released response metadata.",
      sources: [
        request?.approved_at_unix_seconds ? "Response has human approval." : "Response is not approved yet.",
        request ? `${(request.exports || []).length} export package(s)` : "The desktop app will require a request before saving."
      ],
      audit: "Creates CivicRecords AI audit and CivicCore publication-gate entries.",
      retry: "If approval or export is missing, the desktop app blocks fulfillment."
    },
    "close-records-request": {
      title: "Review Before Closing Records Request",
      confirmLabel: "Close Request",
      module: "CivicRecords AI",
      subject: requestSubject,
      status: request ? request.status : "No records request selected yet.",
      changes: "Closes the request after fulfillment and preserves the request history.",
      visibility: "Closed fulfilled requests remain visible in public records status.",
      sources: [
        request?.fulfilled_at_unix_seconds ? "Request has been fulfilled." : "Request is not fulfilled yet.",
        request ? `Due date: ${request.deadline}` : "The desktop app will require a request before saving."
      ],
      audit: "Creates a CivicRecords AI audit entry for closing the request.",
      retry: "If the request has not been fulfilled, the desktop app blocks closure."
    },
    "approve-code-guidance": {
      title: "Review Before Approving Code Guidance",
      confirmLabel: "Approve Guidance",
      module: "CivicCode",
      subject: sourceSubject,
      status: source ? source.status : "No code source selected yet.",
      changes: "Approves staff guidance and any plain-English summary for public-facing code context.",
      visibility: "Approved summaries can appear with published code sources as non-authoritative guidance.",
      sources: [
        detailOrFallback(source?.staff_guidance, "No guidance draft has been saved yet."),
        detailOrFallback(source?.plain_language_summary, "No plain-English summary has been saved yet.")
      ],
      audit: "Creates a CivicCode audit entry for approving guidance.",
      retry: "If guidance is missing, the desktop app blocks approval and keeps the source internal."
    },
    "publish-code-source": {
      title: "Review Before Publishing Code Source",
      confirmLabel: "Publish Source",
      module: "CivicCode",
      subject: sourceSubject,
      status: source ? `${source.public_status || "internal draft"}; ${source.codifier_sync_status || "not synced"}` : "No code source selected yet.",
      changes: "Writes a public code export and records a publication event hash.",
      visibility: "Resident/Public municipal code search can show the published source and approved non-authoritative summary.",
      sources: [
        source ? `Citation: ${source.citation}` : "The desktop app will require a code source before saving.",
        source?.guidance_approved_at_unix_seconds ? "Guidance has human approval." : "Guidance is not approved; only source text and required disclaimers will publish."
      ],
      audit: "Creates CivicCode audit and CivicCore publication-gate entries.",
      retry: "If required source text is missing, the desktop app blocks publication."
    },
    "unpublish-code-source": {
      title: "Review Before Unpublishing Code Source",
      confirmLabel: "Unpublish Source",
      module: "CivicCode",
      subject: sourceSubject,
      status: source ? source.public_status || "internal draft" : "No code source selected yet.",
      changes: "Returns the source to internal draft status and retracts the latest live publication event.",
      visibility: "Resident/Public municipal code search stops showing this source.",
      sources: [
        source ? `${(source.public_exports || []).length} public export(s) remain in local history.` : "The desktop app will require a code source before saving.",
        "Retraction keeps publication history instead of deleting the prior event."
      ],
      audit: "Creates CivicCode audit and CivicCore retraction metadata.",
      retry: "If no source exists, the desktop app stops before changing local records."
    },
    "create-code-handoff": {
      title: "Review Before Creating Clerk Handoff",
      confirmLabel: "Create Clerk Handoff",
      module: "CivicCode",
      subject: sourceSubject,
      status: source ? source.status : "No code source selected yet.",
      changes: "Creates an internal clerk handoff for ordinance or resolution agenda work.",
      visibility: "Staff-only handoff until the clerk adds it to a meeting agenda and later posts materials.",
      sources: [
        source ? `Citation: ${source.citation}` : "The desktop app will require a code source before saving.",
        detailOrFallback(state.workDraft.handoffSummary, "No handoff summary has been typed yet.")
      ],
      audit: "Creates a CivicCode audit entry for the clerk handoff.",
      retry: "If no source exists, the desktop app blocks handoff creation."
    }
  };
  return reviews[action] || null;
}

function requiresGuidedWorkReview(action) {
  return GUIDED_WORK_ACTIONS.has(action);
}

function renderGuidedWorkReview() {
  const review = guidedReviewForAction(state.pendingWorkReviewAction);
  if (!review) return "";
  return `
    <section class="guided-review" aria-labelledby="guided-review-title">
      <div>
        <p class="eyebrow">${escapeHtml(review.module)}</p>
        <h3 id="guided-review-title">${escapeHtml(review.title)}</h3>
        <p>${escapeHtml(review.subject)}</p>
      </div>
      <div class="review-grid">
        <div>
          <strong>Current status</strong>
          <p>${escapeHtml(review.status)}</p>
        </div>
        <div>
          <strong>What will change</strong>
          <p>${escapeHtml(review.changes)}</p>
        </div>
        <div>
          <strong>Who can see it</strong>
          <p>${escapeHtml(review.visibility)}</p>
        </div>
        <div>
          <strong>Audit trail</strong>
          <p>${escapeHtml(review.audit)}</p>
        </div>
      </div>
      <div>
        <strong>Sources and evidence</strong>
        <ul class="review-evidence">
          ${review.sources.map((source) => `<li>${escapeHtml(source)}</li>`).join("")}
        </ul>
      </div>
      <p class="next-action">${escapeHtml(review.retry)}</p>
      <div class="review-actions">
        <button type="button" class="primary-action" data-review-confirm="${state.pendingWorkReviewAction}">Confirm ${escapeHtml(review.confirmLabel)}</button>
        <button type="button" class="secondary-action" data-review-cancel>Cancel Review</button>
      </div>
    </section>
  `;
}

function isPublicSurface() {
  return state.activeSurface === "Resident/Public";
}

function isPublicReadableArea() {
  return isPublicSurface() && ["home", "meetings", "records", "code", "search"].includes(state.activeArea);
}

function publicCommentView(comment) {
  if (!["reviewed for public record", "redacted for public record"].includes(comment.status)) return null;
  const publicComment = { ...comment, commenter_contact: "" };
  if (publicComment.status === "redacted for public record" && publicComment.redacted_body) {
    publicComment.body = publicComment.redacted_body;
  }
  return publicComment;
}

function publicMeetingView(meeting) {
  const publicArchive = meeting.status === "archived public record" || Boolean(meeting.archived_at_unix_seconds);
  const publicNotice = meeting.notice_status === "public notice ready";
  if (!publicArchive && !publicNotice) return null;
  const publicMeeting = {
    ...meeting,
    public_comments: (meeting.public_comments || []).map(publicCommentView).filter(Boolean)
  };
  if (!publicArchive) {
    publicMeeting.minutes = "";
    publicMeeting.votes = [];
    publicMeeting.action_items = [];
    publicMeeting.resident_comments = [];
    publicMeeting.exports = [];
  }
  return publicMeeting;
}

function publicMeetings(work) {
  return work.meetings.map(publicMeetingView).filter(Boolean);
}

function publicCommentMeetings(work) {
  return publicMeetings(work).filter((meeting) => (
    !meeting.archived_at_unix_seconds &&
    meeting.status !== "archived public record" &&
    (
      meeting.notice_status === "public notice ready" ||
      meeting.status === "public comments received"
    )
  ));
}

function publicReadyCommentCount(meeting) {
  return (meeting.public_comments || []).filter((comment) => (
    comment.status === "reviewed for public record" ||
    comment.status === "redacted for public record"
  )).length;
}

function renderPublicMeetingsWorkflow() {
  const work = cityWork();
  const meetings = publicMeetings(work);
  const commentMeetings = publicCommentMeetings(work);
  const selectedCommentMeetingId = state.workDraft.publicCommentMeetingId || commentMeetings[0]?.id || "";
  return `
    <section class="page-heading">
      <p class="eyebrow">Resident/Public</p>
      <h2>Public Meeting Materials</h2>
      <p>Posted agendas, notices, packets, and approved public outcomes appear here without staff drafting controls.</p>
    </section>
    <section class="workflow-editor">
      <div class="workflow-form">
        <h3>Submit Public Comment</h3>
        <p class="form-help">Written and remote comments become part of the meeting record and are reviewed by the clerk under the city's public comment rules.</p>
        ${commentMeetings.length === 0 ? `<p class="form-help">No posted public meeting is open for comment.</p>` : ""}
        <label>Meeting
          <select data-work-field="publicCommentMeetingId" ${commentMeetings.length === 0 ? "disabled" : ""}>
            ${commentMeetings.length === 0 ? `<option>No meeting available</option>` : commentMeetings.map((meeting) => `
              <option value="${meeting.id}" ${meeting.id === selectedCommentMeetingId ? "selected" : ""}>${meeting.meeting_date} - ${meeting.title}</option>
            `).join("")}
          </select>
        </label>
        <label>Your name <input type="text" data-work-field="publicCommentName" value="${state.workDraft.publicCommentName}" autocomplete="name" /></label>
        <label>Email or phone <input type="text" data-work-field="publicCommentContact" value="${state.workDraft.publicCommentContact}" autocomplete="email" /></label>
        <label>Comment type
          <select data-work-field="publicCommentMode">
            ${["written", "remote", "in-person sign-up"].map((mode) => `<option value="${mode}" ${state.workDraft.publicCommentMode === mode ? "selected" : ""}>${mode}</option>`).join("")}
          </select>
        </label>
        <label>Agenda item or topic <input type="text" data-work-field="publicCommentTopic" value="${state.workDraft.publicCommentTopic}" /></label>
        <label>Comment <textarea data-work-field="publicCommentBody">${state.workDraft.publicCommentBody}</textarea></label>
        ${commentMeetings.length === 0 ? `<button type="button" class="primary-action" disabled>Submit Public Comment</button>` : `<button type="button" class="primary-action" data-work-action="submit-public-comment">Submit Public Comment</button>`}
      </div>
    </section>
    ${renderWorkActionResult()}
    <section class="workflow-list">
      ${meetings.length === 0 ? workflowEmpty("No public meeting materials have been posted yet.") : meetings.map((meeting) => `
        <article class="workflow-record">
          <span class="status-ok">${meeting.status === "archived public record" ? "archived public record" : meeting.notice_status}</span>
          <h3>${meeting.title}</h3>
          <p>${meeting.summary || "No public summary recorded."}</p>
          <small>${meeting.meeting_date} - ${(meeting.agenda_items || []).length} agenda items - ${(meeting.votes || []).length} outcomes - ${publicReadyCommentCount(meeting)} reviewed public comments - ${(meeting.exports || []).length} public exports</small>
        </article>
      `).join("")}
    </section>
  `;
}

function renderMeetingsWorkflow() {
  if (isPublicSurface()) return renderPublicMeetingsWorkflow();
  const work = cityWork();
  const selectedMeeting = currentMeeting(work);
  const selectedPublicComment = currentPublicComment(work);
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
          <button type="button" class="secondary-action" data-work-action="open-exports-folder">Open Exports Folder</button>
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
      <div class="workflow-form">
        <h3>Public Comment Review</h3>
        <p class="form-help">${selectedPublicComment ? `${selectedPublicComment.commenter_name} - ${selectedPublicComment.status}` : "No submitted public comment is selected for review."}</p>
        <label>Redacted public text <textarea data-work-field="publicCommentRedactedBody">${state.workDraft.publicCommentRedactedBody}</textarea></label>
        <label>Statutory redaction basis <input type="text" data-work-field="publicCommentRedactionBasis" value="${state.workDraft.publicCommentRedactionBasis}" /></label>
        <div class="workflow-actions">
          ${selectedPublicComment ? `<button type="button" class="secondary-action" data-work-action="review-public-comment">Mark Reviewed</button>` : `<button type="button" class="secondary-action" disabled>Mark Reviewed</button>`}
          ${selectedPublicComment ? `<button type="button" class="secondary-action" data-work-action="redact-public-comment">Redact Comment</button>` : `<button type="button" class="secondary-action" disabled>Redact Comment</button>`}
        </div>
      </div>
    </section>
    ${renderGuidedWorkReview()}
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
          ${(meeting.public_comments || []).length > 0 ? `<p><strong>Public comments:</strong> ${(meeting.public_comments || []).length} received for clerk review</p>` : ""}
          ${(meeting.public_comments || []).map((comment) => `
            <div class="comment-review-item">
              <strong>${comment.commenter_name}</strong>
              <span>${comment.status}</span>
              <p>${comment.status === "redacted for public record" && comment.redacted_body ? comment.redacted_body : comment.body}</p>
              <div class="record-actions">
                ${selectedPublicComment?.id === comment.id ? `<span class="status-ok">Selected for review</span>` : `<button type="button" class="secondary-action" data-select-work-record="publicComment" data-record-id="${comment.id}" data-parent-meeting-id="${meeting.id}">Review This</button>`}
              </div>
            </div>
          `).join("")}
          <div class="record-actions">
            ${selectedMeeting?.id === meeting.id ? `<span class="status-ok">Selected for actions</span>` : `<button type="button" class="secondary-action" data-select-work-record="meeting" data-record-id="${meeting.id}">Work On This</button>`}
          </div>
          <small>${meeting.meeting_date} - ${meeting.notice_status} - ${(meeting.agenda_items || []).length} agenda items - ${(meeting.votes || []).length} outcomes - ${(meeting.action_items || []).length} action items - ${(meeting.exports || []).length} exports</small>
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

function recordsRequestIsReleased(request) {
  return request.status === "fulfilled" ||
    request.status === "closed" ||
    Boolean(request.fulfilled_at_unix_seconds);
}

function publicRecordsLookupVerifiedFor(request) {
  const lookup = state.workDraft.publicRequestLookup.trim().toLowerCase();
  const requesterContact = state.workDraft.publicRequestContact.trim().toLowerCase();
  return Boolean(
    lookup &&
      requesterContact &&
      state.publicRecordsLookup.found &&
      state.publicRecordsLookup.trackingNumber === lookup &&
      state.publicRecordsLookup.requesterContact === requesterContact &&
      String(request.public_tracking_number || "").toLowerCase() === lookup
  );
}

function publicRecordsRequestView(request) {
  if (!recordsRequestIsReleased(request) && !publicRecordsLookupVerifiedFor(request)) return null;
  return {
    ...request,
    requester_contact: "",
    assigned_to: "",
    clarification_notes: [],
    search_notes: [],
    exemption_reviews: [],
    fee_estimate: "",
    response_draft: "",
    approval_notes: []
  };
}

function publicRecordsRequests(work) {
  return work.records_requests.map(publicRecordsRequestView).filter(Boolean);
}

function publicCodeSourceView(source) {
  if (source.public_status !== "published") return null;
  const publicSource = {
    ...source,
    staff_guidance: "",
    codifier_sync_errors: [],
    amendment_notes: [],
    version_history: (source.version_history || []).map((entry) => ({ ...entry, note: "" }))
  };
  if (!publicSource.guidance_approved_at_unix_seconds) publicSource.plain_language_summary = "";
  return publicSource;
}

function publicCodeSources(work) {
  return work.code_sources.map(publicCodeSourceView).filter(Boolean);
}

function codeVersionHistorySummary(source) {
  const entries = source.version_history || [];
  if (!entries.length) return "";
  return entries
    .slice(0, 3)
    .map((entry) => [entry.label, entry.source, entry.status].filter(Boolean).join(" / "))
    .join("; ");
}

function codeVersionHistorySearchText(source, { publicOnly = false } = {}) {
  return (source.version_history || [])
    .map((entry) => {
      const fields = publicOnly
        ? [entry.label, entry.source, entry.status, entry.authoritative_url]
        : [entry.label, entry.source, entry.status, entry.note, entry.authoritative_url];
      return fields.join(" ");
    })
    .join(" ");
}

function codeQuestionSearchFields(source, { publicOnly = false } = {}) {
  const fields = [
    source.title,
    source.citation,
    source.body,
    source.plain_language_summary
  ];
  if (!publicOnly) fields.push(source.staff_guidance);
  return fields;
}

function codeSourceSearchFields(source, { publicOnly = false } = {}) {
  const publicFields = [
    source.title,
    source.citation,
    source.body,
    source.status,
    source.public_status,
    source.codifier_name,
    source.authoritative_url,
    source.version_label,
    source.codifier_sync_status,
    source.plain_language_summary,
    codeVersionHistorySearchText(source, { publicOnly })
  ];
  if (publicOnly) return publicFields;
  return [
    ...publicFields,
    source.staff_guidance,
    ...(source.amendment_notes || []),
    ...(source.codifier_sync_errors || [])
  ];
}

function localCodeQuestionResults(query, { publicOnly = false } = {}) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  const terms = normalized.split(/[^a-z0-9]+/).filter((term) => term.length > 2);
  const matchesQuestion = (value) => {
    const haystack = String(value || "").toLowerCase();
    return haystack.includes(normalized) || terms.some((term) => haystack.includes(term));
  };
  const sources = publicOnly ? publicCodeSources(cityWork()) : cityWork().code_sources;
  return sources
    .filter((source) => !source.stale_since_unix_seconds)
    .filter((source) => codeQuestionSearchFields(source, { publicOnly }).some(matchesQuestion))
    .slice(0, 3)
    .map((source) => {
      const publicSummaryAllowed = source.guidance_approved_at_unix_seconds && source.plain_language_summary;
      const staffDetailAllowed = !publicOnly && source.staff_guidance;
      const answer = publicSummaryAllowed
        ? source.plain_language_summary
        : staffDetailAllowed
          ? source.staff_guidance
          : String(source.body || "").split(".")[0] || source.body;
      return {
        module_id: "civiccode",
        title: `Code answer: ${source.title}`,
        snippet: `${publicOnly ? "Non-authoritative public summary" : "Staff code guidance"}: ${answer}. This is not legal advice; confirm interpretation with city staff or counsel.`,
        citation: source.citation,
        status: source.public_status || source.status
      };
    });
}

function renderPublicRecordsWorkflow() {
  const requests = publicRecordsRequests(cityWork());
  return `
    <section class="page-heading">
      <p class="eyebrow">Resident/Public</p>
      <h2>Public Records Requests</h2>
      <p>Submit a records request or check local public status without staff review drafts or internal citations.</p>
    </section>
    <section class="workflow-editor">
      <div class="workflow-form">
        <h3>Submit Public Records Request</h3>
        <p class="form-help">Describe the records clearly. Staff will review the request, set any statutory deadline, and work it in the Records staff queue.</p>
        <label>Your name <input type="text" data-work-field="publicRequester" value="${state.workDraft.publicRequester}" autocomplete="name" /></label>
        <label>Email or phone <input type="text" data-work-field="publicRequesterContact" value="${state.workDraft.publicRequesterContact}" autocomplete="email" /></label>
        <label>Records requested <textarea data-work-field="publicRecordsSummary">${state.workDraft.publicRecordsSummary}</textarea></label>
        <button type="button" class="primary-action" data-work-action="submit-public-records-request">Submit Records Request</button>
      </div>
      <div class="workflow-form">
        <h3>Check Status</h3>
        <p class="form-help">Use the request number returned after submission and the same email or phone you gave staff.</p>
        <label>Request number <input type="text" data-work-field="publicRequestLookup" value="${state.workDraft.publicRequestLookup}" placeholder="REQ-0001" /></label>
        <label>Submitted contact <input type="text" data-work-field="publicRequestContact" value="${state.workDraft.publicRequestContact}" autocomplete="email" /></label>
        <button type="button" class="secondary-action" data-work-action="lookup-public-records-request">Check Request Status</button>
        <small>Released responses appear below after staff approval, export, and fulfillment. Pending public intake appears only after the request number and submitted contact match.</small>
      </div>
    </section>
    ${renderWorkActionResult()}
    <section class="workflow-list">
      ${requests.length === 0 ? workflowEmpty("No released records responses or matching request number are available yet.") : requests.map((request) => `
        <article class="workflow-record">
          <span class="${request.fulfilled_at_unix_seconds || request.status === "fulfilled" || request.status === "closed" ? "status-ok" : "status-warn"}">${request.status}</span>
          <h3>${request.public_tracking_number || "Tracking pending"}</h3>
          <p><strong>Requester:</strong> ${request.requester}</p>
          <p>${request.summary}</p>
          <small>${request.submitted_via || "Staff intake"} - ${request.deadline} - Released exports: ${(request.exports || []).length}</small>
        </article>
      `).join("")}
    </section>
  `;
}

function renderRecordsWorkflow() {
  if (isPublicSurface()) return renderPublicRecordsWorkflow();
  const work = cityWork();
  const selectedRequest = currentRecordsRequest(work);
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
        <h3>Scope & Search</h3>
        <label>Assign to <input type="text" data-work-field="assignedTo" value="${state.workDraft.assignedTo}" /></label>
        <label>Clarification note <textarea data-work-field="clarificationNote">${state.workDraft.clarificationNote}</textarea></label>
        <label>Search source note <textarea data-work-field="sourceNote">${state.workDraft.sourceNote}</textarea></label>
        <label>Citation or source note <input type="text" data-work-field="citation" value="${state.workDraft.citation}" /></label>
        <label>Exemption review <textarea data-work-field="exemptionNote">${state.workDraft.exemptionNote}</textarea></label>
        <label>Fee estimate <input type="text" data-work-field="feeEstimate" value="${state.workDraft.feeEstimate}" /></label>
        <div class="workflow-actions">
          <button type="button" class="secondary-action" data-work-action="assign-records-request">Assign</button>
          <button type="button" class="secondary-action" data-work-action="request-records-clarification">Request Clarification</button>
          <button type="button" class="secondary-action" data-work-action="record-records-search">Record Search</button>
          <button type="button" class="secondary-action" data-work-action="add-records-exemption-review">Add Exemption Review</button>
          <button type="button" class="secondary-action" data-work-action="estimate-records-fee">Estimate Fee</button>
        </div>
      </div>
      <div class="workflow-form">
        <h3>Response & Release</h3>
        <label>Response draft <textarea data-work-field="responseDraft">${state.workDraft.responseDraft}</textarea></label>
        <label>Approval note <input type="text" data-work-field="approvalNote" value="${state.workDraft.approvalNote}" /></label>
        <div class="workflow-actions">
          <button type="button" class="secondary-action" data-work-action="draft-records-response">Save Draft</button>
          <button type="button" class="secondary-action" data-work-action="approve-records-response">Approve Response</button>
          <button type="button" class="secondary-action" data-work-action="export-records-response">Export Response</button>
          <button type="button" class="secondary-action" data-work-action="fulfill-records-request">Mark Fulfilled</button>
          <button type="button" class="secondary-action" data-work-action="close-records-request">Close Request</button>
          <button type="button" class="secondary-action" data-work-action="open-exports-folder">Open Exports Folder</button>
        </div>
      </div>
    </section>
    ${renderGuidedWorkReview()}
    ${renderWorkActionResult()}
    <section class="workflow-list">
      ${work.records_requests.length === 0 ? workflowEmpty("No local records requests have been created yet.") : work.records_requests.map((request) => `
        <article class="workflow-record">
          <span class="status-warn">${request.status}</span>
          <h3>${request.requester}</h3>
          <p>${request.summary}</p>
          ${request.public_tracking_number ? `<p><strong>Tracking:</strong> ${request.public_tracking_number}</p>` : ""}
          ${request.requester_contact ? `<p><strong>Contact:</strong> ${request.requester_contact}</p>` : ""}
          ${request.submitted_via ? `<p><strong>Submitted via:</strong> ${request.submitted_via}</p>` : ""}
          ${request.assigned_to ? `<p><strong>Assigned:</strong> ${request.assigned_to}</p>` : ""}
          ${request.fee_estimate ? `<p><strong>Fee estimate:</strong> ${request.fee_estimate}</p>` : ""}
          ${request.approved_at_unix_seconds ? "<p><strong>Approval:</strong> human-approved</p>" : ""}
          ${request.fulfilled_at_unix_seconds ? "<p><strong>Fulfillment:</strong> released to requester</p>" : ""}
          <div class="record-actions">
            ${selectedRequest?.id === request.id ? `<span class="status-ok">Selected for actions</span>` : `<button type="button" class="secondary-action" data-select-work-record="recordsRequest" data-record-id="${request.id}">Work On This</button>`}
          </div>
          <small>Due ${request.deadline} - ${(request.citations || []).length} citations - ${(request.exemption_reviews || []).length} exemption notes - ${(request.exports || []).length} exports</small>
        </article>
      `).join("")}
    </section>
  `;
}

function renderPublicCodeWorkflow() {
  const sources = publicCodeSources(cityWork());
  const answers = localCodeQuestionResults(state.workDraft.codeQuestion, { publicOnly: true });
  return `
    <section class="page-heading">
      <p class="eyebrow">Resident/Public</p>
      <h2>Municipal Code Search</h2>
      <p>Published code sources appear with citations. Staff handoffs and draft guidance stay in the Staff surface.</p>
    </section>
    <section class="workflow-editor single">
      <div class="workflow-form">
        <h3>Ask the Code</h3>
        <p class="form-help">Answers use published local code sources and citations only. They are plain-language help, not legal advice.</p>
        <label>Question <input type="search" data-work-field="codeQuestion" value="${state.workDraft.codeQuestion}" placeholder="Can I have chickens?" /></label>
        <button type="button" class="primary-action" data-work-action="answer-code-question">Answer Code Question</button>
      </div>
    </section>
    ${renderWorkActionResult()}
    <section class="workflow-list">
      ${answers.length === 0 ? workflowEmpty("Ask a question to see cited public code answers.") : answers.map((answer) => `
        <article class="workflow-record">
          <span class="status-ok">${answer.module_id}</span>
          <h3>${answer.title}</h3>
          <p>${answer.snippet}</p>
          <small>${answer.citation} - ${answer.status}</small>
        </article>
      `).join("")}
    </section>
    <section class="workflow-list">
      ${sources.length === 0 ? workflowEmpty("No published municipal code sources are available yet.") : sources.map((source) => `
        <article class="workflow-record">
          <span class="status-ok">${source.public_status}</span>
          <h3>${source.title}</h3>
          <p>${source.body}</p>
          ${source.guidance_approved_at_unix_seconds && source.plain_language_summary ? `<p><strong>Plain-English summary:</strong> ${source.plain_language_summary}</p>` : ""}
          ${codeVersionHistorySummary(source) ? `<p><strong>Source history:</strong> ${codeVersionHistorySummary(source)}</p>` : ""}
          ${source.stale_since_unix_seconds ? "<p><strong>Update status:</strong> codifier update pending</p>" : ""}
          <small>${source.citation} - ${source.codifier_sync_status || "not synced"} - ${(source.public_exports || []).length} public exports - contact city staff for legal interpretation</small>
        </article>
      `).join("")}
    </section>
  `;
}

function renderCodeWorkflow() {
  if (isPublicSurface()) return renderPublicCodeWorkflow();
  const work = cityWork();
  const selectedSource = currentCodeSource(work);
  const selectedHandoff = currentCodeHandoff(work);
  const codeAnswers = localCodeQuestionResults(state.workDraft.codeQuestion, { publicOnly: false });
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
          <button type="button" class="secondary-action" data-work-action="open-exports-folder">Open Exports Folder</button>
        </div>
      </div>
      <div class="workflow-form">
        <h3>Codifier Sync</h3>
        <label>Codifier <input type="text" data-work-field="codifierName" value="${state.workDraft.codifierName}" /></label>
        <label>Authoritative URL <input type="url" data-work-field="authoritativeUrl" value="${state.workDraft.authoritativeUrl}" /></label>
        <label>Version label <input type="text" data-work-field="versionLabel" value="${state.workDraft.versionLabel}" /></label>
        <label>Sync error <input type="text" data-work-field="syncError" value="${state.workDraft.syncError}" /></label>
        <label>Amendment or stale note <textarea data-work-field="amendmentNote">${state.workDraft.amendmentNote}</textarea></label>
        <div class="workflow-actions">
          <button type="button" class="secondary-action" data-work-action="record-codifier-sync">Record Sync</button>
          <button type="button" class="secondary-action" data-work-action="record-codifier-sync-failure">Record Sync Failure</button>
          <button type="button" class="secondary-action" data-work-action="retry-codifier-sync">Retry Sync</button>
          <button type="button" class="secondary-action" data-work-action="mark-code-stale">Mark Stale</button>
        </div>
      </div>
      <div class="workflow-form">
        <h3>Guidance & Summary</h3>
        <label>Staff guidance <textarea data-work-field="guidanceDraft">${state.workDraft.guidanceDraft}</textarea></label>
        <label>Plain-English summary <textarea data-work-field="summaryDraft">${state.workDraft.summaryDraft}</textarea></label>
        <div class="workflow-actions">
          <button type="button" class="secondary-action" data-work-action="draft-code-guidance">Save Guidance Draft</button>
          <button type="button" class="secondary-action" data-work-action="approve-code-guidance">Approve Guidance</button>
        </div>
      </div>
      <div class="workflow-form">
        <h3>Clerk Handoff</h3>
        <label>Handoff summary <textarea data-work-field="handoffSummary">${state.workDraft.handoffSummary}</textarea></label>
        <button type="button" class="secondary-action" data-work-action="create-code-handoff">Create Clerk Handoff</button>
      </div>
      <div class="workflow-form">
        <h3>Ask Code Question</h3>
        <p class="form-help">Staff answers can use internal guidance and citations, but still stay non-authoritative.</p>
        <label>Question <input type="search" data-work-field="codeQuestion" value="${state.workDraft.codeQuestion}" placeholder="What does the code say about noise?" /></label>
        <button type="button" class="secondary-action" data-work-action="answer-code-question">Answer Code Question</button>
      </div>
    </section>
    ${renderGuidedWorkReview()}
    ${renderWorkActionResult()}
    <section class="workflow-list">
      ${codeAnswers.length === 0 ? workflowEmpty("Ask a code question to see cited staff answers.") : codeAnswers.map((answer) => `
        <article class="workflow-record">
          <span class="status-ok">${answer.module_id}</span>
          <h3>${answer.title}</h3>
          <p>${answer.snippet}</p>
          <small>${answer.citation} - ${answer.status}</small>
        </article>
      `).join("")}
    </section>
    <section class="workflow-list">
      ${work.code_sources.length === 0 ? workflowEmpty("No local code sources have been imported yet.") : work.code_sources.map((source) => `
        <article class="workflow-record">
          <span class="status-ok">${source.status}</span>
          <h3>${source.title}</h3>
          <p>${source.body}</p>
          ${source.codifier_name ? `<p><strong>Codifier:</strong> ${source.codifier_name}</p>` : ""}
          ${codeVersionHistorySummary(source) ? `<p><strong>Source history:</strong> ${codeVersionHistorySummary(source)}</p>` : ""}
          ${source.stale_since_unix_seconds ? "<p><strong>Stale:</strong> codifier update pending</p>" : ""}
          ${source.staff_guidance ? `<p><strong>Staff guidance:</strong> ${source.staff_guidance}</p>` : ""}
          <div class="record-actions">
            ${selectedSource?.id === source.id ? `<span class="status-ok">Selected for actions</span>` : `<button type="button" class="secondary-action" data-select-work-record="codeSource" data-record-id="${source.id}">Work On This</button>`}
          </div>
          <small>${source.citation} - ${source.public_status || "internal draft"} - ${source.codifier_sync_status || "not synced"} - ${(source.public_exports || []).length} public exports</small>
        </article>
      `).join("")}
      ${work.code_handoffs.map((handoff) => `
        <article class="workflow-record handoff">
          <span class="status-warn">${handoff.status}</span>
          <h3>${handoff.title}</h3>
          <p>${handoff.summary}</p>
          <div class="record-actions">
            ${selectedHandoff?.id === handoff.id ? `<span class="status-ok">Selected for agenda action</span>` : `<button type="button" class="secondary-action" data-select-work-record="codeHandoff" data-record-id="${handoff.id}">Work On This</button>`}
          </div>
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
    const publicComments = (meeting.public_comments || [])
      .filter((comment) => !publicOnly || ["reviewed for public record", "redacted for public record"].includes(comment.status))
      .map((comment) => {
        const publicBody = comment.status === "redacted for public record" && comment.redacted_body
          ? comment.redacted_body
          : comment.body;
        const fields = publicOnly
          ? [comment.mode, comment.topic, publicBody]
          : [
              comment.commenter_name,
              comment.commenter_contact,
              comment.mode,
              comment.topic,
              comment.body,
              comment.redacted_body,
              comment.redaction_basis
        ];
        return fields.join(" ");
      }).join(" ");
    const publicArchive = publicOnly && (meeting.status === "archived public record" || meeting.archived_at_unix_seconds);
    const publicMeetingFields = [
      meeting.title,
      meeting.summary,
      meeting.status,
      meeting.notice_status,
      agendaTitles,
      publicComments
    ];
    const meetingSearchText = publicOnly
      ? publicArchive
        ? [...publicMeetingFields, meeting.minutes, outcomes, actionItems, residentComments]
        : publicMeetingFields
      : [meeting.title, meeting.summary, meeting.status, meeting.minutes, agendaTitles, outcomes, actionItems, residentComments, publicComments];
    if (meetingSearchText.some((value) => String(value || "").toLowerCase().includes(normalized))) {
      results.push({ module_id: "civicclerk", title: meeting.title, snippet: meeting.summary, citation: `Meeting ${meeting.meeting_date}`, status: meeting.status });
    }
  });
  const recordsRequests = publicOnly ? publicRecordsRequests(work) : work.records_requests;
  recordsRequests.forEach((request) => {
    const publicRecordFields = [
      request.public_tracking_number,
      request.requester,
      request.submitted_via,
      request.summary,
      request.status,
      ...(request.citations || [])
    ];
    const recordsSearchText = publicOnly ? publicRecordFields : [
      ...publicRecordFields,
      request.requester_contact,
      request.assigned_to,
      request.fee_estimate,
      request.response_draft,
      ...(request.clarification_notes || []),
      ...(request.search_notes || []),
      ...(request.exemption_reviews || []),
      ...(request.approval_notes || [])
    ];
    if (recordsSearchText.some((value) => String(value || "").toLowerCase().includes(normalized))) {
      results.push({ module_id: "civicrecords-ai", title: `Records request: ${request.requester}`, snippet: request.summary, citation: request.citations[0] || "Local records request", status: request.status });
    }
  });
  const codeSources = publicOnly ? publicCodeSources(work) : work.code_sources;
  codeSources.forEach((source) => {
    const codeSearchText = codeSourceSearchFields(source, { publicOnly });
    if (codeSearchText.some((value) => String(value || "").toLowerCase().includes(normalized))) {
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
      ${results.length === 0 ? workflowEmpty(publicOnly ? "No public search results yet." : "No local search results yet.") : results.map((result) => `
        <article class="workflow-record">
          <span class="status-ok">${result.module_id}</span>
          <h3>${result.title}</h3>
          <p>${result.snippet || "No snippet available."}</p>
          <small>${result.citation} - ${result.status}</small>
        </article>
      `).join("")}
    </section>
  `;
}

function lifecycleStatusText(value) {
  const labels = {
    "always-installed-with-profile": "Always installed with CivicCore",
    "profile-selected": "Installed by selected package profile",
    "manifest-versioned": "Updated through the versioned module manifest",
    "not-allowed-required-foundation": "Cannot be disabled because it is the required foundation",
    "allowed-after-backup": "Allowed after a backup is created",
    "backup-first-profile-removal": "Removed only through backup-first profile removal",
    "backup-first-module-data-removal": "Removed only after module data backup"
  };
  return labels[value] || String(value || "").replace(/-/g, " ");
}

function moduleLifecycleItems(module) {
  return [
    ["Install", module.lifecycle_install],
    ["Update", module.lifecycle_update],
    ["Disable", module.lifecycle_disable],
    ["Remove", module.lifecycle_uninstall]
  ]
    .filter(([, value]) => Boolean(value))
    .map(([label, value]) => ({ label, value: lifecycleStatusText(value) }));
}

function renderModuleRow(module, { actions = false } = {}) {
  const proofCount = module.proof_required?.length || 0;
  const lifecycle = moduleLifecycleItems(module);
  const disabled = module.installed && module.enabled === false;
  const canToggle = actions && module.installed && !module.required;
  const toggleAction = disabled ? "enable-module" : "disable-module";
  const toggleLabel = disabled ? "Enable" : "Disable";
  const contractParts = [
    module.route_count ? `${module.route_count} route${module.route_count === 1 ? "" : "s"}` : "",
    module.service_count ? `${module.service_count} service${module.service_count === 1 ? "" : "s"}` : "",
    module.task_count ? `${module.task_count} task${module.task_count === 1 ? "" : "s"}` : "",
    module.model_required ? "local AI required" : ""
  ].filter(Boolean);
  return `
    <article class="module-row ${disabled ? "module-disabled" : ""}">
      <div>
        <h3>${module.display_name}</h3>
        <p>${module.role}</p>
        ${contractParts.length ? `<small>${contractParts.join(" - ")}</small>` : ""}
      </div>
      <div class="module-meta">
        <span class="${moduleStatusClass(module)}">${moduleStatusLabel(module)}</span>
        <small>${module.version || "No release yet"}${proofCount ? ` - ${proofCount} proof checks` : ""}</small>
        ${disabled ? `<small>Data remains installed. Re-enable this module to show its work area.</small>` : ""}
        ${lifecycle.map((item) => `<small><strong>${item.label}:</strong> ${item.value}</small>`).join("")}
        ${canToggle ? `
          <div class="module-actions">
            <button
              type="button"
              class="secondary-action"
              data-module-action="${toggleAction}"
              data-module-id="${escapeHtml(module.id)}"
              aria-label="${toggleLabel} ${escapeHtml(module.display_name)}"
            >${toggleLabel}</button>
          </div>
        ` : ""}
      </div>
    </article>
  `;
}

function runtimeServiceForReview(serviceId) {
  return (state.app.health || []).find((item) => item.id === serviceId) || null;
}

function guidedSupervisorReviewForAction(action, serviceId) {
  const service = runtimeServiceForReview(serviceId);
  const serviceLabel = service?.label || "selected local service";
  const serviceStatus = service ? `${service.status}: ${service.message}` : "Whole local profile action";
  const reviews = {
    "backup": {
      title: "Review Before Backing Up Local Profile",
      confirmLabel: "Backup Now",
      module: "CivicCore local runtime",
      subject: "CivicSuite city profile",
      status: "Manual backup requested",
      changes: "Copies local city data and configuration to the configured backup folder with a backup manifest.",
      visibility: "Local administrator only. This does not publish or change public civic records.",
      sources: [
        "Source: local CivicSuite Data and config folders.",
        "Destination: configured CivicSuite backup folder."
      ],
      audit: "Creates a local backup manifest with file hashes for restore/reinstall recovery.",
      retry: "If the backup folder cannot be written, the desktop app reports the error and leaves city data unchanged."
    },
    "restore": {
      title: "Review Before Restoring Latest Backup",
      confirmLabel: "Restore Latest Backup",
      module: "CivicCore local runtime",
      subject: "Latest local CivicSuite backup",
      status: "Restore requested",
      changes: "Creates a pre-restore safety backup, stops local services, and replaces local data/config from the latest backup manifest.",
      visibility: "Local administrator only. Restored records affect what staff see after restart.",
      sources: [
        "Source: latest backup-manifest.json in the CivicSuite backup folder.",
        "Safety: a pre-restore backup is created before replacement."
      ],
      audit: "Creates a pre-restore backup manifest and returns a restore action result.",
      retry: "If no valid backup exists, restore stops before changing the local profile."
    },
    "uninstall": {
      title: "Review Before Preparing Uninstall",
      confirmLabel: "Prepare Uninstall",
      module: "CivicCore local runtime",
      subject: "Local CivicSuite city profile",
      status: "Profile removal requested",
      changes: "Stops local services, creates a final uninstall backup, and removes local data and setup/config state.",
      visibility: "Local administrator only. Program files remain for the Windows uninstall entry to remove.",
      sources: [
        "Source: local CivicSuite Data and config folders.",
        "Safety: final-uninstall backup is written before profile removal."
      ],
      audit: "Creates a final uninstall backup manifest and returns an uninstall action result.",
      retry: "If the final backup fails, uninstall stops before removing the profile."
    },
    "repair": {
      title: `Review Before Repairing ${serviceLabel}`,
      confirmLabel: "Repair",
      module: "CivicCore local runtime",
      subject: serviceLabel,
      status: serviceStatus,
      changes: "Rechecks portable runtime files and repairs the selected local service setup where possible.",
      visibility: "Local administrator only. This may change local service files but does not publish civic records.",
      sources: [
        service ? `Service id: ${service.id}` : "No service selected yet.",
        service?.next_action || "System Health will report the next repair step."
      ],
      audit: "Returns a repair action result and updates local runtime service state.",
      retry: "If required bundled files are missing, repair reports the missing payload and leaves the service state clear."
    },
    "stop": {
      title: `Review Before Stopping ${serviceLabel}`,
      confirmLabel: "Stop",
      module: "CivicCore local runtime",
      subject: serviceLabel,
      status: serviceStatus,
      changes: "Stops the selected local service state so it can be restarted or repaired.",
      visibility: "Local administrator only. Staff workflows may be unavailable until services restart.",
      sources: [
        service ? `Service id: ${service.id}` : "No service selected yet.",
        "System Health remains available after the stop action."
      ],
      audit: "Returns a stop action result and updates local runtime service state.",
      retry: "If the service is already stopped, the desktop app keeps the profile available for health checks."
    }
  };
  return reviews[action] || null;
}

function requiresGuidedSupervisorReview(action) {
  return GUIDED_SUPERVISOR_ACTIONS.has(action);
}

function renderGuidedSupervisorReview() {
  const review = guidedSupervisorReviewForAction(
    state.pendingSupervisorReviewAction,
    state.pendingSupervisorReviewServiceId
  );
  if (!review) return "";
  const serviceAttr = state.pendingSupervisorReviewServiceId ? ` data-service-id="${escapeHtml(state.pendingSupervisorReviewServiceId)}"` : "";
  return `
    <section class="guided-review" aria-labelledby="supervisor-review-title">
      <div>
        <p class="eyebrow">${escapeHtml(review.module)}</p>
        <h3 id="supervisor-review-title">${escapeHtml(review.title)}</h3>
        <p>${escapeHtml(review.subject)}</p>
      </div>
      <div class="review-grid">
        <div>
          <strong>Current status</strong>
          <p>${escapeHtml(review.status)}</p>
        </div>
        <div>
          <strong>What will change</strong>
          <p>${escapeHtml(review.changes)}</p>
        </div>
        <div>
          <strong>Who can see it</strong>
          <p>${escapeHtml(review.visibility)}</p>
        </div>
        <div>
          <strong>Audit trail</strong>
          <p>${escapeHtml(review.audit)}</p>
        </div>
      </div>
      <div>
        <strong>Sources and evidence</strong>
        <ul class="review-evidence">
          ${review.sources.map((source) => `<li>${escapeHtml(source)}</li>`).join("")}
        </ul>
      </div>
      <p class="next-action">${escapeHtml(review.retry)}</p>
      <div class="review-actions">
        <button type="button" class="primary-action" data-supervisor-review-confirm="${state.pendingSupervisorReviewAction}"${serviceAttr}>Confirm ${escapeHtml(review.confirmLabel)}</button>
        <button type="button" class="secondary-action" data-supervisor-review-cancel>Cancel Review</button>
      </div>
    </section>
  `;
}

function renderProfileRow(profile) {
  return `
    <article class="module-row">
      <div>
        <h3>${profile.label}</h3>
        <p>${profile.description}</p>
        <small>${profile.module_count} module${profile.module_count === 1 ? "" : "s"}</small>
      </div>
      <div class="module-meta">
        <span class="${profileStatusClass(profile)}">${profileStatusLabel(profile)}</span>
        ${profile.disabled ? `<small>${profile.disabled_reason || "Held until package proof is available."}</small>` : ""}
      </div>
    </article>
  `;
}

function renderModules() {
  const installed = state.app.modules.filter((module) => module.installed || module.required);
  const catalog = state.app.modules.filter((module) => !module.installed && !module.required);
  const profiles = state.app.module_profiles || [];
  const selection = state.app.module_selection || fallbackState.module_selection;
  const enabledCount = (selection.enabled_module_ids || installed.filter((module) => module.enabled !== false).map((module) => module.id)).length;
  const admin = (state.app.users || [])[0];
  const moduleSelectionLocked =
    state.moduleDraft.profileId === "custom" && customSelectedModuleIds().length === 0;
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
      <p>CivicCore stays installed. Product modules can be enabled or disabled without deleting their local data.</p>
    </section>
    <section class="section-band">
      <div class="section-title">
        <h3>Choose Product Modules</h3>
        <p>City Core is the complete 1.0 package. Custom selection is available for ready modules and always keeps CivicCore installed.</p>
      </div>
      ${renderModuleSelectionControls()}
      <div class="setup-actions">
        <button type="button" class="primary-action" data-first-run-action="select-modules" data-step-id="modules" ${moduleSelectionLocked ? "disabled" : ""}>
          Apply Module Selection
        </button>
        ${moduleSelectionLocked ? `<small>Select at least one ready product module for a custom profile.</small>` : ""}
      </div>
    </section>
    <section class="module-columns">
      <div>
        <div class="section-title">
          <h3>City Core Package</h3>
          <p>Installed for the ${selection.profile_label} local profile. Disabled modules stay installed and can be re-enabled here.</p>
        </div>
        <div class="empty-note">
          Selected profile: ${selection.profile_label}. Installed modules: ${selection.installed_module_ids.length}. Enabled modules: ${enabledCount}.
        </div>
        <div class="module-list">${installed.map((module) => renderModuleRow(module, { actions: true })).join("")}</div>
      </div>
      <div>
        <div class="section-title">
          <h3>Package Profiles</h3>
          <p>Profiles come from the same module manifest the installer uses.</p>
        </div>
        <div class="module-list">${profiles.map(renderProfileRow).join("")}</div>
      </div>
      <div>
        <div class="section-title">
          <h3>Module Catalog</h3>
          <p>Future modules keep their dependency, lifecycle, backup, service, and proof contract here before they can join an install profile.</p>
        </div>
        <div class="module-list">${catalog.map(renderModuleRow).join("")}</div>
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
        <button type="button" class="secondary-action" data-supervisor-action="open-backup-folder">Open Backup Folder</button>
        <button type="button" class="secondary-action" data-supervisor-action="restore">Restore Latest Backup</button>
        <button type="button" class="secondary-action" data-supervisor-action="uninstall">Prepare Uninstall</button>
      </div>
    </section>
    ${renderGuidedSupervisorReview()}
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
  const publications = cityWork().publication_events || [];
  return `
    <aside class="audit-drawer ${state.auditOpen ? "open" : ""}" aria-hidden="${!state.auditOpen}">
      <div class="section-title">
        <h2>Audit Trail</h2>
        <p>Local workflow actions and public publication gates record module, action, hash, time, and summary in the Windows data profile.</p>
      </div>
      <h3>Publication Gates</h3>
      ${publications.length === 0 ? `
        <div class="audit-entry">
          <span class="status-muted">No publications</span>
          <p>No human-approved public records have been published yet.</p>
        </div>
      ` : publications.slice(0, 8).map((event) => `
        <div class="audit-entry">
          <span class="${event.retracted_at_unix_seconds ? "status-warn" : "status-ok"}">${event.source_module}</span>
          <p><strong>${event.record_type}</strong></p>
          <p>${event.retracted_at_unix_seconds ? "Retracted" : "Published"} record ${event.source_record_id}</p>
          <small>Payload hash ${(event.payload_hash || "pending").slice(0, 12)}</small>
          <small>${new Date(event.published_at_unix_seconds * 1000).toLocaleString()}</small>
        </div>
      `).join("")}
      <h3>Workflow Actions</h3>
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
  if (!areaIsEnabled(state.activeArea)) {
    state.activeArea = "settings";
  }
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
      if (!areaIsEnabled(button.dataset.area)) return;
      state.activeArea = button.dataset.area;
      state.pendingWorkReviewAction = null;
      state.pendingSupervisorReviewAction = null;
      state.pendingSupervisorReviewServiceId = null;
      render();
      byId("main-content")?.focus();
    });
  });
  document.querySelectorAll("[data-surface]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeSurface = button.dataset.surface;
      state.pendingWorkReviewAction = null;
      state.pendingSupervisorReviewAction = null;
      state.pendingSupervisorReviewServiceId = null;
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
  document.querySelectorAll("[data-module-profile-id]").forEach((input) => {
    input.addEventListener("change", () => {
      state.moduleDraft.profileId = input.dataset.moduleProfileId;
      if (state.moduleDraft.profileId === "city-core") {
        state.moduleDraft.selectedModuleIds = [...CITY_CORE_PRODUCT_MODULE_IDS];
      }
      render();
    });
  });
  document.querySelectorAll("[data-module-toggle]").forEach((input) => {
    input.addEventListener("change", () => {
      const moduleId = input.dataset.moduleToggle;
      const selectedIds = new Set(state.moduleDraft.selectedModuleIds);
      if (input.checked) {
        selectedIds.add(moduleId);
      } else {
        selectedIds.delete(moduleId);
      }
      state.moduleDraft.profileId = "custom";
      state.moduleDraft.selectedModuleIds = Array.from(selectedIds);
      render();
    });
  });
  document.querySelectorAll("[data-module-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      await handleModuleAction(button.dataset.moduleAction, button.dataset.moduleId);
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
  document.querySelectorAll("[data-supervisor-review-confirm]").forEach((button) => {
    button.addEventListener("click", async () => {
      await handleSupervisorAction(button.dataset.supervisorReviewConfirm, button.dataset.serviceId, { confirmed: true });
    });
  });
  document.querySelectorAll("[data-supervisor-review-cancel]").forEach((button) => {
    button.addEventListener("click", () => {
      state.pendingSupervisorReviewAction = null;
      state.pendingSupervisorReviewServiceId = null;
      render();
    });
  });
  document.querySelectorAll("[data-work-field]").forEach((input) => {
    const syncWorkField = () => {
      state.workDraft[input.dataset.workField] = input.value;
      if (["searchQuery", "codeQuestion"].includes(input.dataset.workField)) {
        state.searchResults = [];
      }
    };
    input.addEventListener("input", syncWorkField);
    input.addEventListener("change", syncWorkField);
  });
  document.querySelectorAll("[data-select-work-record]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = `${button.dataset.selectWorkRecord}Id`;
      state.workSelection[key] = button.dataset.recordId;
      if (button.dataset.parentMeetingId) {
        state.workSelection.meetingId = button.dataset.parentMeetingId;
      }
      state.pendingWorkReviewAction = null;
      render();
    });
  });
  document.querySelectorAll("[data-work-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      await handleCityWorkAction(button.dataset.workAction);
    });
  });
  document.querySelectorAll("[data-review-confirm]").forEach((button) => {
    button.addEventListener("click", async () => {
      await handleCityWorkAction(button.dataset.reviewConfirm, { confirmed: true });
    });
  });
  document.querySelectorAll("[data-review-cancel]").forEach((button) => {
    button.addEventListener("click", () => {
      state.pendingWorkReviewAction = null;
      render();
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
  if (stepId === "modules") {
    return moduleSelectionPayload();
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

async function handleModuleAction(action, moduleId) {
  if (!hasTauriBridge()) {
    state.actionResult = {
      accepted: false,
      status: "Desktop app required",
      message: "Module changes are saved by the Windows desktop app, not the browser preview.",
      next_action: "Open the CivicSuite desktop app to enable or disable installed modules."
    };
    render();
    return;
  }
  try {
    state.actionResult = await invoke("module_action", {
      action,
      moduleId
    });
    state.app.module_selection = state.actionResult.selection;
    state.app.modules = state.actionResult.modules;
    await loadAppState();
    if (!areaIsEnabled(state.activeArea)) {
      state.activeArea = "settings";
    }
  } catch (error) {
    state.actionResult = {
      accepted: false,
      status: "Needs attention",
      message: String(error),
      next_action: "Sign in as the local administrator and try the module action again."
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

async function handleSupervisorAction(action, serviceId, { confirmed = false } = {}) {
  if (requiresGuidedSupervisorReview(action) && !confirmed) {
    state.pendingSupervisorReviewAction = action;
    state.pendingSupervisorReviewServiceId = serviceId || null;
    state.supervisorActionResult = null;
    render();
    return;
  }
  state.pendingSupervisorReviewAction = null;
  state.pendingSupervisorReviewServiceId = null;
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
  const selected = {
    meetingId: currentMeeting()?.id || "",
    publicCommentId: currentPublicComment()?.id || "",
    recordsRequestId: currentRecordsRequest()?.id || "",
    codeSourceId: currentCodeSource()?.id || "",
    codeHandoffId: currentCodeHandoff()?.id || ""
  };
  const payloads = {
    "create-meeting": {
      title: draft.meetingTitle,
      meetingDate: draft.meetingDate,
      summary: draft.meetingSummary,
      agendaTitle: draft.agendaTitle
    },
    "add-agenda-item": { ...selected, agendaTitle: draft.agendaTitle },
    "add-code-handoff-agenda": selected,
    "post-notice": selected,
    "export-meeting-packet": selected,
    "record-minutes": { ...selected, minutes: draft.minutes },
    "record-vote": { ...selected, vote: draft.vote },
    "add-action-item": { ...selected, actionItem: draft.actionItem },
    "record-resident-comment": { ...selected, residentComment: draft.residentComment },
    "submit-public-comment": {
      meetingId: draft.publicCommentMeetingId || publicCommentMeetings(cityWork())[0]?.id || "",
      commenterName: draft.publicCommentName,
      commenterContact: draft.publicCommentContact,
      commentMode: draft.publicCommentMode,
      commentTopic: draft.publicCommentTopic,
      commentBody: draft.publicCommentBody
    },
    "review-public-comment": {
      ...selected,
      publicCommentId: currentPublicComment()?.id || ""
    },
    "redact-public-comment": {
      ...selected,
      publicCommentId: currentPublicComment()?.id || "",
      redactedBody: draft.publicCommentRedactedBody,
      redactionBasis: draft.publicCommentRedactionBasis
    },
    "adopt-minutes": selected,
    "archive-meeting": selected,
    "create-records-request": {
      requester: draft.requester,
      summary: draft.recordsSummary,
      deadline: draft.deadline
    },
    "submit-public-records-request": {
      requester: draft.publicRequester,
      requesterContact: draft.publicRequesterContact,
      summary: draft.publicRecordsSummary
    },
    "lookup-public-records-request": {
      trackingNumber: draft.publicRequestLookup,
      requesterContact: draft.publicRequestContact
    },
    "request-records-clarification": { ...selected, clarificationNote: draft.clarificationNote },
    "assign-records-request": { ...selected, assignedTo: draft.assignedTo },
    "record-records-search": {
      ...selected,
      sourceNote: draft.sourceNote,
      citation: draft.citation
    },
    "add-records-exemption-review": { ...selected, exemptionNote: draft.exemptionNote },
    "estimate-records-fee": { ...selected, feeEstimate: draft.feeEstimate },
    "draft-records-response": {
      ...selected,
      responseDraft: draft.responseDraft,
      citation: draft.citation
    },
    "approve-records-response": { ...selected, approvalNote: draft.approvalNote },
    "export-records-response": selected,
    "fulfill-records-request": selected,
    "close-records-request": selected,
    "open-exports-folder": { folder: exportFolderForActiveArea() },
    "import-code-source": {
      title: draft.codeTitle,
      citation: draft.codeCitation,
      body: draft.codeBody
    },
    "record-codifier-sync": {
      ...selected,
      codifierName: draft.codifierName,
      authoritativeUrl: draft.authoritativeUrl,
      versionLabel: draft.versionLabel
    },
    "record-codifier-sync-failure": { ...selected, syncError: draft.syncError },
    "retry-codifier-sync": selected,
    "mark-code-stale": { ...selected, amendmentNote: draft.amendmentNote },
    "draft-code-guidance": {
      ...selected,
      guidanceDraft: draft.guidanceDraft,
      summaryDraft: draft.summaryDraft
    },
    "approve-code-guidance": selected,
    "publish-code-source": selected,
    "unpublish-code-source": selected,
    "create-code-handoff": { ...selected, summary: draft.handoffSummary },
    "answer-code-question": {
      query: draft.codeQuestion,
      publicOnly: isPublicSurface()
    },
    "search-city-knowledge": { query: draft.searchQuery }
  };
  return payloads[action] || {};
}

async function handleCityWorkAction(action, { confirmed = false } = {}) {
  if (requiresGuidedWorkReview(action) && !confirmed) {
    state.pendingWorkReviewAction = action;
    state.workActionResult = null;
    render();
    return;
  }
  state.pendingWorkReviewAction = null;
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
  if (action === "answer-code-question" && !hasTauriBridge()) {
    state.searchResults = localCodeQuestionResults(state.workDraft.codeQuestion, { publicOnly: isPublicSurface() });
    state.workActionResult = {
      accepted: true,
      status: state.searchResults.length > 0 ? "Answer ready" : "No cited answer",
      message: state.searchResults.length > 0
        ? "Browser preview answered from local code source text. The desktop app records a CivicCode audit entry."
        : "No current cited code source matched the question.",
      next_action: "Review the cited source or refine the question."
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
    if (action === "submit-public-records-request") {
      const trackingNumber = String(result.message || "").match(/\bREQ-\d+\b/)?.[0] || "";
      if (trackingNumber) {
        state.workDraft.publicRequestLookup = trackingNumber;
        state.workDraft.publicRequestContact = state.workDraft.publicRequesterContact;
      }
      state.publicRecordsLookup = { trackingNumber: "", requesterContact: "", found: false };
    }
    if (action === "lookup-public-records-request") {
      const trackingNumber = state.workDraft.publicRequestLookup.trim().toLowerCase();
      const requesterContact = state.workDraft.publicRequestContact.trim().toLowerCase();
      const found = Boolean((result.state.records_requests || []).some((request) => (
        String(request.public_tracking_number || "").toLowerCase() === trackingNumber
      )));
      state.publicRecordsLookup = { trackingNumber, requesterContact, found };
    }
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
