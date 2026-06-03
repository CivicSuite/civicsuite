# FINDING — CivicClerk hard-fails to boot without the AI (Ollama)

**Severity:** Major — **release-blocking for city-core** (director-flagged 2026-06-03).
**Owner:** CivicClerk module repo (`CivicSuite/civicclerk`) — module-level fix, not the bare-metal installer.
**Found by:** Auditor (Claude), incidentally while debugging the Stage 3A installer's host-Ollama topology. Should have been caught in the city-core review — recorded as an audit miss.

## What
CivicClerk's `docker-compose.yml` gives **both `api` and `worker` a hard startup dependency on the AI**:

```yaml
api:
  environment:
    CIVICCLERK_OLLAMA_BASE_URL: http://ollama:11434
    CIVICCORE_LLM_PROVIDER: ollama
  depends_on:
    postgres: { condition: service_healthy }
    redis:    { condition: service_healthy }
    ollama:   { condition: service_healthy }   # <-- hard boot gate on the LLM
worker:
  depends_on:
    ollama:   { condition: service_healthy }   # <-- same
```

So the **entire clerk service refuses to start** until Ollama is up and healthy.

## Why it's wrong
Clerk's core is plain municipal workflow — agendas, packets, votes, notices, minutes records, archiving — **none of which require an LLM**. Only the *minutes citations / summarization* feature uses AI (`model="ollama/gemma4"`; milestone-7 minutes-citations test; prompt-eval suite). One optional AI feature was wired as a **boot prerequisite for the whole module**.

Consequence on real city machines (which vary widely and often have no usable/healthy GPU or a slow/absent Ollama): **clerk goes completely dark** — a clerk can't manage an agenda or record a vote — instead of simply degrading the minutes-AI feature. That is the wrong failure mode for a system of record.

## Required fix (post-gate, module repo)
- Make `ollama` a **soft/optional** dependency: clerk core must start and run its non-AI workflows with the AI **absent or unavailable**.
- Degrade the minutes-AI feature gracefully (clear "AI unavailable" state, operator can proceed manually) rather than blocking startup.
- **Audit every other module** (records, code, …) for the same hard-AI-boot coupling. Records uses Ollama for the response letter — confirm whether records likewise hard-gates boot vs. degrades.

## Status
Logged for fix once city-core is cleared for release. NOT to be released with this coupling in place.
