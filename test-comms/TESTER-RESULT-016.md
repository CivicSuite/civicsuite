# Tester Result 016 - full gate re-run after clerk bearer-mode fix
**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; 16,629,244 KB visible RAM; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz, 6 cores / 12 logical processors.
**Branch head tested:** `0634ce4 test(comms): directive 016 - re-run gate after clerk bearer-mode fix`
**Fix commit included:** `4d1ff90` per Directive 016 branch head.
**Date/time (UTC):** 2026-06-04T04:15:22.4995980Z

## Procedure
Pulled and hard-reset to `origin/stage-3a-baremetal-windows`.

Ran the required clean-stack teardown first:
```text
=== CivicSuite stack teardown ===
removed containers: 11
removed volumes: 9
removed networks: 4
=== teardown complete - stack state cleared; prerequisites preserved ===
```

Confirmed the host is Hyper-V present and used the corrected host facts JSON for the known firmware false-negative:
```text
HypervisorPresent=True
VirtualizationFirmwareEnabled=False
corrected virtualization_firmware_enabled=true
```

The injected host facts also set `is_admin=true` for the self-elevated bootstrap child and `edition=Microsoft Windows 11 Pro`; the first two attempted injections exposed missing/relative fact-field issues before the successful end-to-end run.

## Bootstrap result summary
From `installer/baremetal/windows/logs/civicsuite-baremetal-bootstrap-result.json`:
```json
{
  "status": "passed",
  "stage3_status": "passed",
  "stage4_status": "passed",
  "stage4_evidence_status": "passed",
  "generation_source": "ollama",
  "generation_model": "gemma4:e4b"
}
```

Stage log terminal lines:
```text
2026-06-04T04:03:31.4786090Z [stage0] Stage0 target inspection finished with status passed
2026-06-04T04:04:03.1271026Z [stage1] Stage1 WSL2 feature enablement finished; restart_needed=False
2026-06-04T04:04:19.8825270Z [stage2] Host Ollama rebind to 0.0.0.0: restarted=True firewall=True ready=True
2026-06-04T04:04:20.0244584Z [stage2] Stage2 prerequisite orchestration finished
2026-06-04T04:12:32.3948002Z [stage3] Stage3 warm-first installer handoff status passed
2026-06-04T04:13:35.7776664Z [stage4] Stage4 verification shell status passed
2026-06-04T04:13:35.8698292Z [result] Wrote structured result
```

