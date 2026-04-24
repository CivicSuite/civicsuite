# CivicSuite — Project Workspace

This is the working folder for the CivicSuite AI suite project. Point a new Claude Code (Cowork) session at this folder, then paste the contents of `CHARTER.md` as the first message.

## Quick start

1. Open Cowork (or Claude Code) and start a new session.
2. Select this folder (`C:\Users\scott\OneDrive\Desktop\Claude\CivicSuite`) as the workspace.
3. Open `CHARTER.md`, copy the entire contents, paste as your first message.
4. The new Claude will read the charter, the consistency table, and the four specs, then report back with its plan, questions, and access requests before doing anything.

## What's here

```
CivicSuite/
├── README.md            ← you are here
├── CHARTER.md           ← paste this as the first message to a new Claude session
├── CONSISTENCY.md       ← audit table of every cross-reference and count (the truth-source)
└── specs/
    ├── 01_catalog.md       ← suite-wide product strategy (26 modules, 7 tiers)
    ├── 02_CivicCore.md     ← non-breaking refactor plan (start here for engineering)
    ├── 03_civicclerk.md    ← first Tier 1 module to build
    └── 04_civiczone.md     ← Tier 2 reference module
```

Filenames are kept short because the workspace folder lives on OneDrive and the bash tooling has trouble with longer names. Filenames map to module identity, not to formal spec titles — see CONSISTENCY.md for the canonical title of each spec.

## Where related projects live

- **civicrecords-ai** (sibling folder) — the existing Module 1 codebase the new Claude will need to mount. The CivicCore extraction starts there.
- All work for the new repos (`civicsuite/`, `civiccore/`, `civicclerk/`) will land here as siblings unless you redirect.

## What lives outside this folder

- The GitHub org and repos — created during Day 1–2 by the new Claude.
- Anything secret (credentials, deployment keys) — never committed; configured per environment.

## Cleanup note

There may be a few zero-byte files from filesystem testing during workspace setup (`02_test.md`, `99_test.md`, `bash-test.md`, `short.md`, `.placeholder`). Safe to delete from File Explorer when convenient. They are not referenced by any other file.
