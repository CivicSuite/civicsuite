# Phase D dress-rehearsal run notes (live, appended as the run progresses)

**Run:** 2026-07-02, Windows Sandbox on DESKTOP-VBMA6O5 (20 GB RAM, Default networking).
**MSI:** `CivicSuite_1.0.2_x64_en-US.msi` from PR #220 CI run 28565687506 (commit `a94075d`),
SHA-256 `633a16abd2860b279442c99e31b2bd4446f2ba2377512c863f6814157d30f679` — **verified against
`CivicSuite-msi-evidence.txt` before install** (exact match).
**Framing:** dress rehearsal against the PR-CI artifact. PR #220 is gate-clean (2 GauntletGate
rounds, 0 code findings) and fully CI-green, but its merge to main awaits Scott's click; the
release-grade Phase D run re-verifies against the main-built MSI per the release-cut helper.
**Automation:** app driven via Playwright-over-CDP from the host (WebView2 remote debugging
enabled by the sandbox setup, port-proxied 9223→9222); OS-level tasks via a host↔sandbox
command channel in the shared staging folder. No manual GUI interaction.

## Step log

- **Install (Step 0-3):** msiexec `/quiet` exit **0**; app launched (`INSTALL_OK_LAUNCHED`).
  Log: `install-log.txt`.
- **Unsigned-beta notice step:** present, first step, requires explicit "Review and continue" —
  screenshot `step-unsigned-notice.png`. SmartScreen-explanation step follows — `step-smartscreen.png`.
- **Locations step:** completed via "Create local folders" (defaults under the sandbox user profile).
- **Module selection:** city-core profile preselected; **all six modules** including CivicAccess —
  screenshot `step-modules.png`. Continued with "Use City Core Modules".
- **City profile / First admin:** saved (test values; passcode ≥10 chars enforced by the wizard).
- **Admin sign-in gate (observed working):** after the admin exists, further setup actions
  (backup, model) refuse with "Sign in as the local administrator..." until a real sign-in.
  Signed in via the Local access panel; backup step then completed ("Create backup folder").
- **Model download step reached** with a signed-in admin; consent-gated button present.

## Observations (recorded honestly)

