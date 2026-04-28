# Local Demo Deployment Profile

Status: evaluation profile, not production packaging  
Stack target: CivicRecords AI + CivicClerk + CivicCode + CivicZone  
Default network posture: local-first, no cloud LLM requirement

## What This Profile Is

This profile gives a city evaluator or developer one bounded way to run the first post-foundation stack:

- CivicRecords AI for records intake/search workflows.
- CivicClerk for agenda, meeting, packet, notice, vote, minutes, archive, and staff workflow foundations.
- CivicCode for municipal-code lookup, citations, plain-language summaries, and clerk handoff foundations.
- CivicZone for parcel/zoning lookup, rule prechecks, cited sample Q&A, and planner escalation foundations.
- PostgreSQL 17 with pgvector for CivicRecords AI.
- Redis 7.2 for CivicRecords AI background-work dependencies.
- Optional Ollama for local LLM experiments.

It intentionally does not claim production deployment readiness. Production pilot packaging still needs environment hardening, secrets handling, backup/restore guidance, reverse proxy guidance, TLS, auth/RBAC policy, and operator runbooks.

## Files

- Compose profile: `deploy/post-foundation-demo.compose.yml`
- Verifier: `scripts/verify-deployment-profile.py`
- This operator guide: `docs/deployment/local-demo-profile.md`

## Ports

| Service | URL | Purpose |
|---|---|---|
| CivicRecords AI frontend | `http://localhost:8080` | Records AI browser UI |
| CivicRecords AI API | `http://localhost:8000/health` | Records AI API health |
| CivicClerk | `http://localhost:8010/health` | CivicClerk module API health |
| CivicCode | `http://localhost:8020/health` | CivicCode module API health |
| CivicZone | `http://localhost:8030/health` | CivicZone module API health |

## Prerequisites

- Docker Desktop with Compose v2.
- Local sibling clones at:
  - `../civicrecords-ai`
  - `../civicclerk`
  - `../civiccode`
  - `../civiczone`
- CivicRecords AI `.env` file in `../civicrecords-ai/.env`.
- Internet access during first image/wheel download.
- Optional: Ollama model already pulled if testing LLM-backed behavior.

## Start The Demo Stack

From the umbrella repo:

```bash
docker compose -f deploy/post-foundation-demo.compose.yml up --build
```

To include the Ollama container:

```bash
docker compose -f deploy/post-foundation-demo.compose.yml --profile llm up --build
```

## Verify The Profile

Static/profile verification:

```bash
python scripts/verify-deployment-profile.py
```

This checks that:

- The compose file exists and parses through Docker Compose when available.
- The expected services are present.
- Published module wheel URLs are pinned to the compatibility matrix versions.
- Module services set `CIVICCORE_LLM_PROVIDER=ollama`.
- No cloud LLM provider is configured by default.
- Local no-network smoke checks can import CivicClerk, CivicCode, and CivicZone and call their `/health` endpoints in process.

## No-Network Meaning

The default local deployment profile must not require outbound runtime calls for core behavior. In this profile:

- CivicClerk, CivicCode, and CivicZone expose deterministic foundation APIs that can be smoke-tested in process without network calls.
- CivicRecords AI uses local PostgreSQL, Redis, and optional Ollama.
- Cloud LLM providers are not configured by default.
- The compose profile may need internet access to download images or release wheels before the stack is cached locally.

## Operator Modes

### Developer Install

Use this when changing code or validating compatibility. Run local repo test gates and the suite verifier:

```bash
python scripts/verify-suite-state.py
python scripts/verify-deployment-profile.py
```

### Clerk/Staff Evaluation Install

Use this when a city staff evaluator wants to click through the current foundation surfaces:

```bash
docker compose -f deploy/post-foundation-demo.compose.yml up --build
```

Then open:

- `http://localhost:8080`
- `http://localhost:8010/staff`
- `http://localhost:8020/civiccode`
- `http://localhost:8030/civiczone`

### Production Pilot Install

Do not treat this compose file as production pilot packaging. A production pilot needs:

- Managed secrets.
- TLS/reverse proxy.
- Backup/restore.
- Role and user administration.
- Monitoring/log retention.
- Module-specific records retention rules.
- Written city approval for any external provider integration.
