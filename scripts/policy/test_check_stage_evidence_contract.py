from __future__ import annotations

"""Contract tests for durable stage evidence enforcement."""

from pathlib import Path

from check_stage_evidence import evaluate


def test_non_stage_branch_is_not_subject_to_stage_evidence(tmp_path: Path) -> None:
    assert evaluate("main", tmp_path) == []


def test_stage_branch_requires_ledger_and_audit_lite_report(tmp_path: Path) -> None:
    findings = evaluate("stage-1-live-gate-policy-harness-2026-05-30", tmp_path)

    assert findings == [
        f"missing stage ledger: {tmp_path / 'docs/process/stages/stage-1-live-gate-policy-harness-2026-05-30.md'}",
        "missing tracked audit-lite report for stage 1: docs/process/audits/audit-lite-stage-1-*.md",
    ]
