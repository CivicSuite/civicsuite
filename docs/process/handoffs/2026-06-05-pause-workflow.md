# Pause Workflow - CivicSuite Stage Work

## Pause Trigger

Use this workflow when the machine is about to reboot, the thread is about to be interrupted, or the active work is waiting on a repo-side tester result.

## Required Pause State

Before pausing:

- Working tree must be clean, or the handoff must explicitly name every dirty file and why it is safe.
- Current branch/head must be recorded.
- Current external gate must be recorded.
- Current watchdog or polling responsibility must be recorded.
- Any local-only memory needed after restart must be written under safe local memory, not a cloud-sync path.

## Current Pause State

- Repo: `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29`
- Branch: `stage-3a-baremetal-windows`
- Head: `28c81b292e1e29c1cf9e5e432a3ae0f0946f0feb`
- Local status: clean before this handoff commit
- External gate: `test-comms/TESTER-RESULT-022.md`
- Watchdog: `civicsuite-test-comms-watchdog`, every 10 minutes, repo `test-comms` only

## Resume Rules

Resume from the repo, not memory alone:

- Verify the local branch and remote branch first.
- Read the newest `test-comms/TESTER-RESULT-*.md` file before editing.
- Treat result 022 as authoritative only if it tested a head on or after `a53bad3452cda2b75e284e8dea3250d6365fa151` and the refreshed Windows artifact hashes match the directive.
- Continue as builder. Do not switch into passive auditor mode.

## Stage Program Reminder

The 7-stage program is not complete. Stage 3A is still gated on tester result 022. After Stage 3A closes, continue the remaining module stages in the approved slice/audit/test pattern.
