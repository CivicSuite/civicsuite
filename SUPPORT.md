# Getting Support

The `civicsuite` umbrella repo is for **suite-wide** orientation, governance, roadmap, ADRs, and the compatibility matrix. Most support questions belong on a specific module's repo. Please use the table below to route your question to the right place.

## Where to ask

| Audience | What you're asking about | Where to go |
|---|---|---|
| **Municipal evaluators** | "Is CivicSuite right for my city?" "What does it actually do today?" "How is it licensed?" | Start with the [README](README.md) and the [USER-MANUAL](USER-MANUAL.md). Open a Discussion under **Announcements** or **Roadmap** if you have follow-up questions. |
| **Municipal evaluators** | "Can I see a working module?" | The shipping module today is `civicrecords-ai` (FOIA / public records management). Visit <https://github.com/scottconverse/civicrecords-ai>. |
| **Module developers** | "How do I integrate civiccore?" "How do auth/RBAC/audit work?" | File at `CivicSuite/civiccore`. The civiccore repo's `README.md`, `USER-MANUAL.md`, and `docs/` are the canonical reference. |
| **Module developers** | "Bug in records-ai" | File at `scottconverse/civicrecords-ai` (until transferred). |
| **Module developers** | "Cross-module question — how should two modules interact?" | Open a Discussion here under **Architecture**. |
| **Contributors** | "How do I contribute documentation here?" | See [CONTRIBUTING.md](CONTRIBUTING.md). |
| **Contributors** | "Is there a module-suggestion process?" | Open a Discussion under **Roadmap** with module name, problem it solves, and rough scope. |
| **Anyone** | "Security vulnerability" | See [SECURITY.md](SECURITY.md). Route to the affected module's repo, or to this repo if it is suite-wide. |

## Decision tree (TL;DR)

1. **Is this a bug in running code?** → File on the module repo whose code is broken.
2. **Is this a question about how a module works?** → Read that module's docs, then open a Discussion on that module's repo.
3. **Is this a cross-module / suite-wide / governance / roadmap question?** → Open a Discussion here.
4. **Is this a security issue?** → Private GitHub Security Advisory on the affected repo (see [SECURITY.md](SECURITY.md)).

## Response expectations

This is an open-source, volunteer-maintained project. We aim to triage Discussions within a week and issues within two weeks. Security reports get faster acknowledgment (see [SECURITY.md](SECURITY.md)). There is no paid support contract today.
