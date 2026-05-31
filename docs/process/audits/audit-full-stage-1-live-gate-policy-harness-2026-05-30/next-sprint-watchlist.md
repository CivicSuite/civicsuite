# Next Sprint Watchlist - Stage 1 Live Gate Policy Harness

Stage 2 should use the Stage 1 harness while reconstructing the live installer gate.

Watch items:

- Do not accumulate live-install patches locally. Push each Codex-reviewed slice.
- Treat missing stage ledgers or audit-lite reports as real blockers until repaired.
- Keep `.agent-runs/` evidence mirrored into tracked docs when it is stage-critical.
- Do not label Stage 2 with `release-tag` unless release truth artifacts move together.
- Product installability claims still require live assembled evidence; Stage 1 only proves workflow durability.
