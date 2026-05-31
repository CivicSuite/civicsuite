# UI/UX Deep Dive - Stage 1 Live Gate Policy Harness

## Scope

Reviewed user-facing and operator-facing impact of Stage 1. The stage changes process, hooks, policy scripts, and CI configuration. It does not alter browser UI, installer UI, or product screens.

## Findings

No open findings.

## What Works

- The developer/operator workflow is clearer: every stage has a visible ledger and every slice names its audit-lite evidence.
- Error messages in `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\hooks\pre-push.ps1` are plain-language and name the missing artifact.
- The process doc tells a future operator exactly where to resume after reboot or checkout loss: the last pushed branch head and tracked stage ledger.

## UX Non-Applicability

No product UI files changed. No browser QA is required for Stage 1 because the scope is release-process durability, not a visible municipal operator surface.

## Verification

- Reviewed the staged docs and hook messages.
- Confirmed no frontend application files changed.
- Confirmed Stage 1 does not claim product readiness, public use, or installability.

## Residual Risk

Stage 1 improves the agent/developer experience, not the municipal operator experience. Product UX work resumes in later stages.

## Workflow UX Review

Although Stage 1 does not touch CivicSuite's municipal operator UI, it does change an important human workflow: how an agent or developer knows whether it is safe to move to the next slice. That workflow now has visible wayfinding:

- the current stage has one ledger path;
- every slice has a named status;
- every changed file is listed with a full drive path;
- every audit-lite report is listed before push;
- every push is expected to pass the local hook.

This matters because the user experience that failed was not just a browser screen. It was the release operator experience of trusting local progress that had not been preserved. The Stage 1 ledger creates a single scan point for "what happened, where is it, and did it reach GitHub?"

The hook copy is appropriately direct. It says what is missing and where it expected to find it. That is better than a generic policy failure because the person at the terminal can repair the ledger/report without spelunking through CI logs.

## Accessibility Applicability

No HTML, CSS, ARIA, keyboard behavior, or visual state changed. A WCAG pass would be irrelevant for this slice and would risk pretending product UI was exercised. The correct UX check here is terminal and process clarity:

- hook errors are plain language;
- ledger headings are scannable;
- stage closeout fields are explicit;
- no municipal operator claims are made.

## Copy Review

The docs avoid overclaiming. They say Stage 1 protects recovery and evidence workflow. They do not say CivicSuite is installable by a non-technical user, public-use ready, city-ready, procurement ready, production ready, macOS lifecycle certified, or full-suite released.

One copy choice is deliberate: "GitHub-first" rather than "local-first." The phrase tells the agent exactly what the process values now. It does not mean every temporary file must be committed; it means stage-critical facts need a durable repository copy before progress continues.

## UX Recommendation For Stage 2

Stage 2 should preserve this ledger style while reconstructing the live installer gate. The ledger should point to any screenshots, terminal outputs, and installer reports with full drive paths, but the stage should keep pushing source changes before large cleanroom runs accumulate local-only state.

## Human Factors Risk Check

The process still asks the agent to keep moving quickly. That is deliberate, but it raises a human-factors risk: a fast loop can hide state unless the system forces visible checkpoints. The Stage 1 pattern counters that by making each checkpoint a file path and a pushed commit rather than a chat promise.

For Scott, the stage ledger should answer three questions in under a minute:

- What slice are we on?
- What changed?
- Did the evidence reach GitHub?

The current ledger supports that scan. Future ledgers should preserve the same shape instead of becoming narrative handoffs. Narrative belongs in handoff reports; the ledger is a control surface.

## Terminal Copy Review

The hook messages avoid blame and tell the operator what artifact is missing. This matters because failed pushes can be stressful during release repair. The message "stage branches must carry a tracked stage ledger" is more actionable than "policy failed" and does not require the operator to know implementation details.
