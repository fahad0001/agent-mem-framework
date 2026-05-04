---
name: ui-ux
description: UI and UX design skill with four modes. Covers creating or refining prototypes and screen flows (proto), reviewing an existing UI against usability and accessibility standards (validation), producing implementation guidance for layout, states, and copy (guide), and running all three together (all). Use when the user mentions UI, UX, screen design, prototype, wireframe, interface review, accessibility audit, usability, user flow, interaction states, responsive layout, design system, or visual design. Always inspects the existing UI surface before designing or validating.
---

# UI/UX Skill

## Modes

| Mode         | When to use                                                                           |
| ------------ | ------------------------------------------------------------------------------------- |
| `proto`      | Create or refine a prototype, screen flow, component behavior, or interaction model   |
| `validation` | Review an existing UI against usability, accessibility, and responsiveness standards  |
| `guide`      | Produce implementation guidance for layout, states, copy, and design-system alignment |
| `all`        | Run `proto`, `validation`, and `guide` together in sequence                           |

If the user does not specify a mode, infer it from context. When ambiguous, ask before proceeding.

---

## 0) References and Scripts

**Resolve `<SKILL_DIR>`** from the path used to load this file (replace `SKILL.md` with empty).

| Need                                                                  | File                                             |
| --------------------------------------------------------------------- | ------------------------------------------------ |
| Heuristic evaluation, state coverage, a11y checks, responsive checks  | `<SKILL_DIR>/references/validation-checklist.md` |
| Loading, empty, error, disabled, focus, and responsive state patterns | `<SKILL_DIR>/references/interaction-states.md`   |
| Audit the existing UI file surface                                    | `<SKILL_DIR>/scripts/audit-ui-surface.mjs`       |
| Static accessibility check                                            | `<SKILL_DIR>/scripts/a11y-static-check.mjs`      |
| State coverage map from stories/tests                                 | `<SKILL_DIR>/scripts/state-coverage-map.mjs`     |
| Responsive/style risk scan                                            | `<SKILL_DIR>/scripts/responsive-token-scan.mjs`  |

---

## 1) Step 0 — Inspect the UI Surface

Before designing or validating anything, run:

```bash
node <SKILL_DIR>/scripts/audit-ui-surface.mjs --json
node <SKILL_DIR>/scripts/a11y-static-check.mjs --json
node <SKILL_DIR>/scripts/state-coverage-map.mjs --json
node <SKILL_DIR>/scripts/responsive-token-scan.mjs --json
```

These scripts count UI files, identify static accessibility risks, map state coverage in stories/tests, and flag responsive styling risks.

Read representative files from the reported surface to understand current conventions before proposing changes.

---

## 2) Mode: `proto`

1. Identify: target user, their job to do, device context (mobile / desktop / both), and success criterion
2. Define the primary flow as a numbered sequence of user actions and system responses
3. Produce the prototype in Markdown: use `##` for screens, `###` for states within a screen
4. Cover all states listed in `references/interaction-states.md` — do not skip loading, empty, and error
5. For each interactive element: state the accessible name and expected keyboard behavior
6. Record open questions for any behavior that depends on unknown product decisions

---

## 3) Mode: `validation`

Load `references/validation-checklist.md` and apply each section:

1. **Heuristic evaluation** — evaluate all 10 heuristics; note failures with severity (BLOCKER / MAJOR / MINOR)
2. **State coverage** — verify all 7 states (loading, empty, success, error, partial, permission-limited, offline) are handled
3. **Accessibility** — check all items in the a11y section; flag any that require code change
4. **Responsive** — check all three breakpoints; flag layout breakages
5. **Copy and microcopy** — apply the copy rules; rewrite any failing examples

Output: a finding list ordered by severity, with a recommended action for each.

---

## 4) Mode: `guide`

Produce an implementation checklist for engineers, referencing:

- Specific files from the audit script output
- State patterns from `references/interaction-states.md`
- Design rules (contrast, spacing, typography) as measurable criteria
- Accessible name requirements for every interactive element

The guide must be actionable: each item says what to implement, not just what to consider.

---

## 5) Output

Write findings and guidance to a file when working on a real codebase. For `validation`, write to `ui-review.md` in the repository root. For `proto`, write the prototype to the path the user specifies or to `docs/prototype-<feature>.md`. For `guide`, write to `docs/ui-guide-<feature>.md`.

Open questions must be listed explicitly — do not fill unknown product decisions with assumptions.
