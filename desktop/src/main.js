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
      backup_restore_hooks: ["config", "Data", "audit-log", "model-registry"],
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
      backup_restore_hooks: ["Data/workflows/records", "Data/exports/records", "Data/files/records"],
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
      backup_restore_hooks: ["Data/workflows/meetings", "Data/exports/meetings", "Data/files/meetings"],
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
      backup_restore_hooks: ["Data/workflows/code", "Data/exports/code", "Data/files/code"],
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
    download_state: {
      schema_version: 1,
      model_id: "gemma-4-12b-it-qat-q4_0",
      status: "Not downloaded",
      message: "No verified or partial Gemma model download is saved on this machine.",
      local_path: "%LOCALAPPDATA%\\CivicSuite\\Data\\models\\gemma-4-12b-it-qat-q4_0.gguf",
      partial_path: "%LOCALAPPDATA%\\CivicSuite\\Data\\models\\gemma-4-12b-it-qat-q4_0.gguf.part",
      expected_size_bytes: 6975877728,
      local_bytes: 0,
      partial_bytes: 0,
      progress_percent: 0,
      last_error: null,
      updated_at_unix_seconds: 0
    },
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
      admin_detail: "Browser preview fallback; Tauri provides live state in the desktop app.",
      actionable: false
    },
    {
      id: "local-data-folder",
      label: "City data folder",
      ok: false,
      status: "Needs setup",
      message: "City data folder has not been created yet.",
      next_action: "Use First Run or Repair to create the city data folder.",
      admin_detail: "%LOCALAPPDATA%\\CivicSuite\\Data",
      actionable: false
    },
    {
      id: "backup-folder",
      label: "Backup folder",
      ok: false,
      status: "Needs setup",
      message: "Backup folder has not been created yet.",
      next_action: "Use First Run or Backup Now to create the backup folder.",
      admin_detail: "%USERPROFILE%\\Documents\\CivicSuite Backups",
      actionable: false
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
    meeting_bodies: [],
    meeting_members: [],
    agenda_intakes: [],
    meetings: [],
    records_requests: [],
    code_sources: [],
    code_handoffs: [],
    adopted_legislation: [],
    audit_entries: [],
    publication_events: [],
    notification_events: []
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
  pendingModuleReviewAction: null,
  pendingModuleReviewId: null,
  pendingWorkReviewAction: null,
  workSelection: {
    meetingId: "",
    agendaIntakeId: "",
    publicCommentId: "",
    recordsRequestId: "",
    codeSourceId: "",
    codeHandoffId: "",
    notificationId: ""
  },
  setupDraft: {
    installRoot: "",
    dataRoot: "",
    backupRoot: "",
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
    meetingBodyId: "",
    meetingBodyName: "",
    meetingBodyType: "legislative",
    meetingBodyStatutoryBasis: "",
    meetingBodyCadence: "as scheduled",
    meetingBodyDefaultNoticeDays: "3",
    meetingBodyQuorumRule: "majority of seated members",
    memberName: "",
    memberRole: "",
    memberTermStart: "",
    memberTermEnd: "",
    memberEmail: "",
    meetingTitle: "",
    meetingDate: "",
    meetingSummary: "",
    agendaTitle: "",
    agendaIntakeTitle: "",
    agendaIntakeSubmitter: "",
    agendaIntakeDepartment: "",
    agendaIntakeSummary: "",
    agendaIntakeSourceReference: "",
    agendaIntakeMeetingDate: "",
    agendaIntakeDecision: "ready for agenda",
    agendaIntakeReviewNote: "",
    staffReportAgendaItemId: "",
    staffReportRecommendation: "",
    staffReportBackground: "",
    staffReportAnalysis: "",
    staffReportFiscalImpact: "",
    staffReportAlternatives: "",
    staffReportPriorActions: "",
    staffReportPreparedBy: "",
    staffReportRevisionNote: "",
    noticeMeetingType: "",
    noticeStatutoryBasis: "",
    noticeDeadline: "",
    noticeTimeZone: "America/Denver",
    noticeHumanApproval: false,
    noticeLocation: "",
    noticeMethod: "",
    noticeConfirmation: "",
    noticePostingDate: "",
    minutes: "",
    meetingAttachmentTitle: "",
    meetingAttachmentSourcePath: "",
    meetingAttachmentCitation: "",
    meetingAttachmentSection: "agenda packet",
    meetingAttachmentAccess: "public packet",
    packetTitle: "",
    packetPreparedBy: "",
    packetReviewNote: "",
    closedSessionBasis: "",
    closedSessionTopics: "",
    closedSessionAttendees: "",
    closedSessionEnteredAt: "",
    closedSessionExitedAt: "",
    closedSessionReconvene: "",
    closedSessionNotesReference: "",
    minutesCitationSentence: "",
    minutesCitationSourceType: "packet item",
    minutesCitationSourceRef: "",
    minutesCitationNote: "",
    minutesCitationAccess: "public record",
    minutesSignedBy: "",
    minutesSignatureAttestation: "",
    adoptedLegislationType: "ordinance",
    adoptedLegislationTitle: "",
    adoptedLegislationText: "",
    adoptedLegislationEffectiveDate: "",
    adoptedLegislationCodificationHint: "",
    motionText: "",
    motionMover: "",
    motionSeconder: "",
    motionDisposition: "pending vote",
    motionVoteReference: "",
    memberVoteMotionId: "",
    memberVoteMemberId: "",
    memberVoteMemberName: "",
    memberVoteValue: "aye",
    vote: "",
    actionItem: "",
    actionItemOwner: "",
    actionItemDueDate: "",
    actionItemStatus: "open",
    actionItemSourceReference: "",
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
    publicRequestMessage: "",
    recordsSummary: "",
    deadline: "",
    recordsDeadlineBasis: "",
    assignedTo: "",
    clarificationNote: "",
    requestMessageBody: "",
    documentTitle: "",
    documentSourcePath: "",
    documentCitation: "",
    sourceNote: "",
    recordsSearchQuery: "",
    searchLocations: "",
    searchResultTitle: "",
    searchResultCitation: "",
    searchResultSummary: "",
    searchResultStatus: "responsive",
    searchReviewer: "",
    exemptionNote: "",
    exemptionSource: "",
    exemptionKind: "",
    exemptionFinding: "",
    exemptionDecision: "redact",
    exemptionBasis: "",
    exemptionReviewer: "",
    feeEstimate: "",
    feeLineDescription: "",
    feeScheduleBasis: "",
    feeLineAmount: "",
    feeWaiverReason: "",
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
  const locations = state.app.first_run?.locations || fallbackState.first_run.locations;
  state.setupDraft.installRoot = locations.install_root || "";
  state.setupDraft.dataRoot = locations.data_root || "";
  state.setupDraft.backupRoot = locations.backup_root || "";
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
  if (module.selectable && module.contract_ready) return "Available";
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

function formatFeeCents(amountCents) {
  const cents = Number.isFinite(Number(amountCents)) ? Number(amountCents) : 0;
  const dollars = Math.trunc(cents / 100);
  const remainder = Math.abs(cents % 100);
  return `$${dollars}.${String(remainder).padStart(2, "0")}`;
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
  if (step.id === "locations") {
    return `
      <div class="setup-form" aria-label="Local folders">
        <label>App install folder <input type="text" data-setup-field="installRoot" value="${state.setupDraft.installRoot}" autocomplete="off" readonly /></label>
        <label>City data folder <input type="text" data-setup-field="dataRoot" value="${state.setupDraft.dataRoot}" autocomplete="off" /></label>
        <label>Backup folder <input type="text" data-setup-field="backupRoot" value="${state.setupDraft.backupRoot}" autocomplete="off" /></label>
        <small>The Windows installer owns the app folder. This screen controls local city data and backups.</small>
      </div>
    `;
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
  if (step.id === "backup") {
    return `
      <div class="setup-form" aria-label="Backup folder">
        <label>Backup folder <input type="text" data-setup-field="backupRoot" value="${state.setupDraft.backupRoot}" autocomplete="off" /></label>
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

function renderModelDownloadStatus(model) {
  const downloadState = model.download_state;
  if (!downloadState) return "";
  const downloadedBytes = Math.max(downloadState.local_bytes || 0, downloadState.partial_bytes || 0);
  return `
    <div class="model-download-status" aria-label="Model download progress">
      <div>
        <span>Download progress</span>
        <strong>${downloadState.status}</strong>
        <small>${downloadState.message}</small>
      </div>
      <div>
        <span>Saved locally</span>
        <strong>${formatBytes(downloadedBytes)} of ${formatBytes(downloadState.expected_size_bytes || model.download_size_bytes)}</strong>
        <small>${Number(downloadState.progress_percent || 0).toFixed(2)}% complete</small>
      </div>
      ${downloadState.last_error ? `
        <div class="download-error">
          <span>Last error</span>
          <strong>${downloadState.last_error}</strong>
        </div>
      ` : ""}
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
      ${renderModelDownloadStatus(model)}
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
  "create-meeting-body",
  "add-meeting-member",
  "review-agenda-intake",
  "promote-agenda-intake",
  "record-staff-report",
  "add-code-handoff-agenda",
  "add-meeting-attachment",
  "finalize-meeting-packet",
  "record-closed-session",
  "complete-notice-checklist",
  "post-notice",
  "export-meeting-packet",
  "add-minute-citation",
  "review-public-comment",
  "redact-public-comment",
  "suggest-minutes-draft",
  "adopt-minutes",
  "sign-minutes",
  "record-member-vote",
  "record-adopted-legislation",
  "archive-meeting",
  "set-records-deadline",
  "record-records-search-session",
  "approve-records-response",
  "suggest-records-response",
  "export-records-response",
  "fulfill-records-request",
  "close-records-request",
  "build-records-release-package",
  "mark-notification-sent",
  "add-records-message",
  "add-records-exemption-decision",
  "add-records-fee-line",
  "waive-records-fee",
  "approve-code-guidance",
  "suggest-code-guidance",
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

function meetingBodies(work = cityWork()) {
  return work.meeting_bodies || [];
}

function meetingMembers(work = cityWork()) {
  return work.meeting_members || [];
}

function agendaIntakes(work = cityWork()) {
  return work.agenda_intakes || [];
}

function currentMeeting(work = cityWork()) {
  return selectedFrom(work.meetings || [], state.workSelection.meetingId);
}

function currentAgendaIntake(work = cityWork()) {
  const intakes = agendaIntakes(work);
  return intakes.find((intake) => intake.id === state.workSelection.agendaIntakeId) ||
    intakes.find((intake) => intake.status !== "promoted to agenda") ||
    intakes[0] ||
    null;
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

function currentNotification(work = cityWork()) {
  const notifications = work.notification_events || [];
  return notifications.find((event) => event.id === state.workSelection.notificationId) ||
    notifications.find((event) => event.status === "ready to send") ||
    notifications[0] ||
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
  const agendaIntake = currentAgendaIntake(work);
  const request = currentRecordsRequest(work);
  const source = currentCodeSource(work);
  const handoff = currentCodeHandoff(work);
  const notification = currentNotification(work);
  const meetingSubject = meeting ? `${meeting.title} (${meeting.meeting_date})` : "Current meeting";
  const bodySubject = meetingBodies(work).find((body) => body.id === state.workDraft.meetingBodyId) || meetingBodies(work)[0] || null;
  const agendaIntakeSubject = agendaIntake ? `${agendaIntake.title} (${agendaIntake.department})` : "Current agenda intake item";
  const staffReportAgendaItem = meeting?.agenda_items?.find((item) => item.id === state.workDraft.staffReportAgendaItemId) || meeting?.agenda_items?.[0] || null;
  const staffReportSubject = staffReportAgendaItem ? staffReportAgendaItem.title : "Current agenda item";
  const rosterMembers = meetingMembers(work).filter((member) => !meeting || !meeting.body_id || member.body_id === meeting.body_id);
  const selectedMemberVoteMember = rosterMembers.find((member) => member.id === state.workDraft.memberVoteMemberId || member.name === state.workDraft.memberVoteMemberName) || rosterMembers[0] || null;
  const meetingMotionsForVote = meeting?.motions || [];
  const selectedMemberVoteMotion = meetingMotionsForVote.find((motion) => motion.id === state.workDraft.memberVoteMotionId) || meetingMotionsForVote[meetingMotionsForVote.length - 1] || null;
  const publicCommentSubject = publicComment ? `${publicComment.commenter_name}: ${publicComment.topic || "Public comment"}` : "Current public comment";
  const requestSubject = request ? `${request.requester}: ${request.summary}` : "Current records request";
  const sourceSubject = source ? `${source.title} (${source.citation})` : "Current code source";
  const handoffSubject = handoff ? handoff.title : "Current code handoff";
  const notificationSubject = notification ? notification.subject : "Current local notification";
  const reviews = {
    "create-meeting-body": {
      title: "Review Before Saving Meeting Body",
      confirmLabel: "Save Meeting Body",
      module: "CivicClerk",
      subject: detailOrFallback(state.workDraft.meetingBodyName, "New meeting body"),
      status: "Local setup record",
      changes: "Stores the council, board, commission, or authority that holds meetings, including legal basis, cadence, default notice days, and quorum rule.",
      visibility: "Staff setup data. Meeting records can show the body name and statutory basis in packets, archives, and search.",
      sources: [
        detailOrFallback(state.workDraft.meetingBodyName, "Meeting body name is required."),
        detailOrFallback(state.workDraft.meetingBodyStatutoryBasis, "Statutory basis is required."),
        detailOrFallback(state.workDraft.meetingBodyCadence, "Meeting cadence will default to as scheduled if left blank."),
        detailOrFallback(state.workDraft.meetingBodyDefaultNoticeDays, "Default notice days will default to 3 if left blank."),
        detailOrFallback(state.workDraft.meetingBodyQuorumRule, "Quorum rule will default to majority of seated members if left blank.")
      ],
      audit: "Creates a CivicClerk audit entry for the meeting body setup record.",
      retry: "If the name, statutory basis, notice days, or duplicate check fails, the desktop app leaves local records unchanged."
    },
    "add-meeting-member": {
      title: "Review Before Saving Member",
      confirmLabel: "Save Member",
      module: "CivicClerk",
      subject: detailOrFallback(state.workDraft.memberName, "New meeting body member"),
      status: "Roster record",
      changes: "Adds this elected or appointed member to the selected meeting body roster for quorum and roll-call vote work.",
      visibility: "Meeting body roster data. Member names and roles can appear in staff workflows, meeting records, archives, and search.",
      sources: [
        bodySubject ? `Body: ${bodySubject.name}` : "A meeting body is required.",
        detailOrFallback(state.workDraft.memberName, "Member name is required."),
        detailOrFallback(state.workDraft.memberRole, "Member role is required."),
        detailOrFallback(state.workDraft.memberTermStart, "Term start is optional."),
        detailOrFallback(state.workDraft.memberTermEnd, "Term end is optional.")
      ],
      audit: "Creates a CivicClerk audit entry for the roster change.",
      retry: "If the body is missing, dates are invalid, required fields are blank, or the active member already exists, the roster stays unchanged."
    },
    "review-agenda-intake": {
      title: "Review Before Updating Agenda Intake",
      confirmLabel: "Review Agenda Intake",
      module: "CivicClerk",
      subject: agendaIntakeSubject,
      status: agendaIntake ? agendaIntake.status : "No agenda intake item selected yet.",
      changes: "Records the clerk readiness decision for a submitted agenda item before it can be promoted to a meeting agenda.",
      visibility: "Staff queue only. Resident/Public meeting materials do not show intake queue records.",
      sources: [
        agendaIntake ? detailOrFallback(agendaIntake.summary, "No intake summary is recorded.") : "The desktop app will require an intake item before saving.",
        agendaIntake ? detailOrFallback(agendaIntake.source_reference, "No source or citation is recorded.") : "The desktop app will require source evidence before saving.",
        detailOrFallback(state.workDraft.agendaIntakeDecision, "A readiness decision is required."),
        detailOrFallback(state.workDraft.agendaIntakeReviewNote, "A clerk review note is required.")
      ],
      audit: "Creates a CivicClerk audit entry for the agenda intake readiness decision.",
      retry: "If no intake item is selected, the decision is invalid, or the review note is missing, the desktop app leaves the queue unchanged."
    },
    "promote-agenda-intake": {
      title: "Review Before Promoting To Agenda",
      confirmLabel: "Promote To Agenda",
      module: "CivicClerk",
      subject: agendaIntakeSubject,
      status: agendaIntake ? agendaIntake.status : "No agenda intake item selected yet.",
      changes: "Adds the reviewed-ready intake item to the selected meeting agenda with department and source metadata.",
      visibility: "Meeting agenda draft. Public visibility follows the agenda item's visibility and public meeting/archive rules.",
      sources: [
        meeting ? `Target meeting: ${meetingSubject}` : "The desktop app will require a meeting before saving.",
        agendaIntake ? detailOrFallback(agendaIntake.source_reference, "No source or citation is recorded.") : "The desktop app will require an intake item before saving.",
        agendaIntake?.status === "ready for agenda" ? "Agenda intake is marked ready." : "Agenda intake must be reviewed as ready before promotion."
      ],
      audit: "Creates a CivicClerk audit entry linking the intake item to the selected meeting agenda.",
      retry: "If the intake item is not ready, no meeting exists, or the meeting is archived, the desktop app leaves both records unchanged."
    },
    "record-staff-report": {
      title: "Review Before Saving Staff Report",
      confirmLabel: "Save Staff Report",
      module: "CivicClerk",
      subject: staffReportSubject,
      status: meeting ? meeting.status : "No meeting selected yet.",
      changes: "Stores a structured staff report for the selected agenda item with recommendation, background, analysis, fiscal impact, alternatives, prior actions, preparer, and revision note.",
      visibility: "Staff packet material. It becomes part of the public archive only after the meeting is archived as a public record.",
      sources: [
        meeting ? `Target meeting: ${meetingSubject}` : "The desktop app will require a meeting before saving.",
        staffReportAgendaItem ? `Agenda item: ${staffReportAgendaItem.title}` : "An agenda item is required.",
        detailOrFallback(state.workDraft.staffReportRecommendation, "Recommendation is required."),
        detailOrFallback(state.workDraft.staffReportBackground, "Background is required."),
        detailOrFallback(state.workDraft.staffReportAnalysis, "Analysis is required."),
        detailOrFallback(state.workDraft.staffReportFiscalImpact, "Fiscal impact is required."),
        detailOrFallback(state.workDraft.staffReportPreparedBy, "Prepared-by name is required.")
      ],
      audit: "Creates a CivicClerk audit entry linking the staff report to the agenda item.",
      retry: "If required sections are missing, no agenda item exists, or the meeting is archived, the desktop app leaves the meeting unchanged."
    },
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
    "add-meeting-attachment": {
      title: "Review Before Attaching Packet File",
      confirmLabel: "Attach Packet File",
      module: "CivicClerk",
      subject: meetingSubject,
      status: meeting ? meeting.status : "No meeting selected yet.",
      changes: "Copies the selected local file into the city profile, records its SHA-256 hash, and adds it to the meeting packet evidence list.",
      visibility: state.workDraft.meetingAttachmentAccess === "closed-session addendum"
        ? "Staff-only closed-session addendum. It will not appear in resident/public meeting materials."
        : "Public packet attachment. Local Windows file paths remain hidden from resident/public materials.",
      sources: [
        meeting ? `Target meeting: ${meetingSubject}` : "The desktop app will require a meeting before saving.",
        detailOrFallback(state.workDraft.meetingAttachmentTitle, "Attachment title is required."),
        detailOrFallback(state.workDraft.meetingAttachmentSourcePath, "Attachment source file path is required."),
        detailOrFallback(state.workDraft.meetingAttachmentCitation, "No citation has been recorded yet."),
        detailOrFallback(state.workDraft.meetingAttachmentSection, "Packet section is required.")
      ],
      audit: "Creates a CivicClerk audit entry with the attachment title, access level, byte count, and SHA-256 hash.",
      retry: "If the file is missing, unreadable, or the meeting is archived, the desktop app leaves the meeting record unchanged."
    },
    "finalize-meeting-packet": {
      title: "Review Before Finalizing Packet",
      confirmLabel: "Finalize Packet",
      module: "CivicClerk",
      subject: detailOrFallback(state.workDraft.packetTitle, meeting ? `${meeting.title} agenda packet` : "Current meeting packet"),
      status: meeting ? meeting.status : "No meeting selected yet.",
      changes: "Stores a durable packet-finalization record with the clerk review note, agenda item count, public attachment count, and closed-session addendum count.",
      visibility: "Staff packet milestone now. It becomes part of the public meeting archive only after the meeting is archived as a public record.",
      sources: [
        meeting ? `Target meeting: ${meetingSubject}` : "The desktop app will require a meeting before saving.",
        meeting ? `${(meeting.agenda_items || []).length} agenda items ready for packet review.` : "At least one agenda item is required.",
        meeting ? `${(meeting.attachments || []).filter((attachment) => attachment.access_level === "public packet").length} public packet attachments.` : "Attachment counts will be recorded from the selected meeting.",
        meeting ? `${(meeting.attachments || []).filter((attachment) => attachment.access_level === "closed-session addendum").length} closed-session addenda.` : "Closed-session addendum counts will be recorded from the selected meeting.",
        detailOrFallback(state.workDraft.packetPreparedBy, "Prepared-by or reviewer name is required."),
        detailOrFallback(state.workDraft.packetReviewNote, "Packet review note is required.")
      ],
      audit: "Creates a CivicClerk audit entry for the packet finalization milestone and counts.",
      retry: "If no meeting exists, no agenda item exists, review fields are blank, or the meeting is archived, the desktop app leaves the packet unchanged."
    },
    "record-closed-session": {
      title: "Review Before Recording Closed Session",
      confirmLabel: "Record Closed Session",
      module: "CivicClerk",
      subject: meetingSubject,
      status: meeting ? meeting.status : "No meeting selected yet.",
      changes: "Stores the statutory basis, general topics, timing, reconvene statement, and optional staff-only notes reference for a closed-session block.",
      visibility: "Staff packets include the staff-only notes reference. Public archives keep only basis, topics, timing, and reconvene statement.",
      sources: [
        detailOrFallback(state.workDraft.closedSessionBasis, "Statutory basis is required."),
        detailOrFallback(state.workDraft.closedSessionTopics, "At least one general topic is required."),
        detailOrFallback(state.workDraft.closedSessionEnteredAt, "Entered time is required."),
        detailOrFallback(state.workDraft.closedSessionExitedAt, "Exited time is required."),
        detailOrFallback(state.workDraft.closedSessionReconvene, "Reconvene statement is required.")
      ],
      audit: "Creates a CivicClerk audit entry for the closed-session boundary and staff-only notes reference.",
      retry: "If required basis, topic, timing, or reconvene evidence is missing, the desktop app leaves the meeting unchanged."
    },
    "complete-notice-checklist": {
      title: "Review Before Approving Notice Checklist",
      confirmLabel: "Approve Notice Checklist",
      module: "CivicClerk",
      subject: meetingSubject,
      status: meeting ? `${meeting.status}; ${meeting.notice_status}` : "No meeting selected yet.",
      changes: "Records the meeting type, statutory notice basis, deadline, time zone, and clerk approval needed before posting proof can mark the notice ready.",
      visibility: "Internal checklist until the notice is posted or the meeting is archived.",
      sources: [
        meeting ? `${(meeting.agenda_items || []).length} agenda item(s)` : "The desktop app will require a meeting before saving.",
        detailOrFallback(state.workDraft.noticeMeetingType, "Meeting type is required."),
        detailOrFallback(state.workDraft.noticeStatutoryBasis, "Statutory notice basis is required."),
        detailOrFallback(state.workDraft.noticeDeadline, "Notice deadline is required."),
        detailOrFallback(state.workDraft.noticeTimeZone, "Notice time zone is required."),
        state.workDraft.noticeHumanApproval ? "Clerk approval checked." : "Clerk approval is required."
      ],
      audit: "Creates a CivicClerk audit entry for checklist approval without claiming legal sufficiency.",
      retry: "If required checklist details are missing, the time zone is invalid, or approval is not checked, the desktop app leaves the notice unchanged."
    },
    "post-notice": {
      title: "Review Before Posting Notice",
      confirmLabel: "Mark Notice Ready",
      module: "CivicClerk",
      subject: meetingSubject,
      status: meeting ? `${meeting.status}; ${meeting.notice_status}` : "No meeting selected yet.",
      changes: "Records final posting proof and marks the current meeting notice as ready for public posting after the approved checklist passes.",
      visibility: "Resident/Public meeting materials can show posted notice information.",
      sources: [
        meeting ? `${(meeting.agenda_items || []).length} agenda item(s)` : "The desktop app will require a meeting before saving.",
        meeting && (meeting.notice_checklists || []).length > 0 ? "Notice checklist approved." : "Approved notice checklist is required.",
        detailOrFallback(state.workDraft.noticePostingDate, "Actual posting date is required."),
        detailOrFallback(meeting?.summary, "No meeting summary has been recorded yet."),
        detailOrFallback(state.workDraft.noticeLocation, "Posting location is required."),
        detailOrFallback(state.workDraft.noticeConfirmation, "Posting confirmation evidence is required.")
      ],
      audit: "Creates a CivicClerk audit entry for posting the notice with location, method, and confirmation evidence.",
      retry: "If required meeting details are missing, the desktop app shows the issue and leaves the notice unchanged."
    },
    "export-meeting-packet": {
      title: "Review Before Exporting Packet",
      confirmLabel: "Export Packet",
      module: "CivicClerk",
      subject: meetingSubject,
      status: meeting ? meeting.status : "No meeting selected yet.",
      changes: "Writes a local packet export from the meeting agenda, packet attachments, minutes, motions, roll-call votes, outcomes, action items, and comments.",
      visibility: "Exported packet material remains local staff work unless later posted or archived.",
      sources: [
        meeting ? `${(meeting.agenda_items || []).length} agenda item(s); ${(meeting.attachments || []).length} packet attachment(s); ${(meeting.motions || []).length} motion(s); ${(meeting.member_votes || []).length} roll-call vote(s); ${(meeting.votes || []).length} recorded outcome(s)` : "The desktop app will require a meeting before saving.",
        detailOrFallback(meeting?.minutes, "No minutes draft has been saved yet.")
      ],
      audit: "Creates a CivicClerk audit entry for the packet export.",
      retry: "If the export path is unavailable, the desktop app reports the failure and preserves the meeting record."
    },
    "suggest-minutes-draft": {
      title: "Review Before Generating Minutes Draft",
      confirmLabel: "Generate Minutes Draft",
      module: "CivicClerk",
      subject: meetingSubject,
      status: meeting ? meeting.status : "No meeting selected yet.",
      changes: "Uses the verified local AI model to draft internal meeting minutes from the meeting summary, agenda, packet attachments, motions, roll-call votes, outcomes, action items, and comments. It does not adopt or archive the minutes.",
      visibility: "Internal staff draft only. A clerk must review, edit, and adopt minutes before the public archive step.",
      sources: [
        meeting ? `${(meeting.agenda_items || []).length} agenda item(s); ${(meeting.attachments || []).length} packet attachment(s); ${(meeting.motions || []).length} motion(s); ${(meeting.member_votes || []).length} roll-call vote(s); ${(meeting.votes || []).length} outcome(s); ${((meeting.action_records || []).length || (meeting.action_items || []).length)} action item(s)` : "The desktop app will require a meeting before generating.",
        detailOrFallback(meeting?.summary, "No meeting summary has been recorded yet.")
      ],
      audit: "Creates a CivicClerk audit entry naming the local model used for the minutes draft.",
      retry: "If the local AI model is not ready, the minutes are already adopted, or no meeting evidence exists, the desktop app stops before changing the draft."
    },
    "add-minute-citation": {
      title: "Review Before Adding Minute Citation",
      confirmLabel: "Add Minute Citation",
      module: "CivicClerk",
      subject: meetingSubject,
      status: meeting ? meeting.status : "No meeting selected yet.",
      changes: "Adds source evidence for a specific sentence or excerpt in the current minutes draft.",
      visibility: state.workDraft.minutesCitationAccess === "staff-only"
        ? "Staff-only citation evidence. It will not appear in resident/public archive material."
        : "Public record citation evidence can appear with archived minutes.",
      sources: [
        detailOrFallback(state.workDraft.minutesCitationSentence, "Minutes sentence or excerpt is required."),
        detailOrFallback(state.workDraft.minutesCitationSourceType, "Source type is required."),
        detailOrFallback(state.workDraft.minutesCitationSourceRef, "Source reference is required."),
        detailOrFallback(meeting?.minutes, "No minutes draft has been saved yet.")
      ],
      audit: "Creates a CivicClerk audit entry for the minute citation source reference.",
      retry: "If the sentence is not in the current draft, the source reference is missing, or the meeting is archived, the desktop app leaves the minutes unchanged."
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
        meeting && (meeting.minute_citations || []).length > 0 ? `${(meeting.minute_citations || []).length} minute citation(s) recorded.` : "At least one minute citation is required.",
        meeting ? `${(meeting.motions || []).length} motion(s); ${(meeting.member_votes || []).length} roll-call vote(s); ${(meeting.votes || []).length} vote/outcome record(s)` : "The desktop app will require a meeting before saving."
      ],
      audit: "Creates a CivicClerk audit entry for adopting minutes.",
      retry: "If no minutes draft or citation evidence exists, the desktop app blocks adoption and asks staff to save minutes and add citations first."
    },
    "sign-minutes": {
      title: "Review Before Signing Minutes",
      confirmLabel: "Sign Minutes",
      module: "CivicClerk",
      subject: meetingSubject,
      status: meeting ? meeting.status : "No meeting selected yet.",
      changes: "Records the clerk or authorized signer attestation for the adopted minutes before they can become an archived public record.",
      visibility: "Signed minutes remain local staff records until archive/publication. The signer and attestation appear in the public archive after publication.",
      sources: [
        meeting?.minutes_adopted_at_unix_seconds ? "Minutes have been adopted." : "Minutes must be adopted before signing.",
        detailOrFallback(state.workDraft.minutesSignedBy, "Signer name is required."),
        detailOrFallback(state.workDraft.minutesSignatureAttestation, "Signature attestation is required.")
      ],
      audit: "Creates a CivicClerk audit entry for signing the adopted minutes.",
      retry: "If minutes are not adopted, already signed, or signer evidence is missing, the desktop app blocks signing and leaves the meeting unchanged."
    },
    "record-member-vote": {
      title: "Review Before Recording Roll Call Vote",
      confirmLabel: "Record Roll Call Vote",
      module: "CivicClerk",
      subject: selectedMemberVoteMotion ? selectedMemberVoteMotion.text : "Current motion",
      status: meeting ? meeting.status : "No meeting selected yet.",
      changes: "Records one member's individual roll-call vote against the selected motion.",
      visibility: "Staff meeting record. Roll-call votes appear in the public archive after minutes signing and meeting archive.",
      sources: [
        meeting ? `Target meeting: ${meetingSubject}` : "The desktop app will require a meeting before saving.",
        selectedMemberVoteMotion ? `Motion: ${selectedMemberVoteMotion.text}` : "A motion is required before recording roll-call votes.",
        selectedMemberVoteMember ? `Member: ${selectedMemberVoteMember.name}` : "A member roster entry is required.",
        detailOrFallback(state.workDraft.memberVoteValue, "Vote value is required.")
      ],
      audit: "Creates a CivicClerk audit entry for the individual roll-call vote.",
      retry: "If no motion, member, valid vote value, or editable meeting exists, the desktop app leaves the meeting unchanged."
    },
    "record-adopted-legislation": {
      title: "Review Before Recording Adopted Legislation",
      confirmLabel: "Record Adoption",
      module: "CivicClerk + CivicCode",
      subject: meetingSubject,
      status: meeting ? meeting.status : "No meeting selected yet.",
      changes: "Creates a durable adopted ordinance or resolution record, links it to the meeting's passed motion, and queues a CivicCode draft source for codifier sync.",
      visibility: "Staff workflow until the meeting archive and code publication gates are completed. CivicCode source publication remains a separate staff action.",
      sources: [
        meeting?.minutes_signed_at_unix_seconds ? "Minutes have been signed." : "Minutes must be signed before recording adopted legislation.",
        meeting && (meeting.motions || []).some((motion) => motion.disposition === "passed") ? "Passed motion is available for traceability." : "A passed motion is required.",
        detailOrFallback(state.workDraft.adoptedLegislationTitle, "Adopted title is required."),
        detailOrFallback(state.workDraft.adoptedLegislationText, "Adopted text is required.")
      ],
      audit: "Creates CivicClerk and CivicCode audit entries linking the adoption event to the local code source queue.",
      retry: "If minutes are not signed, no passed motion exists, or required adoption text is missing, the desktop app leaves Clerk and Code records unchanged."
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
        meeting?.minutes_signed_at_unix_seconds ? `Signed by ${meeting.minutes_signed_by || "authorized signer"}.` : "Minutes are not signed yet.",
        meeting ? `${(meeting.exports || []).length} existing export(s)` : "The desktop app will require a meeting before saving."
      ],
      audit: "Creates CivicClerk audit and CivicCore publication-gate entries.",
      retry: "If minutes are not adopted or signed, the desktop app blocks archive and leaves the meeting editable."
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
    "set-records-deadline": {
      title: "Review Before Setting Records Deadline",
      confirmLabel: "Set Deadline",
      module: "CivicRecords AI",
      subject: requestSubject,
      status: request ? request.status : "No records request selected yet.",
      changes: "Stores the reviewed response deadline and statutory or policy basis for the selected records request.",
      visibility: "Requester status can show the reviewed deadline. Internal search, exemptions, drafts, and approvals remain staff-only.",
      sources: [
        request ? detailOrFallback(request.summary, "No request summary is recorded.") : "The desktop app will require a request before saving.",
        detailOrFallback(state.workDraft.deadline, "Response deadline is required."),
        detailOrFallback(state.workDraft.recordsDeadlineBasis, "Deadline basis is required.")
      ],
      audit: "Creates a CivicRecords AI audit entry for deadline review.",
      retry: "If the deadline date or basis is missing or invalid, the desktop app leaves the request unchanged."
    },
    "add-records-message": {
      title: "Review Before Adding Request Message",
      confirmLabel: "Add Request Message",
      module: "CivicRecords AI",
      subject: requestSubject,
      status: request ? request.status : "No records request selected yet.",
      changes: "Adds a requester-visible message to the selected request thread and queues a local notification log entry.",
      visibility: "Visible to staff and to the requester after a matching request-number/contact lookup. It is not exposed in general public search.",
      sources: [
        request ? detailOrFallback(request.public_tracking_number, "No public tracking number is recorded.") : "The desktop app will require a request before saving.",
        detailOrFallback(state.workDraft.requestMessageBody, "Request message is required.")
      ],
      audit: "Creates a CivicRecords AI audit entry and timeline entry for the request message.",
      retry: "If no message or active request exists, the desktop app leaves the request thread unchanged."
    },
    "add-records-exemption-decision": {
      title: "Review Before Saving Exemption Decision",
      confirmLabel: "Save Exemption Decision",
      module: "CivicRecords AI",
      subject: requestSubject,
      status: request ? request.status : "No records request selected yet.",
      changes: "Saves a structured release, redact, or exempt decision for one source segment.",
      visibility: "Staff-only exemption evidence remains local and is included in the exported response package after approval.",
      sources: [
        detailOrFallback(state.workDraft.exemptionSource, "Source record, page, file, timestamp, or segment is required."),
        detailOrFallback(state.workDraft.exemptionDecision, "Decision must be release, redact, or exempt."),
        detailOrFallback(state.workDraft.exemptionBasis, "Statute, ordinance, or city policy basis is required.")
      ],
      audit: "Creates a CivicRecords AI audit entry and request timeline entry for the decision.",
      retry: "If the source, finding, decision, or basis is missing, the desktop app leaves exemption evidence unchanged."
    },
    "record-records-search-session": {
      title: "Review Before Saving Search Session",
      confirmLabel: "Save Search Session",
      module: "CivicRecords AI",
      subject: requestSubject,
      status: request ? request.status : "No records request selected yet.",
      changes: "Saves a durable query, searched locations, and source-result evidence for the selected records request.",
      visibility: "Staff-only search evidence remains local and is included in the exported response package after approval.",
      sources: [
        detailOrFallback(state.workDraft.recordsSearchQuery, "Records search query or scope is required."),
        detailOrFallback(state.workDraft.searchLocations, "Searched systems, folders, or source locations are required."),
        detailOrFallback(state.workDraft.searchResultCitation, "Result citation or source reference is required.")
      ],
      audit: "Creates a CivicRecords AI audit entry and request timeline entry for the search session.",
      retry: "If query, locations, result title, citation, or summary are missing, the desktop app leaves search evidence unchanged."
    },
    "add-records-fee-line": {
      title: "Review Before Adding Records Fee Line",
      confirmLabel: "Add Fee Line",
      module: "CivicRecords AI",
      subject: requestSubject,
      status: request ? request.status : "No records request selected yet.",
      changes: "Adds a structured fee line item and updates the request fee estimate.",
      visibility: "Staff-only fee evidence remains local and is included in the exported response package.",
      sources: [
        detailOrFallback(state.workDraft.feeLineDescription, "Fee line description is required."),
        detailOrFallback(state.workDraft.feeScheduleBasis, "Fee schedule or policy basis is required."),
        detailOrFallback(state.workDraft.feeLineAmount, "Fee line amount is required.")
      ],
      audit: "Creates a CivicRecords AI audit entry for the fee line.",
      retry: "If the amount is missing, zero, negative, or not dollars/cents, the desktop app leaves the request unchanged."
    },
    "waive-records-fee": {
      title: "Review Before Waiving Records Fee",
      confirmLabel: "Waive Fee",
      module: "CivicRecords AI",
      subject: requestSubject,
      status: request ? request.status : "No records request selected yet.",
      changes: "Records a fee waiver reason and updates the request fee estimate to waived.",
      visibility: "Staff-only waiver evidence remains local and is included in the exported response package.",
      sources: [
        detailOrFallback(state.workDraft.feeWaiverReason, "Fee waiver reason is required."),
        request ? `${(request.fee_line_items || []).length} fee line item(s) currently recorded.` : "The desktop app will require a request before saving."
      ],
      audit: "Creates a CivicRecords AI audit entry for the fee waiver.",
      retry: "If no waiver reason is entered, the desktop app leaves the request fee state unchanged."
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
        request ? `${(request.exemption_reviews || []).length} exemption review note(s); ${(request.exemption_decisions || []).length} exemption decision(s); ${(request.citations || []).length} citation(s)` : "The desktop app will require a request before saving."
      ],
      audit: "Creates a CivicRecords AI audit entry for human approval.",
      retry: "If the response draft is missing, the desktop app blocks approval before release steps."
    },
    "suggest-records-response": {
      title: "Review Before Generating Records Draft",
      confirmLabel: "Generate Draft",
      module: "CivicRecords AI",
      subject: requestSubject,
      status: request ? request.status : "No records request selected yet.",
      changes: "Uses the verified local AI model to draft an internal response for staff review. It does not approve, export, or fulfill the request.",
      visibility: "Internal staff draft only. A human must review, edit, cite, and approve before any release step.",
      sources: [
        detailOrFallback(request?.summary, "No request summary has been saved yet."),
        request ? `${(request.search_notes || []).length} search note(s); ${(request.citations || []).length} citation(s)` : "The desktop app will require a request before generating."
      ],
      audit: "Creates a CivicRecords AI audit entry naming the local model used for the draft.",
      retry: "If the local AI model is not ready or no search/citation evidence exists, the desktop app stops before changing the draft."
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
    "build-records-release-package": {
      title: "Review Before Building Release Package",
      confirmLabel: "Build Release Package",
      module: "CivicRecords AI",
      subject: requestSubject,
      status: request ? request.status : "No records request selected yet.",
      changes: "Writes a checksummed release package manifest with search, document, and exemption decision evidence.",
      visibility: "The manifest stays local staff evidence until the request is fulfilled; public status does not expose local file paths.",
      sources: [
        request ? `${(request.search_sessions || []).length} search session(s); ${(request.documents || []).length} attached document(s)` : "The desktop app will require a request before building.",
        request ? `${(request.exemption_decisions || []).length} exemption decision(s)` : "The desktop app will require release/redact/exempt decisions."
      ],
      audit: "Creates a CivicRecords AI audit entry and request timeline entry with the package hash.",
      retry: "If source evidence or exemption decisions are missing, the desktop app leaves release package state unchanged."
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
        request ? `${(request.exports || []).length} export package(s); ${(request.release_packages || []).length} release package manifest(s)` : "The desktop app will require a request before saving."
      ],
      audit: "Creates CivicRecords AI audit and CivicCore publication-gate entries.",
      retry: "If approval, export, or release package evidence is missing, the desktop app blocks fulfillment."
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
    "mark-notification-sent": {
      title: "Review Before Logging Notification Sent",
      confirmLabel: "Log Notification Sent",
      module: "CivicCore + CivicRecords AI",
      subject: notificationSubject,
      status: notification ? notification.status : "No local notification selected yet.",
      changes: "Marks the selected local notification outbox item as sent or otherwise handled by staff.",
      visibility: "Staff-only notification evidence stays in the local city profile and never appears on the Resident/Public surface.",
      sources: [
        notification ? `Audience: ${notification.audience}` : "The desktop app will require a notification before saving.",
        detailOrFallback(notification?.body, "No notification body is recorded yet.")
      ],
      audit: "Creates an audit entry for the module that produced the notification.",
      retry: "If the notification is already logged as sent or no ready notification exists, the desktop app leaves the outbox unchanged."
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
    "suggest-code-guidance": {
      title: "Review Before Generating Code Guidance",
      confirmLabel: "Generate Guidance",
      module: "CivicCode",
      subject: sourceSubject,
      status: source ? source.status : "No code source selected yet.",
      changes: "Uses the verified local AI model to draft internal staff guidance from the selected source text.",
      visibility: "Internal staff draft only. A human must review and approve before it can support public summaries.",
      sources: [
        source ? `Citation: ${source.citation}` : "The desktop app will require a code source before generating.",
        detailOrFallback(source?.body, "No source text has been imported yet.")
      ],
      audit: "Creates a CivicCode audit entry naming the local model used for the draft.",
      retry: "If the local AI model is not ready or no source exists, the desktop app stops before changing guidance."
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
    public_comments: (meeting.public_comments || []).map(publicCommentView).filter(Boolean),
    attachments: (meeting.attachments || [])
      .filter((attachment) => attachment.access_level === "public packet")
      .map((attachment) => ({
        ...attachment,
        original_path: "",
        stored_path: "",
        added_by: ""
    })),
    staff_reports: meeting.staff_reports || [],
    packet_assemblies: meeting.packet_assemblies || [],
    member_votes: meeting.member_votes || [],
    minute_citations: (meeting.minute_citations || [])
      .filter((citation) => citation.access_level === "public record"),
    closed_sessions: (meeting.closed_sessions || []).map((session) => ({
      ...session,
      attendees: [],
      staff_notes_reference: ""
    }))
  };
  if (!publicArchive) {
    publicMeeting.minutes = "";
    publicMeeting.minute_citations = [];
    publicMeeting.minutes_signed_by = "";
    publicMeeting.minutes_signature_attestation = "";
    publicMeeting.minutes_signed_at_unix_seconds = null;
    publicMeeting.motions = [];
    publicMeeting.member_votes = [];
    publicMeeting.votes = [];
    publicMeeting.staff_reports = [];
    publicMeeting.action_items = [];
    publicMeeting.action_records = [];
    publicMeeting.adopted_legislation = [];
    publicMeeting.closed_sessions = [];
    publicMeeting.packet_assemblies = [];
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
          <p><strong>Body:</strong> ${escapeHtml(meeting.body_name || "City Council")}</p>
          <p>${meeting.summary || "No public summary recorded."}</p>
          ${(meeting.staff_reports || []).length > 0 ? `<p><strong>Staff reports:</strong> ${(meeting.staff_reports || []).map((report) => `${escapeHtml(report.agenda_item_title)} - ${escapeHtml(report.recommendation)}`).join("; ")}</p>` : ""}
          ${(meeting.attachments || []).length > 0 ? `<p><strong>Public packet attachments:</strong> ${(meeting.attachments || []).map((attachment) => `${escapeHtml(attachment.title)} (${escapeHtml(attachment.packet_section)})`).join("; ")}</p>` : ""}
          ${(meeting.packet_assemblies || []).length > 0 ? `<p><strong>Packet finalization:</strong> ${(meeting.packet_assemblies || []).map((packet) => `${escapeHtml(packet.packet_title)} (${escapeHtml(packet.status)}; reviewed by ${escapeHtml(packet.prepared_by)})`).join("; ")}</p>` : ""}
          ${(meeting.member_votes || []).length > 0 ? `<p><strong>Roll-call votes:</strong> ${(meeting.member_votes || []).map((vote) => `${escapeHtml(vote.member_name)} ${escapeHtml(vote.vote)} on ${escapeHtml(vote.motion_text)}`).join("; ")}</p>` : ""}
          ${(meeting.minute_citations || []).length > 0 ? `<p><strong>Public minute citations:</strong> ${(meeting.minute_citations || []).map((citation) => `${escapeHtml(citation.source_type)} ${escapeHtml(citation.source_reference)}`).join("; ")}</p>` : ""}
          <small>${meeting.meeting_date} - ${escapeHtml(meeting.body_name || "City Council")} - ${(meeting.agenda_items || []).length} agenda items - ${(meeting.staff_reports || []).length} staff reports - ${(meeting.attachments || []).length} packet attachments - ${(meeting.packet_assemblies || []).length} packet finalizations - ${(meeting.minute_citations || []).length} minute citations - ${(meeting.motions || []).length} motions - ${(meeting.member_votes || []).length} roll-call votes - ${(meeting.votes || []).length} outcomes - ${publicReadyCommentCount(meeting)} reviewed public comments - ${(meeting.exports || []).length} public exports</small>
        </article>
      `).join("")}
    </section>
  `;
}

function renderMeetingsWorkflow() {
  if (isPublicSurface()) return renderPublicMeetingsWorkflow();
  const work = cityWork();
  const bodies = meetingBodies(work);
  const selectedBodyId = state.workDraft.meetingBodyId || bodies[0]?.id || "";
  const selectedMeeting = currentMeeting(work);
  const selectedMeetingAgendaItems = selectedMeeting?.agenda_items || [];
  const selectedStaffReportAgendaItemId = state.workDraft.staffReportAgendaItemId || selectedMeetingAgendaItems[0]?.id || "";
  const rosterMembers = meetingMembers(work).filter((member) => !selectedMeeting || !selectedMeeting.body_id || member.body_id === selectedMeeting.body_id);
  const selectedMeetingMotions = selectedMeeting?.motions || [];
  const selectedMemberVoteMotionId = selectedMeetingMotions.some((motion) => motion.id === state.workDraft.memberVoteMotionId)
    ? state.workDraft.memberVoteMotionId
    : selectedMeetingMotions[selectedMeetingMotions.length - 1]?.id || "";
  const selectedMemberVoteMemberId = rosterMembers.some((member) => member.id === state.workDraft.memberVoteMemberId)
    ? state.workDraft.memberVoteMemberId
    : rosterMembers[0]?.id || "";
  const selectedAgendaIntake = currentAgendaIntake(work);
  const selectedAgendaIntakeCanReview = selectedAgendaIntake && selectedAgendaIntake.status !== "promoted to agenda";
  const selectedAgendaIntakeCanPromote = selectedAgendaIntake && selectedMeeting && selectedAgendaIntake.status === "ready for agenda";
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
        <h3>Meeting Bodies</h3>
        <p class="form-help">Set up the council, board, commission, or authority that holds meetings before scheduling recurring work.</p>
        <label>Meeting body name <input type="text" data-work-field="meetingBodyName" value="${state.workDraft.meetingBodyName}" placeholder="City Council" /></label>
        <label>Body type <input type="text" data-work-field="meetingBodyType" value="${state.workDraft.meetingBodyType}" placeholder="legislative, advisory, authority" /></label>
        <label>Body statutory basis <input type="text" data-work-field="meetingBodyStatutoryBasis" value="${state.workDraft.meetingBodyStatutoryBasis}" placeholder="Municipal charter or ordinance section" /></label>
        <label>Meeting cadence <input type="text" data-work-field="meetingBodyCadence" value="${state.workDraft.meetingBodyCadence}" placeholder="First and third Tuesday" /></label>
        <label>Default notice days <input type="number" min="0" max="365" data-work-field="meetingBodyDefaultNoticeDays" value="${state.workDraft.meetingBodyDefaultNoticeDays}" /></label>
        <label>Quorum rule <input type="text" data-work-field="meetingBodyQuorumRule" value="${state.workDraft.meetingBodyQuorumRule}" placeholder="majority of seated members" /></label>
        <div class="workflow-actions">
          <button type="button" class="secondary-action" data-work-action="create-meeting-body">Save Meeting Body</button>
        </div>
        <p class="form-help">${bodies.length === 0 ? "No meeting bodies saved yet." : `Saved bodies: ${bodies.map((body) => escapeHtml(body.name)).join(", ")}`}</p>
      </div>
      <div class="workflow-form">
        <h3>Member Roster</h3>
        <p class="form-help">Save council, board, commission, or authority members before recording roll-call votes.</p>
        <label>Roster body
          ${bodies.length > 0 ? `<select data-work-field="meetingBodyId">
            ${bodies.map((body) => `<option value="${escapeHtml(body.id)}" ${body.id === selectedBodyId ? "selected" : ""}>${escapeHtml(body.name)} - ${escapeHtml(body.statutory_basis)}</option>`).join("")}
          </select>` : `<input type="text" data-work-field="meetingBodyName" value="${state.workDraft.meetingBodyName}" placeholder="City Council" />`}
        </label>
        <label>Member name <input type="text" data-work-field="memberName" value="${state.workDraft.memberName}" /></label>
        <label>Member role <input type="text" data-work-field="memberRole" value="${state.workDraft.memberRole}" placeholder="Mayor, Councilmember, Chair" /></label>
        <label>Term start <input type="date" data-work-field="memberTermStart" value="${state.workDraft.memberTermStart}" /></label>
        <label>Term end <input type="date" data-work-field="memberTermEnd" value="${state.workDraft.memberTermEnd}" /></label>
        <label>Member email <input type="email" data-work-field="memberEmail" value="${state.workDraft.memberEmail}" /></label>
        <div class="workflow-actions">
          ${bodies.length === 0 ? `<button type="button" class="secondary-action" disabled>Save Member</button>` : `<button type="button" class="secondary-action" data-work-action="add-meeting-member">Save Member</button>`}
        </div>
        <p class="form-help">${meetingMembers(work).length === 0 ? "No roster members saved yet." : `Roster members: ${meetingMembers(work).map((member) => `${escapeHtml(member.name)} (${escapeHtml(member.role)})`).join(", ")}`}</p>
      </div>
      <div class="workflow-form">
        <h3>Agenda Intake Queue</h3>
        <p class="form-help">Capture department requests and source material before the clerk promotes an item to a meeting agenda.</p>
        <label>Intake title <input type="text" data-work-field="agendaIntakeTitle" value="${state.workDraft.agendaIntakeTitle}" /></label>
        <label>Submitted by <input type="text" data-work-field="agendaIntakeSubmitter" value="${state.workDraft.agendaIntakeSubmitter}" /></label>
        <label>Department <input type="text" data-work-field="agendaIntakeDepartment" value="${state.workDraft.agendaIntakeDepartment}" /></label>
        <label>Requested meeting date <input type="date" data-work-field="agendaIntakeMeetingDate" value="${state.workDraft.agendaIntakeMeetingDate}" /></label>
        <label>Intake summary <textarea data-work-field="agendaIntakeSummary">${state.workDraft.agendaIntakeSummary}</textarea></label>
        <label>Source or citation <input type="text" data-work-field="agendaIntakeSourceReference" value="${state.workDraft.agendaIntakeSourceReference}" placeholder="Department memo, staff report, code section, or file reference" /></label>
        <div class="workflow-actions">
          <button type="button" class="secondary-action" data-work-action="submit-agenda-intake">Submit Agenda Intake</button>
        </div>
      </div>
      <div class="workflow-form">
        <h3>Review Agenda Intake</h3>
        <p class="form-help">${selectedAgendaIntake ? `${selectedAgendaIntake.title} - ${selectedAgendaIntake.status}` : "No agenda intake item is selected for review."}</p>
        <label>Readiness decision
          <select data-work-field="agendaIntakeDecision">
            ${["ready for agenda", "needs more information"].map((decision) => `<option value="${decision}" ${state.workDraft.agendaIntakeDecision === decision ? "selected" : ""}>${decision}</option>`).join("")}
          </select>
        </label>
        <label>Clerk review note <textarea data-work-field="agendaIntakeReviewNote">${state.workDraft.agendaIntakeReviewNote}</textarea></label>
        <div class="workflow-actions">
          ${selectedAgendaIntakeCanReview ? `<button type="button" class="secondary-action" data-work-action="review-agenda-intake">Review Agenda Intake</button>` : `<button type="button" class="secondary-action" disabled>Review Agenda Intake</button>`}
          ${selectedAgendaIntakeCanPromote ? `<button type="button" class="secondary-action" data-work-action="promote-agenda-intake">Promote To Agenda</button>` : `<button type="button" class="secondary-action" disabled>Promote To Agenda</button>`}
        </div>
      </div>
      <div class="workflow-form">
        <h3>Prepare Meeting</h3>
        <label>Meeting body
          ${bodies.length > 0 ? `<select data-work-field="meetingBodyId">
            ${bodies.map((body) => `<option value="${escapeHtml(body.id)}" ${body.id === selectedBodyId ? "selected" : ""}>${escapeHtml(body.name)} - ${escapeHtml(body.statutory_basis)}</option>`).join("")}
          </select>` : `<input type="text" data-work-field="meetingBodyName" value="${state.workDraft.meetingBodyName}" placeholder="City Council" />`}
        </label>
        ${bodies.length === 0 ? `<p class="form-help">Save a meeting body with statutory basis before creating a meeting.</p>` : ""}
        <label>Meeting title <input type="text" data-work-field="meetingTitle" value="${state.workDraft.meetingTitle}" /></label>
        <label>Date <input type="date" data-work-field="meetingDate" value="${state.workDraft.meetingDate}" /></label>
        <label>Summary <textarea data-work-field="meetingSummary">${state.workDraft.meetingSummary}</textarea></label>
        <label>First agenda item <input type="text" data-work-field="agendaTitle" value="${state.workDraft.agendaTitle}" /></label>
        <label>Notice meeting type <input type="text" data-work-field="noticeMeetingType" value="${state.workDraft.noticeMeetingType}" placeholder="Regular council meeting" /></label>
        <label>Statutory notice basis <input type="text" data-work-field="noticeStatutoryBasis" value="${state.workDraft.noticeStatutoryBasis}" placeholder="Municipal open meetings notice" /></label>
        <label>Notice deadline <input type="date" data-work-field="noticeDeadline" value="${state.workDraft.noticeDeadline}" /></label>
        <label>Notice time zone <input type="text" data-work-field="noticeTimeZone" value="${state.workDraft.noticeTimeZone}" placeholder="America/Denver" /></label>
        <label class="checkbox-row"><input type="checkbox" data-work-field="noticeHumanApproval" ${state.workDraft.noticeHumanApproval ? "checked" : ""} /> Clerk has reviewed and approved the notice checklist</label>
        <label>Actual posting date <input type="date" data-work-field="noticePostingDate" value="${state.workDraft.noticePostingDate}" /></label>
        <label>Notice posting location <input type="text" data-work-field="noticeLocation" value="${state.workDraft.noticeLocation}" placeholder="City Hall bulletin board and city website" /></label>
        <label>Notice posting method <input type="text" data-work-field="noticeMethod" value="${state.workDraft.noticeMethod}" placeholder="Posted PDF and clerk attestation" /></label>
        <label>Posting confirmation <textarea data-work-field="noticeConfirmation">${state.workDraft.noticeConfirmation}</textarea></label>
        <div class="workflow-actions">
          ${bodies.length === 0 ? `<button type="button" class="primary-action" disabled>Create Meeting</button>` : `<button type="button" class="primary-action" data-work-action="create-meeting">Create Meeting</button>`}
          <button type="button" class="secondary-action" data-work-action="add-agenda-item">Add Agenda Item</button>
          <button type="button" class="secondary-action" data-work-action="add-code-handoff-agenda">Add Code Handoff</button>
          <button type="button" class="secondary-action" data-work-action="complete-notice-checklist">Approve Notice Checklist</button>
          <button type="button" class="secondary-action" data-work-action="post-notice">Mark Notice Ready</button>
          <button type="button" class="secondary-action" data-work-action="export-meeting-packet">Export Packet</button>
          <button type="button" class="secondary-action" data-work-action="open-exports-folder">Open Exports Folder</button>
        </div>
      </div>
      <div class="workflow-form">
        <h3>Staff Reports</h3>
        <p class="form-help">Save structured staff analysis for an agenda item. Each save creates a new report record so prior versions remain in the local audit trail.</p>
        <label>Agenda item
          <select data-work-field="staffReportAgendaItemId" ${selectedMeetingAgendaItems.length === 0 ? "disabled" : ""}>
            ${selectedMeetingAgendaItems.length === 0 ? `<option>No agenda item available</option>` : selectedMeetingAgendaItems.map((item) => `<option value="${escapeHtml(item.id)}" ${item.id === selectedStaffReportAgendaItemId ? "selected" : ""}>${escapeHtml(item.title)}</option>`).join("")}
          </select>
        </label>
        <label>Recommendation <textarea data-work-field="staffReportRecommendation">${state.workDraft.staffReportRecommendation}</textarea></label>
        <label>Background <textarea data-work-field="staffReportBackground">${state.workDraft.staffReportBackground}</textarea></label>
        <label>Analysis <textarea data-work-field="staffReportAnalysis">${state.workDraft.staffReportAnalysis}</textarea></label>
        <label>Fiscal impact <textarea data-work-field="staffReportFiscalImpact">${state.workDraft.staffReportFiscalImpact}</textarea></label>
        <label>Alternatives considered <textarea data-work-field="staffReportAlternatives">${state.workDraft.staffReportAlternatives}</textarea></label>
        <label>Prior actions <textarea data-work-field="staffReportPriorActions">${state.workDraft.staffReportPriorActions}</textarea></label>
        <label>Staff report prepared by <input type="text" data-work-field="staffReportPreparedBy" value="${state.workDraft.staffReportPreparedBy}" /></label>
        <label>Revision note <input type="text" data-work-field="staffReportRevisionNote" value="${state.workDraft.staffReportRevisionNote}" /></label>
        <div class="workflow-actions">
          ${selectedMeetingAgendaItems.length === 0 ? `<button type="button" class="secondary-action" disabled>Save Staff Report</button>` : `<button type="button" class="secondary-action" data-work-action="record-staff-report">Save Staff Report</button>`}
        </div>
      </div>
      <div class="workflow-form">
        <h3>Packet Attachments</h3>
        <p class="form-help">Attach source files for the agenda packet. The desktop app copies each file into the city profile and records a SHA-256 hash.</p>
        <label>Attachment title <input type="text" data-work-field="meetingAttachmentTitle" value="${state.workDraft.meetingAttachmentTitle}" /></label>
        <label>Attachment source file path <input type="text" data-work-field="meetingAttachmentSourcePath" value="${state.workDraft.meetingAttachmentSourcePath}" placeholder="C:/City/Clerk/fiscal-note.pdf" /></label>
        <label>Attachment citation <input type="text" data-work-field="meetingAttachmentCitation" value="${state.workDraft.meetingAttachmentCitation}" /></label>
        <label>Packet section <input type="text" data-work-field="meetingAttachmentSection" value="${state.workDraft.meetingAttachmentSection}" placeholder="Item 6 fiscal note" /></label>
        <label>Attachment access
          <select data-work-field="meetingAttachmentAccess">
            ${["public packet", "closed-session addendum"].map((access) => `<option value="${access}" ${state.workDraft.meetingAttachmentAccess === access ? "selected" : ""}>${access}</option>`).join("")}
          </select>
        </label>
        <label>Packet title <input type="text" data-work-field="packetTitle" value="${state.workDraft.packetTitle}" placeholder="Council agenda packet" /></label>
        <label>Packet prepared by <input type="text" data-work-field="packetPreparedBy" value="${state.workDraft.packetPreparedBy}" placeholder="Deputy Clerk" /></label>
        <label>Packet review note <textarea data-work-field="packetReviewNote">${state.workDraft.packetReviewNote}</textarea></label>
        <div class="workflow-actions">
          <button type="button" class="secondary-action" data-work-action="add-meeting-attachment">Attach Packet File</button>
          ${!selectedMeeting || selectedMeetingAgendaItems.length === 0 ? `<button type="button" class="secondary-action" disabled>Finalize Packet</button>` : `<button type="button" class="secondary-action" data-work-action="finalize-meeting-packet">Finalize Packet</button>`}
        </div>
      </div>
      <div class="workflow-form">
        <h3>Closed Sessions</h3>
        <label>Closed-session statutory basis <input type="text" data-work-field="closedSessionBasis" value="${state.workDraft.closedSessionBasis}" placeholder="Open meetings statute or ordinance section" /></label>
        <label>Closed-session topics <textarea data-work-field="closedSessionTopics">${state.workDraft.closedSessionTopics}</textarea></label>
        <label>Closed-session attendees <textarea data-work-field="closedSessionAttendees">${state.workDraft.closedSessionAttendees}</textarea></label>
        <label>Entered closed session <input type="text" data-work-field="closedSessionEnteredAt" value="${state.workDraft.closedSessionEnteredAt}" placeholder="6:42 PM" /></label>
        <label>Exited closed session <input type="text" data-work-field="closedSessionExitedAt" value="${state.workDraft.closedSessionExitedAt}" placeholder="7:05 PM" /></label>
        <label>Reconvene statement <textarea data-work-field="closedSessionReconvene">${state.workDraft.closedSessionReconvene}</textarea></label>
        <label>Staff-only notes reference <input type="text" data-work-field="closedSessionNotesReference" value="${state.workDraft.closedSessionNotesReference}" placeholder="Closed-session memo file, legal note, or clerk note id" /></label>
        <div class="workflow-actions">
          <button type="button" class="secondary-action" data-work-action="record-closed-session">Record Closed Session</button>
        </div>
      </div>
      <div class="workflow-form">
        <h3>Capture Outcomes</h3>
        <label>Minutes draft <textarea data-work-field="minutes">${state.workDraft.minutes}</textarea></label>
        <label>Motion text <textarea data-work-field="motionText">${state.workDraft.motionText}</textarea></label>
        <label>Moved by <input type="text" data-work-field="motionMover" value="${state.workDraft.motionMover}" /></label>
        <label>Seconded by <input type="text" data-work-field="motionSeconder" value="${state.workDraft.motionSeconder}" /></label>
        <label>Motion disposition
          <select data-work-field="motionDisposition">
            ${["pending vote", "passed", "failed", "withdrawn", "tabled"].map((disposition) => `<option value="${disposition}" ${state.workDraft.motionDisposition === disposition ? "selected" : ""}>${disposition}</option>`).join("")}
          </select>
        </label>
        <label>Linked vote reference <input type="text" data-work-field="motionVoteReference" value="${state.workDraft.motionVoteReference}" placeholder="Optional vote or roll-call note" /></label>
        <label>Roll-call motion
          <select data-work-field="memberVoteMotionId" ${selectedMeetingMotions.length === 0 ? "disabled" : ""}>
            ${selectedMeetingMotions.length === 0 ? `<option>No motion recorded</option>` : selectedMeetingMotions.map((motion) => `<option value="${escapeHtml(motion.id)}" ${motion.id === selectedMemberVoteMotionId ? "selected" : ""}>${escapeHtml(motion.text)} (${escapeHtml(motion.disposition)})</option>`).join("")}
          </select>
        </label>
        <label>Roll-call member
          <select data-work-field="memberVoteMemberId" ${rosterMembers.length === 0 ? "disabled" : ""}>
            ${rosterMembers.length === 0 ? `<option>No roster member available</option>` : rosterMembers.map((member) => `<option value="${escapeHtml(member.id)}" ${member.id === selectedMemberVoteMemberId ? "selected" : ""}>${escapeHtml(member.name)} - ${escapeHtml(member.role)}</option>`).join("")}
          </select>
        </label>
        <label>Roll-call vote
          <select data-work-field="memberVoteValue">
            ${["aye", "nay", "abstain", "absent", "recused"].map((voteValue) => `<option value="${voteValue}" ${state.workDraft.memberVoteValue === voteValue ? "selected" : ""}>${voteValue}</option>`).join("")}
          </select>
        </label>
        <label>Vote or outcome <input type="text" data-work-field="vote" value="${state.workDraft.vote}" /></label>
        <label>Action item <input type="text" data-work-field="actionItem" value="${state.workDraft.actionItem}" /></label>
        <label>Action owner <input type="text" data-work-field="actionItemOwner" value="${state.workDraft.actionItemOwner}" /></label>
        <label>Action due date <input type="date" data-work-field="actionItemDueDate" value="${state.workDraft.actionItemDueDate}" /></label>
        <label>Action status
          <select data-work-field="actionItemStatus">
            ${["open", "in progress", "completed", "blocked"].map((status) => `<option value="${status}" ${state.workDraft.actionItemStatus === status ? "selected" : ""}>${status}</option>`).join("")}
          </select>
        </label>
        <label>Action source <input type="text" data-work-field="actionItemSourceReference" value="${state.workDraft.actionItemSourceReference}" placeholder="Motion, vote, agenda item, or clerk note" /></label>
        <label>Resident comment <textarea data-work-field="residentComment">${state.workDraft.residentComment}</textarea></label>
        <label>Minutes signed by <input type="text" data-work-field="minutesSignedBy" value="${state.workDraft.minutesSignedBy}" placeholder="City Clerk or authorized signer" /></label>
        <label>Signature attestation <textarea data-work-field="minutesSignatureAttestation">${state.workDraft.minutesSignatureAttestation}</textarea></label>
        <label>Adopted item type
          <select data-work-field="adoptedLegislationType">
            ${["ordinance", "resolution"].map((kind) => `<option value="${kind}" ${state.workDraft.adoptedLegislationType === kind ? "selected" : ""}>${kind}</option>`).join("")}
          </select>
        </label>
        <label>Adopted title <input type="text" data-work-field="adoptedLegislationTitle" value="${state.workDraft.adoptedLegislationTitle}" /></label>
        <label>Adopted text <textarea data-work-field="adoptedLegislationText">${state.workDraft.adoptedLegislationText}</textarea></label>
        <label>Effective date <input type="date" data-work-field="adoptedLegislationEffectiveDate" value="${state.workDraft.adoptedLegislationEffectiveDate}" /></label>
        <label>Codification section hint <input type="text" data-work-field="adoptedLegislationCodificationHint" value="${state.workDraft.adoptedLegislationCodificationHint}" placeholder="Title 2, Chapter 4, or uncodified" /></label>
        <div class="workflow-actions">
          <button type="button" class="secondary-action" data-work-action="suggest-minutes-draft">Generate Local AI Minutes</button>
          <button type="button" class="secondary-action" data-work-action="record-minutes">Save Minutes Draft</button>
          <button type="button" class="secondary-action" data-work-action="record-motion">Record Motion</button>
          ${selectedMeetingMotions.length === 0 || rosterMembers.length === 0 ? `<button type="button" class="secondary-action" disabled>Record Roll Call Vote</button>` : `<button type="button" class="secondary-action" data-work-action="record-member-vote">Record Roll Call Vote</button>`}
          <button type="button" class="secondary-action" data-work-action="record-vote">Record Outcome</button>
          <button type="button" class="secondary-action" data-work-action="add-action-item">Add Action Item</button>
          <button type="button" class="secondary-action" data-work-action="record-resident-comment">Record Resident Comment</button>
          <button type="button" class="secondary-action" data-work-action="adopt-minutes">Adopt Minutes</button>
          <button type="button" class="secondary-action" data-work-action="sign-minutes">Sign Minutes</button>
          <button type="button" class="secondary-action" data-work-action="record-adopted-legislation">Record Adopted Ordinance/Resolution</button>
          <button type="button" class="secondary-action" data-work-action="archive-meeting">Archive Public Record</button>
        </div>
      </div>
      <div class="workflow-form">
        <h3>Minute Citations</h3>
        <p class="form-help">Tie each important minutes sentence to a packet item, clerk note, transcript segment, or vote record before adoption.</p>
        <label>Minutes sentence or excerpt <textarea data-work-field="minutesCitationSentence">${state.workDraft.minutesCitationSentence}</textarea></label>
        <label>Citation source type <input type="text" data-work-field="minutesCitationSourceType" value="${state.workDraft.minutesCitationSourceType}" placeholder="packet item, clerk note, transcript segment" /></label>
        <label>Citation source reference <input type="text" data-work-field="minutesCitationSourceRef" value="${state.workDraft.minutesCitationSourceRef}" placeholder="Item 4 fiscal note, clerk note 2, transcript 00:14:03" /></label>
        <label>Citation note <input type="text" data-work-field="minutesCitationNote" value="${state.workDraft.minutesCitationNote}" /></label>
        <label>Citation access
          <select data-work-field="minutesCitationAccess">
            ${["public record", "staff-only"].map((access) => `<option value="${access}" ${state.workDraft.minutesCitationAccess === access ? "selected" : ""}>${access}</option>`).join("")}
          </select>
        </label>
        <div class="workflow-actions">
          <button type="button" class="secondary-action" data-work-action="add-minute-citation">Add Minute Citation</button>
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
          <p><strong>Body:</strong> ${escapeHtml(meeting.body_name || "City Council")}</p>
          <p>${meeting.summary || "No summary yet."}</p>
          ${(meeting.agenda_items || []).length > 0 ? `<p><strong>Agenda:</strong> ${(meeting.agenda_items || []).map((item) => `${escapeHtml(item.title)}${item.source_reference ? ` (${escapeHtml(item.source_reference)})` : ""}`).join("; ")}</p>` : ""}
          ${(meeting.staff_reports || []).length > 0 ? `<p><strong>Staff reports:</strong> ${(meeting.staff_reports || []).map((report) => `${escapeHtml(report.agenda_item_title)} - ${escapeHtml(report.recommendation)} (${escapeHtml(report.prepared_by)})`).join("; ")}</p>` : ""}
          ${meeting.minutes_adopted_at_unix_seconds ? "<p><strong>Minutes:</strong> adopted</p>" : ""}
          ${meeting.minutes_signed_at_unix_seconds ? `<p><strong>Minutes signature:</strong> signed by ${escapeHtml(meeting.minutes_signed_by || "authorized signer")}</p>` : ""}
          ${(meeting.minute_citations || []).length > 0 ? `<p><strong>Minute citations:</strong> ${(meeting.minute_citations || []).map((citation) => `${escapeHtml(citation.source_type)} ${escapeHtml(citation.source_reference)} (${escapeHtml(citation.access_level)})`).join("; ")}</p>` : ""}
          ${(meeting.notice_checklists || []).length > 0 ? `<p><strong>Notice checklist:</strong> ${(meeting.notice_checklists || []).map((entry) => `${entry.meeting_type}; ${entry.statutory_basis}; due ${entry.posting_deadline} ${entry.time_zone}`).join("; ")}</p>` : ""}
          ${(meeting.notice_postings || []).length > 0 ? `<p><strong>Notice evidence:</strong> ${(meeting.notice_postings || []).map((entry) => `${entry.location} via ${entry.method}`).join("; ")}</p>` : ""}
          ${(meeting.attachments || []).length > 0 ? `<p><strong>Packet attachments:</strong> ${(meeting.attachments || []).map((attachment) => `${escapeHtml(attachment.title)} (${escapeHtml(attachment.packet_section)}; ${escapeHtml(attachment.access_level)}; sha256 ${escapeHtml(String(attachment.sha256 || "")).slice(0, 12)})`).join("; ")}</p>` : ""}
          ${(meeting.packet_assemblies || []).length > 0 ? `<p><strong>Packet finalization:</strong> ${(meeting.packet_assemblies || []).map((packet) => `${escapeHtml(packet.packet_title)} (${escapeHtml(packet.status)}; reviewed by ${escapeHtml(packet.prepared_by)}; ${packet.agenda_item_count} agenda items; ${packet.public_attachment_count} public attachments; ${packet.closed_session_attachment_count} closed-session addenda)`).join("; ")}</p>` : ""}
          ${(meeting.closed_sessions || []).length > 0 ? `<p><strong>Closed sessions:</strong> ${(meeting.closed_sessions || []).map((session) => `${escapeHtml(session.statutory_basis)} (${escapeHtml((session.topics || []).join("; "))}; ${escapeHtml(session.entered_at)}-${escapeHtml(session.exited_at)})`).join("; ")}</p>` : ""}
          ${(meeting.motions || []).length > 0 ? `<p><strong>Motions:</strong> ${(meeting.motions || []).map((motion) => `${escapeHtml(motion.text)} (${escapeHtml(motion.disposition)}; moved by ${escapeHtml(motion.mover)}${motion.seconder ? `; seconded by ${escapeHtml(motion.seconder)}` : ""})`).join("; ")}</p>` : ""}
          ${(meeting.member_votes || []).length > 0 ? `<p><strong>Roll-call votes:</strong> ${(meeting.member_votes || []).map((vote) => `${escapeHtml(vote.member_name)} ${escapeHtml(vote.vote)} on ${escapeHtml(vote.motion_text)}`).join("; ")}</p>` : ""}
          ${(meeting.adopted_legislation || []).length > 0 ? `<p><strong>Adopted legislation:</strong> ${(meeting.adopted_legislation || []).map((item) => `${escapeHtml(item.legislation_type)} ${escapeHtml(item.title)} (${escapeHtml(item.handoff_status)})`).join("; ")}</p>` : ""}
          ${(meeting.action_items || []).length > 0 ? `<p><strong>Action items:</strong> ${(meeting.action_items || []).join("; ")}</p>` : ""}
          ${(meeting.action_records || []).length > 0 ? `<p><strong>Action details:</strong> ${(meeting.action_records || []).map((action) => `${escapeHtml(action.description)} (${escapeHtml(action.status)}${action.owner ? `; owner ${escapeHtml(action.owner)}` : ""}${action.due_date ? `; due ${escapeHtml(action.due_date)}` : ""}${action.source_reference ? `; source ${escapeHtml(action.source_reference)}` : ""})`).join("; ")}</p>` : ""}
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
          <small>${meeting.meeting_date} - ${escapeHtml(meeting.body_name || "City Council")} - ${meeting.notice_status} - ${(meeting.agenda_items || []).length} agenda items - ${(meeting.staff_reports || []).length} staff reports - ${(meeting.attachments || []).length} attachments - ${(meeting.packet_assemblies || []).length} packet finalizations - ${(meeting.minute_citations || []).length} minute citations - ${(meeting.motions || []).length} motions - ${(meeting.member_votes || []).length} roll-call votes - ${(meeting.votes || []).length} outcomes - ${((meeting.action_records || []).length || (meeting.action_items || []).length)} action items - ${(meeting.exports || []).length} exports</small>
        </article>
      `).join("")}
    </section>
    <section class="workflow-list" aria-label="Agenda intake queue">
      ${agendaIntakes(work).length === 0 ? workflowEmpty("No agenda intake items are waiting for clerk review.") : agendaIntakes(work).map((intake) => `
        <article class="workflow-record">
          <span class="status-warn">${escapeHtml(intake.status)}</span>
          <h3>${escapeHtml(intake.title)}</h3>
          <p>${escapeHtml(intake.summary)}</p>
          <p><strong>Source:</strong> ${escapeHtml(intake.source_reference)}</p>
          <small>${escapeHtml(intake.department)} - submitted by ${escapeHtml(intake.submitter)}${intake.requested_meeting_date ? ` - requested ${escapeHtml(intake.requested_meeting_date)}` : ""}</small>
          ${intake.review_note ? `<p><strong>Review note:</strong> ${escapeHtml(intake.review_note)}</p>` : ""}
          <div class="record-actions">
            ${selectedAgendaIntake?.id === intake.id ? `<span class="status-ok">Selected for review</span>` : `<button type="button" class="secondary-action" data-select-work-record="agendaIntake" data-record-id="${intake.id}">Review This</button>`}
          </div>
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
  const lookupVerified = publicRecordsLookupVerifiedFor(request);
  if (!recordsRequestIsReleased(request) && !lookupVerified) return null;
  return {
    ...request,
    requester_contact: "",
    assigned_to: "",
    clarification_notes: [],
    search_notes: [],
    search_sessions: [],
    exemption_reviews: [],
    exemption_decisions: [],
    fee_estimate: "",
    fee_line_items: [],
    fee_waiver_reason: "",
    response_draft: "",
    approval_notes: [],
    release_packages: [],
    timeline: [],
    messages: lookupVerified ? (request.messages || []) : [],
    documents: []
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
        <label>Message to records staff <textarea data-work-field="publicRequestMessage">${state.workDraft.publicRequestMessage}</textarea></label>
        <button type="button" class="secondary-action" data-work-action="lookup-public-records-request">Check Request Status</button>
        <button type="button" class="secondary-action" data-work-action="add-public-records-message">Send Request Message</button>
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
          ${request.deadline_basis ? `<p><strong>Deadline basis:</strong> ${request.deadline_basis}</p>` : ""}
          ${renderRecordsMessages(request)}
          <small>${request.submitted_via || "Staff intake"} - ${request.deadline} - Released exports: ${(request.exports || []).length}</small>
        </article>
      `).join("")}
    </section>
  `;
}

function renderRecordsNotificationOutbox(work) {
  const selectedNotification = currentNotification(work);
  const notifications = (work.notification_events || [])
    .filter((event) => event.module_id === "civicrecords-ai");
  return `
    <section class="workflow-list" aria-label="Records notification outbox">
      <div class="section-title">
        <h3>Notification Outbox</h3>
        <p>Local notification log for requester and staff messages generated by Records workflows.</p>
      </div>
      ${notifications.length === 0 ? workflowEmpty("No local records notifications have been created yet.") : notifications.map((event) => `
        <article class="workflow-record">
          <span class="${event.status === "sent / logged" ? "status-ok" : "status-warn"}">${escapeHtml(event.status)}</span>
          <h3>${escapeHtml(event.subject)}</h3>
          <p>${escapeHtml(event.body)}</p>
          <p><strong>Audience:</strong> ${escapeHtml(event.audience)} <strong>Channel:</strong> ${escapeHtml(event.channel)}</p>
          ${event.sent_at_unix_seconds ? `<p><strong>Sent/logged:</strong> ${new Date(event.sent_at_unix_seconds * 1000).toLocaleString()}</p>` : ""}
          <div class="record-actions">
            ${selectedNotification?.id === event.id ? `<span class="status-ok">Selected notification</span>` : `<button type="button" class="secondary-action" data-select-work-record="notification" data-record-id="${event.id}">Work On This</button>`}
            ${event.status === "sent / logged" ? "" : `<button type="button" class="secondary-action" data-select-work-record="notification" data-record-id="${event.id}" data-work-action="mark-notification-sent">Log Notification Sent</button>`}
          </div>
          <small>${escapeHtml(event.record_id)} - ${new Date(event.created_at_unix_seconds * 1000).toLocaleString()}</small>
        </article>
      `).join("")}
    </section>
  `;
}

function renderRecordsTimeline(request) {
  const timeline = request.timeline || [];
  if (timeline.length === 0) return "";
  return `
    <details class="record-details">
      <summary>Request Timeline</summary>
      <ul>
        ${timeline.map((entry) => `
          <li>
            <strong>${escapeHtml(entry.action)}</strong> by ${escapeHtml(entry.actor)}:
            ${escapeHtml(entry.note)}
            <small>${new Date(entry.created_at_unix_seconds * 1000).toLocaleString()}</small>
          </li>
        `).join("")}
      </ul>
    </details>
  `;
}

function renderRecordsMessages(request) {
  const messages = request.messages || [];
  if (messages.length === 0) return "";
  return `
    <details class="record-details" open>
      <summary>Request Messages</summary>
      <ul>
        ${messages.map((message) => `
          <li>
            <strong>${escapeHtml(message.author || message.author_role)}</strong>
            <span>${escapeHtml(message.author_role)}</span>
            ${escapeHtml(message.body)}
            <small>${new Date(message.created_at_unix_seconds * 1000).toLocaleString()}</small>
          </li>
        `).join("")}
      </ul>
    </details>
  `;
}

function renderRecordsDocuments(request) {
  const documents = request.documents || [];
  if (documents.length === 0) return "";
  return `
    <details class="record-details" open>
      <summary>Request Documents</summary>
      <ul>
        ${documents.map((document) => `
          <li>
            <strong>${escapeHtml(document.title)}</strong>
            ${document.citation ? `<span>${escapeHtml(document.citation)}</span>` : ""}
            <span>${escapeHtml(document.status)}</span>
            <small>SHA-256 ${escapeHtml(document.sha256)}</small>
          </li>
        `).join("")}
      </ul>
    </details>
  `;
}

function renderRecordsSearchSessions(request) {
  const sessions = request.search_sessions || [];
  if (sessions.length === 0) return "";
  return `
    <details class="record-details" open>
      <summary>Search Sessions</summary>
      <ul>
        ${sessions.map((session) => `
          <li>
            <strong>${escapeHtml(session.query)}</strong>
            <span>${escapeHtml(session.locations)}</span>
            ${(session.results || []).map((result) => `${escapeHtml(result.title)} (${escapeHtml(result.citation)})`).join("; ")}
            <small>${escapeHtml(session.reviewer || "records staff")}</small>
          </li>
        `).join("")}
      </ul>
    </details>
  `;
}

function renderRecordsReleasePackages(request) {
  const packages = request.release_packages || [];
  if (packages.length === 0) return "";
  return `
    <details class="record-details" open>
      <summary>Release Packages</summary>
      <ul>
        ${packages.map((pkg) => `
          <li>
            <strong>${escapeHtml(pkg.export_path)}</strong>
            <span>SHA-256 ${escapeHtml(pkg.package_hash)}</span>
            <small>${pkg.document_count} document(s), ${pkg.search_session_count} search session(s), ${pkg.release_count} release, ${pkg.redacted_count} redact, ${pkg.exempt_count} exempt</small>
          </li>
        `).join("")}
      </ul>
    </details>
  `;
}

function renderRecordsExemptionDecisions(request) {
  const decisions = request.exemption_decisions || [];
  if (decisions.length === 0) return "";
  return `
    <details class="record-details" open>
      <summary>Exemption Decisions</summary>
      <ul>
        ${decisions.map((decision) => `
          <li>
            <strong>${escapeHtml(decision.source)}</strong>
            <span>${escapeHtml(decision.decision)}</span>
            <span>${escapeHtml(decision.kind)}</span>
            ${escapeHtml(decision.finding)}
            <small>${escapeHtml(decision.basis)} - ${escapeHtml(decision.reviewer || "records staff")}</small>
          </li>
        `).join("")}
      </ul>
    </details>
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
        <label>Deadline basis <input type="text" data-work-field="recordsDeadlineBasis" value="${state.workDraft.recordsDeadlineBasis}" placeholder="State records law or city policy basis" /></label>
        <label>Request summary <textarea data-work-field="recordsSummary">${state.workDraft.recordsSummary}</textarea></label>
        <button type="button" class="primary-action" data-work-action="create-records-request">Create Request</button>
      </div>
      <div class="workflow-form">
        <h3>Scope & Search</h3>
        <label>Assign to <input type="text" data-work-field="assignedTo" value="${state.workDraft.assignedTo}" /></label>
        <label>Clarification note <textarea data-work-field="clarificationNote">${state.workDraft.clarificationNote}</textarea></label>
        <label>Search source note <textarea data-work-field="sourceNote">${state.workDraft.sourceNote}</textarea></label>
        <label>Records search query <input type="text" data-work-field="recordsSearchQuery" value="${state.workDraft.recordsSearchQuery}" placeholder="Subject, date range, requester scope" /></label>
        <label>Searched locations <textarea data-work-field="searchLocations">${state.workDraft.searchLocations}</textarea></label>
        <label>Search result title <input type="text" data-work-field="searchResultTitle" value="${state.workDraft.searchResultTitle}" /></label>
        <label>Search result citation <input type="text" data-work-field="searchResultCitation" value="${state.workDraft.searchResultCitation}" /></label>
        <label>Search result summary <textarea data-work-field="searchResultSummary">${state.workDraft.searchResultSummary}</textarea></label>
        <label>Search result status <input type="text" data-work-field="searchResultStatus" value="${state.workDraft.searchResultStatus}" /></label>
        <label>Search reviewer <input type="text" data-work-field="searchReviewer" value="${state.workDraft.searchReviewer}" placeholder="Records Officer" /></label>
        <label>Citation or source note <input type="text" data-work-field="citation" value="${state.workDraft.citation}" /></label>
        <label>Exemption review <textarea data-work-field="exemptionNote">${state.workDraft.exemptionNote}</textarea></label>
        <label>Exemption source <input type="text" data-work-field="exemptionSource" value="${state.workDraft.exemptionSource}" placeholder="File, page, timestamp, or segment" /></label>
        <label>Exemption category <input type="text" data-work-field="exemptionKind" value="${state.workDraft.exemptionKind}" placeholder="PII, attorney-client, personnel, other" /></label>
        <label>Staff finding <textarea data-work-field="exemptionFinding">${state.workDraft.exemptionFinding}</textarea></label>
        <label>Decision
          <select aria-label="Decision" data-work-field="exemptionDecision">
            <option value="release" ${state.workDraft.exemptionDecision === "release" ? "selected" : ""}>Release</option>
            <option value="redact" ${state.workDraft.exemptionDecision === "redact" ? "selected" : ""}>Redact</option>
            <option value="exempt" ${state.workDraft.exemptionDecision === "exempt" ? "selected" : ""}>Exempt</option>
          </select>
        </label>
        <label>Decision basis <input type="text" data-work-field="exemptionBasis" value="${state.workDraft.exemptionBasis}" placeholder="Statute, ordinance, or policy basis" /></label>
        <label>Exemption reviewer <input type="text" data-work-field="exemptionReviewer" value="${state.workDraft.exemptionReviewer}" placeholder="Records Officer" /></label>
        <label>Fee estimate <input type="text" data-work-field="feeEstimate" value="${state.workDraft.feeEstimate}" /></label>
        <label>Fee line description <input type="text" data-work-field="feeLineDescription" value="${state.workDraft.feeLineDescription}" placeholder="Search time, copies, media, or waived charge basis" /></label>
        <label>Fee schedule or policy basis <input type="text" data-work-field="feeScheduleBasis" value="${state.workDraft.feeScheduleBasis}" placeholder="Adopted records fee schedule or waiver policy" /></label>
        <label>Fee line amount <input type="text" inputmode="decimal" data-work-field="feeLineAmount" value="${state.workDraft.feeLineAmount}" placeholder="12.50" /></label>
        <label>Fee waiver reason <textarea data-work-field="feeWaiverReason">${state.workDraft.feeWaiverReason}</textarea></label>
        <div class="workflow-actions">
          <button type="button" class="secondary-action" data-work-action="set-records-deadline">Set Deadline</button>
          <button type="button" class="secondary-action" data-work-action="assign-records-request">Assign</button>
          <button type="button" class="secondary-action" data-work-action="request-records-clarification">Request Clarification</button>
          <button type="button" class="secondary-action" data-work-action="record-records-search">Record Search</button>
          <button type="button" class="secondary-action" data-work-action="record-records-search-session">Save Search Session</button>
          <button type="button" class="secondary-action" data-work-action="add-records-exemption-review">Add Exemption Review</button>
          <button type="button" class="secondary-action" data-work-action="add-records-exemption-decision">Save Exemption Decision</button>
          <button type="button" class="secondary-action" data-work-action="estimate-records-fee">Estimate Fee</button>
          <button type="button" class="secondary-action" data-work-action="add-records-fee-line">Add Fee Line</button>
          <button type="button" class="secondary-action" data-work-action="waive-records-fee">Waive Fee</button>
        </div>
      </div>
      <div class="workflow-form">
        <h3>Request Messages</h3>
        <p class="form-help">Add requester-visible communication to the request thread. Staff-only notes stay in clarification, search, exemption, and approval fields.</p>
        <label>Message to requester <textarea data-work-field="requestMessageBody">${state.workDraft.requestMessageBody}</textarea></label>
        <button type="button" class="secondary-action" data-work-action="add-records-message">Add Request Message</button>
      </div>
      <div class="workflow-form">
        <h3>Request Documents</h3>
        <p class="form-help">Attach a local source file to this request. The desktop app copies it into the city profile and records a SHA-256 hash.</p>
        <label>Document title <input type="text" data-work-field="documentTitle" value="${state.workDraft.documentTitle}" /></label>
        <label>Source file path <input type="text" data-work-field="documentSourcePath" value="${state.workDraft.documentSourcePath}" placeholder="C:/City/Records/responsive-email.pdf" /></label>
        <label>Document citation <input type="text" data-work-field="documentCitation" value="${state.workDraft.documentCitation}" /></label>
        <button type="button" class="secondary-action" data-work-action="add-records-document">Attach Document</button>
      </div>
      <div class="workflow-form">
        <h3>Response & Release</h3>
        <label>Response draft <textarea data-work-field="responseDraft">${state.workDraft.responseDraft}</textarea></label>
        <label>Approval note <input type="text" data-work-field="approvalNote" value="${state.workDraft.approvalNote}" /></label>
        <div class="workflow-actions">
          <button type="button" class="secondary-action" data-work-action="suggest-records-response">Generate Local AI Draft</button>
          <button type="button" class="secondary-action" data-work-action="draft-records-response">Save Draft</button>
          <button type="button" class="secondary-action" data-work-action="approve-records-response">Approve Response</button>
          <button type="button" class="secondary-action" data-work-action="build-records-release-package">Build Release Package</button>
          <button type="button" class="secondary-action" data-work-action="export-records-response">Export Response</button>
          <button type="button" class="secondary-action" data-work-action="fulfill-records-request">Mark Fulfilled</button>
          <button type="button" class="secondary-action" data-work-action="close-records-request">Close Request</button>
          <button type="button" class="secondary-action" data-work-action="open-exports-folder">Open Exports Folder</button>
        </div>
      </div>
    </section>
    ${renderGuidedWorkReview()}
    ${renderWorkActionResult()}
    ${renderRecordsNotificationOutbox(work)}
    <section class="workflow-list">
      ${work.records_requests.length === 0 ? workflowEmpty("No local records requests have been created yet.") : work.records_requests.map((request) => `
        <article class="workflow-record">
          <span class="status-warn">${request.status}</span>
          <h3>${request.requester}</h3>
          <p>${request.summary}</p>
          ${request.public_tracking_number ? `<p><strong>Tracking:</strong> ${request.public_tracking_number}</p>` : ""}
          ${request.requester_contact ? `<p><strong>Contact:</strong> ${request.requester_contact}</p>` : ""}
          ${request.submitted_via ? `<p><strong>Submitted via:</strong> ${request.submitted_via}</p>` : ""}
          ${request.deadline_basis ? `<p><strong>Deadline basis:</strong> ${request.deadline_basis}</p>` : ""}
          ${request.assigned_to ? `<p><strong>Assigned:</strong> ${request.assigned_to}</p>` : ""}
          ${request.fee_estimate ? `<p><strong>Fee estimate:</strong> ${request.fee_estimate}</p>` : ""}
          ${(request.fee_line_items || []).length > 0 ? `<p><strong>Fee lines:</strong> ${(request.fee_line_items || []).map((item) => `${escapeHtml(item.description)} ${escapeHtml(formatFeeCents(item.amount_cents))}${item.schedule_basis ? ` (${escapeHtml(item.schedule_basis)})` : ""}`).join("; ")}</p>` : ""}
          ${request.fee_waiver_reason ? `<p><strong>Fee waiver:</strong> ${escapeHtml(request.fee_waiver_reason)}</p>` : ""}
          ${request.approved_at_unix_seconds ? "<p><strong>Approval:</strong> human-approved</p>" : ""}
          ${request.fulfilled_at_unix_seconds ? "<p><strong>Fulfillment:</strong> released to requester</p>" : ""}
          ${renderRecordsMessages(request)}
          ${renderRecordsDocuments(request)}
          ${renderRecordsSearchSessions(request)}
          ${renderRecordsExemptionDecisions(request)}
          ${renderRecordsReleasePackages(request)}
          ${renderRecordsTimeline(request)}
          <div class="record-actions">
            ${selectedRequest?.id === request.id ? `<span class="status-ok">Selected for actions</span>` : `<button type="button" class="secondary-action" data-select-work-record="recordsRequest" data-record-id="${request.id}">Work On This</button>`}
          </div>
          <small>Due ${request.deadline} - ${(request.citations || []).length} citations - ${(request.exemption_reviews || []).length} exemption notes - ${(request.release_packages || []).length} release packages - ${(request.exports || []).length} exports</small>
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
          <button type="button" class="secondary-action" data-work-action="suggest-code-guidance">Generate Local AI Guidance</button>
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
      ${(work.adopted_legislation || []).map((item) => `
        <article class="workflow-record handoff">
          <span class="status-warn">${escapeHtml(item.handoff_status)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.legislation_type)} adopted from ${escapeHtml(item.meeting_title)}.</p>
          <small>${escapeHtml(item.effective_date || "No effective date")} - ${escapeHtml(item.codification_section_hint || "No codification hint")} - CivicClerk adoption event</small>
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
  meetingBodies(work).forEach((body) => {
    const bodySearchText = [body.name, body.body_type, body.statutory_basis, body.meeting_cadence, body.quorum_rule, body.status];
    if (bodySearchText.some((value) => String(value || "").toLowerCase().includes(normalized))) {
      results.push({
        module_id: "civicclerk",
        title: `Meeting body: ${body.name}`,
        snippet: `${body.body_type}; ${body.meeting_cadence}; quorum ${body.quorum_rule}`,
        citation: body.statutory_basis,
        status: body.status
      });
    }
  });
  meetingMembers(work).forEach((member) => {
    const memberSearchText = publicOnly
      ? [member.name, member.role, member.body_name, member.term_start, member.term_end, member.status]
      : [member.name, member.role, member.body_name, member.term_start, member.term_end, member.email, member.status];
    if (memberSearchText.some((value) => String(value || "").toLowerCase().includes(normalized))) {
      results.push({
        module_id: "civicclerk",
        title: `Meeting member: ${member.name}`,
        snippet: `${member.role}; ${member.body_name}`,
        citation: member.body_name,
        status: member.status
      });
    }
  });
  const meetings = publicOnly ? publicMeetings(work) : work.meetings;
  meetings.forEach((meeting) => {
    const agendaTitles = (meeting.agenda_items || [])
      .map((item) => [item.title, item.status, item.visibility, item.source_reference, item.source_module, item.department].join(" "))
      .join(" ");
    const motions = (meeting.motions || [])
      .map((motion) => [motion.text, motion.mover, motion.seconder, motion.disposition, motion.vote_reference].join(" "))
      .join(" ");
    const memberVotes = (meeting.member_votes || [])
      .map((vote) => [vote.member_name, vote.vote, vote.motion_text, vote.motion_id].join(" "))
      .join(" ");
    const staffReports = (meeting.staff_reports || [])
      .map((report) => [report.agenda_item_title, report.recommendation, report.background, report.analysis, report.fiscal_impact, report.alternatives, report.prior_actions, report.prepared_by, report.revision_note].join(" "))
      .join(" ");
    const outcomes = (meeting.votes || []).join(" ");
    const actionItems = (meeting.action_items || []).join(" ");
    const actionRecords = (meeting.action_records || [])
      .map((action) => [action.description, action.owner, action.due_date, action.status, action.source_reference].join(" "))
      .join(" ");
    const adoptedLegislation = (meeting.adopted_legislation || [])
      .map((item) => [item.legislation_type, item.title, item.text, item.effective_date, item.codification_section_hint, item.source_motion_text, item.source_agenda_item_title, item.handoff_status].join(" "))
      .join(" ");
    const closedSessions = (meeting.closed_sessions || [])
      .map((session) => [session.statutory_basis, (session.topics || []).join(" "), (session.attendees || []).join(" "), session.entered_at, session.exited_at, session.reconvene_statement, session.staff_notes_reference].join(" "))
      .join(" ");
    const residentComments = (meeting.resident_comments || []).join(" ");
    const noticeChecklists = (meeting.notice_checklists || [])
      .map((entry) => [entry.meeting_type, entry.statutory_basis, entry.posting_deadline, entry.time_zone, entry.status].join(" "))
      .join(" ");
    const noticePostings = (meeting.notice_postings || [])
      .map((entry) => [entry.location, entry.method, entry.confirmation, entry.posted_on, entry.time_zone].join(" "))
      .join(" ");
    const packetAttachments = (meeting.attachments || [])
      .map((attachment) => {
        const publicFields = [attachment.title, attachment.citation, attachment.packet_section, attachment.access_level, attachment.sha256];
        if (publicOnly) return publicFields.join(" ");
        return [...publicFields, attachment.original_path, attachment.stored_path, attachment.added_by].join(" ");
      })
      .join(" ");
    const packetAssemblies = (meeting.packet_assemblies || [])
      .map((packet) => [
        packet.packet_title,
        packet.prepared_by,
        packet.review_note,
        packet.status,
        packet.agenda_item_count,
        packet.public_attachment_count,
        packet.closed_session_attachment_count
      ].join(" "))
      .join(" ");
    const minuteCitations = (meeting.minute_citations || [])
      .map((citation) => [citation.sentence, citation.source_type, citation.source_reference, citation.note, citation.access_level].join(" "))
      .join(" ");
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
      meeting.body_name,
      meeting.summary,
      meeting.status,
      meeting.notice_status,
      noticeChecklists,
      noticePostings,
      agendaTitles,
      packetAttachments,
      packetAssemblies,
      minuteCitations,
      publicComments
    ];
    const meetingSearchText = publicOnly
      ? publicArchive
        ? [...publicMeetingFields, meeting.minutes, meeting.minutes_signed_by, meeting.minutes_signature_attestation, motions, memberVotes, staffReports, outcomes, actionItems, actionRecords, adoptedLegislation, closedSessions, residentComments]
        : publicMeetingFields
      : [meeting.title, meeting.body_name, meeting.summary, meeting.status, meeting.minutes, meeting.minutes_signed_by, meeting.minutes_signature_attestation, noticeChecklists, noticePostings, agendaTitles, staffReports, packetAttachments, packetAssemblies, minuteCitations, motions, memberVotes, outcomes, actionItems, actionRecords, adoptedLegislation, closedSessions, residentComments, publicComments];
    if (meetingSearchText.some((value) => String(value || "").toLowerCase().includes(normalized))) {
      results.push({ module_id: "civicclerk", title: meeting.title, snippet: meeting.summary, citation: `Meeting ${meeting.meeting_date}`, status: meeting.status });
    }
  });
  if (!publicOnly) {
    agendaIntakes(work).forEach((intake) => {
      const intakeSearchText = [
        intake.title,
        intake.submitter,
        intake.department,
        intake.summary,
        intake.source_reference,
        intake.requested_meeting_date,
        intake.status,
        intake.review_note
      ];
      if (intakeSearchText.some((value) => String(value || "").toLowerCase().includes(normalized))) {
        results.push({
          module_id: "civicclerk",
          title: `Agenda intake: ${intake.title}`,
          snippet: `${intake.department}; ${intake.summary}`,
          citation: intake.source_reference,
          status: intake.status
        });
      }
    });
  }
  const recordsRequests = publicOnly ? publicRecordsRequests(work) : work.records_requests;
  recordsRequests.forEach((request) => {
    const requestMessageSearchText = (request.messages || [])
      .map((message) => [message.author, message.author_role, message.body].join(" "));
    const requestDocumentSearchText = (request.documents || [])
      .map((document) => [document.title, document.citation, document.status, document.sha256].join(" "));
    const searchSessionSearchText = (request.search_sessions || [])
      .map((session) => [
        session.query,
        session.locations,
        session.reviewer,
        ...(session.results || []).map((result) => [result.title, result.citation, result.summary, result.status].join(" "))
      ].join(" "));
    const exemptionDecisionSearchText = (request.exemption_decisions || [])
      .map((decision) => [decision.source, decision.kind, decision.finding, decision.decision, decision.basis, decision.reviewer].join(" "));
    const releasePackageSearchText = (request.release_packages || [])
      .map((pkg) => [pkg.export_path, pkg.package_hash, pkg.document_count, pkg.search_session_count, pkg.release_count, pkg.redacted_count, pkg.exempt_count].join(" "));
    const feeLineSearchText = (request.fee_line_items || [])
      .map((item) => [item.description, item.schedule_basis, formatFeeCents(item.amount_cents)].join(" "));
    const publicRecordFields = [
      request.public_tracking_number,
      request.requester,
      request.submitted_via,
      request.summary,
      request.status,
      request.deadline,
      request.deadline_basis,
      ...(request.citations || [])
    ];
    const recordsSearchText = publicOnly ? publicRecordFields : [
      ...publicRecordFields,
      request.requester_contact,
      request.assigned_to,
      request.fee_estimate,
      request.fee_waiver_reason,
      ...feeLineSearchText,
      ...requestMessageSearchText,
      ...requestDocumentSearchText,
      ...searchSessionSearchText,
      ...exemptionDecisionSearchText,
      ...releasePackageSearchText,
      request.response_draft,
      ...(request.clarification_notes || []),
      ...(request.search_notes || []),
      ...(request.exemption_reviews || []),
      ...(request.approval_notes || []),
      ...(request.timeline || []).map((entry) => [entry.action, entry.actor, entry.note].join(" "))
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
  if (!publicOnly) {
    (work.notification_events || []).forEach((event) => {
      const notificationSearchText = [
        event.module_id,
        event.record_id,
        event.audience,
        event.channel,
        event.subject,
        event.body,
        event.status
      ];
      if (notificationSearchText.some((value) => String(value || "").toLowerCase().includes(normalized))) {
        results.push({
          module_id: "civiccore",
          title: `Notification: ${event.subject}`,
          snippet: event.body,
          citation: event.channel,
          status: event.status
        });
      }
    });
  }
  return results.filter((result) => moduleIsEnabled(result.module_id));
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

const MODULE_EXPORTS_AVAILABLE = new Set(["civicrecords-ai", "civicclerk", "civiccode"]);

function backupHookLabel(hook) {
  const labels = {
    "config": "city setup",
    "Data": "city data",
    "audit-log": "audit log",
    "model-registry": "local model registry",
    "Data/workflows/records": "records workflow history",
    "Data/exports/records": "records exports",
    "Data/files/records": "records files",
    "Data/workflows/meetings": "meeting workflow history",
    "Data/exports/meetings": "meeting exports",
    "Data/files/meetings": "meeting files",
    "Data/workflows/code": "code workflow history",
    "Data/exports/code": "code exports",
    "Data/files/code": "code files"
  };
  return labels[hook] || String(hook || "").replace(/^Data\//, "").replaceAll("/", " ");
}

function renderModuleRow(module, { actions = false } = {}) {
  const proofCount = module.proof_required?.length || 0;
  const lifecycle = moduleLifecycleItems(module);
  const backupHooks = module.backup_restore_hooks || [];
  const disabled = module.installed && module.enabled === false;
  const canToggle = actions && module.installed && !module.required;
  const canInstall = actions && !module.installed && module.selectable && module.contract_ready;
  const canOpenExports = actions && module.installed && MODULE_EXPORTS_AVAILABLE.has(module.id);
  const canUpdate = actions && module.installed;
  const canRemove = actions && module.installed && !module.required;
  const toggleAction = disabled ? "enable-module" : "disable-module";
  const toggleLabel = disabled ? "Enable" : "Disable";
  const actionButtons = [
    canInstall ? ["install-module", "Install"] : null,
    canToggle ? [toggleAction, toggleLabel] : null,
    canOpenExports ? ["open-module-exports", "Open Exports"] : null,
    canUpdate ? ["update-module", "Check Update"] : null,
    canRemove ? ["remove-module", "Remove From Profile"] : null
  ].filter(Boolean);
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
        ${backupHooks.length ? `<small><strong>Backup includes:</strong> ${backupHooks.map((hook) => escapeHtml(backupHookLabel(hook))).join(", ")}</small>` : ""}
        ${disabled ? `<small>Data remains installed. Re-enable this module to show its work area.</small>` : ""}
        ${lifecycle.map((item) => `<small><strong>${item.label}:</strong> ${item.value}</small>`).join("")}
        ${actionButtons.length ? `
          <div class="module-actions">
            ${actionButtons.map(([action, label]) => `
              <button
                type="button"
                class="secondary-action"
                data-module-action="${action}"
                data-module-id="${escapeHtml(module.id)}"
                aria-label="${label} ${escapeHtml(module.display_name)}"
              >${label}</button>
            `).join("")}
          </div>
        ` : ""}
      </div>
    </article>
  `;
}

const GUIDED_MODULE_ACTIONS = new Set([
  "install-module",
  "enable-module",
  "disable-module",
  "update-module",
  "remove-module"
]);

function moduleForReview(moduleId) {
  return state.app.modules.find((module) => module.id === moduleId) || null;
}

function guidedModuleReviewForAction(action, moduleId) {
  const module = moduleForReview(moduleId);
  if (!module) return null;
  const moduleName = module.display_name || module.id;
  const version = module.version || "No release version";
  const common = {
    module: "Module Manager",
    subject: moduleName,
    sources: [
      `Module id: ${module.id}`,
      `Pinned version: ${version}`,
      `CivicCore requirement: ${module.civiccore_requirement || "CivicCore foundation"}`
    ]
  };
  const reviews = {
    "install-module": {
      title: `Review Before Installing ${moduleName}`,
      confirmLabel: "Install Module",
      status: "Profile install requested",
      changes: "Adds this ready module to the active local profile and enables its work area when dependencies are enabled.",
      visibility: "Local administrator only. Staff will see the module work area after the profile is saved.",
      audit: "Updates the local module-selection record and keeps the action in the profile history.",
      retry: "If dependencies or proof gates are missing, the module is not installed and the current profile remains unchanged."
    },
    "enable-module": {
      title: `Review Before Enabling ${moduleName}`,
      confirmLabel: "Enable Module",
      status: "Module enable requested",
      changes: "Shows this installed module's work area again and allows its city-work actions.",
      visibility: "Local administrator only. Staff with access will see the module after it is enabled.",
      audit: "Updates the local enabled-module list without changing existing module data.",
      retry: "If a dependency is disabled, CivicSuite reports the dependency and leaves the module disabled."
    },
    "disable-module": {
      title: `Review Before Disabling ${moduleName}`,
      confirmLabel: "Disable Module",
      status: "Module disable requested",
      changes: "Hides this module's work area and blocks its city-work actions. Existing module data remains installed.",
      visibility: "Local administrator only. Staff will no longer see this module while it is disabled.",
      audit: "Updates the local enabled-module list without deleting records, exports, or settings.",
      retry: "If another enabled module depends on it, CivicSuite reports that dependency before changing the profile."
    },
    "update-module": {
      title: `Review Before Checking ${moduleName} Updates`,
      confirmLabel: "Check Update",
      status: "Manifest update check requested",
      changes: "Checks this module against the pinned versioned manifest. This does not download unverified code.",
      visibility: "Local administrator only. Staff workflows remain available while the check runs.",
      audit: "Returns the current module version state from the local module manifest.",
      retry: "If the module is not installed, CivicSuite asks you to install it before update checks."
    },
    "remove-module": {
      title: `Review Before Removing ${moduleName} From Profile`,
      confirmLabel: "Remove From Profile",
      status: "Profile removal requested",
      changes: "Creates a verified local profile backup, removes this module from the active profile, and hides its work area. Existing module data is not deleted.",
      visibility: "Local administrator only. Staff will not see this module until it is installed again.",
      audit: "Writes a backup manifest before updating the local module-selection record; preserved module data remains covered by profile backup and restore.",
      retry: "If backup creation fails or another installed module depends on it, CivicSuite reports the issue before changing the profile."
    }
  };
  const review = reviews[action];
  return review ? { ...common, ...review } : null;
}

function requiresGuidedModuleReview(action) {
  return GUIDED_MODULE_ACTIONS.has(action);
}

function renderGuidedModuleReview() {
  const review = guidedModuleReviewForAction(state.pendingModuleReviewAction, state.pendingModuleReviewId);
  if (!review) return "";
  return `
    <section class="guided-review" aria-labelledby="module-review-title">
      <div>
        <p class="eyebrow">${escapeHtml(review.module)}</p>
        <h3 id="module-review-title">${escapeHtml(review.title)}</h3>
        <dl class="review-grid">
          <div>
            <dt>Subject</dt>
            <dd>${escapeHtml(review.subject)}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>${escapeHtml(review.status)}</dd>
          </div>
          <div>
            <dt>What will change</dt>
            <dd>${escapeHtml(review.changes)}</dd>
          </div>
          <div>
            <dt>Who can see it</dt>
            <dd>${escapeHtml(review.visibility)}</dd>
          </div>
          <div>
            <dt>Sources and evidence</dt>
            <dd>${review.sources.map((source) => `<span>${escapeHtml(source)}</span>`).join("")}</dd>
          </div>
          <div>
            <dt>Audit trail</dt>
            <dd>${escapeHtml(review.audit)}</dd>
          </div>
          <div>
            <dt>Failure and retry</dt>
            <dd>${escapeHtml(review.retry)}</dd>
          </div>
        </dl>
        <button
          type="button"
          class="primary-action"
          data-module-review-confirm="${state.pendingModuleReviewAction}"
          data-module-id="${escapeHtml(state.pendingModuleReviewId)}"
        >Confirm ${escapeHtml(review.confirmLabel)}</button>
        <button type="button" class="secondary-action" data-module-review-cancel>Cancel Review</button>
      </div>
    </section>
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
      <div class="workflow-form">
        <h3>Local Folders</h3>
        <label>App install folder <input type="text" data-setup-field="installRoot" value="${state.setupDraft.installRoot}" autocomplete="off" readonly /></label>
        <label>City data folder <input type="text" data-setup-field="dataRoot" value="${state.setupDraft.dataRoot}" autocomplete="off" /></label>
        <label>Backup folder <input type="text" data-setup-field="backupRoot" value="${state.setupDraft.backupRoot}" autocomplete="off" /></label>
        <small>The Windows installer owns the app folder. This screen controls local city data and backups.</small>
        <button type="button" class="secondary-action" data-first-run-action="choose-location" data-step-id="locations">Save Local Folders</button>
      </div>
    </section>
    ${renderActionResult()}
    ${renderGuidedModuleReview()}
    <section class="page-heading compact-heading">
      <p class="eyebrow">Module Manager</p>
      <h2>City Core Modules</h2>
      <p>CivicCore stays installed. Product modules can be installed, updated, enabled, disabled, or removed from this profile without silently deleting their local data.</p>
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
          <span class="${item.ok ? "status-ok" : "status-warn"}">${escapeHtml(item.status || (item.ok ? "OK" : "Needs setup"))}</span>
          <h3>${escapeHtml(item.label)}</h3>
          <p>${escapeHtml(item.message)}</p>
          ${item.next_action ? `<p class="next-action"><strong>Next:</strong> ${escapeHtml(item.next_action)}</p>` : ""}
          ${item.admin_detail ? `<small>${escapeHtml(item.admin_detail)}</small>` : ""}
          ${item.actionable !== false && item.id !== "desktop-shell" ? `
            <div class="health-actions" aria-label="${escapeHtml(item.label)} actions">
              <button type="button" class="secondary-action" data-supervisor-action="health" data-service-id="${escapeHtml(item.id)}">Check</button>
              <button type="button" class="secondary-action" data-supervisor-action="install" data-service-id="${escapeHtml(item.id)}">Install</button>
              <button type="button" class="secondary-action" data-supervisor-action="start" data-service-id="${escapeHtml(item.id)}">Start</button>
              <button type="button" class="secondary-action" data-supervisor-action="repair" data-service-id="${escapeHtml(item.id)}">Repair</button>
              <button type="button" class="secondary-action" data-supervisor-action="logs" data-service-id="${escapeHtml(item.id)}">Logs</button>
              <button type="button" class="secondary-action" data-supervisor-action="stop" data-service-id="${escapeHtml(item.id)}">Stop</button>
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
      state.pendingModuleReviewAction = null;
      state.pendingModuleReviewId = null;
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
      state.pendingModuleReviewAction = null;
      state.pendingModuleReviewId = null;
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
      state.pendingModuleReviewAction = null;
      state.pendingModuleReviewId = null;
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
      state.pendingModuleReviewAction = null;
      state.pendingModuleReviewId = null;
      render();
    });
  });
  document.querySelectorAll("[data-module-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      await handleModuleAction(button.dataset.moduleAction, button.dataset.moduleId);
    });
  });
  document.querySelectorAll("[data-module-review-confirm]").forEach((button) => {
    button.addEventListener("click", async () => {
      await handleModuleAction(button.dataset.moduleReviewConfirm, button.dataset.moduleId, { confirmed: true });
    });
  });
  document.querySelectorAll("[data-module-review-cancel]").forEach((button) => {
    button.addEventListener("click", () => {
      state.pendingModuleReviewAction = null;
      state.pendingModuleReviewId = null;
      render();
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
      state.workDraft[input.dataset.workField] = input.type === "checkbox" ? input.checked : input.value;
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
  if (stepId === "locations") {
    return {
      installRoot: state.setupDraft.installRoot,
      dataRoot: state.setupDraft.dataRoot,
      backupRoot: state.setupDraft.backupRoot
    };
  }
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
  if (stepId === "backup") {
    return {
      installRoot: state.setupDraft.installRoot,
      dataRoot: state.setupDraft.dataRoot,
      backupRoot: state.setupDraft.backupRoot
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

async function handleModuleAction(action, moduleId, { confirmed = false } = {}) {
  if (requiresGuidedModuleReview(action) && !confirmed) {
    state.pendingModuleReviewAction = action;
    state.pendingModuleReviewId = moduleId;
    state.actionResult = null;
    render();
    return;
  }
  state.pendingModuleReviewAction = null;
  state.pendingModuleReviewId = null;
  if (!hasTauriBridge()) {
    state.actionResult = {
      accepted: false,
      status: "Desktop app required",
      message: "Module actions are handled by the Windows desktop app, not the browser preview.",
      next_action: "Open the CivicSuite desktop app to install, update, enable, disable, remove modules, or open local module exports."
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
  const work = cityWork();
  const meeting = currentMeeting(work);
  const rosterMembers = meetingMembers(work).filter((member) => !meeting || !meeting.body_id || member.body_id === meeting.body_id);
  const selectedVoteMember = rosterMembers.find((member) => member.id === draft.memberVoteMemberId) || rosterMembers[0] || null;
  const meetingMotions = meeting?.motions || [];
  const selectedVoteMotion = meetingMotions.find((motion) => motion.id === draft.memberVoteMotionId) || meetingMotions[meetingMotions.length - 1] || null;
  const selected = {
    meetingId: meeting?.id || "",
    agendaIntakeId: currentAgendaIntake()?.id || "",
    publicCommentId: currentPublicComment()?.id || "",
    recordsRequestId: currentRecordsRequest()?.id || "",
    codeSourceId: currentCodeSource()?.id || "",
    codeHandoffId: currentCodeHandoff()?.id || "",
    notificationId: currentNotification()?.id || ""
  };
  const payloads = {
    "create-meeting-body": {
      meetingBodyName: draft.meetingBodyName,
      meetingBodyType: draft.meetingBodyType,
      meetingBodyStatutoryBasis: draft.meetingBodyStatutoryBasis,
      meetingBodyCadence: draft.meetingBodyCadence,
      meetingBodyDefaultNoticeDays: draft.meetingBodyDefaultNoticeDays,
      meetingBodyQuorumRule: draft.meetingBodyQuorumRule
    },
    "add-meeting-member": {
      meetingBodyId: draft.meetingBodyId || meetingBodies(work)[0]?.id || "",
      meetingBodyName: draft.meetingBodyName,
      memberName: draft.memberName,
      memberRole: draft.memberRole,
      memberTermStart: draft.memberTermStart,
      memberTermEnd: draft.memberTermEnd,
      memberEmail: draft.memberEmail
    },
    "create-meeting": {
      title: draft.meetingTitle,
      meetingBodyId: draft.meetingBodyId || meetingBodies(work)[0]?.id || "",
      meetingBodyName: draft.meetingBodyName,
      meetingDate: draft.meetingDate,
      summary: draft.meetingSummary,
      agendaTitle: draft.agendaTitle
    },
    "add-agenda-item": { ...selected, agendaTitle: draft.agendaTitle },
    "submit-agenda-intake": {
      agendaIntakeTitle: draft.agendaIntakeTitle,
      agendaIntakeSubmitter: draft.agendaIntakeSubmitter,
      agendaIntakeDepartment: draft.agendaIntakeDepartment,
      agendaIntakeSummary: draft.agendaIntakeSummary,
      agendaIntakeSourceReference: draft.agendaIntakeSourceReference,
      agendaIntakeMeetingDate: draft.agendaIntakeMeetingDate
    },
    "review-agenda-intake": {
      ...selected,
      agendaIntakeDecision: draft.agendaIntakeDecision,
      agendaIntakeReviewNote: draft.agendaIntakeReviewNote
    },
    "promote-agenda-intake": selected,
    "record-staff-report": {
      ...selected,
      staffReportAgendaItemId: draft.staffReportAgendaItemId,
      staffReportRecommendation: draft.staffReportRecommendation,
      staffReportBackground: draft.staffReportBackground,
      staffReportAnalysis: draft.staffReportAnalysis,
      staffReportFiscalImpact: draft.staffReportFiscalImpact,
      staffReportAlternatives: draft.staffReportAlternatives,
      staffReportPriorActions: draft.staffReportPriorActions,
      staffReportPreparedBy: draft.staffReportPreparedBy,
      staffReportRevisionNote: draft.staffReportRevisionNote
    },
    "add-meeting-attachment": {
      ...selected,
      meetingAttachmentTitle: draft.meetingAttachmentTitle,
      meetingAttachmentSourcePath: draft.meetingAttachmentSourcePath,
      meetingAttachmentCitation: draft.meetingAttachmentCitation,
      meetingAttachmentSection: draft.meetingAttachmentSection,
      meetingAttachmentAccess: draft.meetingAttachmentAccess
    },
    "finalize-meeting-packet": {
      ...selected,
      packetTitle: draft.packetTitle,
      packetPreparedBy: draft.packetPreparedBy,
      packetReviewNote: draft.packetReviewNote
    },
    "record-closed-session": {
      ...selected,
      closedSessionBasis: draft.closedSessionBasis,
      closedSessionTopics: draft.closedSessionTopics,
      closedSessionAttendees: draft.closedSessionAttendees,
      closedSessionEnteredAt: draft.closedSessionEnteredAt,
      closedSessionExitedAt: draft.closedSessionExitedAt,
      closedSessionReconvene: draft.closedSessionReconvene,
      closedSessionNotesReference: draft.closedSessionNotesReference
    },
    "add-code-handoff-agenda": selected,
    "complete-notice-checklist": {
      ...selected,
      noticeMeetingType: draft.noticeMeetingType,
      noticeStatutoryBasis: draft.noticeStatutoryBasis,
      noticeDeadline: draft.noticeDeadline,
      noticeTimeZone: draft.noticeTimeZone,
      noticeHumanApproval: draft.noticeHumanApproval
    },
    "post-notice": {
      ...selected,
      postingLocation: draft.noticeLocation,
      postingMethod: draft.noticeMethod,
      postingConfirmation: draft.noticeConfirmation,
      postingDate: draft.noticePostingDate
    },
    "export-meeting-packet": selected,
    "suggest-minutes-draft": selected,
    "record-minutes": { ...selected, minutes: draft.minutes },
    "record-motion": {
      ...selected,
      motionText: draft.motionText,
      motionMover: draft.motionMover,
      motionSeconder: draft.motionSeconder,
      motionDisposition: draft.motionDisposition,
      motionVoteReference: draft.motionVoteReference
    },
    "add-minute-citation": {
      ...selected,
      minutesCitationSentence: draft.minutesCitationSentence,
      minutesCitationSourceType: draft.minutesCitationSourceType,
      minutesCitationSourceRef: draft.minutesCitationSourceRef,
      minutesCitationNote: draft.minutesCitationNote,
      minutesCitationAccess: draft.minutesCitationAccess
    },
    "record-vote": { ...selected, vote: draft.vote },
    "record-member-vote": {
      ...selected,
      memberVoteMotionId: selectedVoteMotion?.id || draft.memberVoteMotionId,
      memberVoteMemberId: selectedVoteMember?.id || draft.memberVoteMemberId,
      memberVoteMemberName: selectedVoteMember?.name || draft.memberVoteMemberName,
      memberVoteValue: draft.memberVoteValue
    },
    "add-action-item": {
      ...selected,
      actionItem: draft.actionItem,
      actionItemOwner: draft.actionItemOwner,
      actionItemDueDate: draft.actionItemDueDate,
      actionItemStatus: draft.actionItemStatus,
      actionItemSourceReference: draft.actionItemSourceReference
    },
    "sign-minutes": {
      ...selected,
      minutesSignedBy: draft.minutesSignedBy,
      minutesSignatureAttestation: draft.minutesSignatureAttestation
    },
    "record-adopted-legislation": {
      ...selected,
      adoptedLegislationType: draft.adoptedLegislationType,
      adoptedLegislationTitle: draft.adoptedLegislationTitle,
      adoptedLegislationText: draft.adoptedLegislationText,
      adoptedLegislationEffectiveDate: draft.adoptedLegislationEffectiveDate,
      adoptedLegislationCodificationHint: draft.adoptedLegislationCodificationHint
    },
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
      deadline: draft.deadline,
      deadlineBasis: draft.recordsDeadlineBasis
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
    "add-public-records-message": {
      trackingNumber: draft.publicRequestLookup,
      requesterContact: draft.publicRequestContact,
      publicRequestMessage: draft.publicRequestMessage
    },
    "set-records-deadline": {
      ...selected,
      deadline: draft.deadline,
      deadlineBasis: draft.recordsDeadlineBasis
    },
    "request-records-clarification": { ...selected, clarificationNote: draft.clarificationNote },
    "add-records-message": { ...selected, requestMessageBody: draft.requestMessageBody },
    "assign-records-request": { ...selected, assignedTo: draft.assignedTo },
    "record-records-search": {
      ...selected,
      sourceNote: draft.sourceNote,
      citation: draft.citation
    },
    "record-records-search-session": {
      ...selected,
      searchQuery: draft.recordsSearchQuery,
      searchLocations: draft.searchLocations,
      searchResultTitle: draft.searchResultTitle,
      searchResultCitation: draft.searchResultCitation,
      searchResultSummary: draft.searchResultSummary,
      searchResultStatus: draft.searchResultStatus,
      searchReviewer: draft.searchReviewer
    },
    "add-records-document": {
      ...selected,
      documentTitle: draft.documentTitle,
      documentSourcePath: draft.documentSourcePath,
      documentCitation: draft.documentCitation
    },
    "add-records-exemption-review": { ...selected, exemptionNote: draft.exemptionNote },
    "add-records-exemption-decision": {
      ...selected,
      exemptionSource: draft.exemptionSource,
      exemptionKind: draft.exemptionKind,
      exemptionFinding: draft.exemptionFinding,
      exemptionDecision: draft.exemptionDecision,
      exemptionBasis: draft.exemptionBasis,
      exemptionReviewer: draft.exemptionReviewer
    },
    "estimate-records-fee": { ...selected, feeEstimate: draft.feeEstimate },
    "add-records-fee-line": {
      ...selected,
      feeLineDescription: draft.feeLineDescription,
      feeScheduleBasis: draft.feeScheduleBasis,
      feeLineAmount: draft.feeLineAmount
    },
    "waive-records-fee": {
      ...selected,
      feeWaiverReason: draft.feeWaiverReason
    },
    "suggest-records-response": selected,
    "draft-records-response": {
      ...selected,
      responseDraft: draft.responseDraft,
      citation: draft.citation
    },
    "approve-records-response": { ...selected, approvalNote: draft.approvalNote },
    "build-records-release-package": selected,
    "export-records-response": selected,
    "fulfill-records-request": selected,
    "close-records-request": selected,
    "mark-notification-sent": selected,
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
    "suggest-code-guidance": selected,
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
    if (action === "lookup-public-records-request" || action === "add-public-records-message") {
      const trackingNumber = state.workDraft.publicRequestLookup.trim().toLowerCase();
      const requesterContact = state.workDraft.publicRequestContact.trim().toLowerCase();
      const found = Boolean((result.state.records_requests || []).some((request) => (
        String(request.public_tracking_number || "").toLowerCase() === trackingNumber
      )));
      state.publicRecordsLookup = { trackingNumber, requesterContact, found };
      if (action === "add-public-records-message" && result.accepted) {
        state.workDraft.publicRequestMessage = "";
      }
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
