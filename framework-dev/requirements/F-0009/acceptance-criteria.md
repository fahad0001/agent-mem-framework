# Acceptance Criteria - F-0009

- AC-1: A default scaffold contains `docs/agent-logs/README.md`.
- AC-2: A default scaffold contains `.github/skills/pr-review/SKILL.md` and `.github/skills/memory-transform/SKILL.md`.
- AC-3: A default scaffolded agent contains `Evidence-or-Abstain` and `Ask, do not infer` from the full AHC block.
- AC-4: `cmdAdopt({ cwd })` keeps diagnostics agents and removes non-selected capability agents and prompts.
- AC-5: `ai-sdlc adopt --capabilities <csv>` is exposed by the CLI.
- AC-6: Root checks pass after the change.
