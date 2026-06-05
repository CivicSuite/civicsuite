# Tester Directive 022 - re-run Stage 3A customer artifact after artifact refresh

## Goal
Re-run the Stage 3A Windows customer-artifact gate against the current `stage-3a-baremetal-windows` branch head after the phase-aware failure-guidance fix was regenerated into the downloadable Windows artifact.

This directive exists because `TESTER-RESULT-021.md` proved the Stage 3A customer-artifact path green at `bb10be178b72b646f93b3273d2ed9ce84d106b3d`, but the Windows artifact bytes were regenerated afterward at `a53bad3452cda2b75e284e8dea3250d6365fa151`.

## Required branch truth
- Repo: `CivicSuite/civicsuite`
- Branch: `stage-3a-baremetal-windows`
- Required minimum head: `a53bad3452cda2b75e284e8dea3250d6365fa151`
- Windows zip SHA256 expected in `installer/dist/CivicSuite-city-core-0.1.2-SHA256SUMS.txt`: `108e3429344f75638ec707b391316598a4fdf784577014515226f919dbdd92fc`
- Windows one-click SHA256 expected in `installer/dist/CivicSuite-city-core-0.1.2-SHA256SUMS.txt`: `7d6ea3d9ac8f32c7c484fd352addcd08acc614d15336a4ba84f9e3c81c222d2f`

## Required procedure
1. Fetch the explicit GitHub branch ref `refs/heads/stage-3a-baremetal-windows`.
2. Reset the TESTER worktree to the fetched branch head.
3. Confirm the checked-out commit is at least `a53bad3452cda2b75e284e8dea3250d6365fa151`.
4. Confirm the Windows artifact hashes in `installer/dist/CivicSuite-city-core-0.1.2-SHA256SUMS.txt` match the expected hashes above.
5. Run the clean-stack teardown first, using the standing `test-comms/README.md` procedure.
6. Run the customer one-click artifact from the branch checkout:
   - `installer\dist\CivicSuite-city-core-windows-0.1.2.cmd`
7. Do not inject host facts, mock AI evidence, edit source, or bypass the customer artifact path.
8. Write `test-comms/TESTER-RESULT-022.md` and push it to `stage-3a-baremetal-windows`.

## Required result evidence
`TESTER-RESULT-022.md` must include:
- exact branch head tested,
- the observed Windows zip and one-click SHA256 values,
- Stage0 live host facts from the bootstrap result JSON,
- Stage1 status,
- Stage2 Docker Desktop/Ollama evidence, including `engine_ready`,
- Stage3 warm-first installer handoff status,
- Stage4 evidence assertion status,
- `generation_source`,
- `generation_model`,
- launcher URL evidence,
- final gate verdict.

## Pass criteria
Pass only if:
- Stage0 through Stage4 all pass,
- `generation_source=ollama`,
- `generation_model=gemma4:e4b`,
- the launcher serves and reports a usable local URL,
- the run came from the regenerated customer artifact on or after `a53bad3452cda2b75e284e8dea3250d6365fa151`.

## Constraints
No source edits during the test run. Push only `test-comms/TESTER-RESULT-022.md`. No merge, tag, status promotion, or `modules.json` changes. Never touch any OneDrive path.
