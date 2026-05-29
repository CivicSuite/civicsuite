from __future__ import annotations

"""Contract tests for audit authority wording in release evidence."""

from pathlib import Path

from check_audit_gate_authority import scan_audited_claims


def test_audited_claim_requires_independent_audit_team_evidence_path(
    tmp_path: Path,
) -> None:
    evidence = tmp_path / "verification-report.md"
    evidence.write_text(
        "The city-core bundle is audited by Codex audit-full only.\n",
        encoding="utf-8",
    )

    findings = scan_audited_claims([evidence])

    assert findings == [
        {
            "path": str(evidence),
            "line": 1,
            "message": (
                "Use of 'audited' requires an independent audit-team-claude "
                "evidence path."
            ),
        }
    ]
