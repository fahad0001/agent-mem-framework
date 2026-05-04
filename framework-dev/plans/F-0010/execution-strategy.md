# Execution Strategy - F-0010

1. Add a shared skill contract at `.github/skills/README.md`.
2. Add `.github/scripts/skill-guard.mjs` for deterministic validation.
3. Replace prose-only skill bodies with concise routing docs that reference scripts.
4. Add one dependency-free `.mjs` script per shipped skill.
5. Include the validator in root `npm run check`.
6. Update framework sync to include the validator script.
7. Sync templates and add scaffold regression assertions.
