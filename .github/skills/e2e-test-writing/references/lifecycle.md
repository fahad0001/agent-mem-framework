# E2E Test Lifecycle — Detailed Phase Map

This file expands `SKILL.md` §1. Each phase lists: goal, inputs, outputs, commands, and failure modes.

---

## P0 — Detect Framework

**Goal**: know exactly what you are testing with before writing anything.

**Command**: `node <SKILL_DIR>/scripts/inspect-e2e-surface.mjs`

**Output** (JSON, held in working memory):

```json
{
  "framework": "playwright",
  "configs": ["playwright.config.ts"],
  "e2eScripts": [{ "name": "test:e2e", "command": "playwright test" }],
  "tests": ["e2e/login.spec.ts"],
  "appEntrypoints": ["src/index.ts"]
}
```

**If `configs` is empty**: ask the user for the intended framework and offer to scaffold one — do not proceed silently with a default.

**Failure modes**:

- Monorepo with multiple configs → ask the user which workspace applies.
- No framework installed → do not pick one; surface the finding and request a decision.

---

## P1 — Context Gathering

**Goal**: understand the feature, its users, and its data contracts.

Read in this order, stop at first useful signal:

1. Linked requirement (`docs/agent-memory/02-requirements/R-XXXX/acceptance-criteria.md`)
2. `README.md` at repo root and in the test folder
3. Application source under `src/`, `app/`, `pages/`
4. Existing tests in the same area — understand style before diverging
5. Mock handlers / API contracts (`mocks/`, `openapi/`, `*.openapi.yaml`)

Extract a **context card** (held in memory):

- Feature name and short description
- User personas / roles
- Primary user journeys (2–6 bullet points)
- Data contracts (`{ endpoint, method, shape, scenarios }`)
- Non-functional constraints (latency, a11y, error UX)
- Environment notes (dev-server URL, required seeds, auth)

---

## P1a — Elicitation (when specs are missing)

If you cannot answer all of the following from P1, **stop and ask the user** — do not invent behavior:

1. What user journey should this test prove?
2. After the action, what does the user see or read that proves it worked?
3. What data drives it? (happy-path, empty, error)
4. Priority: smoke / core / edge / robustness?
5. Is the feature currently deployed (can probe DOM) or unreleased (draft test only)?

Never proceed past this phase with open questions about intent.

---

## P2 — Gap Analysis

**Goal**: surface which acceptance criteria have no test coverage yet.

Compare the requirement's acceptance criteria against the discovered test files. List:

- `covered` — criteria with existing scenarios
- `missing` — criteria with no scenario
- `orphaned` — scenarios with no linked requirement

Focus authoring on `missing` items. Apply the gap checklist at `references/gap-checklist.md` to add edge cases.

---

## P3 — Scenario Plan

Produce a short plan (markdown, in memory or written to `docs/e2e-plan-R-XXXX.md` if a memory convention exists):

- One scenario sketch per acceptance criterion, in user language
- For each: priority (P0–P3), fixtures needed, selector strategy (role > label > text > testid), expected runtime
- Explicit AC → scenario mapping
- Any accessibility names the app must expose for testable selectors — if absent, flag as a blocker

---

## P4 — Author Test Artifacts

Create or update in this order (adjust paths to the detected framework):

1. **Fixtures** — one JSON per endpoint × variant (success, empty, error)
2. **Mock interceptors** — central class with `setupHappyPath`, `setupEmptyState`, `setupError`
3. **Page objects** — expose verbs (user-facing actions), not DOM paths; no raw locators
4. **Test file** — tagged with requirement ID; one assertion thread per test
5. **Helpers** — auth helpers, time freezers, console trackers — one responsibility each

Every artifact must be justified by the plan.

---

## P5 — Run & Iterate

1. Typecheck → Lint → Run only new tests first (using `--grep` or `--spec` flag)
2. Parse results — never rely solely on stdout color; read the report file
3. For each failure: open trace/screenshot, classify (selector, fixture, timing, app bug), fix, re-run
4. Run the full suite for regression safety
5. Keep iterating until all targeted tests pass

**Hard cap**: 5 consecutive full failures on the same test → pause and request user decision.

---

## P6 — Report

Write a summary to the file the user specified, or print to chat if no file was requested:

- Tests added (file paths, requirement ID, scenario titles)
- Commands run and exit codes
- Coverage gaps closed vs remaining
- Any blockers that stopped DOM probing or full-suite run
