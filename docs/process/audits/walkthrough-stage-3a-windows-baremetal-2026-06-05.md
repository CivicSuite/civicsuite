# Walkthrough - Stage 3A Windows Bare-Metal Installer

## Executive Summary

The Stage 3A installer interface is wired as an installer/progress UX rather than a browser application: the customer `.cmd` launches the PowerShell progress wrapper, the wrapper launches the staged bootstrapper, and the bootstrapper writes structured result evidence that the wrapper renders for a clerk or local IT operator. No walkthrough findings remain. Browser Playwright exploration was not run locally because this gate's primary UI is the Windows installer/progress wrapper and the live launcher evidence is supplied by the external Windows tester result; treating local static review as a browser pass would be misleading.

## Methodology

Reviewed source, generated bundle, docs, tests, artifact hashes, tester result 021, and tester directive 022. Ran the Stage 3A focused test suite and one-click wrapper smoke. Inspected the generated Windows zip to confirm the shipped artifact contains the audited bootstrapper/progress wrapper and not a stale source copy.

## Project Gestalt

The user-facing workflow is: a clerk or local IT operator launches one Windows artifact, sees stage progress, gets readable phase-specific failures if prerequisites or verification fail, and sees local URLs only after the stack is ready.

## Findings By Severity

None.

## Missing Or Partial Features

None within Stage 3A scope. Air-gapped bundle mode, Windows Home, managed locked-down devices, and macOS lifecycle certification remain outside the Stage 3A claim.

## Backend Or System Capabilities Not Surfaced

None found for the Stage 3A wrapper scope. Stage4 evidence assertion surfaces the relevant backend/local-AI proof through the structured result.

## Confusing Or Misleading UI

None found after the phase-aware failure-message fix. Stage2 failures now point at Docker/Ollama prerequisites.

## Broken Or Suspicious Wiring Map

| UI element or workflow | Expected system connection | Actual connection | Status | Evidence |
| --- | --- | --- | --- | --- |
| Customer `.cmd` artifact | Launch Stage 3A progress wrapper | Wrapper smoke passes; generated bundle includes progress wrapper | Working | `CIVICSUITE_ONE_CLICK_SMOKE_ONLY=1` smoke passed |
| Progress wrapper success state | Show local URLs only after non-failed bootstrap result | Success test verifies final URLs; failure test verifies no ready URLs | Working | `tests/test_windows_baremetal_progress.py` |
| Stage2 failure output | Name Docker/Ollama prerequisites | Bootstrapper returns Stage2-specific actionable message | Working | `test_stage2_failure_uses_stage2_actionable_message` |
| Stage4 verification | Assert real local AI evidence | Bootstrapper parses lifecycle evidence for Ollama/gemma4 values | Working | `test_stage4_fails_template_fallback_lifecycle_evidence` |

## Test Assessment

The current tests prove the installer wrapper wiring, bootstrap failure/success result behavior, Stage1 resume cleanup, Stage4 evidence parsing, Docker spike behavior, and truth-doc claims. External tester result 022 remains required to prove the refreshed artifact on the separate Windows machine.

## Recommended Repair Plan

No repairs are recommended from this walkthrough. Continue with tester result 022 and then update truth docs according to that evidence.

## Confidence And Gaps

High confidence in source, generated artifact composition, local smoke, and focused behavioral tests. The live refreshed-artifact Windows run is still pending in the repo TESTER channel.
