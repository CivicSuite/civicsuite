# TESTER-RESULT-082

Verdict: FAIL

Branch tested: `stage-3a-baremetal-windows`

Directive commit tested: `b639704fa33e919ac4ca4287c4caacdc3f6f1317`

MSI PR head tested: `682a2fa51f76dbbd077e541b573efa0a15c04531`

Live remote check: `git ls-remote origin refs/heads/stage-3a-baremetal-windows` returned `b639704fa33e919ac4ca4287c4caacdc3f6f1317`; after `git fetch origin stage-3a-baremetal-windows --prune`, `.git/FETCH_HEAD` also named `b639704fa33e919ac4ca4287c4caacdc3f6f1317`.

## Artifact and install

- MSI: `CivicSuite_0.1.0_x64_en-US.msi`
- Expected MSI SHA-256: `0bbebc0df6066bf52440e6750e70215d403909d75a9839a4d5e987047df0d665`
- Actual MSI SHA-256: `0bbebc0df6066bf52440e6750e70215d403909d75a9839a4d5e987047df0d665`
- Expected MSI bytes: `1639715472`
- Actual MSI bytes: `1639715472`
- Evidence SHA-256 verified: `a6623782d197751fe9a19a50e718f26b4de31fc088c9abc9131dbb6d3bfdc102`
- Evidence bytes verified: `548`
- MSI install exit code: `0`
- Previous product code: `{0639287B-3D1C-4BAB-B2AA-E79DEC08B0AE}`
- Installed product code: `{E1179D1F-8F20-4761-82E5-AFF39D796242}`
- Installed executable: `C:\Program Files\CivicSuite\civicsuite-desktop.exe`

## Runtime/model readiness

PASS.

- Health endpoint stayed `ok` after install and after close/reopen.
- Modules: `civiccore:True:1.2.0`, `civicrecords-ai:True:unknown`, `civicclerk:True:1.0.4`, `civiccode:True:1.0.8`.
- Local model tag present after reopen: `civicsuite-gemma4-12b-qat:q4_0`.
- CivicSuite-managed Ollama runtime was present under `C:\Users\insty\AppData\Local\CivicSuite\runtime\ollama\ollama.exe`.
- A separate user-global Ollama was also present at `C:\Users\insty\AppData\Local\Programs\Ollama\ollama.exe`.

## Staff sign-in/RBAC

PASS/PARTIAL.

- Created `Clerk Staff DIR082-20260616220939` with passcode `Staff082Pass!`.
- Corrected sign-in with email `clerk.dir082-20260616220939@teston.local` and that passcode succeeded.
- Settings while signed in as staff displayed: `Signed in as Clerk Staff DIR082-20260616220939`, role `city-staff`, and `Sign out and use a local administrator account before changing setup, users, modules, backups, restore, repair, or runtime services.`
- Admin sign-in with `admin079@teston.local` / `Admin080!` succeeded afterward.

## Guided review panels

PASS for visibility/confirm controls.

Observed review panels near the top and clicked visible `Confirm ...` buttons for examples including:

- `Confirm Save Meeting Body`
- `Confirm Save Member`
- `Confirm Review Agenda Intake`
- `Confirm Adopt Minutes`
- `Confirm Sign Minutes`
- `Confirm Record Adoption`
- `Confirm Archive Public Record`
- `Confirm Save Search Session`
- `Confirm Import Source`
- `Confirm Publish Source`
- `Confirm Approve Guidance`
- `Confirm Create Clerk Handoff`
- `Confirm Backup Now`
- `Confirm Create Support Bundle`
- `Confirm Repair`
- `Confirm Restore Latest Backup`
- `Confirm Prepare Uninstall`

## Close/reopen durable counts

After close/reopen:

- meeting bodies: `2`
- meeting members: `2`
- meetings: `2`
- agenda intakes: `5`
- records requests: `4`
- code sources: `1`
- code handoffs: `1`
- adopted legislation: `0`
- publications: `1`
- audit entries: `65`

## Clerk workflow

FAIL.

The UI accepted and confirmed Clerk actions through adoption/archive review panels, including `Confirm Record Adoption` and `Confirm Archive Public Record`, but durable `adopted_legislation` count after close/reopen remained `0`.

Repro sequence:

1. Staff surface > Meetings & Notices.
2. Save meeting body and member with visible confirm panels.
3. Create/review agenda, create meeting, add agenda item, calculate/approve/post notice.
4. Save staff report, attach packet reference, finalize packet, save minutes, record motion/vote/attendance/action item/resident comment.
5. Click `Adopt Minutes`, `Sign Minutes`, `Record Adopted Ordinance/Resolution`, and `Archive Public Record`, confirming each visible panel.
6. Close and reopen CivicSuite.
7. Read `Data\workflows\city-work.json`: `adopted_legislation` is still `0`.

