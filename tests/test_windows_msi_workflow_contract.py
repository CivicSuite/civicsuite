# SPDX-License-Identifier: Apache-2.0
# Copyright (c) The CivicSuite Authors
"""Fail-closed contracts for Windows MSI validation and publication."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BUILD_WORKFLOW = ROOT / ".github" / "workflows" / "desktop-windows-msi.yml"
RELEASE_WORKFLOW = ROOT / ".github" / "workflows" / "release-windows-msi.yml"


def _read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def test_routine_ci_builds_a_visibly_unsigned_private_artifact() -> None:
    workflow = _read(BUILD_WORKFLOW)

    assert "sign_for_publication:" in workflow
    assert 'type: boolean' in workflow
    assert "default: false" in workflow
    assert "civicsuite-windows-local-msi-UNSIGNED" in workflow
    assert '"signature_state=UNSIGNED"' in workflow
    assert '"$($msi.BaseName)-UNSIGNED$($msi.Extension)"' in workflow
    assert '$signature.Status -ne "NotSigned"' in workflow
    assert '"false"' in workflow


def test_signing_is_an_explicit_manual_publication_gate() -> None:
    workflow = _read(BUILD_WORKFLOW)
    gate = (
        "github.event_name == 'workflow_dispatch' && "
        "inputs.sign_for_publication"
    )

    assert workflow.count(gate) >= 5
    assert '"${{ github.ref }}" -ne "refs/heads/main"' in workflow
    assert "civicsuite-windows-local-msi-SIGNED" in workflow
    assert "azure/artifact-signing-action@v2" in workflow
    assert "CN=Scott Converse" in workflow
    assert "TimeStamperCertificate" in workflow
    assert "PublicationAllowed=$publicationAllowed" in workflow


def test_lifecycle_consumes_and_verifies_the_same_classified_artifact() -> None:
    workflow = _read(BUILD_WORKFLOW)

    assert "name: ${{ needs.windows-local-msi.outputs.artifact_name }}" in workflow
    assert "EXPECTED_SIGNATURE_STATE:" in workflow
    assert "Unsigned CI MSI filename is not visibly marked UNSIGNED" in workflow
    assert "Evidence does not classify the MSI as UNSIGNED" in workflow
    assert "Signed lifecycle lane received an unexpected signer" in workflow


def test_release_accepts_only_a_signed_artifact_for_the_tag_commit() -> None:
    workflow = _read(RELEASE_WORKFLOW)

    assert "actions: read" in workflow
    assert "--event workflow_dispatch" in workflow
    assert "--branch main" in workflow
    assert "$_.headSha -eq $tagSha" in workflow
    assert workflow.count("civicsuite-windows-local-msi-SIGNED") >= 2
    assert "Get-AuthenticodeSignature" in workflow
    assert "CN=Scott Converse" in workflow
    assert "signtool.FullName verify /pa /v" in workflow
    assert "SignatureState=Valid" in workflow
    assert "PublicationAllowed=true" in workflow
    assert "civicsuite-windows-local-msi -D" not in workflow
