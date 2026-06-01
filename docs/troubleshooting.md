# CivicSuite Troubleshooting

**Last verified:** 2026-06-01

This guide covers the umbrella city-core installer and documentation truth path. Module-specific bugs still belong in the relevant module repo.

## City-Core Installer Will Not Start

1. Confirm Docker is installed and running.
2. On Windows, confirm WSL 2 and Virtual Machine Platform are enabled, then start Docker Desktop.
3. On Linux, use Guided Setup only on supported distributions; it installs Docker Engine from Docker's signed package repositories. If Guided Setup says the host is unsupported, install Docker manually from Docker's official instructions and rerun with Manual Prerequisite.
4. Rerun the package readiness command before install:
   - Windows: `.\start-civicsuite-installer.ps1 -Readiness`
   - Linux: `bash ./start-civicsuite-installer.sh readiness`

If readiness still fails, keep the generated report and compare it with the active run evidence path in [STATUS.md](../STATUS.md).

## Records AI Response Letter Proof Fails

The city-core workflow proof now requires Records AI to draft the response letter with the configured local model. The proof checks `generation_source=ollama` and `generation_model=gemma4:e4b`. A template fallback is useful for staff continuity, but it does not satisfy the city-core live gate.

If this check fails:

1. Confirm Docker Desktop / WSL2 exposes enough memory for Ollama to load `gemma4:e4b`. The readiness floor is 12 GB RAM, and the practical evaluation target is 32 GB RAM.
2. Check the Ollama container logs for model-load errors.
3. Rerun repair or verify after increasing memory.
4. Do not switch to a smaller model unless `installer/modules.json`, README, USER-MANUAL, and the package READMEs all name that model.

A slow Ollama prewarm is a warning because the first AI request may still succeed after the model finishes loading. A non-zero model-load failure is a failed install/verify condition.

## Suite Launcher Port 18082 Is Busy

The suite launcher is served on `http://127.0.0.1:18082/`.

On Windows:

```powershell
netstat -ano | findstr :18082
```

Find the PID in the last column, then stop the owning process from Task Manager or an elevated PowerShell prompt. On Linux/macOS, use `lsof -i :18082` or `ss -ltnp '( sport = :18082 )'` and stop the conflicting process.

After freeing the port, rerun verify. The installer report points at `installer/reports/<run-id>/launcher-output/*.log`; inspect that log when the launcher probe fails.

## Existing Install Root Verify Refuses To Pass

`--verify-existing-install-root` is intentionally tied to a provenance file. The installed root must contain `civicsuite-install-provenance.json` with the current manifest hash and module source commits. If the file is absent or mismatched, rerun install or repair from the current package before verifying the existing stack.

## Suite Launcher Shows No Module Activity

The suite launcher is a local browser front door for the installed city-core services. It can show staff, resident, and IT-admin views, but its current shared session is browser/runtime state only.

1. Run the installer verify command.
2. Confirm Docker containers are running.
3. Refresh the launcher.
4. If module links are wrong, check whether `window.CIVICSUITE_LAUNCHER_CONFIG` was provided by the runtime wrapper.

This is not a municipal SSO proof. Do not treat launcher session state as completed shared identity federation.

## Artifact Hash Or Attestation Does Not Match

Use the live trust path:

1. Verify the generated `SHA256SUMS` or release manifest that belongs to the package you are running.
2. Confirm the package came from the official CivicSuite source or the recorded active run evidence path.
3. Confirm `installer/modules.json` `source_commit` values match the vendored source commits for CivicCore, CivicRecords AI, CivicClerk, and CivicCode.
4. For CivicCode module release assets, compare the published SHA256 and attestation bundle recorded in module release evidence.

Do not restore old committed `installer/dist` artifacts unless Scott explicitly confirms that restoration decision in bridge/for-scott or a durable run note.

## The One-Click Wrapper Says The Package Is Unsigned

That warning is expected for the current city-core beta package. Continue only after the hash/trust checks above pass. If an OS warning blocks execution, ask IT to review the package source and hash before allowing it.

## CivicAccess Appears In A City-Core Path

CivicAccess is out of city-core after the 2026-05-23 NEEDS-WORK depth probe. If a doc, launcher label, installer plan, or status surface frames CivicAccess as part of the current city-core path, treat it as drift and file it against the umbrella repo truth docs.

## Where To Check Current Truth

- Plain-English status: [../STATUS.md](../STATUS.md)
- Operator FAQ: [../FAQ.md](../FAQ.md)
- User manual: [../USER-MANUAL.md](../USER-MANUAL.md)
- Recovery status: [release-recovery-status.md](release-recovery-status.md)
- Downstream pins and source commits: [release-lockstep/downstream-pins.md](release-lockstep/downstream-pins.md)
