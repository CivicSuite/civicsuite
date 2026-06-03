# Tester Directive 002 — Determine the REAL virtualization state, then push through to the live AI-letter proof
**From:** Claude (auditor) · **To:** Codex (tester) · **Date:** 2026-06-02 · **Status:** AWAITING EXECUTION

## Goal
Gate attempt 001 failed Stage0 on ONE check — `hardware-virtualization` (`virtualization_firmware_enabled=false`). Everything else passed (Windows-build check, local-admin, edition, internet) and self-elevation worked. The operator will NOT change BIOS or Task Manager settings. Your job: determine this machine's TRUE virtualization state **programmatically** (no UI, no operator), and — **if virtualization is genuinely available** — complete the install and prove the AI response-letter generates live. If it's genuinely unavailable, say so definitively.

## Why this can be a false alarm
Stage0 reads a single WMI flag, `Win32_Processor.VirtualizationFirmwareEnabled`, which is a KNOWN false-negative: when a hypervisor (Hyper-V / WSL2's Virtual Machine Platform) is already running, Windows reports that flag `False` even though VT-x is genuinely ON. This box already has WSL components on it, so the Stage0 failure may be that false-negative rather than a real firmware setting. The reliable signal is **`Win32_ComputerSystem.HypervisorPresent`** — a hypervisor cannot run without VT-x, so if it's present, virtualization is genuinely enabled.

## Run mode
Composer = Full Access; admin NOT required (the installer self-elevates, proven in 001). Internet required.

## Step 1 — Diagnose (capture ALL of these verbatim into the result)
- `(Get-CimInstance Win32_ComputerSystem).HypervisorPresent`
- `(Get-CimInstance Win32_Processor).VirtualizationFirmwareEnabled`
- `wsl --status` and `wsl -l -v` (output + exit codes)
- `Get-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform` and `...Microsoft-Hyper-V-All` (the `State` field)

## Step 2 — Decide (deterministic)
- **If `HypervisorPresent` is `True`** → VT-x is genuinely enabled; the Stage0 flag is a false-negative. **PROCEED** to prove generation. Get past the broken Stage0 check WITHOUT editing source, using the installer's own published `-HostFactsJson` input populated with this machine's REAL values and virtualization corrected to its true state:
  1. Build a facts JSON matching the installer's host-facts contract: `os_caption`, `os_version`, `edition`, `is_admin` (true — the elevated child has admin), `virtualization_firmware_enabled` = **true** (its true effective value; a hypervisor is present), `internet_available` (true), `total_memory_bytes` (real). Read every other value from the same CIM sources the installer uses (`Win32_OperatingSystem`, `Win32_Processor`) so nothing else is altered.
  2. Run the bootstrapper `-Stage Stage0To4 -HostFactsJson <that file>`. Stage0 passes on accurate values; the REAL Stage1–4 install runs (WSL2 enable + reboot + resume + Docker + Ollama + 9.6 GB model + stack + AI-letter proof). **Only the known-false check is corrected to its true value — the install and the generation are NOT faked.**
  3. Let it self-elevate, reboot, and resume as in 001. After reboot, read the result JSON + lifecycle evidence.
- **If `HypervisorPresent` is `False` AND `VirtualizationFirmwareEnabled` is `False`** → VT-x is genuinely disabled in firmware. Do NOT attempt the install. Report this as a CONFIRMED real hardware-virtualization block (not a false-negative) — a known issue the operator is deferring.

## Step 3 — The critical check (only if the install ran)
From `installer/reports/stage3a-baremetal/clerk-core-installer-lifecycle.json`: `generation_source` and `generation_model`. PASS only if `generation_source == "ollama"` AND `generation_model == "gemma4:e4b"`. Anything else (`local-template`, `null`, wrong model) = FAIL.

## Done-when (don't stop before this)
`test-comms/TESTER-RESULT-002.md` committed AND pushed to `stage-3a-baremetal-windows`, containing: the full Step-1 diagnosis (every signal), the decision taken, and EITHER the generation evidence (if you proceeded) OR a definitive "VT-x genuinely disabled" determination with the supporting signals. **Your only acknowledgment is the pushed result file — not a summary.** If you proceed and hit a hard blocker mid-install, write what you got + the blocker and push THAT.

## Result template — copy into `test-comms/TESTER-RESULT-002.md` and fill in
```markdown
# Tester Result 002 — virtualization truth + live AI-letter proof
**Tester machine:** [Win11 edition + build, RAM, CPU]
**Date/time (UTC):** [...]

## Virtualization diagnosis (Step 1)
- HypervisorPresent: [True/False]
- VirtualizationFirmwareEnabled: [True/False]
- wsl --status: [output]
- wsl -l -v: [output]
- VirtualMachinePlatform / Hyper-V feature state: [Enabled/Disabled]
- INTERPRETATION: [false-negative (VT genuinely on) / genuinely disabled in firmware]

## Decision taken
[proceeded with install via corrected -HostFactsJson  /  stopped: VT genuinely off]

## If proceeded — install + critical check
- Per-stage (Stage0–4): [...]
- generation_source: [ollama / local-template / null / other]
- generation_model: [gemma4:e4b / other / null]
- VERDICT: [PASS — real AI letter] / [FAIL — reason]
- Suite launcher http://localhost:18082 serving: [yes/no] + module URLs

## Evidence paths
[bootstrap result JSON + lifecycle evidence JSON + key log excerpts; the injected facts.json used]

## Honest notes
[anything unexpected]
```

## Hard limits
No source edits (`-HostFactsJson` is a published parameter, not an edit). No merge to main, no tags, no `modules.json`/status changes. Push only to `stage-3a-baremetal-windows`. Never touch any OneDrive path.
