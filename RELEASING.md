# Releasing the Windows-Local MSI

The repeatable process for publishing a CivicSuite Windows-Local (`civicsuite-windows-local-vX.Y.Z`) beta release. Closes the "no release automation / hand-published MSI" and "lightweight vs annotated tag" gaps.

## Versioning

- The desktop build version (`desktop/src-tauri/tauri.conf.json`, `desktop/package.json`, `desktop/src-tauri/Cargo.toml`) MUST match the release `vX.Y.Z`. ARP / Add-Remove Programs shows this version. Bump all three (and regenerate `package-lock.json` + the `civicsuite-desktop` entry in `Cargo.lock`) in the release PR.
- Patch (security/bugfix) = `Z`; new feature within the beta line = `Y`.

## Steps

1. **Land the code** on `main` (PR, green CI). Pull requests and ordinary `main` pushes run the full build, integration, install, backup/restore, and uninstall checks without Azure credentials. They upload a private Actions artifact named `civicsuite-windows-local-msi-UNSIGNED`; the MSI filename itself ends in `-UNSIGNED.msi`, and its evidence says `PublicationAllowed=false`. Never distribute or attach this CI artifact to a release.
2. **Exercise the unsigned candidate as needed.** The unsigned artifact is suitable for internal clean-machine QA while development continues. Verify its hash against `CivicSuite-msi-evidence.txt`. It is not a release asset and Windows may identify its publisher as unknown.
3. **Run the publication-signing gate on the final `main` commit.** Dispatch `desktop-windows-msi.yml` on `main` with `sign_for_publication=true`:
   ```
   gh workflow run desktop-windows-msi.yml --repo townlight/townlight --ref main -f sign_for_publication=true
   ```
   This is the only lane that reads the Azure signing secrets. It must sign through Azure Trusted Signing, independently pass both `signtool verify /pa /v` and `Get-AuthenticodeSignature`, require signer `CN=Scott Converse` plus a timestamp, and then complete the same MSI lifecycle job. Its private Actions artifact is named `civicsuite-windows-local-msi-SIGNED`.
4. **Clean-machine validation (QA-B1).** Download that exact signed artifact and validate it on a pristine Windows VM/Sandbox: signature -> install -> launch (window renders) -> first-run wizard -> model download + checksum + Ollama load + one real completion -> backup/restore -> uninstall. (Beelink Sandbox harness under `test-comms/vmhost-beelink/`.) Confirm the signed MSI hash matches its evidence.
5. **Push an ANNOTATED tag at the exact commit used by the successful signing run** (not a lightweight tag) so the release tag carries authorship/date metadata:
   ```
   git tag -a civicsuite-windows-local-vX.Y.Z -m "CivicSuite Windows Local X.Y.Z"
   git push origin civicsuite-windows-local-vX.Y.Z
   ```
6. The **`release-windows-msi` workflow** fires on that tag. It accepts only a successful manual `main` signing run whose head SHA equals the tag target and whose artifact is named `civicsuite-windows-local-msi-SIGNED`; it recomputes the hash and re-verifies the signer, timestamp, evidence, and `signtool` result before attaching anything. If any gate is absent or mismatched, publication stops.
7. **Finalize**: edit the release notes (security fixes, validation evidence, SHA-256), then promote from prerelease to Latest.
8. **Retire** any superseded release candidate (mark `[RETIRED]`, prerelease, remove its unpatched assets).

## Notes

- Every published MSI is Authenticode code-signed via Azure Trusted Signing (in CI, HSM-held certificate; see CODE_SIGNING_POLICY.md). Routine CI artifacts are deliberately unsigned and non-publishable.
- Always release the EXACT signed artifact from the SHA-matched publication-signing run that CI and clean-machine QA validated -- never an unsigned artifact or a separate ad-hoc rebuild.
