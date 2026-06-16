# TESTER-RESULT-081

Verdict: FAIL

Branch tested: `stage-3a-baremetal-windows`

Directive commit tested: `71d3252b59d7f2ce887a3bd15f184ffcf5fd86af`

MSI PR head tested: `ab1abf4cdb1da97e81d31ab9b955d75aa6d70715`

Directive read: `test-comms/README.md`, `TESTER-DIRECTIVE-081.md`, `TESTER-RESULT-080.md`, `TESTER-DIRECTIVE-080.md`, `TESTER-RESULT-079.md`, and `TESTER-DIRECTIVE-067.md`.

## Artifact and install

- Downloaded MSI: `CivicSuite_0.1.0_x64_en-US.msi`
- Expected MSI SHA-256: `394f05354418453857faa8ceb33cd5eee5d95fbd84007643e37d888edcccc898`
- Actual MSI SHA-256: `394f05354418453857faa8ceb33cd5eee5d95fbd84007643e37d888edcccc898`
- Expected MSI bytes: `1639845111`
- Actual MSI bytes: `1639845111`
- Evidence SHA-256 verified: `d3b842d3d135245c4d3625d69cb45af7120da035a408a0b3dcd50b61ee28fcf5`
- Evidence bytes verified: `548`
- Install command path: elevated silent MSI upgrade with `/qn /norestart /L*v`
- MSI exit code: `0`
- Previous product code: `{282C3257-34EC-42F7-8AC8-B2899CE8A7E6}`
- New product code: `{0639287B-3D1C-4BAB-B2AA-E79DEC08B0AE}`
- Installed executable: `C:\Program Files\CivicSuite\civicsuite-desktop.exe`

## Runtime and model

PASS for basic launch/runtime readiness after install and after close/reopen.

- Health endpoint reported `status: ok`.
- Modules loaded: `civiccore 1.2.0`, `civicrecords-ai`, `civicclerk 1.0.4`, `civiccode 1.0.8`.
- Local model tag present: `civicsuite-gemma4-12b-qat:q4_0`.
- CivicSuite-managed runtime processes were present under `C:\Users\insty\AppData\Local\CivicSuite\runtime`.
- A separate user-global Ollama process was also present; I did not remove it.

## Guided review panels

PASS/PARTIAL. The new build does show review panels near the top, but the confirm buttons are named action-specifically rather than exactly `Confirm`. Examples observed:

- `Review Before Saving Meeting Body` / `Confirm Save Meeting Body`
- `Review Before Backing Up Local Profile` / `Confirm Backup Now`
- `Review Before Creating Support Bundle` / `Confirm Create Support Bundle`
- `Review Before Restoring Latest Backup` / `Confirm Restore Latest Backup`
- `Review Before Preparing Uninstall` / `Confirm Prepare Uninstall`

After using the visible `Confirm ...` buttons, some Clerk data persisted.

## Local users and RBAC

PASS/PARTIAL.

- Created/signed in as staff user `Clerk Staff DIR081C-202606161942`.
- Staff session showed `LOCAL ACCESS` and `Signed in as Clerk Staff DIR081C-202606161942`.
- Staff was blocked from admin settings with the message requiring a local administrator for setup, users, modules, backups, restore, repair, and runtime services.
- Unsigned/admin-gated System Health displayed local-admin-required messaging.

## Clerk workflows

FAIL for full workflow completion.

Confirmed/persisted after close and reopen:

- Meeting body count: `1`
- Meeting member count: `1`
- Meeting count: `1`
- Agenda intake count: `4`
- Audit count: `26`
- Test records included `Council DIR081C-202606161942`, `Member D DIR081D-202606161942`, `Regular Meeting DIR081D-202606161942`, `Budget amendment item one`, and `Budget amendment item two`.

Not completed/persisted:

- Adopted legislation count remained `0`.
- Publication count remained `0`.
- The full Clerk chain through adoption/publication/archive was not proven durable.

## Records, resident/public, search, and handoffs

FAIL.

- Records requests were created and persisted with count `3`, but the full request lifecycle was not proven durable.
- Later records actions did not persist as a complete search/draft/approval/release/export/fulfillment/close workflow.
- Resident/public intake was not proven end-to-end.
- Search found some Clerk/Records data, but cross-module Code/handoff coverage was not proven.
- Code handoff count remained `0`.

## Code workflows

FAIL.

After confirmed UI attempts and close/reopen:

- Code source count remained `0`.
- Code handoff count remained `0`.
- Adopted legislation count remained `0`.

This fails the directive's required Code, ordinance, adopted-legislation, and cross-module handoff coverage.

## Backup, restore, support, repair, uninstall/reinstall

FAIL/PARTIAL.

- Backup review and confirm were visible and clicked.
- A fresh backup directory was created at `C:\Users\insty\Documents\CivicSuite Backups\civicsuite-manual-backup-1781639161-32116`.
- Backup contained config, logs, model data, and `Data\workflows\city-work.json`.
- No explicit backup manifest file was found in that backup directory listing.
- Restore review and confirm were visible and clicked, but restore durability was only partially proven because the product already failed required workflow coverage.
- Support bundle review and confirm were visible and clicked, but no fresh support bundle directory appeared; the newest support bundle remained the earlier `civicsuite-support-bundle-1781626914-20632`.
- Repair button returned to the health view without a confirmed durable repair result.
- Prepare uninstall review and confirm were visible and clicked.
- I did not complete final uninstall/reinstall/restore because the product had already failed required workflow persistence and support-bundle artifact validation.

## Close/reopen persistence

PASS/PARTIAL.

After closing and reopening the app:

- Health remained `ok`.
- Model tag remained present.
- Workflow counts remained: meeting bodies `1`, meeting members `1`, meetings `1`, agenda intakes `4`, records `3`, code sources `0`, code handoffs `0`, adopted legislation `0`, audits `26`, publications `0`.

## Final failure reasons

The build is not acceptable for directive 081 because:

1. Code/ordinance workflows did not persist any code sources, handoffs, or adopted legislation.
2. Records workflow did not complete and persist the full required lifecycle.
3. Clerk workflow persisted some confirmed data but did not prove adopted legislation/publication/archive completion.
4. Support bundle creation was confirmed in the UI but did not produce a fresh support bundle artifact.
5. Backup/restore lifecycle was only partially proven and lacked an obvious backup manifest.

Windows was not rebooted or restarted during this test.
