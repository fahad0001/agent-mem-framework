# Skill Suite Upgrade Audit

Date: 2026-05-04
Scope: Workspace skill packs under `.github/skills/**` and synced CLI templates under `cli/ai-sdlc/templates/framework/.github/skills/**`.

## Summary

The skill packs were upgraded from single-helper workflows to operational script suites. The obsolete auxiliary-file contract was removed from the skills README, source skill folders, and synced templates. The skill guard now requires at least three operational scripts per skill, accepts JavaScript, Python, PowerShell, and shell helpers, and verifies every shipped script is declared in `skill.json`.

## Evidence

- Source skill scripts: `.github/skills/**/scripts/*`
- Source skill manifests: `.github/skills/**/skill.json`
- Skill contract: `.github/skills/README.md`
- Template skill scripts: `cli/ai-sdlc/templates/framework/.github/skills/**/scripts/*`
- Guard: `.github/scripts/skill-guard.mjs`

## Verification

- `node .github/scripts/skill-guard.mjs` exited 0 with `Skill Guard passed (6 skills)`.
- `npm run check` exited 0.
- CLI test suite passed: 76 tests.
- `npm run typecheck -w @opair/ai-sdlc` exited 0.

## Unknowns

None for repository validation. Runtime behavior of optional PPTX Python helpers depends on a Python interpreter being available in the target environment.
