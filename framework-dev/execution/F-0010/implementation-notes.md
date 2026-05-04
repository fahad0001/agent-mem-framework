# Implementation Notes - F-0010

## Changed

- Added `.github/skills/README.md` defining the automation-first skill package contract.
- Added `.github/scripts/skill-guard.mjs` to validate skill frontmatter, `Use when:` triggers, script directories, script references, and automation-first wording.
- Added root `validate:skills` and included it in `npm run check`.
- Reworked shipped skills so `SKILL.md` is concise routing plus script catalog.
- Added deterministic scripts for PR review context, e2e surface inspection, UI surface audit, deck outline extraction, AHC evidence hashing, and memory graph export.
- Updated `sync-framework.mjs` so generated projects receive `skill-guard.mjs`.
- Synced framework templates and added scaffold assertions for the skill guard and script-backed PR review skill.

## Commands

- `npm run validate:skills`: PASS.
- `npm run sync:framework -w @opair/ai-sdlc`: PASS.
- `npm run typecheck -w @opair/ai-sdlc`: PASS.
- Focused `scaffold.test.ts`: PASS, 13 tests.
- CLI test suite: PASS, 75 tests.
- `npm run cli:build`: PASS.
- `npm run check`: PASS.
- VS Code diagnostics: PASS, no errors found.
