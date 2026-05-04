# AHC Compliance Rules

The Anti-Hallucination Charter (AHC) defines operating rules that prevent AI hallucinations in this framework. The full charter is at `docs/agent-memory/00-anti-hallucination-charter.md`. This file summarizes the rules an agent must satisfy when producing or reviewing artifacts.

---

## The Five Pillars (summary)

### Pillar 1 — Evidence-or-Abstain

Every structured output that contains a factual claim (about code, files, behavior, versions, test results, status) MUST attach an `evidence` field. If evidence cannot be produced, set the value to `"UNKNOWN"`, confidence to `"unknown"`, and add an open question. **Never guess or invent a plausible value.**

See `references/evidence-types.md` for allowed evidence kinds.

### Pillar 2 — Schema-Locked Outputs

Machine-readable artifacts must conform to their JSON Schema. Do not invent fields. All schemas are in `docs/agent-memory/*.schema.json`. CI validates them with AJV strict mode.

### Pillar 3 — Tool-Only Facts

Code, version, path, and test facts must come from tool outputs in the current run — not from the model's training memory.

Before stating anything about a file: read it now.
Before claiming a version: run the package manager command.
Before claiming a test passes: run the test and capture the exit code.

### Pillar 4 — Test-as-Truth

A behavior is only claimed to be implemented when a test proves it and that test ran in the current run. If no test exists, the implementation claim must be marked `UNKNOWN`.

### Pillar 5 — Producer-Verifier Separation

A separate agent (Verify) must independently re-check evidence, re-run cited commands, and confirm hashes before a state transition from Evaluated to Done. The producing agent must leave artifacts in a verifier-ready state (all citations complete, no open evidence gaps).

---

## Artifact Compliance Checklist

Before writing or submitting any agent-memory artifact:

- [ ] Every factual claim has an `evidence` array entry
- [ ] Unknown claims are explicitly marked `"UNKNOWN"` with an open question
- [ ] No field value is a plausible guess without evidence
- [ ] JSON artifacts use only fields defined in the schema
- [ ] All cited file paths exist (verified by `collect-evidence.mjs`)
- [ ] All cited command results match current tool output (not remembered from a previous session)
- [ ] The AHC block appears in the artifact header (for markdown artifacts)

---

## AHC Block

Every agent-memory Markdown artifact must include the AHC block from `docs/agent-memory/anti-hallucination-block.md` at the top. The block signals to readers and CI that the artifact is AHC-compliant.

---

## State Transition Guard

Requirements and evaluations cannot advance to "Done" unless:

- All acceptance criteria have `evidence` with `kind = "command"` or `kind = "test"`
- No field in the evaluation report contains `"UNKNOWN"` except explicitly justified gaps
- The Verify agent has signed off
