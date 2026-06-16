# TESTER-RESULT-080

Final verdict: FAIL

Tested repo channel branch: `stage-3a-baremetal-windows`
Tested repo channel commit: `0a2fea0a717ad4bd98613384f1de765a2be506e5` (`Add tester directive 080`)
PR #192 head SHA tested: `86dfed6308638f6450bae269095132a2ee729f6f`

I read `TESTER-RESULT-079.md`, `TESTER-DIRECTIVE-079.md`, and `TESTER-DIRECTIVE-067.md` before this run. I followed the directive communication contract: repo `CivicSuite/civicsuite`, branch `stage-3a-baremetal-windows`, folder `test-comms`, result file `test-comms/TESTER-RESULT-080.md`. I did not use an old bridge folder, OneDrive path, alternate branch, chat-only result, Docker, WSL, repo-local bootstrap scripts, or Windows reboot/restart.

## Continuity and artifact truth

Reused the successful installed state from `TESTER-RESULT-079` as requested. I did not re-download or reinstall the MSI before the workflow checks. Therefore no new MSI/evidence SHA-256 verification was required in this directive run.

Starting state evidence:

- App path: `C:\Program Files\CivicSuite\civicsuite-desktop.exe`
- Launched as the normal interactive user, not elevated.
- Local-admin sign-in survived after I set a known local-admin passcode through the product UI and signed back in.
- Evidence folder: `directive080-evidence`
- Baseline runtime evidence: `directive080-evidence\baseline-runtime.json`

## System Health baseline

PASS for baseline health and model/runtime readiness.

- System Health UI showed the local model status `Ready`.
- Final model remained at `C:\Users\insty\AppData\Local\CivicSuite\Data\models\gemma-4-12b-it-qat-q4_0.gguf`.
- `http://127.0.0.1:15480/health` returned `status: ok`.
- Modules reported OK: `civiccore`, `civicrecords-ai`, `civicclerk`, `civiccode`.
- `http://127.0.0.1:15434/api/tags` listed `civicsuite-gemma4-12b-qat:q4_0`.
- CivicSuite-managed Ollama was running from `C:\Users\insty\AppData\Local\CivicSuite\runtime\ollama\ollama.exe`.
- A separate user-global Ollama process also remained at `C:\Users\insty\AppData\Local\Programs\Ollama\ollama.exe serve`; it was recorded separately and was not the CivicSuite-managed runtime evidence.

## Local Users and RBAC

FAIL.

Through Settings I entered a new clerk staff user and clicked `Create Staff User`. The click did not fail at the harness layer, but staff sign-in failed afterward:

- Staff email used: `clerk.dir080-202606161642@teston.local`
- Staff sign-in result: `No active local user matched that email. Check the email and local passcode, then try again.`
- Evidence: `directive080-evidence\080-settings-staff-created.txt`, `directive080-evidence\080-rbac-staff-signin.txt`, `directive080-evidence\rbac-summary.json`

Because the staff user was not actually active/sign-in capable, non-admin RBAC gating could not be proven.

## CivicClerk workflow

FAIL.

I used the Meetings & Notices UI with DIR080 data. The app persisted an agenda intake, but the required meeting workflow did not complete or persist.

Persisted state from `C:\Users\insty\AppData\Local\CivicSuite\Data\workflows\city-work.json`:

- `meeting_bodies`: empty
- `meeting_members`: empty
- `meetings`: empty
- `agenda_intakes`: one saved item, `Traffic calming intake DIR080-202606161642`, status `submitted`
- `reviewed_at_unix_seconds`: `null`
- `promoted_at_unix_seconds`: `null`

UI/product failures:

- `Save Member` timed out because the expected action was not clickable/reachable after data entry.
- `Promote To Agenda` timed out.
- `Create Meeting` timed out.
- Post-reopen Clerk screen still showed `No agenda item available` and `No roster member available`.
- Notice, minutes, votes, quorum, adopted minutes, public archive, and Clerk-to-Code handoff could not be proven because no durable meeting/agenda/roster existed.

Evidence: `directive080-evidence\080-clerk-*.txt`, `directive080-evidence\080-post-reopen-clerk.txt`, `directive080-evidence\city-work-after-workflows.json`.

## CivicRecords AI workflow

FAIL.

I created a records request through the Records Requests UI. Partial state persisted, but the required draft/approval/release/export/fulfillment lifecycle did not persist.

Persisted state:

- `records_requests[0].public_tracking_number`: `REQ-0001`
- requester: `Resident DIR080-202606161642`
- status after all attempted actions: `searching`
- `search_notes`: contains one note
- `search_sessions`: empty
- `documents`: empty
- `response_draft`: empty
- `approval_notes`: empty
- `release_packages`: empty
- `exports`: empty
- `approved_at_unix_seconds`: `null`
- `fulfilled_at_unix_seconds`: `null`
- `closed_at_unix_seconds`: `null`