## starter_set_runtime_workflows
From `installer/reports/stage3a-baremetal/clerk-core-installer-lifecycle.json`:
```json
{
  "auth_contract": "CivicRecords uses first-admin JWT login; CivicClerk uses bearer staff auth.",
  "checks": [
    {
      "checks": [
        {
          "has_access_token": true,
          "name": "admin_login",
          "status_code": 200
        },
        {
          "must_change_password": false,
          "name": "first_admin_rotation_required",
          "status_code": 200
        },
        {
          "name": "create_records_request",
          "request_id_present": true,
          "status": "received",
          "status_code": 201
        },
        {
          "id_matches": true,
          "name": "fetch_records_request",
          "status_code": 200
        },
        {
          "departments_present": true,
          "file_types_present": true,
          "name": "search_records",
          "source_names_present": true,
          "status_code": 200
        },
        {
          "name": "mark_request_searching",
          "status": "searching",
          "status_code": 200
        },
        {
          "name": "submit_request_review",
          "status": "in_review",
          "status_code": 200
        },
        {
          "contains_ai_disclaimer": true,
          "expected_generation_model": "gemma4:e4b",
          "expected_generation_source": "ollama",
          "generation_model": "gemma4:e4b",
          "generation_source": "ollama",
          "human_review_required": true,
          "letter_id_present": true,
          "name": "draft_response_letter",
          "status": "draft",
          "status_code": 201
        },
        {
          "name": "mark_ready_for_release",
          "status": "ready_for_release",
          "status_code": 200
        }
      ],
      "name": "civicrecords_workflow",
      "status": "passed"
    },
    {
      "checks": [
        {
          "mode": "bearer",
          "name": "staff_session",
          "roles": [
            "clerk_admin",
            "meeting_editor"
          ],
          "status_code": 200,
          "token_fingerprint_present": true
        },
        {
          "item_id_present": true,
          "name": "create_agenda_intake",
          "status_code": 201,
          "title_matches": true
        },
        {
          "name": "review_agenda_intake",
          "readiness_status": "READY",
          "status_code": 200
        },
        {
          "agenda_item_id_present": true,
          "name": "promote_agenda_intake",
          "next_step": "Add the agenda item to the target meeting packet assembly.",
          "status_code": 201
        },
        {
          "created_item_listed": true,
          "name": "list_agenda_intake",
          "status_code": 200
        },
        {
          "meeting_body_id_present": true,
          "name": "create_meeting_body",
          "status_code": 201
        },
        {
          "meeting_id_present": true,
          "name": "create_meeting",
          "status_code": 201
        },
        {
          "name": "create_packet_assembly",
          "packet_id_present": true,
          "status_code": 201
        },
        {
          "name": "finalize_packet_assembly",
          "status": "FINALIZED",
          "status_code": 200
        },
        {
          "compliant": true,
          "name": "create_notice_checklist",
          "notice_id_present": true,
          "status_code": 201
        },
        {
          "name": "attach_notice_posting_proof",
          "posting_proof_present": true,
          "status_code": 200
        },
        {
          "motion_id_present": true,
          "name": "capture_motion",
          "status_code": 201
        },
        {
          "name": "capture_vote",
          "status_code": 201,
          "vote_id_present": true
        },
        {
          "human_review_required": false,
          "minute_id_present": true,
          "name": "create_minutes_draft",
          "status_code": 201
        },
        {
          "guardrail_triggered": true,
          "name": "reject_auto_minutes_post",
          "payload": {
            "detail": {
              "fix": "Review, cite-check, and adopt minutes through a human approval workflow before public posting.",
              "message": "AI-drafted minutes cannot be posted automatically."
            }
          },
          "status_code": 409
        },
        {
          "archive_id_present": true,
          "name": "publish_public_archive_record",
          "status_code": 201
        },
        {
          "archive_record_listed": true,
          "name": "public_meeting_calendar",
          "status_code": 200
        },
        {
          "archive_record_found": true,
          "name": "public_archive_search",
          "status_code": 200,
          "total_count": 1
        }
      ],
      "name": "civicclerk_bearer_workflow",
      "status": "passed"
    },
    {
      "checks": [
        {
          "name": "health",
          "payload": {
            "civiccore": "1.2.0",
            "service": "civiccode",
            "status": "ok",
            "version": "1.0.8"
          },
          "status_code": 200
        },
        {
          "name": "seeded_section_lookup",
          "status_code": 200
        },
        {
          "name": "forged_staff_header_boundary",
          "payload": {
            "detail": {
              "fix": "Route CivicCode staff endpoint access requests through a reverse proxy inside CIVICCODE_STAFF_TRUSTED_PROXY_CIDRS and strip client-supplied copies of X-CivicCode-Actor and X-CivicCode-Role before they reach CivicCode.",
              "message": "Trusted staff headers were not received from an approved proxy."
            }
          },
          "status_code": 403
        }
      ],
      "name": "civiccode_workflow",
      "status": "passed"
    },
    {
      "checks": [
        {
          "id_present": true,
          "name": "clerk_create_meeting",
          "status_code": 201
        },
        {
          "id_present": true,
          "name": "clerk_capture_adoption_motion",
          "status_code": 201
        },
        {
          "civiccode_event_id_present": true,
          "handoff_last_error": null,
          "handoff_status": "EMIT_DELIVERED",
          "name": "clerk_emits_to_code",
          "status_code": 201
        },
        {
          "name": "code_pending_warning_visible",
          "status_code": 200,
          "target_warning_visible": true,
          "warning_count": 2
        },
        {
          "name": "code_create_codified_version",
          "status_code": 201,
          "version_id": "version_city_core_handoff_1780546414"
        },
        {
          "handoff_state": "codified",
          "name": "code_resolve_handoff",
          "status_code": 200
        },
        {
          "body_contains_eight_chickens": true,
          "name": "code_lookup_after_resolution",
          "status_code": 200,
          "target_warning_cleared": true,
          "warning_count": 1
        },
        {
          "answer_mentions_eight": true,
          "citation_count": 1,
          "matched_section_number": "13.40.020",
          "name": "code_qa_after_handoff",
          "status": "ok",
          "status_code": 200
        }
      ],
      "name": "clerk_to_code_handoff",
      "status": "passed"
    }
  ],
  "name": "starter_set_runtime_workflows",
  "selected_modules": [
    "civicrecords-ai",
    "civicclerk",
    "civiccode"
  ],
  "status": "passed"
}
```

## Gate verdicts
Records letter gate: PASS. `draft_response_letter` returned `generation_source=ollama`, `generation_model=gemma4:e4b`, `status_code=201`.

Clerk bearer workflow: PASS. `staff_session` returned `status_code=200` with `mode=bearer`.

Clerk-to-Code handoff: PASS. `clerk_emits_to_code` returned `handoff_status=EMIT_DELIVERED`, and downstream code resolution/QA checks passed.

Overall bootstrapper status: PASS.
