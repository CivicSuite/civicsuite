# Tester Directive 019 - customer artifact Stage 3A re-gate

## Goal
Run the current `stage-3a-baremetal-windows` head from the regenerated customer artifact, not the repo-local bootstrapper, and prove whether the Stage 3A city-core Windows bare-metal path reaches live `generation_source=ollama` and `generation_model=gemma4:e4b`.

## Branch and artifact under test
- Branch: `stage-3a-baremetal-windows`
- Minimum head: `95fb0cc fix(installer): route city-core artifact to bare-metal bootstrapper`
- Customer artifact entrypoint: `installer\dist\CivicSuite-city-core-windows-0.1.2.cmd`
- Expected extracted bundle start point: `installer\baremetal\windows\civicsuite-baremetal-progress.ps1`

## Required procedure
1. Pull and hard-reset the tester clone to `origin/stage-3a-baremetal-windows`.
2. Run the CivicSuite stack teardown first, preserving Docker Desktop, WSL2, Ollama, Python, and the pulled model.
3. Record both host facts in the result:
   - `(Get-CimInstance Win32_ComputerSystem).HypervisorPresent`
   - `(Get-CimInstance Win32_Processor).VirtualizationFirmwareEnabled`
4. Do not use `-HostFactsJson`. Do not inject corrected facts. This run must live-prove the bootstrapper's own `Get-HostFacts`.
5. Launch the customer artifact `.cmd`. Let it self-elevate, reboot/resume if needed, install prerequisites, run Stage3, and run Stage4.
6. At terminal success or failure, write `test-comms/TESTER-RESULT-019.md` and push it.

## Result evidence required
- Branch head tested.
- Whether the `.cmd` extracted and launched the bare-metal progress wrapper.
- Bootstrap result JSON status and per-stage statuses.
- Lifecycle evidence path and lifecycle status.
- If Stage4 passes: `generation_source`, `generation_model`, and launcher URL evidence.
- If the run fails: failing stage, failing module/step if present, relevant bootstrap/lifecycle stderr, and whether the final structured bootstrap JSON was honestly rewritten after failure.

## Constraints
No source edits during the test run. No merge, tag, status promotion, or `modules.json` changes. Push only the result file to `stage-3a-baremetal-windows`. Never touch any OneDrive path.
