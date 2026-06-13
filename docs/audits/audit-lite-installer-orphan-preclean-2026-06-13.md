# Audit Lite - Installer Orphan Preclean - 2026-06-13

## Findings

None unresolved.

## Scope Reviewed

- `scripts/run-clerk-core-installer.py:856` adds label-based Docker resource discovery for containers, volumes, and networks owned by a compose project.
- `scripts/run-clerk-core-installer.py:881` removes orphaned project resources without requiring a copied source tree or compose file.
- `scripts/run-clerk-core-installer.py:2287` uses the orphan cleanup fallback when uninstall/preclean sees a selected module but the source tree is not present yet.
- `tests/test_clerk_core_installer_http_helpers.py:39` verifies label cleanup removes discovered containers, volumes, and networks.
- `tests/test_clerk_core_installer_http_helpers.py:70` verifies uninstall/preclean calls orphan cleanup when the CivicClerk source tree is missing.

## Verification

- `python -m pytest tests/test_clerk_core_installer_http_helpers.py` passed: 4 passed.
- `python scripts/verify-installer-plan.py` passed.
- Local missing-source uninstall smoke passed for a CivicClerk-only selected module, returning `source_missing_orphan_cleanup` with `removed_or_absent`.

## Residual Risk

The failing GitHub job must be re-run on the pushed head to prove the self-hosted Linux runner no longer carries a stale `civicsuite-ci-linux-package-lifecycle-clerk` volume into install. This slice fixes the missing-source preclean path that caused the stale volume to survive.
