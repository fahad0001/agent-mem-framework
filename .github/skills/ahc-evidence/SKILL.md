---
name: ahc-evidence
description: Anti-Hallucination Charter compliance skill. Collects file evidence with hashes, verifies cited paths exist, marks unknowns correctly, and ensures all agent-memory artifacts are verifier-ready. Use when producing requirement docs, evaluation reports, execution notes, traceability records, or any agent-memory artifact that must follow the AHC. Also use when reviewing or approving artifacts for state transitions. Applies whenever the user mentions evidence, AHC, hallucination check, traceability, evaluation compliance, or verifier readiness.
---

# AHC Evidence Skill

## Overview

Ensures every factual claim in an agent-memory artifact has machine-verifiable evidence, unknown facts are explicitly marked, and artifacts are ready for the Verify agent to re-check independently.

---

## 0) References

**Resolve `<SKILL_DIR>`** from the path used to load this file (replace `SKILL.md` with empty).

| Need                                                                                  | File                                       |
| ------------------------------------------------------------------------------------- | ------------------------------------------ |
| Evidence kind reference (`file`, `command`, `test`, `web`, `human`, `prior-artifact`) | `<SKILL_DIR>/references/evidence-types.md` |
| AHC five pillars, compliance checklist, state transition rules                        | `<SKILL_DIR>/references/charter-rules.md`  |
| Collect file evidence (existence, size, sha256)                                       | `<SKILL_DIR>/scripts/collect-evidence.mjs` |
| Collect command evidence                                                              | `<SKILL_DIR>/scripts/command-evidence.mjs` |
| Verify cited repo paths exist                                                         | `<SKILL_DIR>/scripts/verify-citations.mjs` |
| Write a JSON evidence bundle                                                          | `<SKILL_DIR>/scripts/evidence-bundle.mjs`  |

Always re-read these on demand — do not rely on memory of previous reads.

---

## 1) Collect File Evidence

For every file cited in an artifact, collect evidence before writing:

```bash
node <SKILL_DIR>/scripts/collect-evidence.mjs --files=<path,path,...>
```

Example:

```bash
node .github/skills/ahc-evidence/scripts/collect-evidence.mjs \
  --files=docs/agent-memory/index.json,docs/agent-memory/02-requirements/R-0001/requirement.md
```

Output is JSON — one record per file with: `path`, `exists`, `byteSize`, `sha256`.

Use these values as `evidence` entries of kind `file` in the artifact.

---

## 2) Collect Command Evidence

For every command result cited as evidence:

Run it through the command evidence helper so the output has timestamps, exit code, working directory, output hash, and a bounded preview:

```bash
node <SKILL_DIR>/scripts/command-evidence.mjs --command="npm run validate:schema" --cwd=.
```

Before handing an artifact to Verify, check citations:

```bash
node <SKILL_DIR>/scripts/verify-citations.mjs --artifact=<artifact.md> --json
```

---

## 3) Mark Unknowns Correctly

When evidence cannot be produced for a claim:

1. Set the field value to `"UNKNOWN"` — not a guess, not `"TBD"`, not a plausible estimate
2. Set `"confidence": "unknown"` on the surrounding record
3. Add to the artifact's `openQuestions` list: what is unknown, what action resolves it

See `references/evidence-types.md` for the exact pattern.

---

## 4) Read and Apply Charter Rules

Before writing any evaluation or traceability artifact, read `references/charter-rules.md` and apply the compliance checklist. Verify:

- Every factual claim has an `evidence` array entry with a valid kind
- No invented values remain (search for suspiciously round numbers, estimated dates, or unverified version strings)
- The AHC block appears at the top of every Markdown artifact under `docs/agent-memory/`

---

## 5) Verifier Handoff

When the producing agent has completed an artifact, add a verifier note at the bottom:

```
## Verifier Readiness

- All evidence hashes computed: YES / NO (list gaps)
- All commands re-runnable: YES / NO (list commands)
- Open questions outstanding: <count> (list them)
- State transition to attempt: <current> → <next>
```

The Verify agent will re-read this note, re-run the cited commands, and confirm hashes independently before approving the transition.
