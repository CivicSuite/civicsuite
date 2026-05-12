# CivicRecords AI B2 Completion Handoff

Date: 2026-05-12
Scope: Audit punch-list B2 security-secret handling recovery
Status: Complete - CivicRecords AI v1.6.0 released and suite truth reconciled

## Summary

CivicRecords AI v1.6.0 closes B2 by moving `JWT_SECRET` and
`FIRST_ADMIN_PASSWORD` material into Docker Compose secret source files and
removing raw and `_FILE` secret names from the container environment. The
literal acceptance command now returns zero lines:

```bash
docker compose exec -T api env | grep -E 'JWT_SECRET|FIRST_ADMIN_PASSWORD'; echo exit=$?
```

```text
exit=1
```

## Release Evidence

| Item | Evidence |
| --- | --- |
| Phase 1 PR | CivicSuite/civicrecords-ai#74 at `902db173366359124e4d8e84f3c440df61aa62f4` |
| Phase 1B PR | CivicSuite/civicrecords-ai#76 at `5e7425dc7a226f63a4ba8a91aa76cb30491c03ef` |
| Phase 2 rehearsal PR | CivicSuite/civicrecords-ai#77 at `f2432c14a9afd06f7577ba090d884a0e9375cb4a` |
| Release workflow recovery PR | CivicSuite/civicrecords-ai#78 at `fcb1f8301c95025aac5e31329acd3179055c2a26` |
| CivicRecords AI release | https://github.com/CivicSuite/civicrecords-ai/releases/tag/v1.6.0 |
| Release workflow run | `25719121452` success |
| Umbrella suite-truth PR | CivicSuite/civicsuite#128 at `07544e01ec285a2116e63c76075d224136b8c3c0` |

## Tag-Move Record

| Tag | Initial target | Final target | Moves | Notes |
| --- | --- | --- | ---: | --- |
| v1.6.0 | `f2432c14a9afd06f7577ba090d884a0e9375cb4a` | `fcb1f8301c95025aac5e31329acd3179055c2a26` | 1 | Moved once to include PR #78, a CI-only workflow `.env` synthesis fix. Product code unchanged. |

Tag object after move: `1c60fc7a7deb9671f150e4445da51fce0019d93b`.

## Release Artifacts

```text
5d4d55edc4a030ab86068ff3ab578ea97f5e7b2a5982c90ba302752e0f1d9022  CivicRecordsAI-1.6.0-Setup.exe
```

GitHub asset digests:

```text
sha256:5d4d55edc4a030ab86068ff3ab578ea97f5e7b2a5982c90ba302752e0f1d9022  CivicRecordsAI-1.6.0-Setup.exe
sha256:d54e5b4f541035fd5a66271eedd0542a20b27dffec72ff6682bddeccd6f2d8bd  CivicRecordsAI-1.6.0-Setup.exe.sha256
sha256:0d6fa94759c939d8eb41a86ac6b389c7a88d50558cc19a42efc43dc0ced6405a  release-attestation.json
sha256:3ba1c2caea0fcc83ec6b94eb8bb1aadb2e53093a7188523af6e5dd35cbf22f97  release-attestation.json.bundle
```

## Post-Merge Suite Verification

```text
==> CivicSuite suite-state verification
workspace: C:\Users\scott\OneDrive\Desktop\Claude
repos: 26
remote release checks: enabled
local sibling clone checks: disabled
[civiccore] PASS 1.1.0 (CivicSuite/civiccore)
[civicrecords-ai] PASS 1.6.0 (CivicSuite/civicrecords-ai)
[civicclerk] PASS 1.0.1 (CivicSuite/civicclerk)
[civiccode] PASS 0.5.0 (CivicSuite/civiccode)
[civiczone] PASS 0.2.0 (CivicSuite/civiczone)
[civicaccess] PASS 0.1.1 (CivicSuite/civicaccess)
[civicplan] PASS 0.2.0 (CivicSuite/civicplan)
[civicpermit] PASS 0.2.0 (CivicSuite/civicpermit)
[civicinspect] PASS 0.2.0 (CivicSuite/civicinspect)
[civicgrants] PASS 0.2.0 (CivicSuite/civicgrants)
[civicprocure] PASS 0.2.0 (CivicSuite/civicprocure)
[civiccontracts] PASS 0.1.1 (CivicSuite/civiccontracts)
[civicboards] PASS 0.1.1 (CivicSuite/civicboards)
[civicnotice] PASS 0.1.1 (CivicSuite/civicnotice)
[civic311] PASS 0.1.1 (CivicSuite/civic311)
[civiccomms] PASS 0.1.1 (CivicSuite/civiccomms)
[civicdata] PASS 0.1.2 (CivicSuite/civicdata)
[civichr] PASS 0.1.1 (CivicSuite/civichr)
[civicbudget] PASS 0.1.2 (CivicSuite/civicbudget)
[civiclegal] PASS 0.1.2 (CivicSuite/civiclegal)
[civicelections] PASS 0.1.1 (CivicSuite/civicelections)
[civicutility] PASS 0.1.1 (CivicSuite/civicutility)
[civiccourt] PASS 0.1.2 (CivicSuite/civiccourt)
[civicsafety] PASS 0.1.1 (CivicSuite/civicsafety)
[civiclibrary] PASS 0.1.1 (CivicSuite/civiclibrary)
[civicparks] PASS 0.1.1 (CivicSuite/civicparks)
VERIFY-SUITE-STATE: PASSED
```

## Five-Lens Self-Audit

- Engineering: pass. CivicRecords AI v1.6.0 is released, suite truth expects
  and observes 1.6.0, and the umbrella lifecycle runners now synthesize the
  B2 secret files before compose startup.
- UX: pass. No frontend surfaces changed in this release-truth step; operator
  behavior improves by keeping secret material out of recoverable container
  environment output.
- Tests: pass. CivicRecords release workflow run `25719121452` passed,
  umbrella PR #128 passed `release-lockstep-gate`, `verify`, and installer
  cleanroom lifecycle, and post-merge `verify-suite-state.py --remote-only`
  passed all 26 modules.
- Docs: pass. Release truth, compatibility, recovery status, downstream pins,
  changelog, and this handoff all record the v1.6.0 B2 closure.
- QA: pass. The Phase 1 predicate gap was closed by PR #76; the suite installer
  lifecycle gap exposed on PR #128 was closed by creating secret source files in
  the umbrella lifecycle runners.
- Artifact-state: pass. v1.6.0 release assets exist with full SHA256 digests.
- Post-push propagation: pass. Suite truth PR #128 merged through green
  release-lockstep-gate, and the post-merge remote verifier passes.

## Next Target

Next active target: Installer/macOS certification follow-up.

Why next: the queue already identifies macOS full lifecycle certification as the
next unresolved installer trust gap after B2. That work should either provide a
real macOS host/runner proof or narrow the published platform matrix honestly.
