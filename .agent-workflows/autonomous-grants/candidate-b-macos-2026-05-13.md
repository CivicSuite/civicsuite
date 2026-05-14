---
Granted-by: Scott Converse
Granted-at: 2026-05-13T21:11:28Z
Expires-at: 2026-05-14T03:11:28Z
Scope: CivicSuite Candidate B — macOS honest-narrowing sweep across the CivicSuite umbrella plus the civicrecords-ai and civicclerk sibling repos. Remove unqualified macOS support claims from README, USER-MANUAL, FAQ, STATUS, and platform-matrix surfaces. Replace with "Windows-only currently; macOS support pending lifecycle certification." Documentation-only changes; no app-code modifications. Maps to Active #1 in PROJECT_CONTROL_PLANE.md line 83 (Installer/macOS certification follow-up, honest-narrowing branch).
Authorized-gates: manifest-gate APPROVE, plan-gate APPROVE, manager-gate APPROVE (PROMOTE only — REPLAN and BLOCK verdicts surface to human regardless of grant)
Forbidden-actions: admin-merge any PR, tag push, release publish, force push, any action_class: high_risk, any action_class: human_only_under_autonomous
Revoked: false
Rationale: First real Candidate B run on the new RTX 5070 box via local Ollama gpt-oss:20b through the Bedrock-hijack chain (claude.exe → shim:4002 → LiteLLM:4000 → Ollama:11434). Zero Anthropic API in the chain per the "Ollama is the runtime" directive (from-old-box/2026-05-13T17-17-12Z_ollama-is-the-runtime-correction.md). Documentation-only scope makes this a low-risk first proof of the v1.2.1 grant-based autonomous mode shipping its design intent. Maps to the 5/26/2026 renewal-deadline evidence requirement: pipeline drives a real CivicSuite target end-to-end without LLM chickening-out at gates.
---

# Grant: Candidate B macOS honest-narrowing sweep

## History

- 2026-05-13T21:11:28Z — Created by Claude (new-box) on the RTX 5070 box at Scott Converse's chat-driven request ("Grant autonomous mode for 6 hours, manager PROMOTE only, for CivicSuite Candidate B macOS honest-narrowing sweep across umbrella + civicrecords-ai + civicclerk."). Parsed and confirmed in chat before write. Active target verified against PROJECT_CONTROL_PLANE.md line 83 before grant write.
