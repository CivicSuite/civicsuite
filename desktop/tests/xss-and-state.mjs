// T4 + T7 — frontend state-load + XSS behavioral guards.
//
// main.js is an ES module that (a) imports `invoke` from @tauri-apps/api/core,
// (b) imports ./styles.css, and (c) auto-runs `await loadAppState(); render();`
// at the bottom against the real DOM. To exercise it under Node we:
//   - stub a minimal DOM + window (with controllable __TAURI_INTERNALS__),
//   - replace the @tauri-apps import with an injectable invoke,
//   - drop the css import,
//   - append a tiny export so the test can reach the module internals
//     (state, appStateLoaded, loadAppState, render, renderFirstRunWizard),
// then import the rewritten module from a data: URL (preserves ESM + top-level
// await semantics). Mirrors tests/static-smoke.mjs conventions (throw on fail).

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const mainSrc = readFileSync(join(root, "src", "main.js"), "utf8");

function fail(message) {
  throw new Error(`xss-and-state: ${message}`);
}

// ---------------------------------------------------------------------------
// Minimal DOM stub. Only what main.js touches: getElementById("app"),
// element.innerHTML, querySelector / querySelectorAll, addEventListener,
// classList, dataset, textContent, scrollIntoView, requestAnimationFrame,
// matchMedia, activeElement.
// ---------------------------------------------------------------------------
function makeElement(id = "") {
  const el = {
    id,
    _html: "",
    children: [],
    classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
    dataset: {},
    style: {},
    textContent: "",
    setAttribute() {},
    getAttribute: () => null,
    focus() {},
    scrollIntoView() {},
    addEventListener() {},
    removeEventListener() {},
    appendChild() {},
    closest: () => null,
    get innerHTML() {
      return this._html;
    },
    set innerHTML(value) {
      this._html = String(value);
    },
    querySelector() {
      return makeElement();
    },
    querySelectorAll() {
      return [];
    }
  };
  return el;
}

const appEl = makeElement("app");
const elements = { app: appEl };

const documentStub = {
  title: "CivicSuite",
  activeElement: null,
  getElementById(id) {
    if (!elements[id]) elements[id] = makeElement(id);
    return elements[id];
  },
  querySelector() {
    return null;
  },
  querySelectorAll() {
    return [];
  },
  addEventListener() {},
  createElement() {
    return makeElement();
  },
  body: makeElement("body")
};

const windowStub = {
  document: documentStub,
  requestAnimationFrame(cb) {
    // run synchronously so render side effects settle within the test
    cb();
    return 0;
  },
  matchMedia() {
    return { matches: false, addEventListener() {}, removeEventListener() {} };
  },
  addEventListener() {},
  location: { reload() {} }
};

// Controllable Tauri bridge. The test flips these to simulate load outcomes.
let invokeImpl = async () => {
  throw new Error("invoke not configured");
};
windowStub.__TAURI_INTERNALS__ = {};

globalThis.window = windowStub;
globalThis.document = documentStub;
globalThis.requestAnimationFrame = windowStub.requestAnimationFrame;
globalThis.matchMedia = windowStub.matchMedia;

