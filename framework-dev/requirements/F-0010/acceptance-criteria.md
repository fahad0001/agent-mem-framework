# Acceptance Criteria - F-0010

- AC1: Each shipped skill under `.github/skills/<id>/` has a concise `SKILL.md` that states the automation-first rule.
- AC2: Each shipped skill has at least one deterministic `.mjs` script under `scripts/` for static or repeatable work.
- AC3: A repository-level validation script fails skills that lack frontmatter, `Use when:` descriptions, a `scripts/` directory, script references, or the automation-first rule.
- AC4: Root `npm run check` executes the skill validator.
- AC5: Framework template sync ships the skill scripts, skill contract, and skill validator into generated projects.
- AC6: Scaffold regression tests assert generated projects include script-backed skills and the validator.
- AC7: No new runtime dependencies are added for the skill architecture.
