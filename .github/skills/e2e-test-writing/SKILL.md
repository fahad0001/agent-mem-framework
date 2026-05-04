---
name: e2e-test-writing
description: End-to-end testing lifecycle skill. Detects the existing E2E framework, performs gap analysis against requirements, authors user-behavior-first tests (page objects, fixtures, mocks, helpers), runs the suite, diagnoses failures, iterates until green, and produces a structured report. Use when the user mentions e2e, end-to-end, playwright, cypress, browser test, user journey test, feature file, acceptance test, flaky test reduction, or a path containing tests/, e2e/, cypress/, or specs/. Never proceeds on framework assumptions — always detects before recommending.
---

# E2E Test Writing Skill

## When This Skill Is Loaded

Load this file and the references listed in §0 before doing anything else. Run the framework-detection script first — do not write a single line of test code before knowing what runner and conventions already exist.

---

## 0) References and Scripts

**Resolve `<SKILL_DIR>`** from the path used to load this file (replace `SKILL.md` with empty).

| Need                                                | File                                           |
| --------------------------------------------------- | ---------------------------------------------- |
| Full lifecycle phase map (P0–P6)                    | `<SKILL_DIR>/references/lifecycle.md`          |
| Selector ladder (role, label, text, testid)         | `<SKILL_DIR>/references/selectors.md`          |
| Gap checklist (dimensions to cover per requirement) | `<SKILL_DIR>/references/gap-checklist.md`      |
| Detect framework, scripts, configs, result paths    | `<SKILL_DIR>/scripts/detect-framework.mjs`     |
| Inspect app and test surface                        | `<SKILL_DIR>/scripts/inspect-e2e-surface.mjs`  |
| Map requirements to feature scenarios               | `<SKILL_DIR>/scripts/coverage-map.mjs`         |
| Probe a running app for accessible names            | `<SKILL_DIR>/scripts/dom-probe.mjs`            |
| Lint tests for E2E anti-patterns                    | `<SKILL_DIR>/scripts/health-check.mjs`         |
| Parse JUnit XML or Playwright JSON results          | `<SKILL_DIR>/scripts/test-report-parser.mjs`   |
| Audit tests for meaningful assertions               | `<SKILL_DIR>/scripts/meaningfulness-audit.mjs` |

Load references on demand; do not quote them from memory — always re-read when about to apply.

---

## 1) The Lifecycle (7 phases)

Execute phases in order. A phase may be skipped only with explicit user permission.

```
P0  Detect framework + project conventions
P1  Gather context (requirement, specs, acceptance criteria)
P1a If specs are missing or ambiguous — elicit from the user, never guess
P2  Gap analysis vs current coverage
P3  Plan scenarios (user journeys, priority, fixtures, selectors)
P4  Probe DOM when the app is runnable
P5  Author test artifacts (fixtures, mocks, page objects, test files, helpers)
P6  Run, parse, fix, and repeat until green
P7  Health check + meaningfulness audit
P8  Generate report
```

Full detail for each phase is in `references/lifecycle.md`.

### P0 — Detect Framework

Run:

```bash
node <SKILL_DIR>/scripts/inspect-e2e-surface.mjs
node <SKILL_DIR>/scripts/detect-framework.mjs --json
```

The script outputs JSON with: detected runner configs, e2e npm scripts, existing test files, and app entrypoints.

If no framework is found: ask the user before proceeding. Do not silently choose one.

### P1 — Context

Read acceptance criteria from `docs/agent-memory/02-requirements/R-XXXX/acceptance-criteria.md` when the requirement ID is known. Otherwise read the test folder README and nearby source files.

### P1a — Elicitation

If specs are missing, ask before authoring. Required questions: the user journey, the observable outcome that proves success, the data inputs, and the priority. Details in `references/lifecycle.md §P1a`.

### P2 — Gap Analysis

Compare the requirement's acceptance criteria against existing test files. Use the dimensions in `references/gap-checklist.md` to expand coverage.

When requirement and feature directories exist, run:

```bash
node <SKILL_DIR>/scripts/coverage-map.mjs --requirements=<requirements-dir> --features=<features-dir> --json
```

### P3 — Scenario Plan

Write a brief plan (one scenario per criterion, priority P0–P3, fixture variant, selector strategy). Apply the ladder from `references/selectors.md` — role first, testid last.

### P4 — Probe DOM

When the app is runnable, probe before choosing selectors:

```bash
node <SKILL_DIR>/scripts/dom-probe.mjs --url=http://localhost:<port> --route=/ --out=dom-probe.json
```

If Playwright is unavailable, use MCP browser tools when available. If neither is available, stop and ask for browser access instead of inventing selectors.

### P5 — Author Artifacts

Create in this order: fixtures → mock interceptors → page objects → test file → helpers. Every artifact must be justified by the plan; do not add helpers that nothing uses.

### P6 — Run & Iterate

Typecheck → lint → run only new tests first → parse results → fix failures → run full suite. Loop until green. **Hard cap**: 5 consecutive full failures on the same test → pause and request user decision.

Parse results instead of scraping terminal output:

```bash
node <SKILL_DIR>/scripts/test-report-parser.mjs --results=<report-file-or-dir> --json
```

### P7 — Health and Meaningfulness

Before finalizing, run:

```bash
node <SKILL_DIR>/scripts/health-check.mjs --tests-dir=<tests-dir> --json
node <SKILL_DIR>/scripts/meaningfulness-audit.mjs --features=<features-dir> --specs=<tests-dir> --json
```

### P8 — Report

Write a summary covering: tests added, commands run, coverage gaps closed, and any blockers.

---

## 2) Quality Bar

- No fixed sleeps — use framework-native waiting primitives
- No dependence on external network services unless explicitly part of the test contract
- Test names describe the user behavior under test, not the implementation
- Every new scenario maps to a requirement or acceptance criterion when agent memory is present
- Selector choice must follow the ladder in `references/selectors.md` — justify any rung-4 or rung-5 choice in a comment
