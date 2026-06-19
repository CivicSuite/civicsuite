# Audit Lite: Windows MSI and Linux Cleanroom CI Recovery

Scope: PR #192 head `7b71c3ddd556098aa575e167f4218afc2a9f366d`, failing GitHub Actions jobs `desktop-windows-msi / build Windows Local MSI` and `installer-cleanroom / linux archive full lifecycle`.

## Findings

None.

## Evidence Reviewed

- GitHub Actions job `81205062637` failed in `desktop/scripts/prepare-runtime-payload.ps1` during pgvector build because native `cmd.exe` stderr was promoted to a terminating PowerShell `NativeCommandError` at line 176 before the script emitted captured build output.
- `desktop/scripts/prepare-runtime-payload.ps1:171` now routes pgvector build stdout/stderr through `Start-Process` redirection files, prints both streams explicitly, and throws only from the native exit code at `desktop/scripts/prepare-runtime-payload.ps1:190`.
- GitHub Actions jobs `81205051295` and `81205051300` failed with Docker daemon address-pool exhaustion during Linux package lifecycle `compose_up`.
- `scripts/run-installer-package-cleanroom.py:87` keeps normal cleanroom runs non-mutating when disk is already healthy and no cleanup approval is present.
- `scripts/run-installer-package-cleanroom.py:103` runs approved Docker system and network cleanup before lifecycle work when cleanup is explicitly authorized.
- `.github/workflows/installer-cleanroom.yml:130` authorizes that cleanup only for the self-hosted Linux lifecycle job.
- Generated city-core suite-launcher packages were refreshed by `scripts/verify-installer-plan.py`; the generated user-facing text now says local runtime verification instead of Docker verification.

## Verification

- `python -m py_compile scripts/run-installer-package-cleanroom.py scripts/run-clerk-core-installer.py scripts/verify-installer-plan.py`
- PowerShell parser check for `desktop/scripts/prepare-runtime-payload.ps1`
- `python scripts/verify-installer-plan.py`
- `cd desktop; npm test`
- `cd desktop; npm run test:browser`
- `bash scripts/verify-docs.sh`
- `python scripts/policy/check_stage_evidence.py`
- `git diff --check`

## Residual Risk

- The exact GitHub-hosted Windows pgvector build and self-hosted Linux Docker address-pool exhaustion are CI-environment failures; local verification covers syntax, static installer contracts, generated package consistency, and browser smoke behavior, while the pushed CI rerun must provide the final runtime evidence.
