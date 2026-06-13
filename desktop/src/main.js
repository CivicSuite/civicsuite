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
  modules: [],
  installer_steps: [],
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
  app: fallbackState
};

function byId(id) {
  return document.getElementById(id);
}

async function loadAppState() {
  try {
    state.app = await invoke("get_app_state");
  } catch (error) {
    console.warn("Using browser fallback state", error);
  }
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
    <section class="health-grid">
      ${state.app.health.map((item) => `
        <article class="health-card">
          <span class="${item.ok ? "status-ok" : "status-warn"}">${item.status || (item.ok ? "OK" : "Needs setup")}</span>
          <h3>${item.label}</h3>
          <p>${item.message}</p>
          ${item.next_action ? `<p class="next-action"><strong>Next:</strong> ${item.next_action}</p>` : ""}
          ${item.admin_detail ? `<small>${item.admin_detail}</small>` : ""}
        </article>
      `).join("")}
    </section>
    <section class="section-band">
      <div class="section-title">
        <h3>Installer path</h3>
        <p>The first-run flow stays local and does not ask clerks to use developer tools.</p>
      </div>
      <ol class="step-list">
        ${state.app.installer_steps.map((step) => `<li>${step}</li>`).join("")}
      </ol>
    </section>
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
}

await loadAppState();
render();
