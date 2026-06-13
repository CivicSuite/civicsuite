# ADR-0010: Future Modules Install Through A Strict Module Package Contract

Status: accepted
Date: 2026-06-13

## Context

CivicSuite is moving from bounded installer profiles toward a Windows desktop
application that can install the city-core package now and later add the rest of
the 27 product modules one at a time. The existing `installer/modules.json`
already tracks profiles, module dependencies, CivicCore requirements, proof
requirements, ports, and disabled states. That shape is useful, but it is not
yet explicit enough to keep future modules from becoming one-off installer work.

The Windows Local 1.0 promise requires a clerk-facing module selector and module
manager. A future completed module should be added to the existing app through
metadata, package artifacts, migrations, routes, services, health checks, and
proof gates. It should not require redesigning the installer or desktop shell.

## Decision

CivicSuite will use `installer/modules.json` as the suite-level module registry
and enforce a versioned module package contract for all future modules.

CivicCore is always installed, required, and cannot be deselected. Product
modules may be installed, disabled, updated, repaired, backed up, exported, or
uninstalled only through the module contract and the desktop module manager.

Each module registry entry must declare:

- Module identity: `id`, `display_name`, `repo`, `tier`, `role`
- Selection model: `selectable`, `required`, disabled state when applicable
- Compatibility: `civiccore_requirement`, `dependencies`, `current_version`
- Runtime allocation: local service identifiers, default port when applicable,
  process/service ownership, health checks
- Installer behavior: artifact source, source commit or published artifact
  proof, install/update/repair/uninstall hooks
- Data behavior: migrations, backup hooks, restore hooks, export/preserve-data
  behavior for uninstall
- Security and UX behavior: permissions, routes, surface placement, audit event
  names, public/staff/admin visibility
- Model behavior: local model needs, context window/budget needs, refusal
  behavior when the model is absent
- Proof requirements: install, health, restart, repair, backup, restore,
  release artifacts, clean-machine proof, and module-specific workflow proof

The current slice enforces the registry-level subset that already exists in
`installer/modules.json` and documents the expanded contract required for the
Tauri/WebView2 desktop implementation.

## Consequences

- The installer and desktop app can show profiles and custom module selection
  from the same registry.
- Disabled and planned modules can stay visible as honest not-ready entries
  without pretending they are installable.
- A future module reaches the app by satisfying the contract, not by editing
  bespoke installer code.
- Every module carries its own install, health, backup, restore, and uninstall
  obligations before it can be promoted as installable.
- Module uninstall cannot silently destroy city data. The UX must offer preserve
  or export behavior before destructive removal.

## Non-Goals

- This ADR does not make all future modules installable today.
- This ADR does not require dynamic code loading from untrusted packages.
- This ADR does not bypass per-module release gates, clean-machine proof, or
  CivicCore compatibility checks.
- This ADR does not make Docker or WSL part of the Windows end-user path.

## Verification

The module contract is checked by `scripts/verify-module-manifest-contract.py`.
The test suite covers the current registry, city-core profile requirements,
planned-module non-selectability, and failure cases for promoted modules missing
version/source proof.