The request persisted after close/reopen, but only as an early searching-state record.

Evidence: `directive080-evidence\080-records-*.txt`, `directive080-evidence\080-post-reopen-records.txt`, `directive080-evidence\city-work-after-workflows.json`.

## Resident/public records request workflow

FAIL.

The Resident/Public surface was visible, but I did not find a working public intake flow that created a public records request. The staff-created request had a public tracking number and public-safe status text, but the directive required public/resident submission and staff/admin visibility from that public intake.

Evidence: `directive080-evidence\080-resident-surface.txt`.

## CivicCode workflow

FAIL.

I used the Code & Ordinances UI with DIR080 source/guidance data. The UI accepted some clicks, but the local workflow store did not persist a code source, handoff, adopted legislation, or guidance result.

Persisted state:

- `code_sources`: empty
- `code_handoffs`: empty
- `adopted_legislation`: empty
- Code audit entry only recorded `answer-code-question` with `0 cited result(s): noise`

Post-reopen Code evidence showed no durable imported source/publication/handoff created from `Noise Ordinance DIR080-202606161642`.

Evidence: `directive080-evidence\080-code-*.txt`, `directive080-evidence\080-post-reopen-code.txt`, `directive080-evidence\city-work-after-workflows.json`.

## Cross-module search and handoffs

FAIL.

Search City Knowledge found the persisted agenda intake and records request after close/reopen, with module labels and citations. However, because Clerk meetings, Code sources, and handoffs did not persist, required Clerk-to-Code, Code-to-Clerk, Records-to-Clerk, or Records-to-Code handoff state could not be proven.

Evidence: `directive080-evidence\080-search-dir080.txt`, `directive080-evidence\080-post-reopen-search.txt`.

## Close/reopen persistence

PARTIAL.

After closing and relaunching `civicsuite-desktop.exe` as the normal user:

- Admin sign-in/setup state was recoverable.
- System Health/model/runtime remained ready.
- The agenda intake and records request persisted.
- Required meeting, code source, handoff, draft/approval/export, and staff user records did not persist because they were not durably created.

Evidence: `directive080-evidence\post-reopen-system.json`, `directive080-evidence\080-post-reopen-*.txt`.

## Backup/restore

FAIL.

Clicked `Backup Now` from System Health. I did not find a fresh backup folder or manifest created under `C:\Users\insty\Documents\CivicSuite Backups` for this directive run. The only recent tree discovered was the earlier support-bundles folder from directive 079. Because a fresh backup was not produced, I did not proceed to mutate/restore or destructive uninstall/reinstall/restore.

Evidence: `directive080-evidence\080-backup-now.txt`, `directive080-evidence\post-reopen-system.json`.

## Support bundle

FAIL for this directive run.

Clicked `Create Support Bundle`, but no fresh support bundle appeared in the backup folder after the click. The only support bundle present remained:

`C:\Users\insty\Documents\CivicSuite Backups\support-bundles\civicsuite-support-bundle-1781626914-20632\`

That bundle was created during directive 079, not newly created during directive 080.

Evidence: `directive080-evidence\080-support-bundle.txt`, `directive080-evidence\post-reopen-system.json`.

## Repair

INCONCLUSIVE / FAIL for directive requirement.

Clicked a `Repair` control from System Health. The app remained alive and services stayed healthy, but I did not observe a fresh review/confirmation panel or a plain-English repair result proving the repair lifecycle required by directive 080.

Evidence: `directive080-evidence\080-repair-first.txt`.

## Uninstall, reinstall, restore

NOT EXECUTED after product failure.

The directive requires a final backup before uninstall and restore. Because `Backup Now` did not create a fresh backup/manifest and the core workflows had already failed, I did not perform destructive uninstall/reinstall/restore. Proceeding would have risked destroying the useful directive 079/080 installed state without the product-provided final backup prerequisite.

## Final failure summary

This run fails directive 080 because the healthy model/runtime baseline did not translate into durable city-core product workflows:

- Staff user creation did not produce an active sign-in-capable staff user.
- Clerk meeting body/member/meeting/agenda promotion/minutes/votes/archive/handoff did not durably persist.
- Records request persisted only in early `searching` state; draft/approval/package/export/fulfilled/closed did not persist.
- Public resident intake was not proven.
- Code source/guidance/handoff did not durably persist.
- Cross-module search only found the limited persisted intake/request data; required handoffs were absent.
- Backup Now did not create a fresh backup manifest/folder.
- Create Support Bundle did not create a fresh directive 080 bundle.
- Repair did not show the required review/status lifecycle.
- Uninstall/reinstall/restore was not executed because the product did not produce the required final backup and the gate had already failed.

Windows was not rebooted or restarted during this directive.
