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
    assert 'Where-Object { $_.DisplayName -like "*Townlight*" }' in workflow
    assert "Launch the installed Townlight application" in workflow
    assert "Installed Townlight application launched and remained running" in workflow
    assert "Repair the installed Townlight MSI" in workflow
    assert 'Start-Process msiexec.exe -ArgumentList @("/fa"' in workflow
    assert 'Join-Path $env:LOCALAPPDATA "CivicSuite\\workflows\\city-work.json"' in workflow
    assert workflow.count('-replace "`r`n?", "`n"') >= 1


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
    assert '-replace "`r`n?", "`n"' in workflow
    assert "civicsuite-windows-local-msi -D" not in workflow


def test_signing_comments_do_not_repeat_the_false_subscription_claim() -> None:
    workflow = _read(BUILD_WORKFLOW)

    assert "has no subscription" not in workflow
    assert "no subscription to federate" not in workflow
    assert "future OIDC migration" in workflow


def test_public_product_name_changes_without_replacing_installer_identity() -> None:
    workflow = _read(BUILD_WORKFLOW)
    tauri_config = _read(ROOT / "desktop" / "src-tauri" / "tauri.conf.json")

    assert '"productName": "Townlight"' in tauri_config
    assert '"publisher": "Townlight"' in tauri_config
    assert '"identifier": "org.civicsuite.desktop"' in tauri_config
    assert '"upgradeCode": "a63fc1d3-5437-5f55-89a2-fef93fb1f930"' in tauri_config
    assert "Townlight Windows Local MSI build evidence" in workflow
    assert "UpgradeCode=a63fc1d3-5437-5f55-89a2-fef93fb1f930" in workflow