1. **App-spawned curl fails DNS inside Windows Sandbox (exit 6) while system curl succeeds.**
   The wizard's "Download / Resume Model" invokes `%SystemRoot%\System32\curl.exe -L --fail
   --retry 3 --retry-all-errors --output <part> <resolve_url>` from the desktop app process; in
   this sandbox it exits 6 ("could not resolve host") on every attempt, while the *identical
   fetch* run via PowerShell in the same sandbox session succeeds end to end (302 → us.aws.cdn.hf.co
   → 200, content-length exactly 6,975,877,728; see `results/05-resolve-url.out`). This code path
   is unchanged from v1.0.1 (which passed QA-B1 in a sandbox on this machine), so this is recorded
   as an environment observation of this run, not a v1.0.2 regression; the release-grade Phase D
   run should retest it. Mitigation used: the **documented pre-staged-model path** (USER-MANUAL
   Part 1.5: "unless IT has already staged the model file") — the pinned artifact is downloaded to
   the app's expected `.gguf.part` path by the operator channel, and the wizard's own
   Download/Resume action then performs the app's full finalize chain: size check → streamed
   SHA-256 verification against the pinned checksum → rename → local model registry entry. The
   app's own integrity verification is NOT bypassed.
2. **Native folder-picker dialogs block Tauri IPC.** Clicking "Choose Folder" (native dialog)
   while automating means later `invoke()` calls queue until the dialog closes; automation must
   use the text fields + primary actions only. Not a user-facing defect (a human closes the
   dialog); noted for future automated runs.

## PHASE D PRIMARY FINDING (2026-07-02) — real-model AI output was garbage; root-caused and fixed

**The dress rehearsal succeeded at its core purpose: it caught a real defect the fake-seam
GauntletGate rounds structurally could not.**

**What was verified working (the plumbing):** with the real pinned Gemma model downloaded
(SHA-verified), imported into the bundled Ollama, and loaded (all 6 readiness checks green,
model status "Ready"), all three CivicAccess AI features executed end to end through the real
Tauri bridge: `invoke("city_work_action", ...)` → `generate_local_text` → Ollama on 15434 →
labeled result. Labels, model-name attribution, human-review next-steps, status, audit framing,
and per-call timing were all correct — exactly as the gate verified.

**The defect (Blocker-class for AI usefulness):** the actual generated TEXT was unusable —
the plain-language rewrite and the German translation just echoed the input with a stray
`<|channel>thought` control marker, and the review analysis was digit-spam
(`012345...`). A clerk would receive garbage labeled as an "AI draft."

**Root cause (definitively isolated live):** `model.rs::generate_local_text` posted to
`/api/generate` with `raw: true` and a hand-built `<start_of_turn>` Gemma turn-format prompt.
The pinned model loads in this Ollama (0.30.10) with `RENDERER gemma4` / `PARSER gemma4`
(`ollama show` confirmed). `raw: true` BYPASSES that renderer/parser, so the model's internal
control tokens leak and generation degenerates. Same model, same runtime, side-by-side:
- `/api/chat` (template + parser applied), prompt "Say the single word: hello" → **"hello"**
  (clean, `done_reason: stop`, eval_count 2).
- `raw: true`, prompt "hello" → **"1??1017183164...222..."** (garbage).
- `/api/chat` on the three REAL civicaccess prompts → a genuine plain-language rewrite
  ("Residents must pay before the deadline. According to the ordinance, service will start
  after approval."), a correct German translation ("Die Stadtwasserwerke werden am
  Dienstagmorgen eine Wasserleitung reparieren..."), and a useful structured remediation
  analysis. Captures: `results/A0-diagnose-model.out`, `A1-test-chat.out`, `A2-deep-diag.out`,
  `A3-verify-fix.out`; before-fix live output: `evidence/ai-live-results.json`.

**The fix (this run):** switch `generate_local_text` from `/api/generate` + `raw:true` +
manual turn markers + stop tokens to `/api/chat` with a single user message and `think:false`,
letting Ollama apply the model's own template + gemma4 parser. This is a SHARED-helper fix, so
it repairs all four AI features suite-wide (CivicClerk minutes, CivicRecords response,
CivicCode guidance, and the three CivicAccess features), not just CivicAccess. The response
parser already read `message.content`, so no parser change was needed. Unit test updated to
assert the chat shape; static-smoke pin flipped `/api/generate` → `/api/chat`. 181/181 cargo,
static-smoke + xss PASS, fmt clean. End-to-end real-model re-verification of the CODE change
(vs the API-level proof above) belongs to the release-grade Phase D run against a rebuilt MSI.

**Why the gate missed it (and why that's OK):** GauntletGate rounds ran against the
`CIVICSUITE_FAKE_MODEL_RESPONSE` seam, which returns canned text — they proved the pipeline,
labels, fallback, gating, and audit (all correct), but by construction could never test real
generation QUALITY. That is precisely the gap Phase D (real model, no stub) exists to close.

**Secondary observations (non-blocking, recorded):**
- num_predict=192 truncates the longer review analysis (`done=length`) — the documented R3
  ceiling; output is a human-reviewed draft; left as designed.
- Runtime services postgres(15432)/python-services(15480) did not auto-start in this rehearsal's
  first-run health step (only ollama/15434 came up), so the wizard's final health gate did not
  clear and the AI features were exercised via the real bridge directly rather than through the
  post-wizard tab. postgres+python are separately proven on this exact build by the PR's own CI
  `desktop<->CivicCore real-runtime integration test` (real postgres+pgvector+python+worker) and
  the MSI-lifecycle job — both green on PR #220. To retest in the release-grade run.
