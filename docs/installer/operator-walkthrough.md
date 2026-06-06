# City-Core Operator Walkthrough

This walkthrough is for a city operator installing the city-core package on a workstation with Docker available.

## What This Installs

The city-core package installs:
- CivicCore `1.2.0`
- CivicRecords AI `1.7.3`
- CivicClerk `1.0.3`
- CivicCode `1.0.8`

CivicAccess is not included in this package.

Stage 3A also includes a separate `proven-suite` local integration profile for
city-core plus CivicZone, CivicPlan, CivicPermit, CivicAccess, CivicInspect,
CivicGrants, and CivicProcure. That profile is for local and clean-machine
re-gating only. It is not a public-use, procurement-ready, production, or
full-suite release.

## Before You Start

Have these ready:
- Docker Desktop on Windows or macOS, or Docker Engine on Linux
- At least 24 GB host RAM and 25 GB free disk for the `gemma4:e4b` local AI path
- On Windows, Docker Desktop / WSL2 configured with at least 12 GB memory
- On Windows, WSL2 enabled for Docker Desktop
- A local browser

The installer checks these prerequisites before it starts. If something is missing, it prints a plain-English fix, such as starting Docker Desktop, freeing a port, or installing WSL2.

## Install

1. Download the package for your operating system:
   - Windows: `CivicSuite-city-core-windows-0.1.0.zip`
   - Linux: `CivicSuite-city-core-linux-0.1.2.tar.gz`
   - macOS: `CivicSuite-city-core-macos-0.1.0.tar.gz`

2. Extract the archive into a folder you control, such as `C:\CivicSuite` or `~/CivicSuite`.

3. Open the extracted folder.

4. Start the guided installer:
   - Windows: double-click `start-civicsuite-installer.ps1`
   - Linux/macOS: run `./start-civicsuite-installer.sh`

5. Choose the install option. The package is preconfigured for the `city-core` profile, so no manual module selection is required.

6. Wait for the installer to complete the readiness check, build/start services, and run health checks.

For the city-core profile, CivicRecords AI is configured in public portal mode by default. Residents can submit records requests at `/public/requests` after install without the operator editing configuration files. Smaller profiles may keep a private records portal unless their installer explicitly changes that setting.

7. Open the service URLs printed by the installer.

## Verify The Install

After install, run the verify option from the same launcher menu. It checks:
- CivicRecords AI health and admin web shell
- CivicRecords AI public portal mode and public request route mount
- CivicClerk health and public/staff web shell
- CivicCode health and public code search
- In the `proven-suite` profile only: CivicZone health; CivicPlan, CivicPermit,
  CivicAccess, CivicInspect, CivicGrants, and CivicProcure health plus bounded
  readiness blocker responses when their local municipal databases are not
  configured
- CivicCore version contract for all selected modules

## Smoke Test

Run the workflow proof option from the launcher menu. It exercises:
- CivicRecords AI request, search, review, and response draft workflow
- CivicClerk agenda intake, packet, minutes, notice, vote, and archive workflow
- CivicCode public search and staff-header boundary check

The smoke test should finish with all workflows marked passed.

## Upgrade From Clerk-Core

If clerk-core is already installed, rerun the city-core installer over the same install root. The installer records the selected module set and adds CivicCode without replacing existing CivicRecords AI or CivicClerk data. The 2026-05-23 local upgrade rehearsal proved this path with:
- Clerk-core install
- City-core rerun with CivicCode added
- Backup
- Restore probe
- Uninstall

Evidence is in `docs/installer/evidence/2026-05-23-city-core/`.

## Backup And Restore

Use the backup option before major changes. The backup writes a manifest and PostgreSQL custom dumps for each selected module.

Use the restore option to validate a backup or recover a stack. The restore probe creates temporary restore databases and runs `pg_restore` for each module dump before cleaning up the probe databases.

## Rollback

The launcher menu includes an uninstall/reset path. Use it when:
- A local rehearsal should be removed
- A partial install needs to be cleaned before retrying
- You want to reset a test workstation

The uninstall path stops and removes the selected module containers, networks, and volumes. The reset/remove-files option also removes the install root after verifying it is inside the installer runtime directory.

## Troubleshooting

If Docker is not running:
- Start Docker Desktop or Docker Engine.
- Wait until Docker reports it is running.
- Rerun the installer readiness check.

If a port is occupied:
- Close the application using the port, or rerun with a port offset from the advanced launcher options.

If memory or disk is low:
- Use a host with at least 24 GB RAM for `gemma4:e4b`, configure Docker Desktop
  / WSL2 with at least 12 GB memory on Windows, or free disk space.
- Rerun readiness before install.

If Windows reports missing WSL2:
- Install or enable WSL2.
- Restart Docker Desktop.
- Rerun readiness.

If macOS prerequisites are missing:
- Install Docker Desktop for macOS.
- Start Docker Desktop.
- Rerun readiness.

macOS is beta for this package. The macOS archive is generated and readiness-checked, but this PR does not claim macOS matching-host lifecycle certification.
