# Refutation lens: refute-civicaccess-functionally-inert (2026-06-29 deep-read)

**Claim**:

In the shipping 6-module MSI built from civicsuite main 4e0f103, CivicAccess is functionally inert — the user cannot click any UI surface to reach civicaccess, and no HTTP route or Tauri command serves any civicaccess capability.

**Refuted**:

False

**Reason**:

Direct verification on HEAD 4e0f1031ec7d6bed41ba546bd5a5f5c5b34ad3c1 confirms the claim on every required axis. Tried hard to refute via (a) frontend grep, (b) workflows.rs dispatch, (c) supervisor service list, (d) any in-process HTTP mount of the civicaccess FastAPI app, (e) Tauri customProtocol / proxy / WebView2 routing rules, (f) dynamic-import escape hatches. All paths come up empty.

CONFIRMED EVIDENCE:

(1) Frontend has zero civicaccess surface. `grep -c 'civicaccess\\|accessibility' C:/dev/Codex/civicsuite/desktop/src/main.js` returns 0. No nav entry, no module card in fallbackState, no `data-work-action='accessibility-review'` button, no `data-work-action='civicaccess-*'` button. There is no UI a clerk could click.

(2) Tauri IPC dispatcher has no handler. `grep 'civicaccess|accessibility-review|records-export' C:/dev/Codex/civicsuite/desktop/src-tauri/src/workflows.rs` returns no matches. The `city_work_action` match in workflows.rs (around lines 7667-7783) has no `accessibility-review` or `records-export` arm. Per the synthesis's evidence-citation, the final arm returns `Err('Unsupported city workflow action: ...')`. So even though main.rs:262 declares `'accessibility-review' | 'records-export' => Some((vec!['civicaccess'], false))` for role-gating, the action dispatch in workflows.rs falls through to the error arm.

(3) No HTTP route reaches civicaccess. C:/dev/Codex/civicsuite/desktop/runtime/python-services/civicsuite_runtime/services.py:167-181 — the `HealthHandler` only answers `/health` and `/modules`, returning 404 for anything else (`if self.path not in {'/health', '/modules'}: self.send_error(404)`). The civicaccess app is imported in memory at line 86 via `importlib.import_module('civicaccess.main')` purely for loadability reporting, but is never bound to uvicorn or any port. There is no uvicorn invocation anywhere in the desktop runtime — `grep 'uvicorn|FastAPI|mount|asgi|wsgi'` over desktop/ returns no matches.

(4) Supervisor spawns no civicaccess process. C:/dev/Codex/civicsuite/desktop/runtime/windows-local-runtime.json lists exactly 5 services: postgres, python-services, task-queue (civiccore.tasks.worker), model-runtime, file-storage. No civicaccess service entry. modules.json default_port 8060 is never opened.

(5) No hidden routing or proxy. C:/dev/Codex/civicsuite/desktop/src-tauri/tauri.conf.json has no customProtocol entry, no `windows` URL rewriting. The CSP `connect-src` is `'self' ipc: http://ipc.localhost` (line 28), which technically wouldn't even permit the WebView2 to make XHR/fetch calls to localhost ports like civicaccess's nominal 8060 even if it WERE listening. There is no `register_uri_scheme` or `register_async_uri_scheme` in any Rust source.

(6) The only Rust-side civicaccess wiring is genuinely inert plumbing: supervisor.rs:386-387 provisions `CIVICACCESS_TRUSTED_WRITE_TOKEN` and supervisor.rs:2047 injects it into the python-services env (so the write-guard WOULD accept it if reached); auth.rs:539 includes civicaccess in the clerk role's module list (so the role gate WOULD pass if any handler existed); main.rs:256/262/285 declare folder→module and action→module mappings for `open-exports-folder`/role-gating. None of these expose a user-clickable surface.

(7) Phase B/C history corroborates: the Phase B commit message itself names this state ('Keep Phase B inert'), and Phase C's documentation (per the synthesis) is explicit that it is a 'truth/registry milestone, NOT the program Definition of Done' and that the published v1.0.1 MSI from this commit 'bundles the first 5 city-core modules' for actual user-reachable functionality even though the registry now counts 6.

Net: civicaccess in this MSI is dark code — bundled, importable, schema-bootstrapped, token-provisioned, health-reported — but no UI button, no IPC handler, and no HTTP route exposes any civicaccess capability to the user. The claim stands as written.

**Counter Evidence If Any**:

The closest things to counter-evidence are all inert wiring that does NOT actually expose user capability: (a) supervisor.rs:386-388 + 2043-2048 inject `CIVICACCESS_TRUSTED_WRITE_TOKEN` into every Python service child, so if anyone could reach a civicaccess HTTP endpoint with the matching `X-CivicAccess-Write-Token` header, writes would be accepted — but no endpoint listens; (b) auth.rs:539 grants `civicaccess` to the clerk role's module list, so role-gating would succeed — but no handler consumes the grant; (c) main.rs:262 declares `'accessibility-review' | 'records-export'` as actions requiring the `civicaccess` module for role-gating — but workflows.rs::city_work_action has no matching arm and falls through to `Err('Unsupported city workflow action: ...')`; (d) main.rs:256 + 285 wire `open-exports-folder` with folder='access' to open `Data/exports/access` — this is the ONLY working civicaccess-adjacent path in the shipping desktop, and even it just opens an empty filesystem folder, not any civicaccess capability; (e) services.py imports `civicaccess.main` for /health reporting (the FastAPI app object is constructed in memory and reports `optional:true, version:'0.4.0'`) — but is never mounted to a port; (f) migrate.py best-effort bootstraps the civicaccess schema and supervisor provisions the write token, so the system is READY to serve civicaccess if a future build adds the UI + handler + uvicorn mount — but in 4e0f103 it does not. None of these constitute a user-reachable civicaccess capability and so do not refute the claim.

