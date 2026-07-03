# Phase D clean-VM acceptance — evidence kit (CivicSuite Windows Local v1.0.2)

**Release:** [`civicsuite-windows-local-v1.0.2`](https://github.com/CivicSuite/civicsuite/releases/tag/civicsuite-windows-local-v1.0.2)
**Gate:** [Phase D clean-VM accessibility DoD manifest](../../roadmap/civicaccess-citycore-integration/phase-D-cleanvm-accessibility-dod.manifest.yaml)
**Result:** **PASS** — across two full Windows Sandbox (clean-VM) runs plus a shipped-config AI verification.
**Environment:** Windows Sandbox on Windows 11 Pro — a factory-fresh Windows userland per run: no VC++ redistributable, no dev tooling, no prior CivicSuite state. The app was driven through its real UI over the WebView2 DevTools protocol (real clicks and keystrokes against the real Tauri bridge), not through test seams.

## What each folder proves

### `run1-acceptance/` — the acceptance run (MSI built from main `0b0170a`)

The full chain, end to end, on a clean machine: MSI install (exit 0) → the complete first-run
wizard (unsigned-beta notice, SmartScreen guidance, locations, six-module selection, city profile,
first admin, backup folder) → admin sign-in → model download/stage → the app's **own** streamed
SHA-256 verification of the 6.97 GB pinned Gemma model → all six model-readiness checks green →
model loaded and registered → **all three CivicAccess AI features producing clean, correctly-labeled
output through the real app bridge** (`ai-live-results.json`).

- `STATUS.txt` — the timestamped run log.
- `ai-live-results.json` — the three AI features' live outputs (plain-language rewrite, German translation variant, review analysis).
- `wizard-*.png`, `step-*.png`, `model-ready-health.png` — screenshots at the wizard steps and the all-green health screen.
- `24-check-runtime.out`, `30-diagnose-vcruntime.out` — **the blocker this run caught**: `initdb.exe`
  failed with *"VCRUNTIME140.dll was not found"* — the portable PostgreSQL links the MSVC runtime,
  which a factory-fresh Windows does not have (CI never sees this; hosted runners ship the
  redistributable). Root cause and fix shipped as [PR #221](https://github.com/CivicSuite/civicsuite/pull/221).

### `run2-vcruntime-fix/` — the fix proven (released MSI, main `0b797c4`)

A fresh clean sandbox against the **released** MSI: the three staged VC++ DLLs are present in
`postgres\bin`, `initdb.exe`/`pg_ctl.exe` load and run, and `initdb` creates a complete
PostgreSQL 17.10 cluster — with `System32\VCRUNTIME140.dll` still absent from the machine.

- `RUN-2-RESULT.md` — the run verdict and method.
- `03-verify-vcruntime-fix.out`, `04-full-postgres-bringup.out` — the probe outputs.

### `shipped-config-ai-verify/` — AI quality at the exact shipped generation config

The three CivicAccess prompts run at the shipped configuration (`/api/chat`, temperature 0.2,
`num_predict` 512, `num_ctx` 8192) against the pinned model: clean rewrite, correct German,
460-token structured review analysis, all `done_reason=stop` (nothing truncated), within timeout.
This verification ran at main `0b0170a`; the only delta to the released `0b797c4` is the
PR #221 VC++ bundling fix, which does not touch generation config.

- `00-provenance.json` — staging provenance for the dress-rehearsal MSI (`a94075d`) whose payload supplied the pinned model bits used in this verification (the pinned model is identical across builds).
- `host-shipped-config-ai-verify.out` — full transcript.

### `dress-rehearsal-a94075d/` — the pre-release run that caught the generation-format bug

The earlier full-sandbox dress rehearsal (PR-CI build `a94075d`) where real-model output was first
exercised — and came back as garbage. The diagnosis isolated it live: the pinned model loads with a
`gemma4` renderer/parser, and the then-current `/api/generate` + `raw:true` path bypassed it,
leaking control tokens. Switching the shared helper to `/api/chat` fixed generation for every AI
feature suite-wide (shipped in [PR #220](https://github.com/CivicSuite/civicsuite/pull/220)).

- `RUN-NOTES-dress-rehearsal.md` — the narrative.
- `A0`–`A3` `.out` — the live diagnosis and side-by-side fix verification.
- `B1-sampling-ab.out` — the temperature 0.2 vs 1.0 A/B that informed the shipped config.

## Reading order

1. `run1-acceptance/STATUS.txt` (the story), 2. `run1-acceptance/ai-live-results.json` (the AI
proof), 3. `run2-vcruntime-fix/RUN-2-RESULT.md` (the fix proof), 4. the release notes on the
[release page](https://github.com/CivicSuite/civicsuite/releases/tag/civicsuite-windows-local-v1.0.2)
for how these map to the published claims.

Sandbox-internal IP addresses appearing in logs (e.g. `172.28.x.x`) are Windows Sandbox NAT
addresses from VMs that no longer exist. First-admin credentials used in runs were throwaway test
values; no real credentials appear in this kit.