Additional evidence: the Clerk test marker `DIR082C-20260616224405` persisted in meeting body/member/meeting/agenda/minutes/action/comment data, so this is not a blanket persistence failure. The missing durable adopted-legislation record is specific and reproducible.

## Records workflow

PASS/PARTIAL.

Records request data persisted, including typed unreadable references and marker-file evidence.

Evidence after close/reopen:

- `records_requests` count advanced to `4`.
- Test marker `DIR082RC-20260616224710` persisted.
- Readable document stored from `directive082-evidence\readable-DIR082RC-20260616224710.txt`.
- Unreadable typed reference `Z:\CivicSuite\Missing\records-DIR082RC-20260616224710.pdf` produced durable product evidence:
  - `Data\files\records\req-0001\unreadable-typed-marker-dir082rc-20260616224710-1781650102-reference.txt`
  - release marker `Data\files\records\req-0001\release\unreadable-typed-marker-dir082rc-20260616224710-1781650110-reference.txt`
- Release/export actions produced files under `Data\exports\records`.

Concern: some Records actions targeted the currently selected older request `Resident DIR080-202606161642` in review panels, even while the new DIR082RC data persisted. I am not marking the full Records path as an overall pass because the selector/current-record behavior is still ambiguous.

## Resident/Public workflow

PARTIAL.

- Public surface showed meeting-publication state and publication count after reopen was `1`.
- Staff-side resident comment `Resident comment DIR082C-20260616224405` persisted.
- I did not prove a fresh public-submitted intake end to end because no posted public meeting was open for comment on the Resident/Public surface during the test.

## Code workflow

PASS/PARTIAL.

Code source and handoff counts advanced and persisted after close/reopen:

- `code_sources`: `1`
- `code_handoffs`: `1`

Typed unreadable reference `Z:\CivicSuite\Missing\code-DIR082RC-20260616224710.pdf` produced durable product evidence:

- `Data\files\code\ord-dir082rc-20260616224710\noise-ordinance-dir082rc-20260616224710-1781650160-reference.txt`

The UI also generated/published a code export:

- `Data\exports\code\noise-ordinance-dir082rc-20260616224710-1781650164.md`

## Backup

FAIL.

The Backup Now review panel explicitly said it would create a backup manifest, and I clicked `Confirm Backup Now`.

Fresh backup directory:

`C:\Users\insty\Documents\CivicSuite Backups\civicsuite-manual-backup-1781650214-23172`

Observed:

- `README.txt` exists.
- City data, config, exports, model files, file marker evidence, and `Data\workflows\city-work.json` exist.
- `backup-manifest.json` does not exist at the backup root.

Post-reopen manifest check:

- `latestBackupManifest: false`
- `latestBackupReadme: true`

## Support bundle

FAIL.

The Create Support Bundle review panel explicitly said it would create `support-manifest.json`, and I clicked `Confirm Create Support Bundle`.

No fresh support bundle was created. The newest support bundle remained:

`C:\Users\insty\Documents\CivicSuite Backups\support-bundles\civicsuite-support-bundle-1781626914-20632`

That bundle is from the earlier test window, not directive 082. Post-reopen support observation:

- `latestSupportTime: 2026-06-16T10:21:54.3497682-06:00`
- `latestSupportManifest: true`, but only for the old bundle.

## Repair/uninstall/reinstall/restore

FAIL/PARTIAL.

- Repair review panel appeared for `Local data store`; I clicked `Confirm Repair`.
- Restore review panel appeared and named `backup-manifest.json`; I clicked `Confirm Restore Latest Backup`.
- Prepare Uninstall review panel appeared and named a final uninstall backup manifest; I clicked `Confirm Prepare Uninstall`.
- I did not proceed to full Windows uninstall/reinstall/restore because the product had already failed hard on durable adopted legislation and fresh manifest/support-bundle creation. Continuing to destructive uninstall would not convert this build to PASS and risked losing the failure state needed for diagnosis.

## Failure summary

The build improves Records and Code typed-reference persistence, but still fails directive 082 because:

1. Clerk `Record Adopted Ordinance/Resolution` was confirmed in the UI, yet `adopted_legislation` stayed `0` after close/reopen.
2. Backup Now created a fresh backup folder and README, but no `backup-manifest.json`.
3. Create Support Bundle confirmed in the UI, but no fresh support bundle was created.
4. Full uninstall/reinstall/restore was not completed because the required product-created backup/support evidence was already invalid.
