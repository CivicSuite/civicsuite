# Releasing the Windows-Local MSI

The repeatable process for publishing a CivicSuite Windows-Local (`civicsuite-windows-local-vX.Y.Z`) beta release. Closes the "no release automation / hand-published MSI" and "lightweight vs annotated tag" gaps.

## Versioning

- The desktop build version (`desktop/src-tauri/tauri.conf.json`, `desktop/package.json`, `desktop/src-tauri/Cargo.toml`) MUST match the release `vX.Y.Z`. ARP / Add-Remove Programs shows this version. Bump all three (and regenerate `package-lock.json` + the `civicsuite-desktop` entry in `Cargo.lock`) in the release PR.
- Patch (security/bugfix) = `Z`; new feature within the beta line = `Y`.

## Steps

1. **Land the code** on `main` (PR, green CI). Merging desktop changes to `main` auto-triggers the `desktop-windows-msi` workflow, which builds + integration-tests + lifecycle-tests the MSI and uploads it as the `civicsuite-windows-local-msi` artifact.
2. **Clean-machine validation (QA-B1).** Validate that exact MSI on a pristine Windows VM/Sandbox: install -> launch (window renders) -> first-run wizard -> model download + checksum + Ollama load + one real completion -> backup/restore -> uninstall. (Beelink Sandbox harness under `test-comms/vmhost-beelink/`.)
3. **Verify the artifact hash** matches the build evidence (`CivicSuite-msi-evidence.txt` `SHA256=`).
4. **Push an ANNOTATED tag** (not lightweight) so the release tag carries authorship/date metadata:
   ```
   git tag -a civicsuite-windows-local-vX.Y.Z -m "CivicSuite Windows Local X.Y.Z"
   git push origin civicsuite-windows-local-vX.Y.Z
   ```
5. The **`release-windows-msi` workflow** fires on that tag: it downloads the MSI from the latest successful `main` build and attaches it (plus evidence) to the release, creating the release as a prerelease if it does not exist yet.
6. **Finalize**: edit the release notes (security fixes, validation evidence, SHA-256, unsigned-beta/SmartScreen guidance), then promote from prerelease to Latest.
7. **Retire** any superseded release candidate (mark `[RETIRED]`, prerelease, remove its unpatched assets).

## Notes

- The MSI is an **unsigned beta**: SmartScreen shows "Unknown Publisher" -> "More info" -> "Run anyway". Authenticode code-signing is a **GA-gate** item, not a beta blocker.
- Always release the EXACT artifact `main` built and CI/clean-machine validated -- never a separate ad-hoc rebuild.
