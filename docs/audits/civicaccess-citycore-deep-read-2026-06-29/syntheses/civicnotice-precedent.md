# Synthesis: civicnotice-precedent (2026-06-29 deep-read)

**Summary**:

CivicNotice's integration into city-core was atomic. The umbrella repo's initial public-seed commit (PR #193, merged 2026-06-24 as d660f8f "Merge pull request #193 from CivicSuite/work/windows-local-1-finalize-main") added civicnotice everywhere it needed to exist: installer/modules.json registry record (pinned to source_commit 2bf0c9d7), Python services import (services.py MODULE_IMPORTS), runtime payload manifest (Lib/site-packages/civicnotice/main.py), 4 Rust workflow handlers (complete_notice_checklist, calculate_notice_deadline, post_notice, export_notice_archive_packet) routed via main.rs action dispatcher, search wiring tagging notice records with module_id="civicnotice", desktop UI panel renderNoticeWorkflow() with 4 civicnotice-* buttons + legacy 3 unprefixed buttons in main.js, and tests at three layers (Rust cargo test civicnotice_actions_save_notice_workpaper_and_search_result, JS static-smoke payload assertions, Playwright workflow-pages.spec.mjs with XSS-injected civicnotice form drive). Post-#193 PRs (#204, #208, #209, #210) were ship-prep polish: install-notice copy, FAQ source-pin sweep, source-commit refresh — not new wiring. Time from civicnotice repo creation (2026-04-27) to first city-core membership (2026-06-24): ~58 days, 1 integration PR (#193) plus 3 prior tracking-only PRs (#25, #58, #101) and 4 post-ship cleanup PRs. ADR-0010 module-package contract is fully satisfied: every required field group (identity, selection, compatibility, runtime allocation, installer behavior, data behavior, security/UX, model behavior, proof requirements) is present in the registry entry. This is the reference pattern CivicAccess Phase B/C replicated 5 days later.

**Civicnotice Integration Files**:

- C:\dev\Codex\civicsuite\installer\modules.json
- C:\dev\Codex\civicsuite\desktop\runtime\python-services\civicsuite_runtime\services.py
- C:\dev\Codex\civicsuite\desktop\runtime\windows-runtime-payloads.json
- C:\dev\Codex\civicsuite\desktop\src-tauri\src\workflows.rs
- C:\dev\Codex\civicsuite\desktop\src-tauri\src\main.rs
- C:\dev\Codex\civicsuite\desktop\src-tauri\src\module_registry.rs
- C:\dev\Codex\civicsuite\desktop\src\main.js
- C:\dev\Codex\civicsuite\desktop\tests\static-smoke.mjs
- C:\dev\Codex\civicsuite\desktop\tests\browser\workflow-pages.spec.mjs
- C:\dev\Codex\civicsuite\desktop\installer\windows\unsigned-beta-install-notice.txt
- C:\dev\Codex\civicsuite\docs\architecture\ADR-0010-module-package-contract.md

**Workflows Handlers Added**:

- complete_notice_checklist (workflows.rs:2482) - routed via main.rs as both legacy 'complete-notice-checklist' and 'civicnotice-complete-checklist'
- calculate_notice_deadline (workflows.rs:2543) - routed as legacy 'calculate-notice-deadline' and 'civicnotice-calculate-deadline'
- post_notice (workflows.rs:2640) - routed as legacy 'post-notice' and 'civicnotice-post-notice'
- export_notice_archive_packet (workflows.rs:4464) - civicnotice-only handler, emits bundle_type 'civicnotice-notice-archive-packet' to Data/exports/notice
- search_city_work helper (workflows.rs:7159) - tags matched notice records with module_id='civicnotice' so cross-module search surfaces notice workpapers
- main.rs action dispatcher (lines 201-204) - maps the 4 civicnotice-* actions to module dependency vec!['civicclerk','civicnotice']
- main.rs navigation router (lines 255, 284) - Some('notice') => civicnotice module area, civicnotice => ('notice', 'notice exports') export-folder mapping

**Frontend Buttons Added**:

- main.js:3422 'Calculate Deadline' data-work-action='civicnotice-calculate-deadline' (CivicNotice panel)
- main.js:3423 'Save Checklist' data-work-action='civicnotice-complete-checklist'
- main.js:3433 'Record Posting Proof' data-work-action='civicnotice-post-notice'
- main.js:3434 'Build Archive Packet' data-work-action='civicnotice-export-archive-packet'
- main.js:2979 legacy 'Calculate Notice Deadline' data-work-action='calculate-notice-deadline' (Meetings panel, dual-routed)
- main.js:2980 legacy 'Approve Notice Checklist' data-work-action='complete-notice-checklist' (Meetings panel)
- main.js:115-117 module registration fallback state {id:'civicnotice', display_name:'CivicNotice', role:'public notice workflow'}
- main.js:10 MODULE_AREA_BY_ID notice => 'civicnotice' (nav area mapping)
- renderNoticeWorkflow() entire 'Public Notices' page including Notice Workpaper form (meeting type, statutory basis, lead days, day type, deadline, time zone, clerk approval) and Posting Proof form (date, location, method, confirmation)

**Tests Added**:

- desktop/src-tauri/src/workflows.rs:8029 cargo test civicnotice_actions_save_notice_workpaper_and_search_result - end-to-end test creating meeting body + meeting, running civicnotice-complete-checklist + civicnotice-post-notice + civicnotice-export-archive-packet, asserting notice_status='public notice ready', exports folder name='notice', bundle_type='civicnotice-notice-archive-packet', notice_postings count, and search_city_work returns module_id='civicnotice' result
- desktop/src-tauri/src/module_registry.rs:1157 cargo test civicnotice_installs_with_clerk_dependency_from_custom_profile - asserts contract_ready, version 0.2.0, civiccore_requirement 1.2.0, model_required=false, no blocked_reason
- desktop/src-tauri/src/main.rs:921 cargo test city_core_modules_are_reported_installed - includes 'civicnotice' in the city-core install assertion loop
- desktop/tests/static-smoke.mjs:310 'path: civicnotice', 'ref: 2bf0c9d7...' - asserts the MSI build workflow checks out civicnotice at the pinned source_commit
- desktop/tests/static-smoke.mjs:669 asserts windows-runtime-payloads.json bundles 'Lib/site-packages/civicnotice/main.py' in cpython-services payload
- desktop/tests/browser/workflow-pages.spec.mjs:413-460 Playwright test mounting civicnotice as installed/enabled in custom profile, navigating to Public Notices, filling Statutory notice basis + Posting confirmation with XSS payloads, asserting Calculate Deadline + Save Checklist review-gate modals render and CivicNotice module label appears

**Adr Compliance**:

FULL. The civicnotice registry entry in installer/modules.json satisfies every ADR-0010 field group: Identity (id, display_name='CivicNotice', repo='CivicSuite/civicnotice', tier=3, role='public notice workflow'); Selection (selectable=true, required=false); Compatibility (civiccore_requirement='1.2.0', dependencies=['civiccore','civicclerk'], current_version='0.2.0'); Runtime allocation (default_port=8066, services=[python-services bundled-python + file-storage local-file-store, each with health_check]); Installer behavior (source_commit='2bf0c9d7b764af84cd042657a972e84213a261d5', installer_status='v0_2_0_installed_module_release', lifecycle={install:profile-selected, update:manifest-versioned, disable:allowed-after-backup, uninstall:backup-first-module-data-removal}); Data behavior (migrations=['civicnotice-windows-local-state-v1'], backup_restore_hooks=['Data/workflows/notice','Data/exports/notice','Data/files/notice']); Security/UX (permissions=['notice.registry','notice.deadline','notice.proof','notice.archive'], routes=[{notice-workbench Staff /notice},{search-city-knowledge Staff /search}]); Model behavior (model_needs=[] -- no local LLM); Proof requirements (proof_required=[module_selection, install_plan, artifact_resolution, health_check, restart, backup, restore, release_artifacts]). Contract enforced by scripts/verify-module-manifest-contract.py per ADR-0010 Verification section.

**Time To Integrate**:

~58 days, 1 integration PR. Civicnotice repo created on GitHub 2026-04-27; first city-core membership landed in umbrella PR #193 (merge d660f8f) on 2026-06-24. Three prior umbrella PRs (#25, #58, #101) only updated docs/compatibility tracking without wiring runtime/UI/tests. Four follow-up PRs (#204, #208, #209, #210) on 2026-06-28 were ship-polish for the v1.0.1 GA-candidate beta (install-notice copy, FAQ source-pin step, supervisor.rs absolute-path spawn fix, source-commit refresh) -- not new integration. So the integration itself is a single lockstep PR landing 58 days after the module repo first appeared.

