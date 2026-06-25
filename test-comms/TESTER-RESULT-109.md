# TESTER-RESULT-109

Verdict: FAIL

Classification: admin/elevation/test-harness limitation; product first-run setup could not be advanced through the installed WebView controls, so the product did not materialize the local runtime/profile and the model-download / AI lifecycle stages could not be reached. No reboot was performed.

## Branch / remote records

- Start branch head: `origin/stage-3a-baremetal-windows` at `6e9a2ad6ba9fb55d48fde024bb868bbadcdec822`.
- Before result write: `git fetch origin stage-3a-baremetal-windows --prune` recorded `FETCH_HEAD` = `6e9a2ad6ba9fb55d48fde024bb868bbadcdec822`; `git ls-remote origin refs/heads/stage-3a-baremetal-windows` also returned `6e9a2ad6ba9fb55d48fde024bb868bbadcdec822`.

## Stage A - clean state

- Stopped CivicSuite desktop/runtime processes and standalone Ollama.
- Initial non-elevated MSI uninstall of `{5C23B582-9CF3-4A7A-AD0C-E2B9C9F679EA}` failed with Windows Installer error 1730 / exit 1603 because administrator rights were required.
- Elevated uninstall helper completed with exit code 0. No reboot was performed.
- Deleted CivicSuite Program Files payload, `%LOCALAPPDATA%\CivicSuite`, model cache, stale registrations, and prior directive artifacts where present.
- Clean verification (`directive109-evidence/stageA-clean-verify.json`):
  - `HypervisorPresent`: `true`
  - `VirtualizationFirmwareEnabled`: `false`
  - C: free disk: `88.03 GB`
  - Program Files CivicSuite: absent
  - `%LOCALAPPDATA%\CivicSuite`: absent
  - model cache: absent
  - CivicSuite registrations/services/processes: none

## Stage B - published MSI install

- Downloaded published release assets from `civicsuite-windows-local-v1.0.0`.
- Verified pinned asset sizes and hashes exactly (`directive109-evidence/stageB-asset-verify.json`):
  - `CivicSuite_0.1.0_x64_en-US.msi`: `1645426125` bytes, SHA-256 `2e5b163c7737b3534d2e5eef4fe9fd87a6af9ed0509e54b072ae7caa22db27ac`
  - `CivicSuite-msi-evidence.txt`: `578` bytes, SHA-256 `50066579da06b5ad378b957ca181752f030e7c71c1738732d40cac376548d16e`
- Installed the verified MSI elevated with `/qn /norestart`; elevated helper exit code 0 (`directive109-evidence/stageB-elevated-install-result.json`).
- MSI installed `C:\Program Files\CivicSuite\civicsuite-desktop.exe` and payload under `C:\Program Files\CivicSuite\_up_\runtime\payload`.
- Installed product registration after install:
  - ProductCode `{7BE25830-15EE-4797-A25F-DF614ACA9B8E}`
  - DisplayName `CivicSuite`
  - DisplayVersion `0.1.0`
  - InstallLocation `C:\Program Files\CivicSuite\`
- Launched only `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.

## Stage C - blocker

- The installed desktop window opened and responded. Screenshot evidence includes:
  - `directive109-evidence/stageB-civicsuite-window.png`
  - `directive109-evidence/stageC-next-visible-step.png`
  - `directive109-evidence/stageC-after-step1-click.png`
- The visible installed-app first-run surface showed the City Core setup checklist and the step-1 `Review and continue` control.
- Programmatic UI attempts were made through the running installed app window:
  - foreground/window restore
  - Win32 mouse click on the visible `Review and continue` button
  - keyboard focus / Tab / Enter
  - WebView child-window `WM_LBUTTONDOWN` / `WM_LBUTTONUP`
- The WebView button did not advance the checklist state in this test harness. The app remained on step 1 with no `%LOCALAPPDATA%\CivicSuite` profile created.
- Final state (`directive109-evidence/stageC-final-state.json`):
  - `civicsuite-desktop.exe` running from `C:\Program Files\CivicSuite\civicsuite-desktop.exe`
  - `%LOCALAPPDATA%\CivicSuite`: absent
  - `org.civicsuite.desktop\EBWebView`: present
  - no bundled Ollama process
  - no bundled Postgres process
  - no CivicSuite-owned runtime/API listener
  - only listener matching the process filter was unrelated `python.exe` on `127.0.0.1:18082`

Because first-run setup could not be advanced through installed product controls, the product-managed runtime was never materialized. I could not proceed to bundled Ollama install/start/check/repair, fresh Hugging Face Gemma download, checksum verification, model registration, CivicCore readiness, module AI workflows, reopen proof, backup/restore, or MSI uninstall/reinstall lifecycle proof.

No reboot was performed.
