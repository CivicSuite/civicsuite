# Tester Result 002 - virtualization truth + live AI-letter proof
**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; 16,629,244 KB visible RAM; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz, 6 cores / 12 logical processors.
**Date/time (UTC):** 2026-06-03T05:37:38.6789861Z

## Virtualization diagnosis (Step 1)
- HypervisorPresent: True
- VirtualizationFirmwareEnabled: False
- wsl --status: exit code 50; output: `The Windows Subsystem for Linux is not installed. You can install by running 'wsl.exe --install'. For more information please visit https://aka.ms/wslinstall`
- wsl -l -v: exit code 1; output: `The Windows Subsystem for Linux is not installed. You can install by running 'wsl.exe --install'. For more information please visit https://aka.ms/wslinstall`
- VirtualMachinePlatform / Hyper-V feature state: `VirtualMachinePlatform` State `0`; `Microsoft-Hyper-V-All` State `0`
- INTERPRETATION: false-negative. `Win32_ComputerSystem.HypervisorPresent` is `True`, so VT-x is genuinely available even though `Win32_Processor.VirtualizationFirmwareEnabled` reports `False`.

## Decision taken
Proceeded with install via corrected `-HostFactsJson`, per directive. The injected facts file set only `virtualization_firmware_enabled` to the true effective value, `true`, while preserving the real OS, edition, admin, internet, and memory facts.

## If proceeded - install + critical check
- Per-stage (Stage0-4): Stage0 passed using the corrected host facts; Stage1/Stage2/Stage3/Stage4 did not complete. The elevated run failed after Stage0 with WSL output: `The Windows Subsystem for Linux is not installed. You can install by running 'wsl.exe --install'.`
- generation_source: null
- generation_model: null
- VERDICT: FAIL - no AI letter proof was generated because the installer stopped before Docker/Ollama/model/stack setup.
- Suite launcher http://localhost:18082 serving: no; module URLs: none printed.

## Evidence paths
Bootstrap result JSON:
`C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\baremetal\windows\logs\civicsuite-baremetal-bootstrap-result.json`

Lifecycle evidence JSON:
`C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\reports\stage3a-baremetal\clerk-core-installer-lifecycle.json` was missing.

Injected facts JSON used:
`C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\baremetal\windows\logs\host-facts-hypervisor-present.json`

Key log excerpts:
- `2026-06-03T05:36:12.3297815Z [stage0] Requesting UAC elevation for CivicSuite bare-metal bootstrap`
- `2026-06-03T05:36:13.0724545Z [stage0] Loading injected host facts from C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\baremetal\windows\logs\host-facts-hypervisor-present.json`
- `2026-06-03T05:36:13.1834571Z [stage0] Stage0 target inspection finished with status passed`
- `2026-06-03T05:36:51.6357917Z [failure] The Windows Subsystem for Linux is not installed. You can install by running 'wsl.exe --install'.`

## Honest notes
Directive 002's false-negative hypothesis was confirmed: HypervisorPresent is true while VirtualizationFirmwareEnabled is false. The installer self-elevated successfully and Stage0 passed with the corrected facts. The next blocker was not VT-x; it was WSL not being installed. The run did not reboot, did not install Docker/Ollama, and did not reach the live AI-letter proof.
