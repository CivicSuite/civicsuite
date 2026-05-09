# CivicSuite Installer Validation Status - 2026-05-09

Status: active target partially completed; workflow not paused by this file.

## Active Target

Installer OS cleanroom validation.

## What Changed

- Added a reusable CivicSuite control-plane state under `.agent-workflows`.
- Extended `scripts/run-installer-package-cleanroom.py` so package proof can run Windows, macOS, or Linux archives through platform launchers.
- Fixed Windows zip packaging by preserving CivicRecords AI's Dockerfile-required `backend/tests` path with `.bundle-placeholder`.
- Changed generated profile package plans to use target-platform metadata instead of the artifact-generation host.
- Regenerated unsigned beta artifacts and checksums for `clerk-core` installer `0.1.0`.
- Updated installer docs and checkpoint evidence.

## Final Artifact Checksums

```text
c3b022bd48416811cbed6112540d6f5e185829d21ed380104b101464c4b690d1  CivicSuite-clerk-core-windows-0.1.0.zip
f0aa51e8fe6468adcdb981ef1ff4ac8fd4875d02aeed36dd10f1958d779b5950  CivicSuite-clerk-core-macos-0.1.0.tar.gz
d79f36f51040bbbf2ee3ffbf0e9f1633d15d7ac839a248a12f32294edb1e4486  CivicSuite-clerk-core-linux-0.1.0.tar.gz
```

## Validation Evidence

Passed:

```powershell
python scripts\run-installer-package-cleanroom.py --archive installer\dist\CivicSuite-clerk-core-windows-0.1.0.zip
python scripts\run-installer-package-cleanroom.py --archive installer\dist\CivicSuite-clerk-core-linux-0.1.0.tar.gz
python scripts\run-installer-package-cleanroom.py --archive installer\dist\CivicSuite-clerk-core-macos-0.1.0.tar.gz --skip-install
python scripts\verify-installer-plan.py
python scripts\verify-secret-scan.py
bash scripts/verify-docs.sh
python scripts\verify-deployment-profile.py --static-only
python scripts\verify-suite-state.py
```

Evidence files:

- Windows full lifecycle: `installer/reports/installer-package-cleanroom-20260509T193309Z-b90bb614/installer-package-cleanroom.json`
- Linux full lifecycle: `installer/reports/installer-package-cleanroom-20260509T193433Z-4582af7c/installer-package-cleanroom.json`
- macOS archive/readiness/plan: `installer/reports/installer-package-cleanroom-20260509T193159Z-9945e706/installer-package-cleanroom.json`

## Remaining Caveat

Full macOS install, repair, verify, and uninstall was not run because this host is Windows/WSL, not macOS. The macOS archive can be extracted and its launcher can run readiness/plan from this host, but that is not an honest macOS runtime proof.

## Recommendation

Recommended next action: commit, push, and refresh the existing unsigned beta release assets with the regenerated artifacts.

Why: the shipped Windows zip had a real packaging defect, now fixed and proved. The public release assets should not remain on the old checksums.
