---
name: pr-review
description: Reviews local git branch changes against a target branch using read-only git commands. Works with any local git repository — no remote API access required. Use when the user says "review my changes", "code review", "review against main", "review against develop", "check my PR", "review this diff", or any variation. Produces a structured review with per-file findings across correctness, security, tests, and code quality, severity labels, traceability checks against agent memory when present, and a final verdict of APPROVE, REQUEST CHANGES, or COMMENT. No git state is modified; no checkout, stash, reset, or write operations occur.
---

# PR Review Skill

## Overview

Reviews git branch changes against a target branch using read-only git commands and a structured per-dimension checklist.
**No git state is modified** — no checkout, stash, reset, or any write operation.

---

## Step 1 — Collect Diff Context

**Resolve `<SKILL_DIR>`** from the file path used to load this `SKILL.md`. Replace the filename with an empty string to get the directory.

| Skill loaded from                    | `<SKILL_DIR>` to use         |
| ------------------------------------ | ---------------------------- |
| `.github/skills/pr-review/SKILL.md`  | `.github/skills/pr-review/`  |
| `.copilot/skills/pr-review/SKILL.md` | `.copilot/skills/pr-review/` |
| `.claude/skills/pr-review/SKILL.md`  | `.claude/skills/pr-review/`  |

Run from the **repository root**:

```bash
node <SKILL_DIR>/scripts/extract-diff.mjs <target-branch> --json --out=review-diff.json
node <SKILL_DIR>/scripts/risk-map.mjs --input=review-diff.json --json
node <SKILL_DIR>/scripts/collect-review-context.mjs --base=<target-branch> --json
```

Examples:

```bash
node .github/skills/pr-review/scripts/extract-diff.mjs main --json --out=review-diff.json
node .github/skills/pr-review/scripts/risk-map.mjs --input=review-diff.json --json
node .github/skills/pr-review/scripts/collect-review-context.mjs --base=main --json
```

The scripts output:

- `extract-diff.mjs` — commits, merge base, file stats, changed files, and optional full diff
- `risk-map.mjs` — review order by risk, file area, and scrutiny checks
- `collect-review-context.mjs` — staged/untracked files and suggested local checks

If the diff is very large (> 50 KB), run without inline diff and read changed files individually:

```bash
node <SKILL_DIR>/scripts/extract-diff.mjs main --json --no-diff --out=review-diff.json
```

**Script exit codes:**

- `0` — success
- `1` — not a git repository or no common ancestor
- `2` — target branch not found
- `3` — current HEAD equals target branch

---

## Step 2 — Analyse the Changes

Load the review checklist by reading `<SKILL_DIR>/references/review-checklist.md`.

It provides:

- Nine review dimensions (architecture, correctness, security, code quality, error handling, tests, performance, agent memory & traceability, docs)
- OWASP Top 10 security heuristics specific to this codebase
- Severity labels (🔴 BLOCKER, 🟠 MAJOR, 🟡 MINOR, 🔵 SUGGESTION, ✅ GOOD)
- The required output format for `review.md`

For each changed file, apply the relevant dimensions. Skipping a file is acceptable for generated files, lock files, and pure config — but note every skip explicitly.

**When `docs/agent-memory/` is present**: check `index.json` and requirement folders for traceability. Flag any behavior-affecting change with no linked requirement ID (`R-XXXX` or `F-XXXX`).

Run any suggested checks from the script output before writing findings:

```bash
npm run typecheck
npm run test
npm run lint
```

---

## Step 3 — Write the Review to `review.md`

**Do not print the review as a chat message.** Write the full review to `review.md` in the repository root using the output format from `references/review-checklist.md`.

Always include:

- **Verdict** (`APPROVE` / `REQUEST CHANGES` / `COMMENT`) at the top
- Per-file findings with severity labels and evidence (file:line or command output)
- Summary findings table
- Required-action list when the verdict is `REQUEST CHANGES`
- Traceability gaps when agent memory is present
- Explicitly skipped files and reasons

Once written, tell the user: _"Review written to `review.md`."_ — nothing more.

---

## Safety Guarantees

These git operations are **never** used by this skill:

- `git checkout` / `git switch`
- `git stash`
- `git reset`
- Any operation that modifies the working tree or index
