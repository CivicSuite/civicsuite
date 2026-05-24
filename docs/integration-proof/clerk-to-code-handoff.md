# CivicClerk to CivicCode Handoff Proof

Date: 2026-05-24

Scope: CivicSuite city-core Item 4(d), installed-stack proof for the live CivicClerk adopted-ordinance handoff into CivicCode intake.

## Participating Artifacts

- Umbrella PR: CivicSuite/civicsuite#175
- PR head SHA: `3c67f45ad601fde573a91822f933c93d894f5089`
- Merged main SHA: `ecf6e8e7c69b312ef0363f6e720549e3136e39c6`
- GitHub Actions run: `26353960300`
- Linux city-core lifecycle job: `77577184981`
- Installer profile: `city-core`
- Installed modules: `civicrecords-ai`, `civicclerk`, `civiccode`
- Expected package versions: CivicCore `1.2.0`, CivicRecords AI `1.7.2`, CivicClerk `1.0.3`, CivicCode `1.0.8`

## Installed-Stack Evidence

The Linux city-core lifecycle ran from the packaged installer artifact:

```text
installer/dist/CivicSuite-city-core-linux-0.1.0.tar.gz
```

The lifecycle result was `success`, with matching-host install, repair, verify, backup, restore, and uninstall evidence.

## Handoff Transport

The installer created a shared Docker network for the city-core handoff path and removed it on uninstall:

```text
ensure_shared_handoff_network: returncode 0
remove_shared_handoff_network: returncode 0
network: civicsuite-ci-city-core-linux-package-lifecycle-citycore
```

CivicClerk emitted to CivicCode through the configured service URL and shared secret, not through a mock.

## Workflow Proof

The installer workflow proof exercised this live path:

```text
CivicClerk meeting created: status_code 201
CivicClerk adoption motion captured: status_code 201
CivicClerk emitted to CivicCode: handoff_status EMIT_DELIVERED, civiccode_event_id_present true
CivicCode pending warning visible for ordinance 2026-041: target_warning_visible true
CivicCode codified section version created: status_code 201
CivicCode handoff resolved: handoff_state codified
CivicCode lookup after resolution: body_contains_eight_chickens true, target_warning_cleared true
CivicCode Q&A after handoff: status ok, matched_section_number 13.40.020, citation_count 1, answer_mentions_eight true
```

The workflow was recorded by the `clerk_to_code_handoff` check:

```json
{
  "name": "clerk_to_code_handoff",
  "status": "passed",
  "checks": [
    {"name": "clerk_create_meeting", "status_code": 201, "id_present": true},
    {"name": "clerk_capture_adoption_motion", "status_code": 201, "id_present": true},
    {"name": "clerk_emits_to_code", "status_code": 201, "handoff_status": "EMIT_DELIVERED", "handoff_last_error": null, "civiccode_event_id_present": true},
    {"name": "code_pending_warning_visible", "status_code": 200, "target_warning_visible": true, "warning_count": 2},
    {"name": "code_create_codified_version", "status_code": 201, "version_id": "version_city_core_handoff_1779604320"},
    {"name": "code_resolve_handoff", "status_code": 200, "handoff_state": "codified"},
    {"name": "code_lookup_after_resolution", "status_code": 200, "target_warning_cleared": true, "body_contains_eight_chickens": true, "warning_count": 1},
    {"name": "code_qa_after_handoff", "status_code": 200, "status": "ok", "matched_section_number": "13.40.020", "citation_count": 1, "answer_mentions_eight": true}
  ]
}
```

The remaining warning after resolution is an unrelated seeded CivicCode warning for ordinance `192002`; the proof asserts that the target ordinance `2026-041` warning appeared before codification and cleared after the handoff was resolved.

## Backup And Restore Evidence

The same lifecycle job also proved backup and restore probes for all selected city-core data stores:

```text
civicrecords-ai postgres_backup_dump: returncode 0
civicclerk postgres_backup_dump: returncode 0
civiccode postgres_backup_dump: returncode 0
civicrecords-ai restore_probe_pg_restore: returncode 0
civicclerk restore_probe_pg_restore: returncode 0
civiccode restore_probe_pg_restore: returncode 0
```

## Caveats

- This proof covers Item 4(d), the CivicClerk adopted-ordinance to CivicCode intake handoff.
- The broader Item 4 flow set still requires separate durable docs for CivicRecords AI, CivicClerk, CivicCode Longmont Q&A, shared auth, and workflow-specific backup/restore survival.
- This document is evidence from the installed city-core package lifecycle. It is not an independent audit sign-off.
