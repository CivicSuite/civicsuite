# Deferred installer-hardening cleanup pass — 2026-06-05

Disposition of the four deferred items after the city-core release-blocker closed.

## (1) Virtualization-gate false-negative — FIXED (installer lane)
**Was:** Stage0's `hardware-virtualization` check used only `Win32_Processor.VirtualizationFirmwareEnabled`,
which is a documented false-negative once a hypervisor (Hyper-V / WSL2 VM Platform) is already running — so
a real, capable city machine would be falsely rejected. The tester only got past it by hand-feeding a corrected
`-HostFactsJson` (`virtualization_firmware_enabled=true`) every run.

**Fix (`installer/baremetal/windows/civicsuite-baremetal-bootstrap.ps1`):** `Get-HostFacts` now also captures
`hypervisor_present = [bool](Get-CimInstance Win32_ComputerSystem).HypervisorPresent`, and Stage0 passes the
gate when `virtualization_firmware_enabled OR hypervisor_present`. The check message/action updated to say a
running hypervisor satisfies the requirement. Tests added (`tests/test_windows_baremetal_bootstrap.py`):
firmware-false + hypervisor-present → PASS; both absent → still FAIL. Full suite 41 passed. The tester no longer
needs to inject corrected host facts.

## (3) Readiness disk gate 60GB → 25GB — ALREADY DONE (verified)
`scripts/plan-installer.py` already uses `MIN_FREE_DISK_GB = 25` (and the cleanroom uses a 25GB floor with
existing tests `test_cleanroom_disk_floor_is_25_gb`). No 60GB disk gate remains anywhere in source (the only
"60/64" hits are generated bundle artifacts and a RAM doc string). The original finding was fixed in a prior
cycle; closing it.

## (4) Default Ollama model consistency — installer lane consistent (verified)
The installer lane is uniformly `DEFAULT_LLM_MODEL = "gemma4:e4b"` (`run-clerk-core-installer.py`,
`plan-installer.py`; `CIVICCODE_OLLAMA_MODEL` is set from it; records config defaults to `gemma4:e4b`). No stray
model names in the installer. **Module-lane nit (Codex):** CivicClerk's minutes-AI feature references
`ollama/gemma4` (milestone-7), which is a per-request model string internal to the clerk module, not installer-set.
Align it to `gemma4:e4b` in the clerk repo for cross-module consistency when convenient — does not affect the
installer (clerk runs no Ollama in the installed topology).

## (2) Container secret-mount staleness — MODULE LANE (Codex), not a clean installer fix
**Symptom (RESULT-014):** post-startup, the records-api container showed its file-based Docker secrets
(`/run/secrets/first_admin_password`, `jwt_secret`) as inaccessible stat entries (`-?????????`). Config read
them fine at startup, so this is a Windows-host → WSL2 → container file-share staleness of the bind-mounted
secret files, NOT a permission denial and NOT gate-blocking (the running api/worker cache `settings` from
startup; the installer's verifier reads the host file directly). The risk is a container **restart** failing
config reload.

**Why not an installer fix:** the installer writes the secret files + the module compose mounts them as Docker
file-secrets; the staleness is Docker Desktop file-share behavior, not installer logic. The `chmod 0o400` is
not the cause (`-?????????` is a stat failure, not a perm map), and changing it can't be verified to fix the
share staleness without reproducing on the tester box — so it would be a guess.

**Proper fix (module-lane, Codex):** make the module config resilient to file-secret re-reads — e.g. read the
secret once at startup and tolerate a transient stat failure on reload, or deliver the secret via env/tmpfs so
there is no live Windows-file-share dependency for `/run/secrets`. Applies to CivicRecords AI (and any module
using file-based secrets). Lower severity (restart-resilience edge case).
