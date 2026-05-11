# Phase 2 Local Release Rehearsal - CivicCore v1.1.0 - 2026-05-11

## Environment

- Host: Windows desktop with WSL/bash release verifier.
- Source SHA: `411a4f4a833c91a787dacf1485f643f564e174c2`
- Repo: `CivicSuite/civiccore`
- Release type: Python wheel + source distribution GitHub Release.
- Hermetic env shape: package-only release; no Docker compose runtime or `.env`
  synthesis required for CivicCore.

## Steps Run

| Step | Result | Notes |
|---|---|---|
| 1. Fresh release env bootstrap | PASS | `scripts/verify-release.sh` created a temporary venv and installed `.[dev]`. |
| 2. verify-release.sh | PASS | 279 pytest tests passed; ruff check passed; version lockstep passed; release provenance fixtures passed; required docs present; build passed; fresh-wheel import/version smoke passed. |
| 3. Build artifacts | PASS | `dist/civiccore-1.1.0-py3-none-any.whl` and `dist/civiccore-1.1.0.tar.gz` created. |
| 4. Artifact shape | PASS | Filenames match expected v1.1.0 release shape. |
| 5. act simulation | SKIPPED | Not required for CivicCore package-only release; release verifier exercises the same package/test/build gates locally. |

## Artifact SHA256

```text
3fa8f10a4b3ad7f1163e2df6177b5733af9e49240d2f848918229344a0e8515b  civiccore-1.1.0-py3-none-any.whl
62cadbb63dae5dd74c6bb793bc27f96f405403652645886ebe791cc30904a2dc  civiccore-1.1.0.tar.gz
```

## Non-Rehearsable Steps

- GitHub-hosted release publication and attestation job remain remote-only.
- Local rehearsal still proved the package/test/build path before tag push.

## Recommendation

Proceed to Phase 3 tag push. Why: the merged v1.1.0 source SHA passed the full
local release verifier and produced correctly named wheel/sdist artifacts with
captured SHA256 hashes.
