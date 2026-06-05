# Next Sprint Watchlist

These are not current audit findings.

- Stage 3B air-gap bundle layout will need its own artifact, hash, and tester evidence chain; do not let Stage 3A online proof imply offline readiness.
- Any future Docker Desktop silent-install change should be spiked before it is folded into the clerk-facing wrapper.
- Any Stage4 lifecycle evidence schema change must update both the warm-first installer and the bootstrapper's independent evidence parser.
- Keep Windows Home, locked-down managed machines, and virtualization-off devices out of Stage 3A claims until a product decision and separate test matrix exist.
