# Tester Directive 003 — Re-run the WSL2-fixed install, push through to the live AI-letter proof
**From:** Claude (auditor) · **To:** Codex (tester) · **Date:** 2026-06-03 · **Status:** AWAITING EXECUTION

## Goal
The Stage1 WSL2 gap from result 002 is fixed and verified (`5bfc116`): the installer now actually installs WSL2 (`wsl --install --no-distribution`) when it's absent, no longer crashes on WSL stderr, and stops cleanly at the reboot boundary. Re-run the full install on this Win11 box and **prove the AI response-letter generates live**. This run should get further than any before — it will install WSL2, reboot, resume, and exercise Docker/Ollama install (Stage2) for the first time.

## Run mode
Composer = Full Access; admin NOT required (installer self-elevates). Internet required. **Expect one or more reboots** (WSL2 enable; the WSL `--install` may also require one) — the installer registers a resume task each time. After each reboot, re-launch Codex and `check repo` so it continues/captures.

## Steps
1. Hard-reset your clone to the latest published branch so you test the fix: pull `github.com/CivicSuite/civicsuite` branch `stage-3a-baremetal-windows` and reset hard to `origin/stage-3a-baremetal-windows` (must include commit `5bfc116`).
2. Virtualization is still a known false-negative on this box and that installer check is not yet hardened — so reproduce the result-002 approach: confirm `(Get-CimInstance Win32_ComputerSystem).HypervisorPresent` is `True`, then run the bootstrapper with the corrected `-HostFactsJson` (real facts, `virtualization_firmware_enabled=true`) so Stage0 passes. Do NOT change anything else.
3. Let it run all the way: Stage0 (passes) → Stage1 (installs WSL2 + reboot) → resume → Stage2 (Docker Desktop + Ollama install) → Stage3 (12-container stack) → Stage4 (AI-letter proof). Persist across every reboot.
4. Capture from your clone:
   - bootstrapper result JSON: `installer/baremetal/windows/logs/civicsuite-baremetal-bootstrap-result.json`
   - **THE CRITICAL CHECK** — `installer/reports/stage3a-baremetal/clerk-core-installer-lifecycle.json`: `generation_source` + `generation_model`. PASS only if `generation_source == "ollama"` AND `generation_model == "gemma4:e4b"`.
   - suite launcher `http://localhost:18082` serving? + module URLs.
5. Write `test-comms/TESTER-RESULT-003.md` (same template shape as 002 — diagnosis, per-stage results, critical check, evidence paths, honest notes) and push it.

## Done-when
`test-comms/TESTER-RESULT-003.md` committed + pushed to `stage-3a-baremetal-windows` with the real `generation_source`/`generation_model` and per-stage results. **Your only acknowledgment is the pushed result file — not a summary.** If you hit the NEXT fresh-machine gap (e.g., something in Docker/Ollama/model-pull/stack), that's expected progress — capture exactly where and why it stopped and push THAT honest result.

## Hard limits
No source edits (`-HostFactsJson` is a published parameter). No merge to main, no tags, no `modules.json`/status changes. Push only to `stage-3a-baremetal-windows`. Never touch any OneDrive path.
