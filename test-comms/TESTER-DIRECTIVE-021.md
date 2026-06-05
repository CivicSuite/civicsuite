# Tester Directive 021 - reorient to active Stage 3A repo channel

## Goal
Recover the TESTER machine onto the correct repo transport and continue Stage 3A from the current branch truth. The active channel is this repo's `test-comms/` directory on branch `stage-3a-baremetal-windows`. The old Claude/Codex bridge is not the TESTER channel.

## Required branch truth
- Repo: `CivicSuite/civicsuite`
- Branch: `stage-3a-baremetal-windows`
- Required remote branch head at directive write time: `bb10be178b72b646f93b3273d2ed9ce84d106b3d`
- Latest known TESTER result: `test-comms/TESTER-RESULT-020.md`
- Latest known gate state: RED in Stage2, Docker Desktop Linux engine did not become ready and returned repeated API 500 responses. Stage3 and Stage4 were not reached.

## Why this directive exists
The DEV-side local clone had a broken/stale remote-tracking view because its fetch refspec tracked only `main`. A clone or script that reads default branch `main`, or a stale `origin/stage-3a-baremetal-windows`, can incorrectly report that `test-comms` is empty or missing. The authoritative source is the GitHub branch ref `refs/heads/stage-3a-baremetal-windows`.

## Required procedure
1. Ensure the TESTER clone is reading `CivicSuite/civicsuite`, not another repo, fork, default branch, or old bridge folder.
2. Fetch the explicit GitHub branch ref `refs/heads/stage-3a-baremetal-windows`.
3. Reset the TESTER worktree to the fetched branch head.
4. Confirm the checked-out commit is at least `bb10be178b72b646f93b3273d2ed9ce84d106b3d`.
5. Confirm these files exist in the checked-out repo:
   - `test-comms/README.md`
   - `test-comms/TESTER-DIRECTIVE-019.md`
   - `test-comms/TESTER-RESULT-020.md`
6. Read `test-comms/README.md` and `test-comms/TESTER-RESULT-020.md`.
7. If the files are present, do not report "nothing in the repo." Continue from the standing `check repo` procedure in `test-comms/README.md`.
8. If the files are still not present, write `test-comms/TESTER-RESULT-021.md` with:
   - exact repo URL,
   - current branch name,
   - current commit SHA,
   - remote branch SHA observed for `refs/heads/stage-3a-baremetal-windows`,
   - directory listing for `test-comms`,
   - whether the checkout is on `main`, a stale remote-tracking ref, a fork, or a different local clone.

## Expected next useful TESTER result
If branch reorientation succeeds, the next useful result is not another "nothing there" report. It should either:
- rerun the Stage 3A customer artifact gate from the correct branch and report whether Stage2 Docker Desktop engine readiness passes, or
- report a precise repo/branch/ref mismatch with the facts listed above.

## Constraints
No source edits during a test run. Push only the result file to `stage-3a-baremetal-windows`. No merge, tag, status promotion, or `modules.json` changes. Never touch any OneDrive path.
