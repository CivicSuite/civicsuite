# Windows Bare-Metal Installer Stage 3A Guide

Stage 3A targets a conservative online Windows install path:

- Windows 11 Pro or Enterprise
- local administrator account
- hardware virtualization already enabled
- internet available
- enough RAM and disk for `gemma4:e4b` and the city-core container stack

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

Current committed evidence is scaffold and plan-mode evidence only. The live
bare-VM evidence is still pending a Windows 11 Pro/Enterprise VM supplied for
the gate. The live gate must show:

- one bootstrapper starts from a bare Stage 3A Windows VM
- the WSL2 reboot path resumes once and self-terminates
- Docker Desktop reports a real server engine
- Ollama keeps `gemma4:e4b` warm
- the city-core workflow proof returns `generation_source=ollama`
- lifecycle evidence records `generation_model=gemma4:e4b`
- the suite launcher serves at `http://127.0.0.1:18082/`

Until that VM run is captured, this branch is a Stage 3A scaffold and UX
candidate, not a promoted installer release.
