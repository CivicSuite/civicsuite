# Windows Bare-Metal Installer Stage 3A Guide

Stage 3A targets a conservative online Windows install path:

- Windows 11 Pro or Enterprise
- local administrator account
- hardware virtualization already enabled
- internet available
- at least 16 GB host RAM and 25 GB free disk for `gemma4:e4b` and the
  city-core container stack
- Docker Desktop / WSL2 configured with about 8 GB memory on Windows
- host Ollama must pass the actual bounded `gemma4:e4b` model-load readiness
  probe before install starts

This guide does not claim support for Windows Home, locked-down managed devices,
virtualization-off machines, or air-gapped installs. Those are discovery and
Stage 3B bundle-mode work.

## What the Bootstrapper Does

The Windows bare-metal bootstrapper is staged and idempotent:

1. Stage0 checks the machine against the Stage 3A target and requests UAC
   elevation when needed.
2. Stage1 enables WSL2 and Virtual Machine Platform, schedules a one-shot
   resume after reboot, and unregisters that resume task when the resumed run
   starts.
3. Stage2 runs the Docker Desktop spike, verifies Docker engine readiness, and
   installs or verifies Ollama.
4. Stage3 invokes the existing warm-first city-core installer. It does not
   reimplement the stack install.
5. Stage4 runs the existing workflow proof and independently checks lifecycle
   evidence for `generation_source=ollama` and `generation_model=gemma4:e4b`.

The progress wrapper renders the same stage state for a clerk or local IT
operator: phase status, where the logs are, actionable failures, and final local
URLs when the proof is green.

## Evidence

Current committed evidence is not a release promotion. It is:

- Tester result 017 (`test-comms/TESTER-RESULT-017.md`): green repo-local bootstrapper run with
  corrected host-facts injection; it reached `generation_source=ollama`,
  `generation_model=gemma4:e4b`, all starter-set workflows, and the suite
  launcher.
- Tester result 018 (`test-comms/TESTER-RESULT-018.md`): red follow-up run; Stage3 failed during
  CivicCode image build with Docker Desktop EOF/500 transport errors, and the
  final bootstrap result JSON remained stale at `elevation_requested`.
- Current branch fixes after 018: the customer Windows `.cmd` artifact now
  extracts and launches the Stage 3A bare-metal progress wrapper, Stage3
  lifecycle failure writes a terminal failed bootstrap result, and Docker
  compose build runs with reduced parallelism plus one bounded retry for known
  transient Docker Desktop transport failures.
- Tester result 021 (`test-comms/TESTER-RESULT-021.md`): green artifact-path
  re-gate against the prior regenerated customer artifact with no
  `-HostFactsJson` injection. Stage0 live-proved `Get-HostFacts`, Stage0
  through Stage4 passed, Stage4 asserted `generation_source=ollama` and
  `generation_model=gemma4:e4b`, and the launcher served at
  `http://127.0.0.1:18082/`.
- Tester result 022 (`test-comms/TESTER-RESULT-022.md`): green re-gate for
  the later `a53bad3` artifact refresh that embeds phase-aware failure guidance
  into the downloadable Windows artifact. The tester verified the expected
  Windows zip and one-click hashes, then passed Stage0 through Stage4 with
  `generation_source=ollama`, `generation_model=gemma4:e4b`, and the launcher
  serving at `http://127.0.0.1:18082/`.
- Tester result 028 (`test-comms/TESTER-RESULT-028.md`): historical
  low-memory fail-clean gate. This result was superseded after product
  clarification that the available 16 GB tester can run `gemma4:e4b` through
  host Ollama and should be accepted when the actual model-load probe passes.
- Tester result 030 (`test-comms/TESTER-RESULT-030.md`): historical blocked
  result based on the superseded static 24 GB host / 12 GB Docker-WSL floor.
  The current gate is no longer a static qualifying-host check; it requires the
  available tester to pass readiness with the actual host-Ollama model-load
  check, then proceed to install, verify, launcher, and live route proof.

The green Stage 3A live gate showed:

- one bootstrapper starts from a bare Stage 3A Windows VM
- the WSL2 reboot path resumes once and self-terminates
- Docker Desktop reports a real server engine
- Ollama keeps `gemma4:e4b` warm
- the city-core workflow proof returns `generation_source=ollama`
- lifecycle evidence records `generation_model=gemma4:e4b`
- the suite launcher serves at `http://127.0.0.1:18082/`

Tester result 022 closes the Stage 3A Windows artifact-refresh gate for this
branch. The proven-suite clean-machine gate remains open after result 030, but
the next rerun should use the available 16 GB Windows tester if host Ollama
passes the actual `gemma4:e4b` model-load readiness probe.
This does not merge, tag, status-promote, or claim public-use readiness,
city-ready status, procurement readiness, production readiness, macOS lifecycle
certification, airgap readiness, or full-suite release.
