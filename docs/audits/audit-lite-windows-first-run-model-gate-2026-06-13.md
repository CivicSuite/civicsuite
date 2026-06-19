# Audit Lite: Windows First-Run Model Gate Slice

Date: 2026-06-13
Scope: `desktop/` first-run model step, local model artifact verification gate, and shared test-state isolation.

## Verdict

PASS.

Unresolved findings: 0 Blocker / 0 Critical / 0 Major / 0 Minor / 0 Nit.

## Slice Summary

- First-run no longer treats `download-model` as an unimplemented placeholder.
- The model step now advances only when the pinned local model artifact exists with the expected size and checksum verification marker.
- The UI label now says `Confirm model verified`, matching the actual gate behavior while the model panel owns explicit download/resume/checksum controls.
- Model and first-run Rust tests now share one environment-variable lock, removing nondeterministic test races around `CIVICSUITE_DESKTOP_STATE_DIR`.

## Five-Lens Check

### Correctness

PASS. First-run delegates model artifact truth to the model module and cannot mark the model step complete before verification.

### UX

PASS. The setup button describes confirmation instead of implying a hidden automatic setup step.

### Docs

PASS. This report records the new gate behavior and remaining runtime/health boundaries.

### Tests

PASS. Rust coverage includes missing-artifact refusal and deterministic shared test-state isolation.

### Runtime Behavior

PASS. Local validation covered Rust command behavior, static smoke, production build, and Playwright browser flows.

## Verification Evidence

- Rust desktop tests: 24 passed.
- Desktop static smoke: passed.
- Desktop production build: passed.
- Desktop Playwright browser tests: 3 passed.

## Next Slice Watchlist

- Add disk-space preflight before model download starts.
- Implement portable local runtime health so the `verify-health` step can become a real gate.
- Connect CivicCore model registration after the runtime is available.
