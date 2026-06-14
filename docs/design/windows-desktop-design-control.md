# CivicSuite Windows Desktop Design Control

Status: active design control for Windows Local 1.0
Applies to: CivicSuite desktop shell, installer, first-run, city-core modules, and future module manager
Source anchors:

- `docs/CivicSuiteUnifiedSpec.md`
- `docs/design/ui-ux-prototype/README.md`
- `docs/design/ui-ux-prototype/*.jsx`
- `docs/design/ui-ux-prototype/styles.css`
- `docs/ux/shared-shell-inventory.md`
- `docs/architecture/ADR-0008-portable-native-windows-runtime.md`
- `docs/architecture/ADR-0009-postgres-backed-queue-windows-profile.md`
- `docs/installer/suite-installer-plan.md`
- `specs/01_catalog.md`
- `specs/02_CivicCore.md`
- `specs/03_civicclerk.md`

## Product Promise

CivicSuite Windows Local 1.0 is a real Windows desktop application for
non-technical municipal staff. A city clerk should be able to install it, create
the first city profile, use the city-core workflows, verify system health, back
up and restore local data, and uninstall without Docker, WSL, a terminal, or
developer vocabulary.

The UX rule is simple: a clerk should never have to understand the architecture
to do the work.

## Audience

Primary users:

- City clerks and deputy clerks
- Records staff
- City employees handling public records, meetings, notices, minutes, code, and
  source documents

Secondary users:

- Small-city managers who share clerk/admin work
- Light IT staff or managed-service providers

Non-goals for the primary path:

- Requiring terminal commands
- Requiring Docker Desktop, WSL, Linux knowledge, or service orchestration
- Exposing ports, processes, migrations, model internals, or logs before the
  plain-English health summary

## Application Shape

The Windows app is a Tauri/WebView2 desktop shell over a fully local runtime.
The shell owns these top-level areas:

| Area | User framing | Owner |
|---|---|---|
| Home | Work that needs attention | CivicSuite shell |
| Meetings & Notices | agendas, packets, notices, minutes, votes, archive | CivicClerk |
| Records Requests | intake, search, review, response, exports | CivicRecords AI |
| Code & Ordinances | code search, source imports, guidance, handoffs | CivicCode |
| Search City Knowledge | cross-module local search with citations | CivicCore + modules |
| System Health | local services, model, storage, backup, support bundle, repair | CivicCore |
| Settings | city profile, users, modules, data location, updates | CivicCore |

The module names remain visible for trust and support, but primary navigation is
task-first. A clerk sees "Meetings & Notices" before "CivicClerk".

## Surfaces

The app keeps the prototype's three-surface commitment:

| Surface | Audience | Rule |
|---|---|---|
| Staff | clerks and city employees | Default authenticated work surface |
| Resident/Public | public-facing preview and local publication surfaces | Never exposes staff-only actions |
| IT/Admin | health, repair, model, logs/support bundle, modules, backups | Plain-English summary first; technical detail behind disclosure |

Switching surfaces is always visible in the shell. A route must identify which
surface the user is in.

Local administrators manage staff users in Settings. Staff roles are plain
municipal roles, not technical groups: City staff can work across the installed
city-core modules; Clerk staff are limited to Meetings & Notices; Records staff
to Records Requests; Code staff to Code & Ordinances. Staff users do not receive
setup, runtime, backup, module-manager, or user-management authority unless they
are the local administrator.

## First-Run And Installer UX

The installer and first-run wizard are product surfaces, not setup scripts. They
must use the same voice and design discipline as the app.

Required installer steps:

1. Welcome and unsigned beta notice.
2. SmartScreen explanation in plain English, including why the warning appears
   and what "More info" and "Run anyway" mean for this unsigned beta.
3. Local install location and data location.
4. Module selection: City Core by default, Custom available, CivicCore locked.
5. Model download: Gemma 4 12B quantization-aware weights, pinned metadata,
   resumable download, checksum verification, and local-only default.
6. City profile: city name, state, time zone, records contact, clerk contact.
7. First admin user.
8. Backup default.
9. Health verification.
10. Finish screen with open app, repair, backup, support bundle, and uninstall
    entry points.

The installer must not ask clerks to open a terminal, edit environment files, or
start Docker/WSL. If a technical failure happens, the installer gives a plain
next step and records the technical detail in the health/log area.

## Workflow UX Rules

Every primary workflow screen answers three questions:

- What am I working on?
- What needs my attention?
- What is the next safe action?

Risky civic actions use guided review:

- Posting a meeting notice
- Publishing or archiving a record
- Adopting or posting minutes
- Generating a response letter
- Importing code/source material
- Creating an ordinance or resolution handoff
- Running backup, restore, support bundle, repair, disable, or uninstall

Guided review must show:

- Draft/internal/public/official status
- Sources and citations
- What will change
- Who will be able to see the result
- Audit trail entry that will be created
- Failure path and safe retry path

The UI must block official/public language when the underlying workflow is
sample-only, in-memory, disconnected, missing citations, or not yet wired.

## Module Manager UX

The module manager is present in the Windows Local 1.0 architecture even when
only the city-core set is enabled.

It shows:

- Installed modules
- Available modules
- Disabled or not-ready modules when useful for roadmap transparency
- Dependencies in clerk-readable language
- Required disk/model/runtime resources
- Install, disable, repair, update, backup, export, and uninstall states

CivicCore is always installed and cannot be deselected. Product modules can be
installed one at a time when their manifest and proof gates pass.

Future modules plug into the same shell by declaring their manifest contract.
No future module may require rewriting the desktop shell or installer to become
visible.

## Copy And State Honesty

User-visible text must avoid developer framing. Preferred wording:

- "Local data store" instead of "PostgreSQL cluster" on clerk surfaces
- "Local AI model" instead of "Ollama runtime" on clerk surfaces
- "Needs setup" instead of "missing environment variable"
- "Draft" or "internal" instead of implied official status
- "Sample data" only when data is actually sample

Forbidden release-facing behavior:

- Calling a workflow live when it is a handoff stub
- Calling an answer official when citations are missing
- Calling a module installed when its health check is not passing
- Calling the suite city-ready, procurement-ready, production-ready, or
  full-suite ready without the matching release gate

## Accessibility And Density

The desktop shell follows the canonical prototype tokens and shared shell
inventory:

- One visible page title per page
- Keyboard access to every navigation and action control
- Visible focus
- Error states with fix paths
- Empty states with next action
- Status never conveyed by color alone
- Citations visible without hover-only affordances
- Desktop-first layout that still degrades cleanly to narrow windows

## Acceptance

The Windows desktop UX is acceptable only when a non-technical clerk can:

- Install from a clean Windows machine
- Understand the unsigned beta and SmartScreen warning
- Create a city profile and first admin user
- Download and verify the model
- Create a meeting, notice, minutes draft, vote/action record, and archive item
- Intake, search, review, and export a records request
- Import/search code and create a clerk handoff
- Use cross-module search with citations
- Read system health without technical vocabulary
- Back up, restore, repair, close, reboot, reopen, and uninstall

If any step requires architecture knowledge, the UX has failed.