// ---------------------------------------------------------------------------
// Rewrite main.js so it is importable in Node:
//  - replace the @tauri-apps import with our injectable invoke,
//  - drop the styles.css import,
//  - strip the BOM,
//  - append an internals export for assertions.
// ---------------------------------------------------------------------------
let rewritten = mainSrc.replace(/^﻿/, "");
rewritten = rewritten.replace(
  /import\s*\{\s*invoke\s*\}\s*from\s*["']@tauri-apps\/api\/core["'];?/,
  "const invoke = (...args) => globalThis.__TEST_INVOKE__(...args);"
);
rewritten = rewritten.replace(/import\s+["']\.\/styles\.css["'];?/, "");
rewritten +=
  "\nexport const __test__ = { get state() { return state; }, " +
  "get appStateLoaded() { return appStateLoaded; }, loadAppState, render, " +
  "renderFirstRunWizard, fallbackState };\n";

globalThis.__TEST_INVOKE__ = (...args) => invokeImpl(...args);

function loadModule() {
  const url = "data:text/javascript;base64," + Buffer.from(rewritten, "utf8").toString("base64");
  return import(url);
}

// ===========================================================================
// T4.1 — load error: invoke rejects -> appLoadError set, appStateLoaded false,
//         renderFirstRunWizard() === "".
// (The module auto-runs loadAppState()+render() on import with invoke
//  rejecting, so the error path is exercised at import time.)
// ===========================================================================
const XSS_PAYLOAD = '"><img src=x onerror=window.__xss=1>';

invokeImpl = async () => {
  throw new Error("Could not parse local workflow state: corrupt JSON at line 1");
};
const mod = await loadModule();
const t = mod.__test__;

if (t.appStateLoaded !== false) fail("T4.1: appStateLoaded must be false after a load error");
if (!t.state.appLoadError) fail("T4.1: state.appLoadError must be set after a load error");
if (t.renderFirstRunWizard() !== "") {
  fail("T4.1: renderFirstRunWizard() must return '' when state failed to load (no fallback wizard)");
}

// T4.2 — render() output shows the retryable error banner, NOT the first-run
//         checklist, and includes the retry action hook.
t.render();
const errorHtml = appEl.innerHTML;
if (!errorHtml.includes("could not open your saved city data")) {
  fail("T4.2: error render must contain the 'could not open your saved city data' banner");
}
if (!errorHtml.includes("data-action='retry-load-state'") &&
    !errorHtml.includes('data-action="retry-load-state"')) {
  fail("T4.2: error render must contain the retry-load-state action");
}
if (errorHtml.includes("setup checklist")) {
  fail("T4.2: error render must NOT contain the first-run checklist heading");
}

// T4.2b — the corrupt error message is escaped (defense in depth: appLoadError
//          may echo back text). Inject an XSS payload as the error message and
//          confirm it renders inert (no raw <img onerror>).
invokeImpl = async () => {
  throw new Error(XSS_PAYLOAD);
};
await t.loadAppState();
t.render();
const injectedHtml = appEl.innerHTML;
if (injectedHtml.includes("<img src=x onerror=")) {
  fail("T4.2b: an XSS payload in the load error must be escaped, not rendered raw");
}
if (!injectedHtml.includes("&lt;img")) {
  fail("T4.2b: the escaped payload should appear as &lt;img...");
}

// T4.3 — retry: invoke resolves on retry -> app renders normally, error cleared.
// Use the module's own complete fallbackState shape (a valid full app state) so
// render() exercises the real, full render tree rather than a partial stub.
const FINISHED_STATE = {
  ...t.fallbackState,
  first_run: { ...t.fallbackState.first_run, finished: true }
};
invokeImpl = async (cmd) => (cmd === "get_app_state" ? FINISHED_STATE : {});
await t.loadAppState();
if (t.appStateLoaded !== true) fail("T4.3: appStateLoaded must be true after a successful retry");
if (t.state.appLoadError !== null) fail("T4.3: state.appLoadError must be cleared after a successful retry");
t.render();
if (appEl.innerHTML.includes("could not open your saved city data")) {
  fail("T4.3: after a successful retry the error banner must be gone");
}

// ===========================================================================
// T7 — PR#194 first-run cue regression + appStateLoaded gate.
//   genuine first-run: get_app_state resolves finished:false with a
//   profile_label + locations -> wizard renders the checklist + all three
//   locations; gated on appStateLoaded === true.
// ===========================================================================
const FIRST_RUN_APP = {
  ...t.fallbackState,
  first_run: {
    ...t.fallbackState.first_run,
    finished: false,
    profile_label: "City Clerk Core",
    steps: [
      { id: "locations", label: "Choose local folders", status: "current", detail: "", actions: [] }
    ],
    locations: {
      install_root: "C:/CivicSuite/App",
      data_root: "C:/CivicSuite/Data",
      backup_root: "C:/CivicSuite/Backups"
    }
  }
};

invokeImpl = async (cmd) => (cmd === "get_app_state" ? FIRST_RUN_APP : {});
await t.loadAppState();
if (t.appStateLoaded !== true) fail("T7: appStateLoaded must be true after a genuine first-run load");

const wizard = t.renderFirstRunWizard();
if (!wizard.includes("City Clerk Core setup checklist")) {
  fail("T7: wizard must render '${profile_label} setup checklist'");
}
for (const loc of ["C:/CivicSuite/App", "C:/CivicSuite/Data", "C:/CivicSuite/Backups"]) {
  if (!wizard.includes(loc)) fail(`T7: wizard must render location ${loc}`);
}

// T7 negative: finished === true -> wizard returns "".
const FINISHED_APP = { ...FIRST_RUN_APP, first_run: { ...FIRST_RUN_APP.first_run, finished: true } };
invokeImpl = async (cmd) => (cmd === "get_app_state" ? FINISHED_APP : {});
await t.loadAppState();
if (t.renderFirstRunWizard() !== "") fail("T7: a finished first-run must render no wizard");

// ===========================================================================
// T8 — #17 defense-in-depth: backend-origin first-run chrome (profile_label,
//   locations, step text) is escaped, not interpolated raw into innerHTML.
// ===========================================================================
const XSS_FIRST_RUN_APP = {
  ...t.fallbackState,
  first_run: {
    ...t.fallbackState.first_run,
    finished: false,
    profile_label: XSS_PAYLOAD,
    steps: [
      { id: "model", label: XSS_PAYLOAD, status: "current", summary: "", detail: "", current: true }
    ],
    locations: { install_root: XSS_PAYLOAD, data_root: "", backup_root: "" }
  }
};
invokeImpl = async (cmd) => (cmd === "get_app_state" ? XSS_FIRST_RUN_APP : {});
await t.loadAppState();
const xssWizard = t.renderFirstRunWizard();
if (xssWizard.includes("<img src=x onerror=")) {
  fail("T8: backend-origin first-run strings must be escaped, not rendered raw");
}
if (!xssWizard.includes("&lt;img")) {
  fail("T8: the escaped first-run payload should appear as &lt;img...");
}

// ===========================================================================
// T9 — #34 model download expectation: the current "model" first-run step
//   states the download size (from state.app.model.download_size_bytes) and
//   that it resumes if interrupted.
// ===========================================================================
const modelSize = `${(t.fallbackState.model.download_size_bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
if (!xssWizard.includes(modelSize)) {
  fail(`T9: model step must show the download size ${modelSize}`);
}
if (!/resume/i.test(xssWizard)) {
  fail("T9: model step must state the download resumes if interrupted");
}

console.log("PASS: xss-and-state (T4 + T7 + T8 + T9) checks passed");
